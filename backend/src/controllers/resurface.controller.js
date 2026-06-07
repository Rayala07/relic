/**
 * Resurface Controller
 *
 * Handles GET /api/resurface
 *
 * ARCHITECTURE: Cache-first read from Redis.
 *
 * The BullMQ resurfaceWorker (queue.js) writes to Redis key resurface:{userId}
 * every morning at 9 AM. This controller simply reads that key.
 *
 * Benefits over the old in-memory approach:
 *  - No RAM consumed on the API server — data lives in Redis
 *  - Works correctly with any number of server replicas (all share the same Redis)
 *  - Response time is always <5ms (Redis key lookup vs. in-memory array filter)
 *  - If the cache is empty (new user, or before first cron run), returns []
 *    gracefully — no errors, no crashes.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

import connection from "../config/redis.js";

export const getResurfaced = async (req, res) => {
  try {
    const redisKey = `resurface:${req.userId}`;

    // Read the pre-computed cache for this specific user
    const cached = await connection.get(redisKey);

    // If no cache exists yet (new user or before first cron), return empty gracefully
    if (!cached) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const items = JSON.parse(cached);

    // Add the human-readable label that the frontend banner uses
    const data = items.map(({ item, daysAgo }) => ({
      ...item,
      daysAgo,
      resurfaceLabel: daysAgo === 1 ? "yesterday" : `${daysAgo} days ago`,
    }));

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
