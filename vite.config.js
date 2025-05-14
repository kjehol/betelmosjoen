// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectManifest: {
        // Point to your custom service worker source in src/
        swSrc: "src/custom-sw.js",
        swDest: "service-worker.js"
      },
      registerType: "autoUpdate",
      devOptions: {
        enabled: false
      },
      includeAssets: [
        "favicon.png",
        "apple-touch-icon.png",
        "icon-192x192.png",
        "icon-512x512.png",
        "OneSignalSDKWorker.js",
        "OneSignalSDKUpdaterWorker.js"
      ],
      manifest: {
        name: "Betel Mosjøen",
        short_name: "Betel",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1e40af",
        icons: [
          { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],
  server: {
    proxy: {
      "/elvanto": {
        target: "https://api.elvanto.com",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/elvanto/, "")
      }
    }
  }
});