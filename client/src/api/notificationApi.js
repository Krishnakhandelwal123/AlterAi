import { supabase } from '../lib/supabase.js';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getHeaders = async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  return {
    Authorization: `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json'
  };
};

const parseJson = async (res) => {
  if (res.status === 204) {
    return res.ok ? { success: true } : { success: false, error: 'Request failed' };
  }
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }
  }
  if (!res.ok) {
    return { success: false, error: data.error || 'Request failed' };
  }
  return { success: true, ...data };
};

export const notificationApi = {
  list: async ({ limit = 30, unreadOnly = false } = {}) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (unreadOnly) params.set('unread', 'true');
    const res = await fetch(`${BASE}/api/notifications?${params}`, {
      headers: await getHeaders(),
      cache: 'no-store'
    });
    return parseJson(res);
  },

  unreadCount: async () => {
    const res = await fetch(`${BASE}/api/notifications/unread-count`, {
      headers: await getHeaders(),
      cache: 'no-store'
    });
    return parseJson(res);
  },

  markRead: async (id) => {
    const res = await fetch(`${BASE}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: await getHeaders()
    });
    return parseJson(res);
  },

  markAllRead: async () => {
    const res = await fetch(`${BASE}/api/notifications/read-all`, {
      method: 'PATCH',
      headers: await getHeaders()
    });
    return parseJson(res);
  },

  remove: async (id) => {
    const res = await fetch(`${BASE}/api/notifications/${id}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return parseJson(res);
  }
};
