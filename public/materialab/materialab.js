(function () {
  var easeOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  qsa('[data-filter-group]').forEach(function (group) {
    var table = qs(group.getAttribute('data-filter-group'));
    if (!table) return;
    qsa('button', group).forEach(function (btn) {
      btn.addEventListener('click', function () {
        qsa('button', group).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        var cat = btn.getAttribute('data-cat');
        qsa('tbody tr', table).forEach(function (tr) {
          var show = cat === 'ALL' || tr.getAttribute('data-cat') === cat;
          tr.hidden = !show;
        });
      });
    });
  });

  var params = new URLSearchParams(window.location.search);
  if (params.get('utm_source') === 'packaging') {
    var bar = qs('[data-packaging-banner]');
    if (bar) bar.hidden = false;
  }
  if (params.get('notice') === 'not-found') {
    var warn = qs('[data-not-found]');
    if (warn) warn.hidden = false;
  }

  var printBtn = qs('[data-print]');
  if (printBtn) {
    printBtn.addEventListener('click', function () { window.print(); });
  }

  if (!easeOk) {
    document.documentElement.classList.add('ml-reduced');
  }

  (function sheetMotion() {
    var sheet = qs('.ml-sheet--motion');
    if (!sheet || !easeOk) return;

    qsa('tbody', sheet).forEach(function (body) {
      qsa('tr', body).forEach(function (tr, i) {
        tr.style.setProperty('--i', String(Math.min(i, 10)));
      });
    });
    qsa('.ml-m-curve', sheet).forEach(function (el) {
      var len = 0;
      try { len = el.getTotalLength(); } catch (e) { return; }
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
    });

    qsa('.ml-m-grain', sheet).forEach(function (el, i) {
      el.style.transitionDelay = (i * 0.12) + 's';
    });
    qsa('.ml-m-barfill', sheet).forEach(function (el, i) {
      el.style.transitionDelay = (i * 0.1) + 's';
    });

    requestAnimationFrame(function () {
      sheet.classList.add('is-armed');
      requestAnimationFrame(function () {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            qsa('.ml-m-curve', entry.target).forEach(function (el) {
              el.style.strokeDashoffset = '0';
            });
            io.unobserve(entry.target);
          });
        }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

        qsa('.ml-sheet-mast, .ml-m-hair, .ml-sheet-row, .ml-sheet-end', sheet).forEach(function (el) {
          io.observe(el);
        });
      });
    });
  })();
})();
