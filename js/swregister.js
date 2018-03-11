class SWService {


  registerServiceWorker() {
    if (!navigator.serviceWorker) return;

    var indexController = this;

    navigator.serviceWorker.register('/sw.js').then(function(reg) {

      if (!navigator.serviceWorker.controller) {
        return;
      }

      if (reg.waiting) {
        indexController.updateReady(reg.waiting);
        return;
      }

      if (reg.installing) {
        indexController.trackInstalling(reg.installing);
        return;
      }

      reg.addEventListener('updatefound', function() {
        indexController.trackInstalling(reg.installing);
      });
    });

    // Ensure refresh is only called once.
    // This works around a bug in "force update on reload".
    var refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', function() {
      if (refreshing) return;
      window.location.reload();
      refreshing = true;
    });
  }

  showCachedMessages() {
    var indexController = this;

    return this._dbPromise.then(function(db) {
      // if we're already showing posts, eg shift-refresh
      // or the very first load, there's no point fetching
      // posts from IDB
      if (!db || indexController._postsView.showingPosts()) return;

      var index = db.transaction(indexedDBName)
        .objectStore(indexedDBName).index('by-date');

      return index.getAll().then(function(messages) {
        indexController._postsView.addPosts(messages.reverse());
      });
    });
  }

  trackInstalling(worker) {
    var indexController = this;
    worker.addEventListener('statechange', function() {
      if (worker.state == 'installed') {
        indexController.updateReady(worker);
      }
    });
  }


  updateReady(worker) {
    // var toast = this._toastsView.show("New version available", {
    //   buttons: ['refresh', 'dismiss']
    // });
    //
    // toast.answer.then(function(answer) {
    //   if (answer != 'refresh') return;
      worker.postMessage({
        action: 'skipWaiting'
      });
    // });
  }


  // cleanImageCache() {
  //   return this._dbPromise.then(function(db) {
  //     if (!db) return;
  //
  //     var imagesNeeded = [];
  //
  //     var tx = db.transaction('wittrs');
  //     return tx.objectStore('wittrs').getAll().then(function(messages) {
  //       messages.forEach(function(message) {
  //         if (message.photo) {
  //           imagesNeeded.push(message.photo);
  //         }
  //         imagesNeeded.push(message.avatar);
  //       });
  //
  //       return caches.open('wittr-content-imgs');
  //     }).then(function(cache) {
  //       return cache.keys().then(function(requests) {
  //         requests.forEach(function(request) {
  //           var url = new URL(request.url);
  //           if (!imagesNeeded.includes(url.pathname)) cache.delete(request);
  //         });
  //       });
  //     });
  //   });
  // }

}


let swregister = new SWService();
swregister.registerServiceWorker();
