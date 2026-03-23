import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiPort = process.env.AETHEROPS_API_PORT ?? "8081";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: `http://127.0.0.1:${apiPort}`,
        changeOrigin: true,
      },
      "/metrics": {
        target: `http://127.0.0.1:${apiPort}`,
        changeOrigin: true,
      },
    },
  },
});
