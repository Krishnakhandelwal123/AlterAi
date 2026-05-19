import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Check, Copy, ExternalLink, Globe2, Link as LinkIcon, Loader2, Lock, MessageCircle } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useClones } from '../hooks/useClones.js';
import { useShare } from '../hooks/useShare.js';

const shareTargets = [
  { key: 'twitter', label: 'X' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle }
];

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (name[0] || 'A').toUpperCase();
};

const SharePage = () => {
  const { cloneId: routeCloneId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { allClones, loading: clonesLoading } = useClones();
  const queryCloneId = searchParams.get('clone');
  const initialCloneId = routeCloneId || queryCloneId || '';
  const [selectedCloneId, setSelectedCloneId] = useState(initialCloneId);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const next = routeCloneId || queryCloneId || '';
    if (next && next !== selectedCloneId) setSelectedCloneId(next);
  }, [queryCloneId, routeCloneId, selectedCloneId]);

  useEffect(() => {
    if (!selectedCloneId && allClones.length > 0) {
      setSelectedCloneId(allClones[0].id);
    }
  }, [allClones, selectedCloneId]);

  const { data, loading, toggling, error, toggleVisibility, trackShare } = useShare(selectedCloneId);

  const selectedClone = useMemo(
    () => allClones.find((clone) => clone.id === selectedCloneId),
    [allClones, selectedCloneId]
  );

  const clone = data?.clone;
  const isLive = clone?.is_public || clone?.status === 'live';
  const trainingReady = (selectedClone?.trainingStats?.trainedSources || 0) > 0;
  const avatarColor = clone?.avatar_color || selectedClone?.avatar_color || '#00D4FF';
  const ownerAvatar = clone?.owner_avatar || selectedClone?.owner_avatar || '';

  const handleSelectClone = (cloneId) => {
    setSelectedCloneId(cloneId);
    if (routeCloneId) navigate(`/dashboard/share/${cloneId}`);
    else setSearchParams({ clone: cloneId });
  };

  const handleToggle = async () => {
    const nextVisibility = !isLive;
    const result = await toggleVisibility(nextVisibility);

    if (result?.success) {
      toast.success(nextVisibility ? 'Clone is public' : 'Clone is private');
      return;
    }

    toast.error(result?.error || 'Could not update visibility');
  };

  const copyLink = async () => {
    if (!isLive) {
      toast('Make clone public first');
      return;
    }

    await navigator.clipboard.writeText(data.shareUrl);
    setCopied(true);
    trackShare('copy');
    toast.success('Link copied');
    window.setTimeout(() => setCopied(false), 1800);
  };

  const openShare = (platform) => {
    if (!isLive) {
      toast('Make clone public first');
      return;
    }

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Chat with my AI clone: ${data.displayUrl}`)}&url=${encodeURIComponent(data.shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`Chat with my AI clone: ${data.displayUrl}`)}`
    };

    window.open(urls[platform], '_blank', 'noopener,noreferrer');
    trackShare(platform);
  };

  if (clonesLoading || loading) {
    return (
      <>
        <div className="share-page">
          <div className="share-skeleton share-skeleton-title" />
          <div className="share-skeleton share-skeleton-card" />
          <div className="share-skeleton share-skeleton-card is-short" />
        </div>
        <ShareStyles />
      </>
    );
  }

  if (!selectedCloneId || allClones.length === 0) {
    return (
      <>
        <div className="share-page">
          <div className="share-empty">Create a clone first to share it.</div>
        </div>
        <ShareStyles />
      </>
    );
  }

  if (error || !data?.success) {
    return (
      <>
        <div className="share-page">
          <div className="share-empty">{error || 'Could not load share data'}</div>
        </div>
        <ShareStyles />
      </>
    );
  }

  return (
    <>
      <main className="share-page" data-scroll-section>
        <header className="share-header">
          <div>
            <p className="share-eyebrow">Share</p>
            <h1>Your clone link</h1>
          </div>

          {allClones.length > 1 && (
            <label className="share-clone-select">
              <span style={{ background: selectedClone?.avatar_color || avatarColor }}>
                {getInitials(selectedClone?.name)}
              </span>
              <select value={selectedCloneId} onChange={(event) => handleSelectClone(event.target.value)}>
                {allClones.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
          )}
        </header>

        <section className="share-panel">
          <div className="share-identity">
            <div className="share-avatar" style={{ background: avatarColor }}>
              {ownerAvatar ? <img src={ownerAvatar} alt="" /> : getInitials(clone?.name)}
            </div>
            <div>
              <h2>{clone?.name}</h2>
              <p>{clone?.bio || 'Share this clone with anyone who needs it.'}</p>
            </div>
          </div>

          <div className="share-state">
            <span className={`share-state-dot ${isLive ? 'is-live' : ''}`} />
            <div>
              <strong>{isLive ? 'Public' : 'Private'}</strong>
              <span>{isLive ? 'Anyone with the link can chat.' : 'Only you can access this clone.'}</span>
            </div>
            <button type="button" onClick={handleToggle} disabled={toggling}>
              {toggling ? <Loader2 className="share-spin" size={14} /> : isLive ? <Lock size={14} /> : <Globe2 size={14} />}
              {isLive ? 'Make private' : 'Make public'}
            </button>
          </div>

          {!trainingReady && !isLive && (
            <div className="share-note">
              Add training data before publishing. <Link to={`/dashboard/training?cloneId=${clone?.id}`}>Go to training</Link>
            </div>
          )}
        </section>

        <section className={`share-link-panel ${!isLive ? 'is-muted' : ''}`}>
          <div className="share-link">
            {isLive ? <LinkIcon size={16} /> : <Lock size={16} />}
            <span>{data.displayUrl}</span>
          </div>
          <div className="share-actions">
            <button type="button" onClick={copyLink} disabled={!isLive}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <a href={isLive ? data.shareUrl : undefined} target="_blank" rel="noreferrer" aria-disabled={!isLive}>
              <ExternalLink size={15} />
              Open
            </a>
          </div>
        </section>

        <section className="share-platforms">
          {shareTargets.map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" onClick={() => openShare(key)} disabled={!isLive}>
              {Icon ? <Icon size={15} /> : null}
              {label}
            </button>
          ))}
        </section>
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2400,
          style: {
            background: '#111111',
            color: '#F0EEF8',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            fontFamily: 'DM Mono, monospace',
            fontSize: 11
          }
        }}
      />
      <ShareStyles />
    </>
  );
};

const ShareStyles = () => (
  <style>{`
    .share-page {
      width: min(760px, 100%);
      margin: 0 auto;
      padding: 28px 0 72px;
      color: #F0EEF8;
    }

    .share-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 20px;
    }

    .share-eyebrow,
    .share-clone-select select,
    .share-state,
    .share-link,
    .share-actions,
    .share-platforms,
    .share-note,
    .share-empty {
      font-family: 'DM Mono', monospace;
    }

    .share-eyebrow {
      margin: 0 0 6px;
      color: rgba(255, 255, 255, 0.34);
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .share-header h1 {
      margin: 0;
      color: #fff;
      font-family: 'Playfair Display', serif;
      font-size: 30px;
      font-style: italic;
      font-weight: 300;
      letter-spacing: 0;
    }

    .share-clone-select {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 10px;
      background: rgba(255,255,255,0.03);
      padding: 8px 12px;
    }

    .share-clone-select span,
    .share-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 50%;
      color: #fff;
      font-family: 'Playfair Display', serif;
      font-style: italic;
    }

    .share-clone-select span {
      width: 22px;
      height: 22px;
      font-size: 12px;
    }

    .share-clone-select select {
      max-width: 180px;
      border: 0;
      outline: 0;
      background: transparent;
      color: #F0EEF8;
      font-size: 11px;
    }

    .share-clone-select option {
      background: #111;
    }

    .share-panel,
    .share-link-panel {
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      background: rgba(255,255,255,0.025);
    }

    .share-panel {
      padding: 22px;
    }

    .share-identity {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }

    .share-avatar {
      width: 48px;
      height: 48px;
      font-size: 20px;
      overflow: hidden;
    }

    .share-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .share-identity h2 {
      margin: 0;
      color: #fff;
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-style: italic;
      font-weight: 300;
    }

    .share-identity p {
      max-width: 560px;
      margin: 6px 0 0;
      color: rgba(240,238,248,0.46);
      font: 13px/1.65 Inter, system-ui, sans-serif;
    }

    .share-state {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
      margin-top: 22px;
      border-top: 1px solid rgba(255,255,255,0.07);
      padding-top: 18px;
      font-size: 11px;
    }

    .share-state-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: rgba(255,255,255,0.24);
    }

    .share-state-dot.is-live {
      background: #059669;
      box-shadow: 0 0 0 4px rgba(5,150,105,0.12);
    }

    .share-state strong,
    .share-state span {
      display: block;
    }

    .share-state strong {
      color: #fff;
      font-weight: 400;
    }

    .share-state span,
    .share-note {
      margin-top: 4px;
      color: rgba(255,255,255,0.38);
    }

    .share-state button,
    .share-actions button,
    .share-actions a,
    .share-platforms button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      min-height: 38px;
      border-radius: 9px;
      font: 11px 'DM Mono', monospace;
      transition: border-color 160ms ease, background 160ms ease, color 160ms ease;
    }

    .share-state button,
    .share-actions button {
      border: 1px solid rgba(0,212,255,0.28);
      background: rgba(0,212,255,0.08);
      color: rgba(0,212,255,0.9);
      padding: 0 14px;
    }

    .share-state button:disabled,
    .share-actions button:disabled,
    .share-platforms button:disabled,
    .share-actions a[aria-disabled='true'] {
      cursor: not-allowed;
      opacity: 0.42;
    }

    .share-spin {
      animation: shareSpin 1s linear infinite;
    }

    @keyframes shareSpin {
      to { transform: rotate(360deg); }
    }

    .share-note {
      margin-top: 14px;
      border-radius: 10px;
      background: rgba(245,158,11,0.07);
      padding: 12px 14px;
      font-size: 10px;
      line-height: 1.6;
    }

    .share-note a {
      color: rgba(0,212,255,0.88);
    }

    .share-link-panel {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-top: 14px;
      padding: 16px;
    }

    .share-link-panel.is-muted .share-link {
      color: rgba(255,255,255,0.35);
    }

    .share-link {
      display: flex;
      align-items: center;
      gap: 9px;
      min-width: 0;
      color: rgba(0,212,255,0.88);
      font-size: 13px;
    }

    .share-link span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .share-actions {
      display: flex;
      flex-shrink: 0;
      gap: 8px;
    }

    .share-actions a {
      border: 1px solid rgba(255,255,255,0.09);
      color: rgba(255,255,255,0.58);
      padding: 0 12px;
    }

    .share-platforms {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }

    .share-platforms button {
      border: 1px solid rgba(255,255,255,0.09);
      background: transparent;
      color: rgba(255,255,255,0.56);
      padding: 0 13px;
    }

    .share-platforms button:hover,
    .share-actions a:hover {
      border-color: rgba(255,255,255,0.18);
      color: rgba(255,255,255,0.78);
    }

    .share-empty {
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px;
      background: rgba(255,255,255,0.025);
      padding: 30px;
      text-align: center;
      color: rgba(255,255,255,0.38);
      font-size: 11px;
    }

    .share-skeleton {
      border-radius: 14px;
      background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.07), rgba(255,255,255,0.03));
      background-size: 200% 100%;
      animation: shimmer 1.6s infinite;
    }

    .share-skeleton-title {
      width: 220px;
      height: 34px;
      margin-bottom: 20px;
    }

    .share-skeleton-card {
      height: 150px;
      margin-top: 14px;
    }

    .share-skeleton-card.is-short {
      height: 70px;
    }

    @keyframes shimmer {
      from { background-position: 200% 0; }
      to { background-position: -200% 0; }
    }

    @media (max-width: 700px) {
      .share-page {
        padding: 22px 0 76px;
      }

      .share-header,
      .share-link-panel,
      .share-state {
        align-items: stretch;
        grid-template-columns: 1fr;
      }

      .share-header,
      .share-link-panel {
        flex-direction: column;
      }

      .share-actions,
      .share-state button {
        width: 100%;
      }

      .share-actions button,
      .share-actions a,
      .share-platforms button {
        flex: 1;
      }

      .share-clone-select select {
        max-width: none;
      }
    }
  `}</style>
);

export default SharePage;
