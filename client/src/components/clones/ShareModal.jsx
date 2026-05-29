import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Check, QrCode, Code, ExternalLink } from 'lucide-react';
import { getPublicChatDisplayUrl, getPublicChatUrl } from '../../utils/publicLinks.js';

const ShareModal = ({ clone, onClose, onPublish }) => {
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [publishing, setPublishing] = useState(false);

  if (!clone) return null;

  const { id, name, slug, status } = clone;
  const isLive = status === 'live';
  const fullUrl = getPublicChatUrl(slug);
  const displayUrl = getPublicChatDisplayUrl(slug);

  const iframeSnippet = `<iframe src="${fullUrl}?embed=true" width="100%" height="600px" style="border:none;border-radius:16px;"></iframe>`;

  const copyToClipboard = async (text, setCopiedState) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (_) {}
  };

  const handleGoLive = async () => {
    if (publishing) return;
    setPublishing(true);
    await onPublish(id, true);
    setPublishing(false);
  };

  const shareText = encodeURIComponent(`Chat with my AI clone on Alter AI! Ask me anything 24/7. ${fullUrl}`);

  const socialLinks = [
    { name: 'X / Twitter', url: `https://twitter.com/intent/tweet?text=${shareText}` },
    { name: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}` },
    { name: 'WhatsApp', url: `https://api.whatsapp.com/send?text=${shareText}` },
    { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}` }
  ];

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullUrl)}`;

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: 32,
        maxWidth: 560,
        width: '100%',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        animation: 'modal-appear 300ms ease'
      }}>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 20,
            cursor: 'pointer',
            padding: 4
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
        >
          ✕
        </button>

        {/* Title */}
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          fontSize: 24,
          color: '#fff',
          marginBottom: 20
        }}>
          Share Your AI Clone
        </div>

        {/* Status Banner */}
        {!isLive ? (
          <div style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: '#F59E0B', lineHeight: 1.5 }}>
              ⚠ Your clone is currently in <b>Draft</b> mode. Publish it to allow public access.
            </div>
            <button
              type="button"
              onClick={handleGoLive}
              disabled={publishing}
              style={{
                background: 'rgba(245,158,11,0.2)',
                border: '1px solid rgba(245,158,11,0.5)',
                borderRadius: 8,
                padding: '8px 16px',
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: '#F59E0B',
                cursor: publishing ? 'not-allowed' : 'pointer',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              {publishing ? 'Publishing...' : '🚀 Go Live'}
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: '#22c55e',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 999,
            padding: '6px 14px',
            width: 'fit-content'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
            Live · Public link active
          </div>
        )}

        {/* Main Link Box */}
        <div style={{
          background: '#0D0D0D',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 16,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              marginBottom: 4
            }}>
              Public Chat Link
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: 18,
              color: 'rgba(0,212,255,0.9)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {displayUrl}
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(fullUrl, setCopied)}
            style={{
              background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(0,212,255,0.12)',
              border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(0,212,255,0.3)'}`,
              borderRadius: 10,
              padding: '10px 16px',
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: copied ? '#22c55e' : 'rgba(0,212,255,0.88)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
              transition: 'all 200ms ease'
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied! ✓' : 'Copy Link'}
          </button>
        </div>

        {/* Social Share Row */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            marginBottom: 12
          }}>
            Share on Socials
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {socialLinks.map(({ name: sName, url }) => (
              <a
                key={sName}
                href={url}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '12px 8px',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.7)',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,212,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)';
                  e.currentTarget.style.color = 'rgba(0,212,255,0.88)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(0,212,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {sName}
              </a>
            ))}
          </div>
        </div>

        {/* Embed Accordion */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 0'
        }}>
          <button
            type="button"
            onClick={() => setShowEmbed(!showEmbed)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#fff',
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code className="h-4 w-4 text-[rgba(0,212,255,0.88)]" />
              Embed on your website
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>{showEmbed ? '▲' : '▼'}</span>
          </button>

          {showEmbed && (
            <div style={{ marginTop: 16, animation: 'modal-appear 200ms ease' }}>
              <div style={{
                background: '#080808',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: 16,
                position: 'relative'
              }}>
                <button
                  type="button"
                  onClick={() => copyToClipboard(iframeSnippet, setCopiedEmbed)}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: copiedEmbed ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${copiedEmbed ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    color: copiedEmbed ? '#22c55e' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer'
                  }}
                >
                  {copiedEmbed ? 'Copied' : 'Copy Code'}
                </button>
                <pre style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.6)',
                  overflowX: 'auto',
                  margin: 0,
                  paddingTop: 24,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {iframeSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* QR Code Section */}
        <div style={{ padding: '16px 0 0' }}>
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#fff',
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <QrCode className="h-4 w-4 text-[rgba(0,212,255,0.88)]" />
              QR Code generator
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>{showQr ? '▲' : '▼'}</span>
          </button>

          {showQr && (
            <div style={{ marginTop: 16, textAlign: 'center', animation: 'modal-appear 200ms ease' }}>
              <div style={{
                background: '#fff',
                padding: 16,
                borderRadius: 16,
                display: 'inline-block',
                marginBottom: 12
              }}>
                <img src={qrUrl} alt="Clone QR Code" style={{ width: 180, height: 180 }} />
              </div>
              <div>
                <a
                  href={qrUrl}
                  download={`clone-${slug}-qr.png`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-block',
                    background: 'rgba(0,212,255,0.12)',
                    border: '1px solid rgba(0,212,255,0.3)',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: 'rgba(0,212,255,0.88)',
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Download PNG
                </a>
              </div>
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes modal-appear {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ShareModal;
