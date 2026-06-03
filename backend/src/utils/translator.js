import { franc } from "franc-min";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Translates text to English using Groq (Llama 3).
 * Groq's 128k context window easily swallows huge chunks of text without needing manual chunking.
 * 
 * @param {string} text - Text to translate
 * @returns {Promise<string>} - Translated English text
 */
async function translateText(text) {
  if (!text || !text.trim()) return "";
  
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a professional translator. Translate the following text into clear, fluent English. " + 
                   "Do not add any explanation, commentary, or markdown formatting. Just output the direct English translation."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.1, // low temperature for accurate, literal translation
    });
    
    return response.choices[0]?.message?.content?.trim() || text;
  } catch (err) {
    console.error("Groq translation failed, falling back to original text:", err.message);
    return text;
  }
}

/**
 * Detects the language of extracted content and translates to English if needed.
 * Uses franc-min for detection (fast, no network call), then Groq for the actual translation.
 * Returns content unchanged if already English or language is undetectable.
 * Always sets `originalLanguage` on the returned object (ISO 639-3 code).
 *
 * @param {{ title: string, body: string, author: string, excerpt: string }} content
 * @returns {Promise<{ title: string, body: string, author: string, excerpt: string, originalLanguage: string }>}
 */
export async function translateToEnglish(content) {
  const { body, title, author } = content;

  // First 500 chars is enough for franc to reliably detect the language
  const sample = body?.slice(0, 500) || title || "";
  const langCode = franc(sample); // ISO 639-3: "eng", "fra", "hin", "und", etc.

  // "und" = undetermined — skip to avoid corrupting content with a bad translation
  if (langCode === "eng" || langCode === "und") {
    return { ...content, originalLanguage: langCode };
  }

  // With Groq's 128k context window, we no longer need chunked translation for the body.
  const [translatedTitle, translatedBody, translatedAuthor] = await Promise.all([
    title  ? translateText(title)  : Promise.resolve(""),
    body   ? translateText(body)   : Promise.resolve(""),
    author ? translateText(author) : Promise.resolve(""),
  ]);

  // Derive excerpt from the translated body — no extra API call needed.
  // Excerpt is just a short preview slice, so regenerating it from the
  // translated body is always more correct than translating the original.
  const translatedExcerpt = translatedBody
    ? translatedBody.replace(/\s+/g, " ").trim().slice(0, 300)
    : "";

  return {
    ...content,
    title:           translatedTitle  || content.title,
    body:            translatedBody   || content.body,
    author:          translatedAuthor || content.author,
    excerpt:         translatedExcerpt || content.excerpt,
    originalLanguage: langCode,
  };
}
