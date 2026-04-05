import { buildGraph } from '../services/graphBuilder.js';

export const getGraph = async (req, res) => {
  try {
    const userId = req.userId;
    const graph = await buildGraph(userId);

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
