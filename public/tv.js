(function () {
  var INTERVAL = 8000;
  var colors = ['#8b5cf6', '#e11d2e', '#2563eb', '#f97316', '#22c55e', '#9ca3af'];
  var slides = document.getElementById('tv-main').getElementsByTagName('section');
  var buttons = document.getElementById('tv-dots').getElementsByTagName('button');
  var total = slides.length;
  var start = parseInt((location.search || '').replace('?cat=', ''), 10);
  var index = isNaN(start) ? 0 : start;
  var i;

  function paint(next) {
    index = next % total;
    if (index < 0) index = total - 1;
    for (i = 0; i < total; i++) {
      slides[i].className = i === index ? 'tv-slide is-on' : 'tv-slide';
      buttons[i].className = i === index ? 'tv-dot is-on' : 'tv-dot';
      buttons[i].style.background = i === index ? colors[i] : '#3a3a3a';
    }
  }

  function onDot(n) {
    return function () { paint(n); };
  }

  for (i = 0; i < buttons.length; i++) {
    buttons[i].onclick = onDot(i);
  }

  if (index) paint(index);
  setInterval(function () { paint(index + 1); }, INTERVAL);
})();
