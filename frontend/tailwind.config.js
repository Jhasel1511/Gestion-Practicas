/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF4',
          100: '#F7EDD8',
          200: '#E9DDBD',  // Soft gold
          300: '#D6C08A',
          400: '#C5A04B',  // Institutional gold
          500: '#C5A04B',
          600: '#B08E3B',
          700: '#8E712B',
          800: '#6C541D',
          DEFAULT: '#C5A04B',
        },
        dark: {
          DEFAULT: '#292929',
          text: '#292929',
          soft: '#3D3D3D',
        },
        muted: {
          DEFAULT: '#777777',
          light: '#A0A0A0',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          warm: '#FAFAF8',
          bg: '#F5F5F3',
          border: '#EAE8E2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Cinzel', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 1px 8px -2px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)',
        'card': '0 1px 3px 0 rgba(0,0,0,0.06)',
        'gold-sm': '0 2px 8px -1px rgba(197,160,75,0.18)',
        'gold-md': '0 4px 16px -2px rgba(197,160,75,0.28)',
      },
      borderColor: {
        DEFAULT: '#EAE8E2',
      },
    },
  },
  plugins: [],
}
