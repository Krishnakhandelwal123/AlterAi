import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const Toggle = ({ label, defaultOn = true }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      className={`flex w-full items-center justify-between rounded-xl border border-white/[0.06] px-4 py-3 text-left transition ${
        on ? 'bg-[rgba(0,212,255,0.12)]' : 'bg-white/[0.04]'
      }`}
    >
      <span className="text-[13px] text-white/80" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {label}
      </span>
      <span
        className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-[rgba(0,212,255,0.35)]' : 'bg-white/15'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? 'left-5' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
};

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto grid max-w-[900px] gap-10 lg:grid-cols-[200px_1fr]" data-scroll-section>
      <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
        {['Profile', 'Security', 'Notifications', 'Danger zone'].map((tab) => (
          <button
            key={tab}
            type="button"
            className="rounded-lg border border-transparent px-3 py-2 text-left text-[10px] uppercase tracking-wide text-white/40 hover:border-white/10 hover:bg-white/[0.04] hover:text-white/70 lg:border-white/[0.06] lg:bg-white/[0.03]"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="space-y-8">
        <section className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-6 md:p-8">
          <h3 className="text-[20px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Profile
          </h3>
          <div className="mt-6 flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-white/20 bg-white/[0.02] text-[10px] text-white/35" style={{ fontFamily: "'DM Mono', monospace" }}>
            Photo
          </div>
          <label className="mt-6 block">
            <span className="text-[10px] uppercase tracking-wide text-white/35" style={{ fontFamily: "'DM Mono', monospace" }}>
              Display name
            </span>
            <input
              defaultValue={user?.name || ''}
              className="mt-2 h-11 w-full max-w-md rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-3 text-[14px] text-white outline-none focus:border-[rgba(0,212,255,0.4)]"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            />
          </label>
          <label className="mt-4 block">
            <span className="text-[10px] uppercase tracking-wide text-white/35" style={{ fontFamily: "'DM Mono', monospace" }}>
              Bio
            </span>
            <textarea
              rows={3}
              placeholder="Tell visitors about you..."
              className="mt-2 w-full max-w-md rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/25 focus:border-[rgba(0,212,255,0.4)]"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            />
          </label>
          <button
            type="button"
            className="mt-6 rounded-[10px] border border-[rgba(0,212,255,0.45)] bg-[rgba(0,212,255,0.12)] px-6 py-2.5 text-[11px] text-[rgba(0,212,255,0.88)]"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Save changes
          </button>
        </section>

        <section className="space-y-3">
          <h3 className="text-[12px] uppercase tracking-wide text-white/45" style={{ fontFamily: "'DM Mono', monospace" }}>
            Notifications
          </h3>
          <Toggle label="New conversation started" />
          <Toggle label="Daily summary email" />
          <Toggle label="Weekly analytics report" defaultOn={false} />
          <Toggle label="Product updates" />
        </section>

        <section className="rounded-2xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] p-6">
          <h3 className="text-[16px] text-red-400/90" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Danger zone
          </h3>
          <p className="mt-2 text-[12px] text-white/40" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Deleting your account removes clones and training data. This cannot be undone.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-[11px] text-red-400" style={{ fontFamily: "'DM Mono', monospace" }}>
              Delete account
            </button>
            <button type="button" className="rounded-lg border border-white/10 px-4 py-2 text-[11px] text-white/50" style={{ fontFamily: "'DM Mono', monospace" }}>
              Export my data
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
