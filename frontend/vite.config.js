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
      '/api/v1': { 
        target: 'https://backend-auto-spare-parts.fly.dev',
        changeOrigin: true,
        secure: true, // Ensure HTTPS verification
        followRedirects: true, // Handle redirects properly
      },
    },
  },
})