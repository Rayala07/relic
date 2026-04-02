import { Router } from "express";
import {
  createItem,
  getItems,
  getItemById,
  deleteItem,
  getRelatedItems,
} from "../controllers/item.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * All item routes are protected by verifyToken middleware.
 * This ensures req.userId is always available in the controllers
 * and that unauthenticated requests are rejected before reaching any logic.
 */

router.post("/create", verifyToken, createItem);
router.get("/get", verifyToken, getItems);

// /:id/related MUST be defined before /:id — Express matches top-to-bottom
// and /:id would greedily consume "related" as the id param if listed first.
router.get("/get/:id/related", verifyToken, getRelatedItems);
router.get("/get/:id", verifyToken, getItemById);
router.delete("/delete/:id", verifyToken, deleteItem);

export default router;
