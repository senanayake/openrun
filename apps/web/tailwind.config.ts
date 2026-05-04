import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Training zone palette — matches CourseMap difficulty colours
        zone: {
          easy: '#1D9E75',
          moderate: '#EF9F27',
          hard: '#E24B4A',
          rest: '#6B7280',
        },
        // Phase palette
        phase: {
          base: '#3B82F6',
          support: '#8B5CF6',
          specific: '#F59E0B',
          taper: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
