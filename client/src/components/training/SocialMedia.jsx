import React from 'react';
import { Pill, StatTrio, SyncDisconnectRow } from './PlatformCard';

const IconX = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const IconGithub = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
    <defs>
      <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="50%" stopColor="#e6683c" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <path
      fill="url(#ig)"
      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
    />
  </svg>
);

const IconLinkedin = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#0077B5]" fill="currentColor" aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const IconReddit = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#FF4500]" fill="currentColor" aria-hidden>
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.493l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const IconMedium = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden>
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
  </svg>
);

const IconNotion = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden>
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.465l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.22.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.454-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933zM1.936 1.035l13.31-.98c1.635-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
  </svg>
);

const SocialMedia = () => (
  <div className="space-y-8">
    <div className="flex flex-col gap-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[10px] text-white/50" style={{ fontFamily: "'DM Mono', monospace" }}>
        2 platforms connected
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black px-2.5 py-1 text-[9px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
          <IconX /> @krishna_dev
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF4500] px-2.5 py-1 text-[9px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
          <IconReddit /> u/krishna
        </span>
      </div>
      <p className="text-[9px] text-[rgba(0,212,255,0.88)] sm:ml-auto" style={{ fontFamily: "'DM Mono', monospace" }}>
        4,891 pieces of content imported
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      {/* Twitter connected */}
      <div className="rounded-2xl border border-white/15 bg-black/40 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <IconX />
            <span className="text-[12px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
              Twitter / X
            </span>
          </div>
          <Pill className="bg-[rgba(0,212,255,0.12)] text-[rgba(0,212,255,0.88)]">Most popular</Pill>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
          <span className="text-[10px] text-emerald-600" style={{ fontFamily: "'DM Mono', monospace" }}>
            @krishna_dev · Connected
          </span>
        </div>
        <StatTrio
          items={[
            { value: '3,200', label: 'Tweets imported' },
            { value: '0', label: 'Retweets' },
            { value: '2h ago', label: 'Last sync' }
          ]}
        />
        <SyncDisconnectRow />
        <div className="mt-4">
          <Pill className="bg-[#7C3AED]/20 text-[#C084FC]">Creator</Pill>
        </div>
      </div>

      {/* GitHub disconnected */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0D0D0D] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <IconGithub />
            <span className="text-[12px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
              GitHub
            </span>
          </div>
          <Pill className="bg-[rgba(0,212,255,0.1)] text-[rgba(0,212,255,0.88)]">Pro</Pill>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-white/35" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Import README files, repo descriptions, and your GitHub discussions.
        </p>
        <ul className="mt-3 space-y-1 text-[9px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
          <li>· README files from all repos</li>
          <li>· Repository descriptions</li>
          <li>· Discussions & comments</li>
        </ul>
        <span
          className="mt-4 flex h-10 w-full cursor-default items-center justify-center rounded-[10px] border border-[rgba(110,64,201,0.25)] bg-[rgba(110,64,201,0.1)] text-[11px] text-[#a78bfa]"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Connect GitHub →
        </span>
      </div>

      {/* Instagram */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0D0D0D] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <IconInstagram />
            <span className="text-[12px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
              Instagram
            </span>
          </div>
          <Pill className="bg-[#7C3AED]/20 text-[#C084FC]">Creator</Pill>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-white/35" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Import captions from your public posts, reels, and stories.
        </p>
        <div className="mt-2.5 rounded-lg border border-amber-500/15 bg-amber-500/[0.05] px-3 py-2.5">
          <p className="text-[9px] text-amber-500" style={{ fontFamily: "'DM Mono', monospace" }}>
            ⚠ Public accounts only
          </p>
        </div>
        <span
          className="mt-4 flex h-10 w-full cursor-default items-center justify-center rounded-[10px] border border-pink-500/20 bg-pink-500/[0.08] text-[11px] text-pink-400"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Connect Instagram →
        </span>
      </div>

      {/* LinkedIn */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0D0D0D] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <IconLinkedin />
            <span className="text-[12px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
              LinkedIn
            </span>
          </div>
          <Pill className="bg-[rgba(0,212,255,0.1)] text-[rgba(0,212,255,0.88)]">Pro</Pill>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-white/35" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Import your posts, articles, and professional profile content.
        </p>
        <ul className="mt-3 space-y-1 text-[9px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
          <li>· All posts and articles</li>
          <li>· Profile summary</li>
          <li>· Comment history</li>
        </ul>
        <span
          className="mt-4 flex h-10 w-full cursor-default items-center justify-center rounded-[10px] border border-[rgba(0,119,181,0.2)] bg-[rgba(0,119,181,0.08)] text-[11px] text-blue-400"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Connect LinkedIn →
        </span>
      </div>

      {/* Reddit connected */}
      <div className="rounded-2xl border border-[#FF4500]/20 bg-[#FF4500]/[0.04] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <IconReddit />
            <span className="text-[12px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
              Reddit
            </span>
          </div>
          <Pill className="bg-emerald-500/15 text-emerald-500">Free</Pill>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
          <span className="text-[10px] text-emerald-600" style={{ fontFamily: "'DM Mono', monospace" }}>
            u/krishna_dev · Connected
          </span>
        </div>
        <StatTrio
          items={[
            { value: '234', label: 'Posts' },
            { value: '1,891', label: 'Comments' },
            { value: '1h ago', label: 'Last sync' }
          ]}
        />
        <SyncDisconnectRow />
      </div>

      {/* Medium */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0D0D0D] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <IconMedium />
            <span className="text-[12px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
              Medium
            </span>
          </div>
          <Pill className="bg-emerald-500/15 text-emerald-500">Free</Pill>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-white/35" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Auto-import all your Medium articles via RSS. No login required.
        </p>
        <label className="mt-3 block text-[8px] uppercase tracking-wide text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
          Your medium url
        </label>
        <div className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-[11px] leading-10 text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
          medium.com/@yourusername
        </div>
        <span
          className="mt-4 flex h-10 w-full cursor-default items-center justify-center rounded-[10px] border border-white/12 bg-white/[0.05] text-[11px] text-white/70"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Import Medium →
        </span>
      </div>

      {/* Notion */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0D0D0D] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <IconNotion />
            <span className="text-[12px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
              Notion
            </span>
          </div>
          <Pill className="bg-[rgba(0,212,255,0.1)] text-[rgba(0,212,255,0.88)]">Pro</Pill>
        </div>
        <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-white/35" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Connect your workspace. Import only the pages you choose — fully private and selective.
        </p>
        <div className="mt-2.5 max-w-xl rounded-lg border border-emerald-500/12 bg-emerald-500/[0.05] px-3 py-2.5">
          <p className="text-[9px] text-emerald-600" style={{ fontFamily: "'DM Mono', monospace" }}>
            🔒 Only pages you select are imported
          </p>
        </div>
        <span
          className="mt-4 inline-flex h-10 cursor-default items-center justify-center rounded-[10px] border border-white/12 bg-white/[0.05] px-8 text-[11px] text-white/70"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Connect Notion →
        </span>
      </div>
    </div>
  </div>
);

export default SocialMedia;
