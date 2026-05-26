import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { supabase } from '../lib/supabase.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { getUserPlan } from '../utils/planChecker.js';
import { notifyClonePublished } from '../services/notificationService.js';

const router = Router();
const DAY_MS = 24 * 60 * 60 * 1000;
const SHARE_PLATFORMS = ['twitter', 'linkedin', 'whatsapp', 'copy', 'qr'];

const getBaseUrl = (req) => {
  const configured = process.env.PUBLIC_APP_URL || process.env.CLIENT_URL;
  if (configured) return configured.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
};

const getMessageCount = (conversation) => {
  if (typeof conversation.message_count === 'number') return conversation.message_count;
  if (!Array.isArray(conversation.messages)) return 0;
  return conversation.messages.filter((message) => message?.role === 'user').length;
};

const buildDailyStats = (events, now = new Date()) => {
  const stats = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now.getTime() - i * DAY_MS);
    const key = date.toISOString().slice(0, 10);
    stats.push({
      date: key,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      shares: 0
    });
  }

  const byDate = new Map(stats.map((item) => [item.date, item]));
  events.forEach((event) => {
    const key = new Date(event.created_at).toISOString().slice(0, 10);
    const day = byDate.get(key);
    if (day) day.shares += 1;
  });

  return stats;
};

const ensureOwnedClone = async (cloneId, userId, select = '*') => {
  const { data, error } = await supabase
    .from('personalities')
    .select(select)
    .eq('id', cloneId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const getConversationStats = async (cloneId) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('visitor_id, message_count, messages')
    .eq('personality_id', cloneId);

  if (error) throw error;

  return (data || []).reduce(
    (acc, conversation) => {
      acc.totalConversations += 1;
      acc.totalMessages += getMessageCount(conversation);
      if (conversation.visitor_id) acc.visitorIds.add(conversation.visitor_id);
      return acc;
    },
    { totalConversations: 0, totalMessages: 0, visitorIds: new Set() }
  );
};

const getShareEvents = async (cloneId, since = null) => {
  let query = supabase
    .from('share_events')
    .select('platform, created_at')
    .eq('personality_id', cloneId);

  if (since) query = query.gte('created_at', since);

  const { data, error } = await query;
  if (error) {
    const message = (error.message || '').toLowerCase();
    if (error.code === '42P01' || message.includes('share_events')) return [];
    throw error;
  }
  return data || [];
};

const buildEmbedCode = ({ shareUrl, slug, clone }) => {
  const origin = getBaseUrlFromShareUrl(shareUrl);
  const color = clone.avatar_color || '#00D4FF';
  const safeName = String(clone.name || 'AI').replace(/"/g, '&quot;');
  return {
    iframe: `<iframe src="${shareUrl}?theme=dark&embed=true" width="100%" height="600px" frameborder="0" style="border-radius:16px;border:none;" allow="microphone" title="${safeName} AI Clone"></iframe>`,
    script: `<!-- Alter AI floating widget -->\n<script src="${origin}/widget.js" data-slug="${slug}" data-theme="dark" data-position="bottom-right" data-color="${color}" data-label="Chat with ${safeName}" async></script>`,
    button: `<a href="${shareUrl}" target="_blank" rel="noopener noreferrer" style="background:${color};color:#080808;padding:12px 24px;border-radius:999px;text-decoration:none;font-family:system-ui,sans-serif;font-weight:600;">Chat with ${safeName}</a>`
  };
};

const getBaseUrlFromShareUrl = (shareUrl) => {
  try {
    return new URL(shareUrl).origin;
  } catch {
    return 'https://alter.ai';
  }
};

router.get('/:cloneId', authenticate, async (req, res) => {
  try {
    const clone = await ensureOwnedClone(
      req.params.cloneId,
      req.user.id,
      'id, user_id, name, slug, bio, avatar_color, is_public, status, created_at'
    );
    if (!clone) return res.status(404).json({ success: false, error: 'Clone not found' });

    const [conversationStats, shareEvents, plan, owner] = await Promise.all([
      getConversationStats(clone.id),
      getShareEvents(clone.id),
      getUserPlan(req.user.id).catch(() => 'free'),
      supabaseAdmin.from('users').select('avatar').eq('id', clone.user_id).maybeSingle()
    ]);

    const baseUrl = getBaseUrl(req);
    const shareUrl = `${baseUrl}/chat/${clone.slug}`;
    const totalShares = shareEvents.length;

    return res.json({
      success: true,
      clone: {
        ...clone,
        owner_avatar: owner?.data?.avatar || '',
        total_messages: conversationStats.totalMessages,
        total_visitors: conversationStats.visitorIds.size
      },
      plan,
      shareUrl,
      displayUrl: `alter.ai/chat/${clone.slug}`,
      embedCode: buildEmbedCode({ shareUrl, slug: clone.slug, clone }),
      stats: {
        totalShares,
        totalVisitors: conversationStats.visitorIds.size,
        totalConversations: conversationStats.totalConversations
      }
    });
  } catch (error) {
    console.error('share data error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch share data' });
  }
});

router.patch('/:cloneId/visibility', authenticate, async (req, res) => {
  try {
    const { is_public: isPublic } = req.body;
    if (typeof isPublic !== 'boolean') {
      return res.status(400).json({ success: false, error: 'is_public must be a boolean' });
    }

    const clone = await ensureOwnedClone(req.params.cloneId, req.user.id, 'id');
    if (!clone) return res.status(404).json({ success: false, error: 'Clone not found' });

    if (isPublic) {
      const { count, error: trainingError } = await supabase
        .from('training_data')
        .select('id', { count: 'exact', head: true })
        .eq('personality_id', clone.id)
        .eq('user_id', req.user.id)
        .in('status', ['trained', 'completed']);

      if (trainingError) throw trainingError;
      if ((count || 0) < 1) {
        return res.status(400).json({
          success: false,
          error: 'Add training data before publishing'
        });
      }
    }

    const { data, error } = await supabase
      .from('personalities')
      .update({ is_public: isPublic, status: isPublic ? 'live' : 'draft' })
      .eq('id', clone.id)
      .eq('user_id', req.user.id)
      .select('id, user_id, name, slug, bio, avatar_color, is_public, status, created_at')
      .maybeSingle();

    if (error) throw error;
    const { data: owner } = await supabaseAdmin.from('users').select('avatar').eq('id', data.user_id).maybeSingle();

    void notifyClonePublished({
      userId: req.user.id,
      cloneName: data.name,
      slug: data.slug,
      published: isPublic
    });

    return res.json({ success: true, clone: { ...data, owner_avatar: owner?.avatar || '' } });
  } catch (error) {
    console.error('share visibility error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update visibility' });
  }
});

router.post('/:cloneId/track', authenticate, async (req, res) => {
  try {
    const { platform } = req.body;
    if (!SHARE_PLATFORMS.includes(platform)) {
      return res.status(400).json({ success: false, error: 'Invalid platform' });
    }

    const clone = await ensureOwnedClone(req.params.cloneId, req.user.id, 'id');
    if (!clone) return res.status(404).json({ success: false, error: 'Clone not found' });

    const { error } = await supabase
      .from('share_events')
      .insert({ personality_id: clone.id, platform });

    if (error) {
      const message = (error.message || '').toLowerCase();
      if (error.code === '42P01' || message.includes('share_events')) {
        return res.status(500).json({
          success: false,
          error: 'share_events table is missing. Run the share_events migration.'
        });
      }
      throw error;
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('share track error:', error);
    return res.status(500).json({ success: false, error: 'Failed to track share' });
  }
});

router.get('/:cloneId/analytics', authenticate, async (req, res) => {
  try {
    const clone = await ensureOwnedClone(req.params.cloneId, req.user.id, 'id');
    if (!clone) return res.status(404).json({ success: false, error: 'Clone not found' });

    const since = new Date(Date.now() - 7 * DAY_MS).toISOString();
    const [allEvents, recentEvents] = await Promise.all([
      getShareEvents(clone.id),
      getShareEvents(clone.id, since)
    ]);

    const sharesByPlatform = SHARE_PLATFORMS.reduce((acc, platform) => {
      acc[platform] = 0;
      return acc;
    }, {});

    allEvents.forEach((event) => {
      if (sharesByPlatform[event.platform] !== undefined) {
        sharesByPlatform[event.platform] += 1;
      }
    });

    return res.json({
      success: true,
      sharesByPlatform,
      totalShares: allEvents.length,
      last7Days: buildDailyStats(recentEvents)
    });
  } catch (error) {
    console.error('share analytics error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch share analytics' });
  }
});

export default router;
