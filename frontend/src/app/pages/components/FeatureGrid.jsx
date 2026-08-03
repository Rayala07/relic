import React, { useRef, useState } from "react";
import { motion } from "motion/react";

/* ── Diagrams ──────────────────────────────────────────────────────
   Strictly monochrome: every stroke is currentColor, so each diagram
   inverts correctly with the theme instead of carrying its own hue. */

const SemanticDiagram = () => (
  <svg viewBox="0 0 240 120" fill="none" className="w-full h-auto" aria-hidden>
    <g stroke="currentColor" strokeOpacity="0.18">
      <circle cx="48" cy="60" r="26" />
      <circle cx="48" cy="60" r="44" />
      <circle cx="48" cy="60" r="62" />
    </g>
    <g stroke="currentColor" strokeOpacity="0.3">
      <line x1="48" y1="60" x2="150" y2="30" />
      <line x1="48" y1="60" x2="176" y2="64" />
      <line x1="48" y1="60" x2="142" y2="96" />
    </g>
    <circle cx="48" cy="60" r="4" fill="currentColor" />
    <g fill="currentColor" fillOpacity="0.35">
      <rect x="146" y="26" width="8" height="8" />
      <rect x="138" y="92" width="8" height="8" />
    </g>
    <rect x="172" y="60" width="8" height="8" fill="currentColor" />
    <text x="190" y="68" fontSize="8" fill="currentColor" fillOpacity="0.5" letterSpacing="1.2">
      0.94
    </text>
  </svg>
);

const SummaryDiagram = () => (
  <svg viewBox="0 0 200 96" fill="none" className="w-full h-auto" aria-hidden>
    <g stroke="currentColor" strokeOpacity="0.16">
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="0" y1={4 + i * 8} x2={i % 2 ? 178 : 196} y2={4 + i * 8} />
      ))}
    </g>
    <path d="M0 52 L200 52" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2 3" />
    <g stroke="currentColor" strokeOpacity="0.75">
      <line x1="0" y1="68" x2="120" y2="68" />
      <line x1="0" y1="78" x2="96" y2="78" />
      <line x1="0" y1="88" x2="64" y2="88" />
    </g>
  </svg>
);

const CollectionsDiagram = () => (
  <svg viewBox="0 0 200 110" fill="none" className="w-full h-auto" aria-hidden>
    <g stroke="currentColor" strokeOpacity="0.2">
      <circle cx="48" cy="40" r="30" />
      <circle cx="132" cy="34" r="24" />
      <circle cx="98" cy="86" r="20" />
    </g>
    <g fill="currentColor" fillOpacity="0.55">
      <rect x="38" y="30" width="6" height="6" />
      <rect x="54" y="38" width="6" height="6" />
      <rect x="44" y="50" width="6" height="6" />
      <rect x="124" y="26" width="6" height="6" />
      <rect x="138" y="38" width="6" height="6" />
      <rect x="92" y="80" width="6" height="6" />
      <rect x="104" y="90" width="6" height="6" />
    </g>
  </svg>
);

const ResurfaceDiagram = () => (
  <svg viewBox="0 0 200 96" fill="none" className="w-full h-auto" aria-hidden>
    <line x1="0" y1="72" x2="200" y2="72" stroke="currentColor" strokeOpacity="0.25" />
    <g stroke="currentColor" strokeOpacity="0.25">
      {[20, 60, 100, 140, 180].map((x) => (
        <line key={x} x1={x} y1="66" x2={x} y2="72" />
      ))}
    </g>
    <path
      d="M20 72 C 60 4, 150 4, 182 66"
      stroke="currentColor"
      strokeOpacity="0.45"
      strokeDasharray="3 4"
    />
    <rect x="16" y="68" width="8" height="8" fill="currentColor" fillOpacity="0.35" />
    <rect x="178" y="62" width="8" height="8" fill="currentColor" />
  </svg>
);

const RelatedDiagram = () => (
  <svg viewBox="0 0 320 150" fill="none" className="w-full h-auto" aria-hidden>
    <g stroke="currentColor" strokeOpacity="0.25">
      <line x1="160" y1="75" x2="58" y2="30" />
      <line x1="160" y1="75" x2="40" y2="102" />
      <line x1="160" y1="75" x2="152" y2="18" />
      <line x1="160" y1="75" x2="264" y2="38" />
      <line x1="160" y1="75" x2="282" y2="110" />
      <line x1="160" y1="75" x2="140" y2="132" />
      <line x1="58" y1="30" x2="152" y2="18" />
      <line x1="264" y1="38" x2="282" y2="110" />
    </g>
    <g fill="currentColor" fillOpacity="0.45">
      <rect x="54" y="26" width="8" height="8" />
      <rect x="36" y="98" width="8" height="8" />
      <rect x="148" y="14" width="8" height="8" />
      <rect x="260" y="34" width="8" height="8" />
      <rect x="278" y="106" width="8" height="8" />
      <rect x="136" y="128" width="8" height="8" />
    </g>
    <rect x="153" y="68" width="14" height="14" fill="currentColor" />
  </svg>
);

const TagDiagram = () => (
  <div className="flex flex-wrap gap-1.5">
    {["design-systems", "typography", "css", "archive", "research"].map((tag, i) => (
      <span
        key={tag}
        className={`border text-[9px] tracking-[0.08em] uppercase px-2 py-1 ${
          i < 2
            ? "border-foreground/40 text-foreground"
            : "border-border text-muted-foreground"
        }`}
      >
        {tag}
      </span>
    ))}
  </div>
);

const FEATURES = [
  {
    tag: "Semantic search",
    text: "Describe what you're after in plain language. Relic matches the concept, so you find the piece without remembering its title, its author, or where you put it.",
    span: "md:col-span-2",
    diagram: <SemanticDiagram />,
    wide: true,
  },
  {
    tag: "AI summaries",
    text: "Every save is condensed the moment it arrives. Skim the gist before deciding whether to reopen the whole thing.",
    span: "md:col-span-1",
    diagram: <SummaryDiagram />,
  },
  {
    tag: "Auto tagging",
    text: "Topics are detected on save. Your library organises itself while you keep reading.",
    span: "md:col-span-1",
    diagram: <TagDiagram />,
  },
  {
    tag: "Smart collections",
    text: "Related saves cluster on their own, so themes you didn't know you were collecting become visible.",
    span: "md:col-span-1",
    diagram: <CollectionsDiagram />,
  },
  {
    tag: "Resurfacing",
    text: "Things you filed months ago come back around when they're worth a second look.",
    span: "md:col-span-1",
    diagram: <ResurfaceDiagram />,
  },
  {
    tag: "Related items",
    text: "Open anything and see what else in your library connects to it. Over time the archive stops being a list and starts being a map of what you've been thinking about.",
    span: "md:col-span-2 lg:col-span-3",
    diagram: <RelatedDiagram />,
    wide: true,
  },
];

const FeatureCard = ({ feature, index }) => {
  const cardRef = useRef(null);
  const [pointer, setPointer] = useState({ x: -400, y: -400 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPointer({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // No per-card border — the parent's gap-px over bg-border draws every hairline,
  // so the cards butt together into one continuously ruled sheet.
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative bg-card overflow-hidden ${feature.span}`}
      style={{ minHeight: feature.wide ? "260px" : "300px" }}
    >
      {/* Monochrome spotlight — the light itself is the accent, not a colour */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(420px circle at ${pointer.x}px ${pointer.y}px, color-mix(in srgb, var(--foreground) 7%, transparent), transparent 65%)`,
          opacity: hovered ? 1 : 0,
        }}
        aria-hidden
      />

      <div
        className={`relative h-full p-7 sm:p-8 flex gap-8 ${
          feature.wide ? "flex-col lg:flex-row lg:items-center" : "flex-col justify-between"
        }`}
      >
        <div className={feature.wide ? "flex-1 min-w-0" : ""}>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 bg-foreground/40 group-hover:bg-foreground transition-colors duration-300 shrink-0" />
            <h3 className="text-foreground text-[11px] tracking-[0.16em] uppercase font-semibold">
              {feature.tag}
            </h3>
          </div>
          {/* Always rendered — the old build hid this behind :hover, which meant
              touch users and screen readers never got the copy at all. */}
          <p className="text-muted-foreground text-[14px] leading-relaxed max-w-[52ch]">
            {feature.text}
          </p>
        </div>

        <div
          className={`text-foreground ${
            feature.wide ? "w-full lg:w-[320px] shrink-0" : "w-full mt-8"
          }`}
        >
          {feature.diagram}
        </div>
      </div>
    </motion.div>
  );
};

const FeatureGrid = () => (
  <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
    {FEATURES.map((feature, i) => (
      <FeatureCard key={feature.tag} feature={feature} index={i} />
    ))}
  </div>
);

export default FeatureGrid;
