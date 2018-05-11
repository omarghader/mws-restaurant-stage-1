

const responsiveBreakPoints = [
  {
    media: {
      minwidth: 0,
      maxwidth: 500,
    },
    srcset: [
      {
        imgSuffix: 'small',
        imgCondition: '450w',
      },
    ],
    sizes: [],
  }, {
    media: {
      minwidth: 501,
      maxwidth: 850,
    },
    srcset: [
      {
        imgSuffix: 'medium',
        imgCondition: '550w',
      },
    ],
    sizes: [],
  }, {
    media: {
      minwidth: 851,
      maxwidth: null,
    },
    srcset: [
      {
        imgSuffix: 'large',
        imgCondition: '800w',
      },
    ],
    sizes: [],
  },
];

const responsiveImage = (restaurant) => {
  const figure = document.createElement('figure');
  const picture = document.createElement('picture');

  for (const breakPoint of responsiveBreakPoints) {
    const source = document.createElement('source');
    source.className = 'lazy';

    source.media = '';
    if (breakPoint.media.maxwidth && breakPoint.media.minwidth) {
      source.media += `(min-width: ${breakPoint.media.minwidth}px) and (max-width: ${breakPoint.media.maxwidth}px)`;
    } else {
      if (breakPoint.media.minwidth) { source.media += `(min-width: ${breakPoint.media.minwidth}px)`; }
      if (breakPoint.media.maxwidth) { source.media += `(max-width: ${breakPoint.media.maxwidth}px)`; }
    }

    const srcsets = [];

    for (const srcset of breakPoint.srcset) {
      if (srcset.imgSuffix === 'small') { continue; }
      srcsets.push(`${DBHelper.imageUrlForRestaurant(restaurant, srcset.imgSuffix)}  ${srcset.imgCondition}`);
    }

    // if there is src set Add
    if (srcsets.length > 0) {
      source.srcset = srcsets.join(srcsets, ',');
      // source.dataset.srcset = srcsets.join(srcsets, ',');

      picture.append(source);
    }
  }

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant, 'small');
  // image.dataset.src = DBHelper.imageUrlForRestaurant(restaurant, 'small');
  image.alt = `Image of the restaurant ${restaurant.name}`;
  picture.append(image);

  figure.append(picture);

  const figureCaption = document.createElement('figcaption');
  figureCaption.innerHTML = restaurant.name;
  figure.append(figureCaption);

  return figure;
};

//
let lazy = [];


function setLazy() {
  // document.getElementById('listing').removeChild(document.getElementById('viewMore'));
  // document.getElementById('nextPage').removeAttribute('class');

  lazy = document.querySelectorAll('img[data-src]');
  console.log(`Found ${lazy.length} lazy images`);
}

function lazyLoad() {
  lazy = document.querySelectorAll('img[data-src]');

  for (let i = 0; i < lazy.length; i++) {
    if (isInViewport(lazy[i])) {
      if (lazy[i].getAttribute('data-src')) {
        lazy[i].src = lazy[i].getAttribute('data-src');
        lazy[i].removeAttribute('data-src');
      }
    }
  }

  cleanLazy();
}

function cleanLazy() {
  lazy = Array.prototype.filter.call(lazy, l => l.getAttribute('data-src'));
}

function isInViewport(el) {
  const rect = el.getBoundingClientRect();

  return (
    rect.bottom >= 0 &&
        rect.right >= 0 &&
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.left <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function registerListener(event, func) {
  if (window.addEventListener) {
    window.addEventListener(event, func);
  } else {
    window.attachEvent(`on${event}`, func);
  }
}


registerListener('load', setLazy);
registerListener('load', lazyLoad);
registerListener('scroll', lazyLoad);
registerListener('resize', lazyLoad);
