import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { topBarMeta } from './navConfig';
import ProfileMenu from './ProfileMenu';

const DashboardTopbar = () => {
  const { pathname } = useLocation();
  const { title, crumb } = topBarMeta(pathname);

  return (
    <header className="dashboard-topbar sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.05] bg-[rgba(8,8,8,0.95)] px-6 backdrop-blur-xl md:px-8">
      <div>
        <h1 className="text-[20px] italic font-light leading-tight text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          {title}
        </h1>
        <p className="mt-0.5 text-[9px] tracking-wide text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
          {crumb}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="relative rounded-lg p-2 text-white/40 transition hover:bg-white/[0.06] hover:text-white/70" aria-label="Notifications">
          <Bell className="h-5 w-5" strokeWidth={1.5} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[rgba(0,212,255,0.88)] ring-2 ring-[#080808]" />
        </button>
        <div className="md:hidden">
          <ProfileMenu variant="compact" />
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
