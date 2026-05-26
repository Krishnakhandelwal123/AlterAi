import React, { useMemo, useState } from 'react';
import { Mic } from 'lucide-react';
import VoiceToggle from './VoiceToggle.jsx';

const timeAgo = (iso) => {
  if (!iso) return 'recently';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
};

const ghostBtn = {
  height: 34,
  padding: '0 14px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'transparent',
  color: 'rgba(255,255,255,0.5)',
  fontFamily: "'DM Mono', monospace",
  fontSize: 10,
  cursor: 'pointer'
};

const VoiceStatus = ({ voiceStatus, onToggle, onReRecord, onDelete, toggling = false }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmReRecord, setConfirmReRecord] = useState(false);
  const createdLabel = useMemo(
    () => timeAgo(voiceStatus?.voiceProfile?.created_at),
    [voiceStatus?.voiceProfile?.created_at]
  );
  const enabled = Boolean(voiceStatus?.voiceEnabled);

  return (
    <div
      className="voice-fade-up voice-delay-1"
      style={{
        background: '#0D0D0D',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: 32
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(5,150,105,0.1)',
              border: '1px solid rgba(5,150,105,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Mic size={24} color="#059669" strokeWidth={1.5} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 20, color: '#fff' }}>
              Voice Clone Active
            </h3>
            <p style={{ margin: '4px 0 0', fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
              Trained on your recording
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <VoiceToggle enabled={enabled} onChange={onToggle} disabled={toggling} size="lg" />
          <p style={{ margin: '6px 0 0', fontFamily: "'DM Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>
            Voice responses {enabled ? 'enabled' : 'disabled'}
          </p>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '24px 0' }} />

      <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>
        Cloned {createdLabel}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
        <button type="button" onClick={() => setConfirmReRecord(true)} style={ghostBtn}>
          Re-record Voice
        </button>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          style={{ ...ghostBtn, borderColor: 'rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.6)' }}
        >
          Delete Voice
        </button>
      </div>

      {confirmReRecord && (
        <div style={{ marginTop: 16 }}>
          <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
            Re-record will replace your current voice clone. Continue?
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={() => setConfirmReRecord(false)} style={ghostBtn}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmReRecord(false);
                onReRecord();
              }}
              style={ghostBtn}
            >
              Yes, Re-record
            </button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={{ marginTop: 16 }}>
          <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
            Are you sure? This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={() => setConfirmDelete(false)} style={ghostBtn}>
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                setConfirmDelete(false);
                await onDelete();
              }}
              style={{ ...ghostBtn, borderColor: 'rgba(239,68,68,0.35)', color: '#EF4444' }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceStatus;
