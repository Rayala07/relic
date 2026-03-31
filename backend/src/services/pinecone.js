import { Pinecone } from "@pinecone-database/pinecone";

// Pinecone client and index — initialised once at module load.
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index(process.env.PINECONE_INDEX); // "relic-chunks", dimension=1024

/**
 * Upserts all chunk vectors for a single document into Pinecone.
 * Each chunk gets a unique ID: "<itemId>_chunk<i>".
 * Metadata stores the MongoDB reference and userId for retrieval and user scoping.
 *
 * @param {string} itemId  - MongoDB item _id (used as pointer back from Pinecone to Mongo)
 * @param {string} userId  - Authenticated user's ID (used to scope search results per user)
 * @param {string[]} chunks  - Array of text chunks
 * @param {number[][]} vectors - Array of 1024-dim vectors, same order as chunks
 */
export async function upsertChunks(itemId, userId, chunks, vectors) {
  const records = chunks.map((chunkText, i) => ({
    id: `${itemId}_chunk${i}`,
    values: vectors[i],
    metadata: {
      mongoId: itemId.toString(),
      userId: userId.toString(),  // scopes search — prevents cross-user result leakage
      chunkIndex: i,
      preview: chunkText.slice(0, 100), // short preview for debugging in Pinecone dashboard
    },
  }));

  await index.upsert({ records });
}

/**
 * Queries Pinecone for the most semantically similar chunks to a query vector.
 * Results are scoped to a single user via metadata filter, then deduplicated
 * so each MongoDB document appears at most once (highest-scoring chunk wins).
 *
 * @param {number[]} queryVector - 1024-dim embedding of the search query
 * @param {string} userId        - Filter results to this user only
 * @param {number} topK          - How many raw chunk matches to fetch before dedup (default 20)
 * @returns {Promise<Array<{ mongoId: string, score: number, chunkIndex: number, preview: string }>>}
 */
export async function searchChunks(queryVector, userId, topK = 20) {
  const results = await index.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
    filter: { userId: { $eq: userId.toString() } }, // user-scoped — critical for data isolation
  });

  // Deduplicate: one doc may match via multiple chunks — keep only the best scoring one
  const seen = new Map();

  for (const match of results.matches) {
    const { mongoId } = match.metadata;
    if (!seen.has(mongoId) || seen.get(mongoId).score < match.score) {
      seen.set(mongoId, {
        mongoId,
        score: match.score,
        chunkIndex: match.metadata.chunkIndex,
        preview: match.metadata.preview,
      });
    }
  }

  // Return best-first
  return Array.from(seen.values()).sort((a, b) => b.score - a.score);
}
