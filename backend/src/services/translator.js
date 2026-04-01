import axios from "axios";
import { franc } from "franc-min";

// Google Translate's unofficial public REST endpoint — same one used by all the npm wrappers.
// No API key, no account. Uses `client=gtx` which is the free web tier.
// Already have axios installed, so zero new dependencies.
const TRANSLATE_API = "https://translate.googleapis.com/translate_a/single";

/**
 * Translates a single string to English via Google Translate's free endpoint.
 * `sl=auto` lets Google detect the source language server-side.
 *
 * Response is a nested array: data[0] is an array of sentence pairs.
 * Each pair is [translatedSentence, originalSentence], so we extract [0] from each.
 *
 * @param {string} text - Text to translate
 * @returns {Promise<string>} - Translated English text
 */
// Google's free endpoint rejects bodies over ~5000 chars with a 413.
// We split large text into safe-sized chunks, translate each, and rejoin.
const MAX_CHARS = 4500;

// Transient errors (502, 503, 429) from Google's free endpoint are common.
// Retry up to 3 times with exponential backoff: 1s → 2s → 4s.
const MAX_RETRIES  = 3;
const RETRY_CODES  = new Set([429, 500, 502, 503, 504]);

async function translateText(text, attempt = 1) {
  // POST puts the text in the request body — no URL length limit.
  // GET would encode multi-byte Unicode (Hindi, Arabic, CJK) into the URL,
  // hitting browser/server URL length limits even at modest character counts.
  const params = new URLSearchParams({
    client: "gtx",
    sl: "auto",
    tl: "en",
    dt: "t",
    q: text,
  });

  try {
    const { data } = await axios.post(TRANSLATE_API, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 10000,
    });

    // data[0] = array of [translatedChunk, originalChunk] pairs
    return data[0].map((item) => item[0]).join("");

  } catch (err) {
    const status = err.response?.status;

    if (attempt < MAX_RETRIES && RETRY_CODES.has(status)) {
      const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
      console.warn(`Translator: ${status} error — retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})`);
      await new Promise((r) => setTimeout(r, delay));
      return translateText(text, attempt + 1);
    }

    throw err; // permanent failure or retries exhausted
  }
}

/**
 * Splits text into chunks of at most MAX_CHARS characters, breaking at
 * sentence boundaries (". ") where possible to preserve readability.
 */
function splitIntoChunks(text) {
  if (text.length <= MAX_CHARS) return [text];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + MAX_CHARS;

    if (end < text.length) {
      // Break at the last sentence boundary within the window
      const boundary = text.lastIndexOf(". ", end);
      if (boundary > start) end = boundary + 2; // include the ". "
    }

    chunks.push(text.slice(start, end).trim());
    start = end;
  }

  return chunks;
}

/**
 * Translates text of any length by splitting into safe-sized chunks,
 * translating each sequentially (to avoid flooding the free endpoint),
 * then rejoining into a single string.
 */
async function translateLargeText(text) {
  const chunks = splitIntoChunks(text);
  const results = [];

  for (const chunk of chunks) {
    const translated = await translateText(chunk);
    results.push(translated);
  }

  return results.join(" ");
}

/**
 * Detects the language of extracted content and translates to English if needed.
 * Uses franc-min for detection (fast, no network call), then Google Translate for the actual translation.
 * Returns content unchanged if already English or language is undetectable.
 * Always sets `originalLanguage` on the returned object (ISO 639-3 code).
 *
 * @param {{ title: string, body: string, author: string, excerpt: string }} content
 * @returns {Promise<{ title: string, body: string, author: string, excerpt: string, originalLanguage: string }>}
 */
export async function translateToEnglish(content) {
  const { body, title, author } = content;

  // First 500 chars is enough for franc to reliably detect the language
  const sample = body?.slice(0, 500) || title || "";
  const langCode = franc(sample); // ISO 639-3: "eng", "fra", "hin", "und", etc.

  // "und" = undetermined — skip to avoid corrupting content with a bad translation
  if (langCode === "eng" || langCode === "und") {
    return { ...content, originalLanguage: langCode };
  }

  console.log(`Translator: detected "${langCode}", translating to English...`);

  // title and author are always short  — direct call is fine.
  // body can be a full webpage (50k+ chars) — use chunked translation.
  const [translatedTitle, translatedBody, translatedAuthor] = await Promise.all([
    title  ? translateText(title)      : Promise.resolve(""),
    body   ? translateLargeText(body)  : Promise.resolve(""),
    author ? translateText(author)     : Promise.resolve(""),
  ]);

  // Derive excerpt from the translated body — no extra API call needed.
  // Excerpt is just a short preview slice, so regenerating it from the
  // translated body is always more correct than translating the original.
  const translatedExcerpt = translatedBody
    ? translatedBody.replace(/\s+/g, " ").trim().slice(0, 300)
    : "";

  return {
    ...content,
    title:           translatedTitle  || content.title,
    body:            translatedBody   || content.body,
    author:          translatedAuthor || content.author,
    excerpt:         translatedExcerpt || content.excerpt,
    originalLanguage: langCode,
  };
}
