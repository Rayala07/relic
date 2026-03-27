import detectType from "../utils/detectType.js";
import {
  extractWebpage,
  extractPdf,
  extractYoutube,
  extractTwitter,
  extractImage,
} from "./extractors.js";

/**
 * extract.js — The Router
 *
 * This file's only job is to look at a URL, decide what kind it is,
 * and hand it off to the correct extractor function.
 *
 * The lookup table approach (extractors object) is intentional:
 *   - Adding a new type only requires adding one line to the table
 *   - No if/else chains to maintain
 *   - Each extractor is independent — one failing doesn't affect others
 *
 * "repo" maps to extractWebpage because GitHub pages are standard HTML.
 * "image" maps to null — images have no text, we return empty content.
 */

// ── Lookup table: type string → extractor function ───────────────────────────
const extractors = {
  webpage: extractWebpage,
  repo:    extractWebpage,   // GitHub repos are webpages — same extractor
  pdf:     extractPdf,
  youtube: extractYoutube,
  tweet:   extractTwitter,
  image:   extractImage,     // Gemini 1.5 Flash vision → description + tags
};

/**
 * Detects the URL type and routes it to the correct extractor.
 * Always returns: { type: string, content: { title, body, author, excerpt } }
 *
 * @param {string} url - The URL to extract content from
 * @returns {{ type: string, content: { title: string, body: string, author: string, excerpt: string } }}
 */
async function extract(url) {
  const type = detectType(url);    // "webpage" | "pdf" | "youtube" | "tweet" | "repo" | "image"
  const fn   = extractors[type];   // pick the matching extractor function

  // Images have no extractable text — return empty content without erroring
  if (!fn) {
    return {
      type,
      content: { title: "", body: "", author: "", excerpt: "" },
    };
  }

  const content = await fn(url);   // run the extractor → { title, body, author, excerpt }
  return { type, content };
}

export { extract };
