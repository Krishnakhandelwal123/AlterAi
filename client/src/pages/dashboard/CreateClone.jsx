import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const steps = ['Name', 'Train', 'Traits', 'Preview'];

const CreateClone = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  return (
    <div className="mx-auto max-w-[640px]" data-scroll-section>
      <div className="mb-10 flex justify-between gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 ? <div className="h-px flex-1 bg-white/10" /> : null}
              <button
                type="button"
                onClick={() => setStep(i)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] transition ${
                  i === step
                    ? 'border-[rgba(0,212,255,0.88)] bg-[rgba(0,212,255,0.15)] text-[rgba(0,212,255,0.88)]'
                    : i < step
                      ? 'border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.08)] text-white/60'
                      : 'border-white/15 bg-transparent text-white/25'
                }`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {i < step ? '✓' : i + 1}
              </button>
              {i < steps.length - 1 ? <div className="h-px flex-1 bg-white/10" /> : null}
            </div>
            <span className="mt-2 text-[8px] uppercase tracking-wide text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-[20px] border border-white/[0.07] bg-[#0D0D0D] p-8 md:p-12">
        <p className="text-[9px] uppercase tracking-[0.2em] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
          Step 1 of 4
        </p>
        <h2 className="mt-3 text-[32px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          Name your AI clone.
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-white/45" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          This is the name visitors will see when they chat with your AI.
        </p>
        <label className="mt-8 block">
          <span className="text-[10px] uppercase tracking-wide text-white/35" style={{ fontFamily: "'DM Mono', monospace" }}>
            Clone name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Krishna AI"
            className="mt-2 h-[52px] w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-4 text-[14px] text-white outline-none placeholder:text-white/25 focus:border-[rgba(0,212,255,0.45)]"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          />
        </label>
        <div className="mt-6 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-[11px] text-white/40" style={{ fontFamily: "'DM Mono', monospace" }}>
            Your public link:
          </p>
          <p className="mt-1 text-[12px] text-[rgba(0,212,255,0.75)]" style={{ fontFamily: "'DM Mono', monospace" }}>
            alter.ai/<span className="text-white/50">{name ? name.toLowerCase().replace(/\s+/g, '-') || 'yourname' : 'yourname'}</span>
          </p>
          <p className="mt-2 text-[10px] text-emerald-500/90" style={{ fontFamily: "'DM Mono', monospace" }}>
            ✓ Available (preview)
          </p>
        </div>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(s + 1, 3))}
            className="h-12 flex-1 rounded-[10px] border border-[rgba(0,212,255,0.45)] bg-[rgba(0,212,255,0.12)] text-[12px] text-[rgba(0,212,255,0.88)] transition hover:bg-[rgba(0,212,255,0.18)]"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Continue →
          </button>
        </div>
        <p className="mt-6 text-center text-[10px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
          <Link to="/dashboard" className="text-white/40 hover:text-white/60">
            ← Back to overview
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CreateClone;
