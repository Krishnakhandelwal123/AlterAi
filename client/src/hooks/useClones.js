import { useState, useEffect, useCallback, useMemo } from 'react';
import { cloneApi } from '../api/cloneApi.js';

export const useClones = () => {
  const [allClones, setAllClones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchClones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Always fetch ALL clones so counts are accurate
      const data = await cloneApi.list('all');
      if (data.success) {
        setAllClones(data.clones || []);
      } else {
        setError(data.error || 'Failed to load clones');
      }
    } catch (e) {
      setError(e.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClones();
  }, [fetchClones]);

  // Filter clones client-side based on active filter
  const clones = useMemo(() => {
    if (filter === 'all') return allClones;
    return allClones.filter((c) => c.status === filter);
  }, [allClones, filter]);

  const createClone = async (formData) => {
    const result = await cloneApi.create(formData);
    if (result.success) {
      // Optimistically prepend the new clone
      setAllClones((prev) => [result.clone, ...prev]);
    }
    return result;
  };

  const deleteClone = async (cloneId) => {
    const result = await cloneApi.delete(cloneId);
    if (result.success) {
      setAllClones((prev) => prev.filter((c) => c.id !== cloneId));
    }
    return result;
  };

  const publishClone = async (cloneId, publish) => {
    const result = await cloneApi.publish(cloneId, publish);
    if (result.success) {
      setAllClones((prev) =>
        prev.map((c) => (c.id === cloneId ? result.clone : c))
      );
    }
    return result;
  };

  // Counts always calculated from ALL clones, not the filtered subset
  const counts = allClones.reduce(
    (acc, c) => {
      acc.all++;
      if (c.status === 'live') acc.live++;
      else if (c.status === 'draft') acc.draft++;
      else if (c.status === 'training') acc.training++;
      return acc;
    },
    { all: 0, live: 0, draft: 0, training: 0 }
  );

  return {
    clones,
    loading,
    error,
    filter,
    setFilter,
    counts,
    refetch: fetchClones,
    createClone,
    deleteClone,
    publishClone
  };
};
