/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#800020',
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f2a8b8',
          400: '#e87590',
          500: '#d44568',
          600: '#800020',
          700: '#6b001b',
          800: '#5a0018',
          900: '#4a0014',
        },
        category: {
          food: '#800020',
          shopping: '#F472B6',
          groceries: '#FB923C',
          transport: '#A78BFA',
          other: '#60A5FA',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px -4px rgba(128, 0, 32, 0.08), 0 2px 8px -2px rgba(0,0,0,0.04)',
        soft: '0 2px 12px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'coin-drop': {
          '0%': { transform: 'translateY(-18px) rotate(-20deg)', opacity: '0' },
          '40%': { opacity: '1' },
          '100%': { transform: 'translateY(0) rotate(12deg)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        'coin-drop': 'coin-drop 1.4s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}
