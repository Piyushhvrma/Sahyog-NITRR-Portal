const express = require("express");
const router = express.Router();

const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const User = require("../models/User");

const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");

router.post(
  "/",
  jwtAuth,
  requireRole("admin", "superadmin"),
  async (req, res) => {
    try {
      const { title, description, category } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          message: "Title and description are required.",
        });
      }

      const announcement = await Announcement.create({
        title,
        description,
        category,
      });

      const users = await User.find().select("_id");

      const notifications = users.map((user) => ({
        userId: user._id,
        announcementId: announcement._id,
        title,
        message: description,
        type: "ADMIN",
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      res.status(201).json({
        success: true,
        message: "Announcement published successfully.",
        announcement,
      });
    } catch (error) {
      console.error("Create announcement error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create announcement",
      });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});

router.get("/latest", async (req, res) => {
  try {
    const latest = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(3);

    res.json(latest);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});

router.delete(
  "/:id",
  jwtAuth,
  requireRole("admin", "superadmin"),
  async (req, res) => {
    try {
      const announcement = await Announcement.findById(req.params.id);

      if (!announcement) {
        return res.status(404).json({
          message: "Announcement not found",
        });
      }

      await Announcement.findByIdAndDelete(req.params.id);

      await Notification.deleteMany({
        announcementId: announcement._id,
      });

      res.json({
        success: true,
        message: "Announcement deleted",
      });
    } catch (error) {
      console.error("Delete announcement error:", error);
      res.status(500).json({
        message: "Failed to delete announcement",
      });
    }
  }
);

module.exports = router;