class SWService {
  registerServiceWorker() {
    if (!navigator.serviceWorker) return;

    const indexController = this;

    navigator.serviceWorker.register('/sw.js').then((reg) => {
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

      reg.addEventListener('updatefound', () => {
        indexController.trackInstalling(reg.installing);
      });
    });

    // Ensure refresh is only called once.
    // This works around a bug in "force update on reload".
    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      window.location.reload();
      refreshing = true;
    });
  }

  showCachedMessages() {
    const indexController = this;

    return this._dbPromise.then((db) => {
      // if we're already showing posts, eg shift-refresh
      // or the very first load, there's no point fetching
      // posts from IDB
      if (!db || indexController._postsView.showingPosts()) return;

      const index = db.transaction(indexedDBName)
        .objectStore(indexedDBName).index('by-date');

      return index.getAll().then((messages) => {
        indexController._postsView.addPosts(messages.reverse());
      });
    });
  }

  trackInstalling(worker) {
    const indexController = this;
    worker.addEventListener('statechange', () => {
      if (worker.state == 'installed') {
        indexController.updateReady(worker);
      }
    });
  }


  updateReady(worker) {
    worker.postMessage({
      action: 'skipWaiting',
    });
  }
}


const swregister = new SWService();
swregister.registerServiceWorker();
