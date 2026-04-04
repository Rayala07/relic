import Collection from "../models/collection.model.js";
import Item from "../models/item.model.js";

/**
 * Get Collections Controller
 * Returns all collections for the authenticated user, sorted newest-first.
 */
export const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.userId })
      .sort({ updatedAt: -1 })
      .lean();

    // Safely enforce accurate counts by intersecting actual existing items directly without complex aggregate casts natively
    const allItems = await Item.find({ user: req.userId }, { _id: 1 }).lean();
    const validItemIds = new Set(allItems.map(i => i._id.toString()));

    const result = collections.map((col) => {
      const validItems = (col.items || []).filter(id => validItemIds.has(id.toString()));
      return {
        ...col,
        items: validItems, // Purge orphaned items strictly
        itemCount: validItems.length,
      };
    });

    return res.json({ success: true, count: result.length, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get Collection By ID Controller
 * Returns one collection with full item documents populated.
 */
export const getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.userId,
    }).lean();

    if (!collection) {
      return res.status(404).json({ success: false, error: "Collection not found" });
    }

    const items = await Item.find(
      { _id: { $in: collection.items } },
      {
        url:               1,
        title:             1,
        type:              1,
        "content.title":   1,
        "content.excerpt": 1,
        "ai.tags":         1,
        "ai.summary":      1,
      }
    ).lean();

    return res.json({ success: true, data: { ...collection, items } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Create Collection Controller
 * Creates a manual collection owned by the authenticated user.
 */
export const createCollection = async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ success: false, error: "name is required" });
  }

  try {
    const collection = await Collection.create({
      name: name.trim(),
      description: description?.trim() || "",
      type: "manual",
      sourceTags: [],
      items: [],
      user: req.userId,
    });

    return res.status(201).json({ success: true, data: collection });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Add Item To Collection Controller
 * Adds an item to a collection — $addToSet prevents duplicates.
 * Verifies both collection and item ownership before updating.
 */
export const addItemToCollection = async (req, res) => {
  const { itemId } = req.body;

  if (!itemId) {
    return res.status(400).json({ success: false, error: "itemId is required" });
  }

  try {
    const [collection, item] = await Promise.all([
      Collection.findOne({ _id: req.params.id, user: req.userId }),
      Item.findOne({ _id: itemId, user: req.userId }, { _id: 1 }),
    ]);

    if (!collection) {
      return res.status(404).json({ success: false, error: "Collection not found" });
    }

    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }

    await Collection.findByIdAndUpdate(req.params.id, {
      $addToSet: { items: itemId },
    });

    return res.json({ success: true, message: "Item added to collection" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Remove Item From Collection Controller
 * Pulls an item from the collection's items array.
 */
export const removeItemFromCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!collection) {
      return res.status(404).json({ success: false, error: "Collection not found" });
    }

    await Collection.findByIdAndUpdate(req.params.id, {
      $pull: { items: req.params.itemId },
    });

    return res.json({ success: true, message: "Item removed from collection" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Delete Collection Controller
 * Deletes the entire collection document — ownership verified first.
 */
export const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!collection) {
      return res.status(404).json({ success: false, error: "Collection not found" });
    }

    await Collection.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Collection deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
