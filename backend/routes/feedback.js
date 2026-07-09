const express = require("express");
const router = express.Router();

const Feedback = require("../models/Feedback");

const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const { formLimiter } = require("../middleware/rateLimiters");

const {
  feedbackValidator,
} = require("../validators/feedbackValidators");

router.post(
  "/",
  formLimiter,
  feedbackValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const feedback = await Feedback.create(req.body);

    res.status(201).json({
      success: true,
      message: "Feedback received, thank you.",
      feedback,
    });
  })
);

module.exports = router;