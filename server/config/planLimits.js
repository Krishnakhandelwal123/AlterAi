export const PLAN_LIMITS = {
  free: {
    maxTextChars: 2000,
    maxTextEntries: 3,
    maxQAPairs: 10,
    maxFileSize: 2 * 1024 * 1024,
    maxFiles: 1,
    allowedFileTypes: ['.txt', '.csv'],
    allowTwitter: false,
    allowReddit: true,
    allowMedium: true,
    allowGithub: false,
    allowLinkedin: false,
    allowNotion: false,
    allowInstagram: false,
    maxLinks: 2,
    maxTotalChunks: 100,
    maxPersonalities: 1
  },
  pro: {
    maxTextChars: 20000,
    maxTextEntries: 20,
    maxQAPairs: 50,
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: 5,
    allowedFileTypes: ['.txt', '.csv', '.pdf', '.docx'],
    allowTwitter: false,
    allowReddit: true,
    allowMedium: true,
    allowGithub: true,
    allowLinkedin: true,
    allowNotion: true,
    allowInstagram: false,
    maxLinks: 10,
    maxTotalChunks: 500,
    maxPersonalities: 3
  },
  creator: {
    maxTextChars: 100000,
    maxTextEntries: 100,
    maxQAPairs: 200,
    maxFileSize: 50 * 1024 * 1024,
    maxFiles: 20,
    allowedFileTypes: ['.txt', '.csv', '.pdf', '.docx'],
    allowTwitter: true,
    allowReddit: true,
    allowMedium: true,
    allowGithub: true,
    allowLinkedin: true,
    allowNotion: true,
    allowInstagram: true,
    maxLinks: 50,
    maxTotalChunks: 2000,
    maxPersonalities: 999
  }
};

export const getPlanLimits = (plan) => PLAN_LIMITS[plan] || PLAN_LIMITS.free;
