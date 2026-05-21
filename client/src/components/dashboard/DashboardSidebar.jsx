import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Search } from 'lucide-react';
import { dashboardNavSections } from './navConfig';
import ProfileMenu from './ProfileMenu';
import { useClones } from '../../hooks/useClones.js';
import { useBillingSubscription } from '../../hooks/useBillingSubscription.js';

const linkBase =
  'group flex items-center gap-3 px-5 py-2.5 font-dashboard-nav text-[11px] tracking-wide text-white/40 transition-colors border-l-2 border-transparent';

const DashboardSidebar = () => {
  const { totals } = useClones();
  const { currentPlan, limits } = useBillingSubscription();
  const usedMessages = totals.currentMonthMessages || 0;
  const messageLimit = limits?.maxCreatorMessagesPerMonth || 200;
  const usagePercent = Math.min(100, Math.round((usedMessages / messageLimit) * 100));
  const planLabel = `${currentPlan.charAt(0).toUpperCase()}${currentPlan.slice(1)} plan`;
  const upgradeTarget = currentPlan === 'creator' ? '/dashboard/billing' : '/dashboard/billing#plans';
  const upgradeLabel = currentPlan === 'free' ? 'Upgrade to Pro ->' : currentPlan === 'pro' ? 'Upgrade to Creator ->' : 'Manage plan ->';

  return (
  <aside className="dashboard-sidebar fixed left-0 top-0 z-20 hidden h-screen w-[240px] flex-col border-r border-white/[0.05] bg-[#0A0A0A] md:flex">
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-5 pb-2 pt-6">
        <Link to="/dashboard" className="inline-flex items-baseline gap-1.5 text-inherit no-underline">
          <span
            className="text-[18px] italic font-light tracking-[0.3em] text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            ALTER
          </span>
          <span className="text-[6px] translate-y-[-2px] leading-none text-[rgba(0,212,255,0.88)]" aria-hidden>
            .
          </span>
        </Link>
        <label className="mt-5 block">
          <span className="sr-only">Search</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" strokeWidth={1.75} />
            <input
              type="search"
              placeholder="Search..."
              className="dashboard-input-search w-full rounded-lg border border-white/[0.07] bg-white/[0.04] py-2 pl-9 pr-3 text-[10px] text-white/70 placeholder:text-white/25 outline-none focus:border-[rgba(0,212,255,0.35)]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            />
          </div>
        </label>
      </div>

      <nav
        className="dashboard-sidebar-nav min-h-0 flex-1 overflow-x-hidden overflow-y-auto py-2 pb-4"
        data-lenis-prevent
        onWheelCapture={(e) => {
          const el = e.currentTarget;
          if (el.scrollHeight <= el.clientHeight) return;
          const max = Math.max(0, el.scrollHeight - el.clientHeight);
          const { scrollTop, deltaY } = el;
          const goingUp = deltaY < 0;
          const goingDown = deltaY > 0;
          if ((goingUp && scrollTop > 0) || (goingDown && scrollTop < max)) {
            e.stopPropagation();
          }
        }}
      >
        {dashboardNavSections.map((section) => (
          <div key={section.id} className="mb-1">
            <p
              className="px-5 pb-2 pt-4 text-[8px] uppercase tracking-[0.15em] text-white/20"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to + item.label}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => {
                      if (item.createStyle) {
                        return [
                          'mx-3 my-1 flex items-center gap-3 rounded-lg border border-dashed border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.06)] px-4 py-2.5 text-[11px] text-[rgba(0,212,255,0.75)] transition-all hover:border-[rgba(0,212,255,0.45)] hover:bg-[rgba(0,212,255,0.1)]',
                          isActive ? 'border-solid border-[rgba(0,212,255,0.5)] bg-[rgba(0,212,255,0.12)]' : ''
                        ].join(' ');
                      }
                      return [
                        linkBase,
                        isActive
                          ? 'border-[rgba(0,212,255,0.88)] bg-[rgba(0,212,255,0.07)] text-[rgba(0,212,255,0.88)] [&_svg]:text-[rgba(0,212,255,0.88)]'
                          : 'hover:bg-white/[0.04] hover:text-white/70 [&_svg]:text-white/30 group-hover:[&_svg]:text-white/55'
                      ].join(' ');
                    }}
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        item.createStyle ? 'bg-[rgba(0,212,255,0.15)] text-[rgba(0,212,255,0.88)]' : ''
                      }`}
                    >
                      <item.icon className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto shrink-0 space-y-3 border-t border-white/[0.05] px-5 py-4">
        <div className="rounded-[10px] border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.05)] p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[8px] uppercase tracking-[0.12em] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
              {planLabel}
            </span>
            <span className="text-[8px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
              {usedMessages.toLocaleString()}/{messageLimit.toLocaleString()} monthly
            </span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-[rgba(0,212,255,0.88)] transition-all duration-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <Link
            to={upgradeTarget}
            className="mt-2 block w-full text-right text-[9px] text-[#C084FC] hover:text-[#C084FC]/90"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {currentPlan === 'creator' ? 'Manage ->' : 'Upgrade ->'}
          </Link>
        </div>
        <Link
          to={upgradeTarget}
          className="dashboard-btn-pro flex h-10 w-full items-center justify-center rounded-[10px] text-[11px] font-normal tracking-wide text-white transition hover:brightness-110"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {upgradeLabel}
        </Link>

        <ProfileMenu variant="sidebar" />
      </div>
    </div>
  </aside>
  );
};

export default DashboardSidebar;
