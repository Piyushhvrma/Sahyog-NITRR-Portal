const express = require("express");
const router = express.Router();

const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const User = require("../models/User");

const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const { adminLimiter } = require("../middleware/rateLimiters");

const {
  createAnnouncementValidator,
  announcementIdValidator,
} = require("../validators/announcementValidators");

router.post(
  "/",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  createAnnouncementValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { title, description, category } = req.body;

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
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  })
);

router.get(
  "/latest",
  asyncHandler(async (req, res) => {
    const latest = await Announcement.find().sort({ createdAt: -1 }).limit(3);
    res.json(latest);
  })
);

router.delete(
  "/:id",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  announcementIdValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    await Notification.deleteMany({
      announcementId: announcement._id,
    });

    res.json({
      success: true,
      message: "Announcement deleted successfully.",
    });
  })
);

module.exports = router;