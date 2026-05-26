export const MAX_SOCIAL_CHARS = Number(process.env.SOCIAL_IMPORT_MAX_CHARS || 120000);

export class SocialImportError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'SocialImportError';
    this.status = status;
  }
}

export const normalizeHandle = (handle = '') => String(handle).trim().replace(/^@+/, '');

/** PostgreSQL text columns reject NUL (\\u0000) — common in some GitHub README/binary payloads. */
export const sanitizeTextForDb = (text = '') =>
  String(text)
    .replace(/\u0000/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, ' ');

export const joinPieces = (pieces) => {
  const blocks = pieces
    .map((piece) => {
      const title = piece.title ? `## ${piece.title}\n\n` : '';
      const body = sanitizeTextForDb(piece.body || '').trim();
      if (!body) return '';
      return `${title}${body}`;
    })
    .filter(Boolean);

  let content = sanitizeTextForDb(blocks.join('\n\n---\n\n'));
  if (content.length > MAX_SOCIAL_CHARS) {
    content = `${content.slice(0, MAX_SOCIAL_CHARS)}\n\n[Import truncated at ${MAX_SOCIAL_CHARS} characters]`;
  }
  return { content, pieceCount: blocks.length };
};

export const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    signal: options.signal || AbortSignal.timeout(20000)
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    const message =
      (typeof data === 'object' && data?.message) ||
      (typeof data === 'object' && data?.error) ||
      (typeof data === 'string' && data.slice(0, 200)) ||
      `Request failed (${response.status})`;
    throw new SocialImportError(message, response.status >= 500 ? 502 : 400);
  }
  return data;
};

export const fetchText = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    signal: options.signal || AbortSignal.timeout(20000)
  });
  const raw = await response.text();
  if (!response.ok) {
    throw new SocialImportError(`Request failed (${response.status})`, response.status >= 500 ? 502 : 400);
  }
  return sanitizeTextForDb(raw);
};
