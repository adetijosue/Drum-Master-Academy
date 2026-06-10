import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Supprimer et désenregistrer tout Service Worker existant pour éviter les conflits de cache (Écran Blanc)
try {
  if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  }
} catch (e) {
  console.warn('[DMA] Échec du nettoyage des Service Workers :', e);
}

// Vider les anciens caches pour forcer le navigateur à charger les nouveaux assets compilés
try {
  if ('caches' in window && caches.keys) {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        caches.delete(key).catch(() => {});
      });
    }).catch(() => {});
  }
} catch (e) {
  console.warn('[DMA] Échec du nettoyage du cache browser :', e);
}


