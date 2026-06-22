require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

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

// ✅ FIX: Add COOP header BEFORE cors — fixes Google OAuth popup postMessage error
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://sahyog-nitrr-portal.vercel.app"
  ],
  optionsSuccessStatus: 200,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const start = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas!");

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`✅ Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

start();