/* S-35 — Fichas técnicas de producto: animación de entrada de la retícula. */
(function () {
  'use strict';

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var easeOk = !window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!easeOk) {
    document.documentElement.classList.add('pr-reduced');
    return;
  }

  var sheet = qs('.pr-sheet--motion');
  if (!sheet || !('IntersectionObserver' in window)) return;

  qsa('tbody', sheet).forEach(function (body) {
    qsa('tr', body).forEach(function (tr, i) {
      tr.style.setProperty('--i', String(Math.min(i, 10)));
    });
  });

  // Las curvas se dibujan trazándose: hay que conocer su longitud primero.
  qsa('.pr-curve', sheet).forEach(function (el) {
    var len = 0;
    try { len = el.getTotalLength(); } catch (e) { return; }
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
  });

  qsa('.pr-barfill', sheet).forEach(function (el, i) {
    el.style.transitionDelay = (i * 0.1) + 's';
  });

  requestAnimationFrame(function () {
    sheet.classList.add('is-armed');
    requestAnimationFrame(function () {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          qsa('.pr-curve', entry.target).forEach(function (el) {
            el.style.strokeDashoffset = '0';
          });
          io.unobserve(entry.target);
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

      qsa('.pr-mast, .pr-hair, .pr-row, .pr-family-head, .pr-end', sheet).forEach(function (el) {
        io.observe(el);
      });
    });
  });
})();
