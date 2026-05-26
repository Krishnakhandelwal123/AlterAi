import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Bell,
  Check,
  CreditCard,
  Globe,
  Loader2,
  MessageCircle,
  Mic,
  Sparkles,
  Trash2,
  X
} from 'lucide-react';
import { formatNotificationTime, NOTIFICATION_TYPE_META } from '../../constants/notificationPrefs.js';

const iconMap = {
  message: MessageCircle,
  sparkles: Sparkles,
  alert: AlertCircle,
  globe: Globe,
  card: CreditCard,
  mic: Mic
};

const NotificationPanel = ({
  open,
  onClose,
  anchorRef,
  notifications,
  unreadCount,
  loading,
  error,
  onRefresh,
  onMarkRead,
  onMarkAllRead,
  onRemove
}) => {
  const panelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;

    const handlePointer = (event) => {
      const anchor = anchorRef?.current;
      if (
        panelRef.current?.contains(event.target) ||
        anchor?.contains(event.target)
      ) {
        return;
      }
      onClose();
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose, anchorRef]);

  useEffect(() => {
    if (open) onRefresh();
  }, [open, onRefresh]);

  const handleOpen = async (item) => {
    if (!item.read_at) await onMarkRead(item.id);
    if (item.link) {
      if (item.link.startsWith('http')) {
        const url = new URL(item.link);
        navigate(url.pathname + url.search + url.hash);
      } else {
        navigate(item.link);
      }
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div ref={panelRef} className="notification-panel" role="dialog" aria-label="Notifications">
      <div className="notification-panel-head">
        <div>
          <p className="notification-panel-eyebrow">Inbox</p>
          <h3>Notifications</h3>
        </div>
        <div className="notification-panel-actions">
          {unreadCount > 0 ? (
            <button type="button" className="notification-panel-text-btn" onClick={onMarkAllRead}>
              Mark all read
            </button>
          ) : null}
          <button type="button" className="notification-panel-icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="notification-panel-body scrollbar-hidden">
        {loading && notifications.length === 0 ? (
          <div className="notification-panel-state">
            <Loader2 className="notification-panel-spin" size={20} />
            <span>Loading alerts…</span>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="notification-panel-state is-error">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button type="button" onClick={onRefresh}>
              Retry
            </button>
          </div>
        ) : null}

        {!loading && !error && notifications.length === 0 ? (
          <div className="notification-panel-state">
            <Bell size={22} strokeWidth={1.2} />
            <strong>All caught up</strong>
            <span>New chats, training, and billing updates will appear here.</span>
          </div>
        ) : null}

        {notifications.map((item) => {
          const meta = NOTIFICATION_TYPE_META[item.type] || NOTIFICATION_TYPE_META.welcome;
          const Icon = iconMap[meta.icon] || Bell;
          const isUnread = !item.read_at;

          return (
            <article
              key={item.id}
              className={`notification-item${isUnread ? ' is-unread' : ''}`}
            >
              <button
                type="button"
                className="notification-item-main"
                onClick={() => handleOpen(item)}
              >
                <span
                  className="notification-item-icon"
                  style={{ color: meta.accent, borderColor: `${meta.accent}33` }}
                >
                  <Icon size={15} />
                </span>
                <span className="notification-item-copy">
                  <strong>{item.title}</strong>
                  {item.body ? <p>{item.body}</p> : null}
                  <small>{formatNotificationTime(item.created_at)}</small>
                </span>
              </button>
              <div className="notification-item-tools">
                {isUnread ? (
                  <button
                    type="button"
                    className="notification-panel-icon-btn"
                    aria-label="Mark as read"
                    onClick={() => onMarkRead(item.id)}
                  >
                    <Check size={14} />
                  </button>
                ) : null}
                <button
                  type="button"
                  className="notification-panel-icon-btn"
                  aria-label="Delete notification"
                  onClick={() => onRemove(item.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <footer className="notification-panel-foot">
        <button
          type="button"
          onClick={() => {
            navigate('/dashboard/settings');
            onClose();
          }}
        >
          Notification settings
        </button>
      </footer>
    </div>
  );
};

export default NotificationPanel;
