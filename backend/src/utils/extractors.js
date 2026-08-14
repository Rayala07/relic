import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { describeImage } from "../services/ai.service.js";
import { YoutubeTranscript } from "youtube-transcript/dist/youtube-transcript.esm.js";

import { PDFParse } from "pdf-parse";

/**
 * extractors.js
 *
 * One dedicated function per URL type. Every function returns the SAME shape:
 *   { title, body, author, excerpt }
 *
 * This consistency is the key design decision — the pipeline and DB write
 * code never needs to know which extractor actually ran. It always gets
 * the same object back regardless of source type.
 *
 * Fallback strategy (for webpages):
 *   1. Try Readability (Mozilla's Reader Mode engine) — best quality
 *   2. Fall back to OG meta tags (og:title / og:description) — always present
 */

// ── Known bot-protected domains — skip direct HTTP fetch entirely ────────────
// These sites return HTTP 200 with a fake maintenance/block page when they
// detect a non-browser request. Direct fetch always fails for them.
// Jina's infrastructure uses real headless browsers that bypass this.
const DIRECT_FETCH_BLOCKED_DOMAINS = new Set([
  "myntra.com",
  "flipkart.com",
  "amazon.in",
  "amazon.com",
  "nykaa.com",
  "ajio.com",
  "meesho.com",
  "snapdeal.com",
  "tatacliq.com",
  "reliancedigital.in",
]);

// ── Poisoned content detector ─────────────────────────────────────────────────
// Some sites (especially e-commerce) return HTTP 200 with a fake maintenance
// page instead of a real 403. The extractor happily parses it as real content.
// This function fingerprints the most common "trap page" signals in the first
// 400 characters of extracted text, triggering a Jina escalation.
const POISON_FINGERPRINTS = [
  "site maintenance",
  "under maintenance",
  "contact your administrator",
  "contact the administrator",
  "temporarily unavailable",
  "will be back soon",
  "we'll be back",
  "we are back soon",
  "maintenance mode",
  "service unavailable",
  "access denied",
  "enable javascript",
  "please enable cookies",
  "checking your browser",
  "security check",
  "ddos protection",
  "just a moment",   // Cloudflare challenge page
];

function isPoisonedContent(body) {
  const sample = body.slice(0, 600).toLowerCase();
  return POISON_FINGERPRINTS.some((fp) => sample.includes(fp));
}

// ── Shared HTTP client ───────────────────────────────────────────────────────
// Full browser-like headers to pass most basic bot detection.
// User-Agent alone is not enough — sites also check Accept, Accept-Language, etc.
const http = axios.create({
  timeout: 15000,
  headers: {
    "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control":   "no-cache",
    "Pragma":          "no-cache",
  },
});

// ── Shared result normaliser ─────────────────────────────────────────────────
// Always returns the same shape. Missing fields default to empty string.
function normalise({ title, body, author, excerpt } = {}) {
  const safeTitle = (title || "").trim();
  const safeBody = (body || "").replace(/\s+/g, " ").trim();
  const safeAuthor = (author || "").trim();
  const safeExcerpt = (excerpt || "").trim() || safeBody.slice(0, 300);

  return {
    title: safeTitle,
    body: safeBody,
    author: safeAuthor,
    excerpt: safeExcerpt,
  };
}

// ── Jina Reader fallback ─────────────────────────────────────────────────────
// Jina AI's r.jina.ai proxy fetches, renders JS, and returns clean markdown.
// Used when direct HTTP fetch gets a 403 (bot protection) or a JS-only SPA.
// Free, no API key, no extra npm packages — just a different fetch URL.
async function jinaFallback(url) {
  const jinaUrl = `https://r.jina.ai/${url}`;
  const { data: markdown } = await axios.get(jinaUrl, {
    timeout: 20000,
    headers: { "Accept": "text/plain" },
  });

  // Jina returns markdown — first line is usually the title (# Heading)
  const lines     = markdown.split("\n").filter((l) => l.trim());
  const titleLine = lines.find((l) => l.startsWith("# "));
  const title     = titleLine ? titleLine.replace(/^#\s+/, "").trim() : "";
  const body      = lines.filter((l) => !l.startsWith("# ")).join(" ");

  return normalise({ title, body });
}

// ── Webpage extractor ────────────────────────────────────────────────────────
// Handles: webpage, repo (GitHub) — both are normal HTML pages.
// Strategy:
//   1. Direct HTTP fetch + Readability (fastest, works on most sites)
//   2. OG meta tags (if Readability finds no article)
//   3. Jina Reader (if 403 OR if extracted body is suspiciously short — SPA signal)
//
// The thin-content threshold (200 words) catches JS-heavy SPAs that return 200
// but serve a near-empty HTML shell — e.g. GeeksforGeeks, Medium, Notion.
// In these cases Readability or OG tags only get a generic site description,
// not the actual article. Jina re-fetches with a real headless browser.
const MIN_BODY_WORDS = 200;

export async function extractWebpage(url) {
  // ── Domain blocklist check — skip direct fetch for known bot-protected sites ──
  // Resolves the specific Myntra/Flipkart/Amazon class of bug where the site
  // returns HTTP 200 with a fake maintenance page, poisoning the summary.
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    if (DIRECT_FETCH_BLOCKED_DOMAINS.has(hostname)) {
      console.log(`[Extractor] ${hostname} is on the blocked-domain list — routing straight to Jina.`);
      return jinaFallback(url);
    }
  } catch {
    // malformed URL — let the fetch below fail naturally
  }

  try {
    const { data: html } = await http.get(url);

    // jsdom creates a virtual browser DOM from the raw HTML string.
    // Passing { url } lets Readability resolve relative links correctly.
    const dom     = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();

    if (article) {
      const result    = normalise({
        title:   article.title,
        body:    article.textContent,
        author:  article.byline,
        excerpt: article.excerpt,
      });

      // ── Poisoned content check ──────────────────────────────────────────────
      // Catches sites that return HTTP 200 with a fake maintenance/block page.
      // Readability happily parses it — we need to detect and reject it.
      if (isPoisonedContent(result.body)) {
        console.log(`[Extractor] Poisoned content detected for ${url} — escalating to Jina.`);
        return jinaFallback(url);
      }

      const wordCount = result.body.split(" ").filter(Boolean).length;

      // If Readability found something but it's suspiciously short, the page
      // is likely a SPA — the static HTML only has a tiny content stub.
      if (wordCount < MIN_BODY_WORDS) {
        return jinaFallback(url);
      }

      return result;
    }

    // Readability returned null — try OG tags first (cheaper than Jina)
    const ogResult   = fallbackOgTags(dom, url);
    const ogWordCount = ogResult.body.split(" ").filter(Boolean).length;

    // OG description is also thin — definitely a SPA, escalate to Jina
    if (ogWordCount < MIN_BODY_WORDS) {
      return jinaFallback(url);
    }

    return ogResult;

  } catch (err) {
    // 403 = bot protection, 451 = geo/legal block (common in India for GDPR/regional law).
    // Jina's servers are in a different region and bypass both.
    if (err.response?.status === 403 || err.response?.status === 451) {
      return jinaFallback(url);
    }
    throw err; // any other error (network down, 404, etc.) — let pipeline catch it
  }
}

// ── PDF extractor ────────────────────────────────────────────────────────────
// Downloads the PDF as raw bytes (arraybuffer), then pdf-parse reads
// all text content from every page into a single string.
export async function extractPdf(url) {
  const { data } = await http.get(url, { responseType: "arraybuffer" });
  
  const parser = new PDFParse({ data: Buffer.from(data) });
  
  try {
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo();

    return normalise({
      // PDF metadata title if present, otherwise use the filename from the URL
      title: infoResult.info?.Title || decodeURIComponent(url.split("/").pop()),
      body:  textResult.text,
    });
  } finally {
    await parser.destroy();
  }
}

// ── YouTube extractor ────────────────────────────────────────────────────────
// Fetches the auto-generated or human-uploaded transcript for the video.
// Video ID is extracted from both URL formats:
//   - youtube.com/watch?v=VIDEO_ID
//   - youtu.be/VIDEO_ID
export async function extractYoutube(url) {
  const parsed  = new URL(url);
  const videoId =
    parsed.searchParams.get("v") ||           // youtube.com/watch?v=xxx
    parsed.pathname.split("/").pop();          // youtu.be/xxx

  const segments = await YoutubeTranscript.fetchTranscript(videoId);
  const body     = segments.map((s) => s.text).join(" ");

  // Fix #12 — Fetch real title via YouTube's free oEmbed (no API key needed).
  let title = `YouTube video (${videoId})`; // safe fallback
  try {
    const { data } = await http.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (data.title) title = data.title;
  } catch { /* non-fatal — fallback title is fine */ }

  return normalise({ title, body });
}

// ── Twitter / X extractor ─────────────────────────────────────────────────────
// Uses Twitter's public oEmbed endpoint — no API key required.
// The endpoint returns an HTML snippet: <blockquote>tweet text</blockquote>
// jsdom parses it and .textContent gives us the clean tweet text.
export async function extractTwitter(url) {
  const endpoint = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
  const { data } = await http.get(endpoint);

  // Parse the HTML snippet to get plain text
  const dom  = new JSDOM(data.html);
  const body = dom.window.document.body.textContent;

  return normalise({
    title:  `Tweet by ${data.author_name}`,
    body,
    author: data.author_name,
  });
}

// ── OG meta tag fallback ─────────────────────────────────────────────────────
// Called when Readability can't parse the page. Every real website has
// og:title and og:description — they're used for social link previews.
// This guarantees we always return *something* useful.
function fallbackOgTags(dom, url) {
  const getMeta = (prop) =>
    dom.window.document
      .querySelector(`meta[property='${prop}']`)
      ?.getAttribute("content") || "";

  return normalise({
    title:  getMeta("og:title")       || new URL(url).hostname,
    body:   getMeta("og:description"),
    author: getMeta("og:site_name"),
  });
}

// ── Image extractor ──────────────────────────────────────────────────────────
// Images have no text, so we use Gemini 1.5 Flash (vision) to:
//   1. Describe what the image shows → stored as content.body
//   2. Extract searchable tags       → returned as content.tags
// This means images flow through the EXACT same pipeline as every other type.
// The caller (pipeline.js) just gets back { title, body, author, excerpt, tags }
export async function extractImage(url) {
  const { title, body } = await describeImage(url);
  return normalise({ title, body });
}
