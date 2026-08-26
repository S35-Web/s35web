document.addEventListener('DOMContentLoaded', function () {
  const filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
  const families = Array.prototype.slice.call(document.querySelectorAll('.catalog-family'));
  const countEl = document.getElementById('catalogCount');

  function applyFilter(filter) {
    filterButtons.forEach(function (btn) {
      const on = btn.getAttribute('data-filter') === filter;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    let visible = 0;
    families.forEach(function (section) {
      const matchFamily = filter === 'all' || section.getAttribute('data-family') === filter;
      const cards = section.querySelectorAll('.product-card');
      let shown = 0;
      cards.forEach(function (card) {
        const show = matchFamily;
        card.hidden = !show;
        if (show) shown += 1;
      });
      section.hidden = shown === 0;
      visible += shown;
    });

    if (countEl) {
      const label = visible === 1 ? 'producto' : 'productos';
      countEl.textContent = visible + ' ' + label;
    }

    if (filter === 'all') {
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    } else if (history.replaceState) {
      history.replaceState(null, '', '#' + filter);
    }
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      applyFilter(this.getAttribute('data-filter'));
    });
  });

  const hash = (location.hash || '').replace('#', '');
  const known = filterButtons.some(function (btn) { return btn.getAttribute('data-filter') === hash; });
  applyFilter(known ? hash : 'all');

  function thumbFallback(img) {
    const wrap = img.parentElement;
    if (!wrap || wrap.classList.contains('product-thumb--empty')) return;
    const card = wrap.closest('.product-card');
    const name = ((card && card.querySelector('h3')) || {}).textContent || 'S35';
    const variant = ((card && card.querySelector('.product-variant')) || {}).textContent || '';
    const parts = (name + ' ' + variant).trim().split(/\s+/).filter(Boolean);
    const initials = (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
    wrap.classList.add('product-thumb--empty');
    wrap.innerHTML = '<span>' + initials + '</span>';
  }

  document.querySelectorAll('.product-thumb img').forEach(function (img) {
    img.addEventListener('error', function () { thumbFallback(img); });
    if (img.complete && img.naturalWidth === 0) thumbFallback(img);
  });
});
