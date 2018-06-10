/**
 * Common database helper functions.
 */

const restoDbname = 'restomws';
const reviewsDbname = 'reviewsmws';
const objectStore = 'mwsObjectStore';
const pendingReviewsID = 'pendingReviews';

// eslint-disable-next-line
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
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
  // ===========================================

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    DBHelper.getRestoFromDB(null, (data) => {
      if (data) {
        callback(null, data);
      }

      // eslint-disable-next-line
      fetch(`${DBHelper.DATABASE_URL}/restaurants`).then(res => res.json()).then((restaurants) => {
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
      if (data) {
        callback(null, data);
        return;
      }

      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
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
      const store = db.createObjectStore(objectStore, { keyPath: 'id' });
      store.createIndex('RestaurantIDIndex', ['restaurant_id']);
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
      const index = store.index('RestaurantIDIndex');

      let res;
      if (query) {
        res = index.getAll([parseInt(query, 10)]);
      } else {
        res = index.getAll();
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

  /**
   * Fetch all restaurants.
   */
  static fetchReviewsByRestaurantID(id, callback) {
    DBHelper.getReviewsFromDB(id, (data) => {
      if (data) {
        let restoReviews = data.slice(0);
        const pendingReviews = DBHelper.getPendingReviewsByID(id);
        restoReviews = restoReviews.concat(pendingReviews);
        callback(null, restoReviews);
      }

      // eslint-disable-next-line
      fetch(`${DBHelper.DATABASE_URL}/reviews?restaurant_id=${id}`).then(res => res.json()).then((reviews) => {
        let restoReviews = reviews.slice(0);
        const pendingReviews = DBHelper.getPendingReviewsByID(id);
        restoReviews = restoReviews.concat(pendingReviews);

        callback(null, restoReviews);
        DBHelper.storeReviewsToDB(reviews);
      }).catch((err) => {
        const error = ('Request failed', err);
        callback(error, null);
      });
    });
  }

  static addPendingReview(review) {
    // Parse any JSON previously stored in allEntries
    let existingEntries = JSON.parse(localStorage.getItem(pendingReviewsID));
    if (existingEntries == null) existingEntries = [];
    existingEntries.push(review);
    localStorage.setItem(pendingReviewsID, JSON.stringify(existingEntries));
  }

  static getPendingReviews() {
    // Parse any JSON previously stored in allEntries
    let existingEntries = JSON.parse(localStorage.getItem(pendingReviewsID));
    if (existingEntries == null) {
      existingEntries = [];
    }
    return existingEntries;
  }

  static getPendingReviewsByID(id) {
    const pendingReviews = DBHelper.getPendingReviews();
    const numericID = parseInt(id, 10);

    const restoReviews = [];

    pendingReviews.forEach((pendingReview) => {
      if (pendingReview.restaurant_id === numericID) {
        restoReviews.push(pendingReview);
      }
    });
    return restoReviews;
  }

  static ClearPendingReview() {
    // Parse any JSON previously stored in allEntries
    localStorage.removeItem(pendingReviewsID);
  }
}
