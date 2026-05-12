import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const QACard = ({ q, a }) => (
  <article className="rounded-xl border border-white/[0.06] bg-[#0D0D0D] p-5">
    <div className="flex flex-wrap items-start gap-2">
      <span className="text-[8px] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
        Q
      </span>
      <p className="min-w-0 flex-1 text-[12px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
        {q}
      </p>
    </div>
    <div className="my-2.5 h-px bg-white/[0.05]" />
    <div className="flex flex-wrap items-start gap-2">
      <span className="text-[8px] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
        A
      </span>
      <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-white/50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {a}
      </p>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] text-emerald-600" style={{ fontFamily: "'DM Mono', monospace" }}>
        ✓ Trained
      </span>
      <div className="flex items-center gap-2 text-white/15">
        <Edit2 className="h-4 w-4" strokeWidth={1.5} />
        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
      </div>
    </div>
  </article>
);

const QAPairs = () => (
  <div className="space-y-8">
    <div className="rounded-[10px] border border-[rgba(0,212,255,0.1)] bg-[rgba(0,212,255,0.04)] px-[18px] py-3.5">
      <p className="text-[11px] leading-relaxed text-[rgba(0,212,255,0.6)]" style={{ fontFamily: "'DM Mono', monospace" }}>
        ⚡ Q&A pairs make your clone most accurate. Write questions people ask you + your exact answers.
      </p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="text-[8px] uppercase tracking-wide text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
          Question
        </label>
        <div className="mt-1.5 h-11 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-[13px] leading-[44px] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
          What do people usually ask you?
        </div>
      </div>
      <div>
        <label className="text-[8px] uppercase tracking-wide text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
          Your answer
        </label>
        <div className="mt-1.5 min-h-[110px] w-full rounded-lg border border-white/[0.08] bg-white/[0.04] p-3 text-[13px] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
          Write your answer exactly how you would say it...
        </div>
      </div>
      <span
        className="flex h-11 w-full cursor-default items-center justify-center rounded-lg border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.07)] text-[11px] text-[rgba(0,212,255,0.88)]"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        + Add Q&A Pair
      </span>
    </div>

    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[9px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
          Your Q&A Pairs
        </p>
        <span className="rounded-full bg-[rgba(0,212,255,0.08)] px-2 py-0.5 text-[9px] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
          3 pairs
        </span>
      </div>
      <div className="space-y-3">
        <QACard q="What do you do?" a="I build AI products that help creators scale their knowledge and reach." />
        <QACard
          q="How did you start coding?"
          a="I taught myself at 16 watching YouTube. First project was a basic calculator."
        />
        <QACard q="Best advice for beginners?" a="Ship something. Anything. Learning happens when you build, not when you plan." />
      </div>
    </div>
  </div>
);

export default QAPairs;
