const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    default: "General",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);