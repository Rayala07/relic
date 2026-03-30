import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { describeImage } from "./ai.service.js";
import { YoutubeTranscript } from "youtube-transcript/dist/youtube-transcript.esm.js";

// Import CJS module correctly in ESM
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

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

// ── Shared HTTP client ───────────────────────────────────────────────────────
// Sets a real browser User-Agent so sites don't block the scraper.
// 15s timeout is generous enough for slow PDFs but prevents hanging forever.
const http = axios.create({
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
  },
});

// ── Shared result normaliser ─────────────────────────────────────────────────
// Always returns the same shape. Missing fields default to empty string.
function normalise({ title = "", body = "", author = "", excerpt = "" } = {}) {
  return {
    title:   title.trim(),
    body:    body.replace(/\s+/g, " ").trim(),
    author:  author.trim(),
    excerpt: excerpt.trim() || body.replace(/\s+/g, " ").trim().slice(0, 300),
  };
}

// ── Webpage extractor ────────────────────────────────────────────────────────
// Handles: webpage, repo (GitHub) — both are normal HTML pages.
// Uses @mozilla/readability (same engine as Firefox Reader Mode) to strip
// navbars, ads, footers and return just the article content.
export async function extractWebpage(url) {
  const { data: html } = await http.get(url);

  // jsdom creates a virtual browser DOM from the raw HTML string.
  // Passing { url } lets Readability resolve relative links correctly.
  const dom = new JSDOM(html, { url });
  const article = new Readability(dom.window.document).parse();

  if (article) {
    return normalise({
      title:   article.title,
      body:    article.textContent,
      author:  article.byline,
      excerpt: article.excerpt,
    });
  }

  // Readability failed (e.g. SPA with no real HTML, paywalled page).
  // Every decent site has og: meta tags — fall back to those.
  return fallbackOgTags(dom, url);
}

// ── PDF extractor ────────────────────────────────────────────────────────────
// Downloads the PDF as raw bytes (arraybuffer), then pdf-parse reads
// all text content from every page into a single string.
export async function extractPdf(url) {
  const { data } = await http.get(url, { responseType: "arraybuffer" });
  const parsed = await pdfParse(Buffer.from(data));

  return normalise({
    // PDF metadata title if present, otherwise use the filename from the URL
    title: parsed.info?.Title || decodeURIComponent(url.split("/").pop()),
    body:  parsed.text,
  });
}

// ── YouTube extractor ────────────────────────────────────────────────────────
// Primary: fetches the auto-generated or human-uploaded transcript.
// Fallback: YouTube OEmbed API (always works, gives title + author at minimum).
// Some videos have transcripts disabled — we should never reject the whole item
// just because a transcript isn't available.
export async function extractYoutube(url) {
  const parsed  = new URL(url);
  const videoId =
    parsed.searchParams.get("v") ||   // youtube.com/watch?v=xxx
    parsed.pathname.split("/").pop();  // youtu.be/xxx

  // Always fetch OEmbed — gives us reliable title + author regardless of transcript
  let oembedTitle  = `YouTube video (${videoId})`;
  let oembedAuthor = "";
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const { data }  = await http.get(oembedUrl);
    oembedTitle  = data.title       || oembedTitle;
    oembedAuthor = data.author_name || "";
  } catch {
    // OEmbed failed (private/deleted video) — continue with defaults
  }

  // Attempt transcript — this is the rich content that powers search
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    const body     = segments.map((s) => s.text).join(" ");

    return normalise({ title: oembedTitle, body, author: oembedAuthor });

  } catch {
    // Transcript unavailable (disabled, private, no captions) — not an error.
    // Return what we have from OEmbed so the item is still saved and useful.
    console.log(`Pipeline: no transcript for YouTube video ${videoId} — using metadata only`);
    return normalise({ title: oembedTitle, author: oembedAuthor });
  }
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
