const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const https = require("https");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");
const jwtAuth = require("../middleware/jwtAuth");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const { authLimiter } = require("../middleware/rateLimiters");

const {
  registerValidator,
  loginValidator,
  googleLoginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/authValidators");

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

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role || "student",
  profilePictureUrl: user.profilePictureUrl || "",
});

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
        </div>
      `,
    });

    const req = https.request(
      {
        hostname: "api.brevo.com",
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (response) => {
        let body = "";
        response.on("data", (chunk) => (body += chunk));
        response.on("end", () => {
          response.statusCode >= 200 && response.statusCode < 300
            ? resolve(body)
            : reject(new Error(body));
        });
      }
    );

    req.on("error", reject);
    req.write(data);
    req.end();
  });
};

router.post(
  "/register",
  authLimiter,
  registerValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      authProvider: "local",
      role: "student",
    });

    sendAuthCookie(res, createToken(user));

    res.status(201).json({
      user: sanitizeUser(user),
      message: "User registered successfully.",
    });
  })
);

router.post(
  "/login",
  authLimiter,
  loginValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    sendAuthCookie(res, createToken(user));

    res.json({
      user: sanitizeUser(user),
      message: "Login successful.",
    });
  })
);

router.post(
  "/google-login",
  authLimiter,
  googleLoginValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { credential } = req.body;

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

    sendAuthCookie(res, createToken(user));

    res.json({
      user: sanitizeUser(user),
      message: "Google login successful.",
    });
  })
);

router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const email = req.body.email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtpHash = await bcrypt.hash(otp, 10);
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();
    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to your email." });
  })
);

router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { otp, newPassword } = req.body;
    const email = req.body.email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user || !user.resetOtpHash) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (!user.resetOtpExpiry || user.resetOtpExpiry < Date.now()) {
      user.resetOtpHash = "";
      user.resetOtpExpiry = null;
      await user.save();

      return res.status(400).json({ message: "OTP expired." });
    }

    const isOtpValid = await bcrypt.compare(otp, user.resetOtpHash);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtpHash = "";
    user.resetOtpExpiry = null;
    user.authProvider = user.authProvider || "local";

    await user.save();

    res.json({ message: "Password reset successful." });
  })
);

router.get(
  "/me",
  jwtAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select(
      "-password -resetOtpHash"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ user: sanitizeUser(user) });
  })
);

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.json({ message: "Logged out successfully." });
});

module.exports = router;