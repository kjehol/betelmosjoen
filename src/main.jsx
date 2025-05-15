// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// PWA-registration fra vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';
// Detekter om vi kjører som installert iOS-PWA
const isIosPwa = /iphone|ipad/.test(navigator.userAgent.toLowerCase()) &&
  (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);

// Opprett React-roten
const root = createRoot(document.getElementById('root'));

// Gjør render
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  let refreshing = false;
  const updateSW = registerSW({
    registerType: 'autoUpdate',
    onOfflineReady() {
      console.log('🔌 Appen er klar for offline bruk');
    },
    onNeedRefresh() {
      // Ikke kall updateSW() direkte her, vis evt. en prompt til bruker
      // updateSW(); // <-- fjern denne for å unngå loop
      // Evt. vis en knapp til bruker for å oppdatere
      console.log('Ny versjon tilgjengelig, last inn på nytt for å oppdatere.');
    }
  });

  // Lytt kun én gang på controllerchange
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    // Reload kun hvis det faktisk er en ny SW
    window.location.reload();
  });
}