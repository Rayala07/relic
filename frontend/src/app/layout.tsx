/**
 * app/layout.tsx
 *
 * Root layout for the entire Next.js application.
 *
 * This file wraps every page and is responsible for:
 *  1. Loading Google Fonts (Inter + Space Grotesk) via next/font
 *  2. Setting up the HTML document structure (<html>, <head>, <body>)
 *  3. Wrapping the app in the Redux Provider for global state access
 *  4. Injecting CSS font variables so Tailwind can use them
 *
 * next/font automatically:
 *  - Downloads the fonts at build time (no runtime fetch)
 *  - Generates a CSS custom property (variable) for each font
 *  - Prevents layout shift (FOUT) by self-hosting the fonts
 */

import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ReduxProvider } from "@/store/provider";
import "./globals.css";

/* -----------------------------------------------------------------------
   Font Configurations
   `variable` creates a CSS custom property that Tailwind references.
   Inter → --font-inter (used for body text, UI)
   Space Grotesk → --font-space-grotesk (used for all headings)
   ----------------------------------------------------------------------- */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // Show fallback font while loading (better UX)
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

/* -----------------------------------------------------------------------
   SEO Metadata
   Next.js automatically populates <title> and <meta> tags from this object.
   ----------------------------------------------------------------------- */
export const metadata: Metadata = {
  title: "Relic — Your Internet Knowledge, Remembered",
  description:
    "Relic captures everything you discover online and organizes it into a living knowledge system that connects ideas, surfaces forgotten insights, and makes information searchable by meaning.",
  keywords: ["knowledge management", "bookmarks", "second brain", "PKM", "AI", "research"],
  openGraph: {
    title: "Relic — Your Internet Knowledge, Remembered",
    description:
      "Capture, understand, connect, and resurface everything you save online.",
    type: "website",
  },
};

/**
 * RootLayout
 * The top-level component that wraps every page in the application.
 * Fonts are applied by injecting CSS variables into the <html> element.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // Inject both font CSS variables into the document so Tailwind
      // classes like `font-sans` and `font-display` can resolve them
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="font-sans antialiased bg-background text-text-primary">
        {/*
         * ReduxProvider wraps the entire app so any component can
         * access or update global state using useSelector / useDispatch
         */}
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
