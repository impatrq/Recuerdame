self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Instalado');
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activado');
});

self.addEventListener('fetch', (event) => {
  // Esto es opcional para cachear recursos
});
