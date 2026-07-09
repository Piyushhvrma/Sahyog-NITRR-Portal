const multer = require("multer");
const { sendError } = require("../utils/response");

const errorHandler = (err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  if (err instanceof multer.MulterError) {
    return sendError(
      res,
      400,
      err.code === "LIMIT_FILE_SIZE"
        ? "Uploaded file is too large."
        : err.message
    );
  }

  if (
    err.message &&
    (err.message.includes("Only JPG") || err.message.includes("Only image"))
  ) {
    return sendError(res, 400, err.message);
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((item) => item.message);
    return sendError(res, 400, errors[0] || "Validation failed.", errors);
  }

  if (err.name === "CastError") {
    return sendError(res, 400, "Invalid resource id.");
  }

  if (err.code === 11000) {
    return sendError(res, 400, "Duplicate field value entered.");
  }

  return sendError(
    res,
    err.statusCode || 500,
    err.message || "Internal server error."
  );
};

module.exports = errorHandler;