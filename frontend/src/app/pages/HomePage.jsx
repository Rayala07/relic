import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import Lenis from "lenis";
import { useUser } from "../../features/auth/components/AuthProvider";
import HeroSearchDemo from "./components/HeroSearchDemo";
import SourceMarquee from "./components/SourceMarquee";
import ProcessSteps from "./components/ProcessSteps";
import FeatureGrid from "./components/FeatureGrid";
import SpecLedger from "./components/SpecLedger";
import SiteFooter from "./components/SiteFooter";

// No Web Store listing yet — point at the real thing rather than a dead button.
const EXTENSION_URL = "https://github.com/Rayala07/relic/tree/main/extension";

const EASE = [0.16, 1, 0.3, 1];

/* Every section opens the same way: index, rule, label, then the statement.
   The repetition is the structure — it's what turns five blocks into one page. */
const SectionHeader = ({ index, label, title, lead }) => (
  <div className="w-full max-w-[1200px] mx-auto mb-14 md:mb-20">
    <div className="flex items-center gap-5 mb-10">
      <span className="text-muted-foreground text-[10px] tracking-[0.16em] tabular-nums shrink-0">
        {index}
      </span>
      <span className="h-px flex-1 bg-border" />
      <span className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase shrink-0">
        {label}
      </span>
    </div>

    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: EASE }}
      className="text-foreground max-w-[760px]"
      style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15 }}
    >
      {title}
    </motion.h2>

    {lead && (
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        className="text-muted-foreground text-[15px] leading-relaxed mt-6 max-w-[58ch]"
      >
        {lead}
      </motion.p>
    )}
  </div>
);

const HomePage = () => {
  const { user, isLoaded } = useUser();
  const reduced = useReducedMotion();

  // Initialise Lenis for subtle smooth scrolling on the home page only
  useEffect(() => {
    if (reduced) return; // Respect OS reduced motion preference

    const lenis = new Lenis({
      lerp: 0.08, // Subtle smoothness
      wheelMultiplier: 1,
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [reduced]);

  const scrollToId = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  const primaryCta = user
    ? { label: "OPEN YOUR LIBRARY", to: "/library" }
    : { label: "START YOUR ARCHIVE", to: "/register" };

  return (
    <div className="home w-full flex flex-col items-center">

      {/* ═══════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════ */}
      <section className="w-full relative overflow-hidden grain px-6 pt-[clamp(56px,9vh,104px)] pb-20 md:pb-28">
        <div className="hairline-grid absolute inset-0 pointer-events-none" aria-hidden />

        <div className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col items-center text-center">

          {/* Overline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="flex items-center gap-4 mb-12"
          >
            <span className="h-px w-8 bg-border" />
            <span className="text-muted-foreground text-[10px] tracking-[0.22em] uppercase">
              Personal web archive
            </span>
            <span className="h-px w-8 bg-border" />
          </motion.div>

          <h1
            className="text-foreground flex flex-col items-center mb-8"
            style={{ fontSize: "clamp(42px, 7.5vw, 88px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 }}
          >
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: EASE }}
            >
              Everything you meant
            </motion.span>
            {/* Serif italic against the geometric sans — the one typographic
                contrast the page allows itself */}
            <motion.span
              className="block font-display"
              style={{ fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.01em" }}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.22, ease: EASE }}
            >
              to come back to.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
            className="text-muted-foreground max-w-[62ch] mb-12"
            style={{ fontSize: "clamp(15px, 1.5vw, 17px)", lineHeight: 1.65 }}
          >
            Relic saves articles, PDFs, videos and threads the moment you find them — then
            reads and indexes every one. Months later you find it by describing it, not by
            remembering where it went.
          </motion.p>

          {/* Auth-aware, and held at opacity 0 until the session resolves so the
              label never visibly swaps under the user */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
            className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-20"
          >
            <div className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
              <Link
                to={primaryCta.to}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 uppercase inline-block shadow-lg hover:shadow-xl hover:-translate-y-0.5 no-underline"
                style={{ fontSize: "12px", letterSpacing: "0.1em", padding: "18px 40px", fontWeight: 600 }}
              >
                {primaryCta.label}
              </Link>
            </div>

            <a
              href="#how"
              onClick={scrollToId("how")}
              className="group text-muted-foreground hover:text-foreground transition-colors duration-150 uppercase no-underline flex items-center gap-2"
              style={{ fontSize: "12px", letterSpacing: "0.1em" }}
            >
              See how it works
              <span className="transition-transform duration-200 group-hover:translate-y-0.5">↓</span>
            </a>
          </motion.div>

          {/* The demo carries the pitch — it shows the retrieval, rather than claiming it */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.65, ease: EASE }}
            className="w-full max-w-[720px]"
          >
            <HeroSearchDemo />
          </motion.div>

          {/* Capability rail */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
            className="w-full max-w-[720px] grid grid-cols-1 sm:grid-cols-3 border-x border-b border-border divide-y sm:divide-y-0 sm:divide-x divide-border"
          >
            {["Search by meaning", "One-click capture", "Summarised on save"].map((item) => (
              <span
                key={item}
                className="text-muted-foreground text-[10px] tracking-[0.14em] uppercase py-4 px-3"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <SourceMarquee />

      {/* ═══════════════════════════════════════════════════════════
          01 — HOW IT WORKS
          ═══════════════════════════════════════════════════════════ */}
      <section id="how" className="w-full px-6 py-24 md:py-32 scroll-mt-[72px]">
        <SectionHeader
          index="01"
          label="How it works"
          title={
            <>
              Save it once.{" "}
              <span className="text-muted-foreground">Then stop thinking about filing it.</span>
            </>
          }
          lead="Three steps, two of which happen without you. The only work you do is deciding something is worth keeping."
        />
        <ProcessSteps />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          02 — WHAT YOU GET
          ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="w-full px-6 py-24 md:py-32 border-t border-border scroll-mt-[72px]">
        <SectionHeader
          index="02"
          label="What you get"
          title={
            <>
              A library that gets{" "}
              <span className="font-display" style={{ fontStyle: "italic", fontWeight: 400 }}>
                more useful
              </span>{" "}
              the more you feed it.
            </>
          }
          lead="Every save adds context to the ones already there — which is why the archive gets easier to search as it grows, instead of harder."
        />
        <FeatureGrid />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          03 — UNDER THE HOOD
          ═══════════════════════════════════════════════════════════ */}
      <section className="w-full px-6 py-24 md:py-32 border-t border-border">
        <SectionHeader
          index="03"
          label="Under the hood"
          title="Built like infrastructure, not a demo."
          lead="A real retrieval pipeline behind a deliberately quiet interface. Here's what's actually running."
        />
        <SpecLedger />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          EXTENSION — inverted panel, the page's one loud moment
          ═══════════════════════════════════════════════════════════ */}
      <section id="chrome-extension" className="w-full px-6 py-24 md:py-32 border-t border-border scroll-mt-[72px]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="w-full max-w-[1200px] mx-auto bg-foreground text-background px-8 sm:px-14 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-14 lg:gap-20 items-center"
        >
          <div>
            <div className="flex items-center gap-4 mb-8">
              <span className="h-px w-8 bg-background/30" />
              <span className="text-background/60 text-[10px] tracking-[0.22em] uppercase">
                Browser extension
              </span>
            </div>

            <h2
              className="mb-6"
              style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15 }}
            >
              Never break your flow to save something.
            </h2>

            <p className="text-background/60 text-[15px] leading-relaxed max-w-[52ch] mb-12">
              One keystroke files the page you're reading — article, paper, video or thread —
              and the pipeline takes it from there. You stay in the tab.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <a
                href={EXTENSION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background text-foreground hover:opacity-90 transition-all duration-200 uppercase inline-block no-underline hover:-translate-y-0.5"
                style={{ fontSize: "12px", letterSpacing: "0.1em", padding: "18px 36px", fontWeight: 600 }}
              >
                Get the extension
              </a>
              <span className="text-background/50 text-[10px] tracking-[0.14em] uppercase">
                Manifest V3 · install from source
              </span>
            </div>
          </div>

          {/* Capture mock, inverted to match the panel */}
          <div className="w-full border border-background/20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-background/20">
              <span className="text-background/50 text-[10px] tracking-[0.14em] uppercase">Relic</span>
              <span className="w-1.5 h-1.5 bg-background/70" />
            </div>
            <div className="px-4 py-5 flex flex-col gap-4">
              <span className="text-background text-[13px] leading-snug">
                Designing for retrieval, not storage
              </span>
              <div className="flex flex-col gap-1.5">
                <span className="block h-px w-full bg-background/25" />
                <span className="block h-px w-[88%] bg-background/25" />
                <span className="block h-px w-[62%] bg-background/25" />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["archives", "ux", "search"].map((tag) => (
                  <span
                    key={tag}
                    className="border border-background/25 text-background/60 text-[9px] tracking-[0.08em] uppercase px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-4 py-3 border-t border-background/20 flex items-center justify-between">
              <span className="text-background/50 text-[10px] tracking-[0.14em] uppercase">Saved</span>
              <span className="text-background/50 text-[10px] tracking-[0.14em] uppercase tabular-nums">
                ⌘ + S
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <SiteFooter />
    </div>
  );
};

export default HomePage;
