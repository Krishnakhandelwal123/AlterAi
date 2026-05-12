import React from 'react';

/** Starting-phase placeholder for extra sidebar destinations. */
const DashboardPlaceholder = ({ title, subtitle = 'Coming in a future release.' }) => (
  <div className="mx-auto max-w-[640px] py-8 md:py-12" data-scroll-section>
    <h1 className="text-[26px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
      {title}
    </h1>
    <p className="mt-3 text-[14px] leading-relaxed text-white/45" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {subtitle}
    </p>
  </div>
);

export default DashboardPlaceholder;
