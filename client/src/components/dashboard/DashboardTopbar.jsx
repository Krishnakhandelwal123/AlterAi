import React, { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { topBarMeta } from './navConfig';
import ProfileMenu from './ProfileMenu';
import NotificationPanel from './NotificationPanel';
import { useNotifications } from '../../hooks/useNotifications';

const DashboardTopbar = () => {
  const { pathname } = useLocation();
  const { title, crumb } = topBarMeta(pathname);
  const bellRef = useRef(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
    remove
  } = useNotifications({ enabled: true, poll: true });

  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

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
      <div className="relative flex items-center gap-2">
        <button
          ref={bellRef}
          type="button"
          className={`notification-bell-btn${panelOpen ? ' is-open' : ''}`}
          aria-label={unreadCount ? `${unreadCount} unread notifications` : 'Notifications'}
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen((open) => !open)}
        >
          <Bell className="h-5 w-5" strokeWidth={1.5} />
          {unreadCount > 0 ? (
            <span className="notification-bell-badge">{displayCount}</span>
          ) : null}
        </button>

        <NotificationPanel
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          anchorRef={bellRef}
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          error={error}
          onRefresh={refresh}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onRemove={remove}
        />

        <div className="md:hidden">
          <ProfileMenu variant="compact" />
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
