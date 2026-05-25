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
        sans: ['var(--font-inter)', 'system-ui', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary:    '#ff6b35',
        'hub-dark': '#253342',
        'hub-text': '#33475b',
        'hub-muted':'#516f90',
        'hub-bdr':  '#dfe3eb',
        'hub-bg':   '#f5f8fa',
      },
      borderRadius: {
        DEFAULT: '3px',
        sm:  '2px',
        md:  '4px',
        lg:  '6px',
        xl:  '8px',
        '2xl': '12px',
        '3xl': '16px',
        full: '9999px',
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      fontSize: {
        '2xs': ['11px', '16px'],
        xs:    ['12px', '16px'],
        sm:    ['13px', '20px'],
        base:  ['14px', '22px'],
        lg:    ['16px', '24px'],
        xl:    ['18px', '28px'],
        '2xl': ['20px', '28px'],
        '3xl': ['24px', '32px'],
        '4xl': ['30px', '36px'],
      },
    },
  },
  darkMode: 'class',
  plugins: [forms],
};

export default config;
