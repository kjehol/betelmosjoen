// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// PWA-registration fra vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

// Track prompt across reloads
let hasPromptedForUpdate = sessionStorage.getItem('swPrompted') === 'true';

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
  const updateSW = registerSW({
    registerType: 'prompt',
    onOfflineReady() {
      console.log('🔌 Appen er klar for offline bruk');
    },
    onNeedRefresh() {
      if (!hasPromptedForUpdate) {
        if (confirm('🔄 Ny versjon tilgjengelig! Vil du oppdatere nå?')) {
          updateSW().then(() => window.location.reload());
        }
        // prevent further prompts this session
        hasPromptedForUpdate = true;
        sessionStorage.setItem('swPrompted', 'true');
      }
    }
  });
}