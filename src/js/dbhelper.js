/**
 * Common database helper functions.
 */

const restoDbname = 'restomws';
const reviewsDbname = 'reviewsmws';
const objectStore = 'mwsObjectStore';

// eslint-disable-next-line
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  // ===========================================
  // Restaurants
  // ===========================================

  static initDB() {
    // This works on all devices/browsers, and uses IndexedDBShim as a final fallback
    const indexedDB = window.indexedDB; // eslint-disable-line

    // Open (or create) the database
    const open = indexedDB.open(restoDbname, 1);

    // Create the schema
    open.onupgradeneeded = function onupgradeneeded() {
      const db = open.result;
      db.createObjectStore(objectStore, { keyPath: 'id' });
      // var index = store.createIndex("NameIndex", ["name.last", "name.first"]);
    };

    return open;
  }


  static storeRestoToDB(data) {
    const open = DBHelper.initDB();

    open.onsuccess = function onsuccess() {
      // Start a new transaction
      const db = open.result;
      const tx = db.transaction(objectStore, 'readwrite');
      const store = tx.objectStore(objectStore);

      data.forEach((resto) => {
        store.put(resto);
      });
    };
  }

  static getRestoFromDB(query, callback) {
    const open = DBHelper.initDB();

    open.onsuccess = function onsuccess() {
      // Start a new transaction
      const db = open.result;
      const tx = db.transaction(objectStore, 'readwrite');
      const store = tx.objectStore(objectStore);

      let res = store.getAll();
      if (query) {
        res = store.get(parseInt(query, 10));
      }

      res.onsuccess = function resonsuccess() {
        callback(res.result);
      };

      // Close the db when the transaction is done
      tx.oncomplete = function oncomplete() {
        db.close();
      };
    };
  }

  // ===========================================
  // Reviews
  // ===========================================

  static initReviewsDB() {
    // This works on all devices/browsers, and uses IndexedDBShim as a final fallback
      const indexedDB = window.indexedDB; // eslint-disable-line

    // Open (or create) the database
    const open = indexedDB.open(reviewsDbname, 1);

    // Create the schema
    open.onupgradeneeded = function onupgradeneeded() {
      const db = open.result;
      db.createObjectStore(objectStore, { keyPath: 'id' });
      // var index = store.createIndex("NameIndex", ["name.last", "name.first"]);
    };

    return open;
  }


  static storeReviewsToDB(data) {
    const open = DBHelper.initReviewsDB();

    open.onsuccess = function onsuccess() {
      // Start a new transaction
      const db = open.result;
      const tx = db.transaction(objectStore, 'readwrite');
      const store = tx.objectStore(objectStore);

      data.forEach((resto) => {
        store.put(resto);
      });
    };
  }

  static getReviewsFromDB(query, callback) {
    const open = DBHelper.initReviewsDB();

    open.onsuccess = function onsuccess() {
      // Start a new transaction
      const db = open.result;
      const tx = db.transaction(objectStore, 'readwrite');
      const store = tx.objectStore(objectStore);

      let res = store.getAll();
      if (query) {
        res = store.get(parseInt(query, 10));
      }

      res.onsuccess = function resonsuccess() {
        callback(res.result);
      };

      // Close the db when the transaction is done
      tx.oncomplete = function oncomplete() {
        db.close();
      };
    };
  }


  // ===========================================
  // ===========================================

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    DBHelper.getRestoFromDB(null, (data) => {
      if (data) {
        console.log('[[DATAFROMDB]]', data);
        callback(null, data);
      }

      // eslint-disable-next-line
      fetch(DBHelper.DATABASE_URL).then(res => res.json()).then((restaurants) => {
        callback(null, restaurants);
        DBHelper.storeRestoToDB(restaurants);
      }).catch((err) => {
        const error = ('Request failed', err);
        callback(error, null);
      });
    });
  }


  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.getRestoFromDB(id, (data) => {
      console.log('data', id, data);
      if (data) {
        console.log('[[DATAFROMDB]]', data);
        callback(null, data);
        return;
      }

      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          console.log(id, restaurants);
          const restaurant = restaurants.find(r => r.id === id);
          if (restaurant) { // Got the restaurant
            callback(null, restaurant);
          } else { // Restaurant does not exist in the database
            callback('Restaurant does not exist', null);
          }
        }
      });
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type === cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood === neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine !== 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type === cuisine);
        }
        if (neighborhood !== 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood === neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) === i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) === i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant, dimension) {
    switch (dimension) {
      case 'large':
        return (`/img/${restaurant.id}-large.jpg`);
      case 'medium':
        return (`/img/${restaurant.id}-medium.jpg`);
      default:
        return (`/img/${restaurant.id}-small.jpg`);
    }
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // eslint-disable-next-line
    if (!window.google) { return; }

    // eslint-disable-next-line
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map,
      animation: google.maps.Animation.DROP,//eslint-disable-line
    });
    // eslint-disable-next-line
    return marker;
  }
}
