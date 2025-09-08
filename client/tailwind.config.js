/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'plaid-blue': '#0066cc',
        'plaid-dark': '#1a1a1a',
        'plaid-gray': '#f8f9fa',
      }
    },
  },
  plugins: [],
}