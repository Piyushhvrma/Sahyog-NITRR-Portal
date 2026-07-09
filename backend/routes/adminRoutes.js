const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Link = require("../models/Link");
const Event = require("../models/Event");
const Feedback = require("../models/Feedback");
const SupportRequest = require("../models/SupportRequest");
const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");

const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const { adminLimiter } = require("../middleware/rateLimiters");

const {
  updateRoleValidator,
} = require("../validators/adminValidators");

router.use(jwtAuth);
router.use(adminLimiter);

router.get(
  "/stats",
  requireRole("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    const [
      userCount,
      linkCount,
      eventCount,
      feedbackCount,
      supportCount,
      announcementCount,
      notificationCount,
    ] = await Promise.all([
      User.countDocuments(),
      Link.countDocuments(),
      Event.countDocuments(),
      Feedback.countDocuments(),
      SupportRequest.countDocuments(),
      Announcement.countDocuments(),
      Notification.countDocuments(),
    ]);

    res.json({
      userCount,
      linkCount,
      eventCount,
      feedbackCount,
      supportCount,
      announcementCount,
      notificationCount,
    });
  })
);

router.get(
  "/users",
  requireRole("superadmin"),
  asyncHandler(async (req, res) => {
    const users = await User.find()
      .select("name email role authProvider createdAt")
      .sort({ createdAt: -1 });

    res.json({ users });
  })
);

router.patch(
  "/users/:id/role",
  requireRole("superadmin"),
  updateRoleValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (req.params.id === req.user.id && role !== "superadmin") {
      return res.status(400).json({
        message: "You cannot remove your own superadmin role.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.role = role;
    await user.save();

    res.json({
      message: `User role updated to ${role}.`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  })
);

module.exports = router;