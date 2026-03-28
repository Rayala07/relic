/**
 * buildEmbeddingInput.js
 *
 * Constructs a structured, size-capped string from extracted content
 * to use as input for the embedding model.
 *
 * WHY this exists as a separate utility:
 *   Embedding models don't need the full body — they need the *idea* of
 *   the document. Title + author + excerpt + first 500 words captures
 *   ~90% of the semantic meaning at 10% of the cost/time.
 *   This function is the single source of truth for what gets embedded,
 *   so if we ever change the strategy (e.g. 300 words vs 500), it
 *   only changes in one place.
 *
 * @param {Object} content - The extracted content object from item.content
 * @param {string} content.title
 * @param {string} content.body
 * @param {string} content.author
 * @param {string} content.excerpt
 * @returns {string} - Structured, capped string ready to send to MiniLM
 */
export function buildEmbeddingInput({ title = "", body = "", author = "", excerpt = "" } = {}) {
  // Cap the body at 500 words — enough to capture meaning, never blows up
  const first500Words = body
    ? body.split(" ").slice(0, 500).join(" ")
    : "";

  // Label each field so the model understands the context of each piece
  const parts = [
    title         ? `Title: ${title}`           : "",
    author        ? `Author: ${author}`         : "",
    excerpt       ? `Excerpt: ${excerpt}`       : "",
    first500Words ? `Content: ${first500Words}` : "",
  ];

  // Filter out empty parts and join — clean, structured embedding input
  return parts.filter(Boolean).join("\n");
}
