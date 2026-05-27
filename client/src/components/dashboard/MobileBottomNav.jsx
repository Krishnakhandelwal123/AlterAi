import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BarChart3, LayoutDashboard, Layers, Menu, Plus, X } from 'lucide-react';
import { dashboardNavSections } from './navConfig';

const primaryItems = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/dashboard/clones', label: 'Clones', icon: Layers, end: false },
  { to: '/dashboard/create', label: 'Create', icon: Plus, end: false, accent: true },
  { to: '/dashboard/analytics', label: 'Stats', icon: BarChart3, end: false }
];

const isRouteActive = (pathname, item) => {
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
};

const MobileBottomNav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const isMoreActive = useMemo(
    () =>
      dashboardNavSections.some((section) =>
        section.items.some(
          (item) =>
            !primaryItems.some((primary) => primary.to === item.to) &&
            isRouteActive(pathname, item)
        )
      ),
    [pathname]
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/55 md:hidden"
            aria-label="Close mobile menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="dashboard-mobile-more-menu"
            className="fixed left-3 right-3 z-50 flex flex-col overflow-hidden rounded-xl border border-white/[0.09] bg-[#0A0A0A] shadow-[0_18px_60px_rgba(0,0,0,0.65)] md:hidden"
            style={{
              bottom: 'calc(76px + env(safe-area-inset-bottom))',
              maxHeight: 'min(520px, calc(100dvh - 120px))'
            }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div>
                <p
                  className="text-[8px] uppercase tracking-[0.16em] text-white/25"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Dashboard
                </p>
                <h2
                  className="mt-0.5 text-[17px] italic font-light text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  All Pages
                </h2>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/75"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-2" data-lenis-prevent>
              {dashboardNavSections.map((section) => (
                <div key={section.id} className="pt-2">
                  <p
                    className="px-2 pb-2 text-[8px] uppercase tracking-[0.15em] text-white/20"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {section.label}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.to + item.label}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          [
                            'flex min-h-12 items-center gap-2 rounded-lg border px-3 py-2 text-[10px] transition-colors',
                            item.createStyle
                              ? 'border-dashed border-[rgba(0,212,255,0.24)] bg-[rgba(0,212,255,0.06)] text-[rgba(0,212,255,0.72)]'
                              : 'border-white/[0.06] bg-white/[0.025] text-white/45 hover:bg-white/[0.05] hover:text-white/75',
                            isActive
                              ? 'border-[rgba(0,212,255,0.45)] bg-[rgba(0,212,255,0.1)] text-[rgba(0,212,255,0.88)]'
                              : ''
                          ].join(' ')
                        }
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.035]">
                          <item.icon className="h-4 w-4" strokeWidth={1.5} />
                        </span>
                        <span className="min-w-0 leading-tight">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <nav
        className="dashboard-mobile-nav fixed bottom-0 left-0 right-0 z-[60] flex border-t border-white/[0.07] bg-[#0A0A0A] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
        aria-label="Primary"
      >
        {primaryItems.map((item) => (
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
        <button
          type="button"
          className={[
            'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[9px] transition-colors',
            menuOpen || isMoreActive ? 'text-[rgba(0,212,255,0.88)]' : 'text-white/25 hover:text-white/45'
          ].join(' ')}
          style={{ fontFamily: "'DM Mono', monospace" }}
          aria-expanded={menuOpen}
          aria-controls="dashboard-mobile-more-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span
            className={[
              'flex h-9 w-9 items-center justify-center rounded-full border transition-colors',
              menuOpen || isMoreActive ? 'border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.08)]' : 'border-transparent'
            ].join(' ')}
          >
            <Menu className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </span>
          More
        </button>
      </nav>
    </>
  );
};

export default MobileBottomNav;
