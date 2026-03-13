/**
 * landing/components/HeroSection.tsx
 *
 * Full-screen hero section — the first thing visitors see.
 *
 * Layout (two columns on desktop, stacked on mobile):
 *  Left  → Headline, subheadline, CTA buttons
 *  Right → Animated product UI mockup (article cards + graph nodes + tags)
 *
 * Animations (Motion One):
 *  - Left content: staggered fade-in on mount
 *  - Right mockup: continuous floating animation (up/down oscillation)
 *  - Graph node dots: individual floating with different speeds/delays
 *
 * The hero mockup is a visual representation of Relic's interface —
 * saved article cards, connected knowledge nodes, and semantic tags.
 */

"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";

/**
 * Mock saved article data shown in the hero UI preview.
 * This represents what a user's saved knowledge looks like inside Relic.
 */
const MOCK_ARTICLES = [
  {
    id: 1,
    title: "Building Scalable Systems with Redis",
    source: "blog.redis.io",
    timeAgo: "2h ago",
    tags: ["redis", "backend", "caching"],
    icon: "ri-server-line",
  },
  {
    id: 2,
    title: "The Future of AI-Powered Search",
    source: "research.openai.com",
    timeAgo: "1d ago",
    tags: ["ai", "search", "llm"],
    icon: "ri-robot-line",
  },
  {
    id: 3,
    title: "System Design: Kafka at Scale",
    source: "engineering.kafka.apache.org",
    timeAgo: "3d ago",
    tags: ["kafka", "system design"],
    icon: "ri-node-tree",
  },
];

/**
 * HeroSection
 * Full-viewport introductory section with animated content and product mockup.
 */
export function HeroSection() {
  // Refs for triggering Motion One entrance animations
  const leftContentRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // -----------------------------------------------------------------------
    // Staggered fade-in for the left content children (headline → sub → CTAs)
    // Motion One's stagger() adds increasing delay to each child element
    // -----------------------------------------------------------------------
    if (leftContentRef.current) {
      animate(
        leftContentRef.current.children,
        { opacity: [0, 1], y: [30, 0] },
        { duration: 0.7, delay: stagger(0.12), easing: "ease-out" }
      );
    }

    // -----------------------------------------------------------------------
    // Continuous floating animation for the product mockup
    // The mockup bobs up and down infinitely to give it life
    // -----------------------------------------------------------------------
    if (mockupRef.current) {
      // Initial entrance: fade in + slide up
      animate(
        mockupRef.current,
        { opacity: [0, 1], y: [40, 0] },
        { duration: 0.8, delay: 0.3, easing: "ease-out" }
      );

      // Then start the infinite float loop
      animate(
        mockupRef.current,
        { y: [0, -12, 0] },
        { duration: 5, repeat: Infinity, easing: "ease-in-out" }
      );
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">

      {/* ----------------------------------------------------------------
          Background: Radial gradient glow effect behind the hero content.
          Creates a soft ambient light feeling around the center.
          ---------------------------------------------------------------- */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">

        {/* ----------------------------------------------------------------
            LEFT: Headline, subheadline, CTA buttons
            All children are animated with staggered fade-in via Motion One
            ---------------------------------------------------------------- */}
        <div ref={leftContentRef} className="flex flex-col gap-6">

          {/* Small badge above the headline — draws attention first */}
          <div className="flex">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-accent/10 border border-accent/20 text-accent">
              <i className="ri-sparkling-line text-sm" aria-hidden="true" />
              Knowledge memory, reimagined
            </span>
          </div>

          {/* Main headline — uses Space Grotesk for maximum impact */}
          <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-semibold text-text-primary leading-[1.08] tracking-tight">
            Your Internet
            <br />
            Knowledge,{" "}
            <span className="gradient-text">Remembered.</span>
          </h1>

          {/* Subheadline — explains the product value in plain language */}
          <p className="text-text-secondary text-lg leading-relaxed max-w-[520px]">
            Relic captures everything you discover online and organizes it into
            a living knowledge system that connects ideas, surfaces forgotten
            insights, and makes information searchable by meaning.
          </p>

          {/* CTA buttons — primary "Create Account", secondary "Sign In" */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="primary" className="text-base px-7 py-3.5">
              <i className="ri-user-add-line" aria-hidden="true" />
              Create Account
            </Button>
            <Button variant="secondary" className="text-base px-7 py-3.5">
              <i className="ri-login-box-line" aria-hidden="true" />
              Sign In
            </Button>
          </div>

          {/* Social proof line */}
          <p className="text-text-secondary text-sm">
            Join{" "}
            <span className="text-text-primary font-medium">2,400+</span>{" "}
            researchers, developers, and knowledge workers
          </p>
        </div>

        {/* ----------------------------------------------------------------
            RIGHT: Product UI Mockup
            A mock UI card showing what Relic looks like inside:
            saved article cards, knowledge graph nodes, semantic tags.
            Uses Motion One for the floating animation.
            ---------------------------------------------------------------- */}
        <div
          ref={mockupRef}
          className="opacity-0 relative"
          aria-label="Relic app preview"
        >
          {/* Outer mockup frame — resembles a mini browser/app window */}
          <div className="bg-surface border border-white/[0.08] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">

            {/* Window chrome — three dots like a macOS title bar */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="ml-3 text-xs text-text-secondary font-mono">
                relic.app / library
              </span>
            </div>

            <div className="p-4 space-y-3">
              {/* Render each mock saved article as a card */}
              {MOCK_ARTICLES.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}

              {/* Graph nodes preview — a mini knowledge graph hint */}
              <GraphNodesPreview />
            </div>
          </div>

          {/* Floating accent badge — top right corner of the mockup */}
          <div className="absolute -top-3 -right-3 bg-accent rounded-xl px-3 py-2 text-white text-xs font-medium shadow-glow">
            <i className="ri-brain-line mr-1.5" aria-hidden="true" />
            312 memories saved
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
   Sub-components used only within HeroSection
   These are defined here since they are small and tightly coupled to the hero.
   ------------------------------------------------------------------------- */

/** Props for a single article card in the mockup */
interface ArticleData {
  id: number;
  title: string;
  source: string;
  timeAgo: string;
  tags: string[];
  icon: string;
}

/**
 * ArticleCard
 * Renders a single saved article card in the hero product mockup.
 */
function ArticleCard({ article }: { article: ArticleData }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors">
      {/* Icon representing the article's content category */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
        <i className={`${article.icon} text-accent text-sm`} aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Article title — truncated if too long */}
        <p className="text-text-primary text-sm font-medium leading-snug truncate">
          {article.title}
        </p>
        {/* Source URL and time saved */}
        <p className="text-text-secondary text-xs mt-0.5">
          {article.source} · {article.timeAgo}
        </p>
        {/* Semantic tags auto-generated by Relic */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="default" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * GraphNodesPreview
 * Shows a mini knowledge graph with connected nodes at the bottom
 * of the hero mockup to hint at the Knowledge Graph feature.
 */
function GraphNodesPreview() {
  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <p className="text-text-secondary text-xs mb-3">Knowledge connections</p>

      <div className="relative h-20">
        {/* SVG connecting lines drawn between nodes */}
        <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
          <line x1="15%" y1="50%" x2="50%" y2="30%" stroke="rgba(107,138,253,0.3)" strokeWidth="1" />
          <line x1="50%" y1="30%" x2="85%" y2="50%" stroke="rgba(107,138,253,0.3)" strokeWidth="1" />
          <line x1="50%" y1="30%" x2="50%" y2="75%" stroke="rgba(107,138,253,0.3)" strokeWidth="1" />
          <line x1="15%" y1="50%" x2="50%" y2="75%" stroke="rgba(107,138,253,0.2)" strokeWidth="1" strokeDasharray="3 3" />
        </svg>

        {/* Node dots with labels */}
        {[
          { label: "Redis", x: "12%", y: "40%" },
          { label: "Postgres", x: "44%", y: "15%" },
          { label: "Kafka", x: "78%", y: "40%" },
          { label: "System Design", x: "40%", y: "68%" },
        ].map((node) => (
          <div
            key={node.label}
            className="absolute flex flex-col items-center gap-1"
            style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_rgba(107,138,253,0.7)]" />
            <span className="text-[9px] text-text-secondary whitespace-nowrap">{node.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
