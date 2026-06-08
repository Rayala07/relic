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
export async function generateTags(body, userTags = []) {
  if (!body || body.trim().length === 0) return [];

  const contextPrompt = userTags.length > 0 
    ? `- CRITICAL: Try to reuse these existing taxonomy categories if they fit: ${JSON.stringify(userTags.slice(0, 50))}. Only generate new tags if none of these accurately describe the content.\n`
    : '';

  try {
    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          role: "system",
          content:
            `You are a content tagging system.\n` +
            `Your job is to generate reusable taxonomy categories for a piece of content.\n\n` +
            `STRICT RULES:\n` +
            `- Return ONLY a valid JSON array of strings\n` +
            `- 5 to 8 tags maximum\n` +
            `- Each tag must be strictly lowercase\n` +
            `- Each tag must be 1 to 2 words maximum (prefer 1 word)\n` +
            `- ALWAYS use singular nouns (e.g. "agent" not "agents", "shirt" not "shirts")\n` +
            `- Use broad, widely applicable taxonomy categories (e.g. "fashion", "artificial intelligence", "programming")\n` +
            `- Do NOT use hyper-specific descriptive phrases (e.g. use "shirt" instead of "white ribbed shirt")\n` +
            `- Do NOT return: "article", "content", "text", "overview" — these are meaningless\n` +
            contextPrompt +
            `- Do NOT return any explanation, markdown, or text outside the JSON array\n` +
            `- Example output: ["redis","caching","database","backend","fashion","shirt"]`,
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
    
    // Strict normalization pass
    return parsed
      .filter((t) => typeof t === "string" && t.trim().length > 0)
      .map((t) => {
        let normalized = t.toLowerCase().trim();
        // Remove all punctuation
        normalized = normalized.replace(/[^\w\s]/g, "");
        // Basic naive singularization for common cases (e.g., 'agents' -> 'agent')
        if (normalized.endsWith("ies")) {
           normalized = normalized.slice(0, -3) + "y";
        } else if (normalized.endsWith("s") && !normalized.endsWith("ss") && !normalized.endsWith("is") && !normalized.endsWith("us")) {
           normalized = normalized.slice(0, -1);
        }
        // Condense multiple spaces
        normalized = normalized.replace(/\s+/g, " ").trim();
        return normalized;
      })
      .filter((t) => t.length > 0)
      .slice(0, 8);

  } catch (err) {
    // Never crash the pipeline if tagging fails
    console.error("Tag generation failed:", err.message);
    return [];
  }
}
