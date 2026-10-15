/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#FFAC1C', dark: '#E69500', soft: '#FFF4E0' },
        ink: { DEFAULT: '#101010', 2: '#1B1B1B', 3: '#2A2A2A' },
        line: '#E6E6E3',
        muted: '#6B6B66',
        canvas: '#F7F6F3',
        risk: { red: '#C62828', redSoft: '#FDECEA', amber: '#B26A00', amberSoft: '#FFF3DC', green: '#2E7D4F', greenSoft: '#E8F4EC' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Montage"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: { card: '14px' },
      boxShadow: { card: '0 1px 2px rgba(16,16,16,.04), 0 4px 16px rgba(16,16,16,.04)' },
    },
  },
  plugins: [],
};
