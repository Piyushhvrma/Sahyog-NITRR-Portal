const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/", upload.single("document"), async (req, res) => {
  try {
    const { name, email, phone, bloodGroup, requestDetails } = req.body;

    if (!name || !phone || !bloodGroup || !requestDetails) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (
      !process.env.BREVO_API_KEY ||
      !process.env.EMAIL_FROM ||
      !process.env.BLOOD_REQUEST_RECEIVER
    ) {
      return res.status(500).json({
        success: false,
        message: "Email API configuration missing in backend",
      });
    }

    const receivers = process.env.BLOOD_REQUEST_RECEIVER.split(",").map((mail) => ({
      email: mail.trim(),
    }));

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
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #d90429;">🩸 New Blood Request Received</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email || "Not provided"}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Blood Group:</b> ${bloodGroup}</p>
          <h3>Request Details</h3>
          <p>${requestDetails}</p>
          <hr />
          <p style="color: gray;">
            Submitted through SAHYOG - The Student Wellbeing Club Portal.
          </p>
        </div>
      `,
      attachment: attachments,
    };

    if (email) {
      emailPayload.replyTo = { email };
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return res.status(200).json({
      success: true,
      message: "Blood request submitted successfully",
    });
  } catch (error) {
    console.error("Blood request email error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit blood request",
    });
  }
});

module.exports = router;