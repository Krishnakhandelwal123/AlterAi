import React, { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import OAuthButton from '../components/OAuthButton';
import { useAuth } from '../hooks/useAuth';

const Auth = () => {
  const { user, loading, signInWithGoogle, signInWithGithub, signInWithTwitter } = useAuth();
  const [activeProvider, setActiveProvider] = useState(null);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const errorFromQuery = searchParams.get('error_description') || searchParams.get('error');
  const authErrorMessage = error || errorFromQuery;

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const handleOAuth = async (provider, fn) => {
    try {
      setError('');
      setActiveProvider(provider);
      const { error: oauthError } = await fn();
      if (oauthError) throw oauthError;
    } catch (_error) {
      const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
      setError(`${providerName} authentication failed. Please check provider setup and try again.`);
      setActiveProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F0EEF8] flex items-center justify-center px-6">
      <div className="grain-overlay-fixed" />
      <div className="w-full max-w-[420px] relative z-10">
        <Link to="/" className="block mb-8 text-center text-[18px] tracking-[0.35em]" style={{ fontFamily: "'Playfair Display', serif" }}>
          ALTER
        </Link>
        <p className="reveal-up text-center text-[9px] tracking-[0.5em] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace", animationDelay: '150ms' }}>
          YOUR AI CLONE AWAITS
        </p>
        <h1 className="reveal-up mt-3 text-center text-[40px] italic font-light" style={{ fontFamily: "'Playfair Display', serif", animationDelay: '280ms' }}>
          Welcome to Alter.
        </h1>
        <p className="reveal-up mt-4 text-center text-[12px] text-white/45 leading-[1.9]" style={{ fontFamily: "'DM Mono', monospace", animationDelay: '380ms' }}>
          Sign in to start building your AI clone. Free forever. Ready in 10 minutes.
        </p>

        <div className="reveal-up mt-8 flex items-center gap-3 text-white/20 text-[9px]" style={{ fontFamily: "'DM Mono', monospace", animationDelay: '460ms' }}>
          <div className="flex-1 h-px bg-white/10" />
          <span>continue with</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="mt-5 space-y-3">
          <div className="reveal-up" style={{ animationDelay: '520ms' }}>
            <OAuthButton
              provider="google"
              label="Continue with Google"
              loading={activeProvider === 'google'}
              disabled={!!activeProvider && activeProvider !== 'google'}
              onClick={() => handleOAuth('google', signInWithGoogle)}
            />
          </div>
          <div className="reveal-up" style={{ animationDelay: '580ms' }}>
            <OAuthButton
              provider="github"
              label="Continue with GitHub"
              loading={activeProvider === 'github'}
              disabled={!!activeProvider && activeProvider !== 'github'}
              onClick={() => handleOAuth('github', signInWithGithub)}
            />
          </div>
          <div className="reveal-up" style={{ animationDelay: '640ms' }}>
            <OAuthButton
              provider="twitter"
              label="Continue with X (Twitter)"
              loading={activeProvider === 'twitter'}
              disabled={!!activeProvider && activeProvider !== 'twitter'}
              onClick={() => handleOAuth('twitter', signInWithTwitter)}
            />
          </div>
        </div>

        {authErrorMessage && (
          <p className="mt-3 text-[11px] text-red-500" style={{ fontFamily: "'DM Mono', monospace" }}>
            {authErrorMessage}
          </p>
        )}

        <p className="reveal-up mt-8 text-center text-[10px] text-white/20" style={{ fontFamily: "'DM Mono', monospace", animationDelay: '740ms' }}>
          By continuing you agree to our{' '}
          <Link to="/legal/terms" className="text-[rgba(0,212,255,0.7)] hover:text-[rgba(0,212,255,1)]">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/legal/privacy" className="text-[rgba(0,212,255,0.7)] hover:text-[rgba(0,212,255,1)]">
            Privacy Policy
          </Link>.
        </p>
      </div>
      <div className="absolute right-10 bottom-10 w-64 h-64 rounded-full bg-[rgba(0,212,255,0.88)] opacity-10 blur-[120px]" />
    </div>
  );
};

export default Auth;
