import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Appen fungerer fortsatt som vanlig webapp hvis PWA-støtte ikke er tilgjengelig.
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
