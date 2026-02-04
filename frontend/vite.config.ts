import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = {
    ...process.env,
    ...loadEnv(mode, process.cwd(), ""),
  };

  const enableHttps = env.VITE_ENABLE_HTTPS !== "false";
  const proxyTarget = env.VITE_PROXY_TARGET ?? "https://auto-spare-parts.fly.dev";
  const stripePublishableKey = env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";

  const plugins = [tailwindcss(), react()];
  if (enableHttps) {
    plugins.push(basicSsl());
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY": JSON.stringify(stripePublishableKey),
    },
    server: {
      host: true,
      https: enableHttps ? {} : false,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: proxyTarget.startsWith("https"),
          followRedirects: true,
        },
      },
    },
    preview: {
      https: enableHttps ? {} : false,
    },
  };
});
