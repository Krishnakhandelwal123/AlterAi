import { supabase } from '../lib/supabase.js';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getHeaders = async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  return {
    Authorization: `Bearer ${session?.access_token}`
  };
};

export const voiceApi = {
  getStatus: async (personalityId) => {
    const res = await fetch(`${BASE}/api/voice/status/${personalityId}`, {
      headers: await getHeaders()
    });
    return res.json();
  },

  cloneVoice: async (personalityId, audioBlob, voiceName, durationSeconds) => {
    const headers = await getHeaders();
    const formData = new FormData();
    const fileName = audioBlob.type?.includes('wav') ? 'voice_sample.wav' : 'voice_sample.webm';
    formData.append('audio', audioBlob, fileName);
    formData.append('personalityId', personalityId);
    formData.append('voiceName', voiceName || '');
    formData.append('durationSeconds', String(durationSeconds || 0));

    // Do NOT set Content-Type — browser must add multipart boundary automatically
    const res = await fetch(`${BASE}/api/voice/clone`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Voice cloning failed'
      };
    }
    return data;
  },

  toggleVoice: async (personalityId, enabled) => {
    const res = await fetch(`${BASE}/api/voice/toggle/${personalityId}`, {
      method: 'PATCH',
      headers: {
        ...(await getHeaders()),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ enabled })
    });
    return res.json();
  },

  deleteVoice: async (personalityId) => {
    const res = await fetch(`${BASE}/api/voice/${personalityId}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return res.json();
  },

  speak: async (text, personalityId) => {
    const res = await fetch(`${BASE}/api/voice/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, personalityId })
    });
    if (!res.ok) return null;
    return res.blob();
  }
};
