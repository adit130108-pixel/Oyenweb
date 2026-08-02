const CACHE = "oyenlink-v1";
const SHELL = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Never cache links.json or GitHub API calls — always fetch fresh.
  if (url.pathname.endsWith("links.json") || url.hostname.includes("github")) return;
  if (url.origin === self.location.origin && SHELL.some((s) => url.pathname.endsWith(s.replace("./", "")))) {
    e.respondWith(caches.match(e.request).then((cached) => cached || fetch(e.request)));
  }
});
