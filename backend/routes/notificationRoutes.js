const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");

const jwtAuth = require("../middleware/jwtAuth");
const asyncHandler = require("../middleware/asyncHandler");

const { sendSuccess } = require("../utils/response");

// ========================================
// GET CURRENT USER NOTIFICATIONS
// ========================================

router.get(
  "/",
  jwtAuth,
  asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
      userId: req.user.id,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    return sendSuccess(
      res,
      200,
      "Notifications fetched successfully.",
      {
        notifications,
      }
    );
  })
);

// ========================================
// GET CURRENT USER UNREAD COUNT
// ========================================

router.get(
  "/count",
  jwtAuth,
  asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      count,
    });
  })
);

// ========================================
// MARK CURRENT USER NOTIFICATION AS READ
// ========================================

router.put(
  "/:id/read",
  jwtAuth,
  asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        $set: {
          isRead: true,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return sendSuccess(
      res,
      200,
      "Notification marked as read.",
      {
        notification,
      }
    );
  })
);

// ========================================
// DELETE CURRENT USER NOTIFICATION
// ========================================

router.delete(
  "/:id",
  jwtAuth,
  asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return sendSuccess(
      res,
      200,
      "Notification deleted successfully."
    );
  })
);

module.exports = router;