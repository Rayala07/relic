import { Pinecone } from "@pinecone-database/pinecone";

// Pinecone client and index — initialised once at module load.
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index(process.env.PINECONE_INDEX); // dimension=1024, metric=cosine, Dense

/**
 * Upserts all chunk vectors for a single document into Pinecone.
 * Each chunk gets a unique ID: "<itemId>_chunk<i>".
 * Metadata stores mongoId and userId for retrieval and user scoping.
 *
 * @param {string}     itemId  - MongoDB item _id (pointer back from Pinecone to Mongo)
 * @param {string}     userId  - Owner's ID — stored in metadata for search scoping
 * @param {string[]}   chunks  - Array of text chunks
 * @param {number[][]} vectors - Array of 1024-dim vectors, same order as chunks
 */
export async function upsertChunks(itemId, userId, chunks, vectors) {
  const records = chunks.map((chunkText, i) => ({
    id: `${itemId}_chunk${i}`,
    values: Array.from(vectors[i]),
    metadata: {
      mongoId:    itemId.toString(),
      userId:     userId.toString(),
      chunkIndex: i,
      preview:    chunkText.slice(0, 100),
    },
  }));

  // Pinecone SDK v7.x requires { records: [...] } — plain array and { vectors: [...] } both fail
  await index.upsert({ records });
}

/**
 * Deletes all Pinecone vectors belonging to a single item.
 * Uses list-by-prefix to find all chunk IDs, then deletes them by ID array.
 *
 * @param {string} itemId - MongoDB _id of the item whose chunks should be removed
 * @param {string} userId - Not used for deletion but kept for API consistency
 */
export async function deleteChunks(itemId) {
  const listed = await index.listPaginated({ prefix: `${itemId}_chunk` });
  const ids = (listed.vectors ?? []).map((v) => v.id);

  if (ids.length === 0) {
    console.log(`Pinecone: no chunks found for item ${itemId} — nothing to delete`);
    return;
  }

  await index.deleteMany({ ids });
  console.log(`Pinecone: deleted ${ids.length} chunks for item ${itemId}`);
}

/**
 * Queries Pinecone for the most semantically similar chunks to a query vector.
 * Scoped to a single user via metadata filter, then deduplicated by document.
 *
 * @param {number[]} queryVector - 1024-dim embedding of the search query
 * @param {string}   userId      - Filter results to this user only
 * @param {number}   topK        - Raw chunk matches to fetch before dedup (default 20)
 * @returns {Promise<Array<{ mongoId: string, score: number, chunkIndex: number, preview: string }>>}
 */
export async function searchChunks(queryVector, userId, topK = 20) {
  const results = await index.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
    filter: { userId: { $eq: userId.toString() } },
  });

  // Deduplicate: one doc may match via multiple chunks — keep only the best scoring one
  const seen = new Map();

  for (const match of results.matches) {
    const { mongoId } = match.metadata;
    if (!seen.has(mongoId) || seen.get(mongoId).score < match.score) {
      seen.set(mongoId, {
        mongoId,
        score:      match.score,
        chunkIndex: match.metadata.chunkIndex,
        preview:    match.metadata.preview,
      });
    }
  }

  return Array.from(seen.values()).sort((a, b) => b.score - a.score);
}
