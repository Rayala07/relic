/**
 * reEmbed.js — One-time re-embedding script
 *
 * Run this when:
 *   - Items were embedded before the pipeline was fully working
 *   - buildEmbeddingInput.js was changed and existing vectors need refreshing
 *   - embeddingStatus is "failed" and you want to retry
 *
 * Usage (run from backend/ directory):
 *   node scripts/reEmbed.js
 *
 * What it does:
 *   Finds ALL items that have extracted content and re-generates their
 *   embedding vector using the current buildEmbeddingInput logic.
 *   Safe to run multiple times — it overwrites existing vectors.
 */

import mongoose from "mongoose";
import "dotenv/config";
import Item from "../src/models/item.model.js";
import { generateEmbedding } from "../src/services/embedder.js";

async function reEmbed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✓ Connected to MongoDB\n");

  // Target: all items where content was successfully extracted
  // This includes items with embeddingStatus "failed", "pending", or "resolved"
  // Safe to re-run — we always overwrite with the freshest vector
  const items = await Item.find({
    extractionStatus: "resolved",
    "content.body": { $exists: true, $ne: "" },
  });

  console.log(`Found ${items.length} item(s) to re-embed\n`);

  let success = 0;
  let failed = 0;

  for (const item of items) {
    try {
      const { vector, model } = await generateEmbedding(item.content);

      await Item.findByIdAndUpdate(item._id, {
        "ai.embedding.vector":      vector,
        "ai.embedding.model":       model,
        "ai.embedding.generatedAt": new Date(),
        embeddingStatus:            "resolved",
      });

      console.log(`  ✓ "${item.title}" (${vector.length} dims)`);
      success++;
    } catch (err) {
      await Item.findByIdAndUpdate(item._id, { embeddingStatus: "failed" });
      console.log(`  ✗ "${item.title}" — ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone — ${success} succeeded, ${failed} failed`);
  process.exit(0);
}

reEmbed().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
