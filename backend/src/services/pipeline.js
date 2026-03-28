import Item from "../models/item.model.js";
import { extract } from "./extract.js";
import { generateEmbedding } from "./embedder.js";

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
    console.error(`Pipeline: extraction failed for item ${itemId} —`, err.message);
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
