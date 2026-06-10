/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:     '#1a1a2e',
        cream:   '#fef9e7',
        accent:  '#e84393',
        violet:  '#6c5ce7',
        mint:    '#00b894',
        amber:   '#fdcb6e',
        crimson: '#d63031',
        slate:   '#636e72',
      },
      fontFamily: {
        body:   ['Rubik', 'sans-serif'],
        sketch: ['Caveat', 'cursive'],
      },
      boxShadow: {
        sketch:    '3px 3px 0 #1a1a2e',
        'sketch-sm': '2px 2px 0 #1a1a2e',
      },
    },
  },
};
