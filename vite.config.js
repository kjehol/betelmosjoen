// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      filename: "service-worker.js",  // Sørger for at SW-filen heter akkurat service-worker.js
      devOptions: {
        enabled: true,         // gjør at SW også registreres i dev-mode
        navigateFallback: "/", // fallback til root
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
      },
      workbox: {
        runtimeCaching: [
          // cache OneSignal-skriptet
          {
            urlPattern: /^https:\/\/cdn\.onesignal\.com\/sdks\/web\/v16\/OneSignalSDK\.page\.js$/,
            handler: "NetworkFirst",
            options: { cacheName: "onesignal-sdk" }
          },
          // cache dine API-endepunkter
          {
            urlPattern: /^\/api\/.+$/,
            handler: "NetworkFirst",
            options: { cacheName: "api-calls" }
          }
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