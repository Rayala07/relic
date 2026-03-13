/**
 * landing/components/HowItWorksSection.tsx
 *
 * "How Relic Works" — a 4-step explainer section.
 *
 * This section breaks the product workflow into 4 simple, scannable steps:
 *  1. Capture   — Save anything using the browser extension
 *  2. Understand — Relic extracts meaning from the content
 *  3. Connect   — Related knowledge links automatically
 *  4. Resurface — Insights are shown again when relevant
 *
 * Layout:
 *  - Section header (centered)
 *  - 4 step cards in a 2×2 grid (or 4-column on large screens)
 *  - Each card shows a number, icon, title, and description
 *  - A subtle connecting line between steps hints at the flow
 *
 * Animation: Cards stagger in on scroll.
 */

"use client";

import { useScrollAnimation, useStaggeredAnimation } from "@/landing/hooks/useScrollAnimation";
import { Card } from "@/components/ui/Card";

/**
 * Step data for each stage of the Relic workflow.
 * Each step has a step number, icon, title, and plain-language description.
 */
const STEPS = [
  {
    step: "01",
    icon: "ri-bookmark-3-line",
    title: "Capture",
    description:
      "Save anything from the internet using the Relic browser extension with a single click — articles, tweets, videos, papers.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  {
    step: "02",
    icon: "ri-brain-line",
    title: "Understand",
    description:
      "Relic reads and extracts the meaning, topics, and key ideas from every piece of content you save — automatically.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    step: "03",
    icon: "ri-share-circle-line",
    title: "Connect",
    description:
      "Related pieces of knowledge are linked together into a graph. Ideas you saved weeks apart discover each other.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
  {
    step: "04",
    icon: "ri-sparkling-2-line",
    title: "Resurface",
    description:
      "Relic intelligently reminds you of past insights when they become relevant again — so nothing valuable is forgotten.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
];

/**
 * HowItWorksSection
 * Explains the Relic product workflow in four numbered steps.
 */
export function HowItWorksSection() {
  const headlineRef = useScrollAnimation(0.2);
  const cardsRef = useStaggeredAnimation(100);

  return (
    <section
      id="how-it-works"
      className="section-pad bg-surface/50 relative"
      aria-labelledby="how-it-works-heading"
    >
      {/* Subtle top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">

        {/* ----------------------------------------------------------------
            Section header
            ---------------------------------------------------------------- */}
        <div
          ref={headlineRef as React.RefObject<HTMLDivElement>}
          className="animate-on-scroll text-center mb-16"
        >
          {/* Category label above the headline */}
          <span className="inline-block text-accent text-sm font-medium tracking-widest uppercase mb-4">
            The Workflow
          </span>
          <h2
            id="how-it-works-heading"
            className="font-display text-4xl lg:text-5xl font-semibold text-text-primary leading-tight"
          >
            How Relic Works
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed mt-4 max-w-xl mx-auto">
            Four simple steps from saving a page to having a connected,
            searchable knowledge system.
          </p>
        </div>

        {/* ----------------------------------------------------------------
            Step cards — 2×2 grid on tablet, 4-col on desktop
            ---------------------------------------------------------------- */}
        <div
          ref={cardsRef as React.RefObject<HTMLElement>}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {STEPS.map((step, index) => (
            <Card key={step.step} className="p-7 flex flex-col gap-5 relative">

              {/* Step number — large faded display in the background */}
              <span className="absolute top-5 right-5 font-display text-5xl font-bold text-white/[0.04] select-none">
                {step.step}
              </span>

              {/* Icon container */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${step.bg} border ${step.border}`}
              >
                <i className={`${step.icon} text-xl ${step.color}`} aria-hidden="true" />
              </div>

              {/* Step number + title */}
              <div>
                <p className="text-text-secondary text-xs font-medium tracking-widest uppercase mb-1">
                  Step {index + 1}
                </p>
                <h3 className="font-display text-xl font-semibold text-text-primary">
                  {step.title}
                </h3>
              </div>

              {/* Step description */}
              <p className="text-text-secondary text-sm leading-relaxed">
                {step.description}
              </p>

              {/* Arrow connector — shows on all cards except the last one */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                    <i className="ri-arrow-right-s-line text-text-secondary text-sm" aria-hidden="true" />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Subtle bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
