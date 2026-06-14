import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
