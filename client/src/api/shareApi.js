import { supabase } from '../lib/supabase.js';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getHeaders = async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token}`
  };
};

const parseResponse = async (res) => {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, error: json.error || 'Request failed' };
  }
  return json;
};

export const shareApi = {
  getShareData: async (cloneId) => {
    const res = await fetch(`${BASE}/api/share/${cloneId}`, {
      headers: await getHeaders()
    });
    return parseResponse(res);
  },

  toggleVisibility: async (cloneId, is_public) => {
    const res = await fetch(`${BASE}/api/share/${cloneId}/visibility`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify({ is_public })
    });
    return parseResponse(res);
  },

  trackShare: async (cloneId, platform) => {
    fetch(`${BASE}/api/share/${cloneId}/track`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ platform })
    }).catch(() => {});
  },

  getAnalytics: async (cloneId) => {
    const res = await fetch(`${BASE}/api/share/${cloneId}/analytics`, {
      headers: await getHeaders()
    });
    return parseResponse(res);
  }
};
