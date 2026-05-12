import React from 'react';
import { Link } from 'react-router-dom';
import { Mic } from 'lucide-react';

const VoiceClone = () => (
  <div className="mx-auto max-w-[1100px] space-y-10" data-scroll-section>
    <section className="relative overflow-hidden rounded-[20px] border border-[rgba(124,58,237,0.25)] bg-gradient-to-br from-[rgba(124,58,237,0.08)] to-[rgba(0,212,255,0.05)] px-6 py-10 md:px-12 md:py-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-[9px] uppercase tracking-[0.35em] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
            Voice cloning
          </p>
          <h2 className="mt-3 text-[28px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sound exactly like you.
          </h2>
          <p className="mt-4 max-w-[480px] text-[14px] leading-[1.75] text-white/50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Record a short sample of your voice. Alter clones it so your AI can speak with your timbre and cadence — perfect for async fan replies and course content.
          </p>
          <span className="mt-4 inline-block rounded-md border border-[rgba(124,58,237,0.35)] bg-[rgba(124,58,237,0.12)] px-3 py-1 text-[9px] uppercase tracking-wide text-[#C084FC]" style={{ fontFamily: "'DM Mono', monospace" }}>
            Creator plan required
          </span>
          <p className="mt-3">
            <Link to="/dashboard/billing" className="text-[10px] text-[#C084FC] hover:underline" style={{ fontFamily: "'DM Mono', monospace" }}>
              Upgrade to unlock →
            </Link>
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex h-32 w-full max-w-[280px] items-end justify-center gap-1 rounded-xl border border-white/[0.08] bg-[#080808]/80 px-3 py-4">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-[#7C3AED] to-[rgba(0,212,255,0.85)]"
                style={{ height: `${20 + ((i * 13) % 55)}px`, opacity: 0.35 + (i % 5) * 0.12 }}
              />
            ))}
          </div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
            Preview waveform
          </p>
        </div>
      </div>
    </section>

    <div className="flex flex-col items-center gap-4 py-8">
      <button
        type="button"
        className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.1)] text-[rgba(0,212,255,0.88)] transition hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]"
        aria-label="Record voice sample"
      >
        <Mic className="h-8 w-8" strokeWidth={1.5} />
      </button>
      <p className="text-[10px] text-white/35" style={{ fontFamily: "'DM Mono', monospace" }}>
        Click to record (coming soon)
      </p>
    </div>
  </div>
);

export default VoiceClone;
