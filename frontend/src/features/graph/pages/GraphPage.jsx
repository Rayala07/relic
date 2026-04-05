import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ForceGraph from "../components/ForceGraph";
import itemService from "../../items/services/item.service";

const GraphPage = () => {
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [nodeCount, setNodeCount] = useState(0);
  const [edgeCount, setEdgeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const navigate = useNavigate();

  const fetchGraph = async () => {
    try {
      setLoading(true);
      setError(null);
      const graphData = await itemService.getGraph();
      setData(graphData);
      setNodeCount(graphData.nodes.length);
      setEdgeCount(graphData.edges.length);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load graph");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const handleNodeClick = (nodeId) => {
    navigate(`/items/${nodeId}`);
  };

  const handleNodeHover = (nodeData) => {
    setHoveredNode(nodeData);
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#000000]" style={{ height: "calc(100vh - 72px)" }}>
      {/* CANVAS */}
      {!loading && !error && data.nodes.length > 0 && (
        <ForceGraph 
          nodes={data.nodes} 
          edges={data.edges} 
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
        />
      )}

      {/* TOP-LEFT CONTROLS OVERLAY */}
      <div className="absolute top-[24px] left-6 flex flex-col gap-6 pointer-events-none">
        
        {/* Header */}
        <div>
          <h1 className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            GRAPH
          </h1>
          {!loading && !error && (
            <div className="flex gap-4 mt-2">
              <span className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                {nodeCount} NODES
              </span>
              <span className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                {edgeCount} EDGES
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        {!loading && !error && data.nodes.length > 0 && (
          <div className="flex flex-col gap-2">
            {[
              { label: "WEBPAGE", bg: '#ffffff', border: 'none' },
              { label: "DOCS", bg: '#9b9b9b', border: 'none' },
              { label: "YOUTUBE", bg: '#5a5a5a', border: 'none' },
              { label: "SOCIAL", bg: '#2e2e2e', border: '1px solid #5a5a5a' },
            ].map((type) => (
              <div key={type.label} className="flex items-center gap-2 pointer-events-auto">
                <div 
                  className="w-[6px] h-[6px] rounded-full" 
                  style={{ backgroundColor: type.bg, ...(type.border !== 'none' ? { border: type.border } : {}) }}
                />
                <span className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                  {type.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Hints */}
        <p className="text-[#666666] uppercase mt-2" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          drag to explore · click to open
        </p>

      </div>

      {/* NODE DETAIL PANEL */}
      <div 
        className="absolute bottom-[24px] left-6 max-w-[320px] bg-[#0a0a0a] border border-[#1a1a1a] p-5 flex flex-col gap-4 pointer-events-auto transition-all duration-300"
        style={{ 
          opacity: hoveredNode ? 1 : 0, 
          transform: hoveredNode ? "translateY(0)" : "translateY(10px)",
          pointerEvents: hoveredNode ? "auto" : "none"
        }}
      >
        {hoveredNode && (
          <>
            <span className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              {hoveredNode.type === "url" || hoveredNode.type === "webpage" ? "LINK" : hoveredNode.type}
            </span>
            <h3 className="text-white line-clamp-2 leading-tight" style={{ fontSize: "16px", letterSpacing: "0.01em", fontWeight: 500 }}>
              {hoveredNode.title || "UNTITLED"}
            </h3>
            <p className="text-[#666666] line-clamp-3" style={{ fontSize: "13px", lineHeight: "1.6" }}>
              {hoveredNode.excerpt || hoveredNode.summary || ""}
            </p>
            <Link 
              to={`/items/${hoveredNode.id}`}
              className="text-[#666666] hover:text-white uppercase transition-colors duration-150 inline-block pt-1" 
              style={{ fontSize: "11px", letterSpacing: "0.08em" }}
            >
              OPEN ITEM →
            </Link>
          </>
        )}
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-[#666666] uppercase animate-pulse" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            LOADING GRAPH...
          </p>
        </div>
      )}

      {/* ERROR STATE */}
      {error && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <p className="text-[#ff3333] uppercase text-center" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            {error}
          </p>
          <button 
            onClick={fetchGraph}
            className="text-[#666666] hover:text-white uppercase transition-colors"
            style={{ fontSize: "11px", letterSpacing: "0.08em" }}
          >
            RETRY
          </button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && data.nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            no connections yet
          </p>
          <p className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em", opacity: 0.7 }}>
            save more items to see your graph grow
          </p>
        </div>
      )}

    </div>
  );
};

export default GraphPage;
