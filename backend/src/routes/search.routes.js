import { Router } from "express";
import { searchItems } from "../controllers/search.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * GET /api/search?q=<query>
 *
 * Protected — verifyToken ensures req.userId is set so search is
 * always scoped to the authenticated user's items only.
 */
router.get("/", verifyToken, searchItems);

export default router;
