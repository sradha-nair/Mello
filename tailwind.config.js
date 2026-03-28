/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        mello: {
          bg: '#F5F3FF',
          primary: '#C4B5FD',
          secondary: '#EDE9FE',
          accent: '#FBCFE8',
          text: '#2D2A32',
          'text-soft': '#6B6578',
          'text-muted': '#A89DB8',
          success: '#BBF7D0',
          'success-text': '#166534',
          card: '#FFFFFF',
          border: '#E9E4F7',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(196, 181, 253, 0.25)',
        card: '0 2px 16px -2px rgba(45, 42, 50, 0.08)',
        glow: '0 0 32px rgba(196, 181, 253, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'sparkle': 'sparkle 1.2s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'confetti-fall': 'confettiFall 3s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.15)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
