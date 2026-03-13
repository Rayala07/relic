/**
 * components/ui/Card.tsx
 *
 * Reusable surface card component for the Relic landing page.
 *
 * Cards are used throughout the page for:
 *  - Feature highlight items
 *  - "How it works" steps
 *  - Problem blocks
 *  - Preview UI mockups
 *
 * By default the card has:
 *  - Surface background (#111113)
 *  - Subtle border and box shadow
 *  - Hover lift animation (slight upward translate + border brightening)
 *
 * Usage:
 *   <Card>Your content here</Card>
 *   <Card className="p-8" hover={false}>No hover effect</Card>
 */

"use client";

import { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Children to render inside the card */
  children: ReactNode;
  /** Whether to apply the hover lift animation (default: true) */
  hover?: boolean;
  /** Additional Tailwind classes */
  className?: string;
}

/**
 * Card
 * Base surface card with optional hover lift effect.
 */
export function Card({ children, hover = true, className = "", ...props }: CardProps) {
  /* -----------------------------------------------------------------------
     Base styles applied to every card:
     - bg-surface        → slightly lighter than the page background
     - border            → rgba(255,255,255,0.08) subtle border line
     - rounded-2xl       → soft rounded corners
     - shadow-card       → custom box shadow from tailwind.config.ts
     ----------------------------------------------------------------------- */
  const base = "bg-surface border border-white/[0.08] rounded-2xl shadow-card";

  /* -----------------------------------------------------------------------
     Hover animation classes (conditional):
     - hover:-translate-y-1   → lift 4px upward
     - hover:border-white/[0.12] → slightly brightened border on hover
     - hover:shadow-glow      → subtle accent glow appears below card
     - transition-all          → smoothly animate all changed properties
     ----------------------------------------------------------------------- */
  const hoverClasses = hover
    ? "transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-glow cursor-pointer"
    : "";

  return (
    <div className={`${base} ${hoverClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}
