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
        // e-Khadi — Clean Slate (Capitec / Revolut)
        primary: {
          DEFAULT: '#00C2B2',
          dark: '#009B8D',
          light: '#E0F9F7',
          foreground: '#FFFFFF',
        },
        background: '#F0F4F8',
        sidebar: '#1A1A2E',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A2E',
        },
        'text-primary': '#1A1A2E',
        'text-secondary': '#64748B',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        border: '#E2E8F0',
        input: '#FFFFFF',
        ring: '#00C2B2',
        // shadcn compatibility
        foreground: '#1A1A2E',
        secondary: {
          DEFAULT: '#F0F4F8',
          foreground: '#1A1A2E',
        },
        muted: {
          DEFAULT: '#F0F4F8',
          foreground: '#64748B',
        },
        accent: {
          DEFAULT: '#E0F9F7',
          foreground: '#00C2B2',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A2E',
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
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
