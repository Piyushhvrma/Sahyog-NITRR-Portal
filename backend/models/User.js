const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, default: "" },

    role: {
      type: String,
      enum: ["student", "admin", "superadmin"],
      default: "student",
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: { type: String, default: "" },

    profilePictureUrl: { type: String, default: "" },

    profilePicturePublicId: { type: String, default: "" },

    resetOtpHash: { type: String, default: "" },

    resetOtpExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.User || mongoose.model("User", UserSchema);