/**
 * queue.js — BullMQ Queues & Workers for Relic's asynchronous pipelines.
 *
 * This module manages two completely independent pipelines:
 *
 * ── Pipeline 1: Item Ingestion ────────────────────────────────────────────────
 *   Producer → pipelineQueue (Redis) → pipelineWorker → extractionPipeline()
 *
 *   When a user saves a URL, the controller drops a job here and immediately
 *   returns 201. The worker handles the slow work in the background:
 *   fetch → translate → chunk → embed → upsert to Pinecone → tag → summarise
 *
 * ── Pipeline 2: Daily Resurface ───────────────────────────────────────────────
 *   Producer → resurfaceQueue (Redis) → resurfaceWorker → per-user Redis cache
 *
 *   At 9 AM, the cron (resurfacer.js) discovers which users have items due for
 *   resurfacing and pushes one lightweight job per user into this queue.
 *   The worker processes each job: queries that user's items from MongoDB,
 *   then writes the result into a Redis key resurface:{userId} with a 24-hour
 *   TTL. The API endpoint reads from this cache — zero DB calls at read time.
 *
 * ── Concurrency ───────────────────────────────────────────────────────────────
 *   pipelineWorker:  concurrency = 3  (CPU/API heavy — keep low)
 *   resurfaceWorker: concurrency = 10 (lightweight DB reads — can run fast)
 */

import { Queue, Worker } from "bullmq";
import connection from "../config/redis.js";
import extractionPipeline from "../utils/pipeline.js";
import Item from "../models/item.model.js";

// ── Queue names ───────────────────────────────────────────────────────────────
export const PIPELINE_QUEUE  = "item-pipeline";
export const RESURFACE_QUEUE = "resurface-pipeline";

// TTL for the per-user Redis cache key (24 hours in seconds)
const RESURFACE_TTL_SECONDS = 24 * 60 * 60;

// ── Pipeline 1: Item Ingestion Queue & Worker ─────────────────────────────────

export const pipelineQueue = new Queue(PIPELINE_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // 5s, 30s, 2m
    },
    removeOnComplete: { count: 100 },
    removeOnFail:     { count: 500 },
  },
});

export const pipelineWorker = new Worker(
  PIPELINE_QUEUE,
  async (job) => {
    const { itemId } = job.data;
    console.log(`[Queue] Processing job ${job.id} for item ${itemId}`);
    await extractionPipeline(itemId);
    console.log(`[Queue] Job ${job.id} completed for item ${itemId}`);
  },
  {
    connection,
    concurrency: 3,
  }
);

pipelineWorker.on("completed", (job) => {
  console.log(`[Queue] Job ${job.id} (item: ${job.data.itemId}) completed`);
});

pipelineWorker.on("failed", (job, err) => {
  console.error(
    `[Queue] Job ${job?.id} (item: ${job?.data?.itemId}) failed on attempt ${job?.attemptsMade}:`,
    err.message
  );
});

pipelineWorker.on("error", (err) => {
  console.error("[Queue] Worker error:", err.message);
});

// ── Pipeline 2: Resurface Queue & Worker ──────────────────────────────────────

export const resurfaceQueue = new Queue(RESURFACE_QUEUE, { connection });

export const resurfaceWorker = new Worker(
  RESURFACE_QUEUE,
  async (job) => {
    const { userId, resurfaceDays } = job.data;

    // Build date ranges for each resurface window (7, 30, 90 days ago)
    const found = [];

    for (const daysAgo of resurfaceDays) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      // Scoped to a SINGLE user — safe and efficient at any scale
      const items = await Item.find(
        {
          user: userId,
          extractionStatus: "resolved",
          createdAt: { $gte: start, $lte: end },
        },
        {
          url: 1,
          type: 1,
          title: 1,
          "content.excerpt": 1,
          "ai.tags": 1,
          "ai.summary": 1,
          createdAt: 1,
          user: 1,
        }
      ).lean();

      for (const item of items) {
        found.push({ item, daysAgo });
      }
    }

    // Write the result into Redis with a 24-hour TTL.
    // Key pattern: resurface:{userId}
    // The controller reads this key — no DB hit at read time.
    const redisKey = `resurface:${userId}`;
    await connection.set(redisKey, JSON.stringify(found), "EX", RESURFACE_TTL_SECONDS);

    console.log(
      `[Resurfacer] Cached ${found.length} items for user ${userId} (TTL: 24h)`
    );
  },
  {
    connection,
    concurrency: 10, // Safe for lightweight DB+Redis operations
  }
);

resurfaceWorker.on("failed", (job, err) => {
  console.error(
    `[Resurfacer] Job ${job?.id} failed for user ${job?.data?.userId}:`,
    err.message
  );
});

resurfaceWorker.on("error", (err) => {
  console.error("[Resurfacer] Worker error:", err.message);
});
