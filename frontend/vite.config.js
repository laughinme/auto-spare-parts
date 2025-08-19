import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react()],
  define: {
    'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify('pk_test_51RxrAwPtCxyTWU2nOrPPJQU6pbhCKsox9yXMJfl9sE3BRuLDISQVpFgGtkqNAkJHhFyUvpzG6IYKUFZjKWawOTyx00nla8B24Y')
  }

})
