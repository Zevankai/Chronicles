import React from 'react';
import ReactDOM from 'react-dom/client';
import OBR from '@owlbear-rodeo/sdk';
import App from './App';

OBR.onReady(() => {
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
});
