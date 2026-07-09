const { body, param, query } = require("express-validator");

const paginationValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Invalid page."),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Invalid limit."),
  query("search").optional().trim(),
  query("status").optional().trim(),
];

const mongoIdValidator = [
  param("id").isMongoId().withMessage("Invalid resource id."),
];

const feedbackStatusValidator = [
  param("id").isMongoId().withMessage("Invalid feedback id."),

  body("status")
    .isIn(["new", "reviewed", "resolved"])
    .withMessage("Invalid feedback status."),
];

const supportStatusValidator = [
  param("id").isMongoId().withMessage("Invalid support request id."),

  body("status")
    .isIn(["new", "in-progress", "resolved", "closed"])
    .withMessage("Invalid support status."),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority."),

  body("adminNote")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Admin note is too long."),
];

const bloodStatusValidator = [
  param("id").isMongoId().withMessage("Invalid blood request id."),

  body("status")
    .isIn(["new", "verified", "in-progress", "fulfilled", "closed", "rejected"])
    .withMessage("Invalid blood request status."),

  body("urgency")
    .optional()
    .isIn(["normal", "urgent", "critical"])
    .withMessage("Invalid urgency."),

  body("adminNote")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Admin note is too long."),
];

module.exports = {
  paginationValidator,
  mongoIdValidator,
  feedbackStatusValidator,
  supportStatusValidator,
  bloodStatusValidator,
};