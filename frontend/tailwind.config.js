/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          accent: '#00E599',
          cyan: '#06B6D4',
          sapphire: '#3B82F6'
        },
        navy: {
          950: '#070B14',
          900: '#0B132B',
          850: '#0F1A36',
          800: '#162244',
          750: '#1C2C54',
          700: '#2A3C6E',
          600: '#3D5494',
        },
        surface: {
          dark: '#0B132B',
          'dark-elevated': '#111D3D',
          'dark-border': '#1E2D56',
          light: '#FFFFFF',
          'light-elevated': '#F8FAFC',
          'light-border': '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        'fintech': '0 4px 20px -2px rgba(11, 19, 43, 0.5), 0 2px 6px -1px rgba(0, 229, 153, 0.05)',
        'glow-emerald': '0 0 20px -5px rgba(0, 229, 153, 0.3)',
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.3)',
        'card-dark': '0 4px 24px -1px rgba(0, 0, 0, 0.4)',
        'card-light': '0 4px 24px -1px rgba(15, 23, 42, 0.08)'
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.25s ease-out forwards'
      }
    },
  },
  plugins: [],
}
