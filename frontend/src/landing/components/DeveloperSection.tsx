/**
 * landing/components/DeveloperSection.tsx
 *
 * "Built for thinkers, builders, and curious minds."
 *
 * This section speaks directly to Relic's target audience:
 * knowledge-intensive professionals who need more than basic bookmarking.
 *
 * Target personas:
 *  - Researchers compiling literature and citations
 *  - Developers tracking technical documentation and articles
 *  - Founders monitoring industry trends and competitor moves
 *  - Lifelong learners building deep knowledge over years
 *
 * Layout:
 *  - Dark surface background (stands out from surrounding sections)
 *  - Large centered headline
 *  - 4 audience persona cards in a grid
 *  - A brief paragraph about the philosophy
 */

"use client";

import { useScrollAnimation, useStaggeredAnimation } from "@/landing/hooks/useScrollAnimation";

/** Persona cards representing Relic's target audience */
const PERSONAS = [
  {
    icon: "ri-flask-line",
    title: "Researchers",
    description:
      "Compile literature, citations, and findings in one connected space. Never lose a source again.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: "ri-code-box-line",
    title: "Developers",
    description:
      "Save documentation, articles, and Stack Overflow threads. Find them by concept, not URL.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: "ri-rocket-line",
    title: "Founders",
    description:
      "Track market research, competitor insights, and industry trends — organized automatically.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: "ri-book-open-line",
    title: "Lifelong Learners",
    description:
      "Build deep knowledge across domains over months and years. Your learning compounds.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
];

/**
 * DeveloperSection
 * Speaks to the power user audience with persona cards and a philosophical statement.
 */
export function DeveloperSection() {
  const headlineRef = useScrollAnimation(0.2);
  const personasRef = useStaggeredAnimation(100);

  return (
    <section
      id="audience"
      className="section-pad bg-surface/50 relative"
      aria-labelledby="audience-heading"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">

        {/* ----------------------------------------------------------------
            Section header
            ---------------------------------------------------------------- */}
        <div
          ref={headlineRef as React.RefObject<HTMLDivElement>}
          className="animate-on-scroll text-center mb-16"
        >
          <span className="inline-block text-accent text-sm font-medium tracking-widest uppercase mb-4">
            Who it&apos;s for
          </span>
          <h2
            id="audience-heading"
            className="font-display text-4xl lg:text-5xl font-semibold text-text-primary leading-tight mb-6"
          >
            Built for thinkers,
            <br />
            <span className="gradient-text">builders, and curious minds.</span>
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed max-w-2xl mx-auto">
            Relic is for people who treat knowledge as a long-term investment.
            If you save things because you genuinely expect to need them later —
            this is built for you.
          </p>
        </div>

        {/* ----------------------------------------------------------------
            Persona cards grid
            ---------------------------------------------------------------- */}
        <div
          ref={personasRef as React.RefObject<HTMLElement>}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {PERSONAS.map((persona) => (
            <div
              key={persona.title}
              className="
                bg-surface border border-white/[0.08] rounded-2xl p-6
                flex flex-col gap-4
                transition-all duration-300
                hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-glow
              "
            >
              {/* Icon */}
              <div className={`w-11 h-11 rounded-xl ${persona.bg} flex items-center justify-center`}>
                <i className={`${persona.icon} text-xl ${persona.color}`} aria-hidden="true" />
              </div>

              {/* Persona title */}
              <h3 className="font-display text-lg font-semibold text-text-primary">
                {persona.title}
              </h3>

              {/* Persona description */}
              <p className="text-text-secondary text-sm leading-relaxed">
                {persona.description}
              </p>
            </div>
          ))}
        </div>

        {/* ----------------------------------------------------------------
            Philosophy quote — center bottom of the section
            ---------------------------------------------------------------- */}
        <div className="mt-16 text-center">
          <blockquote className="text-text-secondary text-base leading-relaxed max-w-xl mx-auto italic">
            &ldquo;The internet gives you access to everything.
            Relic gives you the ability to actually use what you&apos;ve learned.&rdquo;
          </blockquote>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
