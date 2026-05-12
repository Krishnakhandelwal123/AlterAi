import React from 'react';
import { Trash2 } from 'lucide-react';

const DUMMY_TEXT = `I've been building software products for the past 6 years. My biggest lesson has been that distribution beats product every single time. You can build the best thing in the world but if nobody sees it, it doesn't matter...`;

const PasteText = () => (
  <div className="space-y-8">
    <div className="rounded-xl border border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.03)] px-[18px] py-3.5">
      <p className="text-[13px] leading-relaxed text-white/45" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        💡 Paste any writing — blog posts, essays, answers, LinkedIn posts. The more the better.
      </p>
    </div>

    <div
      className="min-h-[240px] w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 text-[13px] leading-[1.7] text-white/80"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      {DUMMY_TEXT}
    </div>

    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[9px] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
        843 / 10,000 characters
      </span>
      <div className="flex flex-wrap gap-2">
        <span
          className="inline-flex h-9 cursor-default items-center rounded-lg border border-white/10 px-4 text-[11px] text-white/50"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Clear
        </span>
        <span
          className="inline-flex h-9 cursor-default items-center rounded-lg border border-[rgba(0,212,255,0.35)] bg-[rgba(0,212,255,0.1)] px-4 text-[11px] text-[rgba(0,212,255,0.88)]"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Save Text →
        </span>
      </div>
    </div>

    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[9px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
          Saved Entries
        </p>
        <span className="rounded-full bg-[rgba(0,212,255,0.08)] px-2 py-0.5 text-[9px] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
          2 entries
        </span>
      </div>
      <div className="space-y-3">
        <article className="rounded-xl border border-white/[0.06] bg-[#0D0D0D] px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-white/50" style={{ fontFamily: "'DM Mono', monospace" }}>
              Entry #1
            </span>
            <span className="ml-auto text-[9px] text-white/20" style={{ fontFamily: "'DM Mono', monospace" }}>
              2 days ago
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] text-emerald-600" style={{ fontFamily: "'DM Mono', monospace" }}>
              ✓ Trained
            </span>
            <Trash2 className="h-4 w-4 text-white/15" strokeWidth={1.5} />
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-white/35" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            I&apos;ve been building software products for the past 6 years. My biggest...
          </p>
          <p className="mt-2 text-[9px] text-white/20" style={{ fontFamily: "'DM Mono', monospace" }}>
            843 characters
          </p>
        </article>
        <article className="rounded-xl border border-white/[0.06] bg-[#0D0D0D] px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-white/50" style={{ fontFamily: "'DM Mono', monospace" }}>
              Entry #2
            </span>
            <span className="ml-auto text-[9px] text-white/20" style={{ fontFamily: "'DM Mono', monospace" }}>
              5 days ago
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] text-emerald-600" style={{ fontFamily: "'DM Mono', monospace" }}>
              ✓ Trained
            </span>
            <Trash2 className="h-4 w-4 text-white/15" strokeWidth={1.5} />
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-white/35" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            The best investment I ever made was...
          </p>
          <p className="mt-2 text-[9px] text-white/20" style={{ fontFamily: "'DM Mono', monospace" }}>
            1,204 characters
          </p>
        </article>
      </div>
    </div>
  </div>
);

export default PasteText;
