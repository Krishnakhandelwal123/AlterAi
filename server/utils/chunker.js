const splitLongSegment = (segment, maxChunkSize) => {
  if (segment.length <= maxChunkSize) return [segment];

  const words = segment.split(/\s+/).filter(Boolean);
  const parts = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChunkSize && current) {
      parts.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) parts.push(current);
  return parts;
};

const getOverlap = (chunk, overlapSize) => {
  if (!overlapSize || chunk.length <= overlapSize) return chunk;
  const tail = chunk.slice(-overlapSize);
  const wordBoundary = tail.search(/\s/);
  return wordBoundary > -1 ? tail.slice(wordBoundary).trim() : tail.trim();
};

export const chunkText = (text, maxChunkSize = 700, overlapSize = 120) => {
  if (!text || typeof text !== 'string') return [];

  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \f\v]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (cleaned.length < 10) return [];

  const segments = cleaned
    .split(/\n{2,}|(?<=[.!?])\s+|\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .flatMap((part) => splitLongSegment(part, maxChunkSize));

  const chunks = [];
  let current = '';

  for (const segment of segments) {
    const next = current ? `${current}\n${segment}` : segment;
    if (next.length > maxChunkSize && current) {
      if (current.trim().length > 5) chunks.push(current.trim());
      const overlap = getOverlap(current, overlapSize);
      current = overlap && overlap !== current ? `${overlap}\n${segment}` : segment;
    } else {
      current = next;
    }
  }

  if (current.trim().length > 5) chunks.push(current.trim());
  return [...new Set(chunks)];
};
