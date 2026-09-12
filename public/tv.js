(function () {
  'use strict';

  var SACK = '/Assets/Diseno de Sacos 2026/';
  var INTERVAL = 8000;
  var categories = [
    {
      name: 'Sacos Pegaxpress',
      color: '#8b5cf6',
      desc: 'Adhesivos en seco para pegado de piezas de acabado y mampostería.',
      products: [
        { name: 'Pegaxpress: Ultraforce', subtitle: 'Adhesivo semiflexible con adherencia química superior', weight: '25 KG', src: SACK + 'Pegaexpres-Ultraforce.png' },
        { name: 'Pegaxpress: Piso sobre piso', subtitle: 'Adhesivo para pegado de piso sobre piso existente', weight: '25 KG', src: SACK + 'Pegaexpres-PSP.png' },
        { name: 'Pegaxpress: Block', subtitle: 'Pegamento premium en seco para block', weight: '30 KG', src: SACK + 'Pegaexpress-Block.png' },
        { name: 'Pegaxpress: Porcelánico universal', subtitle: 'Adhesivo para porcelánico y porcelanato', weight: '25 KG', src: SACK + 'Pegaexpres-Porcelanico.png' },
        { name: 'Pegaxpress: Cerámico', subtitle: 'Adhesivo para cerámica de media y alta absorción', weight: '25 KG', src: SACK + 'Pegaexpres-Ceramico.png' }
      ]
    },
    {
      name: 'Líquidos',
      color: '#e11d2e',
      desc: 'Selladores y adhesivos líquidos, en cubeta.',
      products: [
        { name: 'Darawell adhesivo S-35', subtitle: 'Adhesivo acrílico multiuso', weight: '1 L', src: '/Assets/productos_thumbs/adhesivo-darawell.jpg' },
        { name: 'Sellador premium adhesivo S-35', subtitle: 'Adhesivo sellador acrílico', weight: '1 L', src: '/Assets/productos_thumbs/sellador-premium-pintura.jpg' },
        { name: 'Heavy duty adhesivo S-35', subtitle: 'Adhesivo acrílico multiuso', weight: '1 L', src: '/Assets/productos_thumbs/adhesivo-heavy-duty.jpg' },
        { name: 'Nanotech sellador hidrofóbico S-35', subtitle: 'Sellador hidrofóbico transparente', weight: '1 L', src: '/Assets/productos_thumbs/nanotech-hidrofobico.jpg' }
      ]
    },
    {
      name: 'Panel System',
      color: '#2563eb',
      desc: 'Adhesivos y recubrimientos para sistemas de panel, fachada y placas de poliestireno.',
      products: [
        { name: 'Basecoat Plus: Blanco absoluto', subtitle: 'Adhesivo y recubrimiento para paneles de cemento, yeso y poliestireno', weight: '25 KG', src: SACK + 'Basecoat-Blanco-Intenso.png' },
        { name: 'Basecoat Plus: Gris', subtitle: 'Adhesivo y recubrimiento para paneles de cemento, yeso y poliestireno', weight: '25 KG', src: SACK + 'Basecoat-Blanco-Gris.png' }
      ]
    },
    {
      name: 'Pro+ Systems',
      color: '#f97316',
      desc: 'Sistemas profesionales de pegado y nivelación.',
      products: [
        { name: 'Styrobond Pro+', subtitle: 'Pegamento y recubrimiento para poliestireno expandido (EPS)', weight: '25 KG', src: SACK + 'Styrobond-Pro.png' },
        { name: 'Leveltec Pro', subtitle: 'Nivelante cementante de pisos para uso profesional', weight: '35 KG', src: SACK + 'Leveltec-Pro.png' }
      ]
    },
    {
      name: 'Estucos premium',
      color: '#22c55e',
      desc: 'Estucos hidrófugos de acabado, línea Waxtard.',
      products: [
        { name: 'Waxtard blanco perla', subtitle: 'Estuco premium hidrófugo', weight: '25 KG', src: SACK + 'Waxtard-Blanco-Perla.png' },
        { name: 'Waxtard blanco absoluto', subtitle: 'Estuco premium hidrófugo', weight: '25 KG', src: SACK + 'Waxtard-Blanco-Absoluto.png' },
        { name: 'Waxtard gris', subtitle: 'Estuco premium hidrófugo', weight: '25 KG', src: SACK + 'Waxtard-Gris.png' },
        { name: 'Waxtard extra anclaje', subtitle: 'Estuco hidrófugo fino con anclaje químico', weight: '25 KG', src: SACK + 'Waxtard-Extra-Anclaje.png' }
      ]
    },
    {
      name: 'Microconcretos',
      color: '#9ca3af',
      desc: 'Acabados de concreto aparente aplicados en capas delgadas.',
      products: [
        { name: 'Microconcreto: Concreto aparente (Cemento plástico)', subtitle: 'Microconcreto de acabado · Dolphin Fin', weight: '25 KG', src: SACK + 'Microconcreto-Concreto-Aparente.png' }
      ]
    }
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function assetHref(src) {
    return String(src).split('/').map(encodeURIComponent).join('/');
  }

  var main = document.getElementById('tv-main');
  var dots = document.getElementById('tv-dots');
  var board = document.getElementById('tv-board');
  var start = parseInt((location.search.match(/[?&]cat=(\d+)/) || [])[1], 10);
  var index = isNaN(start) ? 0 : Math.max(0, Math.min(categories.length - 1, start));
  var timer = null;
  var paused = false;

  main.innerHTML = categories.map(function (cat, i) {
    var one = cat.products.length <= 2;
    return '<section class="tv-slide' + (i === index ? ' is-on' : '') + '" data-slide="' + i + '">' +
      '<div class="tv-slide-head">' +
      '<h1>' + esc(cat.name) + '</h1>' +
      '<span class="tv-count">' + cat.products.length + ' producto' + (cat.products.length === 1 ? '' : 's') + '</span>' +
      '</div>' +
      '<p class="tv-desc">' + esc(cat.desc) + '</p>' +
      '<div class="tv-bar" style="background:' + esc(cat.color) + '"></div>' +
      '<div class="tv-grid' + (one ? ' tv-grid--one' : '') + '">' +
      cat.products.map(function (p) {
        return '<article class="tv-item">' +
          '<img src="' + esc(assetHref(p.src)) + '" alt="' + esc(p.name) + '" decoding="async">' +
          '<div class="tv-item-copy">' +
          '<div class="tv-item-name">' + esc(p.name) + '</div>' +
          '<div class="tv-item-sub">' + esc(p.subtitle) + '</div>' +
          '</div>' +
          '<div class="tv-item-kg">' + esc(p.weight) + '</div>' +
          '</article>';
      }).join('') +
      '</div></section>';
  }).join('');

  dots.innerHTML = categories.map(function (cat, i) {
    return '<button type="button" class="tv-dot' + (i === index ? ' is-on' : '') + '" data-slide="' + i + '" style="' + (i === index ? 'background:' + cat.color : '') + '" aria-label="' + esc(cat.name) + '"></button>';
  }).join('');

  function show(next) {
    index = (next + categories.length) % categories.length;
    var slides = main.querySelectorAll('.tv-slide');
    var buttons = dots.querySelectorAll('.tv-dot');
    slides.forEach(function (el, i) {
      el.classList.toggle('is-on', i === index);
    });
    buttons.forEach(function (el, i) {
      el.classList.toggle('is-on', i === index);
      el.style.background = i === index ? categories[i].color : '';
    });
  }

  function tick() {
    if (!paused) show(index + 1);
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(tick, INTERVAL);
  }

  function scale() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    board.style.transform = 'scale(' + s + ')';
  }

  dots.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-slide]');
    if (!btn) return;
    show(Number(btn.getAttribute('data-slide')));
    restart();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { show(index + 1); restart(); }
    if (e.key === 'ArrowLeft') { show(index - 1); restart(); }
    if (e.key === ' ') {
      e.preventDefault();
      paused = !paused;
    }
    if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(function () {});
    }
  });

  var idle;
  function wakePointer() {
    document.body.classList.add('is-pointer');
    clearTimeout(idle);
    idle = setTimeout(function () {
      document.body.classList.remove('is-pointer');
    }, 2500);
  }
  document.addEventListener('mousemove', wakePointer);
  document.addEventListener('touchstart', wakePointer, { passive: true });

  if (navigator.wakeLock && navigator.wakeLock.request) {
    function keepAwake() {
      navigator.wakeLock.request('screen').catch(function () {});
    }
    keepAwake();
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) keepAwake();
    });
  }

  categories.forEach(function (cat) {
    cat.products.forEach(function (p) {
      var img = new Image();
      img.src = assetHref(p.src);
    });
  });

  scale();
  window.addEventListener('resize', scale);
  restart();
})();
