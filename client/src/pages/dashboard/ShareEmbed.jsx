import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Copy, ExternalLink } from 'lucide-react';

const ShareEmbed = () => {
  const { user } = useAuth();
  const slug = (user?.name || user?.email?.split('@')[0] || 'yourname').toLowerCase().replace(/\s+/g, '');
  const url = `alter.ai/${slug}`;
  const [copied, setCopied] = useState(false);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const snippet = `<script src="https://alter.ai/widget.js" data-slug="${slug}" async></script>`;

  return (
    <div className="mx-auto grid max-w-[1100px] gap-8 lg:grid-cols-2" data-scroll-section>
      <div className="space-y-6">
        <h2 className="text-[22px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          Your clone link
        </h2>
        <div className="rounded-xl border border-[rgba(0,212,255,0.2)] bg-white/[0.03] px-5 py-5">
          <p className="text-[22px] italic text-[rgba(0,212,255,0.9)]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {url}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(`https://${url}`)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-[10px] text-white/70 hover:bg-white/[0.08]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? 'Copied' : 'Copy'}
            </button>
            <a
              href={`https://${url}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[10px] text-white/50 hover:text-white/75"
              style={{ fontFamily: "'DM Mono', monospace" }}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </a>
          </div>
        </div>
        <p className="text-[12px] text-white/35" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Share on socials from your published clone page once live.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-[22px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          Embed on your website
        </h2>
        <div className="relative rounded-xl border border-white/[0.08] bg-[#111] p-5">
          <button
            type="button"
            onClick={() => copy(snippet)}
            className="absolute right-4 top-4 text-[10px] text-[rgba(0,212,255,0.75)] hover:text-[rgba(0,212,255,1)]"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Copy code
          </button>
          <pre className="overflow-x-auto pt-8 text-[11px] leading-relaxed text-white/70" style={{ fontFamily: "'DM Mono', monospace" }}>
            <code>{snippet}</code>
          </pre>
        </div>
        <p className="text-[12px] text-white/35" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          The widget floats at the corner of your site, similar to support chat — styling matches your Alter theme.
        </p>
      </div>
    </div>
  );
};

export default ShareEmbed;
