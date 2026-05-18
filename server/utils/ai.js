import { GoogleGenAI } from '@google/genai';
import { pipeline } from '@xenova/transformers';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });
const CHAT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Lazy-loaded pipeline — downloaded & cached on first embed call.
// all-mpnet-base-v2 produces 768-dim vectors to match the Supabase DB schema.
let _extractor = null;
async function getExtractor() {
  if (!_extractor) {
    console.log('[embed] Loading local embedding model (first run downloads ~420 MB, cached after)...');
    _extractor = await pipeline('feature-extraction', 'Xenova/all-mpnet-base-v2');
    console.log('[embed] Local embedding model ready.');
  }
  return _extractor;
}

/**
 * Creates a 768-dim embedding for a single text using the local model.
 * No API quota, no cost, no rate limits.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function createEmbedding(text) {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Embeds an array of text chunks using the local all-mpnet-base-v2 model.
 * @param {string[]} chunks
 * @returns {Promise<number[][]>}
 */
export const embedChunks = async (chunks) => {
  if (!chunks || chunks.length === 0) return [];

  const results = [];
  for (const text of chunks) {
    results.push(await createEmbedding(text));
  }
  console.log(`[embed] Success: local all-mpnet-base-v2 (${chunks.length} chunk(s))`);
  return results;
};

/**
 * Generates a chat response using the configured Gemini chat model.
 * @param {{ prompt: string, systemInstruction: string }} options
 * @returns {Promise<string>}
 */
export const generateChatResponse = async ({ prompt, systemInstruction }) => {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
  }
  try {
    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      contents: prompt,
      config: { systemInstruction },
    });
    return response.text;
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    throw new Error(`AI Response failed: ${error.message}`);
  }
};
