/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'neon-green': '#00ff41',
        'neon-cyan': '#00ffff',
        'neon-pink': '#ff00ff',
        'dark-bg': '#0a0a0a',
        'dark-card': '#111111',
        'dark-border': '#222222',
      },
      animation: {
        'glitch': 'glitch 2s infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite alternate',
        'matrix-rain': 'matrix-rain 20s linear infinite',
        'flicker': 'flicker 3s ease-in-out infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'pulse-neon': {
          '0%': { 
            textShadow: '0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 20px #00ff41',
            boxShadow: '0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 20px #00ff41',
          },
          '100%': { 
            textShadow: '0 0 2px #00ff41, 0 0 5px #00ff41, 0 0 10px #00ff41',
            boxShadow: '0 0 2px #00ff41, 0 0 5px #00ff41, 0 0 10px #00ff41',
          },
        },
        'matrix-rain': {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(45deg, #00ff41, #00ffff, #ff00ff)',
      },
    },
  },
  plugins: [],
};