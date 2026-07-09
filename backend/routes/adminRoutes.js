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

// all routes here require login
router.use(jwtAuth);

// admin + superadmin dashboard stats
router.get("/stats", requireRole("admin", "superadmin"), async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Failed to fetch admin stats." });
  }
});

// only superadmin can see/manage user roles
router.get("/users", requireRole("superadmin"), async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role authProvider createdAt")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

// promote/demote users
router.patch("/users/:id/role", requireRole("superadmin"), async (req, res) => {
  try {
    const { role } = req.body;

    const allowedRoles = ["student", "admin", "superadmin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    // prevent superadmin from demoting himself accidentally
    if (req.params.id === req.user.id && role !== "superadmin") {
      return res.status(400).json({
        message: "You cannot remove your own superadmin role.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
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
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ message: "Failed to update user role." });
  }
});

module.exports = router;