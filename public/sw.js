// Little by Little service worker: uygulamayı çevrimdışı açılabilir yapar.
// Sayfalar ağ-öncelikli (her zaman güncel), hash'li statik dosyalar önbellek-öncelikli.
// Önbelleği sıfırlamak için CACHE adındaki sürümü artır.
const CACHE = "lbl-v2";
const PAGES = ["/", "/zincir", "/istatistik"];
const STATIC = ["/manifest.webmanifest", "/logo.png", "/icons/icon-192.png", "/icons/icon-512.png"];

async function precache() {
  const cache = await caches.open(CACHE);
  await Promise.all(STATIC.map((url) => cache.add(url).catch(() => {})));
  for (const url of PAGES) {
    try {
      const res = await fetch(url, { cache: "reload" });
      if (!res.ok) continue;
      await cache.put(url, res.clone());
      // Sayfanın başvurduğu JS/CSS dosyalarını da önbelleğe al
      const html = await res.text();
      const assets = new Set(html.match(/\/_next\/static\/[^"'\\s)<>]+/g) || []);
      await Promise.all([...assets].map((asset) => cache.add(asset).catch(() => {})));
    } catch {
      // ağ yoksa kurulumu bozma; sayfalar ilk ziyarette önbelleğe girer
    }
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Sayfa gezintisi: önce ağ, olmazsa önbellek
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/")) || Response.error()),
    );
    return;
  }

  // Statik dosyalar: önce önbellek, yoksa ağdan alıp sakla
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        }),
    ),
  );
});
