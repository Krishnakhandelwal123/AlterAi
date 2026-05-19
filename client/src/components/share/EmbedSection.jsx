import React, { useMemo, useState } from 'react';
import { Check, Copy, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import PhoneMockup from './PhoneMockup.jsx';

const radiusMap = { Sharp: '0px', Rounded: '16px', Pill: '28px' };

const CodeBlock = ({ code, onCopy, copied, label }) => (
  <div className="share-code-block">
    <button type="button" onClick={() => onCopy(code)}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : label}
    </button>
    <pre><code>{code}</code></pre>
  </div>
);

const EmbedSection = ({ data, onTrack }) => {
  const [tab, setTab] = useState('iframe');
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('600px');
  const [theme, setTheme] = useState('dark');
  const [corners, setCorners] = useState('Rounded');
  const [buttonText, setButtonText] = useState(`Chat with ${data.clone.name} AI ->`);
  const [openMode, setOpenMode] = useState('New Tab');
  const [copied, setCopied] = useState('');
  const plan = data.plan || 'free';
  const locked = plan === 'free';

  const code = useMemo(() => {
    const radius = radiusMap[corners];
    if (tab === 'script') {
      return `<!-- Alter AI Widget -->\n<script\n  src="${new URL(data.shareUrl).origin}/widget.js"\n  data-slug="${data.clone.slug}"\n  data-theme="${theme}"\n  data-position="bottom-right"\n  data-color="${data.clone.avatar_color || '#00D4FF'}"\n  async>\n</script>`;
    }
    if (tab === 'button') {
      return `<a href="${data.shareUrl}"\n   target="${openMode === 'New Tab' ? '_blank' : '_self'}"\n   style="background:${data.clone.avatar_color || '#00D4FF'};\n          color:white;\n          padding:12px 24px;\n          border-radius:10px;\n          text-decoration:none;\n          font-family:sans-serif;">\n  ${buttonText}\n</a>`;
    }
    return `<iframe\n  src="${data.shareUrl}?theme=${theme}&embed=true"\n  width="${width}"\n  height="${height}"\n  frameborder="0"\n  style="border-radius:${radius};border:none;"\n  allow="microphone"\n  title="${data.clone.name} AI Clone">\n</iframe>`;
  }, [buttonText, corners, data, height, openMode, tab, theme, width]);

  const copyCode = async (value) => {
    await navigator.clipboard.writeText(value);
    setCopied(tab);
    onTrack('copy');
    toast.success(`${tab === 'iframe' ? 'iFrame' : tab === 'script' ? 'Script' : 'Button'} code copied`);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <section className="share-section share-stagger-5">
      <div className="share-embed-preview-layout">
        <div className="share-embed-panel">
          <p className="share-label">EMBED ON YOUR WEBSITE</p>
          <p className="share-subtitle">Let visitors chat with your AI directly from your own website.</p>

          <div className="share-embed-shell">
            {locked && (
              <div className="share-lock-overlay">
                <Lock size={32} />
                <h3>Creator Plan Required</h3>
                <p>Embed widget available on Creator plan</p>
                <a href="/dashboard/billing">Upgrade to Creator</a>
              </div>
            )}

            <div className="share-tabs">
              {[
                ['iframe', 'iFrame'],
                ['script', 'Script Tag'],
                ['button', 'Widget Button']
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={tab === key ? 'is-active' : ''}
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === 'iframe' && (
              <>
                <p className="share-tab-desc">Embed a full chat window directly in your page. Best for dedicated AI chat sections.</p>
                <div className="share-controls-grid">
                  <label>WIDTH<input value={width} onChange={(e) => setWidth(e.target.value)} /></label>
                  <label>HEIGHT<input value={height} onChange={(e) => setHeight(e.target.value)} /></label>
                  <label>THEME<div>{['dark', 'light'].map((item) => <button key={item} type="button" className={theme === item ? 'is-active' : ''} onClick={() => setTheme(item)}>{item}</button>)}</div></label>
                  <label>CORNERS<div>{Object.keys(radiusMap).map((item) => <button key={item} type="button" className={corners === item ? 'is-active' : ''} onClick={() => setCorners(item)}>{item}</button>)}</div></label>
                </div>
              </>
            )}

            {tab === 'script' && (
              <>
                <p className="share-tab-desc">Add a floating chat button that appears on every page. Easiest to install: one line of code.</p>
                <div className="share-install-steps">
                  {['Copy the code above', 'Paste before </body> tag', 'Widget appears automatically'].map((step, i) => (
                    <span key={step}><b>{i + 1}</b>{step}</span>
                  ))}
                </div>
              </>
            )}

            {tab === 'button' && (
              <>
                <p className="share-tab-desc">Add a custom button anywhere on your site that opens your AI clone.</p>
                <div className="share-button-preview">
                  <a style={{ background: data.clone.avatar_color || '#00D4FF' }}>{buttonText}</a>
                </div>
                <div className="share-controls-grid">
                  <label>BUTTON TEXT<input value={buttonText} onChange={(e) => setButtonText(e.target.value)} /></label>
                  <label>OPENS<div>{['New Tab', 'Popup', 'Sidebar'].map((item) => <button key={item} type="button" className={openMode === item ? 'is-active' : ''} onClick={() => setOpenMode(item)}>{item}</button>)}</div></label>
                </div>
              </>
            )}

            <CodeBlock
              code={code}
              onCopy={copyCode}
              copied={copied === tab}
              label={tab === 'iframe' ? 'Copy iFrame Code' : tab === 'script' ? 'Copy Script' : 'Copy Button Code'}
            />
          </div>
        </div>

        <PhoneMockup data={data} />
      </div>
    </section>
  );
};

export default EmbedSection;
