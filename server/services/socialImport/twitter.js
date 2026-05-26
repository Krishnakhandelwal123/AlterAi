import { fetchJson, joinPieces, normalizeHandle, SocialImportError } from './shared.js';

export const importTwitter = async ({ accessToken, handle }) => {
  const token = String(accessToken || '').trim();
  const username = normalizeHandle(handle);

  if (!token) {
    throw new SocialImportError('X (Twitter) bearer or user access token is required.');
  }
  if (!username) {
    throw new SocialImportError('X (Twitter) username is required.');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'User-Agent': 'AlterAI-Training/1.0'
  };

  const user = await fetchJson(
    `https://api.twitter.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=description,name`,
    { headers }
  );

  const userId = user?.data?.id;
  if (!userId) {
    throw new SocialImportError('Twitter user not found. Check username and API access.');
  }

  const tweets = await fetchJson(
    `https://api.twitter.com/2/users/${userId}/tweets?max_results=50&tweet.fields=created_at,text&exclude=retweets,replies`,
    { headers }
  );

  const pieces = [];
  if (user?.data?.description) {
    pieces.push({
      title: `Profile: @${username}`,
      body: [user.data.name, user.data.description].filter(Boolean).join('\n')
    });
  }

  for (const tweet of tweets?.data || []) {
    if (!tweet?.text) continue;
    pieces.push({
      title: `Tweet ${tweet.created_at || ''}`.trim(),
      body: tweet.text
    });
  }

  if (pieces.length === 0) {
    throw new SocialImportError('No tweets returned. Your X API tier may not allow read access.');
  }

  const { content, pieceCount } = joinPieces(pieces);
  return { content, pieceCount, meta: { username, tweets: tweets?.data?.length || 0 } };
};
