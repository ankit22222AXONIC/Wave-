/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shell: '#09090B',
        main: '#121215',
        card: '#1C1C21',
        border: '#27272A',
        neutralGray: '#3F3F46',
        accent: '#FFFFFF',
        textMuted: '#A1A1AA',
        textSubtle: '#71717A',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        equalizer1: {
          '0%, 100%': { height: '4px' },
          '50%': { height: '14px' },
        },
        equalizer2: {
          '0%, 100%': { height: '12px' },
          '50%': { height: '4px' },
        },
        equalizer3: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '16px' },
        },
      },
      animation: {
        'equalizer-1': 'equalizer1 0.8s ease-in-out infinite',
        'equalizer-2': 'equalizer2 0.6s ease-in-out infinite',
        'equalizer-3': 'equalizer3 0.7s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
