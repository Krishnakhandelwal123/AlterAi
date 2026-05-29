import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { userApi } from '../api/userApi.js';

export const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage if available to avoid loading screen on mount
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('alter_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Use refs to avoid stale closures in the auth listener
  const userRef = React.useRef(user);
  const sessionRef = React.useRef(session);

  useEffect(() => {
    userRef.current = user;
    sessionRef.current = session;
  }, [user, session]);

  const fetchProfile = async (accessToken) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      localStorage.setItem('alter_user_profile', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        
        const currentSession = data.session;
        setSession(currentSession);
        
        if (currentSession?.access_token) {
          // Fetch fresh profile in background
          const profile = await fetchProfile(currentSession.access_token);
          if (mounted) setUser(profile);
        } else {
          if (mounted) {
            setUser(null);
            localStorage.removeItem('alter_user_profile');
          }
        }
      } catch (error) {
        console.error('Bootstrap error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!mounted) return;

      const prevSession = sessionRef.current;
      const currentUser = userRef.current;
      
      const sessionChanged = nextSession?.access_token !== prevSession?.access_token;
      setSession(nextSession);

      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('alter_user_profile');
        setLoading(false);
        return;
      }

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && nextSession?.access_token) {
        // ONLY set loading to true if we have NO user data at all
        // This prevents the "Checking session..." flicker during background refreshes or navigation
        if (sessionChanged || !currentUser) {
          const needsLoading = !currentUser;
          if (needsLoading) setLoading(true);
          
          try {
            const profile = await fetchProfile(nextSession.access_token);
            if (mounted) setUser(profile);
          } catch (_error) {
            if (mounted && !currentUser) setUser(null);
          } finally {
            if (mounted) setLoading(false);
          }
        }
      } else if (event === 'INITIAL_SESSION' && !nextSession) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []); // Only run once on mount

  const signInWithProvider = async (provider) => {
    return supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  };

  const signOut = async () => {
    localStorage.removeItem('alter_user_profile');
    setUser(null);
    setSession(null);
    navigate('/', { replace: true });
    if (session?.access_token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` }
      }).catch(() => undefined);
    }
    await supabase.auth.signOut();
  };

  const applyProfile = (profile) => {
    localStorage.setItem('alter_user_profile', JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const updateProfile = async (payload) => {
    const result = await userApi.updateProfile(payload);
    if (result.success) applyProfile(result.profile);
    return result;
  };

  const uploadAvatar = async (file) => {
    const result = await userApi.uploadAvatar(file);
    if (result.success) applyProfile(result.profile);
    return result;
  };

  const refreshProfile = async () => {
    const {
      data: { session: currentSession }
    } = await supabase.auth.getSession();
    if (!currentSession?.access_token) return null;

    const profile = await fetchProfile(currentSession.access_token);
    applyProfile(profile);
    return profile;
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      updateProfile,
      uploadAvatar,
      refreshProfile,
      signInWithGoogle: () => signInWithProvider('google'),
      signInWithGithub: () => signInWithProvider('github'),
      signInWithTwitter: () => signInWithProvider('x'),
      signOut
    }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
