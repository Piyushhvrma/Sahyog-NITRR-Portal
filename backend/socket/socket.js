const jwt = require("jsonwebtoken");

let ioInstance = null;

const getTokenFromCookie = (
  cookieHeader = ""
) => {
  const cookies = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim());

  const tokenCookie = cookies.find((cookie) =>
    cookie.startsWith("token=")
  );

  if (!tokenCookie) {
    return null;
  }

  return decodeURIComponent(
    tokenCookie.split("=")[1]
  );
};

const initializeSocket = (io) => {
  ioInstance = io;

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        getTokenFromCookie(
          socket.handshake.headers.cookie || ""
        );

      if (!token) {
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      socket.user = decoded.user;

      return next();
    } catch {
      socket.user = null;
      return next();
    }
  });

  io.on("connection", (socket) => {
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
      socket.join("authenticated-users");

      if (
        socket.user.role === "admin" ||
        socket.user.role === "superadmin"
      ) {
        socket.join("admins");
      }
    }

    socket.on("join-room", (roomCode) => {
      if (!roomCode) return;

      socket.join(
        `room:${String(
          roomCode
        ).toUpperCase()}`
      );
    });

    socket.on("leave-room", (roomCode) => {
      if (!roomCode) return;

      socket.leave(
        `room:${String(
          roomCode
        ).toUpperCase()}`
      );
    });

    socket.on("disconnect", () => {});
  });
};

const getIO = () => ioInstance;

const emitToAllUsers = (
  eventName,
  payload
) => {
  if (!ioInstance) return;

  ioInstance
    .to("authenticated-users")
    .emit(eventName, payload);
};

const emitToUser = (
  userId,
  eventName,
  payload
) => {
  if (!ioInstance || !userId) return;

  ioInstance
    .to(`user:${String(userId)}`)
    .emit(eventName, payload);
};

const emitToRoom = (
  roomCode,
  eventName,
  payload
) => {
  if (!ioInstance || !roomCode) return;

  ioInstance
    .to(
      `room:${String(
        roomCode
      ).toUpperCase()}`
    )
    .emit(eventName, payload);
};

module.exports = {
  initializeSocket,
  getIO,
  emitToAllUsers,
  emitToUser,
  emitToRoom,
};