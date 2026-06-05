import mongoose from "mongoose";

/**
 * Item Schema
 * Each item is scoped to a user via the `user` field.
 * Vectors are stored in Pinecone — only metadata is stored here.
 */
const itemSchema = new mongoose.Schema(
  {
    /** Human-readable label for the saved item */
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    /** The URL of the saved resource */
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },

    /** Content type auto-detected from the URL (webpage, pdf, youtube, tweet, image) */
    type: {
      type: String,
      default: "unknown",
      trim: true,
    },

    /**
     * Extracted and translated content — populated asynchronously by the pipeline.
     * All fields default to empty so the item is immediately usable after creation.
     */
    content: {
      title:            { type: String, default: "" }, // extracted page/video title
      body:             { type: String, default: "" }, // clean plain text, translated to English
      author:           { type: String, default: "" }, // byline, channel name, or tweet author
      excerpt:          { type: String, default: "" }, // first ~300 chars for UI previews
      originalLanguage: { type: String, default: "" }, // ISO 639-3 code — "eng" if already English
      wordCount:        { type: Number, default: 0  }, // word count of translated body
    },

    /** Set by the pipeline after URL extraction completes */
    extractionStatus: {
      type: String,
      enum: ["pending", "resolved", "rejected"],
      default: "pending",
    },

    /** Why extraction was rejected — only set when extractionStatus is "rejected" */
    extractionRejectedReason: {
      type: String,
      enum: ["geo_blocked", "bot_protected", "not_found", "fetch_error"],
    },

    /**
     * Embedding metadata — vectors themselves live in Pinecone, not here.
     * This block tracks which model was used and when.
     */
    ai: {
      embedding: {
        model:       { type: String, default: "" },
        generatedAt: { type: Date },
      },
      summary: { type: String, default: "" },
      tags:    { type: [String], default: [] },
    },

    /** Set by the pipeline after chunks are upserted to Pinecone */
    embeddingStatus: {
      type: String,
      enum: ["pending", "resolved", "failed"],
      default: "pending",
    },

    /** Owner of this item — sourced from Clerk JWT */
    user: {
      type: String,
      ref: "User",
      required: [true, "User reference is required"],
    },
  },
  {
    timestamps: true,
  }
);

// ─── Compound Indexes ─────────────────────────────────────────────────────────
//
// Each index is mapped to the exact query pattern it accelerates.
// Without indexes, MongoDB scans every document in the collection — O(N).
// With indexes, lookups become B-tree traversals — O(log N).
//
// Index 1: Library page — the most frequently hit query.
// item.controller.js → getItems → Item.find({ user }).sort({ createdAt: -1 })
// Composite on user + createdAt means MongoDB never touches documents
// outside the authenticated user's own items. Sort is free (index is ordered).
itemSchema.index({ user: 1, createdAt: -1 });

// Index 2: Tag-based filtering by type.
// item.controller.js → getItems (when type filter is added in future)
// autoOrganize.js → Item.find({ user, embeddingStatus, "ai.tags": { $in: [...] } })
// Allows efficient filtering of a user's items by processing state.
itemSchema.index({ user: 1, embeddingStatus: 1 });

// Index 3: Resurfacer cron job.
// resurfacer.js → Item.find({ extractionStatus: "resolved", createdAt: { $gte, $lte } })
// This runs every day at 9am scanning for items created on specific past dates.
// Without this index, it scans the entire collection globally — expensive at scale.
itemSchema.index({ extractionStatus: 1, createdAt: -1 });

// Index 4: Tag-based similarity lookup in autoOrganize.
// autoOrganize.js → Item.find({ user, embeddingStatus: "resolved", "ai.tags": { $in: [...] } })
// A multikey index on ai.tags lets MongoDB efficiently find items by tag intersection
// without scanning every document for a user.
itemSchema.index({ user: 1, "ai.tags": 1 });

// Index 5: Content type filter.
// Future-proofs the library filter by type (webpage, youtube, pdf, image).
// Covers queries like Item.find({ user, type: "youtube" })
itemSchema.index({ user: 1, type: 1 });

// ─────────────────────────────────────────────────────────────────────────────

const Item = mongoose.model("Item", itemSchema);

export default Item;
