import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { openSaveModal } from "../../../app/uiSlice";
import { useInView, useReducedMotion } from "motion/react";
import { useUser } from "../../../features/auth/components/AuthProvider";

const REPO_URL = "https://github.com/Rayala07/relic";
const EMAIL = "developer.rayala@gmail.com";

const Wordmark = () => {
  return (
    <div className="relative w-full mt-16 md:mt-24 mb-4 select-none pointer-events-none flex justify-center items-center overflow-hidden">
      {/* Subtle background glow for a premium feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[60%] bg-foreground/5 dark:bg-foreground/10 blur-[100px] rounded-[100%]" />
      
      {/* Crisp, massive brand mark */}
      <span className="relative z-10 font-heading font-extrabold text-[16vw] leading-[0.75] tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground/20">
        RELIC
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
  const dispatch = useDispatch();

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
        { label: "Save an item", action: "save" },
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
        <div className="flex flex-col md:flex-row justify-between gap-y-14 gap-x-8 pt-20 pb-14">

          {/* Left: Brand & CTA */}
          <div className="w-full md:w-[40%] flex flex-col items-start">
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

          {/* Right: Navigation Links */}
          <div className="w-full md:w-auto grid grid-cols-2 md:grid-cols-3 gap-x-12 lg:gap-x-24 gap-y-10">
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
                {accountLinks.map((link) => {
                  if (link.action === "save") {
                    return (
                      <button
                        key={link.label}
                        onClick={() => dispatch(openSaveModal())}
                        className={`${linkClass} bg-transparent border-none cursor-pointer text-left w-fit p-0`}
                      >
                        {link.label}
                      </button>
                    );
                  }
                  return (
                    <Link key={link.label} to={link.to} className={linkClass}>
                      {link.label}
                    </Link>
                  );
                })}
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
