const { body, param } = require("express-validator");

const updateRoleValidator = [
  param("id").isMongoId().withMessage("Invalid user id."),

  body("role")
    .isIn(["student", "admin", "superadmin"])
    .withMessage("Invalid role."),
];

module.exports = {
  updateRoleValidator,
};