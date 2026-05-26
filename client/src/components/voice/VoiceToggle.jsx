import React from 'react';

const VoiceToggle = ({ enabled, onChange, disabled = false, size = 'md' }) => {
  const isLarge = size === 'lg';
  const width = isLarge ? 52 : 44;
  const height = isLarge ? 28 : 24;
  const thumb = isLarge ? 20 : 16;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      style={{
        width,
        height,
        borderRadius: 999,
        border: 'none',
        padding: 0,
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: enabled ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.08)',
        transition: 'background 250ms ease',
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: enabled ? `calc(100% - ${thumb + 4}px)` : '4px',
          width: thumb,
          height: thumb,
          borderRadius: '50%',
          background: enabled ? 'rgba(0,212,255,0.88)' : '#fff',
          transform: 'translateY(-50%)',
          transition: 'left 250ms ease, background 250ms ease'
        }}
      />
    </button>
  );
};

export default VoiceToggle;
