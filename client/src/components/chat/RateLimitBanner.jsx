import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RateLimitBanner = ({ remainingMessages, rateLimitInfo }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });

  const resetAt = rateLimitInfo?.resetAt;
  const limit = rateLimitInfo?.limit || 20;
  const period = rateLimitInfo?.period === 'month' ? 'month' : 'day';
  const title = period === 'month' ? 'This creator has reached the monthly limit' : "You've reached today's limit";
  const body = period === 'month'
    ? `This clone owner has used ${limit.toLocaleString()} creator messages this month. Please try again when their plan resets.`
    : `This clone allows ${limit} messages per day. Come back tomorrow to continue chatting.`;
  const isHardLimit = rateLimitInfo != null || remainingMessages === 0;
  const isWarning = !isHardLimit && remainingMessages != null && remainingMessages <= 3 && remainingMessages > 0;

  useEffect(() => {
    if (!isHardLimit || !resetAt) return;

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
  }, [isHardLimit, resetAt]);

  if (isHardLimit) {
    return (
      <div style={{
        background: 'rgba(239,68,68,0.06)',
        borderTop: '1px solid rgba(239,68,68,0.2)',
        padding: '24px 20px',
        textAlign: 'center',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        flexShrink: 0
      }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          fontSize: 18,
          color: '#fff'
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 13,
          color: 'rgba(255,255,255,0.4)',
          marginTop: 8,
          maxWidth: 420,
          margin: '8px auto 0',
          lineHeight: 1.5
        }}>
          {body}
        </div>
        {resetAt && (
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: 'rgba(0,212,255,0.88)',
            marginTop: 10
          }}>
            Resets in: {timeLeft.hours}h {timeLeft.minutes}m
          </div>
        )}

        <div style={{
          height: 1,
          background: 'rgba(255,255,255,0.06)',
          maxWidth: 300,
          margin: '20px auto 16px'
        }} />

        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          color: 'rgba(255,255,255,0.3)',
          marginBottom: 10
        }}>
          Want unlimited conversations?
        </div>
        <button
          type="button"
          onClick={() => navigate('/auth')}
          style={{
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.3)',
            borderRadius: 999,
            padding: '8px 20px',
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: 'rgba(0,212,255,0.88)',
            cursor: 'pointer',
            transition: 'all 200ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,212,255,0.2)';
            e.currentTarget.style.borderColor = 'rgba(0,212,255,0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,212,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)';
          }}
        >
          Create your own AI clone →
        </button>
      </div>
    );
  }

  if (isWarning) {
    return (
      <div style={{
        background: 'rgba(245,158,11,0.08)',
        borderTop: '1px solid rgba(245,158,11,0.2)',
        padding: '8px 20px',
        textAlign: 'center',
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        color: '#F59E0B',
        flexShrink: 0
      }}>
        {remainingMessages} message{remainingMessages > 1 ? 's' : ''} remaining today
      </div>
    );
  }

  return null;
};

export default RateLimitBanner;
