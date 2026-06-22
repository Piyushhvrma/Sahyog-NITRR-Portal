const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");

const jwtAuth = require("../middleware/jwtAuth");


// ===============================
// GET USER NOTIFICATIONS
// ===============================

router.get("/", jwtAuth, async (req, res) => {
  try {

    const notifications = await Notification.find({
      userId: req.user.id,
    })
      .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});


// ===============================
// UNREAD COUNT
// ===============================

router.get("/count", jwtAuth, async (req, res) => {
  try {

    console.log("JWT USER ID:", req.user.id);

    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    console.log("COUNT FOUND:", count);

    res.json({ count });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
});


// ===============================
// MARK AS READ
// ===============================

router.put("/:id/read", jwtAuth, async (req, res) => {
  try {

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.json({
      success: true,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;