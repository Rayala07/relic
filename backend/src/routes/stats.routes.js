import { Router } from "express";
import { getStats } from "../controllers/stats.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/stats
// Returns three universal stats — now correctly scoped to the user
router.get("/", verifyToken, getStats);

export default router;
