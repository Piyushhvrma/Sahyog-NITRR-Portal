const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");
const jwtAuth = require("../middleware/jwtAuth");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const { authLimiter } = require("../middleware/rateLimiters");
const { deleteCache } = require("../utils/cache");
const { sendSuccess } = require("../utils/response");

const {
  createToken,
  sendAuthCookie,
  clearAuthCookie,
  sanitizeUser,
} = require("../services/auth.service");

const { sendOtpEmail } = require("../services/mail.service");

const {
  registerValidator,
  loginValidator,
  googleLoginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/authValidators");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    await deleteCache("users:count");

    sendAuthCookie(res, createToken(user));

    return sendSuccess(res, 201, "User registered successfully.", {
      user: sanitizeUser(user),
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

    return sendSuccess(res, 200, "Login successful.", {
      user: sanitizeUser(user),
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

      await deleteCache("users:count");
    } else {
      user.googleId = user.googleId || googleId;
      user.authProvider = user.authProvider || "google";
      await user.save();
    }

    sendAuthCookie(res, createToken(user));

    return sendSuccess(res, 200, "Google login successful.", {
      user: sanitizeUser(user),
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

    return sendSuccess(res, 200, "OTP sent to your email.");
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

    return sendSuccess(res, 200, "Password reset successful.");
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

    return sendSuccess(res, 200, "Current user fetched successfully.", {
      user: sanitizeUser(user),
    });
  })
);

router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  return sendSuccess(res, 200, "Logged out successfully.");
});

module.exports = router;