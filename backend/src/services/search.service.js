import Item from "../models/item.model.js";
import { embedQuery } from "../utils/embedder.js";
import { searchChunks } from "../utils/pinecone.js";
import { expandQuery } from "../utils/queryExpander.js";

/**
 * Performs semantic search over a user's saved items using Pinecone.
 * Embeds the query with Mistral, searches Pinecone for matching chunks,
 * deduplicates results by document, then fetches the full item data from MongoDB.
 *
 * @param {string} query   - The user's search query
 * @param {string} userId  - Authenticated user's ID — scopes results to their items only
 * @param {Object} options
 * @param {number} options.limit     - Max results to return (default: 10)
 * @param {number} options.threshold - Min similarity score to include (default: 0.3)
 * @returns {Promise<Array>} - Ranked list of matching items with similarity scores
 */
export async function semanticSearch(query, userId, options = {}) {
  const { limit = 10, threshold = 0.75 } = options;

  // Step 1: Expand the query with Groq, then embed the richer result
  const expandedQuery = await expandQuery(query);
  const queryVector = await embedQuery(expandedQuery);

  // Step 2: Query Pinecone — results are already user-scoped and deduplicated
  const matches = await searchChunks(queryVector, userId, 20);

  // Step 3: Filter by similarity threshold and take top N
  const filtered = matches
    .filter((m) => m.score >= threshold)
    .slice(0, limit);

  if (filtered.length === 0) return [];

  // Step 4: Fetch the matching item documents from MongoDB
  // Lightweight projection — we only need display fields, not the full body
  const ids = filtered.map((m) => m.mongoId);
  const docs = await Item.find(
    { _id: { $in: ids } },
    {
      title:            1,
      url:              1,
      type:             1,
      "content.title":  1,
      "content.excerpt": 1,
      "content.author": 1,
      "ai.summary":     1,
      "ai.tags":        1,
      createdAt:        1,
    }
  ).lean();

  // Step 5: Attach Pinecone scores to each doc and sort best-first
  const scoreMap = Object.fromEntries(filtered.map((m) => [m.mongoId, m.score]));

  return docs
    .map((doc) => ({
      ...doc,
      score: parseFloat(scoreMap[doc._id.toString()].toFixed(4)),
    }))
    .sort((a, b) => b.score - a.score);
}
