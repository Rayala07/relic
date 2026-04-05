import React, { useState, useEffect, useRef } from "react";
import { animate, stagger } from "motion";
import itemService from "../../features/items/services/item.service";

// Format large numbers — 0 becomes "—", 1200 becomes "1.2K"
function formatNumber(n) {
  if (typeof n !== "number") return "—";
  if (n === 0) return "—";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

const StatsBar = () => {
  // null = loading, object = loaded, 'error' = failed
  const [stats, setStats] = useState(null);

  // Refs for entrance + hover animations
  const labelRef      = useRef(null);
  const savedRef      = useRef(null);
  const streakRef     = useRef(null);
  const collectionsRef = useRef(null);

  useEffect(() => {
    itemService
      .getStats()
      .then((data) => setStats(data))
      .catch(() => setStats("error"));
  }, []);

  // Entrance animation fires once stats data is available
  useEffect(() => {
    if (!stats || stats === "error") return;

    const ease = [0.25, 0.1, 0.25, 1];

    if (labelRef.current) {
      animate(
        labelRef.current,
        { opacity: [0, 1] },
        { duration: 0.4, easing: ease }
      );
    }

    const statRefs = [savedRef, streakRef, collectionsRef];
    statRefs.forEach((ref, i) => {
      if (!ref.current) return;
      animate(
        ref.current,
        { opacity: [0, 1], y: [16, 0], scale: [0.95, 1] },
        { duration: 0.6, delay: 0.2 + i * 0.1, easing: [0.22, 1, 0.36, 1] }
      );
    });
  }, [stats]);

  // Hover handler — Premium "Focus Pull" staggered effect
  function handleStatEnter(ref) {
    if (!ref.current) return;
    
    // Elegant, smooth float up on the main container
    animate(ref.current, { y: -6 }, { duration: 0.6, easing: [0.16, 1, 0.3, 1] });

    // Inner elements individually receive a staggered depth-of-field pop
    if (ref.current.children.length > 0) {
      animate(
        Array.from(ref.current.children),
        { 
          y: [6, 0], 
          opacity: [0.5, 1], 
          filter: ["blur(4px)", "blur(0px)"],
          scale: [0.96, 1]
        },
        { duration: 0.6, delay: stagger(0.06), easing: [0.16, 1, 0.3, 1] }
      );
    }
  }

  function handleStatLeave(ref) {
    if (!ref.current) return;
    
    // Settle back to default
    animate(ref.current, { y: 0 }, { duration: 0.5, easing: [0.32, 0, 0.67, 0] });

    if (ref.current.children.length > 0) {
      animate(
        Array.from(ref.current.children),
        { 
          y: 0, 
          opacity: 1, 
          filter: "blur(0px)",
          scale: 1 
        },
        { duration: 0.5, easing: [0.32, 0, 0.67, 0] }
      );
    }
  }

  // Loading or error — render nothing. Never crash the home page.
  if (!stats || stats === "error") return null;

  return (
    <div ref={labelRef} className="flex flex-col items-center w-full" style={{ opacity: 0, fontFamily: "system-ui, sans-serif" }}>

      {/* Section label */}
      <div 
        className="text-[#666666] uppercase"
        style={{ fontSize: "11px", letterSpacing: "0.08em", marginBottom: "24px", textAlign: "center" }}
      >
        YOUR RELIC
      </div>

      {/* Three equal stat boxes */}
      <div className="flex flex-col sm:flex-row items-stretch justify-center gap-[1px] w-full sm:w-auto">

        {/* STAT 1 — THINGS SAVED */}
        <div
          ref={savedRef}
          className="flex flex-col items-center justify-center w-full sm:w-[160px]"
          style={{
            opacity: 0,
            minHeight: "100px",
            gap: "8px",
            padding: "24px 16px",
            border: "1px solid #ffffff",
            borderRadius: 0,
            cursor: "default",
          }}
          onMouseEnter={() => handleStatEnter(savedRef)}
          onMouseLeave={() => handleStatLeave(savedRef)}
        >
          {/* Spacer — keeps number at same height as streak */}
          <div style={{ height: "8px", width: "100%" }} />
          
          <div className="text-white" style={{ fontSize: "20px", fontWeight: 500, letterSpacing: "0.01em", lineHeight: 1, textAlign: "center" }}>
            {formatNumber(stats.totalSaved)}
          </div>
          
          <div className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em", textAlign: "center" }}>
            THINGS SAVED
          </div>
        </div>

        {/* STAT 2 — DAY STREAK */}
        <div
          ref={streakRef}
          className="flex flex-col items-center justify-center w-full sm:w-[160px]"
          style={{
            opacity: 0,
            minHeight: "100px",
            gap: "8px",
            padding: "24px 16px",
            border: "1px solid #ffffff",
            borderRadius: 0,
            cursor: "default",
          }}
          onMouseEnter={() => handleStatEnter(streakRef)}
          onMouseLeave={() => handleStatLeave(streakRef)}
        >
          {/* Pulsing dot — same height as spacer above */}
          <div className="flex items-center justify-center" style={{ height: "8px" }}>
            {stats.streak > 0 && (
              <div className="streak-dot">
                <div className="streak-ring" />
              </div>
            )}
          </div>
          
          <div className="text-white" style={{ fontSize: "20px", fontWeight: 500, letterSpacing: "0.01em", lineHeight: 1, textAlign: "center" }}>
            {stats.streak === 0 ? "—" : stats.streak.toString()}
          </div>
          
          <div className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em", textAlign: "center" }}>
            DAY STREAK
          </div>
        </div>

        {/* STAT 3 — COLLECTIONS */}
        <div
          ref={collectionsRef}
          className="flex flex-col items-center justify-center w-full sm:w-[160px]"
          style={{
            opacity: 0,
            minHeight: "100px",
            gap: "8px",
            padding: "24px 16px",
            border: "1px solid #ffffff",
            borderRadius: 0,
            cursor: "default",
          }}
          onMouseEnter={() => handleStatEnter(collectionsRef)}
          onMouseLeave={() => handleStatLeave(collectionsRef)}
        >
          {/* Spacer */}
          <div style={{ height: "8px", width: "100%" }} />
          
          <div className="text-white" style={{ fontSize: "20px", fontWeight: 500, letterSpacing: "0.01em", lineHeight: 1, textAlign: "center" }}>
            {formatNumber(stats.collections)}
          </div>
          
          <div className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em", textAlign: "center" }}>
            COLLECTIONS
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatsBar;
