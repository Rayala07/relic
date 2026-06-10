import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Generates a sharp, human-readable collection name using Groq LLaMA.
 * Reads the actual item titles (not raw tags) so the name is contextually
 * accurate rather than a mechanical tag dump like "Fashion + Clothing + Shirt".
 *
 * Used exclusively by autoOrganize.js when creating a new auto-collection.
 * Failures are silently swallowed — falls back to a capitalized top tag
 * so the pipeline never crashes.
 *
 * @param {string[]} itemTitles  - Titles of the items being grouped (2–10)
 * @param {string[]} sharedTags  - The shared taxonomy tags driving the grouping
 * @returns {Promise<string>}    - A concise, human-readable collection name
 */
export async function generateCollectionName(itemTitles, sharedTags) {
  // Defensive fallback — if called with no data, return a generic name
  if (!itemTitles?.length && !sharedTags?.length) return "My Collection";

  try {
    const titlesBlock = itemTitles.slice(0, 8).map((t, i) => `${i + 1}. ${t}`).join("\n");
    const tagsBlock   = sharedTags.join(", ");

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            `You are a collection naming assistant for a personal knowledge management app.\n` +
            `Your job is to generate a short, sharp, human-readable name for a group of saved items.\n\n` +
            `STRICT RULES:\n` +
            `- Return ONLY the collection name — no explanation, no quotes, no punctuation at the end\n` +
            `- Maximum 4 words\n` +
            `- Be specific and descriptive — name what the items ARE, not what they contain\n` +
            `- Sound natural, like a folder name a smart person would create\n` +
            `- DO NOT just capitalize and join the tags\n` +
            `- DO NOT use generic words like: "Collection", "Items", "Content", "Articles", "Stuff"\n` +
            `- Examples of GOOD names: "Local AI Agents", "Shirt Picks", "Backend Engineering", "React Patterns"\n` +
            `- Examples of BAD names: "Ai + Agent + Security", "Fashion Collection", "Clothing Items"`
        },
        {
          role: "user",
          content:
            `These items are being grouped together:\n${titlesBlock}\n\n` +
            `They share these topics: ${tagsBlock}\n\n` +
            `Generate a single, sharp collection name for this group.`
        }
      ],
      temperature: 0.4,
      max_tokens: 20,
    });

    const name = response.choices[0]?.message?.content?.trim();

    // Safety: if response is empty or suspiciously long, use fallback
    if (!name || name.length === 0 || name.length > 60) {
      return capitalizeFallback(sharedTags);
    }

    // Strip any accidental surrounding quotes the model might add
    return name.replace(/^["']|["']$/g, "").trim();

  } catch (err) {
    console.error("Collection naming LLM failed, using tag fallback:", err.message);
    return capitalizeFallback(sharedTags);
  }
}

/**
 * Deterministic fallback: picks the most specific (shortest, least generic)
 * shared tag and capitalizes it properly. Better than raw tag concatenation.
 * Example: ["fashion", "clothing", "shirt"] → "Shirt"
 *
 * @param {string[]} tags
 * @returns {string}
 */
function capitalizeFallback(tags) {
  if (!tags?.length) return "My Collection";
  // Prefer shorter, more specific tags (e.g. "shirt" over "fashion")
  const sorted = [...tags].sort((a, b) => a.length - b.length);
  const top    = sorted[0] ?? tags[0];
  return top.charAt(0).toUpperCase() + top.slice(1);
}
