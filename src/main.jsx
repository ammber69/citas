import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ── Protección global contra errores de deployment ──
// Si un archivo JS/CSS del deployment anterior ya no existe en Vercel,
// el browser lanza un error de chunk. Esto lo detecta y recarga la página
// automáticamente para que cargue los nuevos assets.
let hasReloaded = false;

const handleGlobalError = (event) => {
  if (hasReloaded) return;
  const msg = (event?.message || event?.reason?.message || '').toLowerCase();
  if (
    msg.includes('loading chunk') ||
    msg.includes('loading css chunk') ||
    msg.includes('dynamically imported module') ||
    msg.includes('chunkloaderror')
  ) {
    hasReloaded = true;
    console.warn('[Global] Error de chunk detectado. Recargando página...');
    setTimeout(() => window.location.reload(), 1500);
  }
};

window.addEventListener('error', handleGlobalError);
window.addEventListener('unhandledrejection', (e) => {
  handleGlobalError({ message: e.reason?.message || '' });
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
