import React, { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useClones } from '../../hooks/useClones.js';
import { useBillingSubscription } from '../../hooks/useBillingSubscription.js';
import { useVoiceClone } from '../../hooks/useVoiceClone.js';
import PlanGate from '../../components/voice/PlanGate.jsx';
import VoiceStatus from '../../components/voice/VoiceStatus.jsx';
import VoiceToggle from '../../components/voice/VoiceToggle.jsx';
import RecordingInterface from '../../components/voice/RecordingInterface.jsx';
import { getPublicChatDisplayUrl } from '../../utils/publicLinks.js';

const STEPS = [
  {
    num: '01',
    icon: '🎙',
    title: 'Record your voice',
    desc: 'Speak naturally for 1–3 minutes. Read anything — notes, articles, your own content.'
  },
  {
    num: '02',
    icon: '✦',
    title: 'AI clones your voice',
    desc: 'ElevenLabs analyzes your recording and creates a digital copy of your unique voice.'
  },
  {
    num: '03',
    icon: '💬',
    title: 'Your clone speaks like you',
    desc: 'Every AI response in your public chat can play in your cloned voice for visitors.'
  }
];

const VoiceClone = () => {
  const { cloneId: routeCloneId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCloneId = searchParams.get('cloneId');
  const { clones, loading: clonesLoading } = useClones();
  const { currentPlan } = useBillingSubscription();
  const [toggling, setToggling] = useState(false);

  const selectedCloneId = routeCloneId || queryCloneId || clones[0]?.id || '';
  const selectedClone = useMemo(
    () => clones.find((clone) => clone.id === selectedCloneId) || clones[0] || null,
    [clones, selectedCloneId]
  );

  const voice = useVoiceClone(selectedClone?.id);
  const isCreator = currentPlan === 'creator';
  const showStatus = Boolean(voice.voiceStatus?.hasVoice) && !voice.reRecordMode;

  const handleCloneSelect = (id) => {
    if (routeCloneId) return;
    setSearchParams({ cloneId: id });
  };

  const handleToggle = async (enabled) => {
    setToggling(true);
    await voice.toggleVoice(enabled);
    setToggling(false);
  };

  const handleReRecord = async () => {
    if (voice.voiceStatus?.hasVoice) {
      await voice.deleteVoice();
    }
    voice.beginReRecord();
  };

  return (
    <div className="voice-page mx-auto max-w-[920px] space-y-8 pb-10" data-scroll-section>
      <header className="voice-fade-up flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.12em] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
            Voice Cloning
          </p>
          <h1 className="mt-2 text-[28px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sound exactly like you.
          </h1>
          <p className="mt-3 max-w-[520px] text-[13px] leading-[1.7] text-white/40" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Record your voice once. Your clone speaks in your exact tone — forever.
          </p>
        </div>
        {showStatus && (
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0D0D0D] px-4 py-3">
            <span className="text-[10px] text-white/50" style={{ fontFamily: "'DM Mono', monospace" }}>
              Voice Responses
            </span>
            <VoiceToggle enabled={Boolean(voice.voiceStatus?.voiceEnabled)} onChange={handleToggle} disabled={toggling} />
          </div>
        )}
      </header>

      {!isCreator ? (
        <PlanGate />
      ) : (
        <>
          {clones.length > 0 && (
            <div className="voice-fade-up voice-delay-1">
              <label className="mb-2 block text-[8px] uppercase tracking-[0.12em] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
                Select clone
              </label>
              <select
                value={selectedClone?.id || ''}
                onChange={(event) => handleCloneSelect(event.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0D0D0D] px-4 py-3 text-[12px] text-white outline-none focus:border-[rgba(0,212,255,0.35)]"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {clones.map((clone) => (
                  <option key={clone.id} value={clone.id}>
                    {clone.name} · {getPublicChatDisplayUrl(clone.slug)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {clonesLoading && (
            <p className="text-[11px] text-white/35" style={{ fontFamily: "'DM Mono', monospace" }}>
              Loading clones...
            </p>
          )}

          {!clonesLoading && clones.length === 0 && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0D0D0D] p-8 text-center">
              <p className="text-[13px] text-white/45" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Create a clone first, then return here to add your voice.
              </p>
              <Link
                to="/dashboard/clones"
                className="mt-4 inline-block text-[11px] text-[rgba(0,212,255,0.88)] hover:underline"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Go to My Clones →
              </Link>
            </div>
          )}

          {selectedClone && (
            <>
              {showStatus && (
                <VoiceStatus
                  voiceStatus={voice.voiceStatus}
                  onToggle={handleToggle}
                  onReRecord={handleReRecord}
                  onDelete={voice.deleteVoice}
                  toggling={toggling}
                />
              )}

              <section className="voice-fade-up voice-delay-2 grid gap-4 md:grid-cols-3">
                {STEPS.map((step) => (
                  <article
                    key={step.num}
                    className="rounded-[14px] border border-white/[0.05] bg-white/[0.02] p-5"
                  >
                    <p className="text-[10px] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {step.num}
                    </p>
                    <div className="mt-2 text-2xl">{step.icon}</div>
                    <h3 className="mt-2 text-[16px] italic text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[12px] leading-[1.6] text-white/30" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                      {step.desc}
                    </p>
                  </article>
                ))}
              </section>

              {!showStatus && (
                <RecordingInterface
                  recording={voice.recording}
                  recordingTime={voice.recordingTime}
                  audioBlob={voice.audioBlob}
                  audioUrl={voice.audioUrl}
                  uploading={voice.uploading}
                  success={voice.success}
                  error={voice.error}
                  formatTime={voice.formatTime}
                  onStart={voice.startRecording}
                  onStop={voice.stopRecording}
                  onClone={() => voice.cloneVoice(selectedClone.name)}
                  onDismissError={() => voice.setError(null)}
                  onReRecord={voice.resetRecordingState}
                />
              )}
            </>
          )}
        </>
      )}

      <style>{`
        .voice-page .voice-fade-up {
          opacity: 0;
          transform: translateY(16px);
          animation: voiceFadeUp 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .voice-delay-1 { animation-delay: 150ms; }
        .voice-delay-2 { animation-delay: 300ms; }
        .voice-delay-3 { animation-delay: 450ms; }
        @keyframes voiceFadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .voice-mic-button {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          border: 2px solid rgba(0,212,255,0.25);
          background: rgba(0,212,255,0.06);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 300ms ease;
          position: relative;
          z-index: 1;
        }
        .voice-mic-button:hover:not(:disabled) {
          transform: scale(1.05);
          background: rgba(0,212,255,0.12);
          border-color: rgba(0,212,255,0.5);
        }
        .voice-mic-button--recording {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.5);
        }
        .voice-recording-ring {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .voice-recording-ring-1 {
          inset: -8px;
          border: 2px solid rgba(239,68,68,0.3);
          animation: voicePing 1.5s infinite;
        }
        .voice-recording-ring-2 {
          inset: -16px;
          border: 1px solid rgba(239,68,68,0.15);
          animation: voicePing 1.5s infinite;
          animation-delay: 0.5s;
        }
        @keyframes voicePing {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .voice-waveform {
          margin-top: 16px;
          height: 40px;
          align-items: center;
          justify-content: center;
          gap: 3px;
        }
        .voice-waveform-bar {
          width: 3px;
          border-radius: 2px;
          background: rgba(0,212,255,0.6);
          animation: voiceBarPulse 0.7s ease-in-out infinite;
        }
        @keyframes voiceBarPulse {
          0%, 100% { height: 4px; }
          50% { height: 28px; }
        }
        .voice-clone-button {
          width: 100%;
          height: 56px;
          border-radius: 14px;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 200ms ease;
        }
        .voice-clone-button--ready {
          border: 1px solid rgba(0,212,255,0.4);
          background: rgba(0,212,255,0.1);
          color: rgba(0,212,255,0.88);
        }
        .voice-clone-button--ready:hover {
          background: rgba(0,212,255,0.18);
          border-color: rgba(0,212,255,0.7);
          box-shadow: 0 0 24px rgba(0,212,255,0.12);
        }
        .voice-clone-button--disabled {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.2);
          cursor: not-allowed;
        }
        .voice-spinner {
          display: inline-block;
          animation: voiceSpin 1s linear infinite;
        }
        @keyframes voiceSpin {
          to { transform: rotate(360deg); }
        }
        .voice-audio-player {
          filter: invert(1) hue-rotate(180deg);
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
};

export default VoiceClone;
