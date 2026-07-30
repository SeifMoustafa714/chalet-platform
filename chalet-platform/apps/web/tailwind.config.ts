import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12302C',
        marina: {
          DEFAULT: '#0E7C86',
          deep: '#0B5B63',
        },
        sand: '#EDE7D8',
        bougainvillea: '#D6486B',
        sun: '#D9A441',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
