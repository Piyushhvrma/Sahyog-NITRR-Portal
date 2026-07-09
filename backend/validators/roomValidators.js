const { body, param } = require("express-validator");

const createRoomValidator = [
  body("title")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Room title must be between 2 and 120 characters."),

  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description is too long."),

  body("pollQuestion")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Poll question must be between 5 and 200 characters."),

  body("options")
    .isArray({ min: 2, max: 8 })
    .withMessage("Please provide between 2 and 8 poll options."),

  body("options.*")
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage("Each option must be between 1 and 80 characters."),
];

const roomCodeValidator = [
  param("roomCode")
    .trim()
    .isLength({ min: 4, max: 12 })
    .withMessage("Invalid room code."),
];

const voteValidator = [
  param("roomCode")
    .trim()
    .isLength({ min: 4, max: 12 })
    .withMessage("Invalid room code."),

  body("optionId")
    .notEmpty()
    .withMessage("Option id is required."),
];

module.exports = {
  createRoomValidator,
  roomCodeValidator,
  voteValidator,
};