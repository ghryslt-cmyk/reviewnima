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
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f4f1ff',
          100: '#ebe4ff',
          200: '#d9ccff',
          300: '#bea6ff',
          400: '#9d73ff',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b0f73',
        },
        accent: {
          cyan: '#22d3ee',
          fuchsia: '#d946ef',
          violet: '#7c3aed',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c3aed 0%, #d946ef 50%, #22d3ee 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(217,70,239,0.12) 50%, rgba(34,211,238,0.12) 100%)',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(124, 58, 237, 0.35)',
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
