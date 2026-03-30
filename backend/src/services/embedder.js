import { pipeline } from "@xenova/transformers";
import { buildEmbeddingInput } from "../utils/buildEmbeddingInput.js";

/**
 * embedder.js
 *
 * Loads MiniLM locally and generates a 384-dimension vector from item content.
 *
 * WHY local instead of an API?
 *   No cost per call, no network latency to a third party, no API key needed.
 *   The model (~80MB) downloads once on first use and is cached to disk.
 *
 * HOW the singleton (embedder) pattern works:
 *   The model takes ~3-5 seconds to initialise. We load it once into the
 *   `embedder` variable and reuse it for every subsequent call.
 *   After warmup, each embedding takes ~50-200ms.
 */

let embedder = null; // loaded once, shared across all calls

/**
 * Lazily loads the MiniLM model. Returns the cached instance on repeat calls.
 * @returns {Promise<Function>} - The ready-to-use HuggingFace pipeline
 */
async function getEmbedder() {
  if (!embedder) {
    // 'feature-extraction' = turn text into a vector
    // 'Xenova/all-MiniLM-L6-v2' = the model to use (384 dimensions)
    // Downloads ~80MB on first run, reads from disk cache every run after
    embedder = await pipeline("feature-extraction", "Xenova/multi-qa-MiniLM-L6-cos-v1");
  }
  return embedder;
}

/**
 * Generates a 384-dimension embedding vector from item content.
 * Uses buildEmbeddingInput to cap input at ~500 words before sending to model.
 *
 * @param {Object} content - item.content object { title, body, author, excerpt }
 * @returns {Promise<{ vector: number[], model: string }>}
 */
export async function generateEmbedding(content) {
  // Build the structured, capped input string — never sends the full body
  const input = buildEmbeddingInput(content);

  if (!input.trim()) {
    throw new Error("No content to embed — all fields are empty");
  }

  const model = await getEmbedder();

  // Run the model locally
  // pooling: "mean"  → averages all token vectors into a single vector
  // normalize: true  → scales to [-1, 1], required for cosine similarity math
  const output = await model(input, {
    pooling: "mean",
    normalize: true,
  });

  return {
    vector: Array.from(output.data), // convert typed array → plain JS array for MongoDB
    model: "multi-qa-MiniLM-L6-cos-v1",
  };
}
