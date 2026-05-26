/**
 * Alter AI — floating chat widget
 * Usage: <script src="https://your-app.com/widget.js" data-slug="your-clone" async></script>
 */
(function alterAiWidget(global) {
  'use strict';

  if (global.AlterAIWidget?.initialized) return;

  const script =
    document.currentScript ||
    document.querySelector('script[src*="widget.js"][data-slug]');

  if (!script) {
    console.warn('[AlterAI] widget.js: could not find script tag with data-slug');
    return;
  }

  const slug = (script.getAttribute('data-slug') || '').trim();
  if (!slug) {
    console.warn('[AlterAI] widget.js: data-slug is required');
    return;
  }

  const theme = (script.getAttribute('data-theme') || 'dark').toLowerCase();
  const position = (script.getAttribute('data-position') || 'bottom-right').toLowerCase();
  const accent = script.getAttribute('data-color') || '#00D4FF';
  const label = script.getAttribute('data-label') || 'Chat with AI';

  let baseUrl;
  try {
    baseUrl = new URL(script.src).origin;
  } catch {
    baseUrl = global.location.origin;
  }

  const chatUrl = `${baseUrl}/chat/${encodeURIComponent(slug)}?embed=true&widget=true&theme=${encodeURIComponent(theme)}`;
  const rootId = 'alter-ai-widget-root';
  const storageKey = `alter_widget_open_${slug}`;

  const isLight = theme === 'light';
  const panelBg = isLight ? '#f7f5ff' : '#0c0c0e';
  const panelBorder = isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.1)';
  const headerColor = isLight ? '#0f172a' : '#ffffff';
  const subColor = isLight ? 'rgba(15,23,42,0.55)' : 'rgba(255,255,255,0.45)';

  const positionStyles = {
    'bottom-right': { bottom: '20px', right: '20px', align: 'flex-end' },
    'bottom-left': { bottom: '20px', left: '20px', align: 'flex-start' },
    'top-right': { top: '20px', right: '20px', align: 'flex-end' },
    'top-left': { top: '20px', left: '20px', align: 'flex-start' }
  };
  const pos = positionStyles[position] || positionStyles['bottom-right'];

  const existing = document.getElementById(rootId);
  if (existing) existing.remove();

  const root = document.createElement('div');
  root.id = rootId;
  root.setAttribute('data-alter-widget', slug);
  root.style.cssText = [
    'position:fixed',
    'z-index:2147483000',
    'font-family:Inter,system-ui,sans-serif',
    'line-height:1.4',
    pos.bottom ? `bottom:${pos.bottom}` : '',
    pos.top ? `top:${pos.top}` : '',
    pos.left ? `left:${pos.left}` : '',
    pos.right ? `right:${pos.right}` : '',
    `display:flex;flex-direction:column;align-items:${pos.align};gap:12px`
  ]
    .filter(Boolean)
    .join(';');

  const style = document.createElement('style');
  style.textContent = `
    #${rootId} * { box-sizing: border-box; }
    #${rootId} .alter-launcher {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      border: 0;
      border-radius: 999px;
      padding: 14px 18px;
      background: ${accent};
      color: #080808;
      font-family: 'DM Mono', ui-monospace, monospace;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.04em;
      cursor: pointer;
      box-shadow: 0 12px 40px ${accent}55, 0 4px 20px rgba(0,0,0,0.35);
      transition: transform 160ms ease, box-shadow 160ms ease;
    }
    #${rootId} .alter-launcher:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 48px ${accent}66, 0 6px 24px rgba(0,0,0,0.4);
    }
    #${rootId} .alter-launcher svg { flex-shrink: 0; }
    #${rootId} .alter-panel {
      width: min(400px, calc(100vw - 32px));
      height: min(640px, calc(100dvh - 100px));
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid ${panelBorder};
      border-radius: 18px;
      background: ${panelBg};
      box-shadow: 0 28px 80px rgba(0,0,0,0.45);
      animation: alterWidgetIn 220ms ease;
    }
    #${rootId} .alter-panel.is-open { display: flex; }
    #${rootId} .alter-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid ${panelBorder};
      background: ${isLight ? '#fff' : 'rgba(255,255,255,0.03)'};
    }
    #${rootId} .alter-panel-title {
      margin: 0;
      color: ${headerColor};
      font-family: Georgia, 'Playfair Display', serif;
      font-size: 18px;
      font-style: italic;
      font-weight: 400;
    }
    #${rootId} .alter-panel-sub {
      margin: 4px 0 0;
      color: ${subColor};
      font-size: 11px;
    }
    #${rootId} .alter-panel-actions { display: flex; gap: 6px; }
    #${rootId} .alter-icon-btn {
      width: 32px;
      height: 32px;
      border: 1px solid ${panelBorder};
      border-radius: 10px;
      background: transparent;
      color: ${subColor};
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    #${rootId} .alter-icon-btn:hover {
      color: ${accent};
      border-color: ${accent}55;
    }
    #${rootId} .alter-frame-wrap { flex: 1; min-height: 0; background: #080808; }
    #${rootId} .alter-frame-wrap iframe {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
      background: #080808;
    }
    #${rootId} .alter-powered {
      padding: 8px 12px;
      text-align: center;
      font-size: 9px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: ${subColor};
      border-top: 1px solid ${panelBorder};
    }
    #${rootId} .alter-powered a {
      color: ${accent};
      text-decoration: none;
    }
    @keyframes alterWidgetIn {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @media (max-width: 520px) {
      #${rootId} .alter-panel.is-open {
        position: fixed;
        inset: 12px;
        width: auto;
        height: auto;
        max-width: none;
        max-height: none;
      }
    }
  `;

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'alter-launcher';
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'alter-ai-widget-panel');
  launcher.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <span>${label.replace(/</g, '&lt;')}</span>
  `;

  const panel = document.createElement('div');
  panel.id = 'alter-ai-widget-panel';
  panel.className = 'alter-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Alter AI chat');

  const header = document.createElement('div');
  header.className = 'alter-panel-header';
  header.innerHTML = `
    <div>
      <p class="alter-panel-title">Alter AI</p>
      <p class="alter-panel-sub">Powered by your clone</p>
    </div>
    <div class="alter-panel-actions">
      <button type="button" class="alter-icon-btn" data-action="open-tab" title="Open in new tab" aria-label="Open in new tab">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>
      </button>
      <button type="button" class="alter-icon-btn" data-action="close" title="Close" aria-label="Close chat">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  `;

  const frameWrap = document.createElement('div');
  frameWrap.className = 'alter-frame-wrap';

  const iframe = document.createElement('iframe');
  iframe.title = 'Alter AI Chat';
  iframe.allow = 'microphone';
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';

  const footer = document.createElement('div');
  footer.className = 'alter-powered';
  footer.innerHTML = `Powered by <a href="${baseUrl}" target="_blank" rel="noopener noreferrer">Alter AI</a>`;

  let iframeLoaded = false;

  const loadIframe = () => {
    if (iframeLoaded) return;
    iframe.src = chatUrl;
    iframeLoaded = true;
  };

  const setOpen = (open) => {
    panel.classList.toggle('is-open', open);
    launcher.setAttribute('aria-expanded', open ? 'true' : 'false');
    launcher.style.display = open ? 'none' : 'inline-flex';
    if (open) {
      loadIframe();
      try {
        sessionStorage.setItem(storageKey, '1');
      } catch (_) {}
    } else {
      try {
        sessionStorage.removeItem(storageKey);
      } catch (_) {}
    }
  };

  launcher.addEventListener('click', () => setOpen(true));
  header.querySelector('[data-action="close"]').addEventListener('click', () => setOpen(false));
  header.querySelector('[data-action="open-tab"]').addEventListener('click', () => {
    global.open(chatUrl, '_blank', 'noopener,noreferrer');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false);
  });

  frameWrap.appendChild(iframe);
  panel.appendChild(header);
  panel.appendChild(frameWrap);
  panel.appendChild(footer);
  root.appendChild(style);
  root.appendChild(panel);
  root.appendChild(launcher);
  document.body.appendChild(root);

  try {
    if (sessionStorage.getItem(storageKey) === '1') setOpen(true);
  } catch (_) {}

  global.AlterAIWidget = {
    initialized: true,
    slug,
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!panel.classList.contains('is-open')),
    destroy: () => {
      root.remove();
      global.AlterAIWidget = null;
    }
  };
})(window);
