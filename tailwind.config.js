/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#050510',
        primary: '#FFFFFF',
        secondary: '#A0A0B8',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-shimmer': 'linear-gradient(90deg, rgba(255,255,255,0.01) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.01) 75%)',
      },
    },
  },
  plugins: [],
}
