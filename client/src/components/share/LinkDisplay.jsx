import React, { useState } from 'react';
import { Check, Copy, Globe2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const LinkDisplay = ({ data, onTrack }) => {
  const [copied, setCopied] = useState(false);
  const isLive = data?.clone?.is_public || data?.clone?.status === 'live';

  const copyLink = async () => {
    if (!isLive) {
      toast('Make clone public first', { icon: '○' });
      return;
    }
    await navigator.clipboard.writeText(data.shareUrl);
    setCopied(true);
    onTrack('copy');
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="share-section share-stagger-2">
      <p className="share-label">YOUR CLONE LINK</p>
      <div className={`share-link-card ${!isLive ? 'is-draft' : ''}`}>
        <div className="share-link-glow" />
        <div className="share-link-url">
          {isLive ? <Globe2 size={16} /> : <Lock size={16} />}
          <span>{data?.displayUrl}</span>
        </div>
        <button
          type="button"
          className={`share-copy-btn ${copied ? 'is-copied' : ''}`}
          onClick={copyLink}
          disabled={!isLive}
          title={!isLive ? 'Make clone public first' : 'Copy link'}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </section>
  );
};

export default LinkDisplay;
