import React, { useState } from 'react';
import { Check, Linkedin, Link as LinkIcon, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path fill="currentColor" d="M18.9 2h3.3l-7.2 8.2L23.4 22h-6.6l-5.2-6.8L5.7 22H2.4l7.7-8.8L2 2h6.8l4.7 6.2L18.9 2Zm-1.2 17.9h1.8L7.8 4H5.9l11.8 15.9Z" />
  </svg>
);

const SharePlatforms = ({ data, analytics, onTrack }) => {
  const [copied, setCopied] = useState(false);
  const isLive = data?.clone?.is_public || data?.clone?.status === 'live';
  const slug = data?.clone?.slug;
  const shareUrl = data?.shareUrl;
  const counts = analytics?.sharesByPlatform || {};

  const openShare = async (platform) => {
    if (!isLive) {
      toast('Make clone public first', { icon: '○' });
      return;
    }

    if (platform === 'copy') {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onTrack('copy');
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I cloned myself with AI. Ask me anything - I'm available 24/7.\n\n${data.displayUrl}\n\nBuilt with @AlterAI`)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`Hey! I created an AI version of myself. You can chat with it 24/7 here: ${data.displayUrl}`)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    };

    window.open(urls[platform], '_blank', 'noopener,noreferrer');
    onTrack(platform);
    toast(`Shared on ${platform}`, { icon: '↗' });
  };

  const platforms = [
    {
      key: 'twitter',
      name: 'Twitter / X',
      desc: 'Share with your followers',
      icon: <XIcon />,
      className: 'is-x'
    },
    {
      key: 'whatsapp',
      name: 'WhatsApp',
      desc: 'Send to friends & groups',
      icon: <MessageCircle size={18} />,
      className: 'is-whatsapp'
    },
    {
      key: 'linkedin',
      name: 'LinkedIn',
      desc: 'Share with your network',
      icon: <Linkedin size={18} />,
      className: 'is-linkedin'
    },
    {
      key: 'copy',
      name: copied ? 'Copied!' : 'Copy Link',
      desc: 'Share anywhere you want',
      icon: copied ? <Check size={18} /> : <LinkIcon size={18} />,
      className: 'is-copy'
    }
  ];

  const activeStats = platforms.filter((platform) => counts[platform.key] > 0);

  return (
    <section className="share-section share-stagger-3">
      <p className="share-label">SHARE YOUR CLONE</p>
      <p className="share-subtitle">Every share brings new visitors.</p>

      <div className="share-platform-grid">
        {platforms.map((platform) => (
          <button
            key={platform.key}
            type="button"
            className={`share-platform-card ${platform.className}`}
            onClick={() => openShare(platform.key)}
          >
            <span className="share-platform-count">{counts[platform.key] || 0} shares</span>
            <span className="share-platform-icon">{platform.icon}</span>
            <span>
              <strong>{platform.name}</strong>
              <small>{platform.desc}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="share-stats-row">
        {activeStats.map((platform) => (
          <span key={platform.key}>{platform.name.split(' ')[0]} · {counts[platform.key]}</span>
        ))}
        <strong>Total: {analytics?.totalShares || 0} shares</strong>
      </div>
    </section>
  );
};

export default SharePlatforms;
