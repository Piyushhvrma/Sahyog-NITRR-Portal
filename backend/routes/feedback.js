const express = require("express");
const router = express.Router();
const { Parser } = require("json2csv");

const Feedback = require("../models/Feedback");

const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const { formLimiter, adminLimiter } = require("../middleware/rateLimiters");
const { sendSuccess, sendPaginated } = require("../utils/response");
const { deleteCacheByPattern } = require("../utils/cache");

const {
  feedbackValidator,
} = require("../validators/feedbackValidators");

const {
  paginationValidator,
  mongoIdValidator,
  feedbackStatusValidator,
} = require("../validators/adminManagementValidators");

router.post(
  "/",
  formLimiter,
  feedbackValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const feedback = await Feedback.create(req.body);

    await deleteCacheByPattern("admin:stats*");

    return sendSuccess(res, 201, "Feedback received, thank you.", {
      feedback,
    });
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
        { email: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Feedback.countDocuments(filter),
    ]);

    return sendPaginated(res, {
      message: "Feedback fetched successfully.",
      dataKey: "feedbacks",
      data: feedbacks,
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
  feedbackStatusValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    feedback.status = req.body.status;
    await feedback.save();

    await deleteCacheByPattern("admin:stats*");

    return sendSuccess(res, 200, "Feedback status updated successfully.", {
      feedback,
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
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    await deleteCacheByPattern("admin:stats*");

    return sendSuccess(res, 200, "Feedback deleted successfully.");
  })
);

router.get(
  "/admin/export",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  asyncHandler(async (req, res) => {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();

    if (!feedbacks.length) {
      return res.status(404).send("No feedback found.");
    }

    const fields = ["_id", "name", "email", "message", "status", "createdAt"];
    const parser = new Parser({ fields });
    const csvData = parser.parse(feedbacks);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Sahyog_Feedback.csv"
    );

    return res.status(200).send(csvData);
  })
);

module.exports = router;