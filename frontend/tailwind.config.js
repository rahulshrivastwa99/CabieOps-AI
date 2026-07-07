/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: ['15px', '1.6'],
      },
      keyframes: {
        highlightIn: {
          '0%':   { backgroundColor: 'rgb(219 234 254)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        highlightIn: 'highlightIn 1200ms ease-out',
      },
    },
  },
  plugins: [],
};
