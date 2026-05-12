import React from 'react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    desc: 'Start cloning with core chat.',
    featured: false,
    cta: 'Current plan',
    disabled: true,
    border: 'border-white/[0.08]'
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    desc: 'Higher limits and analytics depth.',
    featured: true,
    cta: 'Upgrade to Pro',
    disabled: false,
    border: 'border-[rgba(0,212,255,0.35)] shadow-[0_0_24px_rgba(0,212,255,0.08)]'
  },
  {
    name: 'Creator',
    price: '$49',
    period: '/mo',
    desc: 'Voice cloning and priority training.',
    featured: false,
    cta: 'Upgrade to Creator',
    disabled: false,
    border: 'border-[rgba(124,58,237,0.35)]'
  }
];

const Billing = () => (
  <div className="mx-auto max-w-[1000px] space-y-10" data-scroll-section>
    <div className="rounded-[20px] border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.05)] px-6 py-6 md:px-10">
      <p className="text-[11px] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
        You are on the <strong className="font-normal text-white">Free</strong> plan
      </p>
      <div className="mt-3 h-1 max-w-xs overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full w-[5%] rounded-full bg-[rgba(0,212,255,0.88)]" />
      </div>
      <a href="#plans" className="mt-3 inline-block text-[10px] text-[#C084FC] hover:underline" style={{ fontFamily: "'DM Mono', monospace" }}>
        Compare plans →
      </a>
    </div>

    <div id="plans" className="grid gap-6 md:grid-cols-3">
      {plans.map((p) => (
        <div
          key={p.name}
          className={`relative flex flex-col rounded-2xl border bg-[#0D0D0D] p-6 ${p.border}`}
        >
          {p.featured ? (
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-[rgba(0,212,255,0.35)] bg-[#080808] px-3 py-0.5 text-[8px] uppercase tracking-widest text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
              Most popular
            </span>
          ) : null}
          <h3 className="text-[18px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            {p.name}
          </h3>
          <p className="mt-3 text-[28px] italic text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            {p.price}
            {p.period ? <span className="text-[14px] not-italic text-white/40">{p.period}</span> : null}
          </p>
          <p className="mt-2 text-[12px] text-white/45" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {p.desc}
          </p>
          <ul className="mt-4 flex-1 space-y-2 text-[12px] text-white/40" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <li>✓ Hosted clone page</li>
            <li>✓ Knowledge uploads</li>
            <li>✓ Shareable link</li>
          </ul>
          <button
            type="button"
            disabled={p.disabled}
            className={`mt-6 h-11 w-full rounded-[10px] text-[11px] transition ${
              p.disabled
                ? 'cursor-not-allowed border border-white/10 bg-white/[0.04] text-white/25'
                : p.name === 'Creator'
                  ? 'border border-[rgba(124,58,237,0.4)] bg-[#7C3AED] text-white hover:brightness-110'
                  : 'border border-[rgba(0,212,255,0.45)] bg-[rgba(0,212,255,0.12)] text-[rgba(0,212,255,0.88)] hover:bg-[rgba(0,212,255,0.18)]'
            }`}
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {p.cta}
          </button>
        </div>
      ))}
    </div>

    <div className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-6">
      <h4 className="text-[14px] text-white/80" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        Billing history
      </h4>
      <p className="mt-4 text-[12px] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
        No invoices yet.
      </p>
    </div>
  </div>
);

export default Billing;
