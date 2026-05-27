import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Copy, ExternalLink, Mic2, RotateCcw, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { voiceApi } from '../api/voiceApi.js';
import PersonalityHeader from '../components/chat/PersonalityHeader';
import MessageBubble from '../components/chat/MessageBubble';
import StarterQuestions from '../components/chat/StarterQuestions';
import ChatInput from '../components/chat/ChatInput';
import RateLimitBanner from '../components/chat/RateLimitBanner';
import ErrorPage from './ErrorPage';

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (name[0] || 'A').toUpperCase();
};

const getVoicePrefKey = (slug) => `alter_voice_on_${slug}`;

const ChatPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get('embed') === 'true';
  const isWidget = searchParams.get('widget') === 'true';
  const embedTheme = searchParams.get('theme') === 'light' ? 'light' : 'dark';
  const [voiceOn, setVoiceOn] = useState(() => localStorage.getItem(getVoicePrefKey(slug)) === 'true');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const isPlayingRef = useRef(false);
  const personalityRef = useRef(null);
  const voiceOnRef = useRef(voiceOn);

  useEffect(() => {
    personalityRef.current = null;
  }, [slug]);

  useEffect(() => {
    voiceOnRef.current = voiceOn;
  }, [voiceOn]);

  const playVoiceResponse = useCallback(async (text, personality) => {
    if (!voiceOnRef.current || !personality?.voice_enabled) return;
    if (isPlayingRef.current) return;
    if (!text || text.length > 500) return;

    isPlayingRef.current = true;
    setIsPlayingAudio(true);

    try {
      const blob = await voiceApi.speak(text, personality.id);
      if (!blob) {
        isPlayingRef.current = false;
        setIsPlayingAudio(false);
        return;
      }

      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        isPlayingRef.current = false;
        setIsPlayingAudio(false);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        isPlayingRef.current = false;
        setIsPlayingAudio(false);
      };

      await audio.play();
    } catch {
      isPlayingRef.current = false;
      setIsPlayingAudio(false);
    }
  }, []);

  const onAssistantDone = useCallback((text) => {
    const current = personalityRef.current;
    if (current?.voice_enabled) {
      playVoiceResponse(text, current);
    }
  }, [playVoiceResponse]);

  const {
    personality,
    loading,
    notFound,
    chatErrorCode,
    chatErrorMessage,
    messages,
    input,
    setInput,
    isStreaming,
    hasStarted,
    rateLimitInfo,
    remainingMessages,
    messagesEndRef,
    sendMessage,
    clearChat
  } = useChat(slug, { onAssistantDone });

  useEffect(() => {
    personalityRef.current = personality;
  }, [personality]);

  useEffect(() => {
    if (!slug) return;
    setVoiceOn(localStorage.getItem(getVoicePrefKey(slug)) === 'true');
  }, [slug]);

  const handleVoiceToggle = (next) => {
    setVoiceOn(next);
    if (slug) {
      localStorage.setItem(getVoicePrefKey(slug), String(next));
    }
  };

  useEffect(() => {
    if (!personality) return;
    document.title = `Chat with ${personality.name} AI | Alter AI`;

    const setMeta = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('og:title', `Chat with ${personality.name} AI`);
    setMeta('og:description', personality.bio || 'Ask me anything, 24/7.');
    setMeta('og:url', window.location.href);
  }, [personality]);

  const copyCurrentLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard support can be blocked in some embedded browsers.
    }
  };

  if (notFound) {
    const errorType = chatErrorCode === 'CLONE_NOT_LIVE'
      ? 'clone-not-live'
      : chatErrorCode === 'SERVER_UNAVAILABLE'
        ? 'server-unavailable'
        : 'not-found';
    return <ErrorPage type={errorType} message={chatErrorMessage} />;
  }

  const isHardLimit = rateLimitInfo != null || remainingMessages === 0;
  const avatarColor = personality?.avatar_color || '#8B5CF6';
  const ownerAvatar = personality?.owner_avatar || '';
  const topics = Array.isArray(personality?.topics) ? personality.topics.slice(0, 4) : [];
  const visibleMessages = messages.filter((m) => !m.isWelcome || !hasStarted);

  return (
    <div
      className={`chat-experience${isEmbed ? ' is-embed' : ''}${isWidget ? ' is-widget' : ''}${embedTheme === 'light' ? ' is-light' : ''}`}
    >
      {!isEmbed && (
        <header className="chat-brand-bar">
          <Link to="/" className="chat-logo">ALTER</Link>
          <div className="chat-bar-actions">
            <button type="button" onClick={clearChat} className="clear-chat-button" aria-label="Clear chat and start fresh">
              <RotateCcw className="h-4 w-4" />
              <span>Clear</span>
            </button>
            <button type="button" onClick={copyCurrentLink} className="icon-action" aria-label="Copy chat link">
              <Copy className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleVoiceToggle(!voiceOn)}
              className="icon-action"
              aria-label={voiceOn ? 'Mute voice responses' : 'Enable voice responses'}
              disabled={!personality?.voice_enabled}
              title={personality?.voice_enabled ? (voiceOn ? 'Voice on' : 'Voice off') : 'Voice not enabled for this clone'}
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => navigate('/auth')} className="create-link">
              Create your own
            </button>
          </div>
        </header>
      )}

      <main className="chat-stage">
        {!isEmbed && (
        <aside className="persona-rail">
          <div className="persona-mark" style={{ background: avatarColor, boxShadow: `0 0 34px ${avatarColor}66` }}>
            {ownerAvatar ? <img src={ownerAvatar} alt="" /> : getInitials(personality?.name)}
          </div>
          <p className="persona-kicker">Live personality</p>
          <h1>{personality?.name || 'AI Clone'}</h1>
          <p className="persona-bio">
            {personality?.bio || 'Ask questions, explore their work, and get answers in their style.'}
          </p>

          <div className="persona-actions">
            <button
              type="button"
              disabled={!personality?.voice_enabled}
              onClick={() => personality?.voice_enabled && handleVoiceToggle(!voiceOn)}
              title={personality?.voice_enabled ? (voiceOn ? 'Voice on' : 'Voice off') : 'Voice not enabled'}
            >
              <Mic2 className="h-4 w-4" />
              {personality?.voice_enabled ? (voiceOn ? 'Voice on' : 'Voice off') : 'Voice off'}
            </button>
            <a href={window.location.href} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open
            </a>
          </div>

          <div className="persona-proof">
            <div>
              <ShieldCheck className="h-4 w-4" />
              <span>Creator-trained knowledge</span>
            </div>
            <div>
              <Sparkles className="h-4 w-4" />
              <span>Real-time streamed replies</span>
            </div>
          </div>

          {topics.length > 0 && (
            <div className="topic-stack">
              {topics.map((topic) => (
                <span key={topic}>{topic}</span>
              ))}
            </div>
          )}
        </aside>
        )}

        <section className="conversation-shell">
          <div className="conversation-top">
            {loading ? (
              <div className="profile-loading">
                <div />
                <span />
              </div>
            ) : (
              <PersonalityHeader
                personality={personality}
                voiceOn={voiceOn}
                onVoiceToggle={handleVoiceToggle}
              />
            )}
          </div>

          <div className="message-scroll">
            <div className="message-column">
              {!loading && !hasStarted && (
                <div className="conversation-intro">
                  <p className="intro-label">Start a private session</p>
                  <h2>Ask {personality?.name || 'this clone'} like they are already in the room.</h2>
                  <p>
                    The reply is grounded in creator training data when available, then shaped by tone,
                    topics, and conversation memory for this session.
                  </p>
                </div>
              )}

              {visibleMessages.map((m) => (
                <MessageBubble key={m.id} message={m} personality={personality} />
              ))}

              {isPlayingAudio && (
                <div className="flex items-center gap-2 mt-2 ml-10">
                  <div className="flex gap-1 items-end">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 bg-[rgba(0,212,255,0.6)] rounded-full voice-speaking-bar"
                        style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'rgba(0,212,255,0.5)' }}>
                    Speaking...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {!loading && !hasStarted && !isHardLimit && (
            <StarterQuestions topics={personality?.topics} onSelect={(q) => sendMessage(q)} />
          )}

          {!isHardLimit && remainingMessages != null && remainingMessages <= 3 && remainingMessages > 0 && (
            <RateLimitBanner remainingMessages={remainingMessages} />
          )}

          {isHardLimit ? (
            <RateLimitBanner rateLimitInfo={rateLimitInfo} remainingMessages={remainingMessages} />
          ) : (
            <ChatInput
              input={input}
              setInput={setInput}
              onSend={() => sendMessage()}
              isStreaming={isStreaming}
              personalityName={personality?.name}
              remainingMessages={remainingMessages}
              disabled={loading || notFound}
            />
          )}
        </section>
      </main>

      <style>{`
        .chat-experience {
          min-height: 100dvh;
          height: 100dvh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background:
            linear-gradient(145deg, rgba(8,8,10,0.96), rgba(5,5,6,1) 46%, rgba(12,8,18,0.98)),
            #070708;
          color: #f7f3ff;
        }
        .chat-experience::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.65), transparent 72%);
        }
        .chat-brand-bar {
          height: 68px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(7,7,8,0.82);
          backdrop-filter: blur(18px);
          position: relative;
          z-index: 4;
        }
        .chat-logo {
          color: #fff;
          text-decoration: none;
          font: italic 18px 'Playfair Display', serif;
          letter-spacing: 0.34em;
        }
        .chat-bar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .chat-bar-actions button {
          height: 38px;
          min-width: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.045);
          color: rgba(255,255,255,0.72);
          cursor: pointer;
        }
        .chat-bar-actions button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }
        .chat-bar-actions .create-link {
          min-width: 0;
          padding: 0 16px;
          border-color: rgba(0,212,255,0.34);
          background: rgba(0,212,255,0.1);
          color: rgba(0,212,255,0.94);
          font: 11px 'DM Mono', monospace;
        }
        .chat-bar-actions .clear-chat-button {
          min-width: 0;
          padding: 0 13px;
          border-color: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.76);
          font: 11px 'DM Mono', monospace;
        }
        .chat-bar-actions .clear-chat-button:hover {
          border-color: rgba(0,212,255,0.34);
          background: rgba(0,212,255,0.08);
          color: rgba(0,212,255,0.92);
        }
        .chat-stage {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: minmax(280px, 380px) minmax(0, 780px);
          justify-content: center;
          gap: 20px;
          padding: 20px;
          position: relative;
          z-index: 1;
        }
        .persona-rail,
        .conversation-shell {
          min-height: 0;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(13,13,14,0.78);
          backdrop-filter: blur(20px);
          box-shadow: 0 24px 80px rgba(0,0,0,0.36);
        }
        .persona-rail {
          border-radius: 26px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .persona-mark {
          width: 88px;
          height: 88px;
          border-radius: 28px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font: italic 34px 'Playfair Display', serif;
          border: 1px solid rgba(255,255,255,0.18);
        }
        .persona-mark img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .persona-kicker,
        .intro-label {
          margin: 24px 0 0;
          color: rgba(0,212,255,0.84);
          font: 10px 'DM Mono', monospace;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .persona-rail h1 {
          margin: 10px 0 0;
          max-width: 280px;
          color: #fff;
          font: italic 42px/0.98 'Playfair Display', serif;
          letter-spacing: 0;
        }
        .persona-bio {
          margin: 18px 0 0;
          max-width: 300px;
          color: rgba(255,255,255,0.56);
          font: 14px/1.7 Inter, system-ui, sans-serif;
        }
        .persona-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 28px;
        }
        .persona-actions button,
        .persona-actions a {
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.045);
          color: rgba(255,255,255,0.72);
          text-decoration: none;
          font: 11px 'DM Mono', monospace;
        }
        .persona-actions button:not(:disabled) {
          cursor: pointer;
          opacity: 1;
        }
        .persona-actions button:disabled {
          cursor: not-allowed;
          opacity: 0.58;
        }
        .voice-speaking-bar {
          animation: voiceBarPulse 0.8s ease-in-out infinite;
        }
        @keyframes voiceBarPulse {
          0%, 100% { transform: scaleY(0.6); opacity: 0.6; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        .persona-proof {
          display: grid;
          gap: 10px;
          margin-top: 24px;
          padding-top: 22px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .persona-proof div {
          display: flex;
          align-items: center;
          gap: 9px;
          color: rgba(255,255,255,0.48);
          font: 12px Inter, system-ui, sans-serif;
        }
        .persona-proof svg {
          color: rgba(0,212,255,0.72);
        }
        .topic-stack {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 24px;
        }
        .topic-stack span {
          max-width: 100%;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.04);
          padding: 7px 10px;
          color: rgba(255,255,255,0.52);
          font: 10px 'DM Mono', monospace;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .conversation-shell {
          border-radius: 26px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .conversation-top {
          flex-shrink: 0;
          background: rgba(10,10,11,0.72);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .profile-loading {
          height: 82px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 24px;
        }
        .profile-loading div {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
        }
        .profile-loading span {
          width: 160px;
          height: 18px;
          border-radius: 99px;
          background: rgba(255,255,255,0.06);
        }
        .message-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 26px 24px 18px;
        }
        .message-column {
          max-width: 680px;
          min-height: 100%;
          margin: 0 auto;
        }
        .conversation-intro {
          max-width: 560px;
          margin: 10px auto 24px;
          padding-bottom: 8px;
          text-align: center;
        }
        .conversation-intro h2 {
          margin: 10px 0 0;
          color: #fff;
          font: italic 32px/1.12 'Playfair Display', serif;
          letter-spacing: 0;
        }
        .conversation-intro p:last-child {
          margin: 14px auto 0;
          max-width: 500px;
          color: rgba(255,255,255,0.48);
          font: 14px/1.7 Inter, system-ui, sans-serif;
        }
        .chat-experience.is-embed {
          min-height: 100%;
          height: 100%;
        }
        .chat-experience.is-embed::before {
          display: none;
        }
        .chat-experience.is-embed .chat-stage {
          grid-template-columns: minmax(0, 1fr);
          padding: 0;
          gap: 0;
        }
        .chat-experience.is-embed .conversation-shell {
          border: 0;
          border-radius: 0;
          box-shadow: none;
          background: #080808;
        }
        .chat-experience.is-widget .conversation-top {
          padding-top: 8px;
        }
        .chat-experience.is-widget .message-scroll {
          padding-top: 12px;
        }
        .chat-experience.is-light {
          background: #f7f5ff;
          color: #0f172a;
        }
        .chat-experience.is-light .conversation-shell {
          background: #fff;
        }
        @media (max-width: 980px) {
          .chat-stage {
            grid-template-columns: minmax(0, 760px);
            padding: 12px;
          }
          .persona-rail {
            display: none;
          }
          .conversation-shell {
            border-radius: 20px;
          }
        }
        @media (max-width: 640px) {
          .chat-brand-bar {
            height: 60px;
            padding: 0 16px;
          }
          .chat-logo {
            font-size: 15px;
            letter-spacing: 0.28em;
          }
          .chat-bar-actions .icon-action {
            display: none;
          }
          .chat-bar-actions .clear-chat-button {
            height: 34px;
            padding: 0 10px;
            font-size: 10px;
          }
          .chat-bar-actions .create-link {
            height: 34px;
            padding: 0 12px;
            font-size: 10px;
          }
          .chat-stage {
            padding: 0;
          }
          .conversation-shell {
            border-width: 0;
            border-radius: 0;
          }
          .message-scroll {
            padding: 18px 14px 14px;
          }
          .conversation-intro {
            margin-top: 2px;
          }
          .conversation-intro h2 {
            font-size: 25px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
