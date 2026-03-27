import mongoose from "mongoose";

/**
 * Item Schema
 *
 * Each item is scoped to a single user via the `user` field (ObjectId ref).
 * Storing the user reference directly on the item is what allows us to
 * filter by owner on every query — preventing any cross-user data leakage.
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

    /** Category / content type (e.g. "article", "video", "repo") */
    type: {
      type: String,
      required: [true, "Type is required"],
      default: "unknown",
      trim: true,
    },

    /**
     * Extracted content — filled asynchronously by the extraction pipeline.
     * All fields default to empty so the item can be created instantly
     * before extraction runs in the background.
     */
    content: {
      title:     { type: String, default: "" }, // extracted title (may differ from item title)
      body:      { type: String, default: "" }, // clean plain text — the main extracted content
      author:    { type: String, default: "" }, // byline / channel name / tweet author
      excerpt:   { type: String, default: "" }, // first ~300 chars for UI previews
      wordCount: { type: Number, default: 0  }, // body.split(" ").length
    },

    extractionStatus: {
      type: String,
      enum: ["pending", "resolved", "rejected"],
      default: "pending",
    },

    /**
     * Reference to the owning User document.
     * This is the foundation of the ownership model — every DB query
     * for items MUST include this field to avoid returning other users' data.
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
  },
  {
    timestamps: true,
  },
);

const Item = mongoose.model("Item", itemSchema);

export default Item;
