/**
 * cosineSimilarity.js
 *
 * Computes how similar two vectors are — returns a score from 0.0 to 1.0.
 *   1.0 = identical meaning
 *   0.5 = loosely related
 *   0.0 = completely unrelated
 *
 * WHY cosine and not euclidean distance?
 *   Cosine measures the angle between vectors, not their magnitude.
 *   This makes it direction-sensitive — two docs about the same topic
 *   will point in the same direction even if one is long and one is short.
 *   That's exactly what we want for semantic search.
 *
 * NOTE: Because MiniLM is run with normalize: true, all vectors already
 * have unit length (magnitude = 1). This means dot product alone equals
 * cosine similarity — but we compute the full formula for correctness.
 *
 * @param {number[]} vecA - First embedding vector (384 numbers)
 * @param {number[]} vecB - Second embedding vector (384 numbers)
 * @returns {number} - Similarity score between 0.0 and 1.0
 */
export function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot   += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
