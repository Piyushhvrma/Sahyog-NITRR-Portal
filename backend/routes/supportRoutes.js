const express = require("express");
const router = express.Router();
const SupportRequest = require("../models/SupportRequest");
const { Parser } = require("json2csv");

const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");
const { formLimiter, adminLimiter } = require("../middleware/rateLimiters");
const { sendSuccess, sendPaginated } = require("../utils/response");
const { sendSupportRequestEmail } = require("../services/mail.service");
const { deleteCacheByPattern } = require("../utils/cache");

const {
  supportRequestValidator,
} = require("../validators/supportValidators");

const {
  paginationValidator,
  mongoIdValidator,
  supportStatusValidator,
} = require("../validators/adminManagementValidators");

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

    await deleteCacheByPattern("admin:stats*");

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
    } catch {
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
  "/admin",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  paginationValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const { search, status } = req.query;

    const filter = {};

    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { contact: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const [requests, total] = await Promise.all([
      SupportRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      SupportRequest.countDocuments(filter),
    ]);

    return sendPaginated(res, {
      message: "Support requests fetched successfully.",
      dataKey: "requests",
      data: requests,
      page,
      limit,
      total,
    });
  })
);

router.patch(
  "/admin/:id/status",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  supportStatusValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const request = await SupportRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Support request not found." });
    }

    request.status = req.body.status;
    request.priority = req.body.priority || request.priority;
    request.adminNote = req.body.adminNote ?? request.adminNote;

    await request.save();

    await deleteCacheByPattern("admin:stats*");

    return sendSuccess(res, 200, "Support request updated successfully.", {
      request,
    });
  })
);

router.delete(
  "/admin/:id",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  mongoIdValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const request = await SupportRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Support request not found." });
    }

    await SupportRequest.findByIdAndDelete(req.params.id);

    await deleteCacheByPattern("admin:stats*");

    return sendSuccess(res, 200, "Support request deleted successfully.");
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
      "status",
      "priority",
      "adminNote",
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