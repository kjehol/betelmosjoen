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

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  registerSW({
    registerType: 'autoUpdate',
    onOfflineReady() {
      console.log('🔌 Appen er klar for offline bruk');
    }
  });
}