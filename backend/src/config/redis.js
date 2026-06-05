/**
 * redis.js — Shared IORedis connection for BullMQ.
 *
 * BullMQ requires ioredis specifically (not the `redis` npm package).
 * This module creates a single, reusable connection instance that is shared
 * by both the Queue (producer) and the Worker (consumer) to avoid creating
 * redundant connections on every import.
 *
 * Config priority:
 *   1. REDIS_URL  (e.g. a managed Redis URL from Upstash, Railway, etc.)
 *   2. Individual REDIS_HOST / REDIS_PORT / REDIS_PASSWORD vars
 *   3. Local defaults (localhost:6379, no password) for development
 *
 * BullMQ requires `maxRetriesPerRequest: null` — without this, ioredis will
 * throw on blocked commands that BullMQ uses internally (BRPOP, BLPOP).
 */

import IORedis from "ioredis";

const connectionConfig = process.env.REDIS_URL
  ? {
      maxRetriesPerRequest: null,
    }
  : {
      host:     process.env.REDIS_HOST     || "127.0.0.1",
      port:     parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
    };

const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new IORedis(connectionConfig);

connection.on("connect", () => console.log("Redis: connected"));
connection.on("error",   (err) => console.error("Redis error:", err.message));

export default connection;
