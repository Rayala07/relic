import { Mistral } from "@mistralai/mistralai";

// Mistral client — same initialisation pattern as embedder.js
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

/**
 * Generates a concise plain-text summary of the provided body text.
 * Uses the Mistral chat completion endpoint (not the embeddings endpoint).
 * Failures are silently swallowed so the pipeline can continue.
 *
 * @param {string} body - The full content body to summarise
 * @returns {Promise<string>} - 3–5 sentence plain-text summary, or '' on failure
 */
export async function generateSummary(body) {
  try {
    const sliced = (body || "").slice(0, 3000);

    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          role: "system",
          content:
            "You summarise content clearly and concisely. " +
            "Return plain text only. No bullet points. No markdown. " +
            "No headings. Just flowing sentences.",
        },
        {
          role: "user",
          content: `Summarise the following content in 3 to 5 sentences:\n\n${sliced}`,
        },
      ],
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("Summariser: failed to generate summary —", err.message);
    return "";
  }
}
