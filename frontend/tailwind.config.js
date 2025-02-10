/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mynt-green': '#2a9d74',
        'mynt-green-200': '#3bb38a',
        'mynt-gray-200': '#eeeeee',
        'mynt-gray-300': '#d4d4d4',
        'mynt-gray-400': '#505762',
        'mynt-gray-500': '#393e46',
        'white': '#ffffff',
        'black': '#000000'
      },
      width: {
        '18': '4.5rem', // 72px
      }
    },
  },
  plugins: [],
}