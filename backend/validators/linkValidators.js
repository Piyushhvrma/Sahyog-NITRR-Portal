const { body, query, param } = require("express-validator");

const uploadLinkValidator = [
  body("title")
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("Title must be between 2 and 150 characters."),

  body("branch")
    .trim()
    .notEmpty()
    .withMessage("Branch is required."),

  body("year")
    .trim()
    .notEmpty()
    .withMessage("Year is required."),

  body("semester")
    .trim()
    .notEmpty()
    .withMessage("Semester is required."),

  body("url")
    .trim()
    .isURL({ require_protocol: true })
    .withMessage("Please provide a valid URL with http/https."),
];

const getLinksValidator = [
  query("year").optional().trim(),
  query("branch").optional().trim(),
  query("semester").optional().trim(),
];

const mongoIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid resource id."),
];

module.exports = {
  uploadLinkValidator,
  getLinksValidator,
  mongoIdParamValidator,
};