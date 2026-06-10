import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enregistrement du Service Worker pour rendre l'application installable (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('Service Worker enregistré avec succès :', reg.scope))
      .catch((err) => console.error('Échec de l\'enregistrement du Service Worker :', err));
  });
}
