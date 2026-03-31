import { Mistral } from "@mistralai/mistralai";

// Mistral client — initialised once and reused across all calls.
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

/**
 * Embeds an array of text chunks in a single API call.
 * Used during indexing — all chunks for one document go in one request.
 *
 * @param {string[]} chunks - Array of text strings to embed
 * @returns {Promise<number[][]>} - Array of 1024-dim vectors, same order as input
 */
export async function embedChunks(chunks) {
  const response = await mistral.embeddings.create({
    model: "mistral-embed",
    inputs: chunks,
  });

  // response.data is ordered the same as the input array
  return response.data.map((item) => item.embedding);
}

/**
 * Embeds a single string. Used for embedding a search query at query time.
 *
 * @param {string} text - The search query string
 * @returns {Promise<number[]>} - Single 1024-dim vector
 */
export async function embedQuery(text) {
  const response = await mistral.embeddings.create({
    model: "mistral-embed",
    inputs: [text],
  });

  return response.data[0].embedding;
}
