// ODA SHOP : service worker (installation + ouverture même sans réseau)
const V='oda-v38';
const FILES=['./','index.html','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.allSettled(FILES.map(f=>c.add(f)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(new URL(e.request.url).origin!==location.origin)return; // Google Sheet, Drive, WhatsApp : toujours en direct
  // réseau d'abord (les mises à jour arrivent tout de suite), cache si pas de réseau
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r})
    .catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));
});
