let restaurant;
let map;


document.addEventListener('DOMContentLoaded', (event) => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      console.log('[DOMContentLoaded]', self.restaurant);
      fillBreadcrumb();
    }
  });
});

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false,
      });
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};


function handleModalReviews() {
  // Get the modal
  const modal = document.getElementById('review-modal');

  // Get the button that opens the modal
  const btn = document.getElementById('open-review');

  // Get the <span> element that closes the modal
  const span = document.getElementsByClassName('close')[0];

  // When the user clicks the button, open the modal
  btn.onclick = function () {
    modal.style.display = 'block';
  };

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = 'none';
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
}

handleModalReviews();

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    console.log('[[IDNOTFOUND]]', id);
    const error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });

    DBHelper.fetchReviewsByRestaurantID(id, (error, reviews) => {
      console.log('reviews', id, reviews, error);
      if (!reviews) {
        console.error(error);
        return;
      }
      restaurant.reviews = reviews;
      // fill reviews
      fillReviewsHTML(restaurant.reviews);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  // const image = document.getElementById('restaurant-img');
  // image.className = 'restaurant-img'
  // image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const image = responsiveImage(restaurant);
  const container = document.getElementById('restaurant-container');
  const figure = document.getElementById('restaurant-img');
  figure.innerHTML = image.innerHTML;
  // container.insertBefore(image, container.children[1])

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');

  // reset REVIEWS
  while (hours.firstChild) {
    hours.removeChild(hours.firstChild);
  }

  for (const key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');

  if (!container.querySelector('h3')) {
    const title = document.createElement('h3');
    title.innerHTML = 'Reviews';
    container.appendChild(title);
  }


  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
  }

  fillReviewsList(reviews);
};

function fillReviewsList(reviews) {
  const container = document.getElementById('reviews-container');
  const ul = document.getElementById('reviews-list');

  // reset REVIEWS
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }

  reviews.forEach((review) => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}
/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.createdAt).toDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.querySelector('#navBreadcrumb ul');
  const li = document.createElement('li');
  const currentPage = document.createElement('a');
  currentPage.innerHTML = restaurant.name;
  currentPage.setAttribute('href', location.href);
  currentPage.setAttribute('aria-current', 'page');
  li.appendChild(currentPage);
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Send Review
 */

const sendReview = () => {
  const modal = document.getElementById('review-modal');
  const form = document.querySelector('#review-form');
  const id = parseInt(getParameterByName('id'), 10);
  const name = form.elements[0].value;
  const rating = form.elements[1].value;
  const comments = form.elements[2].value;

  if (!id || !name || !rating || !comments) {
    console.log('one value is missing');
    return;
  }

  const body = {
    createdAt: new Date().getTime(),
    restaurant_id: id,
    name,
    rating,
    comments,
  };
  fetch('http://localhost:1337/reviews/', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(res => res.json())
    .catch((err) => {
      console.log('[errorBeforeJSON]', err);
      DBHelper.addPendingReview(body);
    })
    .finally(() => {
      // Get the modal
      form.reset();
      modal.style.display = 'none';
      console.log(id);
      DBHelper.fetchReviewsByRestaurantID(id, (error, reviews) => {
        console.log('reviews', reviews);
        if (!reviews) {
          console.error(error);
          return;
        }
        restaurant.reviews = reviews;

        // fill reviews
        fillReviewsList(restaurant.reviews);
      });
    });
};
