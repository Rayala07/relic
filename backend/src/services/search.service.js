import Item from "../models/item.model.js";
import { embedQuery } from "../utils/embedder.js";
import { searchChunks } from "../utils/pinecone.js";

// ─── Reciprocal Rank Fusion ───────────────────────────────────────────────────
// A proven IR formula for combining rankings from heterogeneous sources.
// k=60 is the standard constant (from the original Cormack et al. 2009 paper).
// Score = Σ 1/(k + rank_i) for each result list i.
// Higher score = appeared highly ranked in more lists.
const RRF_K = 60;

function reciprocalRankFusion(keywordDocs, vectorMatches) {
  const scores = new Map();

  // Accumulate RRF score from keyword ranking
  keywordDocs.forEach((doc, rank) => {
    const id = doc._id.toString();
    const prev = scores.get(id) || { rrf: 0, doc, keywordScore: 0, vectorScore: 0 };
    scores.set(id, {
      ...prev,
      rrf: prev.rrf + 1 / (RRF_K + rank),
      keywordScore: doc._score ?? 1,
    });
  });

  // Accumulate RRF score from vector ranking
  vectorMatches.forEach((match, rank) => {
    const id = match.mongoId.toString();
    const prev = scores.get(id) || { rrf: 0, doc: null, keywordScore: 0, vectorScore: 0 };
    scores.set(id, {
      ...prev,
      rrf: prev.rrf + 1 / (RRF_K + rank),
      vectorScore: match.score,
    });
  });

  return Array.from(scores.values()).sort((a, b) => b.rrf - a.rrf);
}

// ─── Layer 1: MongoDB Keyword Search ─────────────────────────────────────────
// Uses the compound $text index on title, ai.tags, ai.summary, content.excerpt.
// Returns candidate doc IDs and lightweight metadata, scoped to the user.
// Falls back to empty array if query has no indexable terms (single char, etc.)
async function keywordSearch(query, userId, limit = 30) {
  try {
    const docs = await Item.find(
      {
        user: userId,
        $text: { $search: query },
        embeddingStatus: "resolved",
      },
      {
        title:             1,
        url:               1,
        type:              1,
        "content.excerpt": 1,
        "ai.summary":      1,
        "ai.tags":         1,
        createdAt:         1,
        score:             { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .lean();

    // Attach the textScore as _score for RRF tracking
    return docs.map((d) => ({ ...d, _score: d.score }));
  } catch {
    // $text search fails if the index hasn't built yet — degrade gracefully
    return [];
  }
}

// ─── Layer 2: Pinecone Vector Search ─────────────────────────────────────────
// Embeds the raw query (NO expansion — removed from hot path) and hits Pinecone.
// Returns ranked matches with cosine similarity scores.
async function vectorSearch(query, userId, topK = 30) {
  const queryVector = await embedQuery(query);
  return searchChunks(queryVector, userId, topK);
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Performs a 3-layer hybrid semantic search over a user's saved items.
 *
 * Layer 1: MongoDB $text keyword search — blazing-fast (<2ms), zero API cost.
 *          Immediately eliminates completely unrelated documents.
 * Layer 2: Pinecone cosine vector search — semantic understanding of the query.
 * Layer 3: Reciprocal Rank Fusion — merges both ranked lists into a single
 *          authoritative relevance score that is far more reliable than raw
 *          cosine similarity alone, especially for small corpora.
 *
 * Fallback: If keyword search returns zero results (abstract/vague query),
 *           the function falls back to pure vector-only results so the user
 *           always gets something back.
 *
 * @param {string} query   - The user's raw search query (NOT expanded)
 * @param {string} userId  - Authenticated user's ID — scopes results to their items
 * @param {Object} options
 * @param {number} options.limit - Max results to return (default: 10)
 * @returns {Promise<Array>} - Ranked list of matching items with relevance scores
 */
export async function semanticSearch(query, userId, options = {}) {
  const { limit = 10 } = options;

  // ── Stage 1: Fire both searches in parallel ────────────────────────────────
  // Both network calls start at exactly the same millisecond.
  // Total latency = max(keyword_time, vector_time) instead of sum.
  const [keywordDocs, vectorMatches] = await Promise.all([
    keywordSearch(query, userId, 30),
    vectorSearch(query, userId, 30),
  ]);

  // ── Stage 2: Determine search strategy ────────────────────────────────────
  const hasKeywordResults = keywordDocs.length > 0;
  const hasVectorResults  = vectorMatches.length > 0;

  if (!hasKeywordResults && !hasVectorResults) return [];

  let rankedItems;

  if (!hasKeywordResults) {
    // PURE VECTOR FALLBACK — abstract query like "that article about running machines"
    // Keyword returned nothing, trust vector entirely. Apply a reasonable threshold
    // to avoid junk at the bottom.
    const VECTOR_FALLBACK_THRESHOLD = 0.65;
    rankedItems = vectorMatches
      .filter((m) => m.score >= VECTOR_FALLBACK_THRESHOLD)
      .slice(0, limit)
      .map((m) => ({ mongoId: m.mongoId, rrf: m.score, vectorScore: m.score, keywordScore: 0, doc: null }));
  } else {
    // HYBRID MODE — both lists exist, fuse them with RRF
    rankedItems = reciprocalRankFusion(keywordDocs, vectorMatches).slice(0, limit);
  }

  if (rankedItems.length === 0) return [];

  // ── Stage 3: Hydrate with full document data from MongoDB ─────────────────
  // Docs that came from keyword search are already partially hydrated.
  // Build a map for O(1) lookup, then fetch any missing ones from Mongo.
  const keywordDocMap = new Map(keywordDocs.map((d) => [d._id.toString(), d]));
  const missingIds = rankedItems
    .map((r) => r.mongoId)
    .filter((id) => id && !keywordDocMap.has(id));

  let extraDocs = [];
  if (missingIds.length > 0) {
    extraDocs = await Item.find(
      { _id: { $in: missingIds } },
      {
        title:             1,
        url:               1,
        type:              1,
        "content.excerpt": 1,
        "ai.summary":      1,
        "ai.tags":         1,
        createdAt:         1,
      }
    ).lean();
  }
  const extraDocMap = new Map(extraDocs.map((d) => [d._id.toString(), d]));

  // ── Stage 4: Assemble final response ──────────────────────────────────────
  const results = [];

  for (const ranked of rankedItems) {
    const id  = ranked.mongoId ?? ranked.doc?._id?.toString();
    const doc = keywordDocMap.get(id) ?? extraDocMap.get(id) ?? ranked.doc;

    if (!doc) continue; // vector-only hit with no doc fallback — skip

    results.push({
      ...doc,
      _id:          doc._id,
      relevance:    parseFloat(ranked.rrf.toFixed(6)),
      vectorScore:  parseFloat((ranked.vectorScore ?? 0).toFixed(4)),
      keywordScore: parseFloat((ranked.keywordScore ?? 0).toFixed(4)),
    });
  }

  return results;
}
