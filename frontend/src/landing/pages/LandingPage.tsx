/**
 * landing/pages/LandingPage.tsx
 *
 * Main composition component for the Relic landing page.
 *
 * This component imports and arranges all section components in order.
 * Think of it as the "director" — it doesn't contain any logic or styles
 * of its own, it simply ensures all sections render in the correct sequence.
 *
 * Section order (matches the design spec):
 *  1.  Navbar
 *  2.  HeroSection
 *  3.  ProblemSection
 *  4.  HowItWorksSection
 *  5.  FeatureHighlightsSection
 *  6.  KnowledgeGraphSection
 *  7.  MemoryResurfacingSection
 *  8.  BrowserExtensionSection
 *  9.  DeveloperSection
 *  10. CTASection
 *  11. Footer
 *
 * The <main> element wraps all content sections for semantic HTML and
 * accessibility (screen readers can jump to main content via skip-nav).
 */

import { Navbar } from "@/landing/components/Navbar";
import { HeroSection } from "@/landing/components/HeroSection";
import { ProblemSection } from "@/landing/components/ProblemSection";
import { HowItWorksSection } from "@/landing/components/HowItWorksSection";
import { FeatureHighlightsSection } from "@/landing/components/FeatureHighlightsSection";
import { KnowledgeGraphSection } from "@/landing/components/KnowledgeGraphSection";
import { MemoryResurfacingSection } from "@/landing/components/MemoryResurfacingSection";
import { BrowserExtensionSection } from "@/landing/components/BrowserExtensionSection";
import { DeveloperSection } from "@/landing/components/DeveloperSection";
import { CTASection } from "@/landing/components/CTASection";
import { Footer } from "@/landing/components/Footer";

/**
 * LandingPage
 * Assembles the full Relic marketing landing page from individual section components.
 */
export function LandingPage() {
  return (
    <>
      {/* Sticky navigation bar — stays at the top while the user scrolls */}
      <Navbar />

      {
        /*
         * Main content area wraps all visible sections.
         * The `id="main-content"` is the anchor target for skip-nav above.
         */
      }
      <main id="main-content">
        {/* Section 1: Full-viewport hero with CTA */}
        <HeroSection />

        {/* Section 2: Problem statement — why bookmarks fail */}
        <ProblemSection />

        {/* Section 3: 4-step product workflow */}
        <HowItWorksSection />

        {/* Section 4: 6 feature cards grid */}
        <FeatureHighlightsSection />

        {/* Section 5: Animated knowledge graph visual */}
        <KnowledgeGraphSection />

        {/* Section 6: Memory resurfacing mockup */}
        <MemoryResurfacingSection />

        {/* Section 7: Browser extension capture flow */}
        <BrowserExtensionSection />

        {/* Section 8: Target audience personas */}
        <DeveloperSection />

        {/* Section 9: Final conversion CTA */}
        <CTASection />
      </main>

      {/* Footer: links, logo, copyright */}
      <Footer />
    </>
  );
}
