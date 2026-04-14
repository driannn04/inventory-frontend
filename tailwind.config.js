/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Soft white colors to avoid #ffffff harshness
        'surface-light': '#f8fafc', // slate-50 (softer than #fdfdfd)
        'surface': '#f1f5f9',       // slate-100 (softer white)
        'surface-dark': '#e2e8f0',  // slate-200
        'app-bg': '#e0e7ff',        // indigo-50 context background for smooth ui
      }
    },
  },
  plugins: [],
}