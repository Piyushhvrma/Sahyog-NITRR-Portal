const { body } = require("express-validator");

const feedbackValidator = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters."),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email."),

  body("message")
    .trim()
    .isLength({ min: 5, max: 2000 })
    .withMessage("Feedback message must be between 5 and 2000 characters."),
];

module.exports = {
  feedbackValidator,
};