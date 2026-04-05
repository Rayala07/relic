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
        createdAt:         1,
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

/**
 * Get Collection Gaps Controller
 * Analyzes the tags of all items in a collection and suggests missing topics.
 */
import { Mistral } from "@mistralai/mistralai";
const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
});

export const getCollectionGaps = async (req, res) => {
  if (!req.params.id.match(/^[a-f\d]{24}$/i)) {
    return res.status(400).json({
      success: false,
      error: "Invalid collection id"
    });
  }

  try {
    const collection = await Collection
      .findOne({ _id: req.params.id, user: req.userId })
      .populate({
        path: "items",
        select: "ai.tags",
      })
      .lean();

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found"
      });
    }

    const allTags = [
      ...new Set(
        collection.items
          .flatMap(item => item.ai?.tags || [])
          .filter(tag =>
            typeof tag === "string" && tag.trim().length > 0
          )
          .map(tag => tag.toLowerCase().trim())
      )
    ];

    if (allTags.length < 2) {
      return res.json({
        success: true,
        data: {
          tags: allTags,
          suggestions: [],
          reason: "not_enough_tags"
        }
      });
    }

    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          role: "system",
          content: `You are a collection advisor.
Given a list of tags from someone's saved items
collection, suggest what related topics, items,
or areas they might want to add to make their
collection more complete.

STRICT RULES:
- Return ONLY a valid JSON array of strings
- 3 to 5 suggestions maximum
- Each suggestion: 2 to 5 words maximum
- Be specific and practical — not generic
- Match the domain of the tags exactly:
  if tags are about fashion → suggest fashion items
  if tags are about devops → suggest devops topics
  if tags are about cooking → suggest cooking topics
  if tags are about products → suggest related products
- Do NOT return tags already in the list
- Do NOT return generic suggestions like
  "more research" or "additional resources"
- Return ONLY the JSON array, no explanation,
  no markdown, no text outside the array

Example input tags: ["running", "marathon", "shoes"]
Example output: ["trail running shoes",
  "running nutrition", "injury prevention",
  "foam rolling", "running socks"]`,
        },
        {
          role: "user",
          content: `My collection has items tagged with: ${allTags.join(", ")}. What might I want to also save?`,
        },
      ],
      temperature: 0.4,
      maxTokens: 150,
    });

    const raw = response.choices[0]?.message?.content?.trim();

    if (!raw) {
      return res.json({
        success: true,
        data: { tags: allTags, suggestions: [] }
      });
    }

    let suggestions = [];
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed)) {
        suggestions = parsed
          .filter(s => typeof s === "string" && s.trim().length > 0)
          .map(s => s.trim())
          .slice(0, 5);
      }
    } catch (parseErr) {
      console.error("gaps parse error:", parseErr.message);
    }

    res.json({
      success: true,
      data: {
        tags: allTags,
        suggestions,
      }
    });

  } catch (err) {
    console.error("gaps endpoint error:", err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
