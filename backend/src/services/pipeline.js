import Item from "../models/item.model.js";
import { extract } from "./extract.js";
import { translateToEnglish } from "./translator.js";
import { chunkText } from "./chunker.js";
import { embedChunks } from "./embedder.js";
import { upsertChunks } from "./pinecone.js";

/**
 * Runs the full content processing pipeline for a saved item.
 * Triggered as a fire-and-forget job after the HTTP response is sent.
 * Failures at any stage are caught individually to avoid cascading errors.
 *
 * Stages:
 *   1. Fetch item from MongoDB
 *   2. Extract content from the URL
 *   3. Translate content to English (no-op if already English)
 *   4. Chunk + embed + upsert to Pinecone
 *
 * @param {string} itemId - MongoDB _id of the item to process
 */
async function extractionPipeline(itemId) {
  // ── Stage 1: Fetch item ────────────────────────────────────────────────────
  const item = await Item.findById(itemId);

  if (!item) {
    console.error(`Pipeline: item ${itemId} not found`);
    return;
  }

  // ── Stage 2: Extract content from URL ─────────────────────────────────────
  let translatedContent;

  try {
    const { content } = await extract(item.url);

    // User-provided title takes priority — only fall back to extracted title if user gave none
    const finalTitle = item.title || content.title;

    // ── Stage 3: Translate to English ──────────────────────────────────────
    // No-op if content is already English — franc detects and skips automatically
    translatedContent = await translateToEnglish(content);

    await Item.findByIdAndUpdate(itemId, {
      title: finalTitle,
      content: {
        title:            translatedContent.title,
        body:             translatedContent.body,
        author:           translatedContent.author,
        excerpt:          translatedContent.excerpt,
        originalLanguage: translatedContent.originalLanguage,
        wordCount:        translatedContent.body
                            ? translatedContent.body.split(" ").filter(Boolean).length
                            : 0,
      },
      extractionStatus: "resolved",
    });

    console.log(`Pipeline: extracted + translated "${translatedContent.title}" for item ${itemId}`);

  } catch (err) {
    await Item.findByIdAndUpdate(itemId, { extractionStatus: "rejected" });
    console.error(`Pipeline: extraction failed for item ${itemId} —`, err.message);
    return; // no point continuing to embedding if extraction failed
  }

  // ── Stage 4: Chunk → Embed → Upsert to Pinecone ────────────────────────────
  // Isolated in its own try/catch — a failure here does not affect extractionStatus.
  try {
    const chunks  = await chunkText(translatedContent.body);

    if (chunks.length === 0) {
      console.log(`Pipeline: no chunks for item ${itemId} — skipping embedding`);
      await Item.findByIdAndUpdate(itemId, { embeddingStatus: "resolved" });
      return;
    }

    // One Mistral API call for all chunks — batch input, batch output
    const vectors = await embedChunks(chunks);

    // Store chunk vectors in Pinecone with mongoId + userId for retrieval and user scoping
    await upsertChunks(itemId, item.user, chunks, vectors);

    await Item.findByIdAndUpdate(itemId, {
      "ai.embedding.model":       "mistral-embed",
      "ai.embedding.generatedAt": new Date(),
      embeddingStatus:            "resolved",
    });

    console.log(`Pipeline: upserted ${chunks.length} chunks for item ${itemId}`);

  } catch (err) {
    await Item.findByIdAndUpdate(itemId, { embeddingStatus: "failed" });
    console.error(`Pipeline: embedding failed for item ${itemId} —`, err.message);
  }
}

export default extractionPipeline;
