import React from 'react';

const AudioPreview = ({ audioUrl, recordingTime, formatTime, onReRecord }) => (
  <div
    className="voice-fade-up"
    style={{
      background: '#0D0D0D',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      padding: '20px 24px'
    }}
  >
    <p
      style={{
        margin: '0 0 12px',
        fontFamily: "'DM Mono', monospace",
        fontSize: 8,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.25)'
      }}
    >
      Preview your recording
    </p>
    <audio controls src={audioUrl} className="voice-audio-player w-full" />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
        {formatTime(recordingTime)} recorded
      </span>
      <button
        type="button"
        onClick={onReRecord}
        style={{
          background: 'transparent',
          border: 0,
          padding: 0,
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          color: 'rgba(255,255,255,0.25)',
          cursor: 'pointer',
          textDecoration: 'underline'
        }}
      >
        Re-record
      </button>
    </div>
  </div>
);

export default AudioPreview;
