/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Workshop Hub Minimal Light theme tokens
        gold: {
          DEFAULT: '#C8A24F',
          light: '#D4B068',
          dark: '#A8842F',
        },
        cream: {
          DEFAULT: '#FAFAFA',
          dark: '#F5F5F5',
        },
        navy: {
          DEFAULT: '#0A0A0A',
          light: '#1A1A2E',
        },
        border: {
          DEFAULT: '#E8E8E8',
          light: '#F0F0F0',
        },
        muted: '#6B7280',
        subtle: '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        orbitron: ['Orbitron', 'Space Grotesk', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(3rem, 8vw, 6rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'display-sm': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.2' }],
      },
      spacing: {
        section: 'clamp(4rem, 8vw, 8rem)',
        'section-sm': 'clamp(3rem, 6vw, 6rem)',
      },
      borderRadius: {
        card: '16px',
        badge: '100px',
        input: '10px',
      },
      maxWidth: {
        content: '1200px',
        narrow: '800px',
        wide: '1400px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.08)',
        'gold-glow': '0 0 20px rgba(200, 162, 79, 0.3)',
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
