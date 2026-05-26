import Parser from 'rss-parser';
import { joinPieces, normalizeHandle, SocialImportError } from './shared.js';

const stripHtml = (raw = '') =>
  String(raw)
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const rssParser = new Parser();

export const importMedium = async ({ handle }) => {
  const username = normalizeHandle(handle);
  if (!username) {
    throw new SocialImportError('Medium username is required.');
  }

  const feedUrl = `https://medium.com/feed/@${username}`;
  let feed;
  try {
    feed = await rssParser.parseURL(feedUrl);
  } catch {
    throw new SocialImportError('Could not load Medium RSS feed. Check the username.');
  }

  const items = feed.items || [];
  if (!items.length) {
    throw new SocialImportError('No Medium articles found for this username.');
  }

  const pieces = items.slice(0, 30).map((item) => {
    const body = stripHtml(item['content:encoded'] || item.content || item.contentSnippet || '');
    return {
      title: item.title || 'Untitled article',
      body: body || item.contentSnippet || ''
    };
  }).filter((p) => p.body.length > 40);

  if (!pieces.length) {
    throw new SocialImportError('Medium articles had no usable text content.');
  }

  const { content, pieceCount } = joinPieces(pieces);
  return { content, pieceCount, meta: { username, articles: pieceCount, feedUrl } };
};
