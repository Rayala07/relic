/**
 * landing/components/Footer.tsx
 *
 * Minimal footer for the Relic landing page.
 *
 * Structure (two rows):
 *  Top row:
 *   - Left:  Logo + tagline
 *   - Right: 4 link columns (Product, Company, Legal, Connect)
 *
 *  Bottom row:
 *   - Left:  Copyright notice
 *   - Right: "Made with ❤" note
 *
 * The footer intentionally stays very minimal — light text, no heavy boxes,
 * just a clean landing point at the bottom of the page.
 */

import Image from "next/image";
import Link from "next/link";

/** Footer link group data. Each group has a heading and array of links. */
const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Extension", href: "#extension" },
      { label: "Knowledge Graph", href: "#graph" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "API", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
];

/**
 * Footer
 * Minimal, well-organized page footer with logo, link columns, and copyright.
 */
export function Footer() {
  return (
    <footer className="bg-background border-t border-white/[0.08]" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6">

        {/* ----------------------------------------------------------------
            Top section: Logo/tagline + link columns
            ---------------------------------------------------------------- */}
        <div className="py-16 grid lg:grid-cols-5 gap-12">

          {/* Brand column — takes 2/5 of the grid on large screens */}
          <div className="lg:col-span-2 space-y-4">
            {/* Logo + wordmark */}
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <Image
                src="/logo.png"
                alt="Relic logo"
                width={24}
                height={24}
                className="object-contain"
              />
              <span className="font-display font-semibold text-text-primary tracking-tight">
                Relic
              </span>
            </Link>

            {/* Tagline */}
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              Your internet knowledge, remembered. Capture, understand,
              connect, and resurface everything that matters.
            </p>

            {/* Social icons row */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: "ri-twitter-x-line", label: "Twitter/X", href: "#" },
                { icon: "ri-github-line", label: "GitHub", href: "#" },
                { icon: "ri-linkedin-line", label: "LinkedIn", href: "#" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="
                    w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.02]
                    flex items-center justify-center
                    text-text-secondary hover:text-text-primary
                    hover:border-white/[0.16] hover:bg-white/[0.06]
                    transition-all duration-200
                  "
                >
                  <i className={`${social.icon} text-sm`} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns — each takes 1/5 of the grid */}
          {FOOTER_LINKS.map((group) => (
            <div key={group.heading}>
              <h3 className="text-text-primary text-sm font-semibold mb-4">
                {group.heading}
              </h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-text-secondary text-sm hover:text-text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ----------------------------------------------------------------
            Bottom bar: copyright + made-with note
            ---------------------------------------------------------------- */}
        <div className="py-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-secondary text-xs">
            © {new Date().getFullYear()} Relic. All rights reserved.
          </p>
          <p className="text-text-secondary text-xs">
            Built for the knowledge-obsessed.
          </p>
        </div>

      </div>
    </footer>
  );
}
