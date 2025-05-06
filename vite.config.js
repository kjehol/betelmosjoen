import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",       // sørger for at SW auto-oppdaterer
      includeAssets: [
        "favicon.png",
        "apple-touch-icon.png",
        "icon-192x192.png",
        "icon-512x512.png"
      ],
      manifest: {
        name: "Betel Mosjøen",
        short_name: "Betel",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1e40af",
        icons: [
          { src: "icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512x512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        // (Valgfritt) Vi kan definere caching-regler her ved behov
      }
    })
  ],
  server: {
    proxy: {
      "/elvanto": {
        target: "https://api.elvanto.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/elvanto/, "")
      }
    }
  }
});
