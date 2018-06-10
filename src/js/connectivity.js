window.addEventListener('online', () => {
  // alert('Your connection is back');
  const pendingReviews = DBHelper.getPendingReviews();
  pendingReviews.forEach((pendingReview) => {
    fetch('http://localhost:1337/reviews/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pendingReview),
    }).then(res => res.json())
      .catch((err) => {
        console.log('[errorBeforeJSON]', err);
      });
  });

  DBHelper.ClearPendingReview();
});
window.addEventListener('offline', () => {
  alert('Connection lost! Please check your connection.');
});
