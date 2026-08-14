import Item from "../models/item.model.js";
import { extract } from "./extract.js";
import { translateToEnglish } from "./translator.js";
import { chunkText } from "./chunker.js";
import { embedChunks } from "./embedder.js";
import { upsertChunks } from "./pinecone.js";
import { generateSummary } from "./summariser.js";
import { generateTags } from "./tagger.js";
import { autoOrganizeItem } from "./autoOrganize.js";

// Fix #4 — Wraps any promise with a hard timeout so a hanging AI/network call
// never permanently blocks a BullMQ worker slot.
function withTimeout(promise, ms, label) {
  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`[Pipeline] ${label} timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timer]);
}

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
    const { content } = await withTimeout(extract(item.url), 25000, "extract");

    // Prefer the real extracted title (YouTube oEmbed, article heading, PDF metadata).
    // item.title is an auto-generated Groq placeholder — only use it as a fallback
    // when the extractor genuinely finds no title.
    const finalTitle = content.title || item.title;

    // ── Stage 3: Translate to English ──────────────────────────────────────
    // No-op if content is already English — franc detects and skips automatically
    translatedContent = await withTimeout(translateToEnglish(content), 30000, "translate");

    await Item.findByIdAndUpdate(itemId, {
      title: finalTitle,
      content: {
        title: translatedContent.title,
        body: translatedContent.body,
        author: translatedContent.author,
        excerpt: translatedContent.excerpt,
        originalLanguage: translatedContent.originalLanguage,
        wordCount: translatedContent.body
          ? translatedContent.body.split(" ").filter(Boolean).length
          : 0,
      },
      extractionStatus: "resolved",
    });
  } catch (err) {
    const status = err.response?.status;
    const reason =
      status === 451
        ? "geo_blocked"
        : status === 403
          ? "bot_protected"
          : status === 404
            ? "not_found"
            : "fetch_error";

    await Item.findByIdAndUpdate(itemId, {
      extractionStatus: "rejected",
      extractionRejectedReason: reason,
    });
    console.error(
      `Pipeline: extraction failed for item ${itemId} [${reason}] —`,
      err.message,
    );
    return;
  }

  // ── Stage 4: Chunk → Embed → Upsert to Pinecone ────────────────────────────
  // Isolated in its own try/catch — a failure here does not affect extractionStatus.
  try {
    const chunks = await chunkText(translatedContent.body);

    if (chunks.length === 0) {
      await Item.findByIdAndUpdate(itemId, { embeddingStatus: "resolved" });
      return;
    }

    // Fetch the user's existing tags to enforce taxonomy reuse
    const userTags = await Item.distinct("ai.tags", { user: item.user });

    // Run embed, summarise, and tag in parallel — no dependency between them.
    // Each has a hard timeout so a hanging AI call never freezes the worker slot.
    const [vectors, summary, tags] = await Promise.all([
      withTimeout(embedChunks(chunks),                        45000, "embed"),
      withTimeout(generateSummary(translatedContent.body),    20000, "summarise"),
      withTimeout(generateTags(translatedContent.body, userTags), 15000, "tag"),
    ]);

    // Guard: Mistral should return one vector per chunk — if not, something went
    // wrong in the embedding response and we should not attempt to upsert.
    if (!vectors || vectors.length !== chunks.length) {
      console.warn(
        `Pipeline: vector count mismatch for item ${itemId} — expected ${chunks.length}, got ${vectors?.length ?? 0}. Skipping upsert.`,
      );
      await Item.findByIdAndUpdate(itemId, { embeddingStatus: "failed" });
      return;
    }

    // Store chunk vectors in Pinecone — scoped to user's namespace
    await withTimeout(upsertChunks(itemId, item.user, chunks, vectors), 30000, "upsert");

    await Item.findByIdAndUpdate(itemId, {
      "ai.embedding.model": "mistral-embed",
      "ai.embedding.generatedAt": new Date(),
      "ai.summary": summary,
      "ai.tags": tags,
      embeddingStatus: "resolved",
    });


    // Fire-and-forget — auto-organize runs after done, never blocks the pipeline
    autoOrganizeItem(itemId, item.user).catch((err) =>
      console.error("autoOrganize failed silently:", err.message)
    );

  } catch (err) {
    await Item.findByIdAndUpdate(itemId, { embeddingStatus: "failed" });
    console.error(
      `Pipeline: embedding failed for item ${itemId} —`,
      err.message,
    );
  }
}

export default extractionPipeline;
