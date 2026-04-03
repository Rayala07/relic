import express from "express";
import { getResurfaced } from "../controllers/resurface.controller.js";

const router = express.Router();

// GET /api/resurface
router.get("/", getResurfaced);

export default router;
