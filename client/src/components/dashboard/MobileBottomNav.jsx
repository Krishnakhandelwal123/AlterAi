import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Layers, Plus, BarChart3, Settings } from 'lucide-react';

const items = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/dashboard/clones', label: 'Clones', icon: Layers, end: false },
  { to: '/dashboard/create', label: 'Create', icon: Plus, end: false, accent: true },
  { to: '/dashboard/analytics', label: 'Stats', icon: BarChart3, end: false },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, end: false }
];

const MobileBottomNav = () => (
  <nav
    className="dashboard-mobile-nav fixed bottom-0 left-0 right-0 z-40 flex border-t border-white/[0.07] bg-[#0A0A0A] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
    aria-label="Primary"
  >
    {items.map((item) => (
      <NavLink
        key={item.to + item.label}
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          [
            'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[9px] transition-colors',
            item.accent ? 'text-[rgba(0,212,255,0.55)]' : '',
            isActive ? 'text-[rgba(0,212,255,0.88)]' : 'text-white/25 hover:text-white/45'
          ].join(' ')
        }
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {({ isActive }) => (
          <>
            <span
              className={[
                'flex h-9 w-9 items-center justify-center rounded-full border transition-colors',
                item.accent ? 'border-dashed border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.06)]' : '',
                isActive && !item.accent ? 'border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.08)]' : '',
                isActive && item.accent ? 'border-[rgba(0,212,255,0.45)] bg-[rgba(0,212,255,0.12)]' : 'border-transparent'
              ].join(' ')}
            >
              <item.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </span>
            {item.label}
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

export default MobileBottomNav;
