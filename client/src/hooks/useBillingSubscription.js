import { useCallback, useEffect, useRef, useState } from 'react';
import { billingApi } from '../api/billingApi.js';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './useAuth.js';

export const BILLING_SUBSCRIPTION_UPDATED = 'alterai:billing-subscription-updated';

const SUBSCRIPTION_REFRESH_INTERVAL_MS = 30000;

export const useBillingSubscription = () => {
  const { user } = useAuth();
  const channelIdRef = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  );
  const [subscription, setSubscription] = useState(null);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshSubscription = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setError('');
      const data = await billingApi.getSubscription();
      setSubscription(data.subscription || null);
      setLimits(data.limits || null);
      return data;
    } catch (err) {
      setError(err.message || 'Could not load billing status');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  useEffect(() => {
    if (!user?.id) return undefined;

    const channel = supabase
      .channel(`billing-subscription:${user.id}:${channelIdRef.current}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          refreshSubscription({ silent: true });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshSubscription, user?.id]);

  useEffect(() => {
    const refreshVisible = () => {
      if (document.visibilityState !== 'visible') return;
      refreshSubscription({ silent: true });
    };

    const intervalId = window.setInterval(refreshVisible, SUBSCRIPTION_REFRESH_INTERVAL_MS);
    window.addEventListener('focus', refreshVisible);
    window.addEventListener(BILLING_SUBSCRIPTION_UPDATED, refreshVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshVisible);
      window.removeEventListener(BILLING_SUBSCRIPTION_UPDATED, refreshVisible);
    };
  }, [refreshSubscription]);

  return {
    subscription,
    limits,
    loading,
    error,
    currentPlan: subscription?.plan || 'free',
    refreshSubscription
  };
};
