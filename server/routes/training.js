import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import Parser from 'rss-parser';
import { authenticate } from '../middleware/authenticate.js';
import { checkPlan } from '../middleware/checkPlan.js';
import { rules, validate } from '../middleware/validateRequest.js';
import { extractText } from '../utils/fileExtractor.js';
import { trainOnContent } from '../utils/trainer.js';
import { calculateTrainingStrength, checkLimit, getUserPlan, getUserUsage } from '../utils/planChecker.js';
import { getPlanLimits } from '../config/planLimits.js';
import { decrypt, encrypt } from '../utils/encrypt.js';
import { supabase } from '../lib/supabase.js';

const router = Router();
const rssParser = new Parser();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

const trainingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Increased from 20 to 100 to allow for navigation and UI updates
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many training requests. Please wait 15 minutes.' }
});

const isPrivateUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    const host = (url.hostname || '').toLowerCase();
    if (['localhost', '0.0.0.0', '127.0.0.1', '::1'].includes(host)) return true;
    if (host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('172.16.') || host.startsWith('172.17.')) {
      return true;
    }
    return false;
  } catch (_error) {
    return true;
  }
};

const sanitizeError = () => ({ success: false, error: 'Something went wrong' });
const sanitizeDbError = (error, fallback = 'Something went wrong') => {
  const message = (error?.message || '').toLowerCase();
  const code = error?.code;

  if (code === 'PGRST205' || (message.includes('relation') && message.includes('does not exist'))) {
    return 'Database tables are missing. Please run the SQL setup script in your Supabase SQL Editor.';
  }
  if (message.includes('bucket not found')) {
    return 'Storage bucket "training-files" not found. Please create it in your Supabase Storage dashboard.';
  }
  if (message.includes('column') && message.includes('does not exist')) {
    return `Database schema mismatch: ${error.message}. Please check your Supabase tables.`;
  }
  if (message.includes('invalid input syntax for type uuid')) {
    return 'Invalid personality id format.';
  }
  if (message.includes('violates row-level security policy')) {
    return 'Database access denied. Check your Supabase RLS policies.';
  }
  return fallback;
};
const toPlainText = (raw = '') =>
  raw
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const logDev = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};

const ensureOwnership = async (userId, personalityId) => {
  const { data } = await supabase
    .from('personalities')
    .select('id, user_id')
    .eq('id', personalityId)
    .eq('user_id', userId)
    .maybeSingle();

  return Boolean(data);
};

const processTrainingAsync = async ({ userId, personalityId, content, sourceType, trainingDataId }) => {
  try {
    await trainOnContent({ userId, personalityId, content, sourceType, trainingDataId });
  } catch (error) {
    logDev(error);
  }
};
const SOCIAL_PLATFORMS = ['twitter', 'reddit', 'github', 'linkedin', 'notion', 'instagram', 'medium'];
const sourceTypeLabelMap = {
  twitter: 'twitter',
  x: 'twitter',
  reddit: 'reddit',
  github: 'github',
  linkedin: 'linkedin',
  notion: 'notion',
  instagram: 'instagram',
  medium: 'medium'
};

router.use(authenticate, trainingLimiter);

router.get('/bootstrap', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({ success: false, error: 'User ID missing or invalid' });
    }

    // First, check if the personalities table even exists
    const { error: tableCheckError } = await supabase
      .from('personalities')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (tableCheckError && tableCheckError.code !== 'PGRST116') {
      logDev('Bootstrap table check error:', tableCheckError);
      return res.status(500).json({ 
        success: false, 
        error: sanitizeDbError(tableCheckError, 'Database table "personalities" not found or inaccessible.') 
      });
    }

    // If a specific cloneId is requested, validate ownership and return it
    const requestedCloneId = req.query.cloneId;
    if (requestedCloneId) {
      const { data: specific, error: specificError } = await supabase
        .from('personalities')
        .select('id, name, created_at')
        .eq('id', requestedCloneId)
        .eq('user_id', userId)
        .maybeSingle();

      if (specificError) {
        logDev('Bootstrap specific clone error:', specificError);
        throw specificError;
      }
      if (specific) {
        return res.json({
          success: true,
          data: { personalityId: specific.id, personality: specific },
          message: 'Bootstrap ready'
        });
      }
      // If the requested clone doesn't exist or isn't owned, fall through to list
    }

    const { data: existing, error: listError } = await supabase
      .from('personalities')
      .select('id, name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (listError) {
      logDev('Bootstrap listError:', listError);
      throw listError;
    }

    if (existing?.length) {
      return res.json({
        success: true,
        data: { personalityId: existing[0].id, personality: existing[0] },
        message: 'Bootstrap ready'
      });
    }

    // No clones exist — return null instead of auto-creating one
    return res.json({
      success: true,
      data: { personalityId: null, personality: null },
      message: 'No clones yet. Create one from the My Clones page.'
    });
  } catch (error) {
    logDev('Bootstrap error:', error);
    return res.status(500).json({ success: false, error: sanitizeDbError(error, 'Failed to initialize training workspace') });
  }
});

router.get('/stats/:personalityId', rules.personalityParam, validate, async (req, res) => {
  try {
    const { personalityId } = req.params;
    const userId = req.user.id;

    const owned = await ensureOwnership(userId, personalityId);
    if (!owned) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const [plan, usage, trainingItems] = await Promise.all([
      getUserPlan(userId),
      getUserUsage(userId, personalityId),
      supabase
        .from('training_data')
        .select('id, source_type, content, file_url, file_name, file_size, char_count, chunk_count, status, error_message, created_at')
        .eq('personality_id', personalityId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ]);
    const { data: connections } = await supabase
      .from('social_connections')
      .select('platform, handle, post_count, last_synced, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const limits = getPlanLimits(plan);
    const strengthPercent = calculateTrainingStrength(usage.totalChunks, limits);

    return res.json({
      success: true,
      data: { plan, limits, usage, strengthPercent, trainingItems: trainingItems.data || [], socialConnections: connections || [] },
      message: 'Training stats fetched'
    });
  } catch (error) {
    logDev(error);
    return res.status(500).json({ success: false, error: sanitizeDbError(error, 'Failed to fetch training stats') });
  }
});

router.get('/social', async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('social_connections')
      .select('platform, handle, post_count, last_synced, token_expires, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return res.json({
      success: true,
      data: {
        connected: data || [],
        supported: SOCIAL_PLATFORMS
      },
      message: 'Social integrations fetched'
    });
  } catch (error) {
    logDev(error);
    return res.status(500).json(sanitizeError());
  }
});

router.post('/social/connect', rules.socialConnect, validate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { personalityId, platform, handle, accessToken, refreshToken } = req.body;
    const normalizedPlatform = platform.toLowerCase();

    const owned = await ensureOwnership(userId, personalityId);
    if (!owned) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const gate = await checkLimit(userId, personalityId, 'connect_social', normalizedPlatform);
    if (!gate.allowed) {
      return res.status(403).json({
        success: false,
        error: gate.reason,
        code: 'PLAN_LIMIT_REACHED',
        upgrade: gate.upgrade
      });
    }

    const { error } = await supabase.from('social_connections').upsert(
      {
        user_id: userId,
        platform: normalizedPlatform,
        handle: handle || '',
        access_token: encrypt(accessToken),
        refresh_token: refreshToken ? encrypt(refreshToken) : null,
        token_expires: null
      },
      { onConflict: 'user_id,platform' }
    );
    if (error) throw error;

    return res.json({
      success: true,
      data: { platform: normalizedPlatform, handle: handle || '' },
      message: `${normalizedPlatform} connected`
    });
  } catch (error) {
    logDev(error);
    return res.status(500).json(sanitizeError());
  }
});

router.post('/social/sync/:platform', rules.socialSync, validate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { personalityId } = req.body;
    const platform = req.params.platform.toLowerCase();
    const owned = await ensureOwnership(userId, personalityId);
    if (!owned) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    const planGate = await checkLimit(userId, personalityId, 'connect_social', sourceTypeLabelMap[platform] || platform);
    if (!planGate.allowed) {
      return res.status(403).json({
        success: false,
        error: planGate.reason,
        code: 'PLAN_LIMIT_REACHED',
        upgrade: planGate.upgrade
      });
    }

    const { data: connection } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .maybeSingle();
    if (!connection) {
      return res.status(404).json({ success: false, error: `${platform} is not connected` });
    }

    const decryptedToken = decrypt(connection.access_token);
    if (!decryptedToken) {
      return res.status(400).json({ success: false, error: 'Stored token is invalid. Reconnect this platform.' });
    }

    const simulatedPieces = Math.max(5, Math.min(250, (connection.post_count || 0) + 25));
    const trainingContent = [
      `Platform: ${platform}`,
      `Handle: ${connection.handle || ''}`,
      `Imported pieces: ${simulatedPieces}`,
      'This dataset includes writing style, sentence cadence, recurring phrases, and topical patterns.'
    ].join('\n');

    const { data: trainingRow, error: insertError } = await supabase
      .from('training_data')
      .insert({
        personality_id: personalityId,
        user_id: userId,
        source_type: platform,
        content: trainingContent,
        char_count: trainingContent.length,
        status: 'processing'
      })
      .select('id')
      .single();
    if (insertError) throw insertError;

    await supabase
      .from('social_connections')
      .update({
        post_count: simulatedPieces,
        last_synced: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('platform', platform);

    res.json({
      success: true,
      data: { trainingDataId: trainingRow.id, platform, imported: simulatedPieces },
      message: `${platform} sync started`
    });

    void processTrainingAsync({
      userId,
      personalityId,
      content: trainingContent,
      sourceType: platform,
      trainingDataId: trainingRow.id
    });
  } catch (error) {
    logDev(error);
    return res.status(500).json(sanitizeError());
  }
});

router.delete('/social/:platform', rules.socialPlatform, validate, async (req, res) => {
  try {
    const userId = req.user.id;
    const platform = req.params.platform.toLowerCase();

    const { error } = await supabase.from('social_connections').delete().eq('user_id', userId).eq('platform', platform);
    if (error) throw error;

    return res.json({
      success: true,
      data: { platform },
      message: `${platform} disconnected`
    });
  } catch (error) {
    logDev(error);
    return res.status(500).json(sanitizeError());
  }
});

router.post('/text', rules.text, validate, checkPlan('add_text'), async (req, res) => {
  try {
    const { personalityId, content } = req.body;
    const userId = req.user.id;

    const { data: trainingRow, error } = await supabase
      .from('training_data')
      .insert({
        personality_id: personalityId,
        user_id: userId,
        source_type: 'text',
        content,
        char_count: content.length,
        status: 'processing'
      })
      .select('id')
      .single();

    if (error) {
      logDev('Text insert error:', error);
      return res.status(500).json({ success: false, error: sanitizeDbError(error, 'Failed to save text training record') });
    }

    res.json({
      success: true,
      data: { trainingDataId: trainingRow.id, plan: req.plan },
      message: 'Text received. Training started.'
    });

    setImmediate(async () => {
      try {
        await processTrainingAsync({
          userId,
          personalityId,
          content,
          sourceType: 'text',
          trainingDataId: trainingRow.id
        });
      } catch (trainingError) {
        logDev('Background text training error:', trainingError);
      }
    });
  } catch (error) {
    logDev('Text endpoint error:', error);
    return res.status(500).json({ success: false, error: sanitizeDbError(error, 'Something went wrong during text training') });
  }
});

router.post('/qa', rules.qa, validate, checkPlan('add_qa'), async (req, res) => {
  try {
    const { personalityId, question, answer } = req.body;
    const userId = req.user.id;
    const content = `Question: ${question}\nAnswer: ${answer}`;

    const { data: trainingRow, error } = await supabase
      .from('training_data')
      .insert({
        personality_id: personalityId,
        user_id: userId,
        source_type: 'qa',
        content,
        char_count: content.length,
        status: 'processing'
      })
      .select('id')
      .single();

    if (error) {
      logDev('QA insert error:', error);
      return res.status(500).json({ success: false, error: sanitizeDbError(error, 'Failed to save Q&A record') });
    }

    res.json({
      success: true,
      data: { trainingDataId: trainingRow.id },
      message: 'Q&A pair saved. Training started.'
    });

    setImmediate(async () => {
      try {
        await processTrainingAsync({
          userId,
          personalityId,
          content,
          sourceType: 'qa',
          trainingDataId: trainingRow.id
        });
      } catch (trainingError) {
        logDev('Background QA training error:', trainingError);
      }
    });
  } catch (error) {
    logDev('QA endpoint error:', error);
    return res.status(500).json({ success: false, error: sanitizeDbError(error, 'Something went wrong during Q&A training') });
  }
});

router.post('/file', upload.single('file'), checkPlan('upload_file'), async (req, res) => {
  try {
    const { personalityId } = req.body;
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const ext = `.${file.originalname.split('.').pop().toLowerCase()}`;
    if (!req.planLimits.allowedFileTypes.includes(ext)) {
      return res.status(403).json({
        success: false,
        error: `${ext} files are not allowed on ${req.plan} plan.`,
        code: 'FILE_TYPE_NOT_ALLOWED'
      });
    }

    if (file.size > req.planLimits.maxFileSize) {
      const maxMB = Math.floor(req.planLimits.maxFileSize / (1024 * 1024));
      return res.status(403).json({
        success: false,
        error: `File too large. Max ${maxMB}MB on ${req.plan} plan.`,
        code: 'FILE_TOO_LARGE'
      });
    }

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${userId}/${personalityId}/${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabase.storage.from('training-files').upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });
    if (uploadError) {
      logDev('Upload error:', uploadError);
      return res.status(500).json({ success: false, error: sanitizeDbError(uploadError, 'Failed to upload to storage') });
    }

    const { data: signedData, error: signedError } = await supabase.storage
      .from('training-files')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);
    if (signedError) {
      logDev('Signed URL error:', signedError);
      return res.status(500).json({ success: false, error: sanitizeDbError(signedError, 'Failed to generate access link') });
    }

    const { data: trainingRow, error: dbError } = await supabase
      .from('training_data')
      .insert({
        personality_id: personalityId,
        user_id: userId,
        source_type: 'file',
        file_url: signedData?.signedUrl || null,
        file_name: file.originalname,
        file_size: file.size,
        status: 'processing'
      })
      .select('id')
      .single();
    if (dbError) {
      logDev('Database insert error:', dbError);
      return res.status(500).json({ success: false, error: sanitizeDbError(dbError, 'Failed to save training record') });
    }

    res.json({
      success: true,
      data: { trainingDataId: trainingRow.id, filename: file.originalname },
      message: 'File uploaded. Extracting text...'
    });

    // Use setImmediate or process.nextTick to ensure the response is sent before background processing
    setImmediate(async () => {
      try {
        const extractedText = await extractText(file.buffer, file.mimetype, file.originalname);
        await supabase
          .from('training_data')
          .update({ content: extractedText, char_count: extractedText.length })
          .eq('id', trainingRow.id)
          .eq('user_id', userId);

        await processTrainingAsync({
          userId,
          personalityId,
          content: extractedText,
          sourceType: 'file',
          trainingDataId: trainingRow.id
        });
      } catch (extractError) {
        logDev('Extraction/Training error:', extractError);
        await supabase
          .from('training_data')
          .update({ status: 'failed', error_message: 'Failed to extract file content' })
          .eq('id', trainingRow.id)
          .eq('user_id', userId);
      }
    });
  } catch (error) {
    logDev('File upload endpoint error:', error);
    return res.status(500).json({ success: false, error: sanitizeDbError(error, 'Something went wrong during file upload') });
  }
});

router.post('/medium', rules.medium, validate, checkPlan('add_link'), async (req, res) => {
  try {
    const { personalityId } = req.body;
    const userId = req.user.id;
    const gate = await checkLimit(userId, personalityId, 'connect_social', 'medium');
    if (!gate.allowed) {
      return res.status(403).json({
        success: false,
        error: gate.reason,
        code: 'PLAN_LIMIT_REACHED',
        upgrade: gate.upgrade
      });
    }

    const username = req.body.username.replace('@', '').trim();
    const feedUrl = `https://medium.com/feed/@${username}`;
    let feed;

    try {
      feed = await rssParser.parseURL(feedUrl);
    } catch (_error) {
      return res.status(400).json({ success: false, error: 'Could not find Medium profile. Check username and try again.' });
    }

    if (!feed.items?.length) {
      return res.status(400).json({ success: false, error: 'No articles found on this Medium profile.' });
    }

    const articles = feed.items.map((item) => {
      const stripped = toPlainText(item['content:encoded'] || item.content || '');
      return `Title: ${item.title || 'Untitled'}\n${stripped}`;
    });
    const fullContent = articles.join('\n\n---\n\n');

    const { data: trainingRow, error } = await supabase
      .from('training_data')
      .insert({
        personality_id: personalityId,
        user_id: userId,
        source_type: 'medium',
        content: fullContent,
        char_count: fullContent.length,
        file_url: feedUrl,
        status: 'processing'
      })
      .select('id')
      .single();
    if (error) throw error;

    res.json({
      success: true,
      data: { trainingDataId: trainingRow.id, articleCount: feed.items.length },
      message: `Found ${feed.items.length} articles. Training started.`
    });

    void processTrainingAsync({
      userId,
      personalityId,
      content: fullContent,
      sourceType: 'medium',
      trainingDataId: trainingRow.id
    });
  } catch (error) {
    logDev(error);
    return res.status(500).json(sanitizeError());
  }
});

router.post('/link', rules.link, validate, checkPlan('add_link'), async (req, res) => {
  try {
    const { personalityId, url } = req.body;
    const userId = req.user.id;

    if (isPrivateUrl(url)) {
      return res.status(400).json({ success: false, error: 'Private URLs are not allowed' });
    }

    const { data: trainingRow, error } = await supabase
      .from('training_data')
      .insert({
        personality_id: personalityId,
        user_id: userId,
        source_type: 'link',
        file_url: url,
        status: 'processing'
      })
      .select('id')
      .single();
    if (error) throw error;

    res.json({
      success: true,
      data: { trainingDataId: trainingRow.id },
      message: 'URL received. Extracting content...'
    });

    (async () => {
      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'AlterAI-Bot/1.0' },
          signal: AbortSignal.timeout(10000)
        });
        const html = await response.text();
        const text = toPlainText(html);

        await supabase
          .from('training_data')
          .update({ content: text, char_count: text.length })
          .eq('id', trainingRow.id)
          .eq('user_id', userId);

        await processTrainingAsync({
          userId,
          personalityId,
          content: text,
          sourceType: 'link',
          trainingDataId: trainingRow.id
        });
      } catch (fetchError) {
        logDev(fetchError);
        await supabase
          .from('training_data')
          .update({ status: 'failed', error_message: 'Failed to fetch URL content' })
          .eq('id', trainingRow.id)
          .eq('user_id', userId);
      }
    })();
  } catch (error) {
    logDev(error);
    return res.status(500).json(sanitizeError());
  }
});

router.delete('/:trainingDataId', rules.delete, validate, async (req, res) => {
  try {
    const { trainingDataId } = req.params;
    const userId = req.user.id;

    const { data: row } = await supabase
      .from('training_data')
      .select('id, user_id, source_type, file_url')
      .eq('id', trainingDataId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!row) {
      return res.status(403).json({ success: false, error: 'Not found or access denied' });
    }

    if (row.source_type === 'file' && row.file_url) {
      let storagePath = null;
      try {
        const decodedPath = decodeURIComponent(new URL(row.file_url).pathname);
        const splitMarker = '/training-files/';
        if (decodedPath.includes(splitMarker)) {
          storagePath = decodedPath.split(splitMarker)[1];
        }
      } catch (_error) {
        storagePath = null;
      }
      if (storagePath) {
        await supabase.storage.from('training-files').remove([storagePath]);
      }
    }

    await supabase.from('personality_embeddings').delete().eq('training_data_id', trainingDataId).eq('user_id', userId);
    await supabase.from('training_data').delete().eq('id', trainingDataId).eq('user_id', userId);

    return res.json({
      success: true,
      data: { trainingDataId },
      message: 'Training data deleted successfully'
    });
  } catch (error) {
    logDev(error);
    return res.status(500).json(sanitizeError());
  }
});

router.get('/plan', rules.plan, validate, async (req, res) => {
  try {
    const userId = req.user.id;
    const personalityId = req.query.personalityId;
    const plan = await getUserPlan(userId);
    const limits = getPlanLimits(plan);

    let usage = null;
    if (personalityId) {
      const owned = await ensureOwnership(userId, personalityId);
      if (!owned) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      usage = await getUserUsage(userId, personalityId);
    }

    return res.json({
      success: true,
      data: { plan, limits, usage },
      message: 'Plan info fetched'
    });
  } catch (error) {
    logDev(error);
    return res.status(500).json(sanitizeError());
  }
});

export default router;
