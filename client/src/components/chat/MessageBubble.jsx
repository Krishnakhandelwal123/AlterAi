import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const TypewriterText = ({ text }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayed}</span>;
};

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name[0] || 'A').toUpperCase();
};

const formatTime = (ts) => {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const MessageBubble = ({ message, personality, onRetry, typewriter }) => {
  const [showTime, setShowTime] = useState(false);
  const isUser = message.role === 'user';
  const isError = message.isError;
  const isStreaming = message.isStreaming;

  const avatarColor = personality?.avatar_color || '#00D4FF';
  const name = personality?.name || 'AI';

  if (isUser) {
    return (
      <div
        className="message-group user"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          marginBottom: 16,
          animation: 'slide-right-bubble 200ms ease-out forwards'
        }}
        onMouseEnter={() => setShowTime(true)}
        onMouseLeave={() => setShowTime(false)}
      >
        <div
          className="bubble user-bubble"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.16), rgba(124,58,237,0.14))',
            border: '1px solid rgba(0,212,255,0.24)',
            borderRadius: '18px 6px 18px 18px',
            padding: '13px 16px',
            maxWidth: '72%',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 15,
            color: 'rgba(240,238,248,0.9)',
            lineHeight: 1.65,
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            boxSizing: 'border-box',
            boxShadow: '0 14px 34px rgba(0,0,0,0.22)'
          }}
        >
          {message.content}
        </div>
        {/* Timestamp */}
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 8,
            color: 'rgba(255,255,255,0.2)',
            marginTop: 4,
            opacity: showTime ? 1 : 0,
            transition: 'opacity 150ms ease',
            paddingRight: 4
          }}
        >
          {formatTime(message.timestamp)}
        </div>

        <style>{`
          @keyframes slide-right-bubble {
            from { transform: translateX(12px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @media (max-width: 768px) {
            .bubble.user-bubble {
              max-width: 88% !important;
              padding: 10px 14px !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // AI or Error bubble
  if (isError) {
    return (
      <div
        className="message-group ai error-group"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          marginBottom: 16,
          animation: 'slide-left-bubble 250ms ease-out forwards'
        }}
        onMouseEnter={() => setShowTime(true)}
        onMouseLeave={() => setShowTime(false)}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', width: '100%', maxWidth: '82%' }} className="ai-row">
          {/* Avatar */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: avatarColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: '#fff',
              flexShrink: 0,
              marginTop: 2
            }}
          >
            {getInitials(name)}
          </div>

          <div
            className="bubble ai-bubble error-bubble"
            style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: '6px 18px 18px 18px',
              padding: '12px 16px',
              flex: 1,
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            {/* Warning Icon and Message */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertCircle size={16} style={{ color: 'rgba(239,68,68,0.4)', flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.5
                }}
              >
                {message.content || "Couldn't get a response. Try again."}
              </span>
            </div>

            {/* Retry Link */}
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="retry-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: 'rgba(0,212,255,0.6)',
                  cursor: 'pointer',
                  marginTop: 6,
                  display: 'inline-block',
                  textAlign: 'left'
                }}
              >
                [ Try again ]
              </button>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 8,
            color: 'rgba(255,255,255,0.2)',
            marginTop: 4,
            paddingLeft: 38,
            opacity: showTime ? 1 : 0,
            transition: 'opacity 150ms ease'
          }}
        >
          {formatTime(message.timestamp)}
        </div>

        <style>{`
          .retry-btn:hover {
            text-decoration: underline;
          }
          @keyframes slide-left-bubble {
            from { transform: translateX(-12px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @media (max-width: 768px) {
            .ai-row {
              max-width: 88% !important;
            }
            .bubble.ai-bubble {
              padding: 10px 14px !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // Normal AI message
  return (
    <div
      className="message-group ai"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: 16,
        animation: 'slide-left-bubble 250ms ease-out forwards'
      }}
      onMouseEnter={() => setShowTime(true)}
      onMouseLeave={() => setShowTime(false)}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', width: '100%', maxWidth: '82%' }} className="ai-row">
        {/* Avatar */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: avatarColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: '#fff',
            flexShrink: 0,
            marginTop: 2,
            boxShadow: `0 0 18px ${avatarColor}55`
          }}
        >
          {getInitials(name)}
        </div>

        {/* Bubble */}
        <div
          className="bubble ai-bubble"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.038))',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '6px 18px 18px 18px',
            padding: '14px 17px',
            position: 'relative',
            flex: 1,
            boxSizing: 'border-box',
            boxShadow: '0 18px 42px rgba(0,0,0,0.22)'
          }}
        >
          {/* Accent Line */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: 2,
              height: '60%',
              background: avatarColor,
              opacity: 0.6,
              borderRadius: '0 2px 2px 0',
              top: '20%'
            }}
          />

          {/* Text */}
          <div
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 15,
              color: 'rgba(247,243,255,0.88)',
              lineHeight: 1.72,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          >
            {typewriter ? <TypewriterText text={message.content} /> : message.content}
            
            {/* Streaming Cursor */}
            {isStreaming && (
              <span
                style={{
                  display: 'inline-block',
                  color: 'rgba(0,212,255,0.88)',
                  animation: 'stream-blink 0.7s infinite',
                  marginLeft: 2,
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  verticalAlign: 'bottom'
                }}
              >
                ▋
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 8,
          color: 'rgba(255,255,255,0.2)',
          marginTop: 4,
          paddingLeft: 38,
          opacity: showTime && !isStreaming ? 1 : 0,
          transition: 'opacity 150ms ease'
        }}
      >
        {formatTime(message.timestamp)}
      </div>

      <style>{`
        @keyframes stream-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes slide-left-bubble {
          from { transform: translateX(-12px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (max-width: 768px) {
          .ai-row {
            max-width: 88% !important;
          }
          .bubble.ai-bubble {
            padding: 10px 14px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageBubble;
