const express = require("express");
const router = express.Router();

const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const { formLimiter } = require("../middleware/rateLimiters");
const { uploadBloodDocument } = require("../middleware/upload");

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

    if (
      !process.env.BREVO_API_KEY ||
      !process.env.EMAIL_FROM ||
      !process.env.BLOOD_REQUEST_RECEIVER
    ) {
      return res.status(500).json({
        success: false,
        message: "Email configuration missing.",
      });
    }

    const receivers = process.env.BLOOD_REQUEST_RECEIVER.split(",").map(
      (mail) => ({
        email: mail.trim(),
      })
    );

    const attachments = [];

    if (req.file) {
      attachments.push({
        name: req.file.originalname,
        content: req.file.buffer.toString("base64"),
      });
    }

    const emailPayload = {
      sender: {
        name: "SAHYOG Blood Request",
        email: process.env.EMAIL_FROM,
      },
      to: receivers,
      subject: `🩸 New Blood Request - ${bloodGroup}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Blood Request</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email || "Not provided"}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Blood Group:</b> ${bloodGroup}</p>
          <p><b>Details:</b></p>
          <pre>${requestDetails}</pre>
        </div>
      `,
      ...(attachments.length > 0 && { attachment: attachments }),
      ...(email && { replyTo: { email } }),
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: "Blood request email failed. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blood request submitted successfully.",
    });
  })
);

module.exports = router;