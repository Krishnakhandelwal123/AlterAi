import { SocialImportError } from './shared.js';
import { importGithub } from './github.js';
import { importReddit } from './reddit.js';
import { importNotion } from './notion.js';
import { importMedium } from './medium.js';
import { importTwitter } from './twitter.js';

const UNSUPPORTED = {
  linkedin:
    'LinkedIn does not allow personal content export via a simple token. Paste LinkedIn posts or articles using Upload / Paste Text, or export as PDF.',
  instagram:
    'Instagram requires Meta Business API setup. Save captions or posts as text files and upload them to Training Data instead.'
};

/**
 * Fetch real text from a connected social platform for RAG training.
 * @returns {Promise<{ content: string, pieceCount: number, meta?: object }>}
 */
export const importFromSocialPlatform = async (platform, { accessToken, handle }) => {
  const normalized = String(platform || '').toLowerCase();

  switch (normalized) {
    case 'github':
      return importGithub({ accessToken, handle });
    case 'reddit':
      return importReddit({ handle });
    case 'notion':
      return importNotion({ accessToken });
    case 'medium':
      return importMedium({ handle });
    case 'twitter':
      return importTwitter({ accessToken, handle });
    case 'linkedin':
    case 'instagram':
      throw new SocialImportError(UNSUPPORTED[normalized], 501);
    default:
      throw new SocialImportError(`Unsupported platform: ${platform}`);
  }
};

export { SocialImportError };
