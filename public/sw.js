// AOD service worker: makes the site installable and lets pages seen before open offline.
// Registered in production only (src/instrumentation-client.ts). Bump VERSION whenever the
// caching below changes, so old caches are cleared.
const VERSION = "v1";
const PAGES = `aod-pages-${VERSION}`;
const STATIC = `aod-static-${VERSION}`;
const ASSETS = `aod-assets-${VERSION}`;
const OFFLINE = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.add(OFFLINE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = [PAGES, STATIC, ASSETS];
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Always the network: API routes, page data (RSC) and media.
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/media")) return;
  if (request.headers.get("RSC") || url.searchParams.has("_rsc")) return;

  // Pages: network first, keep a copy; offline, the copy or the offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok && !res.headers.get("Cache-Control")?.includes("no-store")) {
            const copy = res.clone();
            caches.open(PAGES).then((cache) => cache.put(request, copy));
          }
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match(OFFLINE))),
    );
    return;
  }

  // Built files never change under the same name: cache first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC).then((cache) => cache.put(request, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Images and fonts: show the cached copy at once, refresh it in the background.
  if (["image", "font"].includes(request.destination)) {
    event.respondWith(
      caches.open(ASSETS).then((cache) =>
        cache.match(request).then((hit) => {
          const fresh = fetch(request)
            .then((res) => {
              if (res.ok) cache.put(request, res.clone());
              return res;
            })
            .catch(() => hit);
          return hit || fresh;
        }),
      ),
    );
  }
});
