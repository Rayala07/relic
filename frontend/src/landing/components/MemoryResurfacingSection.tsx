/**
 * landing/components/MemoryResurfacingSection.tsx
 *
 * "Insights return when they matter."
 *
 * This section demonstrates Relic's memory resurfacing feature:
 * the system proactively shows you content you saved weeks or months ago
 * when it becomes contextually relevant again.
 *
 * Layout:
 *  - Two columns on desktop (left: text, right: mockup card)
 *  - The mockup shows a "Resurfaced memory" notification card with
 *    a sample saved article from 60 days ago
 *  - The card has a subtle entrance animation and hover glow
 *
 * The key emotions to convey: surprise + delight when a forgotten insight
 * shows up at exactly the right moment.
 */

"use client";

import { useScrollAnimation } from "@/landing/hooks/useScrollAnimation";
import { Badge } from "@/components/ui/Badge";

/**
 * MemoryResurfacingSection
 * Showcases the "resurface insights from the past" feature with a UI mockup.
 */
export function MemoryResurfacingSection() {
  const contentRef = useScrollAnimation(0.2);
  const cardRef = useScrollAnimation(0.15);

  return (
    <section
      id="resurfacing"
      className="section-pad bg-background relative"
      aria-labelledby="resurfacing-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ----------------------------------------------------------------
              LEFT: Text content
              ---------------------------------------------------------------- */}
          <div
            ref={contentRef as React.RefObject<HTMLDivElement>}
            className="animate-on-scroll"
          >
            <span className="inline-block text-accent text-sm font-medium tracking-widest uppercase mb-4">
              Memory Resurfacing
            </span>

            <h2
              id="resurfacing-heading"
              className="font-display text-4xl lg:text-5xl font-semibold text-text-primary leading-tight mb-6"
            >
              Insights return
              <br />
              <span className="gradient-text">when they matter.</span>
            </h2>

            <p className="text-text-secondary text-lg leading-relaxed mb-6">
              Relic tracks what you&apos;ve saved and watches for the right moment
              to bring it back. Reading about database indexing? Relic remembers
              that Redis article from two months ago.
            </p>

            {/* Feature bullet list */}
            <ul className="space-y-3">
              {[
                { icon: "ri-alarm-line", text: "Scheduled daily memory digests" },
                { icon: "ri-link-m", text: "Resurfaced based on what you're currently reading" },
                { icon: "ri-calendar-check-line", text: "Nothing valuable is ever truly forgotten" },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center mt-0.5">
                    <i className={`${item.icon} text-accent text-sm`} aria-hidden="true" />
                  </span>
                  <span className="text-text-secondary">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ----------------------------------------------------------------
              RIGHT: Resurfaced memory card mockup
              Mimics how a resurfaced memory notification looks inside Relic.
              ---------------------------------------------------------------- */}
          <div
            ref={cardRef as React.RefObject<HTMLDivElement>}
            className="animate-on-scroll animate-delay-200"
          >
            {/* Outer container with ambient glow */}
            <div className="relative">
              <div className="absolute -inset-4 bg-accent/5 rounded-3xl blur-2xl" aria-hidden="true" />

              <div className="relative bg-surface border border-white/[0.08] rounded-2xl p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">

                {/* Card header — the "Relic resurfaced this" notification */}
                <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/[0.06]">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <i className="ri-sparkling-line text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">Relic remembered this</p>
                    <p className="text-text-secondary text-xs">Based on what you&apos;re reading now</p>
                  </div>
                  <Badge variant="accent" className="ml-auto">New</Badge>
                </div>

                {/* The resurfaced article card */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 mb-4">
                  {/* Origin timestamp */}
                  <div className="flex items-center gap-2 mb-3">
                    <i className="ri-history-line text-text-secondary text-sm" aria-hidden="true" />
                    <span className="text-text-secondary text-xs">You saved this 60 days ago</span>
                  </div>

                  {/* Article title */}
                  <h4 className="text-text-primary font-semibold text-base leading-snug mb-1">
                    Why Redis is the perfect cache for high-traffic APIs
                  </h4>

                  {/* Source */}
                  <p className="text-text-secondary text-xs mb-3">
                    engineering.shopify.com · 12 min read
                  </p>

                  {/* Highlighted insight from the article */}
                  <div className="bg-accent/5 border-l-2 border-accent/40 pl-3 py-2 rounded-r-lg">
                    <p className="text-text-secondary text-xs italic leading-relaxed">
                      &ldquo;Cache invalidation is one of the hardest problems in distributed
                      systems — Redis&apos;s TTL-based expiry solves it elegantly.&rdquo;
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1.5 mt-3">
                    <Badge variant="default">redis</Badge>
                    <Badge variant="default">caching</Badge>
                    <Badge variant="default">backend</Badge>
                  </div>
                </div>

                {/* Action buttons (mockup, non-functional) */}
                <div className="flex items-center gap-3">
                  <button className="flex-1 py-2 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors">
                    <i className="ri-eye-line mr-1.5" aria-hidden="true" />
                    Read again
                  </button>
                  <button className="flex-1 py-2 rounded-lg bg-white/[0.04] text-text-secondary text-sm hover:bg-white/[0.08] transition-colors border border-white/[0.06]">
                    Mark as reviewed
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
