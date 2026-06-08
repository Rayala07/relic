import Collection from "../models/collection.model.js";
import Item from "../models/item.model.js";

// Minimum number of items that must share tags before an auto-collection is created
const MIN_ITEMS_FOR_COLLECTION = 2;

// Minimum number of tags two items must share to be considered related
const MIN_SHARED_TAGS = 1;

/**
 * Checks a finished item's tags and automatically adds it to an existing
 * auto-collection, or creates a new one if enough items share those tags.
 * Always fire-and-forget — never throws, never blocks the pipeline.
 *
 * @param {string} itemId  - MongoDB _id of the newly finished item
 * @param {string} userId  - Owner's user ID — collections are user-scoped
 */
export async function autoOrganizeItem(itemId, userId) {
  try {
    // Step 1: fetch the finished item and its tags
    const item = await Item.findById(itemId, { "ai.tags": 1 }).lean();

    if (!item || !item.ai?.tags || item.ai.tags.length === 0) {
      return;
    }

    const itemTags = item.ai.tags;


    // Step 2: check existing auto-collections owned by this user
    // Does this item share MIN_SHARED_TAGS+ tags with any of them?
    const existingAutoCollections = await Collection.find({
      user: userId,
      type: "auto",
    }).lean();

    let addedToCollection = false;

    for (const col of existingAutoCollections) {
      const sharedTags = col.sourceTags.filter((t) => itemTags.includes(t));

      if (sharedTags.length >= MIN_SHARED_TAGS) {
        await Collection.findByIdAndUpdate(col._id, {
          $addToSet: { items: itemId },
        });
        addedToCollection = true;
      }
    }

    if (addedToCollection) return;

    // Step 3: not added to any existing collection.
    // Check if other items owned by this user share MIN_SHARED_TAGS+ tags.
    // If yes — enough items exist to form a new auto-collection.
    const similarItems = await Item.find(
      {
        _id: { $ne: itemId },
        user: userId,
        embeddingStatus: "resolved",
        "ai.tags": { $in: itemTags },
      },
      { _id: 1, "ai.tags": 1 }
    ).lean();

    const qualifyingItems = similarItems.filter((other) => {
      const shared = (other.ai?.tags ?? []).filter((t) => itemTags.includes(t));
      return shared.length >= MIN_SHARED_TAGS;
    });

    if (qualifyingItems.length >= MIN_ITEMS_FOR_COLLECTION - 1) {
      // Find the most common shared tags to define and name the collection
      const tagFrequency = {};
      for (const other of qualifyingItems) {
        for (const tag of other.ai?.tags ?? []) {
          if (itemTags.includes(tag)) {
            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
          }
        }
      }

      // Sort by frequency, take top 3 as sourceTags
      const topSharedTags = Object.entries(tagFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag);

      const collectionName = topSharedTags
        .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
        .join(" + ");

      // Race condition guard — don't create a duplicate
      const alreadyExists = await Collection.findOne({
        user: userId,
        type: "auto",
        sourceTags: { $all: topSharedTags },
      });

      if (!alreadyExists) {
        const allItemIds = [itemId, ...qualifyingItems.map((i) => i._id)];

        await Collection.create({
          name: collectionName,
          type: "auto",
          sourceTags: topSharedTags,
          user: userId,
          items: allItemIds,
        });
      }
    } else {
    }
  } catch (err) {
    // Never crash the pipeline if auto-organize fails
    console.error("autoOrganize error:", err.message);
  }
}
