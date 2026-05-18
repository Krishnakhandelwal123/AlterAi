import React from 'react';

const AmbientBackground = () => (
  <>
    {/* Noise Grain Overlay */}
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity: 0.035
      }}
    />

    {/* Ambient Glow Orbs */}
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      {/* Orb 1: Top Center */}
      <div
        className="ambient-orb orb-1"
        style={{
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
          position: 'absolute',
          top: -200,
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'drift-orb-1 12s ease-in-out infinite alternate'
        }}
      />

      {/* Orb 2: Bottom Left */}
      <div
        className="ambient-orb orb-2"
        style={{
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)',
          position: 'absolute',
          bottom: 0,
          left: -100,
          animation: 'drift-orb-2 12s ease-in-out infinite alternate'
        }}
      />
    </div>

    <style>{`
      @keyframes drift-orb-1 {
        from { transform: translateX(-50%) translate(0, 0); }
        to   { transform: translateX(-50%) translate(20px, -20px); }
      }
      @keyframes drift-orb-2 {
        from { transform: translate(0, 0); }
        to   { transform: translate(20px, -20px); }
      }
    `}</style>
  </>
);

export default AmbientBackground;
