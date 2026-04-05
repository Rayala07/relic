import express from 'express';
import { getGraph, invalidateGraphCache } from '../controllers/graph.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/graph
// Returns full graph: nodes + edges
router.get('/', verifyToken, getGraph);

// POST /api/graph/invalidate
// Called internally when a new item finishes pipeline
// so next GET rebuilds with fresh data
router.post('/invalidate', invalidateGraphCache);

export default router;
