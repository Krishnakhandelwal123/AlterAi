import React from 'react';

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'witty', label: 'Witty' },
  { value: 'direct', label: 'Direct' },
  { value: 'empathetic', label: 'Empathetic' }
];

const ToneSelector = ({ value, onChange }) => (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }}
  >
    {TONES.map((tone) => {
      const isSelected = value === tone.value;
      return (
        <button
          key={tone.value}
          type="button"
          onClick={() => onChange(tone.value)}
          style={{
            background: isSelected
              ? 'rgba(0,212,255,0.1)'
              : 'rgba(255,255,255,0.04)',
            border: isSelected
              ? '1px solid rgba(0,212,255,0.5)'
              : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 999,
            padding: '8px 18px',
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: isSelected ? 'rgba(0,212,255,0.88)' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            outline: 'none',
            letterSpacing: '0.05em'
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            }
          }}
        >
          {tone.label}
        </button>
      );
    })}
  </div>
);

export default ToneSelector;
