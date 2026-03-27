import Item from "../models/item.model.js";
import detectType from "../utils/detectType.js";
import extractionPipeline from "../services/pipeline.js";

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

    // Fire-and-forget — pipeline runs in the background after the response
    // is already sent. User never waits for extraction to complete.
    extractionPipeline(item._id).catch(console.error);

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
    // Scope query strictly to the requesting user
    const items = await Item.find({ user: req.userId }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: items });
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
    const item = await Item.findById(req.params.id);

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
