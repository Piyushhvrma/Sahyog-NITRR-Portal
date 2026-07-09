const express = require("express");
const router = express.Router();
const SupportRequest = require("../models/SupportRequest");
const { Parser } = require("json2csv");

const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");
const { formLimiter, adminLimiter } = require("../middleware/rateLimiters");
const { sendSuccess } = require("../utils/response");
const { sendSupportRequestEmail } = require("../services/mail.service");

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

    try {
      await sendSupportRequestEmail({
        name,
        contact,
        category,
        message,
      });

      supportRequest.emailStatus = "sent";
      await supportRequest.save();

      return sendSuccess(res, 200, "Support request submitted successfully.");
    } catch (error) {
      supportRequest.emailStatus = "failed";
      await supportRequest.save();

      return res.status(502).json({
        success: false,
        message: "Request saved, but email alert failed. Please contact admin.",
      });
    }
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

    return res.status(200).send(csvData);
  })
);

module.exports = router;