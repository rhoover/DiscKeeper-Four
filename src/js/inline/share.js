(() => {
  'use strict';

  const homeShareButton = document.querySelector(".home-share");
  
  const pageTitle = document.title;
  const pageURL = document.querySelector("link[rel=canonical]");


  if (navigator.share) {
    homeShareButton.addEventListener('click', () =>
      navigator.share({
        title: pageTitle,
        url: pageURL.href
      })
    );
  };
})();