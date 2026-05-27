import { Router } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { supabase } from '../lib/supabase.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { embedChunks } from '../utils/ai.js';
import { retrieveRelevantContext } from '../utils/retrieval.js';
import { getPlanLimits } from '../config/planLimits.js';
import { getUserPlan } from '../utils/planChecker.js';
import { GoogleGenAI } from '@google/genai';
import { notifyNewConversation } from '../services/notificationService.js';

const router = Router();

let _ai = null;
const getAIClient = () => {
  if (!_ai) {
    const key = process.env.GOOGLE_GEMINI_API_KEY;
    if (!key) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }
    _ai = new GoogleGenAI({ apiKey: key });
  }
  return _ai;
};

const CHAT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const visitorKey = typeof req.body?.visitorId === 'string' && req.body.visitorId.trim()
      ? req.body.visitorId.trim()
      : ipKeyGenerator(req.ip);
    return `${req.params.slug}:${visitorKey}`;
  },
  message: { error: 'Too many requests. Please slow down.' }
});

const sanitize = (str, max = 1000) =>
  typeof str === 'string' ? str.slice(0, max).replace(/<script|<\/script/gi, '') : '';

const getMonthStart = (date = new Date()) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)).toISOString();

const sumMessageCount = (rows = []) =>
  rows.reduce((sum, row) => sum + (Number(row.message_count) || 0), 0);

const getCreatorMonthlyMessageCount = async (creatorId, monthStart = getMonthStart()) => {
  const { data: clones, error: clonesError } = await supabase
    .from('personalities')
    .select('id')
    .eq('user_id', creatorId);

  if (clonesError) throw clonesError;

  const cloneIds = (clones || []).map((clone) => clone.id).filter(Boolean);
  if (cloneIds.length === 0) return 0;

  const byLastMessage = await supabase
    .from('conversations')
    .select('message_count')
    .in('personality_id', cloneIds)
    .gte('last_message_at', monthStart);

  if (!byLastMessage.error) return sumMessageCount(byLastMessage.data || []);

  const byStartedAt = await supabase
    .from('conversations')
    .select('message_count')
    .in('personality_id', cloneIds)
    .gte('started_at', monthStart);

  if (byStartedAt.error) throw byStartedAt.error;
  return sumMessageCount(byStartedAt.data || []);
};

const getChatErrorMessage = (error) => {
  const message = error?.message || '';
  if (
    error?.status === 429
    || message.includes('RESOURCE_EXHAUSTED')
    || message.includes('generate_content_free_tier_requests')
    || message.includes('Too Many Requests')
    || message.includes('quota')
  ) {
    return "I couldn't get a response right now. Please try again in a bit.";
  }
  if (message.includes('GOOGLE_GEMINI_API_KEY')) {
    return "I couldn't get a response right now. Please try again in a bit.";
  }
  return 'Something went wrong. Please try again.';
};

// ── GET PROFILE (PUBLIC / PREVIEW) ───────────────────────────────────────────────
router.get('/:slug/profile', async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: personality, error } = await supabase
      .from('personalities')
      .select('id, name, slug, bio, tone, topics, avatar_color, welcome_message, created_at, user_id, is_public, voice_enabled')
      .eq('slug', slug)
      .single();

    if (error || !personality) {
      return res.status(404).json({ error: 'Clone not found or not public', code: 'NOT_FOUND' });
    }

    // Chat pages are only available after the creator publishes the clone.
    if (!personality.is_public) {
      return res.status(404).json({ error: 'This clone is not live yet', code: 'CLONE_NOT_LIVE' });
    }

    const { data: owner } = await supabaseAdmin
      .from('users')
      .select('avatar')
      .eq('id', personality.user_id)
      .maybeSingle();

    return res.json({
      success: true,
      personality: {
        ...personality,
        owner_avatar: owner?.avatar || ''
      }
    });
  } catch (err) {
    console.error('[chat] profile error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── SEND MESSAGE — SSE STREAMING ──────────────────────────────────────────────
router.post('/:slug/message', chatRateLimiter, async (req, res) => {
  const { slug } = req.params;
  const { message, visitorId, conversationId } = req.body;

  // Validate input
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }
  if (message.length > 1000) {
    return res.status(400).json({ error: 'Message too long. Max 1000 characters.' });
  }
  if (!visitorId || typeof visitorId !== 'string') {
    return res.status(400).json({ error: 'visitorId is required' });
  }

  const cleanMessage = sanitize(message);

  // Fetch personality
  const { data: personality } = await supabase
    .from('personalities')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!personality) {
    return res.status(404).json({ error: 'Clone not found' });
  }

  let requestingUser = null;
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      if (!authError && user) {
        requestingUser = user;
      }
    } catch (e) {}
  }

  const isOwner = requestingUser?.id === personality.user_id;
  const ownerPlan = await getUserPlan(personality.user_id);
  const planLimits = getPlanLimits(ownerPlan);
  const dailyLimit = planLimits.maxVisitorMessagesPerDay;
  const monthlyLimit = planLimits.maxCreatorMessagesPerMonth;

  // Chat messages are blocked until the clone is live/public.
  if (!personality.is_public) {
    return res.status(404).json({ error: 'This clone is not live yet', code: 'CLONE_NOT_LIVE' });
  }

  // Check visitor rate limit
  const { data: usageRow } = await supabase
    .from('visitor_usage')
    .select('message_count, window_start')
    .eq('personality_id', personality.id)
    .eq('visitor_id', visitorId)
    .maybeSingle();

  if (!isOwner && usageRow) {
    const windowAge = Date.now() - new Date(usageRow.window_start).getTime();
    const isNewWindow = windowAge > 24 * 60 * 60 * 1000;
    if (!isNewWindow && usageRow.message_count >= dailyLimit) {
      return res.status(429).json({
        error: `Daily limit of ${dailyLimit} messages reached. Come back tomorrow!`,
        code: 'RATE_LIMIT_REACHED',
        period: 'day',
        limit: dailyLimit,
        resetAt: new Date(new Date(usageRow.window_start).getTime() + 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  if (monthlyLimit) {
    const creatorMonthlyMessages = await getCreatorMonthlyMessageCount(personality.user_id);
    if (creatorMonthlyMessages >= monthlyLimit) {
      return res.status(429).json({
        error: `Monthly creator message limit of ${monthlyLimit.toLocaleString()} reached for this clone owner.`,
        code: 'CREATOR_MONTHLY_LIMIT_REACHED',
        period: 'month',
        limit: monthlyLimit,
        used: creatorMonthlyMessages
      });
    }
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const sendEvent = (data) => {
    try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch (_) {}
  };

  try {
    const contextText = await retrieveRelevantContext({
      supabase,
      personalityId: personality.id,
      query: cleanMessage,
      embedChunks,
      logger: console
    });

    // Load full conversation for analytics, but only send recent turns to the model.
    let storedMessages = [];
    let history = [];
    if (conversationId) {
      const { data: conv } = await supabase
        .from('conversations')
        .select('messages')
        .eq('id', conversationId)
        .maybeSingle();
      storedMessages = Array.isArray(conv?.messages) ? conv.messages : [];
      history = storedMessages.slice(-6);
    }

    // Build system prompt
    const systemInstruction = `You are ${personality.name}, an AI clone trained on real content.

PERSONALITY:
- Tone: ${personality.tone || 'friendly'}
- Bio: ${personality.bio || 'N/A'}
- Topics: ${personality.topics?.join(', ') || 'General'}
${personality.avoid ? `- Never discuss: ${personality.avoid}` : ''}

RULES:
- Always respond in first person as ${personality.name}
- You ARE ${personality.name} — never break character
- For factual questions about ${personality.name}, use RELEVANT KNOWLEDGE as the source of truth
- Do not invent experience, employers, projects, dates, education, skills, or achievements not present in RELEVANT KNOWLEDGE
- If RELEVANT KNOWLEDGE does not contain the answer, say you do not have that detail in your training data
- If asked if you are AI: say "I'm an AI version of ${personality.name}, trained on their real content"
- Keep responses conversational, under 150 words unless genuinely needed
- Match the tone: ${personality.tone || 'friendly'}
${contextText ? `\nRELEVANT KNOWLEDGE:\n${contextText}` : ''}`.trim();

    // Build Gemini contents array (converts history roles)
    const contents = [
      ...history.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      { role: 'user', parts: [{ text: cleanMessage }] }
    ];

    // Stream from Gemini. Keep the model configurable because Google deprecates
    // model aliases over time.
    const stream = await getAIClient().models.generateContentStream({
      model: CHAT_MODEL,
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 400,
        temperature: 0.75
      }
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const token = chunk.text || '';
      if (token) {
        fullResponse += token;
        sendEvent({ type: 'token', content: token });
      }
    }

    // Persist conversation
    const newMessages = [
      ...storedMessages,
      { role: 'user', content: cleanMessage },
      { role: 'assistant', content: fullResponse }
    ];

    let savedConvId = conversationId;
    if (conversationId) {
      await supabase
        .from('conversations')
        .update({
          messages: newMessages,
          message_count: newMessages.filter((message) => message?.role === 'user').length,
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId);
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          personality_id: personality.id,
          visitor_id: visitorId,
          messages: newMessages,
          message_count: 1,
          last_message_at: new Date().toISOString()
        })
        .select('id')
        .single();
      savedConvId = newConv?.id;

      if (!isOwner && newConv?.id) {
        void notifyNewConversation({
          userId: personality.user_id,
          cloneName: personality.name,
          slug: personality.slug,
          preview: cleanMessage
        });
      }
    }

    // Update visitor usage
    if (isOwner) {
      // Owners can preview/test their own clone without consuming the public visitor quota.
    } else if (usageRow) {
      const windowAge = Date.now() - new Date(usageRow.window_start).getTime();
      const isNewWindow = windowAge > 24 * 60 * 60 * 1000;
      await supabase
        .from('visitor_usage')
        .update({
          message_count: isNewWindow ? 1 : usageRow.message_count + 1,
          window_start: isNewWindow ? new Date().toISOString() : usageRow.window_start
        })
        .eq('personality_id', personality.id)
        .eq('visitor_id', visitorId);
    } else {
      await supabase.from('visitor_usage').insert({
        personality_id: personality.id,
        visitor_id: visitorId,
        message_count: 1,
        window_start: new Date().toISOString()
      });
    }

    // Increment clone message counter (non-blocking)
    void supabase.rpc('increment_message_count', { personality_id_input: personality.id });

    const newCount = isOwner ? 0 : (usageRow ? usageRow.message_count + 1 : 1);
    sendEvent({
      type: 'done',
      conversationId: savedConvId,
      remaining: isOwner ? dailyLimit : Math.max(0, dailyLimit - newCount)
    });
    res.end();
  } catch (err) {
    console.error('[chat] message error:', err);
    sendEvent({ type: 'error', message: getChatErrorMessage(err) });
    res.end();
  }
});

// ── GET CONVERSATION HISTORY ───────────────────────────────────────────────────
router.get('/:slug/history', async (req, res) => {
  try {
    const { visitorId } = req.query;
    const { slug } = req.params;

    if (!visitorId) return res.json({ success: true, conversation: null });

    const { data: personality } = await supabase
      .from('personalities')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!personality) return res.json({ success: true, conversation: null });

    const { data: conversation } = await supabase
      .from('conversations')
      .select('id, messages, message_count, started_at')
      .eq('personality_id', personality.id)
      .eq('visitor_id', visitorId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return res.json({ success: true, conversation: conversation || null });
  } catch (err) {
    console.error('[chat] history error:', err);
    return res.json({ success: true, conversation: null });
  }
});

export default router;
