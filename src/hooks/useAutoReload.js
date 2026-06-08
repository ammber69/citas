import { useEffect, useRef } from 'react';

/**
 * useAutoReload — Recarga automática para pantallas kiosko/TV sin teclado ni mouse.
 * 
 * Mecanismo 1: Polling de versión
 *   Cada `intervalMs` (por defecto 60s) descarga el index.html de la raíz del sitio
 *   y extrae las URLs de los scripts (<script src="...">). Si cambian respecto a la
 *   primera carga, significa que Vercel hizo un nuevo deployment → recarga limpia.
 * 
 * Mecanismo 2: Detección de errores de chunk
 *   Escucha errores globales del tipo "ChunkLoadError" / "Loading chunk ... failed"
 *   que ocurren cuando el browser intenta cargar un archivo JS que ya no existe
 *   en el servidor (porque Vercel borró los assets del deployment anterior).
 *   Al detectar uno, recarga inmediatamente.
 */
export const useAutoReload = (intervalMs = 60_000) => {
  const initialScriptsHash = useRef(null);
  const isReloading = useRef(false);

  useEffect(() => {
    // --- Mecanismo 1: Polling de versión ---
    const extractScriptSrcs = (html) => {
      const matches = html.match(/<script[^>]+src="([^"]+)"/g) || [];
      return matches.sort().join('|');
    };

    const checkForUpdate = async () => {
      try {
        // Añadimos un cache-buster para evitar el cache del browser
        const res = await fetch(`/?_cb=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });

        if (!res.ok) return;

        const html = await res.text();
        const currentHash = extractScriptSrcs(html);

        if (!currentHash) return;

        if (initialScriptsHash.current === null) {
          // Primera vez: guardar la "firma" actual
          initialScriptsHash.current = currentHash;
        } else if (currentHash !== initialScriptsHash.current) {
          // ¡Los scripts cambiaron! → Nuevo deployment detectado
          console.log('[AutoReload] Nuevo deployment detectado. Recargando...');
          safeReload();
        }
      } catch (err) {
        // Error de red — no hacer nada, intentar de nuevo en el próximo ciclo
        console.warn('[AutoReload] Error al verificar versión:', err.message);
      }
    };

    // Verificar inmediatamente al montar (captura la firma inicial)
    checkForUpdate();
    const interval = setInterval(checkForUpdate, intervalMs);

    // --- Mecanismo 2: Captura de errores de chunk ---
    const handleChunkError = (event) => {
      const error = event.reason || event.error || event;
      const message = (error?.message || error?.toString?.() || '').toLowerCase();

      if (
        message.includes('loading chunk') ||
        message.includes('loading css chunk') ||
        message.includes('dynamically imported module') ||
        message.includes('failed to fetch') ||
        message.includes('chunkloaderror')
      ) {
        console.log('[AutoReload] Error de chunk detectado. Recargando...');
        event.preventDefault?.();
        safeReload();
      }
    };

    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handleChunkError);

    return () => {
      clearInterval(interval);
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleChunkError);
    };
  }, [intervalMs]);

  const safeReload = () => {
    if (isReloading.current) return;
    isReloading.current = true;
    // Pequeño delay para evitar loops de recarga
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };
};
