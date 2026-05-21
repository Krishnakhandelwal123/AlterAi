import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/authenticate.js';
import { calculateTrainingStrength, getUserPlan } from '../utils/planChecker.js';
import { getPlanLimits } from '../config/planLimits.js';
import { supabase } from '../lib/supabase.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

const router = Router();

const slugLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { available: false, reason: 'Too many requests. Please wait.' }
});

const logDev = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};

const RESERVED_SLUGS = [
  'admin', 'api', 'dashboard', 'login', 'signup', 'auth', 'chat',
  'clone', 'alter', 'help', 'support', 'billing', 'settings',
  'profile', 'me', 'home', 'www', 'mail', 'app', 'blog', 'about',
  'contact', 'pricing', 'team', 'careers', 'legal', 'privacy'
];

const AVATAR_COLORS = [
  '#00D4FF', '#7C3AED', '#059669', '#F59E0B', '#EF4444', '#8B5CF6'
];

const generateAvatarColor = (name) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getMessageCount = (conversation) => {
  if (typeof conversation.message_count === 'number') return conversation.message_count;
  if (!Array.isArray(conversation.messages)) return 0;
  return conversation.messages.filter((message) => message?.role === 'user').length;
};

const getMonthStart = (date = new Date()) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)).toISOString();

// ── ROUTE 1: CHECK SLUG AVAILABILITY ──────────────────────────────────────────
router.get('/check-slug/:slug', slugLimiter, authenticate, async (req, res) => {
  try {
    const { slug } = req.params;

    if (!/^[a-z0-9-]{3,30}$/.test(slug)) {
      return res.json({
        available: false,
        reason: 'Slug must be 3-30 chars, lowercase letters, numbers, hyphens only'
      });
    }

    if (RESERVED_SLUGS.includes(slug)) {
      return res.json({ available: false, reason: 'This name is reserved' });
    }

    const { data } = await supabase
      .from('personalities')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    return res.json({ available: !data });
  } catch (error) {
    logDev('check-slug error:', error);
    return res.json({ available: false, reason: 'Could not check availability' });
  }
});

// ── ROUTE 2: CREATE CLONE ──────────────────────────────────────────────────────
router.post('/create', authenticate, async (req, res) => {
  try {
    const { name, slug, bio, tone, topics, avoid, welcomeMessage } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    if (name.trim().length > 50) {
      return res.status(400).json({ error: 'Name must be 50 characters or less' });
    }
    if (!slug || !/^[a-z0-9-]{3,30}$/.test(slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }
    if (RESERVED_SLUGS.includes(slug)) {
      return res.status(400).json({ error: 'This slug is reserved' });
    }

    const validTones = ['casual', 'professional', 'friendly', 'witty', 'direct', 'empathetic'];
    const finalTone = validTones.includes(tone) ? tone : 'casual';

    if (bio && bio.length > 300) {
      return res.status(400).json({ error: 'Bio must be 300 characters or less' });
    }
    if (avoid && avoid.length > 200) {
      return res.status(400).json({ error: 'Avoid field must be 200 characters or less' });
    }
    if (welcomeMessage && welcomeMessage.length > 500) {
      return res.status(400).json({ error: 'Welcome message must be 500 characters or less' });
    }

    const finalTopics = Array.isArray(topics)
      ? topics.slice(0, 10).map((t) => String(t).trim()).filter(Boolean)
      : [];

    // Check plan limits
    let cloneCount = 0;
    try {
      const { count } = await supabase
        .from('personalities')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      cloneCount = count ?? 0;
    } catch (_err) {
      logDev('Plan count query failed:', _err);
    }

    let plan = 'free';
    try {
      plan = await getUserPlan(userId);
    } catch (_err) {
      logDev('getUserPlan failed, defaulting to free:', _err);
    }

    const planLimit = getPlanLimits(plan).maxPersonalities;

    if (cloneCount >= planLimit) {
      return res.status(403).json({
        error: `${plan} plan allows ${planLimit} clone(s). Upgrade for more.`,
        code: 'CLONE_LIMIT_REACHED',
        upgrade: plan === 'free' ? 'pro' : 'creator'
      });
    }

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('personalities')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'This slug is already taken' });
    }

    // Build insert payload — start with required fields, add optional ones
    const insertPayload = {
      user_id: userId,
      name: name.trim(),
      slug: slug.toLowerCase().trim()
    };

    // Optional fields — only add if they have values
    if (bio?.trim()) insertPayload.bio = bio.trim();
    if (finalTone) insertPayload.tone = finalTone;
    if (finalTopics.length > 0) insertPayload.topics = finalTopics;
    if (avoid?.trim()) insertPayload.avoid = avoid.trim();
    if (welcomeMessage?.trim()) insertPayload.welcome_message = welcomeMessage.trim();
    insertPayload.avatar_color = generateAvatarColor(name.trim());
    insertPayload.status = 'draft';
    insertPayload.is_public = false;

    // Attempt full insert
    let clone = null;
    let insertError = null;

    const fullResult = await supabase
      .from('personalities')
      .insert(insertPayload)
      .select()
      .single();

    if (fullResult.error) {
      logDev('Full insert error:', fullResult.error);

      // If columns are missing, retry with minimal payload
      const colMissing = (fullResult.error.message || '').toLowerCase().includes('column')
        || (fullResult.error.code === '42703');

      if (colMissing) {
        logDev('Retrying with minimal insert payload (missing columns detected)');
        const minimalPayload = {
          user_id: userId,
          name: name.trim(),
          slug: slug.toLowerCase().trim()
        };
        if (bio?.trim()) minimalPayload.bio = bio.trim();

        const minResult = await supabase
          .from('personalities')
          .insert(minimalPayload)
          .select()
          .single();

        if (minResult.error) {
          insertError = minResult.error;
        } else {
          clone = minResult.data;
        }
      } else if (fullResult.error.code === '23505') {
        return res.status(400).json({ error: 'Slug already taken' });
      } else {
        insertError = fullResult.error;
      }
    } else {
      clone = fullResult.data;
    }

    if (insertError) {
      logDev('Create clone final DB error:', insertError);
      
      let errorMessage = 'Failed to create clone';
      if (process.env.NODE_ENV !== 'production') {
        errorMessage += ` (DB: ${insertError.message || insertError.code || 'unknown'})`;
      } else {
        errorMessage += '. Please try again.';
      }

      return res.status(500).json({
        error: errorMessage,
        dbError: process.env.NODE_ENV !== 'production' ? insertError.message : undefined
      });
    }

    const { data: owner } = await supabaseAdmin
      .from('users')
      .select('avatar')
      .eq('id', userId)
      .maybeSingle();

    return res.status(201).json({
      success: true,
      clone: { ...clone, owner_avatar: owner?.avatar || '' },
      message: `Clone "${name.trim()}" created successfully!`
    });
  } catch (error) {
    logDev('create clone error:', error);
    let errorMessage = 'Failed to create clone. Please try again.';
    if (process.env.NODE_ENV !== 'production') {
      errorMessage += ` (${error.message || 'unknown error'})`;
    }
    return res.status(500).json({ error: errorMessage });
  }
});

// ── ROUTE 3: LIST USER CLONES ──────────────────────────────────────────────────
router.get('/list', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.id;

    let query = supabase
      .from('personalities')
      .select(`
        *,
        training_data (
          id,
          source_type,
          status,
          chunk_count
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      logDev('list clones error:', error);
      throw error;
    }

    const ownerIds = Array.from(new Set((data || []).map((clone) => clone.user_id).filter(Boolean)));
    const ownerAvatars = new Map();
    if (ownerIds.length > 0) {
      const { data: owners, error: ownersError } = await supabaseAdmin
        .from('users')
        .select('id, avatar')
        .in('id', ownerIds);

      if (ownersError) {
        logDev('list clone owner avatar error:', ownersError);
      } else {
        (owners || []).forEach((owner) => ownerAvatars.set(owner.id, owner.avatar || ''));
      }
    }

    const cloneIds = (data || []).map((clone) => clone.id);
    let conversationStats = new Map();
    let monthlyMessageStats = new Map();
    let embeddingStats = new Map();

    if (cloneIds.length > 0) {
      const { data: conversations, error: conversationError } = await supabase
        .from('conversations')
        .select('personality_id, visitor_id, message_count, messages')
        .in('personality_id', cloneIds);

      if (conversationError) {
        logDev('list clone conversation stats error:', conversationError);
      } else {
        conversationStats = (conversations || []).reduce((acc, conversation) => {
          const current = acc.get(conversation.personality_id) || {
            totalMessages: 0,
            totalConversations: 0,
            visitorIds: new Set()
          };

          current.totalConversations += 1;
          current.totalMessages += getMessageCount(conversation);
          if (conversation.visitor_id) current.visitorIds.add(conversation.visitor_id);
          acc.set(conversation.personality_id, current);
          return acc;
        }, new Map());
      }

      const monthStart = getMonthStart();
      let monthlyResult = await supabase
        .from('conversations')
        .select('personality_id, message_count, messages')
        .in('personality_id', cloneIds)
        .gte('last_message_at', monthStart);

      if (monthlyResult.error) {
        monthlyResult = await supabase
          .from('conversations')
          .select('personality_id, message_count, messages')
          .in('personality_id', cloneIds)
          .gte('started_at', monthStart);
      }

      if (monthlyResult.error) {
        logDev('list clone monthly message stats error:', monthlyResult.error);
      } else {
        monthlyMessageStats = (monthlyResult.data || []).reduce((acc, conversation) => {
          acc.set(
            conversation.personality_id,
            (acc.get(conversation.personality_id) || 0) + getMessageCount(conversation)
          );
          return acc;
        }, new Map());
      }

      const { data: embeddings, error: embeddingsError } = await supabase
        .from('personality_embeddings')
        .select('personality_id')
        .eq('user_id', userId)
        .in('personality_id', cloneIds);

      if (embeddingsError) {
        logDev('list clone embedding stats error:', embeddingsError);
      } else {
        embeddingStats = (embeddings || []).reduce((acc, embedding) => {
          acc.set(embedding.personality_id, (acc.get(embedding.personality_id) || 0) + 1);
          return acc;
        }, new Map());
      }
    }

    const plan = await getUserPlan(userId);
    const limits = getPlanLimits(plan);

    const clones = (data || []).map((clone) => {
      const stats = conversationStats.get(clone.id);
      const fallbackChunks = clone.training_data
        ?.reduce((sum, td) => sum + (td.chunk_count || 0), 0) || 0;
      const totalChunks = embeddingStats.get(clone.id) ?? fallbackChunks;
      const trainedSources = clone.training_data
        ?.filter((td) => td.status === 'trained').length || 0;

      return {
        ...clone,
        owner_avatar: ownerAvatars.get(clone.user_id) || '',
        total_conversations: stats?.totalConversations || 0,
        total_messages: stats?.totalMessages || 0,
        current_month_messages: monthlyMessageStats.get(clone.id) || 0,
        total_visitors: stats?.visitorIds.size || 0,
        trainingStats: {
          totalChunks,
          trainedSources,
          totalSources: clone.training_data?.length || 0,
          strengthPercent: calculateTrainingStrength(totalChunks, limits)
        }
      };
    });

    return res.json({ success: true, clones });
  } catch (error) {
    logDev('list clones error:', error);
    return res.status(500).json({ error: 'Failed to fetch clones' });
  }
});

// ── ROUTE 4: GET SINGLE CLONE ──────────────────────────────────────────────────
// NOTE: This must come before /:cloneId/publish to avoid route conflict
router.get('/:cloneId', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('personalities')
      .select('*')
      .eq('id', req.params.cloneId)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Clone not found' });
    }

    let ownerAvatar = '';
    if (data.user_id) {
      const { data: owner } = await supabaseAdmin
        .from('users')
        .select('avatar')
        .eq('id', data.user_id)
        .maybeSingle();
      ownerAvatar = owner?.avatar || '';
    }

    return res.json({ success: true, clone: { ...data, owner_avatar: ownerAvatar } });
  } catch (error) {
    logDev('get clone error:', error);
    return res.status(500).json({ error: 'Failed to fetch clone' });
  }
});

// ── ROUTE 5: UPDATE CLONE ──────────────────────────────────────────────────────
router.patch('/:cloneId', authenticate, async (req, res) => {
  try {
    const ALLOWED = ['name', 'bio', 'tone', 'topics', 'avoid', 'welcome_message', 'is_public'];
    const updates = {};
    ALLOWED.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('personalities')
      .update(updates)
      .eq('id', req.params.cloneId)
      .eq('user_id', req.user.id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Clone not found or access denied' });
    }

    const { data: owner } = await supabaseAdmin
      .from('users')
      .select('avatar')
      .eq('id', data.user_id)
      .maybeSingle();

    return res.json({ success: true, clone: { ...data, owner_avatar: owner?.avatar || '' } });
  } catch (error) {
    logDev('update clone error:', error);
    return res.status(500).json({ error: 'Failed to update clone' });
  }
});

// ── ROUTE 6: PUBLISH / UNPUBLISH ──────────────────────────────────────────────
router.patch('/:cloneId/publish', authenticate, async (req, res) => {
  try {
    const { publish } = req.body;
    const userId = req.user.id;
    const { cloneId } = req.params;

    if (typeof publish !== 'boolean') {
      return res.status(400).json({ error: 'publish field must be a boolean' });
    }

    if (publish) {
      // Accept 'trained' or 'completed' status, or just any row if statuses differ
      const { count } = await supabase
        .from('training_data')
        .select('id', { count: 'exact', head: true })
        .eq('personality_id', cloneId)
        .eq('user_id', userId)
        .in('status', ['trained', 'completed']);

      if ((count ?? 0) === 0) {
        // Fallback: check for any training data at all
        const { count: anyCount } = await supabase
          .from('training_data')
          .select('id', { count: 'exact', head: true })
          .eq('personality_id', cloneId)
          .eq('user_id', userId);

        if ((anyCount ?? 0) === 0) {
          return res.status(400).json({
            error: 'Add training data before publishing.',
            code: 'NO_TRAINING_DATA'
          });
        }
      }
    }

    // Try full update (is_public + status)
    let { data, error } = await supabase
      .from('personalities')
      .update({ is_public: publish, status: publish ? 'live' : 'draft' })
      .eq('id', cloneId)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    // If status column doesn't exist, retry with only is_public
    if (error && (error.code === '42703' || (error.message || '').toLowerCase().includes('column'))) {
      logDev('status column missing, retrying with is_public only');
      const retry = await supabase
        .from('personalities')
        .update({ is_public: publish })
        .eq('id', cloneId)
        .eq('user_id', userId)
        .select()
        .maybeSingle();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Clone not found' });
    }

    const { data: owner } = await supabaseAdmin
      .from('users')
      .select('avatar')
      .eq('id', data.user_id)
      .maybeSingle();

    return res.json({
      success: true,
      clone: { ...data, owner_avatar: owner?.avatar || '' },
      message: publish ? 'Clone is now live!' : 'Clone set to draft.'
    });
  } catch (error) {
    logDev('publish clone error:', error);
    return res.status(500).json({ error: 'Failed to update clone status' });
  }
});


// ── ROUTE 7: DELETE CLONE ──────────────────────────────────────────────────────
router.delete('/:cloneId', authenticate, async (req, res) => {
  try {
    const { cloneId } = req.params;
    const userId = req.user.id;

    const { data: clone } = await supabase
      .from('personalities')
      .select('id')
      .eq('id', cloneId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!clone) {
      return res.status(404).json({ error: 'Clone not found' });
    }

    // Attempt to clean up storage files (non-blocking)
    try {
      const { data: files } = await supabase.storage
        .from('training-files')
        .list(`${userId}/${cloneId}`);

      if (files?.length) {
        const paths = files.map((f) => `${userId}/${cloneId}/${f.name}`);
        await supabase.storage.from('training-files').remove(paths);
      }
    } catch (_storageError) {
      // Storage cleanup failure is non-fatal
    }

    // Delete personality (DB cascade removes training_data + embeddings)
    const { error } = await supabase
      .from('personalities')
      .delete()
      .eq('id', cloneId)
      .eq('user_id', userId);

    if (error) throw error;

    return res.json({ success: true, message: 'Clone deleted successfully' });
  } catch (error) {
    logDev('delete clone error:', error);
    return res.status(500).json({ error: 'Failed to delete clone' });
  }
});

export default router;
