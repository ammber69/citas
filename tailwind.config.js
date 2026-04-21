/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nissan: {
          red: '#C3002F',
          dark: '#111111',
          gray: '#222222',
          lightGray: '#F5F5F5',
        }
      },
      fontFamily: {
        nissan: ['Nissan Brand', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
