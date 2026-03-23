import { Router } from "express";
import {
  createItem,
  getItems,
  getItemById,
  deleteItem,
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
router.get("/get/:id", verifyToken, getItemById);
router.delete("/delete/:id", verifyToken, deleteItem);

export default router;
