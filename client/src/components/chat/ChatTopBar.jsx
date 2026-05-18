import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ChatTopBar = ({ personalityName }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: 56,
        background: 'rgba(8,8,8,0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        animation: 'fade-down-nav 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      {/* Left Logo */}
      <Link
        to="/"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          fontSize: 15,
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: '0.35em',
          textDecoration: 'none',
          transition: 'color 200ms'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
      >
        ALTER ·
      </Link>

      {/* Center Talking To */}
      {personalityName && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.08em',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          TALKING TO {personalityName.toUpperCase()}
        </div>
      )}

      {/* Right Action Button */}
      <button
        type="button"
        onClick={() => navigate('/auth')}
        style={{
          height: 32,
          padding: '0 14px',
          background: 'rgba(0,212,255,0.08)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 999,
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          color: 'rgba(0,212,255,0.88)',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          transition: 'all 200ms ease',
          display: 'flex',
          alignItems: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0,212,255,0.14)';
          e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,212,255,0.08)';
          e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)';
        }}
      >
        Create Your Own →
      </button>

      <style>{`
        @keyframes fade-down-nav {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatTopBar;
