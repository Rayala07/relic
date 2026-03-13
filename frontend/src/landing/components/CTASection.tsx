/**
 * landing/components/CTASection.tsx
 *
 * Final Call-to-Action section — the last push before the footer.
 *
 * This is the most important conversion section of the page.
 * The copy should feel conclusive and inviting, not pushy.
 *
 * Design:
 *  - Full-width centered layout
 *  - Large glowing headline with gradient text
 *  - Both CTA buttons (Create Account + Sign In)
 *  - Subtle ambient background glow for visual weight
 *  - Horizontal rule separators above and below
 */

"use client";

import { useScrollAnimation } from "@/landing/hooks/useScrollAnimation";
import { Button } from "@/components/ui/Button";

/**
 * CTASection
 * The final call-to-action encouraging users to sign up.
 */
export function CTASection() {
  const contentRef = useScrollAnimation(0.2);

  return (
    <section
      id="cta"
      className="section-pad relative overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* ----------------------------------------------------------------
          Ambient background glow — creates a dramatic visual focal point
          Two overlapping gradient orbs for depth
          ---------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-accent/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-4xl mx-auto px-6 text-center relative">
        <div
          ref={contentRef as React.RefObject<HTMLDivElement>}
          className="animate-on-scroll flex flex-col items-center gap-8"
        >
          {/* Eyebrow label */}
          <span className="inline-block text-accent text-sm font-medium tracking-widest uppercase">
            Get started today
          </span>

          {/* Main headline — the final compelling message */}
          <h2
            id="cta-heading"
            className="font-display text-5xl lg:text-6xl xl:text-7xl font-semibold text-text-primary leading-tight"
          >
            Start building your
            <br />
            <span className="gradient-text">second brain.</span>
          </h2>

          {/* Supporting message */}
          <p className="text-text-secondary text-xl leading-relaxed max-w-xl">
            Every insight you save today becomes the foundation of the
            knowledge system you&apos;ll depend on tomorrow.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Button variant="primary" className="text-base px-8 py-4 text-base">
              <i className="ri-user-add-line" aria-hidden="true" />
              Create Account — it&apos;s free
            </Button>
            <Button variant="secondary" className="text-base px-8 py-4">
              <i className="ri-login-box-line" aria-hidden="true" />
              Sign In
            </Button>
          </div>

          {/* Trust signal — no credit card required */}
          <p className="text-text-secondary/60 text-sm">
            No credit card required · Free forever plan available
          </p>
        </div>
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
