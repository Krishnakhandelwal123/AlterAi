import { fetchJson, joinPieces, normalizeHandle, SocialImportError } from './shared.js';

const REDDIT_UA = 'AlterAI/1.0 (social training import; contact: alterai.tech@gmail.com)';

export const importReddit = async ({ handle }) => {
  const username = normalizeHandle(handle);
  if (!username) {
    throw new SocialImportError('Reddit username is required.');
  }

  const listing = await fetchJson(
    `https://www.reddit.com/user/${encodeURIComponent(username)}/submitted.json?limit=50&raw_json=1`,
    { headers: { 'User-Agent': REDDIT_UA } }
  );

  const children = listing?.data?.children || [];
  if (!children.length) {
    throw new SocialImportError('No public Reddit posts found for this username.');
  }

  const pieces = children
    .map((child) => child?.data)
    .filter(Boolean)
    .map((post) => {
      const title = post.title || 'Untitled post';
      const body = [post.selftext, post.url && post.is_self === false ? `Link: ${post.url}` : '']
        .filter(Boolean)
        .join('\n\n');
      return { title: `r/${post.subreddit}: ${title}`, body: body || '(link post)' };
    })
    .filter((p) => p.body.trim().length > 0);

  if (!pieces.length) {
    throw new SocialImportError('Reddit posts had no extractable text.');
  }

  const { content, pieceCount } = joinPieces(pieces);
  return { content, pieceCount, meta: { username, posts: pieceCount } };
};
