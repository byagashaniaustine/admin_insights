/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Red Hat Display"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        fin: {
          50:  '#E5EFFC',
          100: '#C3D9F9',
          200: '#93C8FD',
          300: '#5AA2F7',
          400: '#3B82F6',
          500: '#1570EF',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#1E3163',
        },
        canvas:  '#F4F5F4',
        surface: '#FFFFFF',
        ink:     '#231F20',
      },
      borderRadius: { card: '12px', input: '8px' },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(7px)' },
          to:   { opacity: '1', transform: 'none' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pingDot: {
          '0%':        { transform: 'scale(0.6)', opacity: '0.6' },
          '80%, 100%': { transform: 'scale(1.7)', opacity: '0' },
        },
      },
      animation: {
        fadeUp:  'fadeUp 0.4s cubic-bezier(0.2,0.7,0.2,1) both',
        shimmer: 'shimmer 2s infinite',
        pingDot: 'pingDot 1.8s cubic-bezier(0,0,0.2,1) infinite',
      },
    },
  },
  plugins: [],
};
