const { body, param } = require("express-validator");

const createAnnouncementValidator = [
  body("title")
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("Announcement title must be between 2 and 150 characters."),

  body("description")
    .trim()
    .isLength({ min: 5, max: 5000 })
    .withMessage("Announcement description must be between 5 and 5000 characters."),

  body("category")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Category is too long."),
];

const announcementIdValidator = [
  param("id").isMongoId().withMessage("Invalid announcement id."),
];

module.exports = {
  createAnnouncementValidator,
  announcementIdValidator,
};