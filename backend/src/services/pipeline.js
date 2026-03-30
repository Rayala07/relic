import Item from "../models/item.model.js";
import { extract } from "./extract.js";
import { generateEmbedding } from "./embedder.js";
import { translateToEnglish } from "./ai.service.js";

/**
 * Returns true if text is likely non-English.
 * Checks if more than 15% of characters are outside standard ASCII range.
 * Catches Hindi, Arabic, Chinese, Japanese, Korean, etc.
 * Latin-script languages (French, German, Spanish) are close enough to
 * English in the embedding space that they don't need translation.
 *
 * @param {string} text
 * @returns {boolean}
 */
function isNonEnglish(text) {
  if (!text || text.length < 100) return false;
  const nonAsciiCount = [...text].filter((c) => c.charCodeAt(0) > 127).length;
  return nonAsciiCount / text.length > 0.15;
}

/**
 * pipeline.js — The Orchestrator
 *
 * Background job that runs AFTER the HTTP response is sent (fire-and-forget).
 * Never awaited by the controller — errors are caught and logged here.
 *
 * 4 stages, each independent:
 *   Stage 1 — Fetch item from DB
 *   Stage 2 — Extract content from URL (webpage/pdf/youtube/tweet/image)
 *   Stage 3 — Save extracted content → extractionStatus: "resolved"
 *   Stage 4 — Generate embedding   → embeddingStatus:  "resolved"
 *
 * Stage isolation — if Stage 4 fails, Stage 3 data is already safely saved.
 * extractionStatus stays "resolved" — only embeddingStatus turns "failed".
 * This prevents a MiniLM crash from making an item appear completely broken.
 */
async function extractionPipeline(itemId) {
  // ── Stage 1: Fetch item ────────────────────────────────────────────────────
  const item = await Item.findById(itemId);

  if (!item) {
    console.error(`Pipeline: item ${itemId} not found`);
    return;
  }

  // ── Stage 2 & 3: Extract + save content ───────────────────────────────────
  let content;

  try {
    const result = await extract(item.url);
    content = result.content;

    // Stage 3a: Translate if non-English
    // Check the body — if it contains mostly non-ASCII characters it's
    // a non-Latin script (Hindi, Arabic, Chinese...). Translate before saving
    // so all downstream features (search, embeddings) work in English.
    if (isNonEnglish(content.body)) {
      console.log(`Pipeline: translating non-English content for item ${itemId}`);
      const translated = await translateToEnglish(content);
      content = { ...content, ...translated };
    }

    // User title takes priority — only use extracted title if user gave none
    const finalTitle = item.title || content.title;

    await Item.findByIdAndUpdate(itemId, {
      title: finalTitle,
      content: {
        title:     content.title,
        body:      content.body,
        author:    content.author,
        excerpt:   content.excerpt,
        wordCount: content.body ? content.body.split(" ").filter(Boolean).length : 0,
      },
      extractionStatus: "resolved",
    });

    console.log(`Pipeline: extracted "${content.title}" for item ${itemId}`);

  } catch (err) {
    await Item.findByIdAndUpdate(itemId, { extractionStatus: "rejected" });
    console.error(`Pipeline: extraction failed for item ${itemId} —`, err.stack || err.message);
    return; // no point continuing to embedding if extraction failed
  }

  // ── Stage 4: Generate embedding ────────────────────────────────────────────
  // Runs independently — a failure here does NOT affect extractionStatus.
  try {
    const { vector, model } = await generateEmbedding(content);

    await Item.findByIdAndUpdate(itemId, {
      "ai.embedding.vector":      vector,
      "ai.embedding.model":       model,
      "ai.embedding.generatedAt": new Date(),
      embeddingStatus:            "resolved",
    });

    console.log(`Pipeline: embedded item ${itemId} (${vector.length} dims)`);

  } catch (err) {
    await Item.findByIdAndUpdate(itemId, { embeddingStatus: "failed" });
    console.error(`Pipeline: embedding failed for item ${itemId} —`, err.message);
  }
}

export default extractionPipeline;
