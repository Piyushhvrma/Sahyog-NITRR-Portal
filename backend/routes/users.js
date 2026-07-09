const express = require("express");
const router = express.Router();

const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess } = require("../utils/response");
const { getCache, setCache } = require("../utils/cache");

router.get(
  "/count",
  asyncHandler(async (req, res) => {
    const cacheKey = "users:count";
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const userCount = await User.countDocuments();

    const responsePayload = {
      success: true,
      message: "User count fetched successfully.",
      count: userCount,
    };

    await setCache(cacheKey, responsePayload, 300);

    return sendSuccess(res, 200, "User count fetched successfully.", {
      count: userCount,
    });
  })
);

module.exports = router;