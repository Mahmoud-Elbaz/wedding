/* ============================================================
   service-worker.js — offline support for static assets
   ------------------------------------------------------------
   Strategy:
   • Pre-cache the app shell on install.
   • Cache-first for same-origin static assets & Google Fonts.
   • Network-first for HTML navigations (so updates arrive),
     falling back to cache when offline.
   • Firebase/Firestore requests are never cached.
   Bump CACHE_VERSION whenever you change any file.
   ============================================================ */

const CACHE_VERSION = "wedding-flat-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./arabic.html",
  "./english.html",
  "./manifest.json",
  "./style.css",
  "./animations.css",
  "./responsive.css",
  "./main.js",
  "./animation.js",
  "./countdown.js",
  "./maps.js",
  "./firebase.js",
  "./floral-corner.svg",
  "./divider.svg",
  "./favicon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

/* ---------- Install: pre-cache the shell ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

/* ---------- Activate: clean old caches ---------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ---------- Fetch ---------- */
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  /* Only handle GET */
  if (request.method !== "GET") return;

  /* Never intercept Firebase traffic */
  if (
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("identitytoolkit.googleapis.com")
  ) {
    return;
  }

  /* HTML navigations: network first, cache fallback */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((hit) => hit || caches.match("./index.html"))
        )
    );
    return;
  }

  /* Static assets & fonts: cache first, then network */
  const cacheable =
    url.origin === self.location.origin ||
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com" ||
    url.hostname === "www.gstatic.com";

  if (!cacheable) return;

  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
