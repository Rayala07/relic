import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getCollections,
  getCollectionById,
  createCollection,
  addItemToCollection,
  removeItemFromCollection,
  deleteCollection,
} from "../controllers/collection.controller.js";

const router = Router();

/**
 * All collection routes are protected by verifyToken.
 * Collections are strictly scoped to req.userId — a user
 * can never read or modify another user's collections.
 *
 * NOTE: /:id/items/:itemId must be defined BEFORE /:id to
 * avoid Express consuming "items" as the itemId param.
 */

router.get("/", verifyToken, getCollections);
router.get("/:id", verifyToken, getCollectionById);
router.post("/", verifyToken, createCollection);
router.post("/:id/items", verifyToken, addItemToCollection);
router.delete("/:id/items/:itemId", verifyToken, removeItemFromCollection);
router.delete("/:id", verifyToken, deleteCollection);

export default router;
