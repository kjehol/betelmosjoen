export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx}",
    ],
    theme: {
      extend: {
        animation: {
          'fade-in-out': 'fadeInOut 2s ease-in-out',
        },
        keyframes: {
          fadeInOut: {
            '0%': { opacity: 0 },
            '10%': { opacity: 1 },
            '90%': { opacity: 1 },
            '100%': { opacity: 0 },
          },
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  }
  