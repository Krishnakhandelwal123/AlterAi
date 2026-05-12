import React from 'react';

const icons = {
  google: (
    <svg viewBox="0 0 48 48" className="w-5 h-5">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.3 35.1 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.4 39.5 16.1 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3 5.1-5.7 6.6l6.2 5.2C39.3 36.6 44 30.8 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.61-3.37-1.19-3.37-1.19-.45-1.16-1.1-1.47-1.1-1.47-.9-.61.07-.6.07-.6 1 .07 1.52 1.02 1.52 1.02.88 1.52 2.32 1.08 2.88.83.09-.64.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.84a9.6 9.6 0 0 1 2.5.34c1.91-1.3 2.75-1.02 2.75-1.02.55 1.41.2 2.45.1 2.71.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.58 4.94.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.4L6.5 22H3.4l7.25-8.28L.8 2h6.4l4.41 5.82L18.9 2zM17.8 20h1.73L6.28 3.9H4.43L17.8 20z" />
    </svg>
  )
};

const OAuthButton = ({ provider, label, loading, disabled, onClick }) => {
  const connecting = loading;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || connecting}
      className={`w-full h-[52px] rounded-[14px] border px-4 flex items-center justify-center gap-3 transition-all duration-250 ${
        connecting ? 'opacity-85' : 'hover:border-[#7C3AED]/60 hover:bg-[#7C3AED]/10'
      } bg-white/[0.04] border-white/10 text-white/85 text-[12px]`}
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      <span className="absolute left-5">{icons[provider]}</span>
      {connecting ? 'Connecting...' : label}
    </button>
  );
};

export default OAuthButton;
