/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Sora', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdbff',
          300: '#8ec4ff',
          400: '#59a3ff',
          500: '#3182ff',
          600: '#1a63f0',
          700: '#1550d4',
          800: '#1843ab',
          900: '#193c86',
        },
        accent: {
          blue: '#3182ff',
          indigo: '#4f46e5',
          sky: '#38bdf8',
          cyan: '#22d3ee',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1550d4 0%, #3182ff 45%, #22d3ee 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(21,80,212,0.12) 0%, rgba(49,130,255,0.12) 50%, rgba(34,211,238,0.12) 100%)',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(49, 130, 255, 0.35)',
        'glow-cyan': '0 0 40px rgba(34, 211, 238, 0.30)',
        'soft': '0 20px 50px -12px rgba(15, 23, 42, 0.25)',
        'card': '0 10px 40px -12px rgba(15, 23, 42, 0.18)',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
      },
      animation: {
        ticker: 'ticker 40s linear infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
}
