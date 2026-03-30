import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// Vite inyectará aquí automáticamente index.html, JS y CSS
precacheAndRoute(self.__WB_MANIFEST);

// Tu lógica de instalación y activación se mantiene limpia
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Background Sync para tus grabaciones (Tu fuerte)
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-recordings') {
    event.waitUntil(syncRecordings());
  }
});

async function syncRecordings() {
  try {
    console.log('Sincronizando grabaciones desde el SW...');
    // Aquí podrías usar una entidad de tu carpeta 'entities' 
    // para tipar los datos de audio recuperados.
  } catch (error) {
    console.error('Error al sincronizar:', error);
  }
}