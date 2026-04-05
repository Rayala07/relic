import { Router } from "express";
import Item from "../models/item.model.js";
import Collection from "../models/collection.model.js";

const router = Router();

// GET /api/stats
// Returns three universal stats — no auth required,
// no AI calls, no Pinecone, pure MongoDB only.
router.get("/", async (req, res) => {
  try {
    // Run all queries in parallel — never sequential
    const [allDoneItems, collectionsCount] = await Promise.all([
      Item.find(
        { extractionStatus: "resolved" },
        { createdAt: 1 }
      )
        .sort({ createdAt: 1 })
        .lean(),

      Collection.countDocuments({}),
    ]);

    // ── STAT 1: THINGS SAVED ──────────────────
    // Total number of successfully processed items
    const totalSaved = allDoneItems.length;

    // ── STAT 2: DAY STREAK ────────────────────
    // Consecutive days ending today (or yesterday
    // if user hasn't saved yet today) where at
    // least one item was saved
    const streak = calculateStreak(allDoneItems);

    // ── STAT 3: COLLECTIONS ───────────────────
    // Total collections created — both auto-organized
    // and manually created
    const collections = collectionsCount;

    res.json({
      success: true,
      data: {
        totalSaved,
        streak,
        collections,
      },
    });
  } catch (err) {
    console.error("stats route error:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

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

export default router;
