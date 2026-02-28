import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      // Proxy /api/* → PHP built-in server (php -S localhost:8888 index.php)
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
      },
      // Proxy uploaded files / images
      '/uploads': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
