/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fluogreen: '#00ff00',
      },
      screens: {
        lgx: '1000px', // breakpoint personalizzato a 1000px
      },
    },
  },
  plugins: [],
}
