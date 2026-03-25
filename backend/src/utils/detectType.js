/**
 * detectType.js
 *
 * Automatically determines the content type of a saved item based on its URL.
 *
 * WHY automatic detection?
 * Relying on user input for `type` is unreliable — users may pick wrong
 * categories, omit the field, or the client may not always send it (e.g., the
 * Chrome extension). Deriving type from the URL keeps the data consistent and
 * removes the responsibility from the client entirely.
 *
 * WHY "webpage" as fallback?
 * "webpage" is the most generic and accurate description for any URL that
 * doesn't match a known pattern. "article" or "unknown" would be misleading
 * because we genuinely don't know the content type — "webpage" is honest.
 */

/**
 * Detects the content type of a URL based on its hostname and file extension.
 *
 * @param {string} url - The full URL of the saved item.
 * @returns {string} - One of: "youtube", "tweet", "pdf", "image", "webpage"
 */
const detectType = (url) => {
  try {
    const { hostname, pathname } = new URL(url);

    // ── Domain-based detection ───────────────────────────────────────────────
    // Check well-known platforms by hostname before looking at file extensions,
    // since platform URLs don't carry a meaningful file extension.

    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return "youtube";
    }

    if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
      return "tweet";
    }

    if (hostname.includes("github.com")) {
      return "repo";
    }

    // ── File extension-based detection ───────────────────────────────────────
    // Use pathname (not the full URL) to safely isolate the file part and
    // avoid false positives from query strings containing ".pdf", etc.

    const path = pathname.toLowerCase();

    if (path.endsWith(".pdf")) {
      return "pdf";
    }

    if (
      path.endsWith(".jpg") ||
      path.endsWith(".jpeg") ||
      path.endsWith(".png") ||
      path.endsWith(".webp") ||
      path.endsWith(".gif")
    ) {
      return "image";
    }

    // ── Default fallback ─────────────────────────────────────────────────────
    return "webpage";
  } catch {
    // URL parsing failed (malformed URL) — return the safest generic fallback.
    return "webpage";
  }
};

export default detectType;
