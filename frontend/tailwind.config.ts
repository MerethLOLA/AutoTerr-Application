import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: '#ff6b35',
        secondary: '#3b5bdb',
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color',
      },
    },
  },
  darkMode: 'class',
  plugins: [forms],
};

export default config;
