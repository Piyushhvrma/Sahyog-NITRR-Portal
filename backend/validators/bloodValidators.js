const { body } = require("express-validator");

const allowedBloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const bloodRequestValidator = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters."),

  body("email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email."),

  body("phone")
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please provide a valid 10-digit Indian phone number."),

  body("bloodGroup")
    .isIn(allowedBloodGroups)
    .withMessage("Please select a valid blood group."),

  body("requestDetails")
    .trim()
    .isLength({ min: 10, max: 3000 })
    .withMessage("Request details must be between 10 and 3000 characters."),
];

module.exports = {
  bloodRequestValidator,
};