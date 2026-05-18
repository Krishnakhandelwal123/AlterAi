import { embedChunks as embedChunksInternal } from './ai.js';

/**
 * Compatibility wrapper for embedChunks using Gemini.
 */
export const embedChunks = async (chunks) => {
  return embedChunksInternal(chunks);
};
