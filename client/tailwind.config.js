/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Workshop Hub Dark Gen Z theme tokens
        dark: {
          bg: '#0a0a0a',
          surface: '#111111',
          card: '#161616',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        gold: {
          DEFAULT: '#C9A24D',
          light: '#DFBE74',
          dark: '#A8842F',
        },
        violet: {
          DEFAULT: '#7C5CFF',
          light: '#9B82FF',
          dark: '#5E3DDA',
        },
        cream: {
          DEFAULT: '#161616',
          dark: '#111111',
        },
        navy: {
          DEFAULT: '#F5F5F0',
          light: '#D4D4CE',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          light: 'rgba(255, 255, 255, 0.12)',
        },
        muted: '#8A8A85',
        subtle: '#4A4A48',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Bebas Neue', 'Space Grotesk', 'Syne', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
        bebas: ['Bebas Neue', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
        orbitron: ['Space Grotesk', 'sans-serif'],
      },
      fontSize: {
        'hero-giant': ['clamp(3.5rem, 14vw, 12.5rem)', { lineHeight: '0.85', letterSpacing: '-0.03em' }],
        'display-xl': ['clamp(3rem, 8vw, 6rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'display-sm': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.2' }],
      },
      spacing: {
        section: 'clamp(4rem, 8vw, 8rem)',
        'section-sm': 'clamp(3rem, 6vw, 6rem)',
      },
      borderRadius: {
        card: '22px',
        bento: '28px',
        badge: '100px',
        input: '14px',
      },
      maxWidth: {
        content: '1240px',
        narrow: '800px',
        wide: '1440px',
      },
      boxShadow: {
        card: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'card-hover': '0 16px 48px rgba(0, 0, 0, 0.7), 0 0 24px rgba(201, 162, 77, 0.15)',
        'gold-glow': '0 0 35px rgba(201, 162, 77, 0.3)',
        'violet-glow': '0 0 35px rgba(124, 92, 255, 0.3)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
        smooth: '400ms',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse_soft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        drawLine: {
          '0%': { scaleY: 0 },
          '100%': { scaleY: 1 },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        pulse_soft: 'pulse_soft 3s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
        drawLine: 'drawLine 0.6s ease-out forwards',
        fadeIn: 'fadeIn 0.4s ease-out forwards',
        slideUp: 'slideUp 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
