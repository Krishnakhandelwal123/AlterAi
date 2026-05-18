import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import SlugInput from './SlugInput.jsx';
import ToneSelector from './ToneSelector.jsx';

const STEPS = ['Name', 'Personality', 'Style', 'Preview'];

const getInitials = (name = '') => {
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : (name[0] || 'A').toUpperCase();
};

const AVATAR_COLORS = ['#00D4FF','#7C3AED','#059669','#F59E0B','#EF4444','#8B5CF6'];
const avatarColor = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] || '#00D4FF';

const label = (text, optional = false) => (
  <div style={{ marginBottom: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{text}</span>
    {optional && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>(optional)</span>}
  </div>
);

const inputStyle = {
  width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, height: 52,
  padding: '0 16px', fontFamily: "'DM Mono', monospace", fontSize: 14, color: '#fff', outline: 'none'
};
const textareaStyle = { ...inputStyle, height: undefined, padding: '12px 16px', resize: 'none' };

const CreateCloneModal = ({ onClose, onCreate }) => {
  const [step, setStep] = useState(0);
  const [slugAvailable, setSlugAvailable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmClose, setConfirmClose] = useState(false);
  const [topics, setTopics] = useState([]);
  const [topicInput, setTopicInput] = useState('');
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    name: '', slug: '', bio: '', tone: 'casual',
    avoid: '', welcomeMessage: ''
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleClose = () => {
    if (step > 0 && !success) { setConfirmClose(true); return; }
    onClose();
  };

  const addTopic = () => {
    const t = topicInput.trim();
    if (t && topics.length < 10 && !topics.includes(t)) {
      setTopics(p => [...p, t]);
    }
    setTopicInput('');
  };

  const handleTopicKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTopic(); }
    if (e.key === 'Backspace' && !topicInput && topics.length) setTopics(p => p.slice(0, -1));
  };

  const canGoNext = () => {
    if (step === 0) {
      if (!form.name || form.name.trim().length < 2) return false;
      if (!form.slug || form.slug.length < 3) return false;
      if (!slugAvailable) return false;
    }
    return true;
  };

  const handleNext = () => {
    setFormError('');
    if (!canGoNext()) {
      if (step === 0) {
        if (!form.name || form.name.trim().length < 2) setFormError('Please enter a name (2+ chars)');
        else if (!slugAvailable) setFormError('Choose an available slug before continuing');
      }
      return;
    }
    setStep(s => Math.min(s + 1, 3));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    const result = await onCreate({ ...form, topics });
    if (result?.success) {
      setSuccess(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#00D4FF','#7C3AED','#059669'] });
      setTimeout(() => onClose(), 1600);
    } else {
      setSubmitError(result?.error || 'Failed to create clone. Try again.');
      setSubmitting(false);
    }
  };

  const color = form.name ? avatarColor(form.name) : '#00D4FF';

  const content = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, width: 'min(640px, 95vw)', maxHeight: '90vh', overflowY: 'auto', padding: '40px 48px', position: 'relative' }}>

        {/* Close */}
        <button type="button" onClick={handleClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>×</button>

        {/* Step progress */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, transition: 'all 300ms',
                  background: i <= step ? 'rgba(0,212,255,0.88)' : 'transparent',
                  border: i <= step ? '2px solid rgba(0,212,255,0.88)' : '2px solid rgba(255,255,255,0.2)',
                  color: i <= step ? '#000' : 'rgba(255,255,255,0.3)',
                  boxShadow: i === step ? '0 0 0 4px rgba(0,212,255,0.15)' : 'none',
                  fontFamily: "'DM Mono', monospace" }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>{s}</span>
              </div>
              {i < 3 && <div style={{ flex: 1, height: 1, margin: '0 8px', marginBottom: 14, background: i < step ? 'rgba(0,212,255,0.88)' : 'rgba(255,255,255,0.1)', transition: 'background 300ms' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1: NAME ── */}
        {step === 0 && (
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(0,212,255,0.88)', marginBottom: 8, letterSpacing: '0.1em' }}>STEP 1 OF 4</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 32, fontWeight: 300, color: '#fff', marginBottom: 8 }}>Name your AI clone.</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>This is what visitors will see when they chat with your AI.</p>

            <div style={{ marginBottom: 20 }}>
              {label('Clone Name')}
              <div style={{ position: 'relative' }}>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value.slice(0,50))} placeholder="e.g. Krishna AI" style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor='rgba(0,212,255,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'} />
                <span style={{ position: 'absolute', right: 12, bottom: 8, fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>{form.name.length}/50</span>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              {label('Your Public Link')}
              <SlugInput name={form.name} value={form.slug} onChange={v => set('slug', v)} onAvailabilityChange={setSlugAvailable} />
            </div>

            <div style={{ marginBottom: 28 }}>
              {label('Short Bio', true)}
              <div style={{ position: 'relative' }}>
                <textarea value={form.bio} onChange={e => set('bio', e.target.value.slice(0,300))} placeholder="What is your AI clone about? What can visitors ask you?" rows={3} style={textareaStyle}
                  onFocus={e => e.currentTarget.style.borderColor='rgba(0,212,255,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'} />
                <span style={{ position: 'absolute', right: 12, bottom: 8, fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>{form.bio.length}/300</span>
              </div>
            </div>

            {formError && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#EF4444', marginBottom: 12 }}>{formError}</div>}

            <button type="button" onClick={handleNext} disabled={!canGoNext()} style={{ width: '100%', height: 52, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.4)', borderRadius: 12, fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'rgba(0,212,255,0.88)', cursor: canGoNext() ? 'pointer' : 'not-allowed', opacity: canGoNext() ? 1 : 0.4, transition: 'all 200ms' }}>
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 2: PERSONALITY ── */}
        {step === 1 && (
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(0,212,255,0.88)', marginBottom: 8, letterSpacing: '0.1em' }}>STEP 2 OF 4</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 32, fontWeight: 300, color: '#fff', marginBottom: 8 }}>Define your personality.</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>How should your AI clone sound and behave?</p>

            <div style={{ marginBottom: 24 }}>
              {label('Tone of Voice')}
              <ToneSelector value={form.tone} onChange={v => set('tone', v)} />
            </div>

            <div style={{ marginBottom: 24 }}>
              {label('Topics You Know')}
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.2)', marginBottom: 8 }}>What subjects can your clone answer questions about?</p>
              <div style={{ ...inputStyle, height: 'auto', minHeight: 52, padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', cursor: 'text' }}
                onClick={() => document.getElementById('topic-input')?.focus()}>
                {topics.map(t => (
                  <span key={t} style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 999, padding: '3px 10px', fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(0,212,255,0.88)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {t}
                    <span onClick={e => { e.stopPropagation(); setTopics(p => p.filter(x => x !== t)); }} style={{ cursor: 'pointer', opacity: 0.6 }}>×</span>
                  </span>
                ))}
                {topics.length < 10 && (
                  <input id="topic-input" value={topicInput} onChange={e => setTopicInput(e.target.value)} onKeyDown={handleTopicKey}
                    placeholder={topics.length === 0 ? 'Type a topic and press Enter...' : ''} style={{ background: 'none', border: 'none', outline: 'none', fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#fff', minWidth: 120, flex: 1 }} />
                )}
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              {label('What to Avoid', true)}
              <textarea value={form.avoid} onChange={e => set('avoid', e.target.value.slice(0,200))} placeholder="Topics, phrases, or questions your clone should never engage with..." rows={3} style={textareaStyle}
                onFocus={e => e.currentTarget.style.borderColor='rgba(0,212,255,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'} />
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button type="button" onClick={() => setStep(0)} style={{ background: 'none', border: 'none', fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>← Back</button>
              <button type="button" onClick={handleNext} style={{ flex: 1, height: 52, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.4)', borderRadius: 12, fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'rgba(0,212,255,0.88)', cursor: 'pointer' }}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: WELCOME MESSAGE ── */}
        {step === 2 && (
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(0,212,255,0.88)', marginBottom: 8, letterSpacing: '0.1em' }}>STEP 3 OF 4</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 32, fontWeight: 300, color: '#fff', marginBottom: 8 }}>Set a welcome message.</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>The first thing visitors see when they open your clone.</p>

            <div style={{ marginBottom: 20 }}>
              {label('Welcome Message')}
              <div style={{ position: 'relative' }}>
                <textarea value={form.welcomeMessage} onChange={e => set('welcomeMessage', e.target.value.slice(0,500))} placeholder={`Hey! I'm ${form.name || 'your clone'}. Ask me anything — I'm here to help 🚀`} rows={5} style={textareaStyle}
                  onFocus={e => e.currentTarget.style.borderColor='rgba(0,212,255,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'} />
                <span style={{ position: 'absolute', right: 12, bottom: 8, fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>{form.welcomeMessage.length}/500</span>
              </div>
            </div>

            {/* Live Preview */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: 'rgba(0,212,255,0.88)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>PREVIEW</div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 13, color: '#fff', flexShrink: 0 }}>{getInitials(form.name)}</div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.8)', maxWidth: '80%', lineHeight: 1.5 }}>
                    {form.welcomeMessage || `Hey! I'm ${form.name || 'your clone'}. Ask me anything — I'm here to help 🚀`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingLeft: 42 }}>
                  {['What can you help me with?', 'Tell me about yourself'].map(q => (
                    <span key={q} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '4px 12px', fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{q}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>← Back</button>
              <button type="button" onClick={handleNext} style={{ flex: 1, height: 52, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.4)', borderRadius: 12, fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'rgba(0,212,255,0.88)', cursor: 'pointer' }}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── STEP 4: REVIEW ── */}
        {step === 3 && (
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(0,212,255,0.88)', marginBottom: 8, letterSpacing: '0.1em' }}>STEP 4 OF 4</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 32, fontWeight: 300, color: '#fff', marginBottom: 8 }}>Review your clone.</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Everything looks good? Let's bring your AI to life.</p>

            {/* Summary card */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 24, color: '#fff', flexShrink: 0 }}>{getInitials(form.name)}</div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 22, fontWeight: 300, color: '#fff' }}>{form.name}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'rgba(0,212,255,0.88)', marginTop: 3 }}>alter.ai/{form.slug}</div>
                  {form.bio && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{form.bio}</div>}
                </div>
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                <div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tone </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#fff', textTransform: 'capitalize' }}>{form.tone}</span>
                </div>
                {topics.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {topics.map(t => <span key={t} style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 999, padding: '2px 8px', fontFamily: "'DM Mono', monospace", fontSize: 8, color: 'rgba(0,212,255,0.88)' }}>{t}</span>)}
                  </div>
                )}
              </div>

              {(form.welcomeMessage) && (
                <>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px 12px 12px 12px', padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                    {form.welcomeMessage}
                  </div>
                </>
              )}
            </div>

            {success ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: '#059669' }}>Clone created!</div>
              </div>
            ) : (
              <>
                {submitError && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#EF4444', marginBottom: 12, border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 12px', background: 'rgba(239,68,68,0.05)' }}>{submitError}</div>}
                <button type="button" onClick={handleSubmit} disabled={submitting} style={{ width: '100%', height: 56, background: 'rgba(0,212,255,0.12)', border: `1px solid ${submitError ? 'rgba(239,68,68,0.5)' : 'rgba(0,212,255,0.5)'}`, borderRadius: 14, fontFamily: "'DM Mono', monospace", fontSize: 14, color: submitting ? 'rgba(0,212,255,0.5)' : 'rgba(0,212,255,0.88)', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, letterSpacing: '0.05em', marginBottom: 12, transition: 'all 200ms' }}>
                  {submitting ? '⏳ Creating your clone...' : '✦ Create My Clone →'}
                </button>
                <div style={{ textAlign: 'center' }}>
                  <button type="button" onClick={() => setStep(2)} style={{ background: 'none', border: 'none', fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>← Back</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Confirm close dialog */}
        {confirmClose && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '28px 32px', textAlign: 'center', maxWidth: 320 }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 18, color: '#fff', marginBottom: 10 }}>Discard progress?</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Your wizard progress will be lost.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setConfirmClose(false)} style={{ flex: 1, height: 40, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>Cancel</button>
                <button type="button" onClick={onClose} style={{ flex: 1, height: 40, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#EF4444', cursor: 'pointer' }}>Discard</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default CreateCloneModal;
