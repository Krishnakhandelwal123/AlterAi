import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ToneSelector from './ToneSelector.jsx';

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  height: 48,
  padding: '0 14px',
  fontFamily: "'DM Mono', monospace",
  fontSize: 13,
  color: '#fff',
  outline: 'none'
};

const textareaStyle = {
  ...inputStyle,
  height: undefined,
  minHeight: 96,
  padding: '12px 14px',
  resize: 'none',
  overflow: 'auto',
  fontFamily: 'Inter, system-ui, sans-serif'
};

const label = (text, optional = false) => (
  <div style={{ marginBottom: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.36)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      {text}
    </span>
    {optional && (
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.22)' }}>
        optional
      </span>
    )}
  </div>
);

const normalizeTopics = (topics) => (Array.isArray(topics) ? topics.filter(Boolean).slice(0, 10) : []);

const EditCloneModal = ({ clone, onClose, onSave }) => {
  const modalRef = useRef(null);
  const touchStartYRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState(normalizeTopics(clone?.topics));
  const [form, setForm] = useState({
    name: clone?.name || '',
    bio: clone?.bio || '',
    tone: clone?.tone || 'casual',
    avoid: clone?.avoid || '',
    welcome_message: clone?.welcome_message || ''
  });

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addTopic = () => {
    const topic = topicInput.trim();
    if (topic && topics.length < 10 && !topics.includes(topic)) {
      setTopics((prev) => [...prev, topic]);
    }
    setTopicInput('');
  };

  const handleTopicKey = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTopic();
    }
    if (event.key === 'Backspace' && !topicInput && topics.length) {
      setTopics((prev) => prev.slice(0, -1));
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    setError('');
    const result = await onSave(clone.id, {
      name: form.name.trim(),
      bio: form.bio.trim(),
      tone: form.tone,
      topics,
      avoid: form.avoid.trim(),
      welcome_message: form.welcome_message.trim()
    });
    setSaving(false);

    if (result?.success) {
      onClose();
      return;
    }

    setError(result?.error || 'Failed to update clone.');
  };

  const scrollModalBy = (deltaY) => {
    if (!modalRef.current) return;
    modalRef.current.scrollTop += deltaY;
  };

  const handleWheel = (event) => {
    event.preventDefault();
    event.stopPropagation();
    scrollModalBy(event.deltaY);
  };

  const handleTouchStart = (event) => {
    touchStartYRef.current = event.touches?.[0]?.clientY ?? null;
  };

  const handleTouchMove = (event) => {
    if (touchStartYRef.current == null) return;
    const nextY = event.touches?.[0]?.clientY ?? touchStartYRef.current;
    const deltaY = touchStartYRef.current - nextY;
    touchStartYRef.current = nextY;
    event.preventDefault();
    event.stopPropagation();
    scrollModalBy(deltaY);
  };

  const content = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.84)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'hidden' }}>
      <div
        ref={modalRef}
        className="scrollbar-hidden"
        onWheelCapture={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{ width: 'min(680px, 96vw)', maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto', boxSizing: 'border-box', background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 18, position: 'relative', padding: '34px 38px', margin: '0 auto', overscrollBehavior: 'contain', touchAction: 'pan-y' }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Close edit clone"
          style={{ position: 'absolute', top: 18, right: 18, background: 'transparent', border: 0, color: 'rgba(255,255,255,0.36)', fontSize: 22, lineHeight: 1, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          ×
        </button>

        <div>
          <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(0,212,255,0.88)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Edit Clone
          </p>
          <h2 style={{ margin: '8px 0 6px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 32, fontWeight: 300, color: '#fff' }}>
            Update {clone?.name || 'your clone'}.
          </h2>
          <p style={{ margin: 0, maxWidth: 520, fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.46)' }}>
            Changes affect the public chat identity and how the clone introduces itself. The public slug stays the same.
          </p>
        </div>

        <div style={{ marginTop: 26 }}>
          <div style={{ display: 'grid', gap: 18 }}>
            <div>
              {label('Clone Name')}
              <input
                value={form.name}
                maxLength={50}
                onChange={(event) => setField('name', event.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              {label('Short Bio', true)}
              <textarea
                className="scrollbar-hidden"
                value={form.bio}
                maxLength={300}
                rows={3}
                onChange={(event) => setField('bio', event.target.value)}
                style={textareaStyle}
              />
            </div>

            <div>
              {label('Tone of Voice')}
              <ToneSelector value={form.tone} onChange={(value) => setField('tone', value)} />
            </div>

            <div>
              {label('Topics', true)}
              <div
                style={{ ...inputStyle, minHeight: 50, height: 'auto', padding: '8px 11px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}
                onClick={() => document.getElementById('edit-topic-input')?.focus()}
              >
                {topics.map((topic) => (
                  <span key={topic} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid rgba(0,212,255,0.22)', borderRadius: 999, background: 'rgba(0,212,255,0.08)', padding: '3px 9px', color: 'rgba(0,212,255,0.88)', fontFamily: "'DM Mono', monospace", fontSize: 9 }}>
                    {topic}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setTopics((prev) => prev.filter((item) => item !== topic));
                      }}
                      style={{ background: 'transparent', border: 0, color: 'inherit', cursor: 'pointer', padding: 0, opacity: 0.7 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {topics.length < 10 && (
                  <input
                    id="edit-topic-input"
                    value={topicInput}
                    onChange={(event) => setTopicInput(event.target.value)}
                    onKeyDown={handleTopicKey}
                    placeholder={topics.length === 0 ? 'Type a topic and press Enter...' : ''}
                    style={{ flex: 1, minWidth: 150, background: 'transparent', border: 0, outline: 0, color: '#fff', fontFamily: "'DM Mono', monospace", fontSize: 12 }}
                  />
                )}
              </div>
            </div>

            <div>
              {label('What to Avoid', true)}
              <textarea
                className="scrollbar-hidden"
                value={form.avoid}
                maxLength={200}
                rows={3}
                onChange={(event) => setField('avoid', event.target.value)}
                style={textareaStyle}
              />
            </div>

            <div>
              {label('Welcome Message', true)}
              <textarea
                className="scrollbar-hidden"
                value={form.welcome_message}
                maxLength={500}
                rows={4}
                onChange={(event) => setField('welcome_message', event.target.value)}
                style={textareaStyle}
              />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 16, border: '1px solid rgba(239,68,68,0.28)', borderRadius: 10, background: 'rgba(239,68,68,0.06)', padding: '9px 12px', color: '#EF4444', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{ height: 42, padding: '0 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.52)', fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{ height: 42, padding: '0 20px', borderRadius: 10, border: '1px solid rgba(0,212,255,0.42)', background: 'rgba(0,212,255,0.12)', color: 'rgba(0,212,255,0.9)', fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.65 : 1 }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default EditCloneModal;
