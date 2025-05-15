// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "generateSW",
      injectRegister: null, // main.jsx håndterer registrering
      filename: "service-worker.js", // <-- Tving riktig filnavn for iOS
      workbox: undefined, // <-- Legg til denne linjen for å unngå sw.js build
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
        scope: "/", // <-- Sjekk at dette er riktig
        description: "App for Betel Mosjøen med kalender, podcast og artikler m.m.",
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