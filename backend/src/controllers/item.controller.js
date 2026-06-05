import Item from "../models/item.model.js";
import detectType from "../utils/detectType.js";
import { deleteChunks, findRelatedItems } from "../utils/pinecone.js";
import { pipelineQueue } from "../services/queue.js";

/**
 * Create Item Controller
 *
 * Reads title, url, and type from the request body.
 * Uses req.userId (set by verifyToken middleware) as the item owner.
 * This ensures items are always tied to the authenticated user —
 * a user can never create an item on behalf of another user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const createItem = async (req, res) => {
  try {
    const { title, url } = req.body;

    // url is the only truly required field — type is auto-detected from it.
    // title can be provided by the client (e.g. extension), otherwise it will
    // be populated by the extraction pipeline later in the background.
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "url is required",
      });
    }

    // Derive type automatically from the URL so the client never needs to send
    // it. This keeps type data consistent and removes a source of client error.
    const type = detectType(url);

    // Create the item — user field is sourced from the verified JWT payload,
    // not from client input, preventing ownership spoofing.
    const item = await Item.create({
      title: title?.trim() || "",
      url,
      type,
      user: req.userId,
    });

    res.status(201).json({ success: true, data: item });

    // Enqueue the pipeline as a background job via BullMQ.
    // The Worker in queue.js will pick this up and process it asynchronously.
    // This completely decouples AI processing latency from the HTTP response.
    await pipelineQueue.add("process-item", { itemId: item._id.toString() });

    return;
  } catch (error) {
    console.error("CreateItem Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get Items Controller
 *
 * Fetches all items belonging to the authenticated user only.
 * Filtering by `user: req.userId` is critical — without it the query would
 * return every item in the collection, leaking other users' data.
 * Results are sorted newest-first (-1) for a natural reading order.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Item.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select({
          title: 1,
          url: 1,
          type: 1,
          "content.title": 1,
          "content.excerpt": 1,
          "content.author": 1,
          "ai.summary": 1,
          "ai.tags": 1,
          createdAt: 1,
        })
        .lean(),
      Item.countDocuments({ user: req.userId }),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("GetItems Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get Item By ID Controller
 *
 * Fetches a single item by its Mongo ID.
 * After retrieving the item we perform an ownership check:
 *   item.user.toString() === req.userId
 * This is necessary because MongoDB IDs are ObjectIds, not plain strings,
 * so .toString() normalises the comparison. Returning 403 (not 404) on
 * ownership mismatch avoids confirming the existence of another user's item.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .select({ "ai.embedding": 0 })
      .lean();

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // Ownership check — prevents user A from reading user B's items by ID
    if (item.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorised to access this item",
      });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error("GetItemById Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete Item Controller
 *
 * Finds an item by ID, verifies ownership, then deletes it.
 * The two-step (find → ownership check → delete) approach is intentional:
 * using findByIdAndDelete directly would skip the ownership check and allow
 * any authenticated user to delete any item if they know its ID.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // Ownership check — prevents user A from deleting user B's items
    if (item.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorised to delete this item",
      });
    }

    await item.deleteOne();

    // Clean up Pinecone vectors — fire-and-forget so the HTTP response
    // isn't delayed. If this fails it only leaves orphaned vectors (no data leak).
    deleteChunks(item._id).catch((err) =>
      console.error(`Pinecone cleanup failed for item ${item._id}:`, err.message)
    );

    return res
      .status(200)
      .json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    console.error("DeleteItem Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get Related Items Controller
 *
 * Uses the item's own Pinecone chunk vectors to find semantically
 * similar items saved by the same user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getRelatedItems = async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[a-f\d]{24}$/i)) {
    return res.status(400).json({ success: false, message: "Invalid item id" });
  }

  try {
    // Confirm the item exists and belongs to this user
    const item = await Item.findOne({ _id: id, user: req.userId }, { _id: 1 }).lean();
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Find related items via Pinecone vector similarity
    const matches = await findRelatedItems(id, 5);

    if (matches.length === 0) {
      return res.json({ success: true, count: 0, data: [] });
    }

    // Fetch the actual docs from MongoDB — lightweight projection for a card UI
    const relatedIds = matches.map((m) => m.mongoId);
    const docs = await Item.find(
      { _id: { $in: relatedIds }, user: req.userId },
      {
        url:               1,
        title:             1,
        type:              1,
        "content.title":   1,
        "content.excerpt": 1,
        "content.author":  1,
        "ai.tags":         1,
        "ai.summary":      1,
      }
    ).lean();

    // Attach similarity score and sort best-first
    const scoreMap = Object.fromEntries(matches.map((m) => [m.mongoId, m.score]));
    const results = docs
      .map((doc) => ({
        ...doc,
        score: parseFloat(scoreMap[doc._id.toString()].toFixed(4)),
      }))
      .sort((a, b) => b.score - a.score);

    return res.json({ success: true, count: results.length, data: results });

  } catch (error) {
    console.error("GetRelatedItems Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
