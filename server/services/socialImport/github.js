import { fetchJson, fetchText, joinPieces, normalizeHandle, SocialImportError } from './shared.js';

const GITHUB_HEADERS = (token) => ({
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'AlterAI-Training/1.0',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

const MAX_REPOS = 20;

export const importGithub = async ({ accessToken, handle }) => {
  const token = String(accessToken || '').trim();
  if (!token) {
    throw new SocialImportError('GitHub personal access token is required.');
  }

  const headers = GITHUB_HEADERS(token);
  let profile;
  let tokenOwnerLogin = null;

  try {
    const me = await fetchJson('https://api.github.com/user', { headers });
    tokenOwnerLogin = me?.login || null;
  } catch {
    tokenOwnerLogin = null;
  }

  const requestedLogin = handle ? normalizeHandle(handle) : tokenOwnerLogin;

  if (requestedLogin) {
    profile = await fetchJson(`https://api.github.com/users/${encodeURIComponent(requestedLogin)}`, { headers });
  } else {
    throw new SocialImportError(
      'Could not resolve GitHub user. Use a valid token with Profile read, or enter your username.'
    );
  }

  const login = profile?.login;
  if (!login) {
    throw new SocialImportError('Could not resolve GitHub username. Add your handle or check the token.');
  }

  const isTokenOwner = tokenOwnerLogin && tokenOwnerLogin.toLowerCase() === login.toLowerCase();
  const reposUrl = isTokenOwner
    ? `https://api.github.com/user/repos?per_page=${MAX_REPOS}&sort=updated&affiliation=owner`
    : `https://api.github.com/users/${encodeURIComponent(login)}/repos?per_page=${MAX_REPOS}&sort=updated&type=owner`;

  const repos = await fetchJson(reposUrl, { headers });

  if (!Array.isArray(repos)) {
    throw new SocialImportError('Unexpected response from GitHub repos API.');
  }

  const pieces = [];

  if (profile.bio || profile.name) {
    pieces.push({
      title: `Profile: ${login}`,
      body: [profile.name, profile.bio, profile.blog, profile.location, profile.company]
        .filter(Boolean)
        .join('\n')
    });
  }

  for (const repo of repos) {
    if (repo.fork || repo.archived) continue;

    let readme = '';
    try {
      readme = await fetchText(`https://api.github.com/repos/${repo.full_name}/readme`, {
        headers: { ...headers, Accept: 'application/vnd.github.raw' }
      });
    } catch {
      readme = '';
    }

    const body = [
      repo.description ? `Description: ${repo.description}` : '',
      repo.language ? `Language: ${repo.language}` : '',
      readme
    ]
      .filter(Boolean)
      .join('\n\n');

    if (body.trim().length < 20 && !repo.description) continue;

    pieces.push({
      title: repo.full_name,
      body: body || repo.description || '(empty repository)'
    });
  }

  if (pieces.length === 0) {
    throw new SocialImportError('No public repository content found for this GitHub account.');
  }

  const { content, pieceCount } = joinPieces(pieces);
  return {
    content,
    pieceCount,
    meta: { login, reposScanned: repos.length }
  };
};
