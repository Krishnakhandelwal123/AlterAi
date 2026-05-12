import React from 'react';
import { Trash2, Upload } from 'lucide-react';

const PillBadge = ({ children }) => (
  <span className="rounded-full bg-[rgba(0,212,255,0.08)] px-2 py-0.5 text-[9px] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
    {children}
  </span>
);

const TypePill = ({ children, active }) => (
  <span
    className={`inline-flex cursor-default items-center rounded-full border px-3 py-1.5 text-[10px] ${
      active
        ? 'border-[rgba(0,212,255,0.45)] bg-[rgba(0,212,255,0.08)] text-[rgba(0,212,255,0.88)]'
        : 'border-white/[0.08] bg-transparent text-white/45'
    }`}
    style={{ fontFamily: "'DM Mono', monospace" }}
  >
    {children}
  </span>
);

const ProgressBar = ({ pct, gradient }) => (
  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
    <div
      className="h-full rounded-full transition-none"
      style={{
        width: `${pct}%`,
        background: gradient ? 'linear-gradient(90deg, rgba(0,212,255,0.88), #7C3AED)' : 'linear-gradient(90deg, #F59E0B, #F59E0B)'
      }}
    />
  </div>
);

const Documents = () => (
  <div className="space-y-8">
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 md:px-5">
      <p className="text-[13px] leading-relaxed text-white/45" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        📚 Upload your book, course, or knowledge base. Your clone becomes an expert on everything inside.
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      <TypePill active>📘 Book</TypePill>
      <TypePill>🎓 Course</TypePill>
      <TypePill>📋 Knowledge Base</TypePill>
      <TypePill>💼 Portfolio</TypePill>
    </div>

    <div className="rounded-2xl border-[1.5px] border-dashed border-white/10 bg-white/[0.015] px-6 py-14 text-center md:px-10 md:py-16">
      <Upload className="mx-auto h-8 w-8 text-white/25" strokeWidth={1.25} />
      <p className="mt-4 text-[18px] italic font-light text-white/40" style={{ fontFamily: "'Playfair Display', serif" }}>
        Drop your Book / Guide here...
      </p>
      <div className="my-5 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <span className="text-[9px] text-white/15" style={{ fontFamily: "'DM Mono', monospace" }}>
          or
        </span>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>
      <span
        className="inline-flex h-10 cursor-default items-center rounded-[10px] border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.07)] px-6 text-[11px] text-[rgba(0,212,255,0.88)]"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        Browse Files
      </span>
    </div>

    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[9px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
          Uploaded Documents
        </p>
        <PillBadge>2 documents</PillBadge>
      </div>

      <div className="space-y-4">
        <div className="rounded-[14px] border border-white/[0.06] bg-[#0D0D0D] px-5 py-5 md:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#7C3AED]/25 px-2 py-0.5 text-[7px] uppercase tracking-wide text-violet-200" style={{ fontFamily: "'DM Mono', monospace" }}>
                Book
              </span>
              <p className="text-[12px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
                The Indie Hacker Playbook.pdf
              </p>
            </div>
            <Trash2 className="h-4 w-4 shrink-0 text-white/15" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="mt-2 text-[9px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
            89 pages · 48,200 words · PDF
          </p>
          <ProgressBar pct={100} gradient />
          <p className="mt-2 text-[9px] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
            Fully trained · 267 knowledge chunks
          </p>
          <p className="mt-1 text-[9px] text-white/20" style={{ fontFamily: "'DM Mono', monospace" }}>
            12 chapters detected and indexed
          </p>
        </div>

        <div className="rounded-[14px] border border-white/[0.06] bg-[#0D0D0D] px-5 py-5 md:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[rgba(0,212,255,0.12)] px-2 py-0.5 text-[7px] uppercase tracking-wide text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
                Course
              </span>
              <p className="text-[12px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
                React Masterclass Notes.txt
              </p>
            </div>
            <Trash2 className="h-4 w-4 shrink-0 text-white/15" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="mt-2 text-[9px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
            234 pages · 91,000 words · TXT
          </p>
          <ProgressBar pct={60} gradient={false} />
          <p className="mt-2 text-[9px] text-amber-500" style={{ fontFamily: "'DM Mono', monospace" }}>
            ⟳ Training in progress... 60%
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Documents;
