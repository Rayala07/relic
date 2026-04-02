import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// ChatGroq follows the exact same LangChain interface as ChatGoogleGenerativeAI
const groq = new ChatGroq({
  model: "llama-3.1-8b-instant",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.3,   // low temp = consistent, focused output
  maxTokens: 120,     // expansion doesn't need more than this
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
        `You expand short search queries into richer search terms. ` +
        `Return ONLY a comma-separated list of related terms and concepts. ` +
        `No explanation. No sentences. No markdown. No bullet points. ` +
        `Just terms separated by commas.\n` +
        `Example input: "backend"\n` +
        `Example output: "backend development, REST APIs, server-side programming, Node.js, Express, databases, authentication, microservices"`
      ),
      new HumanMessage(`Expand this search query: "${query}"`),
    ]);

    const expanded = response.content?.trim();

    // Safety check — if something weird came back, use original
    if (!expanded || expanded.length < query.length) return query;

    console.log(`Query expanded: "${query}" → "${expanded}"`);
    return expanded;

  } catch (err) {
    // Never crash search because expansion failed
    console.error("Query expansion failed, using raw query:", err.message);
    return query;
  }
}
