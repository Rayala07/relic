import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// ChatGroq follows the exact same LangChain interface as ChatGoogleGenerativeAI
const groq = new ChatGroq({
  model: "llama-3.1-8b-instant",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.1,   // lower = more deterministic, less drift
  maxTokens: 80,      // 6 tight terms don't need more
});

/**
 * Expands a short search query into a richer set of related terms using Groq.
 * Queries longer than 8 words are already specific enough — skip expansion.
 * Failures are silently swallowed so search always continues with the raw query.
 *
 * @param {string} query - The user's raw search query
 * @returns {Promise<string>} - Expanded comma-separated terms, or original query on failure/skip
 */
export async function expandQuery(query) {
  // If query is already long enough, skip expansion
  if (query.trim().split(/\s+/).length > 8) return query;

  try {
    const response = await groq.invoke([
      new SystemMessage(
        `You are a search query expander. Your job is to expand a short query into closely related specific terms.\n\n` +
        `STRICT RULES:\n` +
        `- Stay very close to the original topic\n` +
        `- Only add terms that are DIRECTLY related — not loosely related\n` +
        `- Do NOT add generic words like: strategy, goals, planning, tips, guide, tutorial, learn, understand, overview\n` +
        `- Do NOT add synonyms for common words\n` +
        `- Return ONLY a comma-separated list of specific technical or topical terms\n` +
        `- Maximum 6 terms including the original\n` +
        `- No explanation, no sentences, no markdown\n\n` +
        `Example: "redis" → "Redis, Redis cache, in-memory database, Redis data structures, Redis pub/sub, Redis cluster"\n` +
        `Example: "roadmap" → "roadmap, learning path, skill roadmap, developer roadmap, technology roadmap, roadmap.sh"\n` +
        `Example: "backend" → "backend development, REST API, server-side, Node.js backend, Express.js, database design"`
      ),
      new HumanMessage(`Expand this search query into closely related specific terms only: "${query}"`),
    ]);

    const expanded = response.content?.trim();

    // Safety check — if something weird came back, use original
    if (!expanded || expanded.length < query.length) return query;

    return expanded;

  } catch (err) {
    // Never crash search because expansion failed
    console.error("Query expansion failed, using raw query:", err.message);
    return query;
  }
}
