import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path"

const STRIPE_PUBLISHABLE_KEY = "pk_test_51RxrAwPtCxyTWU2nOrPPJQU6pbhCKsox9yXMJfl9sE3BRuLDISQVpFgGtkqNAkJHhFyUvpzG6IYKUFZjKWawOTyx00nla8B24Y";

export default defineConfig({
  plugins: [tailwindcss(), react(), basicSsl()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY": JSON.stringify(STRIPE_PUBLISHABLE_KEY)
  },
  server: {
    https: {},
    proxy: {
      "/api/v1": {
        target: "https://backend-auto-spare-parts.fly.dev",
        changeOrigin: true,
        secure: true,
        followRedirects: true
      }
    }
  }
});
