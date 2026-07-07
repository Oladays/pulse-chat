const CACHE='pulsechat-v2';
const ASSETS=['/','index.html','manifest.json','icon-192.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});

// Push notification handler
self.addEventListener('push',e=>{
  if(!e.data)return;
  let data={title:'PulseChat',body:'You have a new message',icon:'/icon-192.png',badge:'/icon-192.png'};
  try{data={...data,...e.data.json()};}catch(err){}
  e.waitUntil(
    self.registration.showNotification(data.title,{
      body:data.body,
      icon:data.icon,
      badge:data.badge,
      tag:'pulsechat-msg',
      renotify:true,
      vibrate:[200,100,200],
      data:{url:data.url||'/'}
    })
  );
});

// Click notification — open app
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(cls=>{
      const url=e.notification.data?.url||'/';
      const existing=cls.find(c=>c.url.includes(self.location.origin));
      if(existing)return existing.focus();
      return clients.openWindow(url);
    })
  );
});
