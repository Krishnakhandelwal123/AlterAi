import React from 'react';

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name[0] || 'A').toUpperCase();
};

const PersonalityHeader = ({ personality, voiceOn, onVoiceToggle }) => {
  if (!personality) return null;

  const {
    name = '',
    bio = '',
    avatar_color: avatarColor = '#00D4FF',
    owner_avatar: ownerAvatar = '',
    total_messages: totalMessages = 0,
    voice_enabled: voiceEnabled = false
  } = personality;

  const glowColor = avatarColor.startsWith('#') && avatarColor.length === 7 ? `${avatarColor}80` : 'rgba(0,212,255,0.5)';

  return (
    <div
      className="personality-header-container"
      style={{
        background: 'transparent',
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
        opacity: 0,
        transform: 'translateY(12px)',
        animation: 'fade-up-header 700ms cubic-bezier(0.16, 1, 0.3, 1) 200ms forwards',
        flexShrink: 0
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          className="header-avatar"
          style={{
            borderRadius: '50%',
            background: avatarColor,
            border: '1.5px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: 20,
            color: '#fff',
            boxShadow: `0 0 16px ${glowColor}`,
            position: 'relative',
            zIndex: 1,
            transition: 'all 300ms ease'
          }}
        >
          {ownerAvatar ? <img src={ownerAvatar} alt="" className="header-avatar-img" /> : getInitials(name)}
        </div>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#059669',
            border: '2px solid #080808',
            position: 'absolute',
            bottom: 0,
            right: 0,
            zIndex: 2
          }}
        />
      </div>

      <div style={{ marginLeft: 12, textAlign: 'left', minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 18,
              color: '#F0EEF8',
              lineHeight: 1
            }}
          >
            {name}
          </span>
        </div>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 8,
            color: 'rgba(240,238,248,0.25)',
            letterSpacing: '0.08em',
            marginTop: 3
          }}
        >
          AI Clone - Alter AI
        </div>
        {bio && (
          <div
            className="header-bio"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 12,
              color: 'rgba(240,238,248,0.35)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 320,
              marginTop: 4
            }}
            title={bio}
          >
            {bio}
          </div>
        )}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {voiceEnabled && (
          <button
            type="button"
            onClick={() => onVoiceToggle?.(!voiceOn)}
            title={voiceOn ? 'Voice on — click to mute' : 'Voice off — click to enable'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-xs transition-all duration-200 ${
              voiceOn
                ? 'bg-[rgba(0,212,255,0.08)] border-[rgba(0,212,255,0.25)] text-[rgba(0,212,255,0.88)]'
                : 'bg-transparent border-white/10 text-white/30'
            }`}
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: 'pointer' }}
          >
            <span>{voiceOn ? '🔊' : '🔇'}</span>
            <span>{voiceOn ? 'Voice On' : 'Voice Off'}</span>
          </button>
        )}
        <div
          className="header-stats-pill"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 999,
            padding: '4px 12px',
            fontFamily: "'DM Mono', monospace",
            fontSize: 8,
            color: 'rgba(240,238,248,0.3)',
            whiteSpace: 'nowrap'
          }}
        >
          {totalMessages.toLocaleString()} chats
        </div>
      </div>

      <style>{`
        @keyframes fade-up-header {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .header-avatar {
          width: 44px;
          height: 44px;
          overflow: hidden;
        }
        .header-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          display: block;
        }
        @media (max-width: 768px) {
          .header-stats-pill {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .header-avatar {
            width: 36px !important;
            height: 36px !important;
            font-size: 16px !important;
          }
          .header-bio {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PersonalityHeader;
