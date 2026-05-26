import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Copy, ExternalLink, Lock } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useClones } from '../../hooks/useClones.js';
import { useShare } from '../../hooks/useShare.js';

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (name[0] || 'A').toUpperCase();
};

const EmbedWidget = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { allClones, loading: clonesLoading } = useClones();
  const [selectedCloneId, setSelectedCloneId] = useState(searchParams.get('clone') || '');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const queryCloneId = searchParams.get('clone') || '';
    if (queryCloneId && queryCloneId !== selectedCloneId) setSelectedCloneId(queryCloneId);
  }, [searchParams, selectedCloneId]);

  useEffect(() => {
    if (!selectedCloneId && allClones.length > 0) {
      setSelectedCloneId(allClones[0].id);
    }
  }, [allClones, selectedCloneId]);

  const { data, loading, error } = useShare(selectedCloneId);

  const selectedClone = useMemo(
    () => allClones.find((clone) => clone.id === selectedCloneId),
    [allClones, selectedCloneId]
  );

  const clone = data?.clone;
  const isLive = clone?.is_public || clone?.status === 'live';
  const iframeCode = data?.embedCode?.iframe || '';
  const widgetCode = data?.embedCode?.script || '';
  const avatarColor = clone?.avatar_color || selectedClone?.avatar_color || '#00D4FF';
  const ownerAvatar = clone?.owner_avatar || selectedClone?.owner_avatar || '';

  const handleSelectClone = (cloneId) => {
    setSelectedCloneId(cloneId);
    setSearchParams({ clone: cloneId });
  };

  const copy = async (key, value) => {
    if (!isLive) {
      toast('Make clone public first');
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopied(key);
    toast.success('Embed code copied');
    window.setTimeout(() => setCopied(''), 1800);
  };

  if (clonesLoading || loading) {
    return (
      <>
        <div className="embed-page">
          <div className="embed-skeleton embed-skeleton-title" />
          <div className="embed-skeleton embed-skeleton-card" />
          <div className="embed-skeleton embed-skeleton-code" />
        </div>
        <EmbedStyles />
      </>
    );
  }

  if (!selectedCloneId || allClones.length === 0) {
    return (
      <>
        <div className="embed-page">
          <div className="embed-empty">Create a clone first to embed it.</div>
        </div>
        <EmbedStyles />
      </>
    );
  }

  if (error || !data?.success) {
    return (
      <>
        <div className="embed-page">
          <div className="embed-empty">{error || 'Could not load embed data'}</div>
        </div>
        <EmbedStyles />
      </>
    );
  }

  return (
    <>
      <main className="embed-page" data-scroll-section>
        <header className="embed-header">
          <div>
            <p className="embed-eyebrow">Embed</p>
            <h1>Website widget</h1>
          </div>

          {allClones.length > 1 && (
            <label className="embed-clone-select">
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

        <section className="embed-panel">
          <div className="embed-identity">
            <div className="embed-avatar" style={{ background: avatarColor }}>
              {ownerAvatar ? <img src={ownerAvatar} alt="" /> : getInitials(clone?.name)}
            </div>
            <div>
              <h2>{clone?.name}</h2>
              <p>{isLive ? 'Paste one snippet into your website.' : 'Publish this clone before using embed code.'}</p>
            </div>
          </div>

          <div className={`embed-status ${isLive ? 'is-live' : ''}`}>
            <span />
            {isLive ? 'Public and ready to embed' : 'Private clone'}
          </div>

          {!isLive && (
            <div className="embed-note">
              Embeds are disabled while the clone is private. <Link to={`/dashboard/share/${clone?.id}`}>Go to share settings</Link>
            </div>
          )}
        </section>

        <section className="embed-code-card">
          <div className="embed-code-head">
            <div>
              <h3>Inline iframe</h3>
              <p>Best for a dedicated page section.</p>
            </div>
            <button type="button" onClick={() => copy('iframe', iframeCode)} disabled={!isLive}>
              {copied === 'iframe' ? <Check size={14} /> : <Copy size={14} />}
              {copied === 'iframe' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre><code>{iframeCode}</code></pre>
        </section>

        <section className="embed-preview-card">
          <div className="embed-code-head">
            <div>
              <h3>Preview</h3>
              <p>Approximate iframe placement on a website.</p>
            </div>
          </div>
          <div className="embed-preview-shell">
            <div className="embed-preview-site">
              <div className="embed-preview-nav">
                <span />
                <i />
              </div>
              <div className="embed-preview-copy">
                <strong>Ask me anything</strong>
                <p>Your visitors can chat with this clone directly from the page.</p>
              </div>
            </div>
            <div className="embed-preview-frame">
              {isLive ? (
                <iframe
                  src={`${data.shareUrl}?embed=true&preview=true`}
                  title={`${clone?.name || 'Alter AI'} embed preview`}
                  loading="lazy"
                />
              ) : (
                <div className="embed-preview-locked">
                  <Lock size={16} />
                  Publish to preview
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="embed-code-card">
          <div className="embed-code-head">
            <div>
              <h3>Floating widget</h3>
              <p>Paste before <code>&lt;/body&gt;</code> on any site — launcher appears in the corner.</p>
            </div>
            <button type="button" onClick={() => copy('widget', widgetCode)} disabled={!isLive}>
              {copied === 'widget' ? <Check size={14} /> : <Copy size={14} />}
              {copied === 'widget' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre><code>{widgetCode}</code></pre>
          <p className="embed-widget-hint">
            Test locally: open <code>/embed-demo.html</code> on your dev server and set <code>data-slug</code> to{' '}
            <strong>{clone?.slug}</strong>.
          </p>
        </section>

        <div className="embed-actions">
          <a href={isLive ? data.shareUrl : undefined} target="_blank" rel="noreferrer" aria-disabled={!isLive}>
            <ExternalLink size={15} />
            Open clone
          </a>
          {!isLive && (
            <span>
              <Lock size={14} />
              Publish from Share first
            </span>
          )}
        </div>
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
      <EmbedStyles />
    </>
  );
};

const EmbedStyles = () => (
  <style>{`
    .embed-page {
      width: min(760px, 100%);
      margin: 0 auto;
      padding: 28px 0 72px;
      color: #F0EEF8;
    }

    .embed-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 20px;
    }

    .embed-eyebrow,
    .embed-clone-select select,
    .embed-status,
    .embed-note,
    .embed-code-head,
    .embed-code-card pre,
    .embed-actions,
    .embed-empty {
      font-family: 'DM Mono', monospace;
    }

    .embed-eyebrow {
      margin: 0 0 6px;
      color: rgba(255,255,255,0.34);
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .embed-header h1 {
      margin: 0;
      color: #fff;
      font-family: 'Playfair Display', serif;
      font-size: 30px;
      font-style: italic;
      font-weight: 300;
      letter-spacing: 0;
    }

    .embed-clone-select {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 10px;
      background: rgba(255,255,255,0.03);
      padding: 8px 12px;
    }

    .embed-clone-select span,
    .embed-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 50%;
      color: #fff;
      font-family: 'Playfair Display', serif;
      font-style: italic;
    }

    .embed-clone-select span {
      width: 22px;
      height: 22px;
      font-size: 12px;
    }

    .embed-clone-select select {
      max-width: 180px;
      border: 0;
      outline: 0;
      background: transparent;
      color: #F0EEF8;
      font-size: 11px;
    }

    .embed-clone-select option {
      background: #111;
    }

    .embed-panel,
    .embed-code-card,
    .embed-preview-card,
    .embed-empty {
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      background: rgba(255,255,255,0.025);
    }

    .embed-panel {
      padding: 22px;
    }

    .embed-identity {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }

    .embed-avatar {
      width: 48px;
      height: 48px;
      font-size: 20px;
      overflow: hidden;
    }

    .embed-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .embed-identity h2 {
      margin: 0;
      color: #fff;
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-style: italic;
      font-weight: 300;
    }

    .embed-identity p {
      margin: 6px 0 0;
      color: rgba(240,238,248,0.46);
      font: 13px/1.65 Inter, system-ui, sans-serif;
    }

    .embed-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 18px;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 999px;
      padding: 7px 10px;
      color: rgba(255,255,255,0.48);
      font-size: 10px;
    }

    .embed-status span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: rgba(255,255,255,0.24);
    }

    .embed-status.is-live {
      border-color: rgba(5,150,105,0.22);
      color: #059669;
    }

    .embed-status.is-live span {
      background: #059669;
    }

    .embed-note {
      margin-top: 14px;
      border-radius: 10px;
      background: rgba(245,158,11,0.07);
      padding: 12px 14px;
      color: rgba(255,255,255,0.44);
      font-size: 10px;
      line-height: 1.6;
    }

    .embed-note a {
      color: rgba(0,212,255,0.88);
    }

    .embed-code-card {
      margin-top: 14px;
      padding: 16px;
    }

    .embed-preview-card {
      margin-top: 14px;
      padding: 16px;
    }

    .embed-code-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 14px;
    }

    .embed-code-head h3 {
      margin: 0;
      color: #fff;
      font-size: 12px;
      font-weight: 400;
    }

    .embed-code-head p {
      margin: 5px 0 0;
      color: rgba(255,255,255,0.36);
      font: 12px Inter, system-ui, sans-serif;
    }

    .embed-code-head button,
    .embed-actions a,
    .embed-actions span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      min-height: 38px;
      border-radius: 9px;
      font: 11px 'DM Mono', monospace;
    }

    .embed-code-head button {
      flex-shrink: 0;
      border: 1px solid rgba(0,212,255,0.28);
      background: rgba(0,212,255,0.08);
      color: rgba(0,212,255,0.9);
      padding: 0 14px;
    }

    .embed-code-head button:disabled,
    .embed-actions a[aria-disabled='true'] {
      cursor: not-allowed;
      opacity: 0.42;
    }

    .embed-widget-hint {
      margin: 12px 0 0;
      color: rgba(255,255,255,0.36);
      font: 12px/1.6 Inter, system-ui, sans-serif;
    }

    .embed-widget-hint code,
    .embed-code-head p code {
      color: rgba(0,212,255,0.85);
      font-family: 'DM Mono', monospace;
      font-size: 10px;
    }

    .embed-code-card pre {
      min-height: 84px;
      max-height: 190px;
      margin: 0;
      overflow: auto;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 10px;
      background: #090909;
      padding: 14px;
      color: rgba(240,238,248,0.64);
      font-size: 11px;
      line-height: 1.65;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .embed-preview-shell {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(240px, 320px);
      gap: 14px;
      min-height: 360px;
    }

    .embed-preview-site,
    .embed-preview-frame {
      min-width: 0;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      background: #090909;
    }

    .embed-preview-site {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 18px;
    }

    .embed-preview-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .embed-preview-nav span,
    .embed-preview-nav i {
      display: block;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
    }

    .embed-preview-nav span {
      width: 92px;
      height: 12px;
    }

    .embed-preview-nav i {
      width: 128px;
      height: 8px;
    }

    .embed-preview-copy strong {
      display: block;
      color: #fff;
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-style: italic;
      font-weight: 300;
    }

    .embed-preview-copy p {
      max-width: 300px;
      margin: 8px 0 0;
      color: rgba(240,238,248,0.44);
      font: 13px/1.6 Inter, system-ui, sans-serif;
    }

    .embed-preview-frame {
      min-height: 360px;
      background: #0b0b0b;
    }

    .embed-preview-frame iframe {
      width: 100%;
      height: 100%;
      min-height: 360px;
      border: 0;
      background: #080808;
    }

    .embed-preview-locked {
      display: flex;
      height: 100%;
      min-height: 360px;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: rgba(255,255,255,0.42);
      font: 11px 'DM Mono', monospace;
    }

    .embed-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }

    .embed-actions a,
    .embed-actions span {
      border: 1px solid rgba(255,255,255,0.09);
      color: rgba(255,255,255,0.58);
      padding: 0 13px;
    }

    .embed-empty {
      padding: 30px;
      text-align: center;
      color: rgba(255,255,255,0.38);
      font-size: 11px;
    }

    .embed-skeleton {
      border-radius: 14px;
      background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.07), rgba(255,255,255,0.03));
      background-size: 200% 100%;
      animation: embedShimmer 1.6s infinite;
    }

    .embed-skeleton-title {
      width: 220px;
      height: 34px;
      margin-bottom: 20px;
    }

    .embed-skeleton-card {
      height: 134px;
      margin-top: 14px;
    }

    .embed-skeleton-code {
      height: 150px;
      margin-top: 14px;
    }

    @keyframes embedShimmer {
      from { background-position: 200% 0; }
      to { background-position: -200% 0; }
    }

    @media (max-width: 700px) {
      .embed-page {
        padding: 22px 0 76px;
      }

      .embed-header,
      .embed-code-head {
        align-items: stretch;
        flex-direction: column;
      }

      .embed-preview-shell {
        grid-template-columns: 1fr;
      }

      .embed-preview-site {
        min-height: 180px;
      }

      .embed-clone-select select {
        max-width: none;
      }

      .embed-code-head button,
      .embed-actions a,
      .embed-actions span {
        width: 100%;
      }
    }
  `}</style>
);

export default EmbedWidget;
