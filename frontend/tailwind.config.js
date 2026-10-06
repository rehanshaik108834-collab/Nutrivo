/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        base: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface2)',
        primary: '#84cc16', // lime-500
        secondary: '#14b8a6', // teal-500
        accent: '#8b5cf6', // purple-500
      },
      animation: {
        'scan': 'scan 2s linear infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 20px rgba(132, 204, 22, 0.2)' },
          '50%': { opacity: .7, boxShadow: '0 0 35px rgba(132, 204, 22, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
