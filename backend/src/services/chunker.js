import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// 1000 chars ≈ 200 words — sits cleanly in the 200-300 word target range.
// 150 char overlap ≈ 30 words — enough to preserve sentence continuity across chunks.
// Separators are tried in order: paragraph break → line break → sentence → word.
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 150,
  separators: ["\n\n", "\n", ". ", " "],
});

/**
 * Splits body text into overlapping chunks suitable for embedding.
 * Uses RecursiveCharacterTextSplitter, which respects natural content boundaries
 * (paragraphs first, then sentences, then words — never splits mid-word).
 *
 * @param {string} text - The body text to split (should be English at this point)
 * @returns {Promise<string[]>} - Array of text chunks, each ~200 words
 */
export async function chunkText(text) {
  if (!text || text.trim().length === 0) return [];

  const chunks = await splitter.splitText(text);

  // Drop chunks too short to carry semantic meaning
  return chunks.filter((c) => c.trim().split(/\s+/).length > 15);
}
