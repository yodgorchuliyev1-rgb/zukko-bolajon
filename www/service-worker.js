'use strict';

// Kesh versiyasini faqat eski keshlarni majburan tozalash kerak bo'lganda oshiring.
// Ilova fayllari "avval tarmoqdan" strategiyasi bilan olinadi, shuning uchun
// index.html o'zgarsa, foydalanuvchilar yangisini avtomatik oladi.
const CACHE_NAME = 'zukko-bolajon-v4';
const CORE_ASSETS = ['./', './index.html', './style.css', './manifest.json'];
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Fredoka:wght@400;500;600;700&display=swap';
const FONT_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);
const NETWORK_TIMEOUT_MS = 4000;

// Install: ilovaning o'z fayllari majburiy, shrift esa ixtiyoriy (tarmoq bo'lmasa o'rnatish buzilmasin)
self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(CORE_ASSETS.map((url) => new Request(url, { cache: 'reload' })));
        try { await cache.add(FONT_CSS); } catch (err) { /* shrift keyinroq keshlanadi */ }
        await self.skipWaiting();
    })());
});

// Activate: eski keshlarni tozalash
self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
        await self.clients.claim();
    })());
});

async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    try {
        const response = await Promise.race([
            fetch(request),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT_MS))
        ]);
        if (response && response.status === 200) cache.put(request, response.clone()).catch(() => { });
        return response;
    } catch (err) {
        const cached = await cache.match(request, { ignoreSearch: true });
        if (cached) return cached;
        if (request.mode === 'navigate') {
            const shell = await cache.match('./index.html');
            if (shell) return shell;
        }
        return Response.error();
    }
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response && (response.status === 200 || response.type === 'opaque')) cache.put(request, response.clone()).catch(() => { });
        return response;
    } catch (err) {
        return Response.error();
    }
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    if (url.origin === self.location.origin) {
        // API (bola holati, admin) va admin sahifasi hech qachon keshlanmaydi
        if (url.pathname.startsWith('/api/') || url.pathname === '/admin' || url.pathname.startsWith('/admin/')) return;
        event.respondWith(networkFirst(request));
        return;
    }

    if (FONT_HOSTS.has(url.hostname)) {
        event.respondWith(cacheFirst(request));
    }
});

// Push bildirishnoma (kelajak uchun)
self.addEventListener('push', (event) => {
    const icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect fill='%23fff4d6' width='192' height='192' rx='40'/%3E%3Ctext x='96' y='130' font-size='100' text-anchor='middle'%3E🎓%3C/text%3E%3C/svg%3E";
    const badge = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect fill='%237c5cff' width='96' height='96' rx='20'/%3E%3Ctext x='48' y='65' font-size='50' text-anchor='middle'%3E📚%3C/text%3E%3C/svg%3E";
    const text = event.data ? event.data.text() : "Vaqt keldi! Darsni davom ettiring! 📚";
    event.waitUntil(
        self.registration.showNotification('Zukko Bolajon', {
            body: text,
            icon,
            badge,
            vibrate: [200, 100, 200],
            tag: 'zukko-reminder'
        })
    );
});

// Bildirishnoma bosilganda: ochiq oyna bo'lsa unga o'tish, bo'lmasa yangisini ochish
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil((async () => {
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of windows) {
            if ('focus' in client) return client.focus();
        }
        return self.clients.openWindow('./');
    })());
});
