import React from 'react';

const platformMeta = {
  twitter: { label: 'Twitter / X', color: 'rgba(255,255,255,0.65)' },
  linkedin: { label: 'LinkedIn', color: '#0077B5' },
  whatsapp: { label: 'WhatsApp', color: '#25D366' },
  copy: { label: 'Copy Link', color: 'rgba(0,212,255,0.88)' },
  qr: { label: 'QR Code', color: '#7C3AED' }
};

const ShareAnalytics = ({ analytics }) => {
  const totalShares = analytics?.totalShares || 0;
  const sharesByPlatform = analytics?.sharesByPlatform || {};
  const maxPlatform = Math.max(1, ...Object.values(sharesByPlatform));
  const maxDaily = Math.max(1, ...(analytics?.last7Days || []).map((day) => day.shares));

  return (
    <section className="share-section">
      <p className="share-label">SHARE PERFORMANCE</p>
      {totalShares === 0 ? (
        <div className="share-empty-analytics">Share your clone to see analytics here</div>
      ) : (
        <div className="share-analytics-grid">
          <div className="share-platform-breakdown">
            {Object.entries(platformMeta).map(([key, meta]) => {
              const count = sharesByPlatform[key] || 0;
              return (
                <div className="share-breakdown-row" key={key}>
                  <span className="share-mini-dot" style={{ background: meta.color }} />
                  <strong>{meta.label}</strong>
                  <div><i style={{ width: `${(count / maxPlatform) * 100}%`, background: meta.color }} /></div>
                  <em>{count}</em>
                </div>
              );
            })}
          </div>
          <div className="share-daily-chart">
            <h4>Daily shares (7 days)</h4>
            <div className="share-bars">
              {(analytics?.last7Days || []).map((day) => (
                <div className="share-bar-col" key={day.date} title={`${day.date}: ${day.shares}`}>
                  <span style={{ height: `${Math.max(6, (day.shares / maxDaily) * 100)}%` }} />
                  <small>{day.label}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ShareAnalytics;
