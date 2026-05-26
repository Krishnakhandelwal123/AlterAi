import { fetchJson, joinPieces, SocialImportError } from './shared.js';

const NOTION_VERSION = '2022-06-28';

const notionHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Notion-Version': NOTION_VERSION,
  'Content-Type': 'application/json'
});

const richTextToPlain = (richText = []) =>
  richText
    .map((part) => part.plain_text || '')
    .join('')
    .trim();

const blockToText = (block) => {
  if (!block?.type) return '';
  const payload = block[block.type];
  if (!payload) return '';

  if (payload.rich_text) return richTextToPlain(payload.rich_text);
  if (payload.text) return richTextToPlain(payload.text);
  if (block.type === 'child_page' && payload.title) return payload.title;
  return '';
};

const fetchBlockTexts = async (blockId, token, depth = 0) => {
  if (depth > 2) return [];

  const data = await fetchJson(`https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`, {
    headers: notionHeaders(token),
    method: 'GET'
  });

  const lines = [];
  for (const block of data?.results || []) {
    const line = blockToText(block);
    if (line) lines.push(line);
    if (block.has_children) {
      const nested = await fetchBlockTexts(block.id, token, depth + 1);
      lines.push(...nested);
    }
  }
  return lines;
};

export const importNotion = async ({ accessToken }) => {
  const token = String(accessToken || '').trim();
  if (!token) {
    throw new SocialImportError('Notion integration token is required.');
  }

  const search = await fetchJson('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: notionHeaders(token),
    body: JSON.stringify({ page_size: 25, filter: { value: 'page', property: 'object' } })
  });

  const pages = (search?.results || []).filter((item) => item.object === 'page');
  if (!pages.length) {
    throw new SocialImportError('No Notion pages found. Share pages with your integration first.');
  }

  const pieces = [];
  for (const page of pages.slice(0, 20)) {
    const title =
      page.properties?.title?.title?.[0]?.plain_text ||
      page.properties?.Name?.title?.[0]?.plain_text ||
      'Untitled page';

    const lines = await fetchBlockTexts(page.id, token);
    const body = lines.join('\n').trim();
    if (body.length < 10) continue;

    pieces.push({ title, body });
  }

  if (!pieces.length) {
    throw new SocialImportError('Notion pages had no readable text. Check integration access.');
  }

  const { content, pieceCount } = joinPieces(pieces);
  return { content, pieceCount, meta: { pages: pieceCount } };
};
