const express = require("express");
const router = express.Router();
const {
  Parser,
} = require("json2csv");

const BloodRequest = require("../models/BloodRequest");

const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const jwtAuth = require("../middleware/jwtAuth");
const optionalJwtAuth = require("../middleware/optionalJwtAuth");
const requireRole = require("../middleware/roleAuth");

const {
  formLimiter,
  adminLimiter,
} = require("../middleware/rateLimiters");

const {
  uploadBloodDocument,
} = require("../middleware/upload");

const {
  sendSuccess,
  sendPaginated,
} = require("../utils/response");

const {
  sendBloodRequestEmail,
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
  bloodRequestValidator,
} = require("../validators/bloodValidators");

const {
  paginationValidator,
  mongoIdValidator,
  bloodStatusValidator,
} = require("../validators/adminManagementValidators");

router.post(
  "/",
  optionalJwtAuth,
  formLimiter,
  uploadBloodDocument.single(
    "document"
  ),
  bloodRequestValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const {
      name,
      email,
      phone,
      bloodGroup,
      requestDetails,
    } = req.body;

    const bloodRequest =
      await BloodRequest.create({
        name,
        email: email || "",
        phone,
        bloodGroup,
        requestDetails,
        documentName:
          req.file?.originalname || "",
        hasDocument: Boolean(
          req.file
        ),
      });

    await deleteCacheByPattern(
      "admin:stats*"
    );

    const attachments = [];

    if (req.file) {
      attachments.push({
        name:
          req.file.originalname,
        content:
          req.file.buffer.toString(
            "base64"
          ),
      });
    }

    let emailFailed = false;

    try {
      await sendBloodRequestEmail({
        name,
        email,
        phone,
        bloodGroup,
        requestDetails,
        attachments,
      });

      bloodRequest.emailStatus =
        "sent";
    } catch (error) {
      emailFailed = true;

      bloodRequest.emailStatus =
        "failed";

      console.error(
        "Blood request email failed:",
        error.message
      );
    }

    await bloodRequest.save();

    const notification =
      await createFormSubmissionNotification({
        authenticatedUserId:
          req.user?.id,
        email,
        title:
          "Blood Request Submitted",
        message:
          "Your emergency blood request has been saved and shared with the SAHYOG team for review.",
        type: "BLOOD",
      });

    if (notification) {
      emitToUser(
        notification.userId,
        "notification-created",
        notification
      );
    }

    if (emailFailed) {
      return res.status(502).json({
        success: false,
        message:
          "Request saved, but email alert failed. Please contact admin.",
        requestId:
          bloodRequest._id,
      });
    }

    return sendSuccess(
      res,
      200,
      "Blood request submitted successfully.",
      {
        requestId:
          bloodRequest._id,
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
          phone: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          bloodGroup: {
            $regex: search,
            $options: "i",
          },
        },
        {
          requestDetails: {
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
      BloodRequest.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      BloodRequest.countDocuments(
        filter
      ),
    ]);

    return sendPaginated(res, {
      message:
        "Blood requests fetched successfully.",
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
  bloodStatusValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const request =
      await BloodRequest.findById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Blood request not found.",
      });
    }

    request.status =
      req.body.status;

    request.urgency =
      req.body.urgency ||
      request.urgency;

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
      "Blood request updated successfully.",
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
      await BloodRequest.findById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Blood request not found.",
      });
    }

    await BloodRequest.findByIdAndDelete(
      req.params.id
    );

    await deleteCacheByPattern(
      "admin:stats*"
    );

    return sendSuccess(
      res,
      200,
      "Blood request deleted successfully."
    );
  })
);

router.get(
  "/admin/export",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  asyncHandler(async (req, res) => {
    const requests =
      await BloodRequest.find()
        .sort({
          createdAt: -1,
        })
        .lean();

    if (!requests.length) {
      return res
        .status(404)
        .send(
          "No blood requests found."
        );
    }

    const fields = [
      "_id",
      "name",
      "email",
      "phone",
      "bloodGroup",
      "requestDetails",
      "status",
      "urgency",
      "adminNote",
      "emailStatus",
      "documentName",
      "hasDocument",
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
      "attachment; filename=Sahyog_Blood_Requests.csv"
    );

    return res
      .status(200)
      .send(csvData);
  })
);

module.exports = router;