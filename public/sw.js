// ApexBee Delivery Partner Portal PWA Service Worker
const CACHE_NAME = "apexbee-partner-pwa-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Bypass SW for non-GET, API calls, Vite dev server scripts, and HMR
  if (
    event.request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/@") ||
    url.pathname.startsWith("/src/") ||
    url.pathname.includes("node_modules") ||
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1"
  ) {
    return;
  }

  // Handle SPA navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/index.html").then((cached) => {
          return cached || fetch("/index.html");
        });
      })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => {
        return new Response("Offline resource unavailable", { status: 503 });
      });
    })
  );
});
