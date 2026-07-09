require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const adminRoutes = require("./routes/adminRoutes");

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


const app = express();

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://sahyog-nitrr-portal.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("SAHYOG Backend is running");
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

const start = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
      console.log(`SAHYOG Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup error:", error.message);
    process.exit(1);
  }
};

start();