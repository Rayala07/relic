import Item from "../models/item.model.js";
import { generateEmbedding } from "./embedder.js";
import { cosineSimilarity } from "../utils/cosineSimilarity.js";

/**
 * search.service.js
 *
 * Core semantic search logic. The pipeline is always:
 *   1. Embed the query (same MiniLM model used for content)
 *   2. Fetch user's items that have been successfully embedded
 *   3. Score each item against the query vector
 *   4. Filter, sort, slice, clean up
 *
 * WHY compute similarity in JS and not MongoDB?
 *   MongoDB doesn't support cosine similarity natively unless you're on
 *   Atlas Vector Search (paid). For hundreds to a few thousand items,
 *   in-memory JS scoring is fast enough. When you hit performance limits,
 *   only this file changes — everything else (route, controller) stays.
 *
 * WHY filter by embeddingStatus: "resolved"?
 *   It's cleaner and more intentional than checking if the vector array
 *   exists or is non-empty. It's exactly what we built the status field for.
 *
 * @param {string} query    - The user's search query
 * @param {string} userId   - The authenticated user's ID (from req.userId)
 * @param {Object} options
 * @param {number} options.limit     - Max results to return (default: 10)
 * @param {number} options.threshold - Min similarity score to include (default: 0.3)
 * @returns {Promise<Array>} - Ranked list of matching items with scores
 */
export async function semanticSearch(query, userId, options = {}) {
  const { limit = 10, threshold = 0.05 } = options;

  // Step 1: Embed the query
  // Pass as "title" so buildEmbeddingInput produces: "Title: <query>"
  // This is a short, clean input — exactly right for a search query
  const { vector: queryVector } = await generateEmbedding({ title: query });

  // Step 2: Fetch only this user's embedded items
  // .lean() returns plain JS objects — faster and lighter than full Mongoose docs
  // We explicitly exclude content.body — no need to load large text fields for search
  const items = await Item.find(
    { user: userId, embeddingStatus: "resolved" },
    {
      title: 1,
      url: 1,
      type: 1,
      "content.title": 1,
      "content.excerpt": 1,
      "content.author": 1,
      "ai.embedding.vector": 1,
    }
  ).lean();

  // Step 3: Score every item, filter weak matches, sort best-first, take top N
  const results = items
    .map((item) => ({
      ...item,
      score: cosineSimilarity(queryVector, item.ai.embedding.vector),
    }))
    .filter((item) => item.score >= threshold) // drop unrelated results
    .sort((a, b) => b.score - a.score)         // best match first
    .slice(0, limit)                            // top N only

    // Step 4: Strip the raw vector — client never needs 384 numbers in the response
    .map(({ ai, ...item }) => ({
      ...item,
      score: parseFloat(item.score.toFixed(4)), // round to 4 decimal places
    }));

  return results;
}
