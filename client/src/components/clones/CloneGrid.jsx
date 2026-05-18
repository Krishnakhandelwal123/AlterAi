import React from 'react';
import CloneCard from './CloneCard.jsx';

const SkeletonCard = () => (
  <div
    style={{
      background: '#0D0D0D',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 16,
      padding: 24,
      overflow: 'hidden'
    }}
  >
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
      <div className="skeleton-shimmer" style={{ width: 48, height: 48, borderRadius: '50%' }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton-shimmer" style={{ height: 16, width: '60%', borderRadius: 6, marginBottom: 8 }} />
        <div className="skeleton-shimmer" style={{ height: 10, width: '40%', borderRadius: 4 }} />
      </div>
    </div>
    <div className="skeleton-shimmer" style={{ height: 1, marginBottom: 16 }} />
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-shimmer" style={{ flex: 1, height: 52, borderRadius: 10 }} />
      ))}
    </div>
    <div className="skeleton-shimmer" style={{ height: 4, borderRadius: 999, marginBottom: 10 }} />
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-shimmer" style={{ flex: 1, height: 34, borderRadius: 8 }} />
      ))}
    </div>
  </div>
);

const CloneGrid = ({
  clones,
  loading,
  error,
  filter,
  onDelete,
  onPublish,
  onEdit,
  onShare,
  onRetry
}) => {
  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16
        }}
      >
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          background: '#0D0D0D',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 16,
          gap: 12
        }}
      >
        <span style={{ fontSize: 28 }}>⚠️</span>
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            color: '#EF4444',
            textAlign: 'center'
          }}
        >
          Could not load clones. {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10,
            padding: '8px 20px',
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: '#EF4444',
            cursor: 'pointer',
            marginTop: 4
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (clones.length === 0) {
    if (filter !== 'all') {
      return (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)'
          }}
        >
          No {filter} clones yet.
        </div>
      );
    }
    return null; // Let parent render the full empty state
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16
      }}
    >
      {clones.map((clone) => (
        <div
          key={clone.id}
          className="clone-card-appear"
        >
          <CloneCard
            clone={clone}
            onDelete={onDelete}
            onPublish={onPublish}
            onEdit={onEdit}
            onShare={onShare}
          />
        </div>
      ))}
    </div>
  );
};

export default CloneGrid;
