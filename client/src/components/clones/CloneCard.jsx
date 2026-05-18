import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name[0] || 'A').toUpperCase();
};

const StatusPill = ({ status }) => {
  const configs = {
    live: {
      dot: '#22c55e',
      label: 'LIVE',
      bg: 'rgba(34,197,94,0.12)',
      border: 'rgba(34,197,94,0.3)',
      color: '#22c55e'
    },
    draft: {
      dot: 'rgba(255,255,255,0.3)',
      label: 'DRAFT',
      bg: 'rgba(255,255,255,0.06)',
      border: 'rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.4)'
    },
    training: {
      dot: 'rgba(0,212,255,0.88)',
      label: 'TRAINING',
      bg: 'rgba(0,212,255,0.08)',
      border: 'rgba(0,212,255,0.3)',
      color: 'rgba(0,212,255,0.88)'
    }
  };
  const cfg = configs[status] || configs.draft;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 999,
        padding: '4px 10px',
        fontFamily: "'DM Mono', monospace",
        fontSize: 8,
        color: cfg.color,
        letterSpacing: '0.1em'
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: cfg.dot,
          flexShrink: 0,
          animation: status === 'training' ? 'status-pulse 1.4s ease-in-out infinite' : 'none'
        }}
      />
      {cfg.label}
    </div>
  );
};

const CloneCard = ({ clone, onDelete, onPublish, onEdit, onShare }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publishFlash, setPublishFlash] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const menuRef = useRef(null);

  const {
    id,
    name,
    slug,
    bio,
    tone,
    topics = [],
    avatar_color: avatarColor = '#00D4FF',
    status = 'draft',
    total_messages: totalMessages = 0,
    total_visitors: totalVisitors = 0,
    trainingStats = {}
  } = clone;

  const {
    strengthPercent = 0,
    totalSources = 0
  } = trainingStats;

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`alter.ai/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
    setMenuOpen(false);
  };

  const handlePublishToggle = async () => {
    setMenuOpen(false);
    setPublishing(true);
    setPublishError('');
    const nextPublish = status !== 'live';
    const result = await onPublish(id, nextPublish);
    setPublishing(false);
    if (result?.success && nextPublish) {
      setPublishFlash(true);
      setTimeout(() => setPublishFlash(false), 1000);
    } else if (!result?.success) {
      if (result?.code === 'NO_TRAINING_DATA' || result?.error?.includes('training data')) {
        setPublishError('Add training data first to go live.');
        setTimeout(() => navigate(`/dashboard/training?cloneId=${id}`), 1500);
      } else {
        setPublishError(result?.error || 'Failed to publish.');
        setTimeout(() => setPublishError(''), 4000);
      }
    }
  };

  const strengthColor =
    strengthPercent < 30 ? '#F59E0B' : strengthPercent < 70 ? 'rgba(0,212,255,0.88)' : '#059669';

  const strengthLabel =
    strengthPercent < 30
      ? 'Needs more training data'
      : strengthPercent < 70
      ? 'Good — keep adding data'
      : 'Well trained ✓';

  const visibleTopics = topics.slice(0, 3);
  const extraTopics = topics.length - 3;
  const isDraft = status === 'draft';
  const hasNoTraining = totalSources === 0;

  return (
    <>
      <div
        style={{
          background: '#0D0D0D',
          border: `1px solid ${publishFlash ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 16,
          padding: 24,
          transition: 'border-color 300ms, box-shadow 300ms',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = publishFlash
            ? 'rgba(34,197,94,0.5)'
            : 'rgba(255,255,255,0.14)';
          e.currentTarget.style.boxShadow = '0 0 30px rgba(0,212,255,0.04)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = publishFlash
            ? 'rgba(34,197,94,0.5)'
            : 'rgba(255,255,255,0.07)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* ── TOP ROW ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          {/* Avatar + Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: avatarColor,
                border: '1.5px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic',
                fontSize: 20,
                color: '#fff',
                flexShrink: 0
              }}
            >
              {getInitials(name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: 'italic',
                  fontSize: 18,
                  color: '#fff',
                  fontWeight: 300,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {name}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  color: 'rgba(0,212,255,0.88)',
                  marginTop: 2
                }}
              >
                alter.ai/{slug}
              </div>
            </div>
          </div>

          {/* Status + Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <StatusPill status={status} />

            {/* 3-dot menu */}
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: 6,
                  fontSize: 16,
                  lineHeight: 1,
                  transition: 'color 150ms'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                aria-label="Clone options"
              >
                ···
              </button>

              {menuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 4px)',
                    background: '#111111',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    padding: 8,
                    zIndex: 50,
                    minWidth: 160,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
                  }}
                >
                  {[
                    {
                      icon: '✏️',
                      label: 'Edit Clone',
                      onClick: () => { setMenuOpen(false); onEdit?.(id); }
                    },
                    {
                      icon: '🔗',
                      label: 'Copy Link',
                      onClick: handleCopy
                    },
                    {
                      icon: '📤',
                      label: 'Share',
                      onClick: () => { setMenuOpen(false); onShare?.(clone); }
                    },
                    {
                      icon: status === 'live' ? '📴' : '🚀',
                      label: status === 'live' ? 'Unpublish' : 'Publish',
                      onClick: handlePublishToggle,
                      disabled: publishing
                    },
                    {
                      icon: '🗑',
                      label: 'Delete',
                      onClick: () => { setMenuOpen(false); onDelete?.(id); },
                      danger: true
                    }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      disabled={item.disabled}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 7,
                        padding: '7px 10px',
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11,
                        color: item.danger ? '#EF4444' : 'rgba(255,255,255,0.7)',
                        cursor: item.disabled ? 'not-allowed' : 'pointer',
                        opacity: item.disabled ? 0.5 : 1,
                        textAlign: 'left',
                        transition: 'background 150ms'
                      }}
                      onMouseEnter={(e) => {
                        if (!item.disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '16px 0' }} />

        {/* ── STATS ROW ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { value: totalMessages, label: 'MESSAGES' },
            { value: totalVisitors, label: 'VISITORS' },
            { value: totalSources, label: 'SOURCES' }
          ].map(({ value: val, label }) => (
            <div
              key={label}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 10,
                padding: '10px 12px',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 18,
                  color: '#fff',
                  lineHeight: 1.2
                }}
              >
                {val}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.25)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginTop: 2
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── TRAINING STRENGTH BAR ── */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 8,
                color: 'rgba(255,255,255,0.2)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              PERSONALITY STRENGTH
            </span>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 8,
                color: 'rgba(0,212,255,0.88)'
              }}
            >
              {strengthPercent}%
            </span>
          </div>

          <div
            style={{
              height: 4,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${strengthPercent}%`,
                borderRadius: 999,
                background: 'linear-gradient(90deg, rgba(0,212,255,0.88), #7C3AED)',
                transition: 'width 1s ease'
              }}
            />
          </div>

          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              color: strengthColor,
              marginTop: 5
            }}
          >
            {strengthLabel}
          </div>
        </div>

        {/* ── TOPICS ROW ── */}
        {topics.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 14 }}>
            {visibleTopics.map((topic) => (
              <span
                key={topic}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 999,
                  padding: '3px 10px',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.5)'
                }}
              >
                {topic}
              </span>
            ))}
            {extraTopics > 0 && (
              <span
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 999,
                  padding: '3px 10px',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.3)'
                }}
              >
                +{extraTopics} more
              </span>
            )}
          </div>
        )}

        {/* ── GO LIVE BUTTON (for draft clones with training data) ── */}
        {isDraft && !hasNoTraining && (
          <button
            type="button"
            onClick={handlePublishToggle}
            disabled={publishing}
            style={{
              width: '100%',
              height: 40,
              marginTop: 14,
              background: publishing ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.35)',
              borderRadius: 10,
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: '#22c55e',
              cursor: publishing ? 'not-allowed' : 'pointer',
              opacity: publishing ? 0.7 : 1,
              letterSpacing: '0.05em',
              transition: 'all 200ms',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
            onMouseEnter={(e) => {
              if (!publishing) {
                e.currentTarget.style.background = 'rgba(34,197,94,0.18)';
                e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = publishing ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.1)';
              e.currentTarget.style.borderColor = 'rgba(34,197,94,0.35)';
            }}
          >
            {publishing ? '⏳ Publishing...' : '🚀 Go Live'}
          </button>
        )}

        {/* ── PUBLISH ERROR ── */}
        {publishError && (
          <div
            style={{
              background: 'rgba(239,68,68,0.04)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 8,
              padding: '8px 12px',
              marginTop: 10,
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              color: '#EF4444',
              animation: 'card-appear 300ms ease'
            }}
          >
            {publishError}
          </div>
        )}

        {/* ── DIVIDER ── */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '14px 0' }} />

        {/* ── ACTION BUTTONS ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            {
              label: 'Preview Chat',
              onClick: () => window.open(`/chat/${slug}`, '_blank')
            },
            {
              label: copied ? 'Copied! ✓' : 'Copy Link',
              onClick: handleCopy,
              green: copied
            },
            {
              label: '📤 Share',
              onClick: () => onShare?.(clone)
            },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={btn.onClick}
              style={{
                flex: 1,
                height: 34,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: btn.green ? '#059669' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 200ms',
                padding: '0 14px',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!btn.green) {
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)';
                  e.currentTarget.style.color = 'rgba(0,212,255,0.88)';
                }
              }}
              onMouseLeave={(e) => {
                if (!btn.green) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                }
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* ── EMPTY DRAFT NOTICE ── */}
        {isDraft && hasNoTraining && (
          <div
            style={{
              background: 'rgba(245,158,11,0.04)',
              border: '1px solid rgba(245,158,11,0.12)',
              borderRadius: 8,
              padding: '10px 14px',
              marginTop: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#F59E0B' }}>
              ⚠ No training data yet.{' '}
              <span
                onClick={() => navigate(`/dashboard/training?cloneId=${id}`)}
                style={{ textDecoration: 'underline', cursor: 'pointer' }}
              >
                Add data to train your clone →
              </span>
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes status-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </>
  );
};

export default CloneCard;
