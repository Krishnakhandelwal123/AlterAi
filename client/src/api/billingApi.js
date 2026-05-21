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

const parseJson = async (res) => {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.error || 'Billing request failed');
  }
  return json;
};

export const billingApi = {
  getSubscription: async () => {
    const res = await fetch(`${BASE}/api/billing/subscription`, {
      headers: await getHeaders()
    });
    return parseJson(res);
  },

  createOrder: async (plan) => {
    const res = await fetch(`${BASE}/api/billing/orders`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ plan })
    });
    return parseJson(res);
  },

  verifyPayment: async (payload) => {
    const res = await fetch(`${BASE}/api/billing/verify`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(payload)
    });
    return parseJson(res);
  }
};
