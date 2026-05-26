import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationApi } from '../api/notificationApi.js';

const POLL_MS = 60000;

export const useNotifications = ({ enabled = true, poll = true } = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const applyPayload = useCallback((payload) => {
    if (!payload?.success) {
      setError(payload?.error || 'Could not load notifications');
      return false;
    }
    setNotifications(payload.notifications || []);
    setUnreadCount(payload.unreadCount ?? 0);
    setError(null);
    return true;
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    const result = await notificationApi.list({ limit: 40 });
    if (mountedRef.current) {
      applyPayload(result);
      setLoading(false);
    }
  }, [applyPayload, enabled]);

  const refreshCount = useCallback(async () => {
    if (!enabled) return;
    const result = await notificationApi.unreadCount();
    if (mountedRef.current && result.success) {
      setUnreadCount(result.unreadCount ?? 0);
    }
  }, [enabled]);

  useEffect(() => {
    mountedRef.current = true;
    if (!enabled) return undefined;

    refresh();

    if (!poll) return () => {
      mountedRef.current = false;
    };

    const interval = setInterval(refreshCount, POLL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [enabled, poll, refresh, refreshCount]);

  const markRead = useCallback(async (id) => {
    const result = await notificationApi.markRead(id);
    if (!result.success) return result;

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read_at: new Date().toISOString() } : item
      )
    );
    setUnreadCount(result.unreadCount ?? 0);
    return result;
  }, []);

  const markAllRead = useCallback(async () => {
    const result = await notificationApi.markAllRead();
    if (!result.success) return result;

    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() }))
    );
    setUnreadCount(0);
    return result;
  }, []);

  const remove = useCallback(async (id) => {
    const result = await notificationApi.remove(id);
    if (!result.success) return result;

    setNotifications((prev) => prev.filter((item) => item.id !== id));
    setUnreadCount(result.unreadCount ?? 0);
    return result;
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
    remove
  };
};
