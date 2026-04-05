import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getCollections,
  getCollectionGaps,
  getCollectionById,
  createCollection,
  addItemToCollection,
  removeItemFromCollection,
  deleteCollection,
} from "../controllers/collection.controller.js";

const router = Router();

router.get("/", verifyToken, getCollections);

router.get("/:id/gaps", verifyToken, getCollectionGaps);

router.get("/:id", verifyToken, getCollectionById);
router.post("/", verifyToken, createCollection);
router.post("/:id/items", verifyToken, addItemToCollection);
router.delete("/:id/items/:itemId", verifyToken, removeItemFromCollection);
router.delete("/:id", verifyToken, deleteCollection);

export default router;
