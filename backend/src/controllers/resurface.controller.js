import { getResurfacedItems } from "../utils/resurfacer.js";

/**
 * Resurface Controller
 *
 * Handles GET /api/resurface
 *
 * Reads from the in-memory store populated by the daily cron job.
 * No DB call is made at read time — the response is instant.
 * Each item is labelled with a human-readable "X days ago" string
 * for the frontend "you saved this X days ago" banner.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getResurfaced = (req, res) => {
  try {
    const allItems = getResurfacedItems();

    // STRICTLY FILTER BY req.userId
    // The memory store holds global items across all users
    const items = allItems.filter(i => i.item.user?.toString() === req.userId);

    // Format the response — label each item with
    // a human-readable string for the frontend
    const data = items.map(({ item, daysAgo }) => ({
      ...item,
      daysAgo,
      resurfaceLabel: daysAgo === 1
        ? "yesterday"
        : `${daysAgo} days ago`,
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
