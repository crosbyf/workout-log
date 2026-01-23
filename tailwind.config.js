/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'border-cyan-400',
    'bg-cyan-400',
    'bg-cyan-500/10',
    'text-cyan-400',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
