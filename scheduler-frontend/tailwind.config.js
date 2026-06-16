/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      // Colors use CSS variables — supports opacity modifiers (bg-ink/50 etc.)
      colors: {
        ink:     'rgb(var(--c-ink)     / <alpha-value>)',
        cream:   'rgb(var(--c-cream)   / <alpha-value>)',
        accent:  'rgb(var(--c-accent)  / <alpha-value>)',
        violet:  'rgb(var(--c-violet)  / <alpha-value>)',
        mint:    'rgb(var(--c-mint)    / <alpha-value>)',
        amber:   'rgb(var(--c-amber)   / <alpha-value>)',
        crimson: 'rgb(var(--c-crimson) / <alpha-value>)',
      },
      fontFamily: {
        // var(--font-display) / var(--font-body) set by each theme
        sketch: ['var(--font-display)'],
        body:   ['var(--font-body)'],
      },
      boxShadow: {
        sketch:        'var(--shadow-card)',
        'sketch-sm':   'var(--shadow-btn)',
        'sketch-focus':'var(--shadow-focus)',
      },
    },
  },
  plugins: [],
};
