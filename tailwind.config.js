/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {},
  },
  safelist: [
    // Preset colors - need to be safelisted because they're dynamically generated
    'border-blue-400', 'border-purple-400', 'border-green-400', 'border-yellow-400',
    'border-red-400', 'border-pink-400', 'border-orange-400', 'border-cyan-400',
    'bg-blue-500/10', 'bg-purple-500/10', 'bg-green-500/10', 'bg-yellow-500/10',
    'bg-red-500/10', 'bg-pink-500/10', 'bg-orange-500/10', 'bg-cyan-500/10',
    'text-blue-400', 'text-purple-400', 'text-green-400', 'text-yellow-400',
    'text-red-400', 'text-pink-400', 'text-orange-400', 'text-cyan-400',
    'bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-yellow-400',
    'bg-red-400', 'bg-pink-400', 'bg-orange-400', 'bg-cyan-400',
    // Theme classes - dynamically applied from themeStore
    'bg-gray-50', 'bg-gray-900', 'bg-black', 'bg-green-950',
    'text-gray-900', 'text-white', 'text-green-50',
    'bg-white', 'bg-gray-800', 'bg-zinc-950', 'bg-green-800',
    'border-gray-200', 'border-gray-700', 'border-green-500/30', 'border-green-600',
    'border-gray-300', 'border-gray-600', 'border-green-500/50', 'border-green-500',
    'from-gray-100', 'to-gray-200', 'from-gray-800', 'to-gray-900',
    'from-zinc-950', 'to-black', 'from-green-700', 'to-green-900',
    'border-gray-300', 'border-gray-700/50', 'border-green-500/50', 'border-green-400/50',
  ],
  plugins: [],
};
