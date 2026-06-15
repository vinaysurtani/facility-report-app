import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx'],
    },
  },
  server: {
    proxy: {
      '/cms-api': {
        target: 'https://data.cms.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cms-api/, '/provider-data/api/1/datastore/query'),
      },
    },
  },
})
