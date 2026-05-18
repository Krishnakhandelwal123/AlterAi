import { getPlanLimits } from '../config/planLimits.js';
import { supabase } from '../lib/supabase.js';

const safeCount = (result) => (result?.count && Number.isFinite(result.count) ? result.count : 0);

export const getUserPlan = async (userId) => {
  const { data } = await supabase.from('subscriptions').select('plan, status').eq('user_id', userId).maybeSingle();

  if (!data || data.status !== 'active') return 'free';
  return data.plan || 'free';
};

export const getUserUsage = async (userId, personalityId) => {
  const [textCount, qaCount, fileCount, chunkCount, linkCount] = await Promise.all([
    supabase
      .from('training_data')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('personality_id', personalityId)
      .eq('source_type', 'text'),
    supabase
      .from('training_data')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('personality_id', personalityId)
      .eq('source_type', 'qa'),
    supabase
      .from('training_data')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('personality_id', personalityId)
      .eq('source_type', 'file'),
    supabase
      .from('personality_embeddings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('personality_id', personalityId),
    supabase
      .from('training_data')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('personality_id', personalityId)
      .in('source_type', ['link', 'medium', 'rss'])
  ]);

  return {
    textEntries: safeCount(textCount),
    qaPairs: safeCount(qaCount),
    files: safeCount(fileCount),
    totalChunks: safeCount(chunkCount),
    links: safeCount(linkCount)
  };
};

export const checkLimit = async (userId, personalityId, action, value = null) => {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);
  const usage = await getUserUsage(userId, personalityId);

  switch (action) {
    case 'add_text': {
      if (usage.textEntries >= limits.maxTextEntries) {
        return {
          allowed: false,
          reason: `Text limit reached. Max ${limits.maxTextEntries} text entries on ${plan} plan.`,
          upgrade: plan === 'free' ? 'pro' : 'creator'
        };
      }
      if (value && value.length > limits.maxTextChars) {
        return {
          allowed: false,
          reason: `Text too long. ${plan} plan allows ${limits.maxTextChars.toLocaleString()} characters.`,
          upgrade: plan === 'free' ? 'pro' : 'creator'
        };
      }
      break;
    }
    case 'add_qa': {
      if (usage.qaPairs >= limits.maxQAPairs) {
        return {
          allowed: false,
          reason: `Q&A limit reached. Max ${limits.maxQAPairs} pairs on ${plan} plan.`,
          upgrade: plan === 'free' ? 'pro' : 'creator'
        };
      }
      break;
    }
    case 'upload_file': {
      if (usage.files >= limits.maxFiles) {
        return {
          allowed: false,
          reason: `File limit reached. Max ${limits.maxFiles} file(s) on ${plan} plan.`,
          upgrade: plan === 'free' ? 'pro' : 'creator'
        };
      }
      if (value && value.size > limits.maxFileSize) {
        const maxMB = Math.floor(limits.maxFileSize / (1024 * 1024));
        return {
          allowed: false,
          reason: `File too large. Max ${maxMB}MB on ${plan} plan.`,
          upgrade: plan === 'free' ? 'pro' : 'creator'
        };
      }
      if (value) {
        const ext = `.${value.originalname.split('.').pop().toLowerCase()}`;
        if (!limits.allowedFileTypes.includes(ext)) {
          return {
            allowed: false,
            reason: `File type not allowed on ${plan} plan. Allowed: ${limits.allowedFileTypes.join(', ')}`,
            upgrade: plan === 'free' ? 'pro' : 'creator'
          };
        }
      }
      break;
    }
    case 'connect_social': {
      const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
      const platformKey = `allow${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
      if (!limits[platformKey]) {
        return {
          allowed: false,
          reason: `${normalized} import is not available on ${plan} plan.`,
          upgrade: plan === 'free' ? 'pro' : 'creator'
        };
      }
      break;
    }
    case 'add_link': {
      if (usage.links >= limits.maxLinks) {
        return {
          allowed: false,
          reason: `Link limit reached. Max ${limits.maxLinks} links on ${plan} plan.`,
          upgrade: plan === 'free' ? 'pro' : 'creator'
        };
      }
      break;
    }
    case 'add_chunks': {
      const requested = Number(value || 0);
      if (usage.totalChunks + requested > limits.maxTotalChunks) {
        return {
          allowed: false,
          reason: `Training data limit reached. ${plan} plan allows ${limits.maxTotalChunks} knowledge chunks.`,
          upgrade: plan === 'free' ? 'pro' : 'creator'
        };
      }
      break;
    }
    default:
      break;
  }

  return { allowed: true, plan, limits, usage };
};
