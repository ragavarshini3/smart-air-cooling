/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#0284c7',
          600: '#026597',
          700: '#034e75',
          900: '#072b43',
        },
        slate: {
          850: '#151e2e',
          900: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}
