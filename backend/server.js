require("dotenv").config();

const validateEnv = require("./config/env");
validateEnv();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const compression = require("compression");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");

const linksRoute = require("./routes/links");
const feedbackRoute = require("./routes/feedback");
const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");
const eventsRoute = require("./routes/events");
const profileRoute = require("./routes/profile");
const bloodRequestRoutes = require("./routes/bloodRequest");
const supportRoutes = require("./routes/supportRoutes");
const aiRoutes = require("./routes/aiRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const roomRoutes = require("./routes/roomRoutes");

const errorHandler = require("./middleware/errorHandler");
const { initializeSocket } = require("./socket/socket");
const { connectRedis } = require("./config/redis");
const { corsOptions, socketCorsOptions } = require("./config/cors");

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);

const io = new Server(server, {
  cors: socketCorsOptions,
});

initializeSocket(io);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

app.use(
  helmet({
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SAHYOG Backend is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    service: "SAHYOG Backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/links", linksRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/events", eventsRoute);
app.use("/api/profile", profileRoute);
app.use("/api/blood-request", bloodRequestRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rooms", roomRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use(errorHandler);

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error.message);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error.message);
  process.exit(1);
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await connectRedis();

    const PORT = process.env.PORT || 4000;

    server.listen(PORT, () => {
      console.log(`SAHYOG Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup error:", error.message);
    process.exit(1);
  }
};

start();