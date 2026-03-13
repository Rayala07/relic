/**
 * app/page.tsx
 *
 * Next.js App Router root page.
 *
 * When a user visits the root URL ("/"), Next.js renders this file.
 * It simply renders the <LandingPage /> component which contains
 * the entire Relic marketing landing page.
 *
 * Keeping this file thin (just delegating to LandingPage) is intentional —
 * it follows the separation of concerns principle: Next.js routing is
 * separate from the actual UI composition.
 */

import { LandingPage } from "@/landing/pages/LandingPage";

/**
 * Page (default export)
 * The root page component rendered at the "/" route.
 */
export default function Page() {
  return <LandingPage />;
}
