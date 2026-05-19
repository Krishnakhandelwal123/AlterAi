import React from 'react';
import CountUp from './CountUp.jsx';
import VisibilityToggle from './VisibilityToggle.jsx';

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name[0] || 'A').toUpperCase();
};

const CloneHeroCard = ({ data, analytics, toggling, onToggle, trainingReady, visibilityError }) => {
  const { clone, stats, displayUrl } = data;
  const isLive = clone?.is_public || clone?.status === 'live';
  const avatarColor = clone?.avatar_color || '#00D4FF';
  const ownerAvatar = clone?.owner_avatar || '';

  return (
    <section className="share-hero-card share-stagger-1">
      <div className="share-orb share-orb-one" />
      <div className="share-orb share-orb-two" />
      <div className="share-scan-line" />

      <div className="share-hero-left">
        <div className="share-identity-row">
          <div
            className="share-avatar-lg"
            style={{ background: avatarColor, boxShadow: `0 0 24px ${avatarColor}40` }}
          >
            {ownerAvatar ? (
              <img
                src={ownerAvatar}
                alt=""
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              getInitials(clone?.name)
            )}
          </div>
          <div className="share-identity-copy">
            <div className="share-name-row">
              <h2>{clone?.name}</h2>
              <span className={`share-status-pill ${isLive ? 'is-live' : ''}`}>
                {isLive ? '● LIVE' : '○ DRAFT'}
              </span>
            </div>
            <p>{displayUrl}</p>
          </div>
        </div>

        {clone?.bio && <p className="share-bio">{clone.bio}</p>}

        <div className="share-stats-strip">
          <div>
            <strong><CountUp value={stats?.totalConversations || 0} /></strong>
            <span>CONVERSATIONS</span>
          </div>
          <i />
          <div>
            <strong><CountUp value={stats?.totalVisitors || 0} /></strong>
            <span>VISITORS</span>
          </div>
          <i />
          <div>
            <strong className="is-cyan"><CountUp value={analytics?.totalShares || 0} /></strong>
            <span>TOTAL SHARES</span>
          </div>
        </div>
      </div>

      <VisibilityToggle
        clone={clone}
        toggling={toggling}
        onToggle={onToggle}
        trainingReady={trainingReady}
        error={visibilityError}
      />
    </section>
  );
};

export default CloneHeroCard;
