const { body } = require("express-validator");

const supportRequestValidator = [
  body("name")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage("Name is too long."),

  body("contact")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage("Contact is too long."),

  body("category")
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Please select a valid category."),

  body("message")
    .trim()
    .isLength({ min: 10, max: 3000 })
    .withMessage("Message must be between 10 and 3000 characters."),
];

module.exports = {
  supportRequestValidator,
};