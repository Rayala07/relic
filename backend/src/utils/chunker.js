/**
 * Custom text chunking algorithm.
 * Splits long text into smaller chunks for vector embeddings,
 * attempting to break at natural boundaries like paragraphs or sentences.
 * 
 * @param {string} text - The text to chunk
 * @param {number} size - Target chunk size in characters
 * @param {number} overlap - Overlap between chunks in characters
 * @returns {string[]} Array of text chunks
 */
export function chunkText(text, size = 1000, overlap = 150) {
  if (!text?.trim()) return [];
  const separators = ["\n\n", "\n", ". ", " "];
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + size, text.length);
    
    if (end < text.length) {
      for (const sep of separators) {
        const boundary = text.lastIndexOf(sep, end);
        // If we found a boundary that's past our start + overlap window, use it
        if (boundary > start + overlap) { 
          end = boundary + sep.length; 
          break; 
        }
      }
    }
    
    const chunk = text.slice(start, end).trim();
    // Only push chunks that actually have content (more than 5 words)
    if (chunk.split(/\s+/).length > 5) {
      chunks.push(chunk);
    }
    
    if (end >= text.length) {
      break;
    }
    
    // Advance start, keeping the overlap
    start = end - overlap;
  }
  
  return chunks;
}
