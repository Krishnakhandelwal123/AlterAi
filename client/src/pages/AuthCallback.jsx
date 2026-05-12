import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingScreen from '../components/LoadingScreen';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const getSessionWithRetry = async () => {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const {
          data: { session }
        } = await supabase.auth.getSession();
        if (session?.access_token) return session;
        await new Promise((resolve) => {
          setTimeout(resolve, 300);
        });
      }
      return null;
    };

    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const oauthError = params.get('error_description') || params.get('error');
        if (oauthError) {
          navigate(`/auth?error=${encodeURIComponent(oauthError)}`, { replace: true });
          return;
        }

        const session = await getSessionWithRetry();
        if (!session?.access_token) throw new Error('No active session after callback');

        const res = await fetch(`${API_URL}/api/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: session.access_token })
        });

        if (!res.ok) {
          let message = 'Verification failed';
          try {
            const payload = await res.json();
            message = payload?.message || payload?.error || message;
          } catch (_parseError) {
            // Keep fallback error text.
          }
          throw new Error(message);
        }
        const data = await res.json();

        navigate(data.isNewUser ? '/dashboard' : '/dashboard', { replace: true });
      } catch (error) {
        const message = error?.message || 'callback_failed';
        navigate(`/auth?error=${encodeURIComponent(message)}`, { replace: true });
      }
    };

    run();
  }, [navigate]);

  return <LoadingScreen text="Signing you in..." />;
};

export default AuthCallback;
