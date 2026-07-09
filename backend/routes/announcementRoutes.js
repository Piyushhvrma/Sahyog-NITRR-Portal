const express = require("express");
const router = express.Router();

const Announcement = require("../models/Announcement");

const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const { adminLimiter } = require("../middleware/rateLimiters");
const { sendSuccess } = require("../utils/response");
const { emitToAllUsers } = require("../socket/socket");
const {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
} = require("../utils/cache");

const {
  createAnnouncementNotifications,
  deleteNotificationsByAnnouncement,
} = require("../services/notification.service");

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

    await createAnnouncementNotifications({
  _id: announcement._id,
  title: announcement.title,
  message: announcement.description,
});

    await deleteCache("announcements:all");
    await deleteCache("announcements:latest");
    await deleteCacheByPattern("admin:stats*");

    emitToAllUsers("new-announcement", {
      announcement,
      notification: {
        title,
        message: description,
        type: "ADMIN",
      },
    });

    return sendSuccess(res, 201, "Announcement published successfully.", {
      announcement,
    });
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const cacheKey = "announcements:all";
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const announcements = await Announcement.find().sort({ createdAt: -1 });

    await setCache(cacheKey, announcements, 180);

    return res.json(announcements);
  })
);

router.get(
  "/latest",
  asyncHandler(async (req, res) => {
    const cacheKey = "announcements:latest";
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const latest = await Announcement.find().sort({ createdAt: -1 }).limit(3);

    await setCache(cacheKey, latest, 180);

    return res.json(latest);
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
    await deleteNotificationsByAnnouncement(announcement._id);

    await deleteCache("announcements:all");
    await deleteCache("announcements:latest");
    await deleteCacheByPattern("admin:stats*");

    return sendSuccess(res, 200, "Announcement deleted successfully.");
  })
);

module.exports = router;