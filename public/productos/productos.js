/* S-35 — Fichas técnicas de producto: menú de familias y animación de entrada. */
(function () {
  'use strict';

  var page = document.querySelector('.pr-page--split');
  if (!page) return;

  var overview = document.getElementById('ov-panel-overview');
  var ficha = document.getElementById('ov-panel-ficha');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-ov-tab]'));
  if (!overview || !ficha) return;

  function setView(id, push) {
    var isFicha = id === 'ficha';
    overview.hidden = isFicha;
    ficha.hidden = !isFicha;
    page.classList.toggle('is-overview', !isFicha);
    page.classList.toggle('is-technical', isFicha);
    tabs.forEach(function (el) {
      var on = el.getAttribute('data-ov-tab') === (isFicha ? 'ficha' : 'overview');
      if (el.getAttribute('role') === 'tab') el.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (push) {
      var hash = isFicha ? '#ficha' : '#overview';
      if (history.replaceState) history.replaceState(null, '', hash);
      else location.hash = hash;
    }
    window.scrollTo(0, 0);
  }

  function fromHash() {
    var h = (location.hash || '').replace('#', '');
    setView(h === 'ficha' || h === 'technical' ? 'ficha' : 'overview', false);
  }

  tabs.forEach(function (el) {
    el.addEventListener('click', function () {
      setView(el.getAttribute('data-ov-tab') === 'ficha' ? 'ficha' : 'overview', true);
    });
  });

  window.addEventListener('hashchange', fromHash);
  fromHash();

  var yieldRoot = document.querySelector('[data-ov-yield]');
  var dataEl = document.getElementById('ov-yield-data');
  if (yieldRoot && dataEl) {
    var rows = {};
    try { rows = JSON.parse(dataEl.textContent || '{}'); } catch (e) { rows = {}; }
    var grid = yieldRoot.querySelector('[data-ov-yield-grid]');
    var pills = Array.prototype.slice.call(yieldRoot.querySelectorAll('.ov-pill'));

    function paint(joint) {
      var list = rows[joint] || [];
      if (!grid) return;
      grid.innerHTML = list.map(function (r) {
        return '<div class="ov-yield-card"><small>' + r.medida + '</small><strong>' + r.m2 + '</strong><span>' + r.detalle + '</span></div>';
      }).join('');
      pills.forEach(function (btn) {
        btn.setAttribute('aria-pressed', btn.getAttribute('data-joint') === joint ? 'true' : 'false');
      });
    }

    pills.forEach(function (btn) {
      btn.addEventListener('click', function () {
        paint(btn.getAttribute('data-joint'));
      });
    });
    var current = pills.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0];
    paint(current ? current.getAttribute('data-joint') : '6 mm');
  }
})();

(function () {
  'use strict';

  function familyIdFromHref(href) {
    var i = String(href || '').indexOf('#');
    return i === -1 ? '' : href.slice(i + 1);
  }

  var nav = document.querySelector('.pr-subnav-links');
  if (!nav) return;

  var links = Array.prototype.slice.call(nav.querySelectorAll('.pr-subnav-family'));
  if (!links.length) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var currentId = '';
  var spyTick = false;
  var flipTimer = 0;
  var sections = Array.prototype.slice.call(document.querySelectorAll('.pr-sheet .pr-row[id]'));
  var wrap = document.querySelector('.pr-subnav');

  links.forEach(function (el, i) {
    el.dataset.familyIndex = String(i);
    el.style.order = String(i);
  });

  function linkById(id) {
    for (var i = 0; i < links.length; i++) {
      if (familyIdFromHref(links[i].getAttribute('href') || '') === id) return links[i];
    }
    return null;
  }

  function spyId() {
    if (!sections.length) return '';
    var sticky = wrap ? wrap.getBoundingClientRect().bottom : 90;
    var y = sticky + 88;
    var id = sections[0].id;
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      if (r.top <= y) id = sections[i].id;
    }
    return id;
  }

  function clearFlip() {
    if (wrap) wrap.classList.remove('is-flipping');
    links.forEach(function (el) {
      el.style.transition = '';
      el.style.transform = '';
    });
  }

  function dock(id, animate) {
    if (!id || id === currentId) return;
    var next = linkById(id);
    if (!next) return;

    var first = {};
    if (animate && !reduce) {
      links.forEach(function (el) {
        first[el.dataset.familyIndex] = el.getBoundingClientRect();
      });
    }

    currentId = id;
    links.forEach(function (el) {
      el.removeAttribute('aria-current');
      el.style.order = el.dataset.familyIndex;
    });
    next.setAttribute('aria-current', 'true');
    next.style.order = '-1';

    if (nav.scrollLeft) {
      nav.scrollTo({ left: 0, behavior: reduce || !animate ? 'auto' : 'smooth' });
    }

    if (!animate || reduce) return;

    if (wrap) wrap.classList.add('is-flipping');
    links.forEach(function (el) {
      var from = first[el.dataset.familyIndex];
      if (!from) return;
      var dx = from.left - el.getBoundingClientRect().left;
      if (Math.abs(dx) < 0.5) return;
      el.style.transition = 'none';
      el.style.transform = 'translateX(' + dx + 'px)';
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        links.forEach(function (el) {
          el.style.transition = 'transform 0.62s cubic-bezier(0.22, 1.78, 0.32, 1)';
          el.style.transform = '';
        });
        window.clearTimeout(flipTimer);
        flipTimer = window.setTimeout(clearFlip, 680);
      });
    });
  }

  nav.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.pr-subnav-family');
    if (!a) return;
    dock(familyIdFromHref(a.getAttribute('href') || ''), true);
  });

  var start = familyIdFromHref(location.hash || '');
  if (!linkById(start)) {
    var marked = nav.querySelector('[aria-current="true"]');
    start = spyId() || (marked ? familyIdFromHref(marked.getAttribute('href') || '') : '');
  }
  if (!start && links[0]) start = familyIdFromHref(links[0].getAttribute('href') || '');
  dock(start, false);

  if (sections.length > 1) {
    window.addEventListener('scroll', function () {
      if (spyTick) return;
      spyTick = true;
      requestAnimationFrame(function () {
        spyTick = false;
        dock(spyId(), true);
      });
    }, { passive: true });
    window.addEventListener('hashchange', function () {
      dock(familyIdFromHref(location.hash || ''), true);
    });
  }
})();

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
