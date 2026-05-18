import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const RateLimitCard = ({ rateLimitInfo }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });

  const resetAt = rateLimitInfo?.resetAt;

  useEffect(() => {
    if (!resetAt) return;

    const updateTimer = () => {
      const diff = new Date(resetAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0 });
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft({ hours, minutes });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [resetAt]);

  return (
    <div
      style={{
        maxWidth: 640,
        margin: '0 auto 16px',
        padding: '0 20px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          padding: 24,
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        {/* Lock Icon */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Lock size={28} style={{ color: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: 20,
            color: 'rgba(255,255,255,0.6)',
            marginTop: 12,
            fontWeight: 300
          }}
        >
          Daily limit reached
        </div>

        {/* Message */}
        <div
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 13,
            color: 'rgba(240,238,248,0.3)',
            marginTop: 6
          }}
        >
          Come back tomorrow to continue.
        </div>

        {/* Countdown */}
        {resetAt && (
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: 'rgba(0,212,255,0.88)',
              marginTop: 8
            }}
          >
            Resets in {timeLeft.hours}h {timeLeft.minutes}m
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: 'rgba(255,255,255,0.05)',
            margin: '16px 0'
          }}
        />

        {/* Promo Text */}
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: 'rgba(240,238,248,0.3)',
            marginBottom: 12
          }}
        >
          Create your own AI clone — free
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={() => navigate('/auth')}
          style={{
            width: '100%',
            height: 44,
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.3)',
            borderRadius: 12,
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: 'rgba(0,212,255,0.88)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,212,255,0.16)';
            e.currentTarget.style.borderColor = 'rgba(0,212,255,0.6)';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(0,212,255,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,212,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Get Started Free →
        </button>
      </div>
    </div>
  );
};

export default RateLimitCard;
