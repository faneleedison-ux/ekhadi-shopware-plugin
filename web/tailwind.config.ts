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
        // e-Khadi brand colors
        primary: {
          DEFAULT: '#1877F2',
          dark: '#166FE5',
          light: '#E7F3FF',
          foreground: '#FFFFFF',
        },
        background: '#F0F2F5',
        sidebar: '#1877F2',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1C1E21',
        },
        'text-primary': '#1C1E21',
        'text-secondary': '#65676B',
        success: '#42B883',
        warning: '#F7B928',
        danger: '#FA383E',
        border: '#E4E6EB',
        input: '#E4E6EB',
        ring: '#1877F2',
        // shadcn compatibility
        foreground: '#1C1E21',
        secondary: {
          DEFAULT: '#F0F2F5',
          foreground: '#1C1E21',
        },
        muted: {
          DEFAULT: '#F0F2F5',
          foreground: '#65676B',
        },
        accent: {
          DEFAULT: '#E7F3FF',
          foreground: '#1877F2',
        },
        destructive: {
          DEFAULT: '#FA383E',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1C1E21',
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
