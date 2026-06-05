/**
 * queue.js — BullMQ Queue & Worker for the AI ingestion pipeline.
 *
 * Architecture:
 *   Producer → Queue (Redis) → Worker → extractionPipeline()
 *
 * The Queue is the "inbox". When a user saves an item, the controller
 * drops a job into the Queue and immediately returns 201 to the user.
 * The Worker picks jobs from the Queue and runs the actual pipeline:
 *   fetch URL → translate → chunk → embed → upsert to Pinecone → tag → summarise
 *
 * This completely decouples HTTP request latency from AI processing time.
 * A pipeline that takes 30 seconds no longer blocks the Express server.
 *
 * Concurrency:
 *   Worker concurrency is set to 3. This means up to 3 items can be
 *   processed in parallel. Increase this as your infrastructure scales.
 *
 * Retry Policy:
 *   Failed jobs are retried up to 3 times with exponential backoff:
 *   1st retry after 5s, 2nd after 30s, 3rd after 2 minutes.
 *   After all retries are exhausted, the job lands in the "failed" queue.
 *
 * Job Completion Cleanup:
 *   Completed jobs are removed after 100 are kept (rolling window).
 *   Failed jobs are retained for 500 so you can inspect them later.
 */

import { Queue, Worker } from "bullmq";
import connection from "../config/redis.js";
import extractionPipeline from "../utils/pipeline.js";

// ── Queue name — used by both producer and consumer ───────────────────────────
export const PIPELINE_QUEUE = "item-pipeline";

// ── Producer: the Queue that controllers push jobs into ───────────────────────
export const pipelineQueue = new Queue(PIPELINE_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // 5s, 30s, 2m
    },
    removeOnComplete: { count: 100 }, // keep last 100 completed job records
    removeOnFail:     { count: 500 }, // keep last 500 failed job records for inspection
  },
});

// ── Worker: the consumer that processes jobs from the Queue ───────────────────
// The Worker is created once when this module is first imported (server start).
// It runs in the same Node.js process but handles jobs asynchronously via
// BullMQ's event loop integration — it does not block the Express server.
export const pipelineWorker = new Worker(
  PIPELINE_QUEUE,

  // Processor function — called for every job pulled from the queue
  async (job) => {
    const { itemId } = job.data;

    console.log(`[Queue] Processing job ${job.id} for item ${itemId}`);

    // Run the full pipeline — extract, translate, chunk, embed, tag, summarise
    await extractionPipeline(itemId);

    console.log(`[Queue] Job ${job.id} completed for item ${itemId}`);
  },

  {
    connection,
    concurrency: 3,
  }
);

// ── Worker event listeners for observability ──────────────────────────────────
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
