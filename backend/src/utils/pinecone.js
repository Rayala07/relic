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
    return;
  }

  await index.deleteMany({ ids });
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

/**
 * Fetches all stored chunk vectors for a given item from Pinecone.
 * Uses list-by-prefix (same pattern as deleteChunks) then fetch by IDs.
 *
 * @param {string} mongoId - MongoDB _id of the item
 * @returns {Promise<number[][]>} - Array of 1024-dim vectors
 */
export async function fetchChunkVectors(mongoId) {
  const listResult = await index.listPaginated({ prefix: `${mongoId}_chunk` });
  const ids = (listResult.vectors ?? [])
    .map((v) => v.id)
    .filter(Boolean);

  if (ids.length === 0) return [];

  const fetchResult = await index.fetch({ ids });
  return Object.values(fetchResult.records ?? {})
    .map((r) => r.values)
    .filter((v) => v && v.length > 0);
}

/**
 * Finds items semantically related to the given item using its own chunk vectors.
 * Queries Pinecone once per chunk, deduplicates by document, excludes self.
 *
 * @param {string} mongoId    - MongoDB _id of the source item
 * @param {number} topK       - Max number of related items to return (default 5)
 * @param {number} threshold  - Minimum similarity score to include (default 0.75)
 * @returns {Promise<Array<{ mongoId: string, score: number }>>}
 */
export async function findRelatedItems(mongoId, topK = 5, threshold = 0.75) {
  // Step 1: get this item's own chunk vectors from Pinecone
  const vectors = await fetchChunkVectors(mongoId);
  if (vectors.length === 0) return [];

  // Pinecone Free Tier heavily throttles 50+ concurrent requests.
  // Instead of querying all chunks, we only query the first 3 chunks (introduction).
  // This reduces API calls by 90% and keeps response time under 1 second.
  const vectorsToSearch = vectors.slice(0, 3);

  // Step 2: search using each chunk vector in parallel, collect all matches
  const queryPromises = vectorsToSearch.map(vector => 
    index.query({
      vector,
      topK: 20,
      includeMetadata: true,
    })
  );
  
  const resultsArray = await Promise.all(queryPromises);
  const allMatches = resultsArray.flatMap(results => results.matches ?? []);

  // Step 3: deduplicate by mongoId, exclude the item itself — keep highest score per doc
  const seen = new Map();

  for (const match of allMatches) {
    const matchedId = match.metadata?.mongoId;
    if (!matchedId) continue;
    if (matchedId === mongoId.toString()) continue; // exclude self

    if (!seen.has(matchedId) || seen.get(matchedId).score < match.score) {
      seen.set(matchedId, { mongoId: matchedId, score: match.score });
    }
  }

  // Step 4: apply threshold, sort by score descending, return top N
  return Array.from(seen.values())
    .filter((m) => m.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Cheapest possible round-trip to the index — used only by the keep-alive.
 * Pinecone archives Starter-plan indexes that go unqueried, which would
 * silently break search until the index is rebuilt from its collection.
 *
 * @returns {Promise<object>} index stats (vector count, dimension, namespaces)
 */
export async function pingIndex() {
  return index.describeIndexStats();
}
