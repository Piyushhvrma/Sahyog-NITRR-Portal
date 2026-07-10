const express = require("express");
const router = express.Router();
const {
  Parser,
} = require("json2csv");

const SupportRequest = require("../models/SupportRequest");

const jwtAuth = require("../middleware/jwtAuth");
const optionalJwtAuth = require("../middleware/optionalJwtAuth");
const requireRole = require("../middleware/roleAuth");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");

const {
  formLimiter,
  adminLimiter,
} = require("../middleware/rateLimiters");

const {
  sendSuccess,
  sendPaginated,
} = require("../utils/response");

const {
  sendSupportRequestEmail,
} = require("../services/mail.service");

const {
  createFormSubmissionNotification,
} = require("../services/notification.service");

const {
  emitToUser,
} = require("../socket/socket");

const {
  deleteCacheByPattern,
} = require("../utils/cache");

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
  optionalJwtAuth,
  formLimiter,
  supportRequestValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const {
      name,
      contact,
      category,
      message,
    } = req.body;

    const supportRequest =
      await SupportRequest.create({
        name:
          name?.trim() ||
          "Anonymous Student",
        contact:
          contact?.trim() ||
          "Not Provided",
        category,
        message,
      });

    await deleteCacheByPattern(
      "admin:stats*"
    );

    try {
      await sendSupportRequestEmail({
        name:
          name ||
          "Anonymous Student",
        contact:
          contact ||
          "Not Provided",
        category,
        message,
      });

      supportRequest.emailStatus =
        "sent";

      await supportRequest.save();
    } catch (error) {
      supportRequest.emailStatus =
        "failed";

      await supportRequest.save();

      console.error(
        "Support email failed:",
        error.message
      );
    }

    const notification =
      await createFormSubmissionNotification({
        authenticatedUserId:
          req.user?.id,

        email:
          contact &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            contact.trim()
          )
            ? contact
            : "",

        title:
          "Support Request Submitted",

        message:
          "Your concern has been privately shared with the SAHYOG team. The team will review it as soon as possible.",

        type: "SUPPORT",
      });

    if (notification) {
      emitToUser(
        notification.userId,
        "notification-created",
        notification
      );
    }

    return sendSuccess(
      res,
      201,
      "Your request has been sent privately to the SAHYOG team.",
      {
        requestId:
          supportRequest._id,
      }
    );
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
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      100
    );

    const skip =
      (page - 1) * limit;

    const {
      search,
      status,
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          contact: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
        {
          message: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const [
      requests,
      total,
    ] = await Promise.all([
      SupportRequest.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      SupportRequest.countDocuments(
        filter
      ),
    ]);

    return sendPaginated(res, {
      message:
        "Support requests fetched successfully.",
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
    const request =
      await SupportRequest.findById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Support request not found.",
      });
    }

    request.status =
      req.body.status;

    request.priority =
      req.body.priority ||
      request.priority;

    request.adminNote =
      req.body.adminNote ??
      request.adminNote;

    await request.save();

    await deleteCacheByPattern(
      "admin:stats*"
    );

    return sendSuccess(
      res,
      200,
      "Support request updated successfully.",
      {
        request,
      }
    );
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
    const request =
      await SupportRequest.findById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Support request not found.",
      });
    }

    await SupportRequest.findByIdAndDelete(
      req.params.id
    );

    await deleteCacheByPattern(
      "admin:stats*"
    );

    return sendSuccess(
      res,
      200,
      "Support request deleted successfully."
    );
  })
);

router.get(
  "/download-sheet",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  asyncHandler(async (req, res) => {
    const requests =
      await SupportRequest.find()
        .sort({
          createdAt: -1,
        })
        .lean();

    if (!requests.length) {
      return res
        .status(404)
        .send(
          "No support requests found."
        );
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

    const parser =
      new Parser({
        fields,
      });

    const csvData =
      parser.parse(requests);

    res.setHeader(
      "Content-Type",
      "text/csv"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Sahyog_Support_Requests.csv"
    );

    return res
      .status(200)
      .send(csvData);
  })
);

module.exports = router;