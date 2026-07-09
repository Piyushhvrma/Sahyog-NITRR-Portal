const { createClient } = require("redis");

let redisClient = null;
let isRedisReady = false;

const connectRedis = async () => {
  if (process.env.CACHE_ENABLED !== "true") {
    console.log("Redis cache disabled.");
    return null;
  }

  if (!process.env.REDIS_URL) {
    console.log("REDIS_URL missing. Redis cache disabled.");
    return null;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        tls: process.env.REDIS_URL.startsWith("rediss://"),
        reconnectStrategy: false,
      },
    });

    redisClient.on("error", (error) => {
      isRedisReady = false;
      console.error("Redis error:", error.message);
    });

    redisClient.on("connect", () => {
      console.log("Redis connecting...");
    });

    redisClient.on("ready", () => {
      isRedisReady = true;
      console.log("Redis connected and ready.");
    });

    redisClient.on("end", () => {
      isRedisReady = false;
      console.log("Redis connection closed.");
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    isRedisReady = false;
    console.error("Redis connection failed:", error.message);
    return null;
  }
};

const getRedisClient = () => redisClient;

const redisAvailable = () => {
  return Boolean(redisClient && isRedisReady);
};

module.exports = {
  connectRedis,
  getRedisClient,
  redisAvailable,
};