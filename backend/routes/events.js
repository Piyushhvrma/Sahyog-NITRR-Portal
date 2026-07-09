const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const Event = require("../models/Event");
const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");

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

const upload = multer({ storage });

router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error("Fetch events error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post(
  "/upload",
  jwtAuth,
  requireRole("admin", "superadmin"),
  upload.single("eventImage"),
  async (req, res) => {
    try {
      const { title, description } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          message: "Title and description are required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Image file is required.",
        });
      }

      const newEvent = new Event({
        title,
        description,
        imageUrl: req.file.path,
        cloudinaryPublicId: req.file.filename || "",
      });

      await newEvent.save();

      res.status(201).json({
        message: "Event uploaded successfully!",
        event: newEvent,
      });
    } catch (error) {
      console.error("Event upload error:", error);
      res.status(500).json({ message: "Server Error during upload" });
    }
  }
);

router.put("/like/:id", jwtAuth, async (req, res) => {
  try {
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
      event.likes = event.likes.filter(
        (like) => like.toString() !== userId
      );
    } else {
      event.likes.push(userId);
    }

    await event.save();

    res.json(event.likes);
  } catch (error) {
    console.error("Like event error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete(
  "/:id",
  jwtAuth,
  requireRole("admin", "superadmin"),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({
          message: "Event not found",
        });
      }

      // actual Cloudinary cleanup will be completed in Cloudinary cleanup module
      await Event.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Event deleted successfully",
      });
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

module.exports = router;