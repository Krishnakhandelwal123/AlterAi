import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const filters = ['All', 'Live', 'Draft', 'Training'];

const MyClones = () => {
  const [active, setActive] = useState('All');

  return (
    <div className="mx-auto max-w-[1100px] space-y-8" data-scroll-section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[28px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            My Clones
          </h2>
          <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
            Manage your AI personalities
          </p>
        </div>
        <Link
          to="/dashboard/create"
          className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[rgba(0,212,255,0.45)] bg-[rgba(0,212,255,0.12)] px-5 text-[11px] text-[rgba(0,212,255,0.88)] transition hover:bg-[rgba(0,212,255,0.18)]"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          + Create New Clone
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActive(f)}
            className={`rounded-full px-4 py-1.5 text-[10px] uppercase tracking-wide transition ${
              active === f
                ? 'bg-[rgba(0,212,255,0.15)] text-[rgba(0,212,255,0.88)] border border-[rgba(0,212,255,0.25)]'
                : 'border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/60'
            }`}
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
          Sort by: Recent
        </span>
      </div>

      <div className="rounded-2xl border border-dashed border-white/[0.12] bg-[#0D0D0D]/50 px-8 py-16 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-[rgba(0,212,255,0.35)]" strokeWidth={1.25} />
        <p className="mt-6 text-[20px] italic font-light text-white/50" style={{ fontFamily: "'Playfair Display', serif" }}>
          No clones yet
        </p>
        <p className="mx-auto mt-2 max-w-md text-[13px] text-white/30" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Create your first AI clone to get started. It only takes a few minutes.
        </p>
        <Link
          to="/dashboard/create"
          className="mt-8 inline-flex items-center gap-2 text-[11px] text-[rgba(0,212,255,0.88)] hover:underline"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Create Clone →
        </Link>
      </div>
    </div>
  );
};

export default MyClones;
