import Item from "../models/item.model.js";
import detectType from "../utils/detectType.js";
import { deleteChunks, findRelatedItems } from "../utils/pinecone.js";
import { pipelineQueue } from "../services/queue.js";
import Groq from "groq-sdk";

// ── Auto-Title Generator ──────────────────────────────────────────────────────
// Called when the user saves a link without providing a title.
// Uses Groq (llama-3.1-8b-instant) — extremely fast LPU inference,
// far more reliable under traffic than Gemini.
let _groqClient = null;
function getGroqClient() {
  if (!_groqClient) {
    _groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groqClient;
}

async function generateTitleFromUrl(url) {
  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a content titling assistant. Generate extremely short, clear titles. Always respond with ONLY the title text — no quotes, no punctuation at the end, no explanation.",
        },
        {
          role: "user",
          content: `Generate a 3 to 5 word title for this saved URL: ${url}`,
        },
      ],
      max_tokens: 20,
      temperature: 0.3,
    });

    const title = completion.choices[0]?.message?.content?.trim();
    return title || url;
  } catch (err) {
    console.warn("[AutoTitle] Groq title generation failed, using URL as fallback:", err.message);
    return url; // safe fallback — never block the save
  }
}

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
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "url is required",
      });
    }

    // Fix #16 — Duplicate URL guard: return 409 if this user already saved this URL.
    const existing = await Item.findOne({ user: req.userId, url }, { _id: 1 }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: "Already saved", data: existing });
    }

    // If the user didn't provide a title, generate one via LLM.
    // This runs synchronously before saving so the item is immediately
    // usable with a meaningful title — even before the pipeline runs.
    const trimmedTitle = title?.trim();
    const finalTitle = trimmedTitle
      ? trimmedTitle
      : await generateTitleFromUrl(url);

    // Derive type automatically from the URL.
    const type = detectType(url);

    // Create the item — user field is sourced from the verified JWT payload.
    const item = await Item.create({
      title: finalTitle,
      url,
      type,
      user: req.userId,
    });

    res.status(201).json({ success: true, data: item });

    // Enqueue the pipeline as a background job via BullMQ.
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
    // Fix #8 — Single scoped query: ownership enforced at the DB level,
    // not via a JS comparison after fetching. Avoids two round-trips.
    const item = await Item.findOne({ _id: req.params.id, user: req.userId })
      .select({ "ai.embedding": 0 })
      .lean();

    if (!item) {
      // Returns 404 for both "not found" and "wrong owner" — intentional.
      // This avoids confirming the existence of another user's item.
      return res.status(404).json({ success: false, message: "Item not found" });
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
    // Fix #8 — Single scoped findOne instead of findById + JS ownership check.
    const item = await Item.findOne({ _id: req.params.id, user: req.userId });

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
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
