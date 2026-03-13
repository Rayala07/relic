/**
 * landing/components/FeatureHighlightsSection.tsx
 *
 * Feature grid showcasing Relic's 6 core capabilities.
 *
 * Features displayed:
 *  1. Smart Tagging          — Auto-generated topics and tags
 *  2. Semantic Search        — Find by meaning, not keywords
 *  3. Knowledge Graph        — See how ideas connect
 *  4. Collections            — Focused workspaces
 *  5. Highlight System       — Save key insights in content
 *  6. Memory Resurfacing     — Rediscover forgotten knowledge
 *
 * Layout:
 *  - 3-column × 2-row grid on desktop
 *  - 2-column on tablet, 1-column on mobile
 *  - Each card: icon + title + description
 *
 * Animation: Staggered fade-in as the grid enters the viewport.
 */

"use client";

import { useScrollAnimation, useStaggeredAnimation } from "@/landing/hooks/useScrollAnimation";
import { Card } from "@/components/ui/Card";

/** Feature card data. Each feature maps to a specific Relic capability. */
const FEATURES = [
  {
    icon: "ri-price-tag-3-line",
    title: "Smart Tagging",
    description:
      "Relic reads your saved content and automatically generates relevant topics and tags — no manual labeling required.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: "ri-search-eye-line",
    title: "Semantic Search",
    description:
      "Find what you need by describing the concept or idea — not the exact keywords. Relic understands meaning.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: "ri-node-tree",
    title: "Knowledge Graph",
    description:
      "Visualize how your saved ideas connect. Discover unexpected links between separated articles and notes.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
  },
  {
    icon: "ri-folder-open-line",
    title: "Collections",
    description:
      "Group related knowledge into focused spaces — a research project, a learning track, or a creative brief.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: "ri-mark-pen-line",
    title: "Highlight System",
    description:
      "Mark the most important sentences in any saved content. Highlights are indexed and searchable on their own.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
  {
    icon: "ri-time-line",
    title: "Memory Resurfacing",
    description:
      "Relic brings back relevant insights from weeks or months ago — right when you need them most.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

/**
 * FeatureHighlightsSection
 * A 3×2 grid of feature cards showcasing Relic's core capabilities.
 */
export function FeatureHighlightsSection() {
  const headlineRef = useScrollAnimation(0.2);
  const cardsRef = useStaggeredAnimation(80);

  return (
    <section
      id="features"
      className="section-pad bg-background relative"
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* ----------------------------------------------------------------
            Section header
            ---------------------------------------------------------------- */}
        <div
          ref={headlineRef as React.RefObject<HTMLDivElement>}
          className="animate-on-scroll text-center mb-16"
        >
          <span className="inline-block text-accent text-sm font-medium tracking-widest uppercase mb-4">
            Features
          </span>
          <h2
            id="features-heading"
            className="font-display text-4xl lg:text-5xl font-semibold text-text-primary leading-tight"
          >
            Everything your
            <br />
            <span className="gradient-text">second brain needs</span>
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed mt-4 max-w-xl mx-auto">
            Relic is built around the way human memory actually works —
            by connection, context, and relevance over time.
          </p>
        </div>

        {/* ----------------------------------------------------------------
            Feature card grid — 3 columns on desktop, staggered animation
            ---------------------------------------------------------------- */}
        <div
          ref={cardsRef as React.RefObject<HTMLElement>}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="p-7 flex flex-col gap-4 group">

              {/* Icon */}
              <div
                className={`
                  w-11 h-11 rounded-xl flex items-center justify-center
                  ${feature.bg}
                  transition-transform duration-300 group-hover:scale-110
                `}
              >
                <i
                  className={`${feature.icon} text-xl ${feature.color}`}
                  aria-hidden="true"
                />
              </div>

              {/* Feature title */}
              <h3 className="font-display text-lg font-semibold text-text-primary">
                {feature.title}
              </h3>

              {/* Feature description */}
              <p className="text-text-secondary text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* "Learn more" arrow — appears on hover */}
              <div className="mt-auto pt-2 flex items-center gap-1 text-accent text-sm opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <span>Learn more</span>
                <i className="ri-arrow-right-line" aria-hidden="true" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
