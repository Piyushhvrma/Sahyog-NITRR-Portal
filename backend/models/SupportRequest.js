const mongoose = require("mongoose");

const SupportRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Anonymous Student",
      trim: true,
    },

    contact: {
      type: String,
      default: "Not Provided",
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["new", "in-progress", "resolved", "closed"],
      default: "new",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
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
  mongoose.models.SupportRequest ||
  mongoose.model("SupportRequest", SupportRequestSchema);