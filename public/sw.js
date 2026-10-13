// Minimal service worker so the app can be installed. It does not cache anything,
// so the wheel always uses fresh data.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
