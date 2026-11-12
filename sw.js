// ODA SHOP : service worker (installation + ouverture même sans réseau)
const V='oda-v63';
const FILES=['./','index.html','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png',
'oda-p01.jpg','oda-p02.jpg','oda-p03.png','oda-p04.png','oda-p05.png','oda-p06.png','oda-p07.png','oda-p08.png','oda-p09.png','oda-p10.png','oda-p11.jpg','oda-p12.jpg','oda-p13.jpg','oda-p14.jpg','oda-p15.jpg','oda-p16.jpg','oda-p17.jpg','oda-p18.jpg','oda-p19.jpg','oda-p20.jpg','oda-p21.jpg','oda-p22.jpg','oda-p23.jpg','oda-p24.jpg','oda-p25.jpg','oda-p26.jpg','oda-p27.jpg','oda-p28.jpg','oda-p29.jpg','oda-p30.jpg','oda-p31.jpg','oda-p32.jpg','oda-p33.jpg','oda-p34.jpg','oda-p35.jpg','oda-p36.jpg','oda-p37.jpg','oda-p38.jpg','oda-p39.jpg','oda-p40.png','oda-p41.jpg','oda-p42.jpg','oda-p43.jpg','oda-p44.jpg','oda-p45.jpg','oda-p46.jpg','oda-p47.jpg','oda-p48.jpg','oda-p49.jpg','oda-p50.jpg','oda-p51.jpg','oda-p52.jpg','oda-p53.jpg'];
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
