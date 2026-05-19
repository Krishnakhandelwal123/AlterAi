import { useCallback, useEffect, useState } from 'react';
import { shareApi } from '../api/shareApi.js';

export const useShare = (cloneId) => {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async ({ silent = false } = {}) => {
    if (!cloneId) {
      setData(null);
      setAnalytics(null);
      setLoading(false);
      return;
    }

    try {
      if (!silent) setLoading(true);
      setError(null);
      const [shareData, analyticsData] = await Promise.all([
        shareApi.getShareData(cloneId),
        shareApi.getAnalytics(cloneId)
      ]);

      if (!shareData.success) throw new Error(shareData.error || 'Failed to load share data');
      if (!analyticsData.success) throw new Error(analyticsData.error || 'Failed to load share analytics');

      setData(shareData);
      setAnalytics(analyticsData);
    } catch (e) {
      setError(e.message || 'Failed to load share data');
    } finally {
      setLoading(false);
    }
  }, [cloneId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const refresh = () => fetchData({ silent: true });
    const intervalId = window.setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
    };
  }, [fetchData]);

  const toggleVisibility = async (is_public) => {
    setToggling(true);
    try {
      const result = await shareApi.toggleVisibility(cloneId, is_public);
      if (result.success) {
        setData((prev) => ({
          ...prev,
          clone: {
            ...prev?.clone,
            ...result.clone
          }
        }));
      }
      return result;
    } finally {
      setToggling(false);
    }
  };

  const trackShare = (platform) => {
    shareApi.trackShare(cloneId, platform);
    setAnalytics((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        totalShares: prev.totalShares + 1,
        sharesByPlatform: {
          ...prev.sharesByPlatform,
          [platform]: (prev.sharesByPlatform?.[platform] || 0) + 1
        }
      };
    });
  };

  return {
    data,
    analytics,
    loading,
    toggling,
    error,
    toggleVisibility,
    trackShare,
    refetch: fetchData
  };
};
