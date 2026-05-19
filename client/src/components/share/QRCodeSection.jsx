import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name[0] || 'A').toUpperCase();
};

const QRCodeSection = ({ data, onTrack }) => {
  const [size, setSize] = useState(160);
  const qrRef = useRef(null);
  const clone = data?.clone;
  const ownerAvatar = clone?.owner_avatar || '';

  const downloadSvg = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alter-ai-${clone.slug}-qr.svg`;
    link.click();
    URL.revokeObjectURL(url);
    onTrack('qr');
    toast.success('QR SVG downloaded');
  };

  const downloadPng = async () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgText = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size * 2;
      canvas.height = size * 2;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `alter-ai-${clone.slug}-qr.png`;
      link.click();
      onTrack('qr');
      toast.success('QR PNG downloaded');
    };
    img.src = url;
  };

  return (
    <section className="share-section share-stagger-4">
      <p className="share-label">QR CODE</p>
      <p className="share-subtitle">Perfect for business cards, slides, events</p>

      <div className="share-qr-layout">
        <div className="share-qr-card" ref={qrRef}>
          <QRCodeSVG
            value={data.shareUrl}
            size={size}
            bgColor="transparent"
            fgColor="rgba(0,212,255,0.88)"
            level="H"
          />
          <p>{data.displayUrl}</p>
          <span className="share-avatar-sm" style={{ background: clone.avatar_color || '#00D4FF' }}>
            {ownerAvatar ? (
              <img
                src={ownerAvatar}
                alt=""
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              getInitials(clone.name)
            )}
          </span>
        </div>

        <div className="share-qr-copy">
          <h3>Scan to chat</h3>
          <p>Share this QR code at events, on slides, in videos, or print it on business cards. Anyone who scans goes straight to your AI clone.</p>
          <button type="button" onClick={downloadPng}>
            <Download size={15} />
            Download PNG
          </button>
          <button type="button" className="is-secondary" onClick={downloadSvg}>Download SVG</button>
          <div className="share-size-control">
            <span>SIZE</span>
            {[['Small', 120], ['Medium', 160], ['Large', 220]].map(([label, value]) => (
              <button
                key={label}
                type="button"
                className={size === value ? 'is-active' : ''}
                onClick={() => setSize(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QRCodeSection;
