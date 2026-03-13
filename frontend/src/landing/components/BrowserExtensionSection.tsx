/**
 * landing/components/BrowserExtensionSection.tsx
 *
 * Browser Extension capture workflow section.
 *
 * Explains how Relic's browser extension works in 3 simple steps:
 *  1. Browse the internet normally
 *  2. Click the Relic extension to save the page
 *  3. Relic automatically organizes it
 *
 * Layout:
 *  - Two columns on desktop (left: text + steps, right: extension mockup)
 *  - Extension popup mockup shows a realistic-looking browser extension UI
 *
 * The goal is to make the extension feel effortless and non-intrusive.
 */

"use client";

import { useScrollAnimation } from "@/landing/hooks/useScrollAnimation";
import { Badge } from "@/components/ui/Badge";

/** Data for each step of the extension workflow */
const EXTENSION_STEPS = [
  {
    number: "01",
    icon: "ri-global-line",
    title: "Browse normally",
    description: "Continue using the internet as you always do. No workflow changes.",
  },
  {
    number: "02",
    icon: "ri-bookmark-3-line",
    title: "Click to save",
    description: "Hit the Relic extension icon when you find something worth keeping.",
  },
  {
    number: "03",
    icon: "ri-magic-line",
    title: "Done — Relic handles the rest",
    description: "Content is extracted, tagged, indexed, and connected automatically.",
  },
];

/**
 * BrowserExtensionSection
 * Showcases the capture workflow with an extension popup mockup.
 */
export function BrowserExtensionSection() {
  const contentRef = useScrollAnimation(0.2);
  const mockupRef = useScrollAnimation(0.15);

  return (
    <section
      id="extension"
      className="section-pad bg-surface/30 relative"
      aria-labelledby="extension-heading"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ----------------------------------------------------------------
              LEFT: Text + step list
              ---------------------------------------------------------------- */}
          <div
            ref={contentRef as React.RefObject<HTMLDivElement>}
            className="animate-on-scroll"
          >
            <span className="inline-block text-accent text-sm font-medium tracking-widest uppercase mb-4">
              Browser Extension
            </span>

            <h2
              id="extension-heading"
              className="font-display text-4xl lg:text-5xl font-semibold text-text-primary leading-tight mb-4"
            >
              Save in one click.
              <br />
              <span className="gradient-text">Zero friction.</span>
            </h2>

            <p className="text-text-secondary text-lg leading-relaxed mb-10">
              The Relic extension lives in your browser toolbar. When you find
              something worth keeping, one click captures the full article,
              not just the URL.
            </p>

            {/* Step list */}
            <ol className="space-y-6" aria-label="Extension workflow steps">
              {EXTENSION_STEPS.map((step) => (
                <li key={step.number} className="flex items-start gap-4">
                  {/* Step number circle */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <i className={`${step.icon} text-accent text-base`} aria-hidden="true" />
                  </div>

                  <div>
                    <p className="text-text-secondary text-xs font-medium tracking-wider uppercase mb-0.5">
                      Step {step.number}
                    </p>
                    <h3 className="text-text-primary font-semibold mb-1">{step.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Browser support note */}
            <div className="mt-8 flex items-center gap-3">
              <span className="text-text-secondary text-sm">Available for</span>
              <div className="flex items-center gap-2">
                {["Chrome", "Firefox", "Edge", "Safari"].map((browser) => (
                  <span
                    key={browser}
                    className="text-xs px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-text-secondary"
                  >
                    {browser}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------
              RIGHT: Browser extension popup mockup
              Simulates what the Relic extension UI looks like when opened.
              ---------------------------------------------------------------- */}
          <div
            ref={mockupRef as React.RefObject<HTMLDivElement>}
            className="animate-on-scroll animate-delay-200 flex justify-center"
          >
            {/* Extension popup container — mimics the size of a real popup */}
            <div className="w-80 bg-surface border border-white/[0.08] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden">

              {/* Popup header */}
              <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
                  <i className="ri-bookmark-line text-accent text-sm" aria-hidden="true" />
                </div>
                <span className="text-text-primary text-sm font-semibold">Relic</span>
                <Badge variant="accent" className="ml-auto text-[10px]">Ready</Badge>
              </div>

              <div className="p-4 space-y-3">
                {/* Page being saved — shows the current tab */}
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                  <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-1">Saving from</p>
                  <p className="text-text-primary text-sm font-medium leading-snug">
                    Building Scalable Microservices with Docker
                  </p>
                  <p className="text-text-secondary text-xs mt-1">martinfowler.com</p>
                </div>

                {/* Auto-detected tags */}
                <div>
                  <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-2">Auto-detected topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["microservices", "docker", "system design", "devops"].map((tag) => (
                      <Badge key={tag} variant="default" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                </div>

                {/* Add to collection dropdown (mockup) */}
                <div>
                  <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-2">Add to collection</p>
                  <div className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-text-secondary text-sm flex items-center justify-between">
                    <span>Backend Engineering</span>
                    <i className="ri-arrow-down-s-line" aria-hidden="true" />
                  </div>
                </div>

                {/* Save button */}
                <button className="w-full py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover hover:shadow-glow transition-all duration-200">
                  <i className="ri-save-line mr-2" aria-hidden="true" />
                  Save to Relic
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
