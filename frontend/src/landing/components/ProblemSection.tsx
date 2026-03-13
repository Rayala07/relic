/**
 * landing/components/ProblemSection.tsx
 *
 * "The Internet is easy to explore, but impossible to remember."
 *
 * This section explains the core problem Relic solves.
 * It presents THREE pain points users face with traditional bookmarking:
 *  1. Information gets lost in bookmark graveyards
 *  2. Searching later is difficult without context
 *  3. Knowledge stays isolated and disconnected
 *
 * Layout:
 *  - Full-width dark section
 *  - Large centered headline
 *  - Descriptive intro paragraph
 *  - 3 problem cards in a horizontal grid
 *
 * Animation: Cards fade in with a staggered delay when scrolled into view.
 */

"use client";

import { useScrollAnimation, useStaggeredAnimation } from "@/landing/hooks/useScrollAnimation";
import { Card } from "@/components/ui/Card";

/** Data for each of the three problem cards */
const PROBLEMS = [
  {
    id: 1,
    icon: "ri-delete-bin-6-line",
    title: "Information gets lost",
    description:
      "Bookmarks pile up into hundreds of unread links. You save things with great intentions, but they're buried within days.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    id: 2,
    icon: "ri-search-eye-line",
    title: "Searching later is impossible",
    description:
      "You remember saving something useful, but you can't find it. Folders don't help. Tags only go so far.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    id: 3,
    icon: "ri-git-branch-line",
    title: "Knowledge stays disconnected",
    description:
      "A Redis article and a caching video are related — but you'd never know from your bookmarks. Ideas never connect.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
];

/**
 * ProblemSection
 * Presents the problem Relic solves with three clear, relatable pain points.
 */
export function ProblemSection() {
  // Scroll-trigger refs: the headline fades in, then the card grid staggers in
  const headlineRef = useScrollAnimation(0.2);
  const cardsRef = useStaggeredAnimation(120);

  return (
    <section
      id="problem"
      className="section-pad bg-background relative"
      aria-labelledby="problem-heading"
    >
      {/* Subtle horizontal divider line at the top of the section */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-white/10" />

      <div className="max-w-7xl mx-auto px-6">

        {/* ----------------------------------------------------------------
            Section header — centered title and description
            ---------------------------------------------------------------- */}
        <div
          ref={headlineRef as React.RefObject<HTMLDivElement>}
          className="animate-on-scroll text-center max-w-2xl mx-auto mb-16"
        >
          <h2
            id="problem-heading"
            className="font-display text-4xl lg:text-5xl font-semibold text-text-primary leading-tight mb-4"
          >
            The Internet is easy to explore,
            <br />
            <span className="text-text-secondary">but impossible to remember.</span>
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed">
            You save articles, tweets, videos, and research papers every day.
            But bookmarks become graveyards. Knowledge stays trapped.
          </p>
        </div>

        {/* ----------------------------------------------------------------
            What users try to save — a subtle badge row showing content types
            ---------------------------------------------------------------- */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {["Articles", "Tweets", "YouTube Videos", "Research Papers", "Screenshots"].map(
            (item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-white/[0.08] text-text-secondary text-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/50" aria-hidden="true" />
                {item}
              </span>
            )
          )}
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-text-secondary/60 text-sm italic">
            ...and so much more
          </span>
        </div>

        {/* ----------------------------------------------------------------
            Three problem cards — staggered fade-in on scroll
            Each card uses a colored icon to visually differentiate the pain
            ---------------------------------------------------------------- */}
        <div
          ref={cardsRef as React.RefObject<HTMLElement>}
          className="grid md:grid-cols-3 gap-6"
        >
          {PROBLEMS.map((problem) => (
            <Card key={problem.id} className="p-8 flex flex-col gap-5">

              {/* Icon in a colored translucent circle */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${problem.bg} border ${problem.border}`}
              >
                <i
                  className={`${problem.icon} text-2xl ${problem.color}`}
                  aria-hidden="true"
                />
              </div>

              {/* Problem title */}
              <h3 className="font-display text-xl font-semibold text-text-primary">
                {problem.title}
              </h3>

              {/* Problem description */}
              <p className="text-text-secondary leading-relaxed">
                {problem.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
