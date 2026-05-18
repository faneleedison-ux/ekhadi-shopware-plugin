import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // e-Khadi Dawn brand palette
        primary: {
          DEFAULT: '#E11D2A',  // Dawn red
          dark: '#A60E1A',
          light: '#FBEAE8',   // light red tint
          foreground: '#FFFFFF',
        },
        background: '#F7F2E8',  // warm cream (paper-light)
        sidebar: '#0A0E1F',     // night dark
        card: {
          DEFAULT: '#F2E9D6',
          foreground: '#14130E',
        },
        'text-primary': '#14130E',  // near-black ink
        'text-secondary': '#5a5650',
        success: '#3F7B4F',  // leaf green
        warning: '#B47023',  // amber
        danger: '#E11D2A',   // dawn red
        border: '#E2D9CE',   // warm cream border
        input: '#E2D9CE',
        ring: '#E11D2A',
        // shadcn compatibility
        foreground: '#14130E',
        secondary: {
          DEFAULT: '#EDE5D8',
          foreground: '#14130E',
        },
        muted: {
          DEFAULT: '#EDE5D8',
          foreground: '#5a5650',
        },
        accent: {
          DEFAULT: '#FBEAE8',
          foreground: '#E11D2A',
        },
        destructive: {
          DEFAULT: '#E11D2A',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#14130E',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      fontFamily: {
        sans:  ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono:  ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
