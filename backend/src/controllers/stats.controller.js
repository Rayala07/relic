import Item from "../models/item.model.js";
import Collection from "../models/collection.model.js";
import redisClient from "../config/redis.js";

// Cache TTL in seconds.
// 60s means stats are at most 1 minute stale after a new item is saved.
// Short enough to feel live, long enough to eliminate repeated DB hammering.
const STATS_CACHE_TTL = 60;

// ── STREAK CALCULATION ────────────────────────
// Receives items sorted by createdAt ascending.
// Returns count of consecutive days with saves
// ending today — if today has no saves yet,
// the streak is not broken (user may save later).
function calculateStreak(items) {
  if (!items || items.length === 0) return 0;

  // Build a Set of unique calendar date strings
  // Format: "YYYY-M-D" — local timezone
  const savedDates = new Set(
    items.map((item) => {
      const d = new Date(item.createdAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  let streak = 0;
  const today = new Date();

  // Walk backwards from today — up to 365 days
  for (let i = 0; i < 365; i++) {
    const check = new Date(today);
    check.setDate(today.getDate() - i);
    const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`;

    if (savedDates.has(key)) {
      streak++;
    } else {
      // If today (i === 0) has no saves yet —
      // do not break, user may save later today.
      // If yesterday or before has no saves —
      // the streak is broken, stop counting.
      if (i === 0) continue;
      break;
    }
  }

  return streak;
}

export const getStats = async (req, res) => {
  // Cache key is scoped to the user — one cache entry per user.
  // Without user scoping, user A would see user B's cached stats.
  const cacheKey = `stats:${req.userId}`;

  try {
    // ── Step 1: Check Redis cache first ───────────────────────────────────────
    // If a fresh result exists, return it immediately — zero DB queries.
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached), cached: true });
    }

    // ── Step 2: Cache miss — run the DB queries ────────────────────────────────
    // Run all queries in parallel — never sequential
    const [allDoneItems, collectionsCount] = await Promise.all([
      Item.find(
        { user: req.userId, extractionStatus: "resolved" },
        { createdAt: 1 }
      )
        .sort({ createdAt: 1 })
        .lean(),

      Collection.countDocuments({ user: req.userId }),
    ]);

    // ── STAT 1: THINGS SAVED ──────────────────
    const totalSaved = allDoneItems.length;

    // ── STAT 2: DAY STREAK ────────────────────
    const streak = calculateStreak(allDoneItems);

    // ── STAT 3: COLLECTIONS ───────────────────
    const collections = collectionsCount;

    const data = { totalSaved, streak, collections };

    // ── Step 3: Store in Redis with TTL ───────────────────────────────────────
    // SETEX atomically sets the value and expiry in one command.
    // Even if Redis is down, the catch block falls through and we still respond.
    await redisClient.setex(cacheKey, STATS_CACHE_TTL, JSON.stringify(data));

    return res.json({ success: true, data });

  } catch (err) {
    console.error("stats route error:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
