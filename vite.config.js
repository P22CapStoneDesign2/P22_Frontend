import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'pdfjs-dist': fileURLToPath(new URL('./node_modules/react-pdf/node_modules/pdfjs-dist', import.meta.url)),
    },
  },
  server: {
    port: 5174,
  },
})