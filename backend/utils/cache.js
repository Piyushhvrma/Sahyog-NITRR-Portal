const { getRedisClient, redisAvailable } = require("../config/redis");

const DEFAULT_TTL = 60;

const getCache = async (key) => {
  try {
    if (!redisAvailable()) return null;

    const redis = getRedisClient();
    const cachedData = await redis.get(key);

    if (!cachedData) return null;

    return JSON.parse(cachedData);
  } catch (error) {
    console.error("Redis get cache failed:", error.message);
    return null;
  }
};

const setCache = async (key, data, ttl = DEFAULT_TTL) => {
  try {
    if (!redisAvailable()) return;

    const redis = getRedisClient();

    await redis.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error("Redis set cache failed:", error.message);
  }
};

const deleteCache = async (key) => {
  try {
    if (!redisAvailable()) return;

    const redis = getRedisClient();
    await redis.del(key);
  } catch (error) {
    console.error("Redis delete cache failed:", error.message);
  }
};

const deleteCacheByPattern = async (pattern) => {
  try {
    if (!redisAvailable()) return;

    const redis = getRedisClient();

    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    console.error("Redis delete pattern failed:", error.message);
  }
};

const buildCacheKey = (prefix, query = {}) => {
  const sortedQuery = Object.keys(query)
    .sort()
    .map((key) => `${key}:${query[key]}`)
    .join("|");

  return sortedQuery ? `${prefix}:${sortedQuery}` : prefix;
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
  buildCacheKey,
};