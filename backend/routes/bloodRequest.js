const express = require("express");
const nodemailer = require("nodemailer");
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
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      !process.env.BLOOD_REQUEST_RECEIVER
    ) {
      return res.status(500).json({
        success: false,
        message: "Email configuration missing in backend",
      });
    }

    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

    const attachments = [];

    if (req.file) {
      attachments.push({
        filename: req.file.originalname,
        content: req.file.buffer,
        contentType: req.file.mimetype,
      });
    }

    await transporter.sendMail({
      from: `"SAHYOG Blood Request" <${process.env.EMAIL_USER}>`,
      to: process.env.BLOOD_REQUEST_RECEIVER,
      subject: `🩸 New Blood Request - ${bloodGroup}`,
      html: `
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
      attachments,
    });

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
