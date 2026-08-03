import React from "react";
import { motion } from "motion/react";

/* ── Micro-visuals ────────────────────────────────────────────────
   Each step gets one small monochrome diagram. They sit at the foot of
   every column at a fixed height so the three columns stay on one baseline. */

const CaptureVisual = () => (
  <div className="w-full border border-border">
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
      <span className="w-1.5 h-1.5 bg-foreground/40 shrink-0" />
      <span className="text-muted-foreground text-[10px] truncate">https://example.com/long-read</span>
    </div>
    <div className="px-3 py-3 flex flex-col gap-1.5">
      <span className="block h-px w-full bg-foreground/25" />
      <span className="block h-px w-[92%] bg-foreground/25" />
      <span className="block h-px w-[78%] bg-foreground/25" />
      <span className="block h-px w-[40%] bg-border" />
      <span className="text-muted-foreground text-[9px] tracking-[0.12em] uppercase mt-2">
        Ads & nav stripped
      </span>
    </div>
  </div>
);

const UnderstandVisual = () => (
  <div className="w-full border border-border p-3 flex flex-col gap-3">
    <div className="flex flex-wrap gap-1.5">
      {["vector-search", "rag", "infra"].map((tag) => (
        <span
          key={tag}
          className="border border-border text-muted-foreground text-[9px] tracking-[0.08em] uppercase px-2 py-1"
        >
          {tag}
        </span>
      ))}
    </div>
    <div className="flex flex-col gap-1.5">
      <span className="block h-px w-full bg-foreground/25" />
      <span className="block h-px w-[85%] bg-foreground/25" />
      <span className="block h-px w-[60%] bg-foreground/25" />
    </div>
    <span className="text-muted-foreground text-[9px] tracking-[0.12em] uppercase">
      Summary · topics · embedding
    </span>
  </div>
);

const RetrieveVisual = () => (
  <div className="w-full border border-border p-3 flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <span className="border border-border text-foreground text-[10px] px-2.5 py-1.5 leading-none">⌘</span>
      <span className="border border-border text-foreground text-[10px] px-2.5 py-1.5 leading-none">K</span>
      <span className="text-muted-foreground text-[9px] tracking-[0.12em] uppercase ml-1">
        From any screen
      </span>
    </div>
    <div className="border-t border-border pt-3 flex items-center gap-2">
      <span className="text-muted-foreground text-[10px] italic font-display">
        “the one with the benchmark chart”
      </span>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 bg-foreground shrink-0" />
      <span className="text-foreground text-[10px] truncate">Pinecone vs. pgvector</span>
    </div>
  </div>
);

const STEPS = [
  {
    num: "01",
    label: "Capture",
    title: "One click, from wherever you are.",
    body: "Paste a link or hit the extension without leaving the tab. Relic fetches the page and keeps only the readable content — no ads, no nav, no cookie banners.",
    visual: <CaptureVisual />,
  },
  {
    num: "02",
    label: "Understand",
    title: "It reads what you saved.",
    body: "Every item is summarised, topic-tagged and turned into an embedding the moment it lands. There are no folders to pick and no tags to invent.",
    visual: <UnderstandVisual />,
  },
  {
    num: "03",
    label: "Retrieve",
    title: "Ask for it the way you remember it.",
    body: "Describe the idea in your own words. Search matches on meaning, so a vague memory still lands on the exact thing you saved months ago.",
    visual: <RetrieveVisual />,
  },
];

const ProcessSteps = () => (
  <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 border-t border-border">
    {STEPS.map((step, i) => (
      <motion.div
        key={step.num}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="group relative flex flex-col justify-between pt-10 pb-10 md:pt-12 md:px-8 md:first:pl-0 md:last:pr-0 border-b border-border last:border-b-0 md:border-b-0 md:border-l md:first:border-l-0"
      >
        {/* Rule that draws itself in on entry — the only ornament in the section */}
        <motion.span
          className="absolute -top-px left-0 h-px bg-foreground origin-left"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%" }}
          aria-hidden
        />

        <div className="flex flex-col">
          <div className="flex items-baseline gap-4 mb-8">
            <span
              className="font-heading font-bold text-foreground/10 leading-none tabular-nums select-none transition-colors duration-500 group-hover:text-foreground/20"
              style={{ fontSize: "64px" }}
            >
              {step.num}
            </span>
            <span className="text-muted-foreground text-[11px] tracking-[0.14em] uppercase">
              {step.label}
            </span>
          </div>

          <h3
            className="text-foreground mb-4"
            style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.3 }}
          >
            {step.title}
          </h3>

          <p className="text-muted-foreground text-[14px] leading-relaxed mb-10 max-w-[42ch]">
            {step.body}
          </p>
        </div>

        <div className="w-full">{step.visual}</div>
      </motion.div>
    ))}
  </div>
);

export default ProcessSteps;
