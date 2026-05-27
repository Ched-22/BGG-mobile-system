/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C2A46D',
          90: 'rgba(194, 164, 109, 0.90)',
          80: 'rgba(194, 164, 109, 0.80)',
          30: 'rgba(194, 164, 109, 0.30)',
          20: 'rgba(194, 164, 109, 0.20)',
          on: '#0B0B0B',
        },
        bgg: {
          bg: '#0B0B0B',
          elevated: '#1a1a1a',
          fg: '#EDEDED',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        bgg: '0.25rem',
      },
      transitionTimingFunction: {
        bgg: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
