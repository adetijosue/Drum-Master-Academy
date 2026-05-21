/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '400px',
      },
      colors: {
        obsidian: {
          DEFAULT: '#09090b',
          light: '#18181b',
          card: '#121214',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        gold: {
          50: '#fbf8eb',
          100: '#f4ecce',
          200: '#e9d99c',
          300: '#dbbe62',
          400: '#cfa63b',
          500: '#d4af37', // metallic gold base
          600: '#b28e27',
          700: '#906d1c',
          800: '#755618',
          900: '#644818',
          950: '#3a270b'
        },
        // Semantic status colors
        success: {
          DEFAULT: '#22c55e',
          muted: 'rgba(34, 197, 94, 0.1)',
        },
        danger: {
          DEFAULT: '#f43f5e',
          muted: 'rgba(244, 63, 94, 0.1)',
        },
        info: {
          DEFAULT: '#3b82f6',
          muted: 'rgba(59, 130, 246, 0.1)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif']
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.15)',
        'gold-glow-intense': '0 0 25px rgba(212, 175, 55, 0.35)',
        'gold-glow-subtle': '0 0 8px rgba(212, 175, 55, 0.08)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-card-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.45)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.3)' },
          '50%': { boxShadow: '0 0 15px 5px rgba(212, 175, 55, 0.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
    },
  },
  plugins: [],
}
