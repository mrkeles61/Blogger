module.exports = {
  theme: {
    extend: {
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        accent: {
          orange: '#F97316',
          blue: '#2563EB',
        },
      },
      backgroundImage: {
        'gradient-shift': 'linear-gradient(135deg, #F97316 0%, #2563EB 100%)',
        'gradient-overlay': 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(249, 115, 22, 0.3)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.3)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'fade-up': 'fadeUp 0.5s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
};
