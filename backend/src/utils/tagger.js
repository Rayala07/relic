import { Mistral } from "@mistralai/mistralai";

// Same Mistral client pattern as summariser.js and embedder.js
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

/**
 * Generates an array of concise topic tags for a piece of content.
 * Uses Mistral chat completions — same model and pattern as summariser.js.
 * Failures are silently swallowed so the pipeline always continues.
 *
 * @param {string} body - The full content body to tag
 * @returns {Promise<string[]>} - Array of lowercase tags (5–8), or [] on failure/empty input
 */
export async function generateTags(body) {
  if (!body || body.trim().length === 0) return [];

  try {
    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          role: "system",
          content:
            `You are a content tagging system.\n` +
            `Your job is to generate concise topic tags for a piece of content.\n\n` +
            `STRICT RULES:\n` +
            `- Return ONLY a valid JSON array of strings\n` +
            `- 5 to 8 tags maximum\n` +
            `- Each tag must be lowercase\n` +
            `- Each tag must be 1 to 3 words maximum\n` +
            `- Tags must be specific topics, not generic words\n` +
            `- Do NOT return: "article", "content", "text", "overview", "introduction", "guide" — these are too generic\n` +
            `- Do NOT return any explanation, markdown, or text outside the JSON array\n` +
            `- Example output: ["redis","caching","in-memory database","pub/sub","data structures","backend"]`,
        },
        {
          role: "user",
          content: `Generate tags for this content:\n\n${body.slice(0, 3000)}`,
        },
      ],
      temperature: 0.1,
      maxTokens: 120,
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) return [];

    // Strip markdown code fences if model wraps response in them
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Validate — must be an array of strings
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.toLowerCase().trim())
      .slice(0, 8);

  } catch (err) {
    // Never crash the pipeline if tagging fails
    console.error("Tag generation failed:", err.message);
    return [];
  }
}
