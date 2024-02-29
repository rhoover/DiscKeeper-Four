(function() {
  'use strict';

  var contentElem = document.querySelector('.graph-chart');
  var contentElemPos = contentElem.offsetTop;
  var scrollButton = document.querySelector('.list-scroller');
  // console.log(contentElem.getBoundingClientRect().top);

  contentElem.addEventListener('scroll', function () {
    if (contentElem.scrollTop > 150) {
      scrollButton.classList.add('list-scroller-visible');      
    } else {
      scrollButton.classList.remove('list-scroller-visible');
    };
  });

  scrollButton.onclick = function scroll() {

    var scrollMath = function (t, b, c, d) { //t = current time, b = start value, c = change in value, d = duration
      t /= d/2;
      if (t < 1) {
          return c/2*t*t + b;
      }
      t--;
      return -c/2 * (t*(t-2) - 1) + b;
    };

    function scrollThis(element, to, duration) {

      var start = element.scrollTop,
        change = to - start,
        currentTime = 0,
        increment = 20;

      var animateScroll = function(){
        currentTime += increment;
        var val = scrollMath(currentTime, start, change, duration);
        element.scrollTop = val;
        if(currentTime < duration) {
          requestAnimationFrame(animateScroll);
        }
      };

      animateScroll();
    }

    scrollThis(contentElem, 0, 2000);// for Chrome
    scrollThis(contentElem, 0, 2000);// for Firefox
  }

}());
