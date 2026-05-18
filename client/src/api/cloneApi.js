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

export const cloneApi = {
  checkSlug: async (slug) => {
    try {
      const res = await fetch(`${BASE}/api/clone/check-slug/${encodeURIComponent(slug)}`, {
        headers: await getHeaders()
      });
      if (!res.ok) return { available: false, reason: 'Server error' };
      return res.json();
    } catch {
      return { available: false, reason: 'Network error' };
    }
  },

  create: async (data) => {
    try {
      const res = await fetch(`${BASE}/api/clone/create`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error || 'Failed to create clone' };
      return json;
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  list: async (status = 'all') => {
    try {
      const res = await fetch(`${BASE}/api/clone/list?status=${encodeURIComponent(status)}`, {
        headers: await getHeaders()
      });
      if (!res.ok) return { success: false, clones: [], error: 'Failed to fetch clones' };
      return res.json();
    } catch {
      return { success: false, clones: [], error: 'Network error' };
    }
  },

  get: async (cloneId) => {
    try {
      const res = await fetch(`${BASE}/api/clone/${cloneId}`, {
        headers: await getHeaders()
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error || 'Not found' };
      return json;
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  update: async (cloneId, data) => {
    try {
      const res = await fetch(`${BASE}/api/clone/${cloneId}`, {
        method: 'PATCH',
        headers: await getHeaders(),
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error || 'Failed to update' };
      return json;
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  publish: async (cloneId, publish) => {
    try {
      const res = await fetch(`${BASE}/api/clone/${cloneId}/publish`, {
        method: 'PATCH',
        headers: await getHeaders(),
        body: JSON.stringify({ publish })
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error || 'Failed to update status', code: json.code };
      return json;
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  delete: async (cloneId) => {
    try {
      const res = await fetch(`${BASE}/api/clone/${cloneId}`, {
        method: 'DELETE',
        headers: await getHeaders()
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error || 'Failed to delete' };
      return json;
    } catch {
      return { success: false, error: 'Network error' };
    }
  }
};
