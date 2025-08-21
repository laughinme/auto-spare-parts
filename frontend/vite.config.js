// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    basicSsl()
  ],
  define: {
    'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify('pk_test_51RxrAwPtCxyTWU2nOrPPJQU6pbhCKsox9yXMJfl9sE3BRuLDISQVpFgGtkqNAkJHhFyUvpzG6IYKUFZjKWawOTyx00nla8B24Y')
  },
  server: {
    https: true,
    proxy: {
      // Ключ можно сделать более точным, чтобы не перехватывать лишнего
      '/api/v1': { 
        target: 'https://backend-auto-spare-parts.fly.dev',
        changeOrigin: true,
        // Опция 'rewrite' полностью убрана, так как путь уже правильный
      },
    },
  },

})