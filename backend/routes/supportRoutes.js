const express = require("express");
const router = express.Router();
const SupportRequest = require("../models/SupportRequest");
const { Parser } = require("json2csv");

const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");
const { formLimiter, adminLimiter } = require("../middleware/rateLimiters");

const {
  supportRequestValidator,
} = require("../validators/supportValidators");

router.post(
  "/",
  formLimiter,
  supportRequestValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { name, contact, category, message } = req.body;

    const supportRequest = await SupportRequest.create({
      name: name || "Anonymous Student",
      contact: contact || "Not Provided",
      category,
      message,
    });

    const emailPayload = {
      sender: {
        name: "SAHYOG Support",
        email: process.env.EMAIL_FROM,
      },
      to: [{ email: process.env.SUPPORT_RECEIVER }],
      subject: `❤️ New SAHYOG Help Request [${category}]`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Student Support Request</h2>
          <p><b>Name:</b> ${name || "Anonymous Student"}</p>
          <p><b>Contact:</b> ${contact || "Not Provided"}</p>
          <p><b>Category:</b> ${category}</p>
          <p><b>Message:</b></p>
          <pre>${message}</pre>
        </div>
      `,
    };

    const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!emailRes.ok) {
      supportRequest.emailStatus = "failed";
      await supportRequest.save();

      return res.status(502).json({
        success: false,
        message:
          "Request saved, but email alert failed. Please contact admin.",
      });
    }

    supportRequest.emailStatus = "sent";
    await supportRequest.save();

    res.status(200).json({
      success: true,
      message: "Support request submitted successfully.",
    });
  })
);

router.get(
  "/download-sheet",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  asyncHandler(async (req, res) => {
    const requests = await SupportRequest.find()
      .sort({ createdAt: -1 })
      .lean();

    if (!requests.length) {
      return res.status(404).send("No submissions found.");
    }

    const fields = [
      "_id",
      "name",
      "contact",
      "category",
      "message",
      "emailStatus",
      "createdAt",
    ];

    const parser = new Parser({ fields });
    const csvData = parser.parse(requests);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Sahyog_Support_Submissions.csv"
    );

    res.status(200).send(csvData);
  })
);

module.exports = router;