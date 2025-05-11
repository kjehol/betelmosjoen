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

// Registrer service worker kun i produksjon med prompt-registering
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // Auto-update service worker without user prompt
  const updateSW = registerSW({
    registerType: 'autoUpdate',
    onOfflineReady() {
      console.log('🔌 Appen er klar for offline bruk');
    }
  });

  // Reload page once when new service worker takes control
  let hasReloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hasReloaded) {
      hasReloaded = true;
      window.location.reload();
    }
  });
}