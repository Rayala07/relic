/**
 * resurfacer.js — Cron Job Producer for the Resurface Pipeline
 *
 * Architecture (before → after):
 *   BEFORE: node-cron → query ALL users from MongoDB → store everything in RAM
 *   AFTER:  node-cron → find distinct user IDs → push one BullMQ job per user
 *
 * This completely decouples the cron trigger from the heavy MongoDB work.
 * The cron just fires lightweight "please resurface this user" jobs.
 * The BullMQ worker (in queue.js) does the actual querying + Redis caching,
 * controlled at a safe concurrency rate.
 *
 * Resilience benefits:
 *  - If the server restarts mid-cron, BullMQ retains unprocessed jobs in Redis.
 *  - If MongoDB is slow, BullMQ queues the jobs until they can be processed.
 *  - Multiple server instances will NOT double-process (BullMQ guarantees this).
 */

import cron from "node-cron";
import Item from "../models/item.model.js";
import { resurfaceQueue } from "../services/queue.js";

// Items saved this many days ago will be resurfaced
const RESURFACE_DAYS = [7, 30, 90];

/**
 * Finds all users who have at least one item eligible for resurfacing
 * and enqueues one BullMQ job per user. The worker will handle the
 * individual per-user MongoDB query + Redis cache write.
 */
async function scheduleResurfaceJobs() {
  try {
    // Build the date windows we care about (7, 30, 90 days ago)
    const dateConditions = RESURFACE_DAYS.map((daysAgo) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      return { createdAt: { $gte: start, $lte: end }, daysAgo };
    });

    // Find all distinct users who have at least ONE item that qualifies.
    // We use .distinct() so we only fetch user IDs — not the full documents.
    // This keeps memory usage flat even at 1M users.
    const eligibleUsers = await Item.distinct("user", {
      extractionStatus: "resolved",
      $or: dateConditions.map(({ createdAt }) => ({ createdAt })),
    });

    if (eligibleUsers.length === 0) {
      console.log("[Resurfacer] No eligible items found for today.");
      return;
    }

    console.log(
      `[Resurfacer] Enqueueing resurface jobs for ${eligibleUsers.length} users.`
    );

    // Enqueue one lightweight job per user.
    // BullMQ will distribute these to the worker at a controlled concurrency rate.
    const jobs = eligibleUsers.map((userId) => ({
      name: "resurface-user",
      data: { userId: userId.toString(), resurfaceDays: RESURFACE_DAYS },
      opts: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 100 },
      },
    }));

    await resurfaceQueue.addBulk(jobs);

    console.log(`[Resurfacer] Successfully queued ${jobs.length} jobs.`);
  } catch (err) {
    console.error("[Resurfacer] Failed to schedule resurface jobs:", err.message);
  }
}

/**
 * Called once at server start.
 * Fires immediately so Redis cache is warm from the first second,
 * then schedules the daily 9 AM re-run.
 */
function startResurfacerCron() {
  // Fire immediately on boot so there's data in Redis right away
  scheduleResurfaceJobs();

  // Re-run every day at 9:00 AM (server time)
  cron.schedule("0 9 * * *", () => {
    scheduleResurfaceJobs();
  });

  console.log("[Resurfacer] Cron job scheduled for 09:00 AM daily.");
}

export { startResurfacerCron };
