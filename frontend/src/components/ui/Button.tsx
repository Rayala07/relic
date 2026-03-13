/**
 * components/ui/Button.tsx
 *
 * Reusable Button component for the Relic landing page.
 *
 * This component provides two visual styles:
 *  - "primary"   → Solid accent-colored button with a glow on hover.
 *                  Used for main CTAs like "Create Account".
 *  - "secondary" → Transparent button with a subtle border.
 *                  Used for secondary actions like "Sign In".
 *
 * Both variants include:
 *  - Smooth hover transitions
 *  - Active (click) scale animation for tactile feedback
 *  - Full support for all standard HTML button attributes
 *
 * Usage:
 *   <Button variant="primary" onClick={...}>Create Account</Button>
 *   <Button variant="secondary" href="/signin">Sign In</Button>
 */

"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";

/** Accepted visual styles for the button */
type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Controls the visual appearance of the button */
  variant?: ButtonVariant;
  /** Button label text or any React child */
  children: ReactNode;
  /** Optional extra Tailwind classes to merge */
  className?: string;
}

/**
 * Button
 * A styled, accessible button component with hover and active animations.
 */
export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  /* -----------------------------------------------------------------------
     Base classes shared by both variants:
     - px-6 py-3      → comfortable padding
     - rounded-xl      → rounded corners (slightly pill-shaped)
     - text-sm font-medium → clean readable label
     - transition-all   → smooth property transitions
     - active:scale-95  → slight scale-down on click (tactile feedback)
     ----------------------------------------------------------------------- */
  const base =
    "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 cursor-pointer select-none";

  /* -----------------------------------------------------------------------
     Variant-specific styles
     ----------------------------------------------------------------------- */
  const variants: Record<ButtonVariant, string> = {
    // Solid fill button — accent background + white text + glow on hover
    primary:
      "bg-accent text-white hover:bg-accent-hover hover:shadow-glow hover:-translate-y-0.5",

    // Ghost / outline button — transparent background + subtle border
    secondary:
      "bg-transparent text-text-primary border border-white/10 hover:border-white/20 hover:bg-white/5 hover:-translate-y-0.5",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
