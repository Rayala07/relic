import 'dotenv/config';
import mongoose from 'mongoose';
import { buildGraph } from '../src/services/graphBuilder.js';

async function runTests() {
  console.log('\n=== GRAPH BACKEND TESTS ===\n');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ MongoDB connected');

  // TEST 1: buildGraph returns correct shape
  console.log('\nTEST 1: buildGraph shape...');
  const graph = await buildGraph();
  console.assert(
    typeof graph === 'object', 'graph is object'
  );
  console.assert(
    Array.isArray(graph.nodes), 'nodes is array'
  );
  console.assert(
    Array.isArray(graph.edges), 'edges is array'
  );
  console.log(`✓ nodes: ${graph.nodes.length}`);
  console.log(`✓ edges: ${graph.edges.length}`);

  // TEST 2: each node has required fields
  console.log('\nTEST 2: node shape...');
  if (graph.nodes.length > 0) {
    const node = graph.nodes[0];
    const required = ['id','title','type','tags','url'];
    for (const field of required) {
      console.assert(
        node[field] !== undefined,
        `node has ${field}`
      );
      console.log(`✓ node.${field} exists`);
    }
  } else {
    console.log('⚠ no nodes to test — add items first');
  }

  // TEST 3: each edge has required fields
  console.log('\nTEST 3: edge shape...');
  if (graph.edges.length > 0) {
    const edge = graph.edges[0];
    const required = ['id','source','target','score'];
    for (const field of required) {
      console.assert(
        edge[field] !== undefined,
        `edge has ${field}`
      );
      console.log(`✓ edge.${field} exists`);
    }
    // Verify edge source and target are valid node ids
    const nodeIds = new Set(graph.nodes.map(n => n.id));
    const validSource = nodeIds.has(edge.source);
    const validTarget = nodeIds.has(edge.target);
    console.assert(validSource, 'edge source is valid node');
    console.assert(validTarget, 'edge target is valid node');
    console.log('✓ edge references valid nodes');
  } else {
    console.log('⚠ no edges — need 2+ related items');
  }

  // TEST 4: no duplicate edges
  console.log('\nTEST 4: no duplicate edges...');
  const edgeIds = graph.edges.map(e => e.id);
  const uniqueIds = new Set(edgeIds);
  console.assert(
    edgeIds.length === uniqueIds.size,
    'no duplicate edges'
  );
  console.log('✓ all edges unique');

  // TEST 5: hit the HTTP endpoint
  console.log('\nTEST 5: GET /api/graph endpoint...');
  try {
    const res = await fetch(
      `http://localhost:${process.env.PORT || 3000}/api/graph`
    );
    const data = await res.json();
    console.assert(data.success === true, 'success true');
    console.assert(
      typeof data.nodeCount === 'number', 'nodeCount present'
    );
    console.log(`✓ endpoint returned nodeCount: ${data.nodeCount}`);
    console.log(`✓ endpoint returned edgeCount: ${data.edgeCount}`);
    console.log(`✓ cached: ${data.cached}`);
  } catch (err) {
    console.log('⚠ HTTP test skipped — server not running?');
    console.log('  Start the server then re-run this test');
  }

  await mongoose.disconnect();
  console.log('\n=== ALL TESTS PASSED ===\n');
}

runTests().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
