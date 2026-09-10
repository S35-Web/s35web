'use strict';

function assetHref(src) {
  if (!src) return '';
  return String(src).split('/').map(encodeURIComponent).join('/');
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function media(slot, opts) {
  opts = opts || {};
  const legend = slot && slot.placeholder ? slot.placeholder : (opts.legend || '');
  if (slot && slot.src) {
    const tag = opts.priority
      ? ' fetchpriority="high"'
      : ' loading="lazy"';
    return '<figure class="ov-media">' +
      '<img src="' + esc(assetHref(slot.src)) + '" alt="' + esc(slot.alt || '') + '"' + tag + ' decoding="async">' +
      '</figure>';
  }
  return '<figure class="ov-ph" aria-label="Imagen pendiente">' +
    '<span class="ov-ph-kicker">Placeholder</span>' +
    '<p>' + esc(legend || 'Imagen de producto pendiente.') + '</p>' +
    '</figure>';
}

function comparePanel(slot, on) {
  const capClass = 'ov-compare-cap' + (on ? ' ov-compare-cap--on' : '');
  return '<figure class="ov-compare-panel">' +
    '<img src="' + esc(assetHref(slot.src)) + '" alt="' + esc(slot.alt || '') + '" loading="lazy" decoding="async">' +
    '<figcaption class="' + capClass + '"><span>' + esc(slot.label) + '</span>' + esc(slot.note) + '</figcaption>' +
    '</figure>';
}

function video(src, poster, fallback) {
  if (src) {
    return '<div class="ov-video">' +
      '<video autoplay muted loop playsinline preload="metadata"' +
      (poster ? ' poster="' + esc(assetHref(poster)) + '"' : '') + '>' +
      '<source src="' + esc(assetHref(src)) + '" type="video/mp4">' +
      '</video></div>';
  }
  return media(fallback || { placeholder: 'VIDEO LOOP pendiente.' });
}

function productDock(p, brand) {
  return '<div class="ov-dock">' +
    '<div class="ov-dock-inner">' +
    '<div class="ov-dock-name">' + esc(brand.name) + '<span>' + esc(brand.slash) + '</span></div>' +
    '<div class="ov-dock-tabs" role="tablist" aria-label="Vista del producto">' +
    '<button type="button" class="ov-tab" role="tab" id="ov-tab-overview" data-ov-tab="overview" aria-controls="ov-panel-overview" aria-selected="true">Overview</button>' +
    '<button type="button" class="ov-tab" role="tab" id="ov-tab-ficha" data-ov-tab="ficha" aria-controls="ov-panel-ficha" aria-selected="false">Technical data</button>' +
    '</div>' +
    '<a class="ov-dock-back" href="/productos">← Catálogo</a>' +
    '</div></div>';
}

function overviewHtml(p) {
  const ov = p.overview;
  const brand = { name: ov.headline[0], slash: ov.headline[1] };

  let html = productDock(p, brand);
  html += '<div id="ov-panel-overview" class="ov-view" role="tabpanel" aria-labelledby="ov-tab-overview">';

  html += '<section class="ov-hero">' +
    '<div class="ov-hero-copy">' +
    '<p class="ov-kicker ov-kicker--light">' + esc(ov.kicker) + '</p>' +
    '<h1>' + esc(ov.headline[0]) + '<br><span>' + esc(ov.headline[1]) + '</span></h1>' +
    '<p class="ov-deck">' + esc(ov.deck) + '</p>' +
    '<p class="ov-meta">' + esc(ov.meta) + '</p>' +
    '</div>' +
    media(ov.hero, { priority: true }) +
    '</section>';

  html += '<div class="ov-stats-wrap"><section class="ov-stats" aria-label="Datos clave">' +
    ov.stats.map(function (s) {
      return '<div class="ov-stat"><div class="ov-stat-val">' + esc(s.value) + '</div>' +
        '<div class="ov-stat-lab">' + esc(s.label) + '</div></div>';
    }).join('') +
    '</section></div>';

  html += '<section class="ov-problem">' +
    '<div class="ov-copy">' +
    '<p class="ov-kicker">' + esc(ov.problem.kicker) + '</p>' +
    '<h2>' + esc(ov.problem.title) + '</h2>' +
    '<p>' + esc(ov.problem.text) + '</p>' +
    '</div>' +
    '<div class="ov-compare">' +
    comparePanel(ov.problem.compare.left) +
    comparePanel(ov.problem.compare.right, true) +
    '</div></section>';

  html += '<section class="ov-flex">' +
    '<div class="ov-copy ov-copy--left">' +
    '<p class="ov-kicker">' + esc(ov.flex.kicker) + '</p>' +
    '<h2>' + esc(ov.flex.title) + '</h2>' +
    '<p>' + esc(ov.flex.text) + '</p>' +
    '</div>' +
    video(ov.flex.video, ov.flex.poster, ov.flex.fallback) +
    '</section>';

  html += '<section class="ov-lab">' +
    video(ov.lab.video, ov.lab.poster) +
    '<div class="ov-lab-veil"></div>' +
    '<div class="ov-copy ov-copy--on-dark">' +
    '<p class="ov-kicker ov-kicker--light">' + esc(ov.lab.kicker) + '</p>' +
    '<h2>' + ov.lab.title.replace('No en obra.', '<br>No en obra.') + '</h2>' +
    '<p>' + esc(ov.lab.text) + '</p>' +
    '</div></section>';

  html += '<section class="ov-apply">' +
    '<div class="ov-apply-grid">' +
    '<div>' +
    '<p class="ov-kicker">' + esc(ov.apply.kicker) + '</p>' +
    '<h2>' + esc(ov.apply.title) + '</h2>' +
    '<ol class="ov-steps">' +
    ov.apply.steps.map(function (s) {
      return '<li><span>' + esc(s.n) + '</span><div><strong>' + esc(s.title) + '</strong><p>' + esc(s.text) + '</p></div></li>';
    }).join('') +
    '</ol></div>' +
    media(ov.apply.image) +
    '</div></section>';

  html += '<section class="ov-yield" data-ov-yield>' +
    '<div class="ov-copy ov-copy--left">' +
    '<p class="ov-kicker">' + esc(ov.yield.kicker) + '</p>' +
    '<h2>' + esc(ov.yield.title) + '</h2>' +
    '<div class="ov-pills" role="group" aria-label="Espesor de junta">' +
    ov.yield.joints.map(function (j) {
      const on = j === ov.yield.defaultJoint;
      return '<button type="button" class="ov-pill" data-joint="' + esc(j) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + esc(j) + '</button>';
    }).join('') +
    '</div></div>' +
    '<div class="ov-yield-grid" data-ov-yield-grid></div>' +
    '<p class="ov-yield-note">' + esc(ov.yield.note) + '</p>' +
    '<script type="application/json" id="ov-yield-data">' + JSON.stringify(ov.yield.rows) + '</script>' +
    '</section>';

  html += '<section class="ov-close">' +
    media(ov.close.image) +
    '<div class="ov-copy ov-copy--on-dark ov-copy--center">' +
    '<h2>' + esc(ov.close.title) + '</h2>' +
    '<p>' + esc(ov.close.text) + '</p>' +
    '<button type="button" class="ov-cta" data-ov-tab="ficha">' + esc(ov.close.cta) + '</button>' +
    '</div></section>';

  html += '</div>';
  return html;
}

module.exports = { overviewHtml, productDock: productDock };
