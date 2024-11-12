import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Remplacer l'importation de Buffer par cette solution
if (!globalThis.Buffer) {
  globalThis.Buffer = require('buffer').Buffer;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
