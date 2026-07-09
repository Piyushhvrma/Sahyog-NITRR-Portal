const mongoose = require("mongoose");

const SupportRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Anonymous Student",
  },
  contact: {
    type: String,
    default: "Not Provided",
  },
  category: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  emailStatus: {
  type: String,
  enum: ["pending", "sent", "failed"],
  default: "pending",
}
});

module.exports = mongoose.model("SupportRequest", SupportRequestSchema);