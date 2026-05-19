import { supabase } from '../lib/supabase.js';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeader = async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return {
    Authorization: `Bearer ${session?.access_token}`
  };
};

const parseResponse = async (res) => {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, error: json.error || 'Request failed' };
  }
  return { success: true, profile: json };
};

export const userApi = {
  updateProfile: async (payload) => {
    const headers = await getAuthHeader();
    const res = await fetch(`${BASE}/api/user/profile`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return parseResponse(res);
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await fetch(`${BASE}/api/user/profile/avatar`, {
      method: 'POST',
      headers: await getAuthHeader(),
      body: formData
    });
    return parseResponse(res);
  }
};
