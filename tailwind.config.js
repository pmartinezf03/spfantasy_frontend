/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,ts}"
    ],
    theme: {
      extend: {
        colors: {
          fantasyBlue: '#0ea5e9',
          fantasyPurple: '#7c3aed',
          fantasyDark: '#1e293b',
          fantasyGold: '#fbbf24',
          fantasyRed: '#ef4444'
        },
        fontFamily: {
          futuristic: ['Orbitron', 'sans-serif']
        }
      },
    },
    plugins: [],
  }
