/**
 * landing/components/KnowledgeGraphSection.tsx
 *
 * "Your knowledge becomes a network."
 *
 * This section features a large, animated SVG knowledge graph — the signature
 * visual of Relic's core capability. Nodes represent saved topics, and edges
 * represent the semantic connections that Relic discovers automatically.
 *
 * Visual design:
 *  - Dark centered panel with a glowing gradient background
 *  - SVG graph with nodes (circles) connected by lines
 *  - Each node floats independently using Motion One animations
 *  - Titles and descriptions flank the graph on desktop
 *
 * Nodes displayed: Redis Caching, Postgres Scaling, Kafka Streaming,
 *                  System Design, Microservices, Load Balancing
 */

"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "motion";
import { useScrollAnimation } from "@/landing/hooks/useScrollAnimation";

/**
 * Node data for the knowledge graph.
 * Each node has a label, position (as % of SVG viewport), and size.
 */
const GRAPH_NODES = [
  { id: "redis", label: "Redis Caching", x: 25, y: 30, size: 8, primary: true },
  { id: "postgres", label: "Postgres Scaling", x: 75, y: 25, size: 9, primary: true },
  { id: "kafka", label: "Kafka Streaming", x: 50, y: 65, size: 8, primary: true },
  { id: "system", label: "System Design", x: 50, y: 30, size: 12, primary: true },
  { id: "micro", label: "Microservices", x: 20, y: 65, size: 6, primary: false },
  { id: "load", label: "Load Balancing", x: 80, y: 65, size: 6, primary: false },
];

/**
 * Edge connections between nodes.
 * Each edge is defined by the IDs of the two nodes it connects.
 */
const GRAPH_EDGES = [
  { from: "system", to: "redis" },
  { from: "system", to: "postgres" },
  { from: "system", to: "kafka" },
  { from: "kafka", to: "micro" },
  { from: "postgres", to: "load" },
  { from: "redis", to: "micro" },
  { from: "system", to: "load" },
];

/**
 * KnowledgeGraphSection
 * Displays an animated SVG knowledge graph as the centerpiece of this section.
 */
export function KnowledgeGraphSection() {
  const sectionRef = useScrollAnimation(0.15);
  // Separate ref for the graph SVG nodes so we can animate them independently
  const nodesRef = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    /*
     * When the component mounts, animate each graph node with a floating
     * oscillation. Each node gets a slightly different duration and delay
     * so they move independently — making the graph feel alive.
     */
    nodesRef.current.forEach((node, index) => {
      if (!node) return;

      // Each node gets a unique vertical float range and speed
      animate(
        node,
        { cy: [`${GRAPH_NODES[index].y}%`, `${GRAPH_NODES[index].y - 2}%`, `${GRAPH_NODES[index].y}%`] },
        {
          duration: 3 + index * 0.5,       // Varying speeds
          delay: index * 0.4,               // Staggered start times
          repeat: Infinity,
          easing: "ease-in-out",
        }
      );
    });
  }, []);

  // Helper: Look up a node's position by its ID
  const getNode = (id: string) => GRAPH_NODES.find((n) => n.id === id);

  return (
    <section
      id="graph"
      className="section-pad bg-surface/30 relative overflow-hidden"
      aria-labelledby="graph-heading"
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

      {/* Top / bottom border lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">

        {/* ----------------------------------------------------------------
            Section header — centered above the graph
            ---------------------------------------------------------------- */}
        <div
          ref={sectionRef as React.RefObject<HTMLDivElement>}
          className="animate-on-scroll text-center mb-12"
        >
          <span className="inline-block text-accent text-sm font-medium tracking-widest uppercase mb-4">
            Knowledge Graph
          </span>
          <h2
            id="graph-heading"
            className="font-display text-4xl lg:text-5xl font-semibold text-text-primary leading-tight"
          >
            Your knowledge becomes
            <br />
            <span className="gradient-text">a network.</span>
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed mt-4 max-w-xl mx-auto">
            Relic transforms scattered bookmarks into a connected knowledge graph.
            Every idea you save finds its place in the bigger picture.
          </p>
        </div>

        {/* ----------------------------------------------------------------
            SVG Knowledge Graph
            Uses percentage-based coordinates so it scales to any container.
            Edges are drawn as <line> elements, nodes as <circle> + <text>.
            ---------------------------------------------------------------- */}
        <div className="relative bg-surface border border-white/[0.08] rounded-2xl p-6 shadow-[0_32px_80px_rgba(0,0,0,0.4)] overflow-hidden">

          {/* Subtle dot grid background inside the graph panel */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
            aria-hidden="true"
          />

          <svg
            viewBox="0 0 100 60"
            className="w-full h-64 md:h-80 lg:h-96 relative"
            aria-label="Knowledge graph showing connections between topics"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* --------------------------------------------------------
                Draw edges (connection lines) between nodes
                Dashed lines for secondary connections
                -------------------------------------------------------- */}
            {GRAPH_EDGES.map((edge, i) => {
              const fromNode = getNode(edge.from);
              const toNode = getNode(edge.to);
              if (!fromNode || !toNode) return null;

              return (
                <line
                  key={i}
                  x1={`${fromNode.x}%`}
                  y1={`${fromNode.y}%`}
                  x2={`${toNode.x}%`}
                  y2={`${toNode.y}%`}
                  stroke="rgba(107,138,253,0.25)"
                  strokeWidth="0.3"
                  strokeDasharray={i > 3 ? "1 1" : undefined}
                />
              );
            })}

            {/* --------------------------------------------------------
                Draw nodes (circles + labels)
                Primary nodes are larger and brighter than secondary ones.
                -------------------------------------------------------- */}
            {GRAPH_NODES.map((node, index) => (
              <g key={node.id}>
                {/* Outer glow ring — pulsing effect */}
                <circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r={node.size * 0.25}
                  fill="rgba(107,138,253,0.1)"
                  stroke="rgba(107,138,253,0.15)"
                  strokeWidth="0.2"
                />

                {/* Main node circle — this one gets the floating animation */}
                <circle
                  ref={(el) => { nodesRef.current[index] = el; }}
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r={node.size * 0.15}
                  fill={node.primary ? "#6B8AFD" : "rgba(107,138,253,0.4)"}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="0.15"
                />

                {/* Node label text */}
                <text
                  x={`${node.x}%`}
                  y={`${node.y + 4}%`}
                  textAnchor="middle"
                  fontSize="2.5"
                  fill="rgba(245,245,247,0.7)"
                  fontFamily="var(--font-inter)"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* ----------------------------------------------------------------
            Stat row below the graph
            ---------------------------------------------------------------- */}
        <div className="grid grid-cols-3 gap-6 mt-8 text-center">
          {[
            { value: "312", label: "saved memories" },
            { value: "1,840", label: "connections made" },
            { value: "47", label: "auto-topics discovered" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-2xl font-semibold text-text-primary">
                {stat.value}
              </p>
              <p className="text-text-secondary text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
