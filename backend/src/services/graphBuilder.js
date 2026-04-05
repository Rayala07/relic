import Item from '../models/item.model.js';
import { findRelatedItems } from '../utils/pinecone.js';

export async function buildGraph(userId) {
  // Step 1: fetch all done items — only fields needed
  // for the graph, never fetch ai.embedding
  const items = await Item.find(
    { 
      embeddingStatus: 'resolved',
      user: userId
    },
    {
      url: 1,
      type: 1,
      title: 1,
      'content.title': 1,
      'content.excerpt': 1,
      'ai.tags': 1,
      'ai.summary': 1,
      createdAt: 1,
    }
  ).lean();

  if (items.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Step 2: build nodes array
  // Each node is a clean object d3 can work with
  const nodes = items.map(item => ({
    id: item._id.toString(),
    title: item.title || item.content?.title || 'Untitled',
    type: item.type || 'webpage',
    tags: item.ai?.tags || [],
    excerpt: item.content?.excerpt || '',
    summary: item.ai?.summary || '',
    url: item.url,
    createdAt: item.createdAt,
  }));

  const nodeSet = new Set(nodes.map(n => n.id));

  // Step 3: build edges via Pinecone similarity
  // For each item, find its related items
  // An edge is a pair of connected node ids
  // Use a Set to avoid duplicate edges
  // Edge A→B and B→A are the same edge — deduplicate
  const edgeSet = new Set();
  const edges = [];

  // Process items in parallel with concurrency cap
  // to avoid hammering Pinecone with 100 simultaneous
  // requests — process in batches of 5
  const BATCH_SIZE = 5;
  const SIMILARITY_THRESHOLD = 0.78;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (item) => {
        try {
          const related = await findRelatedItems(
            item._id.toString(),
            5  // top 5 related per item
          );

          for (const match of related) {
            if (match.score < SIMILARITY_THRESHOLD) continue;

            const sourceId = item._id.toString();
            const targetId = match.mongoId;

            // FIX: Ensure BOTH target and source nodes are actually present in the final graph array!
            // If Pinecone returns a deleted/unresolved target item, silently ignore it to prevent UI mismatches.
            if (!nodeSet.has(targetId)) continue;

            const edgeKey = [sourceId, targetId]
              .sort()
              .join('--');

            if (!edgeSet.has(edgeKey)) {
              edgeSet.add(edgeKey);
              edges.push({
                id: edgeKey,
                source: sourceId,
                target: targetId,
                score: parseFloat(match.score.toFixed(4)),
              });
            }
          }
        } catch (err) {
          // If one item fails, log and continue —
          // do not abort the entire graph build
          console.error(
            `graphBuilder: failed for item ${item._id}:`,
            err.message
          );
        }
      })
    );
  }

  console.log(
    `graphBuilder: ${nodes.length} nodes,`,
    `${edges.length} edges`
  );

  return { nodes, edges };
}
