// 提案示範用 service worker：先拿網路、失敗用快取
const VERSION = 'shochu-v3'
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(['./', './index.html', './manifest.webmanifest', './icon.svg'])))
  self.skipWaiting()
})
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))))
  self.clients.claim()
})
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone()
      caches.open(VERSION).then(c => c.put(e.request, copy))
      return res
    }).catch(() => caches.match(e.request))
  )
})
