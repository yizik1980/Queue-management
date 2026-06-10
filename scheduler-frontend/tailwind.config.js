/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
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
      },
      fontFamily: {
        sketch: ['Caveat', 'cursive'],
        body:   ['Heebo', 'sans-serif'],
      },
      boxShadow: {
        sketch:    '3px 3px 0 #1a1a2e',
        'sketch-sm': '2px 2px 0 #1a1a2e',
        'sketch-focus': '3px 3px 0 #6c5ce7',
      },
    },
  },
  plugins: [],
};
