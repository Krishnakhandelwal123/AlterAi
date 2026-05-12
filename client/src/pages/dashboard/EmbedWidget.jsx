import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Copy } from 'lucide-react';

const EmbedWidget = () => {
  const { user } = useAuth();
  const slug = (user?.name || user?.email?.split('@')[0] || 'yourname').toLowerCase().replace(/\s+/g, '');
  const iframe = `<iframe src="https://alter.ai/embed/${slug}" width="380" height="560" style="border:0;border-radius:16px" loading="lazy" title="Alter AI"></iframe>`;

  return (
    <div className="mx-auto max-w-[720px] space-y-6" data-scroll-section>
      <h2 className="text-[28px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
        Embed widget
      </h2>
      <p className="text-[13px] leading-relaxed text-white/45" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        Drop an iframe for a fixed-size embed, or use the script snippet on the Share & Embed page for the floating widget.
      </p>
      <div className="relative rounded-xl border border-white/[0.08] bg-[#111] p-5">
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(iframe)}
          className="absolute right-4 top-4 inline-flex items-center gap-1 text-[10px] text-[rgba(0,212,255,0.8)]"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          <Copy className="h-3 w-3" /> Copy
        </button>
        <pre className="overflow-x-auto pt-8 text-[10px] text-white/65" style={{ fontFamily: "'DM Mono', monospace" }}>
          <code>{iframe}</code>
        </pre>
      </div>
    </div>
  );
};

export default EmbedWidget;
