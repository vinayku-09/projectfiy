/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This line is critical!
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0B0E14',
        cardBg: '#161B22',
        accentViolet: '#7C3AED',
      },
    },
  },
  plugins: [],
}