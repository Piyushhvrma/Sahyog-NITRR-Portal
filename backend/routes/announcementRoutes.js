const express = require("express");
const router = express.Router();

const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const User = require("../models/User");

const { adminAuth } = require("../middleware/auth");


// ===============================
// CREATE ANNOUNCEMENT
// ===============================

router.post("/", adminAuth, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const announcement = await Announcement.create({
      title,
      description,
      category,
    });

    // Create notification for all users

    const users = await User.find();

    const notifications = users.map((user) => ({
      userId: user._id,
      title,
      message: description,
      type: "ADMIN",
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create announcement",
    });
  }
});


// ===============================
// GET ALL ANNOUNCEMENTS
// ===============================

router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});
// ===============================
// DELETE ANNOUNCEMENT
// ===============================

router.delete("/:id", adminAuth, async (req, res) => {
  try {

    const announcement = await Announcement.findById(
      req.params.id
    );

    if (!announcement) {
      return res.status(404).json({
        message: "Announcement not found",
      });
    }

    await Announcement.findByIdAndDelete(
      req.params.id
    );

    await Notification.deleteMany({
      title: announcement.title,
    });

    res.json({
      success: true,
      message: "Announcement deleted",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// ===============================
// LATEST 3
// ===============================

router.get("/latest", async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(3);

    res.json(announcements);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;