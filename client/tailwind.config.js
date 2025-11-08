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
        navy: {
          DEFAULT: '#0B1B3F',
          light: '#1a2951',
          dark: '#050e21',
        },
        emerald: {
          DEFAULT: '#00C896',
          light: '#1fd9a8',
          dark: '#00a07a',
        },
        sky: {
          DEFAULT: '#1CA9F4',
          light: '#68E1FD',
        },
        background: '#F4F7F8',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 200, 150, 0.3)',
        'glow-blue': '0 0 20px rgba(28, 169, 244, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
