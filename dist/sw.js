const staticCacheName = 'restaurant-reviews-v1';
const contentImgsCache = 'restaurant-reviews-content-imgs';
const contentDataCache = 'restaurant-reviews-content-data';

const allCaches = [staticCacheName, contentImgsCache, contentDataCache];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(staticCacheName).then((cache) => {
    console.log('installing');
    return cache.addAll([
      '/',
      '/index.html',
      '/restaurant.html',
      '/js/dbhelper.js',
      '/js/main.js',
      '/js/restaurant_info.js',
      '/js/shared.js',
      '/js/swregister.js',
      '/css/style.min.css',
    ]);
  }));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(cacheNames => Promise.all(cacheNames.filter(cacheName => cacheName.startsWith('restaurant-reviews-') && !allCaches.includes(cacheName)).map(cacheName => caches.delete(cacheName)))));
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/') {
      event.respondWith(caches.match('/'));
      return;
    }
    if (requestUrl.pathname.startsWith('/img/')) {
      event.respondWith(servePhoto(event.request));
      return;
    }
    // TODO: respond to avatar urls by responding with
    // the return value of serveAvatar(event.request)

    if (requestUrl.pathname.startsWith('/avatars/')) {
      event.respondWith(serveAvatar(event.request));
      return;
    }
    if (requestUrl.pathname.startsWith('/data/')) {
      event.respondWith(serveData(event.request));
      return;
    }
  }

  // if (event.request.url.indexOf('https://maps.googleapis.com/') == 0) {
  //   console.log('MAPS Served');
  //   event.respondWith(serveMap(event.request));
  //   return;
  // }

  const urlWithoutParams = event.request.url ? event.request.url.split('?')[0] : event.request.url;
  // console.log(urlWithoutParams);
  event.respondWith(caches.match(urlWithoutParams).then(response => response || fetch(event.request)));
});

function serveAvatar(request) {
  // Avatar urls look like:
  // avatars/sam-2x.jpg
  // But storageUrl has the -2x.jpg bit missing.
  // Use this url to store & match the image in the cache.
  // This means you only store one copy of each avatar.
  const storageUrl = request.url.replace(/-\dx\.jpg$/, '');

  // TODO: return images from the "restaurant-reviews-content-imgs" cache
  // if they're in there. But afterwards, go to the network
  // to update the entry in the cache.
  //
  // Note that this is slightly different to servePhoto!
  return caches.open(contentImgsCache).then(cache => cache.match(storageUrl).then((response) => {
    const networkResponse = fetch(request).then((networkResponse) => {
      cache.put(storageUrl, networkResponse.clone());
      return networkResponse;
    });

    return response || networkResponse;
  }));
}

function servePhoto(request) {
  const storageUrl = request.url.replace(/.jpg$/, '');

  return caches.open(contentImgsCache).then(cache => cache.match(storageUrl).then((response) => {
    if (response) { return response; }

    return fetch(request).then((networkResponse) => {
      cache.put(storageUrl, networkResponse.clone());
      return networkResponse;
    });
  }));
}


function serveData(request) {
  const storageUrl = request.url;

  return caches.open(contentDataCache).then(cache => cache.match(storageUrl).then((response) => {
    if (response) { return response; }

    return fetch(request).then((networkResponse) => {
      cache.put(storageUrl, networkResponse.clone());
      return networkResponse;
    });
  }));
}

self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
