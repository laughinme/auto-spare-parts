import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react()],
  server: {
    proxy: {
      
      '/api': {
        baseURL: 'https://backend-auto-spare-parts.fly.dev/api/v1',
        changeOrigin: true, 
      }
    }
  }
})
