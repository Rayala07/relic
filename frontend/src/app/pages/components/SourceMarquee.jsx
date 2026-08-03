import React from "react";

// Only what the pipeline genuinely handles today (see backend content processors)
const SOURCES = [
  "ARTICLES",
  "PDFS & PAPERS",
  "YOUTUBE VIDEOS",
  "TWEETS & THREADS",
  "PRODUCT PAGES",
  "DOCUMENTATION",
  "NEWSLETTERS",
  "BLOG POSTS",
];

const Track = ({ ariaHidden }) => (
  <div className="flex items-center shrink-0" aria-hidden={ariaHidden || undefined}>
    {SOURCES.map((source) => (
      <span key={source} className="flex items-center shrink-0">
        <span className="text-muted-foreground text-[11px] tracking-[0.16em] uppercase px-8 whitespace-nowrap">
          {source}
        </span>
        <span className="w-1 h-1 bg-border rotate-45 shrink-0" />
      </span>
    ))}
  </div>
);

const SourceMarquee = () => (
  <div className="w-full border-y border-border py-5 overflow-hidden marquee-mask">
    <div className="flex w-max animate-marquee">
      <Track />
      {/* Second copy is what makes the -50% translate loop seamless */}
      <Track ariaHidden />
    </div>
  </div>
);

export default SourceMarquee;
