import express from 'express';
import { getGraph } from '../controllers/graph.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/graph
// Returns full graph: nodes + edges
router.get('/', verifyToken, getGraph);

export default router;
