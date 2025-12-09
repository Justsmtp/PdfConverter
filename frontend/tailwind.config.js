/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#00ff66',
        'neon-dark': '#00e676',
        neon: {
          green: '#00ff66',
          dark: '#00e676',
        },
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00ff66, 0 0 10px #00ff66, 0 0 15px #00ff66' },
          '100%': { boxShadow: '0 0 10px #00ff66, 0 0 20px #00ff66, 0 0 30px #00ff66' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px #00ff66' },
          '50%': { opacity: '.8', boxShadow: '0 0 40px #00ff66' },
        },
      },
    },
  },
  plugins: [],
}