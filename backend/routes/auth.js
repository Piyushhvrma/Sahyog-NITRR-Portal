const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const https = require("https");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");
const jwtAuth = require("../middleware/jwtAuth");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 3 * 60 * 60 * 1000,
};

const createToken = (user) => {
  return jwt.sign(
    {
      user: {
        id: user.id,
        email: user.email,
        role: user.role || "student",
      },
    },
    process.env.JWT_SECRET,
    { expiresIn: "3h" }
  );
};

const sendAuthCookie = (res, token) => {
  res.cookie("token", token, cookieOptions);
};

const sanitizeUser = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "student",
    profilePictureUrl: user.profilePictureUrl || "",
  };
};

const sendOtpEmail = async (email, otp) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      sender: {
        name: "SAHYOG NIT Raipur",
        email: process.env.EMAIL_FROM,
      },
      to: [{ email }],
      subject: "SAHYOG Password Reset OTP",
      htmlContent: `
        <div style="font-family: Arial, sans-serif;">
          <h2>SAHYOG Password Reset</h2>
          <p>Your OTP for password reset is:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    const options = {
      hostname: "api.brevo.com",
      path: "/v3/smtp/email",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (response) => {
      let body = "";

      response.on("data", (chunk) => {
        body += chunk;
      });

      response.on("end", () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(body));
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email, and password.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      return res.status(400).json({
        message: "User with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: "local",
      role: "student",
    });

    const token = createToken(user);
    sendAuthCookie(res, token);

    return res.status(201).json({
      user: sanitizeUser(user),
      message: "User registered successfully!",
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    return res.status(500).json({
      message: "Server error during registration.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.password) {
      return res.status(400).json({
        message: "Invalid credentials.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials.",
      });
    }

    const token = createToken(user);
    sendAuthCookie(res, token);

    return res.json({
      user: sanitizeUser(user),
      message: "Login successful.",
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Server error during login.",
    });
  }
});

router.post("/google-login", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required.",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email.toLowerCase().trim();
    const name = payload.name || "SAHYOG User";

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: "",
        googleId,
        authProvider: "google",
        role: "student",
      });
    } else {
      user.googleId = user.googleId || googleId;
      user.authProvider = user.authProvider || "google";
      await user.save();
    }

    const token = createToken(user);
    sendAuthCookie(res, token);

    return res.json({
      user: sanitizeUser(user),
      message: "Google login successful.",
    });
  } catch (error) {
    console.error("Google login error:", error.message);
    return res.status(500).json({
      message: "Google login failed.",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    const otpHash = await bcrypt.hash(otp, 10);

    user.resetOtpHash = otpHash;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendOtpEmail(normalizedEmail, otp);

    return res.json({
      message: "OTP sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({
      message: "Failed to send OTP.",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.resetOtpHash) {
      return res.status(400).json({
        message: "Invalid OTP.",
      });
    }

    if (!user.resetOtpExpiry || user.resetOtpExpiry < Date.now()) {
      user.resetOtpHash = "";
      user.resetOtpExpiry = null;
      await user.save();

      return res.status(400).json({
        message: "OTP expired.",
      });
    }

    const isOtpValid = await bcrypt.compare(otp, user.resetOtpHash);

    if (!isOtpValid) {
      return res.status(400).json({
        message: "Invalid OTP.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtpHash = "";
    user.resetOtpExpiry = null;
    user.authProvider = user.authProvider || "local";

    await user.save();

    return res.json({
      message: "Password reset successful.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);
    return res.status(500).json({
      message: "Failed to reset password.",
    });
  }
});

router.get("/me", jwtAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -resetOtpHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch user session.",
    });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  return res.json({
    message: "Logged out successfully.",
  });
});

module.exports = router;