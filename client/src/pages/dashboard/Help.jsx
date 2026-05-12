import React from 'react';

const Help = () => (
  <div className="mx-auto max-w-[640px]" data-scroll-section>
    <h2 className="text-[28px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
      Help & docs
    </h2>
    <p className="mt-2 text-[13px] text-white/45" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      Quick answers while we finish the knowledge base.
    </p>
    <ul className="mt-8 space-y-3">
      {[
        'Getting started: create your first clone',
        'What data does Alter use to train?',
        'Voice cloning and creator plan',
        'Embedding the widget on your site'
      ].map((item) => (
        <li key={item}>
          <button
            type="button"
            className="w-full rounded-xl border border-white/[0.06] bg-[#0D0D0D] px-4 py-3 text-left text-[13px] text-white/60 transition hover:border-[rgba(0,212,255,0.2)] hover:text-white/85"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {item} →
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default Help;
