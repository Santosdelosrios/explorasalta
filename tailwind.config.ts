import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        poncho: '#7B2D26',
        arena: '#EBD4B7',
        cardon: '#6E8B3D',
        cielo: '#A7C6ED',
        ink: '#333333'
      },
      boxShadow: { soft: '0 8px 24px rgba(0,0,0,.08)' },
      borderRadius: { xl: '1rem', '2xl': '1.25rem' }
    }
  },
  plugins: []
} satisfies Config;
