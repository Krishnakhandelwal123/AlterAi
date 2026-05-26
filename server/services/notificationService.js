import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import {
  DEFAULT_NOTIFICATION_PREFS,
  PREF_KEY_BY_NOTIFICATION_TYPE,
  sanitizeNotificationPrefs,
  shouldDeliverEmail,
  shouldDeliverInApp
} from '../config/notificationPrefs.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const getUserPrefs = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('notifications')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return sanitizeNotificationPrefs(data?.notifications);
};

export const createNotification = async ({
  userId,
  type,
  title,
  body = '',
  link = null,
  metadata = {}
}) => {
  if (!userId || !type || !title) return null;

  try {
    const prefs = await getUserPrefs(userId);
    if (!shouldDeliverInApp(prefs, type)) return null;

    const { data, error } = await supabaseAdmin
      .from('user_notifications')
      .insert({
        user_id: userId,
        type,
        title: String(title).slice(0, 120),
        body: String(body).slice(0, 500),
        link: link ? String(link).slice(0, 500) : null,
        metadata: metadata && typeof metadata === 'object' ? metadata : {}
      })
      .select('id, user_id, type, title, body, link, metadata, read_at, created_at')
      .single();

    if (error) {
      if (error.code === '42P01' || error.message?.includes('user_notifications')) {
        console.warn('[notifications] Table missing — run server/sql/user_notifications.sql');
        return null;
      }
      throw error;
    }

    return data;
  } catch (err) {
    console.error('[notifications] create failed:', err.message);
    return null;
  }
};

export const notifyNewConversation = async ({ userId, cloneName, slug, preview }) =>
  createNotification({
    userId,
    type: 'new_conversation',
    title: `New chat on ${cloneName}`,
    body: preview ? `"${preview.slice(0, 80)}${preview.length > 80 ? '…' : ''}"` : 'A visitor started a conversation with your clone.',
    link: `${CLIENT_URL}/dashboard/analytics`,
    metadata: { slug, cloneName }
  });

export const notifyTrainingComplete = async ({ userId, cloneName, personalityId, chunks }) =>
  createNotification({
    userId,
    type: 'training_complete',
    title: 'Training complete',
    body: `${cloneName} learned ${chunks} new chunk${chunks === 1 ? '' : 's'}.`,
    link: `${CLIENT_URL}/dashboard/training`,
    metadata: { personalityId, chunks }
  });

export const notifyTrainingFailed = async ({ userId, cloneName, personalityId, reason }) =>
  createNotification({
    userId,
    type: 'training_failed',
    title: 'Training failed',
    body: reason || `Could not train ${cloneName}.`,
    link: `${CLIENT_URL}/dashboard/training`,
    metadata: { personalityId }
  });

export const notifyClonePublished = async ({ userId, cloneName, slug, published }) =>
  createNotification({
    userId,
    type: published ? 'clone_published' : 'clone_unpublished',
    title: published ? `${cloneName} is live` : `${cloneName} is now a draft`,
    body: published
      ? `Your clone is public at /chat/${slug}.`
      : 'Visitors can no longer access this clone until you publish again.',
    link: published ? `${CLIENT_URL}/chat/${slug}` : `${CLIENT_URL}/dashboard/clones`,
    metadata: { slug, published }
  });

export const notifyBillingSuccess = async ({ userId, plan }) =>
  createNotification({
    userId,
    type: 'billing_success',
    title: `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan activated`,
    body: 'Your subscription is active. Enjoy your upgraded limits.',
    link: `${CLIENT_URL}/dashboard/billing`,
    metadata: { plan }
  });

export const notifyPlanLimit = async ({ userId, message }) =>
  createNotification({
    userId,
    type: 'plan_limit',
    title: 'Plan limit reached',
    body: message,
    link: `${CLIENT_URL}/dashboard/billing#plans`,
    metadata: {}
  });

export const notifyVoiceReady = async ({ userId, cloneName, personalityId }) =>
  createNotification({
    userId,
    type: 'voice_ready',
    title: 'Voice clone ready',
    body: `${cloneName} can now speak in chat when voice is enabled.`,
    link: `${CLIENT_URL}/dashboard/voice/${personalityId}`,
    metadata: { personalityId }
  });

export const notifyWelcome = async ({ userId }) =>
  createNotification({
    userId,
    type: 'welcome',
    title: 'Welcome to Alter AI',
    body: 'Create a clone, add training data, and share your public chat link.',
    link: `${CLIENT_URL}/dashboard`,
    metadata: {}
  });

export const listNotifications = async (userId, { limit = 30, unreadOnly = false } = {}) => {
  let query = supabaseAdmin
    .from('user_notifications')
    .select('id, type, title, body, link, metadata, read_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(Math.min(Number(limit) || 30, 50));

  if (unreadOnly) {
    query = query.is('read_at', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getUnreadCount = async (userId) => {
  const { count, error } = await supabaseAdmin
    .from('user_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) throw error;
  return count || 0;
};

export const markNotificationRead = async (userId, notificationId) => {
  const { data, error } = await supabaseAdmin
    .from('user_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .is('read_at', null)
    .select('id, read_at')
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const markAllNotificationsRead = async (userId) => {
  const { error } = await supabaseAdmin
    .from('user_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) throw error;
  return true;
};

export const deleteNotification = async (userId, notificationId) => {
  const { error } = await supabaseAdmin
    .from('user_notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
};

export const shouldSendUserEmail = async (userId, prefKey) => {
  try {
    const prefs = await getUserPrefs(userId);
    return shouldDeliverEmail(prefs, prefKey);
  } catch {
    return true;
  }
};

export { DEFAULT_NOTIFICATION_PREFS, sanitizeNotificationPrefs, PREF_KEY_BY_NOTIFICATION_TYPE };
