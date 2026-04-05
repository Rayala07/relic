import express from "express";
import { getResurfaced } from "../controllers/resurface.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/resurface
router.get("/", verifyToken, getResurfaced);

export default router;
