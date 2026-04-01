import { semanticSearch } from "../services/search.service.js";

/**
 * Search Controller
 *
 * Handles GET /api/search?q=<query>
 *
 * Validates that q is present and non-empty, then delegates entirely
 * to the search service. Follows the same pattern as item.controller.js —
 * controller handles HTTP concerns, service handles business logic.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const searchItems = async (req, res) => {
  const query = req.query.q?.trim();

  if (!query) {
    return res.status(400).json({
      success: false,
      message: "Query is required",
    });
  }

  try {
    const results = await semanticSearch(query, req.userId, {
      limit: 10,
      threshold: 0.70,
    });

    return res.status(200).json({
      success: true,
      query,
      count: results.length,
      data: results,
    });
  } catch (err) {
    console.error("SearchItems Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
