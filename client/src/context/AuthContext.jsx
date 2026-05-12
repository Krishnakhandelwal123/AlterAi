import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async (accessToken) => {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.access_token) {
        try {
          const profile = await fetchProfile(data.session.access_token);
          if (mounted) setUser(profile);
        } catch (_error) {
          if (mounted) setUser(null);
        }
      }
      if (mounted) setLoading(false);
    };

    bootstrap();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      setSession(nextSession);
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        return;
      }
      if (event === 'SIGNED_IN' && nextSession?.access_token) {
        setLoading(true);
        try {
          const profile = await fetchProfile(nextSession.access_token);
          setUser(profile);
        } catch (_error) {
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signInWithProvider = async (provider) => {
    return supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  };

  const signOut = async () => {
    if (session?.access_token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` }
      }).catch(() => undefined);
    }
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signInWithGoogle: () => signInWithProvider('google'),
      signInWithGithub: () => signInWithProvider('github'),
      signInWithTwitter: () => signInWithProvider('twitter'),
      signOut
    }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
