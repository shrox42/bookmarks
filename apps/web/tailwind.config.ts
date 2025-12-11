import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/shared/src/ui/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        canvas: '#05070d',
      },
      boxShadow: {
        glass: '0px 30px 60px rgba(2, 6, 23, 0.45)',
      },
    },
  },
  plugins: [],
} satisfies Config;
