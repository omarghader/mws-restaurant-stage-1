let restaurants,
  neighborhoods,
  cuisines;
let map;
const markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
  updateRestaurants();
});


/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach((neighborhood) => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;

    // Accessibility
    option.setAttribute('role', 'option');
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach((cuisine) => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  const loc = {
    lat: 40.722216,
    lng: -73.987501,
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false,
  });

  updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  // Accessibility
  if (cIndex > 0) {
    cSelect.querySelectorAll('option').forEach((item, index) => {
      if (index === cIndex) {
        item.setAttribute('aria-selected', 'true');
      } else {
        item.removeAttribute('aria-selected');
      }
    });
  }

  if (nIndex > 0) {
    nSelect.querySelectorAll('option').forEach((item, index) => {
      if (index === nIndex) {
        item.setAttribute('aria-selected', 'true');
      } else {
        item.removeAttribute('aria-selected');
      }
    });
  }

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach((restaurant, index) => {
    ul.append(createRestaurantHTML(restaurant, index));
  });
  if (window.google) {
    addMarkersToMap();
  }
};

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant, index) => {
  const li = document.createElement('li');

  const figure = document.createElement('figure');
  const picture = document.createElement('picture');

  for (const breakPoint of responsiveBreakPoints) {
    const source = document.createElement('source');
    source.media = '';
    if (breakPoint.media.maxwidth && breakPoint.media.minwidth) { source.media += `(min-width: ${breakPoint.media.minwidth}px) and (max-width: ${breakPoint.media.maxwidth}px)`; } else {
      if (breakPoint.media.minwidth) source.media += `(min-width: ${breakPoint.media.minwidth}px)`;
      if (breakPoint.media.maxwidth) source.media += `(max-width: ${breakPoint.media.maxwidth}px)`;
    }

    const srcsets = [];

    for (const srcset of breakPoint.srcset) {
      if (srcset.imgSuffix === 'small') continue;
      srcsets.push(`${DBHelper.imageUrlForRestaurant(restaurant, srcset.imgSuffix)}  ${srcset.imgCondition}`);
    }

    // if there is src set Add
    if (srcsets.length > 0) {
      // source.srcset = srcsets.join(srcsets, ',');
      source.dataset.srcset = srcsets.join(srcsets, ',');
      picture.append(source);
    }
  }

  const image = document.createElement('img');
  image.className = 'restaurant-img lazy';
  // image.src = DBHelper.imageUrlForRestaurant(restaurant, 'small');
  image.dataset.src = DBHelper.imageUrlForRestaurant(restaurant, 'small');

  image.alt = `Image of the restaurant ${restaurant.name}`;
  picture.append(image);

  figure.append(picture);

  const figureCaption = document.createElement('figcaption');
  figureCaption.innerHTML = restaurant.name;
  figure.append(figureCaption);


  li.append(figure); // TODO : append figure

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('tabindex', index + 3);
  li.append(more);

  // Set Tabindex
  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach((restaurant) => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};
