
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#10141a',
        surface: '#10141a',
        'surface-container-low': '#181c22',
        'surface-container': '#1c2026',
        'surface-container-high': '#262a31',
        'surface-container-highest': '#31353c',
        primary: '#a2c9ff',
        'primary-container': '#58a6ff',
        'on-primary': '#00315c',
        'on-primary-container': '#003a6b',
        secondary: '#67df70',
        'secondary-container': '#27a640',
        tertiary: '#fabc45',
        'tertiary-container': '#d29922',
        error: '#ffb4ab',
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',
        'on-surface': '#dfe2eb',
        'on-surface-variant': '#c0c7d4',
        'on-background': '#dfe2eb',
        outline: '#8b919d',
        'outline-variant': '#414752',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
