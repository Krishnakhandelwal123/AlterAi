import React, { useState } from 'react';

const ranges = ['7D', '30D', '90D', 'All time'];

const Analytics = () => {
  const [range, setRange] = useState('30D');

  return (
    <div className="mx-auto max-w-[1100px] space-y-8" data-scroll-section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {ranges.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 text-[10px] uppercase tracking-wide ${
                range === r ? 'bg-[rgba(0,212,255,0.15)] text-[rgba(0,212,255,0.88)] border border-[rgba(0,212,255,0.25)]' : 'border border-white/10 text-white/35 hover:text-white/55'
              }`}
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {r}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] text-white/50"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          All Clones ▾
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {['Total conversations', 'Messages today', 'Avg session', 'Unique visitors'].map((label) => (
          <div key={label} className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-5">
            <p className="text-[9px] uppercase tracking-wide text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
              {label}
            </p>
            <p className="mt-3 text-[28px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              —
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-6">
        <h3 className="text-[18px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          Conversations over time
        </h3>
        <p className="mt-1 text-[10px] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
          Data appears once your clone is live and receiving traffic.
        </p>
        <div className="mt-8 flex h-[220px] items-end justify-between gap-1 rounded-lg border border-white/[0.04] bg-[#080808] px-4 pb-2 pt-6">
          {[12, 20, 16, 28, 22, 35, 30, 40, 36, 44, 38, 48].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-[rgba(0,212,255,0.08)] to-[rgba(0,212,255,0.35)]" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-6">
          <h4 className="text-[14px] text-white/90" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Top questions asked
          </h4>
          <ul className="mt-4 space-y-3 text-[12px] text-white/40" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <li>No data yet — launch your clone to see insights.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-6">
          <h4 className="text-[14px] text-white/90" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Visitor locations
          </h4>
          <p className="mt-4 text-[12px] text-white/35" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Geographic breakdown will appear here after your first sessions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
