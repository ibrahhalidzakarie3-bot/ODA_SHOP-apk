// ODA SHOP : service worker (installation + ouverture même sans réseau)
const V='oda-v131',VID='oda-vid',IMG='oda-img';
const FILES=['./','index.html','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png',
'oda-p01.jpg','oda-p02.jpg','oda-p03.png','oda-p04.png','oda-p05.png','oda-p06.png','oda-p07.png','oda-p08.png','oda-p09.png','oda-p10.png','oda-p11.jpg','oda-p12.jpg','oda-p13.jpg','oda-p14.jpg','oda-p15.jpg','oda-p16.jpg','oda-p17.jpg','oda-p18.jpg','oda-p19.jpg','oda-p20.jpg','oda-p21.jpg','oda-p22.jpg','oda-p23.jpg','oda-p24.jpg','oda-p25.jpg','oda-p26.jpg','oda-p27.jpg','oda-p28.jpg','oda-p29.jpg','oda-p30.jpg','oda-p31.jpg','oda-p32.jpg','oda-p33.jpg','oda-p34.jpg','oda-p35.jpg','oda-p36.jpg','oda-p37.jpg','oda-p38.jpg','oda-p39.jpg','oda-p40.png','oda-p41.jpg','oda-p42.jpg','oda-p43.jpg','oda-p44.jpg','oda-p45.jpg','oda-p46.jpg','oda-p47.jpg','oda-p48.jpg','oda-p49.jpg','oda-p50.jpg','oda-p51.jpg','oda-p52.jpg','oda-p53.jpg','oda-p54.jpg','oda-p55.jpg','oda-p56.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.allSettled(FILES.map(f=>c.add(f)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!==VID&&x!==IMG).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
const estVid=u=>/\/functions\/v1\/tg-video\?f=/.test(u);
async function trim(name,max){const c=await caches.open(name),k=await c.keys();for(let i=0;i<k.length-max;i++)await c.delete(k[i])}
async function servirVideo(req){
  const c=await caches.open(VID),r=await c.match(req.url,{ignoreVary:true,ignoreSearch:false});
  if(!r)return null;
  const b=await r.blob(),t=b.type||'video/mp4',rg=req.headers.get('range');
  if(!rg)return new Response(b,{status:200,headers:{'Content-Type':t,'Content-Length':b.size,'Accept-Ranges':'bytes'}});
  const m=/bytes=(\d*)-(\d*)/.exec(rg)||[];let a=m[1]?+m[1]:0,z=m[2]?+m[2]:b.size-1;
  if(!m[1]&&m[2]){a=Math.max(0,b.size-+m[2]);z=b.size-1}
  z=Math.min(z,b.size-1);
  return new Response(b.slice(a,z+1),{status:206,headers:{'Content-Type':t,'Content-Range':'bytes '+a+'-'+z+'/'+b.size,'Content-Length':z-a+1,'Accept-Ranges':'bytes'}});
}
self.addEventListener('fetch',e=>{
  const q=e.request;
  if(q.method!=='GET')return;
  const u=new URL(q.url);
  if(u.origin!==location.origin){
    // vidéos déjà vues : servies depuis le téléphone (sans réseau)
    if(estVid(q.url)){e.respondWith(servirVideo(q).then(r=>r||fetch(q)).catch(()=>fetch(q)));return}
    // images (photos produits, avatars) : réseau d'abord, mémorisées pour le hors ligne
    if(q.destination==='image'){e.respondWith(fetch(q).then(r=>{if(r&&(r.ok||r.type==='opaque')){const c=r.clone();caches.open(IMG).then(x=>x.put(q,c)).then(()=>trim(IMG,200)).catch(()=>{})}return r})
      .catch(()=>caches.match(q).then(r=>r||Response.error())));return}
    return; // Google Sheet, WhatsApp… : toujours en direct
  }
  // réseau d'abord (les mises à jour arrivent tout de suite), cache si pas de réseau
  e.respondWith(fetch(q).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(V).then(x=>x.put(q,c))}return r})
    .catch(()=>caches.match(q).then(r=>r||caches.match('index.html'))));
});
self.addEventListener('message',e=>{
  const d=e.data||{};
  if(d.cacheVideo&&estVid(d.cacheVideo)){
    e.waitUntil((async()=>{const c=await caches.open(VID);if(await c.match(d.cacheVideo))return;
      const r=await fetch(d.cacheVideo,{mode:'cors'});if(!r.ok||r.status!==200)return;
      const b=await r.blob();if(b.size>45e6)return;
      await c.put(d.cacheVideo,new Response(b,{status:200,headers:{'Content-Type':b.type||'video/mp4'}}));await trim(VID,15)})().catch(()=>{}));
  }
  if(d.clearVideos)e.waitUntil(caches.delete(VID));
});

self.addEventListener('push',e=>{
  let d={};try{d=e.data?e.data.json():{}}catch(x){d={title:'ODA SHOP',body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'ODA SHOP',{body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',data:{url:d.url||'./',go:d.go||''}}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
    const g=(e.notification.data&&e.notification.data.go)||'';
    for(const c of l){if('focus' in c){if(g)c.postMessage({go:g});return c.focus()}}
    return self.clients.openWindow(g?('./#'+g):((e.notification.data&&e.notification.data.url)||'./'));
  }));
});
