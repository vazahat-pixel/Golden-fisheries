/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-olive': '#6A7051',
        'brand-yellow': '#C5A021',
        'brand-dark': '#1F1F1F',
        'brand-light': '#F5F5EC',
      }
    },
  },
  plugins: [],
}
