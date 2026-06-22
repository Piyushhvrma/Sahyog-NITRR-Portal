const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require("https");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const User = require('../models/User');

if (!process.env.JWT_SECRET) {
  console.error("\n*** FATAL ERROR: JWT_SECRET environment variable is not defined! ***\n");
}

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

    const req = https.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
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

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password.' });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    user = new User({
      name,
      email,
      password
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error.' });
    }

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      message: 'User registered successfully!'
    });

  } catch (error) {
    console.error('Registration Server Error:', error.message);
    res.status(500).json({ message: 'Server error during registration. Please try again later.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password.' });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error.' });
    }

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login Server Error:', error.message);
    res.status(500).json({ message: 'Server error during login. Please try again later.' });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please enter your email." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "No account found with this email." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendOtpEmail(email, otp);

    res.json({
      message: "OTP sent to your email."
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      message: "Failed to send OTP. Please try again."
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      message: "Email, OTP and new password are required."
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid request." });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (!user.resetOtpExpiry || user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired. Please request again." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetOtp = "";
    user.resetOtpExpiry = null;

    await user.save();

    res.json({
      message: "Password reset successful. Please login."
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      message: "Failed to reset password. Please try again."
    });
  }
});

router.post("/google-login", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential missing",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;

    let user = await User.findOne({ email });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("google-auth-user", salt);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
      });
    }

    const jwtPayload = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Google Login Error:", error);

    res.status(500).json({
      message: "Google login failed",
    });
  }
});

module.exports = router;