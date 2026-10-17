/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',            // los componentes necesitan un DOM: jsdom lo simula
    setupFiles: './src/setupTests.ts', // corre antes de cada archivo de test
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
