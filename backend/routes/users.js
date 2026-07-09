const express = require("express");
const router = express.Router();

const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess } = require("../utils/response");

router.get(
  "/count",
  asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments();

    return sendSuccess(res, 200, "User count fetched successfully.", {
      count: userCount,
    });
  })
);

module.exports = router;