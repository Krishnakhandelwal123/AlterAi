import React from 'react';
import { Globe, Trash2 } from 'lucide-react';

const PillBadge = ({ children }) => (
  <span className="rounded-full bg-[rgba(0,212,255,0.08)] px-2 py-0.5 text-[9px] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
    {children}
  </span>
);

const LinksRSS = () => (
  <div className="space-y-8">
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 md:px-5">
      <p className="text-[13px] leading-relaxed text-white/40" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        Paste any public URL — blog posts, podcast show notes, interviews, press features.
      </p>
    </div>

    <div>
      <div className="flex h-12 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]">
        <div className="min-w-0 flex-1 px-4 text-[12px] leading-[48px] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
          https://yourblog.com/article...
        </div>
        <span
          className="flex shrink-0 cursor-default items-center border-l border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.1)] px-5 text-[11px] text-[rgba(0,212,255,0.88)]"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Import
        </span>
      </div>
      <p className="mt-3 text-[9px] text-white/20" style={{ fontFamily: "'DM Mono', monospace" }}>
        Blog posts · Substack · Podcast notes · Press interviews · Personal websites
      </p>
    </div>

    <div>
      <p className="text-[8px] uppercase tracking-wide text-white/20" style={{ fontFamily: "'DM Mono', monospace" }}>
        Or add RSS feed
      </p>
      <p className="mt-0.5 text-[9px] text-white/15" style={{ fontFamily: "'DM Mono', monospace" }}>
        Auto-imports new content automatically
      </p>
      <div className="mt-3 flex h-12 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]">
        <div className="min-w-0 flex-1 px-4 text-[12px] leading-[48px] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
          https://yourblog.com/feed.rss
        </div>
        <span
          className="flex shrink-0 cursor-default items-center border-l border-white/[0.08] bg-white/[0.04] px-5 text-[11px] text-white/50"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Add Feed
        </span>
      </div>
    </div>

    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[9px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
          Imported Links
        </p>
        <PillBadge>2 links</PillBadge>
      </div>
      <div className="space-y-0 rounded-xl border border-white/[0.06] bg-[#0D0D0D] px-4">
        <div className="flex items-center gap-4 border-b border-white/[0.05] py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(0,212,255,0.08)]">
            <Globe className="h-4 w-4 text-[rgba(0,212,255,0.88)]" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
              How I Built My First SaaS in 30 Days
            </p>
            <p className="mt-0.5 text-[9px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
              blog.krishna.dev
            </p>
            <p className="mt-0.5 text-[9px] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
              Extracted: 2,400 words
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[8px] text-emerald-600" style={{ fontFamily: "'DM Mono', monospace" }}>
              ✓ Trained
            </span>
            <Trash2 className="h-4 w-4 text-white/15" strokeWidth={1.5} aria-hidden />
          </div>
        </div>
        <div className="flex items-center gap-4 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(0,212,255,0.08)]">
            <Globe className="h-4 w-4 text-[rgba(0,212,255,0.88)]" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
              Interview: AI Trends in 2025
            </p>
            <p className="mt-0.5 text-[9px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
              techcrunch.com
            </p>
            <p className="mt-0.5 text-[9px] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
              Extracted: 1,890 words
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-[8px] text-amber-500" style={{ fontFamily: "'DM Mono', monospace" }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
              </span>
              ⟳ Processing
            </span>
            <Trash2 className="h-4 w-4 text-white/15" strokeWidth={1.5} aria-hidden />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default LinksRSS;
