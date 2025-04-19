import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/elvanto": {
        target: "https://api.elvanto.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/elvanto/, ""),
      },
    },
  },
});
