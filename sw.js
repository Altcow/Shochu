// 提案示範用 service worker：先拿網路、失敗用快取
const VERSION = 'shochu-1.3.1'
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
  // 頁面本身（index.html）每次都跟伺服器確認是不是最新版，避免更新後還看到舊畫面
  // （navigate 模式的 Request 不能帶新選項重建，所以改用網址重新發一次）
  const live = e.request.mode === 'navigate'
    ? fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })
    : fetch(e.request)
  e.respondWith(
    live.then(res => {
      const copy = res.clone()
      caches.open(VERSION).then(c => c.put(e.request, copy))
      return res
    }).catch(() => caches.match(e.request, { ignoreSearch: e.request.mode === 'navigate' }))
  )
})
