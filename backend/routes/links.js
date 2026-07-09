const express = require("express");
const router = express.Router();

const Link = require("../models/Link");
const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const { adminLimiter } = require("../middleware/rateLimiters");

const {
  uploadLinkValidator,
  getLinksValidator,
  mongoIdParamValidator,
} = require("../validators/linkValidators");

router.get(
  "/",
  getLinksValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { year, branch, semester } = req.query;

    const filter = {};
    if (year) filter.year = year;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = semester;

    const links = await Link.find(filter).sort({ uploadedAt: -1 });

    res.json({ links });
  })
);

router.post(
  "/upload",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  uploadLinkValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const link = await Link.create(req.body);

    res.status(201).json({
      success: true,
      message: "Link uploaded successfully.",
      link,
    });
  })
);

router.delete(
  "/:id",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  mongoIdParamValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const link = await Link.findById(req.params.id);

    if (!link) {
      return res.status(404).json({ message: "Link not found." });
    }

    await Link.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Link deleted successfully.",
    });
  })
);

module.exports = router;