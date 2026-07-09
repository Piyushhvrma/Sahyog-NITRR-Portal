const express = require("express");
const router = express.Router();

const Room = require("../models/Room");

const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../middleware/asyncHandler");
const { adminLimiter, formLimiter } = require("../middleware/rateLimiters");
const { sendSuccess } = require("../utils/response");
const { emitToRoom, emitToAllUsers } = require("../socket/socket");

const {
  createRoomValidator,
  roomCodeValidator,
  voteValidator,
} = require("../validators/roomValidators");

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const createUniqueRoomCode = async () => {
  let roomCode = generateRoomCode();
  let exists = await Room.exists({ roomCode });

  while (exists) {
    roomCode = generateRoomCode();
    exists = await Room.exists({ roomCode });
  }

  return roomCode;
};

router.post(
  "/",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  createRoomValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { title, description, pollQuestion, options } = req.body;

    const roomCode = await createUniqueRoomCode();

    const room = await Room.create({
      title,
      description,
      roomCode,
      pollQuestion,
      options: options.map((item) => ({
        text: item,
        votes: 0,
      })),
      createdBy: req.user.id,
    });

    emitToAllUsers("room-created", {
      roomCode: room.roomCode,
      title: room.title,
      pollQuestion: room.pollQuestion,
    });

    return sendSuccess(res, 201, "Room created successfully.", {
      room,
    });
  })
);

router.get(
  "/",
  jwtAuth,
  asyncHandler(async (req, res) => {
    const rooms = await Room.find()
      .select("title description roomCode pollQuestion options isActive createdAt")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Rooms fetched successfully.", {
      rooms,
    });
  })
);

router.get(
  "/:roomCode",
  jwtAuth,
  roomCodeValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const room = await Room.findOne({
      roomCode: req.params.roomCode.toUpperCase(),
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found.",
      });
    }

    const hasVoted = room.voters.some(
      (vote) => vote.userId.toString() === req.user.id
    );

    return sendSuccess(res, 200, "Room fetched successfully.", {
      room,
      hasVoted,
    });
  })
);

router.post(
  "/:roomCode/vote",
  jwtAuth,
  formLimiter,
  voteValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { optionId } = req.body;

    const room = await Room.findOne({
      roomCode: req.params.roomCode.toUpperCase(),
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found.",
      });
    }

    if (!room.isActive) {
      return res.status(400).json({
        message: "This room is closed.",
      });
    }

    const alreadyVoted = room.voters.some(
      (vote) => vote.userId.toString() === req.user.id
    );

    if (alreadyVoted) {
      return res.status(400).json({
        message: "You have already voted in this room.",
      });
    }

    const option = room.options.id(optionId);

    if (!option) {
      return res.status(400).json({
        message: "Invalid option selected.",
      });
    }

    option.votes += 1;

    room.voters.push({
      userId: req.user.id,
      optionId,
    });

    await room.save();

    emitToRoom(room.roomCode, "poll-updated", {
      roomCode: room.roomCode,
      options: room.options,
      totalVotes: room.voters.length,
    });

    return sendSuccess(res, 200, "Vote submitted successfully.", {
      room,
      hasVoted: true,
    });
  })
);

router.patch(
  "/:roomCode/toggle",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  roomCodeValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const room = await Room.findOne({
      roomCode: req.params.roomCode.toUpperCase(),
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found.",
      });
    }

    room.isActive = !room.isActive;
    await room.save();

    emitToRoom(room.roomCode, "room-status-updated", {
      roomCode: room.roomCode,
      isActive: room.isActive,
    });

    return sendSuccess(res, 200, "Room status updated successfully.", {
      room,
    });
  })
);

router.delete(
  "/:roomCode",
  jwtAuth,
  requireRole("admin", "superadmin"),
  adminLimiter,
  roomCodeValidator,
  validateRequest,
  asyncHandler(async (req, res) => {
    const room = await Room.findOne({
      roomCode: req.params.roomCode.toUpperCase(),
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found.",
      });
    }

    const isCreator = room.createdBy.toString() === req.user.id;
    const isSuperAdmin = req.user.role === "superadmin";

    if (!isCreator && !isSuperAdmin) {
      return res.status(403).json({
        message: "Only the room creator or superadmin can delete this room.",
      });
    }

    await Room.findByIdAndDelete(room._id);

    emitToRoom(room.roomCode, "room-deleted", {
      roomCode: room.roomCode,
    });

    return sendSuccess(res, 200, "Room deleted successfully.");
  })
);

module.exports = router;