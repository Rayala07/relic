/**
 * components/ui/Badge.tsx
 *
 * Small tag/label chip component used throughout the landing page.
 *
 * Used for displaying topic tags on saved articles (e.g. "redis", "ai"),
 * feature labels, and category indicators.
 *
 * Variants:
 *  - "default"  → Subtle blue tint — used for topic/category tags
 *  - "outline"  → Transparent with border — for neutral labels
 *  - "accent"   → Full accent color — for highlighted tags
 *
 * Usage:
 *   <Badge>redis</Badge>
 *   <Badge variant="outline">system design</Badge>
 *   <Badge variant="accent">New</Badge>
 */

import { ReactNode } from "react";

type BadgeVariant = "default" | "outline" | "accent";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

/**
 * Badge
 * A small inline chip/tag for categorization and labeling.
 */
export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  /* Shared base: small text, pill shape, no text wrapping */
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap";

  const variants: Record<BadgeVariant, string> = {
    // Subtle blue tint background (translucent accent)
    default: "bg-accent/10 text-accent border border-accent/20",
    // Transparent with muted border
    outline: "bg-transparent text-text-secondary border border-white/10",
    // Full accent color (more prominent)
    accent: "bg-accent text-white",
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
