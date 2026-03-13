/**
 * landing/components/Navbar.tsx
 *
 * Sticky top navigation bar for the Relic landing page.
 *
 * Behavior:
 *  - Starts transparent (blends into the dark hero background)
 *  - On scroll past 20px, a frosted-glass blur background fades in
 *  - Uses Redux to store the scroll state so any component can read it
 *
 * Structure:
 *  Left  → Relic logo (image + wordmark)
 *  Right → Navigation links + Sign In button
 *
 * The scroll listener is registered in a useEffect and cleaned up on unmount.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setNavScrolled } from "@/landing/reduxSlice/landingSlice";
import type { RootState } from "@/store/store";

/** Navigation link items rendered in the right side of the navbar */
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Docs", href: "#" },
];

/**
 * Navbar
 * Sticky top nav bar that blurs in on scroll and houses the logo + nav links.
 */
export function Navbar() {
  const dispatch = useDispatch();
  // Read the scroll state from Redux to conditionally apply the blur class
  const navScrolled = useSelector((state: RootState) => state.landing.navScrolled);

  useEffect(() => {
    /**
     * handleScroll
     * Fires whenever the user scrolls.
     * Dispatches an action to toggle the navbar background.
     */
    const handleScroll = () => {
      // If scrolled more than 20px, mark the navbar as "scrolled"
      dispatch(setNavScrolled(window.scrollY > 20));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup: remove the listener when the component unmounts
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dispatch]);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-500 ease-in-out
        ${navScrolled
          ? "glass"       // Frosted glass background (defined in globals.css)
          : "bg-transparent"
        }
      `}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* ----------------------------------------------------------------
            LEFT: Logo
            Shows the Relic logo image and the brand wordmark side by side.
            ---------------------------------------------------------------- */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="Relic logo"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className="font-display font-semibold text-lg text-text-primary tracking-tight">
            Relic
          </span>
        </Link>

        {/* ----------------------------------------------------------------
            RIGHT: Navigation links + Sign In
            ---------------------------------------------------------------- */}
        <div className="flex items-center gap-8">
          {/* Nav link list — hidden on small screens, visible on md+ */}
          <ul className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="
                    text-sm text-text-secondary
                    hover:text-text-primary
                    transition-colors duration-200
                  "
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Sign In — styled as asubtle button */}
          <Link
            href="#"
            className="
              text-sm font-medium px-4 py-2 rounded-xl
              text-text-primary
              border border-white/10
              hover:border-white/20 hover:bg-white/5
              transition-all duration-200
            "
          >
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}
