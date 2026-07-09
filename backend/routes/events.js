const router = require("express").Router();

const cloudinary = require("../config/cloudinary");
const Event = require("../models/Event");

const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const { adminLimiter } = require("../middleware/rateLimiters");
const { uploadEventImage } = require("../middleware/upload");

const {
  uploadEventValidator,
  eventIdValidator,
} = require("../validators/eventValidators");

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 20);
    const skip = (page - 1) * limit;

    const [events, totalEvents] = await Promise.all([
      Event.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Event.countDocuments(),
    ]);

    res.json({
      events,
      pagination: {
        page,
        limit,
        totalEvents,
        totalPages: Math.ceil(totalEvents / limit),
        hasNextPage: page * limit < totalEvents,
        hasPrevPage: page > 1,
      },
    });
  })
);

router.post(
  "/upload",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  uploadEventImage.single("eventImage"),
  uploadEventValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Image file is required.",
      });
    }

    const event = await Event.create({
      title: req.body.title,
      description: req.body.description,
      imageUrl: req.file.path,
      cloudinaryPublicId: req.file.filename || "",
    });

    res.status(201).json({
      success: true,
      message: "Event uploaded successfully.",
      event,
    });
  })
);

router.put(
  "/like/:id",
  jwtAuth,
  eventIdValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    const userId = req.user.id;

    const alreadyLiked = event.likes.some(
      (like) => like.toString() === userId
    );

    if (alreadyLiked) {
      event.likes = event.likes.filter((like) => like.toString() !== userId);
    } else {
      event.likes.push(userId);
    }

    await event.save();

    res.json(event.likes);
  })
);

router.delete(
  "/:id",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  eventIdValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    if (event.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(event.cloudinaryPublicId);
      } catch (error) {
        console.error("Cloudinary event image delete failed:", error.message);
      }
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Event and image deleted successfully.",
    });
  })
);

module.exports = router;