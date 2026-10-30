/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        romantic: {
          50: '#fffbfb',
          100: '#fff1f2',
          200: '#ffe4e6',
          300: '#fecdd3',
          400: '#fda4af',
          500: '#fb7185',
          600: '#f43f5e',
          700: '#e11d48',
        },
        cream: {
          50: '#fffdfa',
          100: '#fefaf5',
          200: '#fbf4eb',
          300: '#f5e8d8',
          400: '#eedac4',
        },
        beige: {
          50: '#fcfaf8',
          100: '#f7efe5',
          200: '#ede0d4',
          300: '#ddc9b4',
        },
        mauve: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
        },
        gold: {
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          glow: 'rgba(212, 175, 55, 0.35)',
        }
      },
      fontFamily: {
        cairo: ['var(--font-cairo)', 'sans-serif'],
        amiri: ['var(--font-amiri)', 'serif'],
        marhey: ['var(--font-marhey)', 'cursive'],
        tajawal: ['var(--font-tajawal)', 'sans-serif'],
      },
      boxShadow: {
        'romantic': '0 10px 30px -5px rgba(244, 63, 94, 0.15), 0 0 20px 0 rgba(234, 179, 8, 0.1)',
        'romantic-lg': '0 20px 40px -10px rgba(244, 63, 94, 0.2), 0 0 30px 2px rgba(234, 179, 8, 0.15)',
        'gold-glow': '0 0 25px rgba(234, 179, 8, 0.3)',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.88', transform: 'scale(1.02)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
};

