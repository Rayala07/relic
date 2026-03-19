import { createClient } from "redis";
import "dotenv/config";

/**
 * Redis client instance
 * @type {import('redis').RedisClientType}
 */
const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis connected successfully"));

/**
 * Connects to the Redis server
 * @returns {Promise<void>}
 */
export async function connectToRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export default redisClient;
