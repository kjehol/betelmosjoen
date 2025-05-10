// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// PWA-registration fra vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

// Opprett React-roten
const root = createRoot(document.getElementById('root'));

// Gjør render
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrer service worker kun i produksjon
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onOfflineReady() {
      console.log('🔌 Appen er klar for offline bruk');
    },
    onNeedRefresh() {
      console.log('🔄 Ny versjon tilgjengelig – last inn på nytt for å oppdatere');
      // Du kan her vise en knapp som kaller location.reload()
    }
  });
}