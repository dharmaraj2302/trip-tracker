/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12213A',      // navy — headers, primary text
        paper: '#F6F1E7',    // cream — card backgrounds
        amber: '#E8A33D',    // accent — CTAs, active states
        teal: '#2F6E68',     // in-budget / success
        rust: '#B5473A',     // over-budget / warning
        slate: '#6B7280',    // muted text
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
