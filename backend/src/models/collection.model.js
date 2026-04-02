import mongoose from "mongoose";

/**
 * Collection Schema
 * Groups items together — either manually by the user
 * or automatically by the system via tag clustering.
 */
const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Collection name is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // 'auto'   = created by the system via tag clustering
    // 'manual' = created by the user explicitly
    type: {
      type: String,
      enum: ["auto", "manual"],
      default: "manual",
    },

    // Tags that define this auto-collection — empty for manual collections
    sourceTags: {
      type: [String],
      default: [],
    },

    // Owner of this collection — scoped to user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },

    // References to items in this collection
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate auto-collections for the same tag set per user
collectionSchema.index({ user: 1, sourceTags: 1, type: 1 });

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
