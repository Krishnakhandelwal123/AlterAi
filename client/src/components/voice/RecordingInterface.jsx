import React from 'react';
import { Mic, Square } from 'lucide-react';
import AudioPreview from './AudioPreview.jsx';

const BAR_COUNT = 20;

const RecordingInterface = ({
  recording,
  recordingTime,
  audioBlob,
  audioUrl,
  uploading,
  success,
  error,
  formatTime,
  onStart,
  onStop,
  onClone,
  onDismissError,
  onReRecord
}) => {
  const progressHint = () => {
    if (recordingTime < 30) {
      return { text: `⚠ ${30 - recordingTime}s more needed`, color: '#F59E0B' };
    }
    if (recordingTime < 60) {
      return { text: '✓ Minimum reached — keep going', color: '#059669' };
    }
    if (recordingTime < 180) {
      return { text: '✓ Good quality', color: 'rgba(0,212,255,0.88)' };
    }
    return { text: '✓ Excellent — very accurate clone', color: 'rgba(0,212,255,0.88)' };
  };

  const hint = recording || recordingTime > 0 ? progressHint() : null;
  const canClone = Boolean(audioBlob) && !recording && !success && recordingTime >= 30;

  return (
    <div className="voice-fade-up voice-delay-3 space-y-6">
      <div
        style={{
          background: 'rgba(0,212,255,0.03)',
          border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: 14,
          padding: '18px 22px'
        }}
      >
        <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(0,212,255,0.88)' }}>
          💡 FOR BEST RESULTS
        </p>
        <ul
          style={{
            margin: '10px 0 0',
            paddingLeft: 18,
            color: 'rgba(255,255,255,0.35)',
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            lineHeight: 1.8
          }}
        >
          <li>Record in a quiet room</li>
          <li>Speak naturally at your normal pace</li>
          <li>Minimum 30 seconds, ideally 3+ minutes</li>
          <li>The longer you record, the more accurate</li>
          <li>Read anything — emails, articles, notes</li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {recording && (
            <>
              <span className="voice-recording-ring voice-recording-ring-1" />
              <span className="voice-recording-ring voice-recording-ring-2" />
            </>
          )}
          <button
            type="button"
            onClick={recording ? onStop : onStart}
            disabled={uploading}
            aria-label={recording ? 'Stop recording' : 'Start recording'}
            className={`voice-mic-button ${recording ? 'voice-mic-button--recording' : ''}`}
          >
            {recording ? (
              <Square size={32} color="#EF4444" fill="#EF4444" />
            ) : (
              <Mic size={36} color="rgba(0,212,255,0.6)" strokeWidth={1.5} />
            )}
          </button>
        </div>

        <p
          style={{
            margin: '20px 0 0',
            fontFamily: "'DM Mono', monospace",
            fontSize: 28,
            fontWeight: 300,
            letterSpacing: '0.1em',
            color: recording ? '#EF4444' : audioBlob ? 'rgba(0,212,255,0.88)' : 'rgba(255,255,255,0.2)'
          }}
        >
          {formatTime(recordingTime)}
        </p>
        <p style={{ margin: '8px 0 0', fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
          {recording ? 'Recording... tap to stop' : audioBlob ? 'Recording complete' : 'Click to start recording'}
        </p>

        {hint && (
          <p style={{ margin: '12px 0 0', fontFamily: "'DM Mono', monospace", fontSize: 9, color: hint.color }}>
            {hint.text}
          </p>
        )}

        {recording && (
          <div className="voice-waveform hidden sm:flex" aria-hidden>
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <span
                key={i}
                className="voice-waveform-bar"
                style={{ animationDelay: `${i * 40}ms`, animationDuration: `${0.4 + (i % 5) * 0.1}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 12,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#EF4444' }}>⚠ {error}</span>
          <button
            type="button"
            onClick={onDismissError}
            style={{ background: 'transparent', border: 0, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div
          style={{
            background: 'rgba(5,150,105,0.06)',
            border: '1px solid rgba(5,150,105,0.25)',
            borderRadius: 14,
            padding: 24,
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 32, color: '#059669' }}>✓</div>
          <h4
            style={{
              margin: '12px 0 0',
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: 20,
              color: '#fff'
            }}
          >
            Voice cloned successfully!
          </h4>
          <p style={{ margin: '8px 0 0', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            Your clone now speaks in your exact voice. Toggle it on in the status card above.
          </p>
        </div>
      )}

      {audioUrl && !recording && (
        <AudioPreview audioUrl={audioUrl} recordingTime={recordingTime} formatTime={formatTime} onReRecord={onReRecord} />
      )}

      {audioBlob && !recording && !success && (
        <button
          type="button"
          onClick={onClone}
          disabled={!canClone || uploading}
          className={`voice-clone-button ${canClone && !uploading ? 'voice-clone-button--ready' : 'voice-clone-button--disabled'}`}
        >
          {uploading ? (
            <span className="voice-spinner">⟳ Cloning your voice...</span>
          ) : canClone ? (
            '✦ Clone My Voice →'
          ) : (
            'Record at least 30 seconds first'
          )}
        </button>
      )}
    </div>
  );
};

export default RecordingInterface;
