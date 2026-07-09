const devOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:4173",
  "http://localhost:3000",
];

const prodOrigins = [
  process.env.FRONTEND_URL,
  "https://sahyog-nitrr-portal.vercel.app",
].filter(Boolean);

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? prodOrigins
    : [...devOrigins, ...prodOrigins];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

const socketCorsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

module.exports = {
  allowedOrigins,
  corsOptions,
  socketCorsOptions,
};