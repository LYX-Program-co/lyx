const CACHE = '龍少-v666';
const ASSETS = [
    '/', 'index.html', 'style.css', 'game.js', 'manifest.json',
    ...Array.from({length:10},(_,i)=>`images/10${i}.png`),
    'images/300.png','images/301.png','images/302.png','images/500.png','images/501.png',
    'images/8888.png','images/9999.png','images/logo.png',
    ...['600','601','602','603','604','605','606','607'].map(n=>`images/${n}.png`),
    ...['main','free-spin','spin','stop','win-big','win-small','ui-click'].map(n=>`audios/${n}.wav`)
];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
