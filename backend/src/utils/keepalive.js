import mongoose from "mongoose";
import axios from "axios";
import { pingIndex } from "./pinecone.js";

/**
 * Keep-alive for the free-tier services Relic depends on.
 *
 * Every provider below pauses or archives a project that goes quiet, and each
 * measures "quiet" as real data-layer activity — a bare HTTP request to the
 * platform does not reset the clock:
 *
 *   MongoDB Atlas — cluster paused after ~30 days without queries
 *   Supabase      — project paused after ~7 days without *database* activity
 *   Pinecone      — Starter-plan indexes archived after prolonged inactivity
 *
 * The uptime cron already hits /health every 13 minutes to keep Render awake,
 * so these ride along on that request instead of needing their own scheduler.
 * A few real queries per day is enough, hence the throttle.
 */

const PING_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6h — comfortably inside every window
const MONGO_PING_TIMEOUT_MS = 5000;

// In-memory, so a Render cold start resets it. Harmless: worst case is one
// extra ping per wake-up. The throttle is politeness, not correctness.
let lastDormantPing = 0;

/** Last outcome per service — surfaced on /health so failures are visible. */
const status = {
  supabase: "not yet pinged",
  pinecone: "not yet pinged",
};

/**
 * Real round-trip to MongoDB.
 *
 * `mongoose.connection.readyState` alone is an in-memory enum that performs no
 * I/O: it reports "connected" even when Atlas is unreachable, and it generates
 * no cluster activity to defer the auto-pause. It is still a useful cheap
 * pre-check, so it guards the actual command.
 */
export async function pingMongo() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error(`connection not ready (readyState=${mongoose.connection.readyState})`);
  }

  // Bounded explicitly: the driver's default serverSelectionTimeoutMS is 30s,
  // long enough for an unreachable Atlas to stall the health check past the
  // point where the uptime monitor gives up and reports the service as down.
  await Promise.race([
    mongoose.connection.db.admin().command({ ping: 1 }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("ping timed out after 5s")), MONGO_PING_TIMEOUT_MS),
    ),
  ]);
}

/**
 * PostgREST select against a one-row table. This is a genuine Postgres query,
 * unlike /auth/v1/health or a bare /rest/v1/, which both return 200 without
 * ever reaching the database — the usual reason keep-alive scripts fail
 * silently and the project pauses anyway.
 *
 * Requires a `public.keepalive` table readable by the anon role; see the
 * "Free-tier keep-alive" section of the backend README for the SQL.
 */
async function pingSupabase() {
  try {
    await axios.get(`${process.env.SUPABASE_URL}/rest/v1/keepalive`, {
      params: { select: "id", limit: 1 },
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
      timeout: 5000,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(
        "table public.keepalive not found — run the setup SQL, or the project will still pause",
      );
    }
    throw err;
  }
}

/** Runs one probe, recording the outcome instead of propagating it. */
async function run(name, probe) {
  try {
    await probe();
    status[name] = `ok @ ${new Date().toISOString()}`;
  } catch (err) {
    const detail = err.response?.data?.message || err.message;
    status[name] = `failed @ ${new Date().toISOString()}: ${detail}`;
    console.error(`[KEEPALIVE] ${name} ping failed — ${detail}`);
  }
}

/**
 * Fires the throttled Supabase and Pinecone probes.
 *
 * Intentionally synchronous and not awaited by callers: /health must stay fast,
 * and a third-party outage must never make Render's health check believe this
 * service is unhealthy. Failures are logged and exposed via getKeepaliveStatus.
 */
export function pingDormantServices() {
  if (Date.now() - lastDormantPing < PING_INTERVAL_MS) return;
  lastDormantPing = Date.now();

  run("supabase", pingSupabase);
  run("pinecone", pingIndex);
}

/** Snapshot of the last probe outcomes, for /health. */
export function getKeepaliveStatus() {
  return { ...status };
}
