const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "GOOGLE_CLIENT_ID",
  "FRONTEND_URL",
];

const optionalProductionEnv = [
  "BREVO_API_KEY",
  "EMAIL_FROM",
  "SUPPORT_RECEIVER",
  "BLOOD_REQUEST_RECEIVER",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const validateEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (process.env.CACHE_ENABLED === "true" && !process.env.REDIS_URL) {
    missing.push("REDIS_URL");
  }

  if (missing.length > 0) {
    throw new Error(`Missing required env variables: ${missing.join(", ")}`);
  }

  if (process.env.NODE_ENV === "production") {
    const missingOptional = optionalProductionEnv.filter(
      (key) => !process.env[key]
    );

    if (missingOptional.length > 0) {
      console.warn(
        `Production warning: missing optional env variables: ${missingOptional.join(
          ", "
        )}`
      );
    }
  }
};

module.exports = validateEnv;