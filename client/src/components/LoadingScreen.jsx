import React from 'react';

const LoadingScreen = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center">
      <p
        className="text-[#F0EEF8] mb-5"
        style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', letterSpacing: '0.35em' }}
      >
        ALTER
      </p>
      <div className="w-28 h-[1px] bg-[#7C3AED] animate-pulse mb-3" />
      <p className="text-[12px] text-[#F0EEF8]/60" style={{ fontFamily: "'DM Mono', monospace" }}>
        {text}
      </p>
    </div>
  );
};

export default LoadingScreen;
