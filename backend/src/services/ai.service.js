import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import axios from "axios";

/**
 * ai.service.js
 *
 * All AI-related functionality lives here — built on LangChain for
 * consistency and easy model swapping later.
 *
 * Current capabilities:
 *   - describeImage() → uses Gemini 1.5 Flash vision to describe an image
 *                        and extract searchable tags from it
 *
 * Future home for:
 *   - generateEmbedding() → vector embeddings for semantic search
 *   - summarise()         → text summarisation
 *   - extractTags()       → tag generation for webpages, PDFs, etc.
 */

// ── Model setup ──────────────────────────────────────────────────────────────
// ChatGoogleGenerativeAI is LangChain's wrapper for Gemini models.
// It accepts both text and image inputs in the same message.
const visionModel = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.2, // low temperature = more consistent, factual descriptions
});

/**
 * Describes an image and extracts searchable tags from it using Gemini.
 *
 * HOW it works (step by step):
 *   1. Download the image as raw bytes via axios
 *   2. Convert to base64 — LangChain/Gemini accepts images as inline base64
 *   3. Build a HumanMessage with both the text prompt AND the image
 *   4. Send to Gemini 1.5 Flash → get JSON back
 *   5. Parse and return { title, body, tags }
 *
 * @param {string} imageUrl - Direct URL to the image (jpg, png, webp, gif)
 * @returns {Promise<{ title: string, body: string, tags: string[] }>}
 */
export async function describeImage(imageUrl) {
  // Step 1: Download the image as raw binary bytes
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

  // Step 2: Detect MIME type from the response header
  // Gemini needs this to know how to decode the image bytes
  const mimeType =
    response.headers["content-type"]?.split(";")[0] || "image/jpeg";

  // Step 3: Convert raw bytes → base64 string
  const base64Data = Buffer.from(response.data).toString("base64");

  // Step 4: Build the LangChain HumanMessage
  // LangChain's multi-modal format: an array of content parts —
  // one text part (the prompt) and one image_url part (the image data)
  const message = new HumanMessage({
    content: [
      {
        type: "text",
        text: `You are analyzing an image that a user saved to their personal knowledge base.

Return a JSON object with exactly these fields:
{
  "title": "short descriptive title for this image (max 10 words)",
  "description": "2-3 sentence description of what this image shows — be specific about objects, colors, mood, style, and context"
}

Return only the JSON. No markdown fences, no explanation.`,
      },
      {
        type: "image_url",
        image_url: {
          // LangChain / Gemini accepts base64 inline via data URI format
          url: `data:${mimeType};base64,${base64Data}`,
        },
      },
    ],
  });

  // Step 5: Invoke the model and parse the response
  const aiResponse = await visionModel.invoke([message]);

  // aiResponse.content is the raw string from Gemini
  // Strip any accidental markdown code fences just in case
  const raw = aiResponse.content.trim();
  const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

  const parsed = JSON.parse(cleaned);

  return {
    title: parsed.title       || "",
    body:  parsed.description || "",
  };
}
