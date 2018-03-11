var staticCacheName = 'restaurant-reviews-v1';
var contentImgsCache = 'restaurant-reviews-content-imgs';
var contentMapCache = 'restaurant-reviews-content-map';
var contentDataCache = 'restaurant-reviews-content-data';

var allCaches = [staticCacheName, contentImgsCache, contentMapCache, contentDataCache];

self.addEventListener('install', function(event) {
  event.waitUntil(caches.open(staticCacheName).then(function(cache) {
    console.log('installing');
    return cache.addAll([
      '/',
      '/index.html',
      '/restaurant.html',
      'restaurant.html?id=1',
      '/js/dbhelper.js',
      '/js/main.js',
      '/js/restaurant_info.js',
      '/js/shared.js',
      '/js/swregister.js',
      '/css/styles.css',
      '/css/responsive.css',
    ]);
  }));
});

self.addEventListener('activate', function(event) {
  event.waitUntil(caches.keys().then(function(cacheNames) {
    return Promise.all(cacheNames.filter(function(cacheName) {
      return cacheName.startsWith('restaurant-reviews-') && !allCaches.includes(cacheName);
    }).map(function(cacheName) {
      return caches.delete(cacheName);
    }));
  }));
});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

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

  var urlWithoutParams = event.request.url ? event.request.url.split('?')[0]: event.request.url ;
  // console.log(urlWithoutParams);
  event.respondWith(caches.match(urlWithoutParams).then(function(response) {
    return response || fetch(event.request);
  }));
});

function serveAvatar(request) {
  // Avatar urls look like:
  // avatars/sam-2x.jpg
  // But storageUrl has the -2x.jpg bit missing.
  // Use this url to store & match the image in the cache.
  // This means you only store one copy of each avatar.
  var storageUrl = request.url.replace(/-\dx\.jpg$/, '');

  // TODO: return images from the "restaurant-reviews-content-imgs" cache
  // if they're in there. But afterwards, go to the network
  // to update the entry in the cache.
  //
  // Note that this is slightly different to servePhoto!
  return caches.open(contentImgsCache).then(function(cache) {
    return cache.match(storageUrl).then(function(response) {
      var networkResponse = fetch(request).then(function(networkResponse) {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });

      return response || networkResponse;
    });
  });
}

function servePhoto(request) {
  var storageUrl = request.url.replace(/.jpg$/, '');

  return caches.open(contentImgsCache).then(function(cache) {
    return cache.match(storageUrl).then(function(response) {
      if (response)
        return response;

      return fetch(request).then(function(networkResponse) {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}


function serveData(request) {
  var storageUrl = request.url;

  return caches.open(contentDataCache).then(function(cache) {
    return cache.match(storageUrl).then(function(response) {
      if (response)
        return response;

      return fetch(request).then(function(networkResponse) {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}


// function serveMap(request) {
//   var storageUrl = request.url;
//
//   return caches.open(contentMapCache).then(function(cache) {
//     return cache.match(storageUrl).then(function(response) {
//       if (response)
//         return response;
//
//       return fetch(request).then(function(networkResponse) {
//         cache.put(storageUrl, networkResponse.clone());
//         return networkResponse;
//       });
//     });
//   });
// }

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
