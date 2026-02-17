import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/renderer/src/**/*.{js,ts,jsx,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1a1a2e',
        'dark-surface': '#16213e',
        'dark-surface-light': '#1f2f4d'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}

export default config
