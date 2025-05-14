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
  const updateSW = registerSW({
    registerType: 'autoUpdate',
    onOfflineReady() {
      console.log('🔌 Appen er klar for offline bruk');
    }
  });
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }, { once: true });
}