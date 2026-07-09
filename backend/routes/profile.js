const express = require("express");
const router = express.Router();

const cloudinary = require("../config/cloudinary");
const { uploadProfileImage } = require("../middleware/upload");

const jwtAuth = require("../middleware/jwtAuth");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");

router.post(
  "/upload-picture",
  jwtAuth,
  uploadProfileImage.single("profilePic"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a valid image file.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.profilePicturePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePicturePublicId);
      } catch (error) {
        console.log("Old profile image delete failed:", error.message);
      }
    }

    user.profilePictureUrl = req.file.path;
    user.profilePicturePublicId = req.file.filename;

    await user.save();

    res.json({
      success: true,
      message: "Profile picture updated successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePictureUrl: user.profilePictureUrl,
      },
    });
  })
);

module.exports = router;