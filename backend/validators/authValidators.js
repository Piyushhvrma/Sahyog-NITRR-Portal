const { body } = require("express-validator");

const emailRule = body("email")
  .trim()
  .isEmail()
  .withMessage("Please provide a valid email.")
  .normalizeEmail();

const passwordRule = body("password")
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters long.");

const registerValidator = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters."),

  emailRule,
  passwordRule,
];

const loginValidator = [emailRule, passwordRule];

const googleLoginValidator = [
  body("credential")
    .notEmpty()
    .withMessage("Google credential is required."),
];

const forgotPasswordValidator = [emailRule];

const resetPasswordValidator = [
  emailRule,

  body("otp")
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits.")
    .isNumeric()
    .withMessage("OTP must contain only numbers."),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long."),
];

module.exports = {
  registerValidator,
  loginValidator,
  googleLoginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
};