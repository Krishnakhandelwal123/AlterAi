import React from 'react';

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name[0] || 'A').toUpperCase();
};

const TypingIndicator = ({ personality }) => {
  const avatarColor = personality?.avatar_color || '#00D4FF';
  const name = personality?.name || 'AI';

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        marginBottom: 16,
        animation: 'fade-in-typing 200ms ease-out forwards'
      }}
    >
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

      {/* Bubble with dots */}
      <div
        style={{
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '2px 14px 14px 14px',
          padding: '14px 18px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="typing-dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'rgba(0,212,255,0.5)',
              animation: `dotBounce 1s infinite ease-in-out`,
              animationDelay: `${i * 160}ms`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fade-in-typing {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { 
            transform: translateY(0);
            opacity: 0.4;
          }
          40% { 
            transform: translateY(-6px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
