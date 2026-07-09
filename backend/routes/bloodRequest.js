const express = require("express");
const router = express.Router();

const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const { formLimiter } = require("../middleware/rateLimiters");
const { uploadBloodDocument } = require("../middleware/upload");
const { sendSuccess } = require("../utils/response");
const { sendBloodRequestEmail } = require("../services/mail.service");

const {
  bloodRequestValidator,
} = require("../validators/bloodValidators");

router.post(
  "/",
  formLimiter,
  uploadBloodDocument.single("document"),
  bloodRequestValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { name, email, phone, bloodGroup, requestDetails } = req.body;

    const attachments = [];

    if (req.file) {
      attachments.push({
        name: req.file.originalname,
        content: req.file.buffer.toString("base64"),
      });
    }

    await sendBloodRequestEmail({
      name,
      email,
      phone,
      bloodGroup,
      requestDetails,
      attachments,
    });

    return sendSuccess(res, 200, "Blood request submitted successfully.");
  })
);

module.exports = router;