(function () {
  var easeOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function activatePhoto(id) {
    qsa('.ml-photo-slot').forEach(function (el) {
      el.classList.toggle('is-on', el.getAttribute('data-photo') === id);
    });
    qsa('.ml-row[data-photo]').forEach(function (row) {
      row.classList.toggle('is-active', row.getAttribute('data-photo') === id);
    });
  }

  qsa('.ml-row[data-photo]').forEach(function (row) {
    var id = row.getAttribute('data-photo');
    row.addEventListener('mouseenter', function () { activatePhoto(id); });
    row.addEventListener('focusin', function () { activatePhoto(id); });
    row.addEventListener('click', function (e) {
      if (window.matchMedia('(max-width: 768px)').matches && row.getAttribute('data-status') === 'in-study') {
        e.preventDefault();
        row.classList.toggle('is-open');
        var body = row.nextElementSibling;
        if (body && body.classList.contains('ml-accordion-body')) {
          body.classList.toggle('is-open');
        }
      }
    });
  });

  var first = qs('.ml-row[data-photo]');
  if (first) activatePhoto(first.getAttribute('data-photo'));

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
})();
