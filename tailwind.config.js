/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nagpur: {
          navy: {
            dark: '#0B192C',
            DEFAULT: '#1E3E62',
            light: '#2E5A88',
            soft: '#F0F5FA',
          },
          yellow: {
            DEFAULT: '#F9D949',
            dark: '#E2B808',
            light: '#FFF9D2',
          },
          slate: '#475569',
          accent: '#F4B41A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'sans-serif'],
      },
      animation: {
        'ticker': 'ticker 35s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
}
