import { semanticSearch } from "../services/search.service.js";

/**
 * Search Controller
 *
 * Handles GET /api/search?q=<query>
 *
 * Validates that q is present and non-empty, then delegates entirely
 * to the search service. The service now uses a 3-layer hybrid engine
 * (keyword + vector + RRF) so no threshold is passed here — the RRF
 * score is the authoritative ranking signal.
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
