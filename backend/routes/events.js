const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const Event = require("../models/Event");
const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const { adminLimiter } = require("../middleware/rateLimiters");

const {
  uploadEventValidator,
  eventIdValidator,
} = require("../validators/eventValidators");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sahyog-events",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, JPEG and WEBP images are allowed."));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  })
);

router.post(
  "/upload",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  upload.single("eventImage"),
  uploadEventValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required." });
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
      return res.status(404).json({ message: "Event not found." });
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
      return res.status(404).json({ message: "Event not found." });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Event deleted successfully.",
    });
  })
);

module.exports = router;