const { body, param } = require("express-validator");

const uploadEventValidator = [
  body("title")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Event title must be between 2 and 120 characters."),

  body("description")
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Event description must be between 10 and 5000 characters."),
];

const eventIdValidator = [
  param("id").isMongoId().withMessage("Invalid event id."),
];

module.exports = {
  uploadEventValidator,
  eventIdValidator,
};