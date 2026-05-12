import React from 'react';

/** Compact progress block — widthClass e.g. w-[160px] or w-[200px] */
const TrainingSummaryBar = ({ barWidthClass = 'w-[160px]', labelClass = '', variant = 'header', align = 'right' }) => {
  const labelMuted = variant === 'footer' ? 'text-white/20' : 'text-white/25';
  const trainedClass = variant === 'footer' ? 'text-[10px]' : 'text-[9px]';
  const rootAlign = align === 'center' ? 'text-center' : 'text-right';
  const barMargin = align === 'center' ? 'mx-auto' : 'ml-auto';
  return (
    <div className={`${rootAlign} ${labelClass}`}>
      <p className={`text-[8px] uppercase tracking-wide ${labelMuted}`} style={{ fontFamily: "'DM Mono', monospace" }}>
        Personality strength
      </p>
      <div className={`mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06] ${barWidthClass} ${barMargin}`}>
        <div
          className="h-full w-[72%] rounded-full"
          style={{
            background: 'linear-gradient(90deg, rgba(0,212,255,0.88), #7C3AED)'
          }}
        />
      </div>
      <p className={`mt-1 ${trainedClass} text-[rgba(0,212,255,0.88)]`} style={{ fontFamily: "'DM Mono', monospace" }}>
        72% Trained
      </p>
    </div>
  );
};

export default TrainingSummaryBar;
