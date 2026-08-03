import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useInView, useReducedMotion } from "motion/react";
import { useUser } from "../../../features/auth/components/AuthProvider";

const REPO_URL = "https://github.com/Rayala07/relic";
const EMAIL = "developer.rayala@gmail.com";

// Spaces are load-bearing: text-align-last: justify expands them to push the
// R and the C flush against the container edges.
const WORDMARK = "R E L I C";

/**
 * Faint monochrome base with an amber copy stacked on top. The colour arrives
 * through a feathered mask sweep the first time the footer enters view — the
 * animation itself is CSS (see .wordmark-fill), this only decides when.
 */
const Wordmark = () => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-64px" });

  return (
    <div ref={ref} className="relative w-full mt-6 select-none pointer-events-none" aria-hidden>
      <span className="wordmark-type font-heading text-foreground/[0.06]">{WORDMARK}</span>

      <span
        className={`wordmark-type wordmark-fill font-heading absolute inset-0 ${
          inView || reduced ? "is-lit" : ""
        }`}
      >
        {WORDMARK}
      </span>
    </div>
  );
};

const ColumnHeading = ({ children }) => (
  <h4
    className="text-foreground uppercase tracking-[0.16em] font-semibold mb-6"
    style={{ fontSize: "10px" }}
  >
    {children}
  </h4>
);

const linkClass =
  "text-muted-foreground hover:text-foreground transition-colors duration-150 text-[13px] w-fit no-underline";

const ExternalLink = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`${linkClass} group inline-flex items-center gap-1.5`}
  >
    {children}
    <span
      className="text-[10px] opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-60 group-hover:translate-x-0"
      aria-hidden
    >
      ↗
    </span>
  </a>
);

const SiteFooter = () => {
  const { user, isLoaded } = useUser();
  const reduced = useReducedMotion();

  const scrollToId = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  const cta = user
    ? { label: "Open your library", to: "/library" }
    : { label: "Start your archive", to: "/register" };

  // Second column follows the session: signed-in visitors get the app, everyone
  // else gets the way in.
  const accountLinks = user
    ? [
        { label: "Library", to: "/library" },
        { label: "Collections", to: "/collections" },
        { label: "Save an item", to: "/save" },
        { label: "Search", to: "/search" },
      ]
    : [
        { label: "Create account", to: "/register" },
        { label: "Sign in", to: "/login" },
      ];

  return (
    <footer className="w-full px-6 border-t border-border bg-background">
      <div className="w-full max-w-[1200px] mx-auto">

        {/* ── Brand + navigation ─────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-x-8 gap-y-14 pt-20 pb-14">

          <div className="col-span-2 md:col-span-1 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-6">
              <img src="/Relic_logo.png" alt="" className="w-5 h-5 object-contain opacity-80" />
              <span className="text-foreground font-heading font-bold tracking-[0.18em] text-sm">
                RELIC
              </span>
            </div>

            <p className="text-muted-foreground text-[13px] leading-relaxed max-w-[34ch] mb-8">
              Don't just surf the internet — curate it. An archive that reads what you save,
              so you can find it again by describing it.
            </p>

            <div className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
              <Link
                to={cta.to}
                className="group inline-flex items-center gap-2 border border-border hover:border-foreground text-foreground no-underline transition-colors duration-200 px-5 py-3"
                style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase" }}
              >
                {cta.label}
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <ColumnHeading>Product</ColumnHeading>
            <a href="#how" onClick={scrollToId("how")} className={linkClass}>
              How it works
            </a>
            <a href="#features" onClick={scrollToId("features")} className={linkClass}>
              Features
            </a>
            <a href="#chrome-extension" onClick={scrollToId("chrome-extension")} className={linkClass}>
              Extension
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <ColumnHeading>Account</ColumnHeading>
            <div className={`flex flex-col gap-4 transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
              {accountLinks.map((link) => (
                <Link key={link.label} to={link.to} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <ColumnHeading>Elsewhere</ColumnHeading>
            <ExternalLink href={REPO_URL}>GitHub</ExternalLink>
            <ExternalLink href="https://x.com/ReyZox_07">X</ExternalLink>
            <ExternalLink href="https://www.linkedin.com/in/rayala07/">LinkedIn</ExternalLink>
            <a href={`mailto:${EMAIL}`} className={linkClass}>
              Email
            </a>
          </div>
        </div>

        <Wordmark />

        {/* ── Bottom bar ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-10 py-8 border-t border-border">
          <span className="text-muted-foreground text-[11px]">
            © {new Date().getFullYear()} Relic. All rights reserved.
          </span>
          <span className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase">
            [ Made to remember ]
          </span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
