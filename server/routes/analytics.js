import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { supabase } from '../lib/supabase.js';

const router = Router();

const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeQuestion = (text) =>
  String(text || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.?!]+$/g, '')
    .toLowerCase();

const displayQuestion = (text) => {
  const cleaned = String(text || '').trim().replace(/\s+/g, ' ');
  return cleaned.length > 120 ? `${cleaned.slice(0, 117)}...` : cleaned;
};

const buildDailyStats = (conversations, now = new Date()) => {
  const stats = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now.getTime() - i * DAY_MS);
    const key = date.toISOString().slice(0, 10);
    stats.push({
      date: key,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      conversations: 0
    });
  }

  const byDate = new Map(stats.map((item) => [item.date, item]));
  conversations.forEach((conversation) => {
    const key = new Date(conversation.started_at).toISOString().slice(0, 10);
    const day = byDate.get(key);
    if (day) day.conversations += 1;
  });

  return stats;
};

const extractTopQuestions = (conversations) => {
  const questions = new Map();

  conversations.forEach((conversation) => {
    const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
    messages
      .filter((message) => message?.role === 'user' && message?.content)
      .forEach((message) => {
        const key = normalizeQuestion(message.content);
        if (!key) return;
        const current = questions.get(key) || {
          question: displayQuestion(message.content),
          count: 0
        };
        current.count += 1;
        questions.set(key, current);
      });
  });

  return [...questions.values()]
    .sort((a, b) => b.count - a.count || a.question.localeCompare(b.question))
    .slice(0, 5);
};

router.get('/:personalityId', authenticate, async (req, res) => {
  try {
    const { personalityId } = req.params;
    const now = new Date();
    const last24Hours = new Date(now.getTime() - DAY_MS).toISOString();
    const last7Days = new Date(now.getTime() - 7 * DAY_MS).toISOString();

    const { data: clone, error: cloneError } = await supabase
      .from('personalities')
      .select('id')
      .eq('id', personalityId)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (cloneError) throw cloneError;
    if (!clone) {
      return res.status(404).json({ success: false, error: 'Clone not found' });
    }

    const [
      totalResult,
      todayResult,
      weekResult,
      recentResult,
      dailyResult
    ] = await Promise.all([
      supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .eq('personality_id', personalityId),
      supabase
        .from('conversations')
        .select('message_count')
        .eq('personality_id', personalityId)
        .gte('started_at', last24Hours),
      supabase
        .from('conversations')
        .select('visitor_id')
        .eq('personality_id', personalityId)
        .gte('started_at', last7Days),
      supabase
        .from('conversations')
        .select('messages')
        .eq('personality_id', personalityId)
        .order('started_at', { ascending: false })
        .limit(100),
      supabase
        .from('conversations')
        .select('started_at')
        .eq('personality_id', personalityId)
        .gte('started_at', last7Days)
    ]);

    const firstError = [totalResult, todayResult, weekResult, recentResult, dailyResult]
      .find((result) => result.error)?.error;
    if (firstError) throw firstError;

    const messagesToday = (todayResult.data || []).reduce(
      (sum, conversation) => sum + (conversation.message_count || 0),
      0
    );
    const uniqueVisitors = new Set(
      (weekResult.data || []).map((conversation) => conversation.visitor_id).filter(Boolean)
    ).size;
    const topQuestions = extractTopQuestions(recentResult.data || []);
    const dailyStats = buildDailyStats(dailyResult.data || [], now);

    return res.json({
      success: true,
      analytics: {
        totalConversations: totalResult.count || 0,
        messagesToday,
        uniqueVisitorsThisWeek: uniqueVisitors,
        mostAskedQuestion: topQuestions[0] || null,
        topQuestions,
        dailyStats
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('analytics error:', error);
    }
    return res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

export default router;
