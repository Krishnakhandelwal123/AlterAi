import { Router } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { supabase } from '../lib/supabase.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { embedChunks } from '../utils/ai.js';
import { GoogleGenAI } from '@google/genai';

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

const DAILY_LIMIT = 20;
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

    // Check if requester is authenticated (for previewing draft/private clones)
    let requestingUser = null;
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      try {
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (!authError && user) {
          requestingUser = user;
        }
      } catch (e) {
        console.warn('[chat] auth extraction failed in preview mode:', e.message);
      }
    }

    const { data: personality, error } = await supabase
      .from('personalities')
      .select('id, name, slug, bio, tone, topics, avatar_color, welcome_message, created_at, user_id, is_public')
      .eq('slug', slug)
      .single();

    if (error || !personality) {
      return res.status(404).json({ error: 'Clone not found or not public', code: 'NOT_FOUND' });
    }

    // If clone is not public, only allow the owner to view/preview it
    if (!personality.is_public) {
      if (!requestingUser || requestingUser.id !== personality.user_id) {
        return res.status(404).json({ error: 'Clone not found or not public yet', code: 'NOT_FOUND' });
      }
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

  // If clone is not public, only allow the owner to message/test it
  if (!personality.is_public) {
    if (!requestingUser || requestingUser.id !== personality.user_id) {
      return res.status(404).json({ error: 'Clone not found or not live' });
    }
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
    if (!isNewWindow && usageRow.message_count >= DAILY_LIMIT) {
      return res.status(429).json({
        error: `Daily limit of ${DAILY_LIMIT} messages reached. Come back tomorrow!`,
        code: 'RATE_LIMIT_REACHED',
        limit: DAILY_LIMIT,
        resetAt: new Date(new Date(usageRow.window_start).getTime() + 24 * 60 * 60 * 1000).toISOString()
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
    // RAG: embed query + vector search
    let contextText = '';
    try {
      const [queryVec] = await embedChunks([cleanMessage]);
      const { data: chunks } = await supabase.rpc('match_personality_embeddings', {
        query_embedding: queryVec,
        match_threshold: 0.3,
        match_count: 5,
        p_personality_id: personality.id
      });
      contextText = chunks?.map((c) => c.chunk_text).join('\n\n') || '';
    } catch (ragErr) {
      console.warn('[chat] RAG skipped:', ragErr.message);
    }

    // Load conversation history (last 6 messages = 3 turns)
    let history = [];
    if (conversationId) {
      const { data: conv } = await supabase
        .from('conversations')
        .select('messages')
        .eq('id', conversationId)
        .maybeSingle();
      history = (conv?.messages || []).slice(-6);
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
      ...history,
      { role: 'user', content: cleanMessage },
      { role: 'assistant', content: fullResponse }
    ];

    let savedConvId = conversationId;
    if (conversationId) {
      await supabase
        .from('conversations')
        .update({
          messages: newMessages,
          message_count: Math.floor(newMessages.length / 2),
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
          message_count: 1
        })
        .select('id')
        .single();
      savedConvId = newConv?.id;
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
      remaining: isOwner ? DAILY_LIMIT : Math.max(0, DAILY_LIMIT - newCount)
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
