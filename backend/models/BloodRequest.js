const mongoose = require("mongoose");

const BloodRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },

    requestDetails: {
      type: String,
      required: true,
      trim: true,
    },

    documentName: {
      type: String,
      default: "",
    },

    hasDocument: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["new", "verified", "in-progress", "fulfilled", "closed", "rejected"],
      default: "new",
    },

    urgency: {
      type: String,
      enum: ["normal", "urgent", "critical"],
      default: "urgent",
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
    },

    emailStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.BloodRequest ||
  mongoose.model("BloodRequest", BloodRequestSchema);