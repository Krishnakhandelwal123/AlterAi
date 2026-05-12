import React, { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/**
 * One account control: three dots open a menu; Sign out runs only from the menu (not on row click).
 */
const ProfileMenu = ({ variant = 'sidebar' }) => {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();
  const avatar = user?.avatar;

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  if (variant === 'compact') {
    return (
      <div className="relative flex items-center gap-2" ref={rootRef}>
        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[rgba(0,212,255,0.35)] bg-white/10">
          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : null}
          {!avatar ? (
            <span className="flex h-full w-full items-center justify-center text-[11px] text-white/90" style={{ fontFamily: "'DM Mono', monospace" }}>
              {initial}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Account menu"
          className="rounded-lg p-2 text-white/40 transition hover:bg-white/[0.08] hover:text-white/75"
        >
          <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} />
        </button>
        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-[60] mt-1 min-w-[160px] overflow-hidden rounded-lg border border-white/[0.1] bg-[#161616] py-1 shadow-[0_8px_32px_rgba(0,0,0,0.55)]"
          >
            <div className="border-b border-white/[0.06] px-3 py-2">
              <p className="truncate text-[11px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
                {displayName}
              </p>
              <p className="text-[9px] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
                Creator
              </p>
            </div>
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2.5 text-left text-[11px] text-white/80 transition hover:bg-white/[0.06] hover:text-white"
              style={{ fontFamily: "'DM Mono', monospace" }}
              onClick={() => {
                setOpen(false);
                signOut();
              }}
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg px-1 py-2 hover:bg-white/[0.03]" ref={rootRef}>
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[rgba(0,212,255,0.35)] bg-white/10">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : null}
        {!avatar ? (
          <span className="flex h-full w-full items-center justify-center text-[11px] text-white/80" style={{ fontFamily: "'DM Mono', monospace" }}>
            {initial}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
          {displayName}
        </p>
        <p className="text-[9px] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
          Creator
        </p>
      </div>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Open account menu"
          className="rounded p-1.5 text-white/35 transition hover:bg-white/10 hover:text-white/75"
        >
          <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} />
        </button>
        {open ? (
          <div
            role="menu"
            className="absolute bottom-full right-0 z-[60] mb-1 min-w-[160px] overflow-hidden rounded-lg border border-white/[0.1] bg-[#161616] py-1 shadow-[0_8px_32px_rgba(0,0,0,0.55)]"
          >
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2.5 text-left text-[11px] text-white/80 transition hover:bg-white/[0.06] hover:text-white"
              style={{ fontFamily: "'DM Mono', monospace" }}
              onClick={() => {
                setOpen(false);
                signOut();
              }}
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProfileMenu;
