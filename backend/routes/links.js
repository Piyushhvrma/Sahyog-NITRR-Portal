const express = require("express");
const router = express.Router();

const Link = require("../models/Link");
const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const { adminLimiter } = require("../middleware/rateLimiters");
const { sendSuccess } = require("../utils/response");
const {
  getCache,
  setCache,
  deleteCacheByPattern,
  buildCacheKey,
} = require("../utils/cache");

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

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const cacheKey = buildCacheKey("links", {
      year: year || "all",
      branch: branch || "all",
      semester: semester || "all",
      page,
      limit,
    });

    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const filter = {};
    if (year) filter.year = year;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = semester;

    const [links, totalLinks] = await Promise.all([
      Link.find(filter).sort({ uploadedAt: -1 }).skip(skip).limit(limit),
      Link.countDocuments(filter),
    ]);

    const responsePayload = {
      success: true,
      message: "Links fetched successfully.",
      links,
      pagination: {
        page,
        limit,
        total: totalLinks,
        totalLinks,
        totalPages: Math.ceil(totalLinks / limit),
        hasNextPage: page * limit < totalLinks,
        hasPrevPage: page > 1,
      },
    };

    await setCache(cacheKey, responsePayload, 300);

    return res.status(200).json(responsePayload);
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

    await deleteCacheByPattern("links:*");
    await deleteCacheByPattern("admin:stats*");

    return sendSuccess(res, 201, "Link uploaded successfully.", {
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

    await deleteCacheByPattern("links:*");
    await deleteCacheByPattern("admin:stats*");

    return sendSuccess(res, 200, "Link deleted successfully.");
  })
);

module.exports = router;