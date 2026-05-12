import React from 'react';

export const Pill = ({ children, className = '' }) => (
  <span
    className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[7px] uppercase tracking-wide ${className}`}
    style={{ fontFamily: "'DM Mono', monospace" }}
  >
    {children}
  </span>
);

export const StatTrio = ({ items }) => (
  <div className="mt-5 grid grid-cols-3 gap-3">
    {items.map((s) => (
      <div key={s.label} className="text-center sm:text-left">
        <p className="text-base text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
          {s.value}
        </p>
        <p className="mt-0.5 text-[8px] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
          {s.label}
        </p>
      </div>
    ))}
  </div>
);

export const SyncDisconnectRow = () => (
  <div className="mt-5 flex flex-wrap gap-2">
    <span
      className="inline-flex h-9 cursor-default items-center justify-center rounded-lg border border-[rgba(0,212,255,0.2)] bg-transparent px-4 text-[10px] text-[rgba(0,212,255,0.85)]"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      ↻ Sync Now
    </span>
    <span
      className="inline-flex h-9 cursor-default items-center justify-center rounded-lg border border-red-500/25 bg-transparent px-4 text-[10px] text-red-400/90"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      Disconnect
    </span>
  </div>
);
