import Item from "../models/item.model.js";
import { extract } from "./extract.js";

/**
 * pipeline.js — The Orchestrator
 *
 * This is the background job that runs AFTER the HTTP response is sent.
 * It is always called with `.catch(console.error)` and never awaited by
 * the controller — this is the "fire-and-forget" pattern.
 *
 * Pipeline stages:
 *   1. Fetch the item from DB to get its URL
 *   2. Call extract(url) → detect type → run matching extractor
 *   3. Write the result back to item.content + set status "resolved"
 *   4. On any error → set status "rejected" so the item isn't left as "pending"
 *
 * WHY two separate findByIdAndUpdate calls instead of one?
 * Because extract() can take 2–10 seconds. If the server crashes mid-extraction,
 * the status would remain "pending" which is correct — it can be retried.
 * Only after a successful extraction do we write content + "resolved" together.
 */
async function extractionPipeline(itemId) {
  // Stage 1: Get the item — we need its URL to run extraction
  const item = await Item.findById(itemId);

  if (!item) {
    console.error(`Pipeline: item ${itemId} not found`);
    return;
  }

  try {
    // Stage 2: Run extraction via the router
    // extract() handles: detect type → pick extractor → return { type, content }
    const { content } = await extract(item.url);

    // Stage 3: Persist extracted content and mark as resolved
    // If the user provided a title, we don't overwrite it. If they didn't,
    // we take the title the extractor found.
    const finalTitle = item.title || content.title;

    // Update the main document title and populate the content subdocument.
    await Item.findByIdAndUpdate(itemId, {
      title: finalTitle,
      content: {
        title:     content.title, // Keep the raw extracted one here just in case
        body:      content.body,
        author:    content.author,
        excerpt:   content.excerpt,
        wordCount: content.body
          ? content.body.split(" ").filter(Boolean).length
          : 0,
      },
      extractionStatus: "resolved",
    });

    console.log(`Pipeline: extracted "${content.title}" for item ${itemId}`);

  } catch (err) {
    // Stage 4: Mark as rejected so the UI can show a failed state
    // We log the error but never throw — this runs in the background,
    // there is nobody to receive an uncaught error.
    await Item.findByIdAndUpdate(itemId, {
      extractionStatus: "rejected",
    });

    console.error(`Pipeline: extraction failed for item ${itemId} —`, err.message);
  }
}

export default extractionPipeline;
