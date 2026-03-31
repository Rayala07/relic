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
async function translateText(text) {
  const { data } = await axios.get(TRANSLATE_API, {
    params: {
      client: "gtx",
      sl: "auto",   // Google detects source language
      tl: "en",     // target: English
      dt: "t",      // return translation tokens
      q: text,
    },
  });

  // data[0] = array of [translatedChunk, originalChunk] pairs
  return data[0].map((item) => item[0]).join("");
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
  const { body, title } = content;

  // First 500 chars is enough for franc to reliably detect the language
  const sample = body?.slice(0, 500) || title || "";
  const langCode = franc(sample); // ISO 639-3: "eng", "fra", "hin", "und", etc.

  // "und" = undetermined — skip to avoid corrupting content with a bad translation
  if (langCode === "eng" || langCode === "und") {
    return { ...content, originalLanguage: langCode };
  }

  console.log(`Translator: detected "${langCode}", translating to English...`);

  // Translate title and body in parallel to save time
  const [translatedTitle, translatedBody] = await Promise.all([
    title ? translateText(title) : Promise.resolve(""),
    body  ? translateText(body)  : Promise.resolve(""),
  ]);

  return {
    ...content,
    title: translatedTitle || content.title,
    body:  translatedBody  || content.body,
    originalLanguage: langCode,
  };
}
