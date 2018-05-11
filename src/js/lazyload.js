// let lazy = [];
//
//
// function setLazy() {
//   // document.getElementById('listing').removeChild(document.getElementById('viewMore'));
//   // document.getElementById('nextPage').removeAttribute('class');
//
//   lazy = document.querySelectorAll('img[data-src]');
//   console.log(`Found ${lazy.length} lazy images`);
// }
//
// function lazyLoad() {
//   lazy = document.querySelectorAll('img[data-src]');
//
//   for (let i = 0; i < lazy.length; i++) {
//     if (isInViewport(lazy[i])) {
//       if (lazy[i].getAttribute('data-src')) {
//         lazy[i].src = lazy[i].getAttribute('data-src');
//         lazy[i].removeAttribute('data-src');
//       }
//     }
//   }
//
//   cleanLazy();
// }
//
// function cleanLazy() {
//   lazy = Array.prototype.filter.call(lazy, l => l.getAttribute('data-src'));
// }
//
// function isInViewport(el) {
//   const rect = el.getBoundingClientRect();
//
//   return (
//     rect.bottom >= 0 &&
//         rect.right >= 0 &&
//         rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
//         rect.left <= (window.innerWidth || document.documentElement.clientWidth)
//   );
// }
//
// function registerListener(event, func) {
//   if (window.addEventListener) {
//     window.addEventListener(event, func);
//   } else {
//     window.attachEvent(`on${event}`, func);
//   }
// }
//
//
// registerListener('load', setLazy);
// registerListener('load', lazyLoad);
// registerListener('scroll', lazyLoad);
// registerListener('resize', lazyLoad);


// document.addEventListener('DOMContentLoaded', () => {
//   let lazyImages = [].slice.call(document.querySelectorAll('img.lazy'));
//   let active = false;
//
//   const lazyLoad = function () {
//     if (active === false) {
//       active = true;
//
//       setTimeout(() => {
//         lazyImages.forEach((lazyImage) => {
//           if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== 'none') {
//             lazyImage.src = lazyImage.dataset.src;
//             lazyImage.srcset = lazyImage.dataset.srcset;
//             lazyImage.classList.remove('lazy');
//
//             lazyImages = lazyImages.filter(image => image !== lazyImage);
//
//             if (lazyImages.length === 0) {
//               document.removeEventListener('scroll', lazyLoad);
//               window.removeEventListener('resize', lazyLoad);
//               window.removeEventListener('orientationchange', lazyLoad);
//             }
//           }
//         });
//
//         active = false;
//       }, 200);
//     }
//   };
//
//   document.addEventListener('scroll', lazyLoad);
//   window.addEventListener('resize', lazyLoad);
//   window.addEventListener('orientationchange', lazyLoad);
// });
