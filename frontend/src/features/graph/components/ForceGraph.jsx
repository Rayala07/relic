import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Node color by content type — monochromatic with subtle opacity differences
const TYPE_OPACITY = {
  webpage: 1,
  pdf:     0.85,
  youtube: 0.7,
  twitter: 0.55,
};

const NODE_RADIUS = {
  default: 6,
  connected: 9,
  hub: 13,
};

function getNodeRadius(node, edges) {
  const degree = edges.filter(
    e => e.source.id === node.id || e.target.id === node.id
      || e.source === node.id || e.target === node.id
  ).length;
  if (degree >= 6) return NODE_RADIUS.hub;
  if (degree >= 3) return NODE_RADIUS.connected;
  return NODE_RADIUS.default;
}

export default function ForceGraph({ nodes, edges, onNodeClick, onNodeHover }) {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);

  useEffect(() => {
    if (!nodes.length || !svgRef.current) return;

    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g');

    const zoom = d3.zoom()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    svg.call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(0.85)
        .translate(-width / 2, -height / 2)
    );

    const simNodes = nodes.map(n => ({ ...n }));
    const nodeById = new Map(simNodes.map(n => [n.id, n]));

    const simEdges = edges
      .map(e => ({
        ...e,
        source: nodeById.get(e.source) || e.source,
        target: nodeById.get(e.target) || e.target,
      }))
      .filter(e =>
        typeof e.source === 'object' &&
        typeof e.target === 'object'
      );

    const simulation = d3.forceSimulation(simNodes)
      .force('link',
        d3.forceLink(simEdges)
          .id(d => d.id)
          .distance(d => 80 + (1 - d.score) * 120)
          .strength(0.4)
      )
      .force('charge',
        d3.forceManyBody()
          .strength(-280)
          .distanceMax(400)
      )
      .force('center',
        d3.forceCenter(width / 2, height / 2)
          .strength(0.08)
      )
      .force('collision',
        d3.forceCollide()
          .radius(d => getNodeRadius(d, simEdges) + 12)
          .strength(0.7)
      );

    simulationRef.current = simulation;

    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(simEdges)
      .join('line')
      .attr('stroke', '#ffffff')
      .attr('stroke-opacity', d => 0.06 + d.score * 0.12)
      .attr('stroke-width', d => 0.5 + d.score * 0.8);

    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(simNodes)
      .join('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer');

    node.append('circle')
      .attr('class', 'node-ring')
      .attr('r', d => getNodeRadius(d, simEdges) + 4)
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.5)
      .attr('stroke-opacity', 0);

    node.append('circle')
      .attr('class', 'node-circle')
      .attr('r', d => getNodeRadius(d, simEdges))
      .attr('fill', '#ffffff')
      .attr('fill-opacity', d => TYPE_OPACITY[d.type] || TYPE_OPACITY.webpage)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.5)
      .attr('stroke-opacity', 0.3);

    node.append('text')
      .attr('class', 'node-label')
      .attr('dy', d => -(getNodeRadius(d, simEdges) + 6))
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('fill-opacity', 0)
      .attr('font-size', '11px')
      .attr('font-family', 'inherit')
      .attr('letter-spacing', '0.05em')
      .attr('pointer-events', 'none')
      .text(d => {
        const t = d.title || 'untitled';
        return t.length > 28 ? t.slice(0, 28) + '…' : t;
      });

    node
      .on('mouseenter', function(event, d) {
        if (onNodeHover) onNodeHover(d);

        const connectedIds = new Set();
        connectedIds.add(d.id);
        simEdges.forEach(e => {
          if (e.source.id === d.id) connectedIds.add(e.target.id);
          if (e.target.id === d.id) connectedIds.add(e.source.id);
        });

        node.selectAll('.node-circle')
          .attr('fill-opacity', n => connectedIds.has(n.id) ? (TYPE_OPACITY[n.type] || 1) : 0.08);

        link.attr('stroke-opacity', e => e.source.id === d.id || e.target.id === d.id ? 0.5 : 0.02);

        d3.select(this).select('.node-label').transition().duration(150).attr('fill-opacity', 1);
        d3.select(this).select('.node-ring').transition().duration(150).attr('stroke-opacity', 0.3);
      })
      .on('mouseleave', function() {
        if (onNodeHover) onNodeHover(null);

        node.selectAll('.node-circle')
          .attr('fill-opacity', n => TYPE_OPACITY[n.type] || TYPE_OPACITY.webpage);

        link.attr('stroke-opacity', e => 0.06 + e.score * 0.12);

        d3.select(this).select('.node-label').transition().duration(150).attr('fill-opacity', 0);
        d3.select(this).select('.node-ring').transition().duration(150).attr('stroke-opacity', 0);
      });

    const drag = d3.drag()
      .on('start', (event, d) => {
        if (!event.active) {
          simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) {
          simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    node.on('click', (event, d) => {
      if (event.defaultPrevented) return;
      if (onNodeClick) onNodeClick(d.id);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    node.selectAll('.node-circle')
      .attr('fill-opacity', 0)
      .transition()
      .delay((d, i) => i * 8)
      .duration(600)
      .attr('fill-opacity', d => TYPE_OPACITY[d.type] || TYPE_OPACITY.webpage);

    link
      .attr('stroke-opacity', 0)
      .transition()
      .delay(400)
      .duration(800)
      .attr('stroke-opacity', d => 0.06 + d.score * 0.12);

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      svg.attr('width', w).attr('height', h);
      simulation.force('center',
        d3.forceCenter(w / 2, h / 2).strength(0.08)
      );
      simulation.alpha(0.3).restart();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      simulation.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, [nodes, edges]);

  return (
    <svg
      ref={svgRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
