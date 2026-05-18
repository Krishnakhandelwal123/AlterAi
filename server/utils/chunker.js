export const chunkText = (text, maxChunkSize = 400) => {
  if (!text || typeof text !== 'string') return [];

  const cleaned = text.replace(/\r\n/g, '\n').replace(/\t/g, ' ').replace(/\s{3,}/g, '\n\n').trim();
  if (cleaned.length < 10) return [];

  const sentences = cleaned.match(/[^.!?\n]+[.!?\n]+/g) || [cleaned];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > maxChunkSize) {
      if (current.trim().length > 5) chunks.push(current.trim());
      current = sentence;
    } else {
      current += ` ${sentence}`;
    }
  }

  if (current.trim().length > 5) chunks.push(current.trim());
  return [...new Set(chunks)];
};
