import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { supabase } from '../../lib/supabase.js';
import { useClones } from '../../hooks/useClones.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const emptyAnalytics = {
  totalConversations: 0,
  messagesToday: 0,
  uniqueVisitorsThisWeek: 0,
  mostAskedQuestion: null,
  topQuestions: [],
  dailyStats: []
};

const getHeaders = async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token}`
  };
};

const formatNumber = (value) => Number(value || 0).toLocaleString();

const Analytics = () => {
  const { clones, loading: clonesLoading, error: clonesError } = useClones();
  const [selectedCloneId, setSelectedCloneId] = useState('');
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedCloneId && clones.length > 0) {
      setSelectedCloneId(clones[0].id);
    }
  }, [clones, selectedCloneId]);

  useEffect(() => {
    if (!selectedCloneId) {
      setAnalytics(emptyAnalytics);
      return;
    }

    let cancelled = false;

    const fetchAnalytics = async ({ silent = false } = {}) => {
      try {
        if (!silent) setLoading(true);
        setError('');
        const res = await fetch(`${API_URL}/api/analytics/${selectedCloneId}`, {
          headers: await getHeaders()
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.error || 'Failed to fetch analytics');
        if (!cancelled) {
          setAnalytics(payload.analytics || emptyAnalytics);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to fetch analytics');
          setAnalytics(emptyAnalytics);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAnalytics();
    const refresh = () => fetchAnalytics({ silent: true });
    const intervalId = window.setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
    };
  }, [selectedCloneId]);

  const selectedClone = useMemo(
    () => clones.find((clone) => clone.id === selectedCloneId),
    [clones, selectedCloneId]
  );

  const cards = [
    {
      label: 'Total conversations',
      value: formatNumber(analytics.totalConversations)
    },
    {
      label: 'Messages today',
      value: formatNumber(analytics.messagesToday)
    },
    {
      label: 'Unique visitors this week',
      value: formatNumber(analytics.uniqueVisitorsThisWeek)
    },
    {
      label: 'Most asked questions',
      value: analytics.mostAskedQuestion ? formatNumber(analytics.mostAskedQuestion.count) : '0',
      detail: analytics.mostAskedQuestion?.question || 'No questions yet'
    }
  ];

  const chartData = analytics.dailyStats?.length ? analytics.dailyStats : [];
  const hasChartData = chartData.some((item) => item.conversations > 0);

  return (
    <div className="mx-auto max-w-[1100px] space-y-8" data-scroll-section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
            Performance
          </p>
          <h2 className="mt-1 text-[30px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            {selectedClone?.name || 'Analytics'}
          </h2>
        </div>

        <select
          value={selectedCloneId}
          onChange={(event) => setSelectedCloneId(event.target.value)}
          disabled={clonesLoading || clones.length === 0}
          className="h-10 min-w-[180px] rounded-lg border border-white/10 bg-[#0D0D0D] px-3 text-[11px] text-white/70 outline-none focus:border-[rgba(0,212,255,0.35)]"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {clones.length === 0 ? (
            <option value="">No clones yet</option>
          ) : (
            clones.map((clone) => (
              <option key={clone.id} value={clone.id}>
                {clone.name}
              </option>
            ))
          )}
        </select>
      </div>

      {(clonesError || error) && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-[12px] text-red-200/70">
          {clonesError || error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-5">
            <p className="text-[9px] uppercase tracking-wide text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
              {card.label}
            </p>
            <p className="mt-3 text-[28px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              {loading ? '-' : card.value}
            </p>
            {card.detail && (
              <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-white/35" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {card.detail}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-6">
        <h3 className="text-[18px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          Conversations per day
        </h3>
        <p className="mt-1 text-[10px] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
          Last 7 days
        </p>
        <div className="mt-8 h-[260px] rounded-lg border border-white/[0.04] bg-[#080808] px-2 py-4">
          {hasChartData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'DM Mono, monospace' }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'DM Mono, monospace' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0,212,255,0.05)' }}
                  contentStyle={{
                    background: '#0D0D0D',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 12
                  }}
                />
                <Bar dataKey="conversations" fill="rgba(0,212,255,0.55)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-[12px] text-white/35" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Data appears once this clone starts receiving conversations.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-6">
        <h4 className="text-[14px] text-white/90" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Top questions asked
        </h4>
        <ul className="mt-4 space-y-3 text-[12px]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {analytics.topQuestions?.length ? (
            analytics.topQuestions.map((item) => (
              <li key={item.question} className="flex items-start justify-between gap-4 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-3">
                <span className="text-white/55">{item.question}</span>
                <span className="shrink-0 text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {item.count}
                </span>
              </li>
            ))
          ) : (
            <li className="text-white/35">No questions yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Analytics;
