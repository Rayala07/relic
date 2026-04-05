import { buildGraph } from '../services/graphBuilder.js';

// Simple in-memory cache — graph is expensive to build
// Cache for 5 minutes, invalidated on new item save
let cachedGraph = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

function isCacheValid() {
  if (!cachedGraph || !cacheTimestamp) return false;
  return Date.now() - cacheTimestamp < CACHE_TTL;
}

export function invalidateCache() {
  cachedGraph = null;
  cacheTimestamp = null;
}

export const getGraph = async (req, res) => {
  try {
    // Serve from cache if valid
    if (isCacheValid()) {
      console.log('graph: serving from cache');
      return res.json({
        success: true,
        cached: true,
        nodeCount: cachedGraph.nodes.length,
        edgeCount: cachedGraph.edges.length,
        data: cachedGraph,
      });
    }

    console.log('graph: building fresh graph...');
    const graph = await buildGraph();

    // Cache the result
    cachedGraph = graph;
    cacheTimestamp = Date.now();

    res.json({
      success: true,
      cached: false,
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      data: graph,
    });
  } catch (err) {
    console.error('graph route error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// POST /api/graph/invalidate
// Called internally when a new item finishes pipeline
// so next GET rebuilds with fresh data
export const invalidateGraphCache = (req, res) => {
  invalidateCache();
  console.log('graph: cache invalidated');
  res.json({ success: true, message: 'cache cleared' });
};
