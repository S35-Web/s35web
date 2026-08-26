#!/usr/bin/env node
'use strict';

// Genera las fichas técnicas de producto en public/productos/ a partir del
// contenido declarado en content/products/. El texto de las secciones se trata
// como HTML de confianza: lo escribimos nosotros y necesita <sub>, <strong> y
// <br> para las fórmulas y los énfasis de la ficha.

const fs = require('fs');
const path = require('path');
const catalog = require('../content/products');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'productos');
const ORIGIN = 'https://www.s-35.com.mx';
const WHATSAPP = '526671681538';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function attr(name, value) {
  return value ? ' ' + name + '="' + esc(value) + '"' : '';
}

function fullName(p) {
  return p.variant ? p.name + ' ' + p.variant : p.name;
}

/* ── Piezas compartidas ──────────────────────────────────────────── */

function s35Nav() {
  return '<nav class="nav">\n' +
    '  <div class="nav-container">\n' +
    '    <div class="nav-logo"><a href="/"><img src="/Assets/Logotipo Principal.png" alt="S-35 Technology" class="logo-image"></a></div>\n' +
    '    <div class="nav-menu">\n' +
    '      <a href="/catalogo.html" class="nav-link" data-i18n="nav.catalog">Catálogo</a>\n' +
    '      <a href="/laboratorio/materials" class="nav-link" data-i18n="nav.materialab">Laboratorio</a>\n' +
    '      <a href="/#contacto" class="nav-link contact-btn" data-i18n="nav.contact">Contacto</a>\n' +
    '    </div>\n' +
    '    <div class="nav-toggle"><span></span><span></span><span></span></div>\n' +
    '  </div>\n' +
    '  <div class="pixel-tracker" id="pixelTracker"></div>\n' +
    '</nav>';
}

function subnav(current) {
  const items = catalog.taxonomy.FAMILIES.map(function (f) {
    return '<a href="/productos#' + f.id + '">' + esc(f.name) + '</a>';
  }).join('');
  return '<div class="pr-subnav"><div class="pr-subnav-inner">' +
    '<nav class="pr-subnav-links" aria-label="Familias de producto">' + items + '</nav>' +
    '<a class="pr-subnav-back" href="' + esc(current) + '">← Catálogo</a>' +
    '</div></div>';
}

function footer() {
  const famLinks = catalog.taxonomy.FAMILIES.slice(0, 4).map(function (f) {
    return '<li><a href="/productos#' + f.id + '">' + esc(f.name) + '</a></li>';
  }).join('');
  return '<footer class="footer">\n<div class="footer-container">\n' +
    '<div class="footer-main">\n' +
    '<div class="footer-brand"><div class="footer-logo"><img src="/Assets/Logotipo Principal.png" alt="S-35 Technology" class="footer-logo-image"></div>' +
    '<p class="footer-tagline">Tecnología de construcción para el futuro</p></div>\n' +
    '<div class="footer-links">\n' +
    '<div class="footer-column"><h4 class="footer-title">Productos</h4><ul class="footer-list">' +
    '<li><a href="/productos">Índice de fichas</a></li><li><a href="/catalogo.html">Catálogo completo</a></li>' + famLinks +
    '</ul></div>\n' +
    '<div class="footer-column"><h4 class="footer-title">Tecnología</h4><ul class="footer-list">' +
    '<li><a href="/laboratorio/materials">Laboratorio</a></li><li><a href="/laboratorio/materials">Índice de materiales</a></li>' +
    '<li><a href="/laboratorio/methodology">Metodología</a></li></ul></div>\n' +
    '<div class="footer-column"><h4 class="footer-title">Contacto</h4><ul class="footer-list">' +
    '<li><a href="/#contacto">Formulario de contacto</a></li><li><a href="https://wa.me/' + WHATSAPP + '" target="_blank" rel="noopener">WhatsApp</a></li>' +
    '</ul></div>\n</div>\n</div>\n' +
    '<div class="footer-bottom"><div class="footer-bottom-content">' +
    '<div class="footer-copyright"><p>© 2025 S-35® Tech Web Team. Todos los derechos reservados.</p></div>' +
    '<div class="footer-legal"><a href="/terminos.html">Términos</a><span class="divider">|</span>' +
    '<a href="/privacidad.html">Privacidad</a><span class="divider">|</span><a href="/cookies.html">Cookies</a></div>' +
    '</div></div>\n</div>\n</footer>';
}

function layout(opts, body) {
  const canonical = ORIGIN + opts.path;
  const accent = opts.accent || '#2f7d32';
  return '<!DOCTYPE html>\n<html lang="es">\n<head>\n' +
    '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n' +
    '<title>' + esc(opts.title) + '</title>\n' +
    '<meta name="description" content="' + esc(opts.description) + '">\n' +
    '<meta name="robots" content="index, follow">\n' +
    '<link rel="canonical" href="' + esc(canonical) + '">\n' +
    '<meta property="og:type" content="' + (opts.ogType || 'website') + '">\n' +
    '<meta property="og:url" content="' + esc(canonical) + '">\n' +
    '<meta property="og:title" content="' + esc(opts.title) + '">\n' +
    '<meta property="og:description" content="' + esc(opts.description) + '">\n' +
    '<meta property="og:image" content="' + esc(opts.og || ORIGIN + '/Assets/Logotipo_Principal.png') + '">\n' +
    '<meta name="theme-color" content="' + esc(accent) + '">\n' +
    '<link rel="stylesheet" href="/styles.css">\n' +
    '<link rel="stylesheet" href="/productos/productos.css">\n' +
    '<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;1,400&display=swap" rel="stylesheet">\n' +
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">\n' +
    (opts.jsonLd ? '<script type="application/ld+json">' + JSON.stringify(opts.jsonLd) + '</script>\n' : '') +
    '</head>\n<body class="pr-page" style="--pr-accent:' + esc(accent) + '">\n' +
    s35Nav() + '\n' +
    subnav(opts.backHref || '/catalogo.html') + '\n' +
    body + '\n' +
    footer() + '\n' +
    '<script src="/i18n.js"></script>\n<script src="/script.js"></script>\n<script src="/productos/productos.js"></script>\n' +
    '</body>\n</html>\n';
}

/* ── Figuras ─────────────────────────────────────────────────────── */

function figure(fig, opts) {
  opts = opts || {};
  if (!fig || !fig.src) {
    return '<div class="pr-fig-missing">' + esc(opts.missing || 'Fotografía pendiente') + '</div>';
  }
  return '<img src="' + esc(fig.src) + '" alt="' + esc(fig.alt || '') + '"' +
    (opts.priority ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">';
}

/* ── Renderizado de secciones ────────────────────────────────────── */

function rail(num, title, accentNum) {
  return '<div class="pr-rail' + (accentNum ? ' pr-rail--accent' : '') + '">' +
    '<span class="pr-num">' + esc(num) + '</span>' +
    '<h2>' + esc(title) + '</h2></div>';
}

function row(railHtml, bodyHtml) {
  return '<section class="pr-row">' + railHtml + '<div class="pr-body">' + bodyHtml + '</div></section>';
}

function plate(p) {
  if (!p) return '';
  if (p.html) return p.html;

  let inner = '';
  if (p.layers) {
    inner += '<div class="pr-stack">';
    p.layers.forEach(function (l) {
      if (l.kind === 'drops') {
        inner += '<div class="pr-stack-note"><span class="pr-drop"></span><span class="pr-drop"></span>' +
          '<span class="pr-spacer"></span><span>' + esc(l.note || '') + '</span></div>';
      } else if (l.kind === 'ticks') {
        inner += '<div class="pr-stack-note"><span>' + esc(l.note || '') + '</span><span class="pr-spacer"></span>' +
          '<span class="pr-tick"></span><span class="pr-tick"></span><span class="pr-tick"></span></div>';
      } else {
        inner += '<div class="pr-grain pr-grain--' + (l.pattern === 'diagonal' ? 'd' : 'v') + '"></div>';
      }
    });
    inner += '</div>';
  }
  if (p.legend) {
    inner += '<div class="pr-plate-legend">' +
      p.legend.map(function (l) { return '<div>' + l + '</div>'; }).join('') +
      (p.foot ? '<div class="pr-plate-foot">' + p.foot + '</div>' : '') +
      '</div>';
  }
  return '<div class="pr-plate">' +
    '<div class="pr-plate-head"><span class="pr-plate-title">' + esc(p.title || '') + '</span>' +
    '<span class="pr-plate-sub">' + esc(p.sub || '') + '</span></div>' +
    '<div class="pr-plate-body">' + inner + '</div></div>';
}

function bars(b) {
  if (!b) return '';
  return '<div class="pr-bars">' +
    '<div class="pr-label" style="margin-bottom:11px">' + esc(b.caption || '') + '</div>' +
    '<div class="pr-bars-list">' +
    b.bars.map(function (bar) {
      const tone = bar.tone === 'accent' ? ' pr-barfill--accent' : bar.tone === 'soft' ? ' pr-barfill--soft' : '';
      return '<div class="pr-bar"><span class="pr-bar-lab">' + esc(bar.label) + '</span>' +
        '<span class="pr-barfill' + tone + '" style="width:' + Number(bar.pct) + '%"></span></div>';
    }).join('') +
    '</div>' +
    (b.note ? '<p>' + b.note + '</p>' : '') +
    '</div>';
}

function chart(c) {
  if (!c) return '';
  const series = c.series.map(function (s) {
    const stroke = s.tone === 'accent' ? 'var(--pr-accent)' : '#c4c4c4';
    const cls = s.tone === 'accent' ? 'pr-curve' : 'pr-band';
    return '<polyline class="' + cls + '" points="' + esc(s.points) + '" fill="none" stroke="' + stroke +
      '" stroke-width="2"' + (s.dashed ? ' stroke-dasharray="4 3"' : '') + '></polyline>';
  }).join('');
  const xLabels = (c.xLabels || []).map(function (l, i) {
    const x = 44 + i * 66;
    return '<text x="' + x + '" y="88" font-family="Helvetica, Arial, sans-serif" font-size="7" fill="#767676">' + esc(l) + '</text>';
  }).join('');
  const legend = c.series.map(function (s) {
    const bg = s.tone === 'accent' ? 'var(--pr-accent)' : '#c4c4c4';
    return '<div style="display:flex;gap:6px;align-items:center">' +
      '<span style="width:14px;height:2px;background:' + bg + ';flex:none"></span>' + s.label + '</div>';
  }).join('');
  return '<div class="pr-bars" style="margin-top:16px">' +
    '<div class="pr-label" style="margin-bottom:10px">' + esc(c.caption || '') + '</div>' +
    '<div style="display:flex;gap:18px;align-items:stretch;flex-wrap:wrap">' +
    '<svg viewBox="0 0 260 92" style="width:56%;min-width:240px;height:auto;flex:none" role="img" aria-label="' + esc(c.caption || '') + '">' +
    '<line x1="42" y1="6" x2="42" y2="78" stroke="#000" stroke-width="1.2"></line>' +
    '<line x1="42" y1="78" x2="254" y2="78" stroke="#000" stroke-width="1.2"></line>' +
    series +
    '<text x="4" y="12" font-family="Helvetica, Arial, sans-serif" font-size="7" fill="#767676">' + esc((c.yLabels || [])[0] || '') + '</text>' +
    '<text x="4" y="76" font-family="Helvetica, Arial, sans-serif" font-size="7" fill="#767676">' + esc((c.yLabels || [])[1] || '') + '</text>' +
    xLabels +
    '</svg>' +
    '<div style="flex:1;min-width:200px;display:grid;gap:6px;align-content:center;font-size:12px;line-height:1.5;color:var(--pr-ink)">' +
    legend + (c.foot ? '<div>' + c.foot + '</div>' : '') +
    '</div></div></div>';
}

function miniTable(t) {
  const head = '<thead><tr>' + t.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead>';
  const rows = t.rows.map(function (r) {
    return '<tr>' + r.map(function (cell, i) {
      return '<td' + (i > 0 ? ' class="pr-cell-soft"' : '') + '>' + cell + '</td>';
    }).join('') + '</tr>';
  }).join('');
  return (t.label ? '<div class="pr-label" style="margin-bottom:8px">' + esc(t.label) + '</div>' : '') +
    '<div class="pr-table-wrap"><table class="pr-table--mini">' + head + '<tbody>' + rows + '</tbody></table></div>' +
    (t.note ? '<p class="pr-table-note">' + t.note + '</p>' : '');
}

function propertiesTable(rows) {
  return '<div class="pr-table-wrap"><table class="pr-table--props"><thead><tr>' +
    '<th class="pr-col-param">Parámetro</th>' +
    '<th class="pr-col-value">Valor típico</th>' +
    '<th class="pr-col-practical">En términos prácticos</th>' +
    '<th class="pr-col-method">Método</th>' +
    '</tr></thead><tbody>' +
    rows.map(function (r) {
      return '<tr><td>' + r.param + '</td><td>' + r.value + '</td>' +
        '<td class="pr-cell-soft">' + r.practical + '</td>' +
        '<td class="pr-cell-method">' + esc(r.method || '—') + '</td></tr>';
    }).join('') +
    '</tbody></table></div>';
}

function twoColumns(entries, renderer) {
  const half = Math.ceil(entries.length / 2);
  return '<div class="pr-halves"><div>' +
    entries.slice(0, half).map(renderer).join('') +
    '</div><div>' +
    entries.slice(half).map(renderer).join('') +
    '</div></div>';
}

function renderStep(s) {
  return '<p><strong>' + s.title + '</strong> ' + s.text + '</p>';
}

function section(s) {
  const railHtml = rail(s.n, s.title, s.accentNum);

  if (s.kind === 'prose') {
    const proseHtml = '<div class="pr-prose">' + s.prose.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div>';
    const aside = s.plate ? plate(s.plate) : s.bars ? bars(s.bars) : '';
    const body = '<div class="pr-rule"></div>' +
      (aside ? '<div class="pr-split">' + proseHtml + aside + '</div>' : proseHtml);
    return row(railHtml, body);
  }

  if (s.kind === 'tables') {
    return row(railHtml, '<div class="pr-rule"></div>' +
      '<div class="pr-halves">' + s.tables.map(function (t) { return '<div>' + miniTable(t) + '</div>'; }).join('') + '</div>');
  }

  if (s.kind === 'properties') {
    return row(railHtml, '<div class="pr-rule"></div>' + propertiesTable(s.rows));
  }

  if (s.kind === 'cards') {
    return row(railHtml, '<div class="pr-rule"></div>' +
      '<div class="pr-cards">' + s.cards.map(function (c) {
        return '<article class="pr-card"><h3>' + esc(c.title) + '</h3><p>' + c.text + '</p></article>';
      }).join('') + '</div>' +
      (s.chart ? chart(s.chart) : ''));
  }

  if (s.kind === 'items') {
    return row(railHtml, '<div class="pr-rule"></div>' +
      '<div class="pr-items">' + s.items.map(function (it, i) {
        return '<div class="pr-item"><span class="pr-item-key">' + String.fromCharCode(65 + i) + '</span>' +
          '<p><strong>' + it.title + '</strong> ' + it.text + '</p></div>';
      }).join('') + '</div>');
  }

  if (s.kind === 'steps') {
    return row(railHtml, '<div class="pr-rule"></div>' +
      '<div class="pr-steps">' + twoColumns(s.steps, renderStep) + '</div>');
  }

  if (s.kind === 'callout') {
    return row(rail(s.n, s.title, true),
      '<div class="pr-callout">' + (s.intro ? '<p>' + s.intro + '</p>' : '') +
      twoColumns(s.points, renderStep) + '</div>');
  }

  if (s.kind === 'notes') {
    return row(railHtml, '<div class="pr-notes">' + s.notes.map(function (n) { return '<p>' + n + '</p>'; }).join('') + '</div>');
  }

  if (s.kind === 'pairs') {
    return row(railHtml, '<div class="pr-rule"></div>' +
      '<div class="pr-halves">' + s.pairs.map(function (p) {
        return '<div class="pr-pair"><h3>' + esc(p.label) + '</h3><p>' + p.text + '</p></div>';
      }).join('') + '</div>');
  }

  throw new Error('Sección de tipo desconocido: ' + s.kind + ' (' + s.title + ')');
}

/* ── Página de producto ──────────────────────────────────────────── */

function productPage(p) {
  const title = fullName(p);
  const waMsg = encodeURIComponent('Hola, me interesa ' + title + '. Quiero ficha y cotización.');

  let body = '';

  if (p.status !== 'verified') {
    body += '<div class="pr-banner">Borrador técnico · contenido redactado internamente, pendiente de validación. ' +
      'Los valores son de referencia y no constituyen especificación.</div>';
  }

  body += '<article class="pr-sheet pr-sheet--motion">';

  // Mástil
  body += '<div class="pr-mast">' +
    '<span class="pr-mast-brand"><img src="/Assets/Logotipo Principal.png" alt="S-35" class="pr-logo">' +
    'S35®Tech · Tecnología en materiales para construcción</span>' +
    '<span>Ficha de producto · ' + esc(p.code) + '</span></div>' +
    '<div class="pr-hair"></div>';

  // Hero
  const powder = p.figures && p.figures.powder;
  const pack = p.figures && p.figures.pack;

  let heroMain = '<div class="pr-hero-main">' +
    '<h1>' + esc(p.name) + '</h1>' +
    (p.variant ? '<div class="pr-variant">' + esc(p.variant) + '</div>' : '') +
    '<div class="pr-strip">' + p.strip.join('<br>') + '</div>' +
    '<p class="pr-lead">' + p.lead + '</p>';

  // La Fig. A es opcional: si el producto no tiene foto de polvo se omite el
  // bloque completo, en lugar de dejar un hueco en el encabezado.
  if (powder && powder.src) {
    heroMain += '<div class="pr-fig-powder">' +
      '<figure>' + figure(powder, { missing: '' }) + '</figure>' +
      '<figcaption>' + powder.caption.map(esc).join('<br>') + '</figcaption>' +
      '</div>';
  }
  heroMain += '</div>';

  const heroPack = '<div class="pr-hero-pack">' +
    figure(pack, { priority: true, missing: 'Fotografía de presentación pendiente' }) +
    '<div class="pr-pack-end"><span>' + esc((pack && pack.label) || 'Presentación') + '</span>' +
    '<strong>' + esc(p.packaging) + '</strong></div></div>';

  body += '<section class="pr-row">' +
    '<div class="pr-rail"><span class="pr-rail-lead">Ficha técnica<br>de producto</span>' +
    '<div class="pr-rail-line">' + esc(p.line) + '</div>' +
    '<div class="pr-rail-line">Rev. ' + esc(p.rev) + ' · ' + esc(p.year) + '</div></div>' +
    '<div class="pr-body"><div class="pr-hero">' + heroMain + heroPack + '</div></div></section>';

  // Identificación
  body += '<section class="pr-row"><div class="pr-rail">Identificación</div>' +
    '<div class="pr-body"><dl class="pr-id">' +
    p.identification.map(function (f) {
      return '<div><dt>' + esc(f.label) + '</dt><dd>' + f.value + '</dd></div>';
    }).join('') +
    '</dl></div></section>';

  // Datos de cabecera
  body += '<section class="pr-row"><div class="pr-rail">Datos de cabecera</div>' +
    '<div class="pr-body"><div class="pr-kpis">' +
    p.kpis.map(function (k) {
      return '<div class="pr-kpi"><div class="pr-kpi-val">' + k.value + '</div>' +
        '<div class="pr-kpi-lab">' + esc(k.label) + '</div></div>';
    }).join('') +
    '</div></div></section>';

  // Secciones
  body += p.sections.map(section).join('');

  // Aviso + acciones
  body += '<section class="pr-row pr-notice"><div class="pr-rail">Aviso</div>' +
    '<div class="pr-body">' +
    '<div class="pr-actions">' +
    '<a class="pr-cta" href="https://wa.me/' + WHATSAPP + '?text=' + waMsg + '" target="_blank" rel="noopener">' +
    'Solicitar ficha y cotización</a>' +
    '<button type="button" onclick="window.print()">Descargar / imprimir</button>' +
    '</div>' +
    '<p class="pr-notice-text">' + p.notice + '</p>' +
    '</div></section>';

  body += '<div class="pr-end"><span>Ficha técnica · ' + esc(title) + ' · ' + esc(p.packaging) + '</span>' +
    '<span>www.s-35.com</span></div>';

  body += '</article>';

  const family = catalog.taxonomy.FAMILY_BY_ID[p.family];
  return layout({
    title: title + ' | ' + p.line + ' | S-35 Technology',
    description: p.seo.description,
    path: '/productos/' + p.slug,
    accent: p.accent,
    ogType: 'product',
    og: pack ? ORIGIN + pack.src : undefined,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      description: p.seo.description,
      category: family ? family.name : undefined,
      brand: { '@type': 'Brand', name: 'S-35' },
      manufacturer: { '@type': 'Organization', name: 'S-35 Technology' },
      image: pack ? ORIGIN + pack.src : undefined,
      url: ORIGIN + '/productos/' + p.slug,
    },
  }, body);
}

/* ── Índice ──────────────────────────────────────────────────────── */

function indexPage() {
  const groups = catalog.byFamily();
  const s = catalog.stats();

  let body = '<article class="pr-sheet pr-sheet--motion">' +
    '<div class="pr-mast">' +
    '<span class="pr-mast-brand"><img src="/Assets/Logotipo Principal.png" alt="S-35" class="pr-logo">' +
    'S35®Tech · Tecnología en materiales para construcción</span>' +
    '<span>Índice de fichas de producto</span></div>' +
    '<div class="pr-hair"></div>';

  body += '<section class="pr-row">' +
    '<div class="pr-rail"><span class="pr-rail-lead">Fichas técnicas<br>de producto</span>' +
    '<div class="pr-rail-line">' + s.published + ' productos</div>' +
    '<div class="pr-rail-line">' + s.families + ' familias</div></div>' +
    '<div class="pr-body"><h1>Productos</h1>' +
    '<p class="pr-index-lead">Cada producto tiene su ficha técnica: identificación, datos de cabecera, ' +
    'propiedades con su método de ensayo, usos, modo de empleo y condiciones de almacenamiento. ' +
    'Las fichas marcadas como borrador están redactadas internamente y siguen en revisión.</p></div></section>';

  groups.forEach(function (g) {
    body += '<section class="pr-row" id="' + esc(g.family.id) + '">' +
      '<div class="pr-rail">' + esc(g.family.name) + '</div>' +
      '<div class="pr-body pr-family">' +
      '<div class="pr-family-head"><h2>' + esc(g.family.name) + '</h2>' +
      '<span class="pr-family-count">' + g.items.length + ' ' + (g.items.length === 1 ? 'producto' : 'productos') + '</span></div>' +
      (g.family.note ? '<p class="pr-family-note">' + esc(g.family.note) + '</p>' : '') +
      '<ul class="pr-list">' +
      g.items.map(function (p) {
        return '<li><a href="/productos/' + esc(p.slug) + '">' +
          listThumb(p) +
          '<span class="pr-list-copy">' +
          '<span class="pr-list-name">' + esc(fullName(p)) + '</span>' +
          '<span class="pr-list-line">' + esc(p.line) + '</span></span>' +
          '<span class="pr-list-meta">' + esc(p.packaging) +
          (p.status === 'verified' ? '' : ' · borrador') + '</span></a></li>';
      }).join('') +
      '</ul></div></section>';
  });

  body += '<div class="pr-end"><span>Índice de fichas · ' + s.published + ' productos</span>' +
    '<span>www.s-35.com</span></div></article>';

  return layout({
    title: 'Fichas técnicas de producto | S-35 Technology',
    description: 'Índice de fichas técnicas de los productos S-35: estucos premium Waxtard, microconcretos, Panel System, Pro+ Systems, adhesivos Pegaxpress y líquidos.',
    path: '/productos',
    accent: '#2f7d32',
    backLabel: '← Inicio',
    backHref: '/',
  }, body);
}

/* ── Escritura ───────────────────────────────────────────────────── */

function write(rel, html) {
  const full = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
  console.log('  public/productos/' + rel);
}

function validate() {
  const seen = {};
  catalog.products.forEach(function (p) {
    ['slug', 'code', 'name', 'family', 'status', 'line', 'packaging', 'rev', 'year', 'accent', 'lead', 'notice'].forEach(function (k) {
      if (!p[k]) throw new Error('Producto ' + (p.slug || '?') + ': falta el campo "' + k + '"');
    });
    if (seen[p.slug]) throw new Error('Slug duplicado: ' + p.slug);
    seen[p.slug] = true;
    if (!catalog.taxonomy.FAMILY_BY_ID[p.family]) {
      throw new Error('Producto ' + p.slug + ': familia desconocida "' + p.family + '"');
    }
    if (!catalog.taxonomy.STATUS[p.status]) {
      throw new Error('Producto ' + p.slug + ': estado desconocido "' + p.status + '"');
    }
    if (!p.identification || p.identification.length !== 3) {
      throw new Error('Producto ' + p.slug + ': identificación debe tener 3 campos');
    }
    if (!p.kpis || p.kpis.length !== 4) {
      throw new Error('Producto ' + p.slug + ': datos de cabecera deben ser 4');
    }
    if (!p.sections || !p.sections.length) {
      throw new Error('Producto ' + p.slug + ': sin secciones');
    }
    // Una imagen declarada que no existe en disco sale como imagen rota en
    // producción, así que preferimos fallar el build.
    ['pack', 'powder'].forEach(function (key) {
      const fig = p.figures && p.figures[key];
      if (fig && fig.src) {
        const onDisk = path.join(ROOT, 'public', fig.src.replace(/^\//, ''));
        if (!fs.existsSync(onDisk)) {
          throw new Error('Producto ' + p.slug + ': la imagen ' + fig.src + ' no existe');
        }
      }
    });
  });
}

function catalogImgSrc(src) {
  if (!src) return '';
  const base = path.basename(src).replace(/\.[^.]+$/, '');
  const thumb = '/Assets/productos_thumbs/' + base + '.jpg';
  if (fs.existsSync(path.join(ROOT, 'public', thumb.replace(/^\//, '')))) return thumb;
  return src;
}

function catalogInitials(p) {
  const raw = (p.name || '') + ' ' + (p.variant || '');
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'S35';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function listThumb(p) {
  const pack = p.figures && p.figures.pack;
  const src = pack && pack.src ? catalogImgSrc(pack.src) : '';
  if (src) {
    return '<span class="pr-list-thumb"><img src="' + esc(src) + '" alt="' +
      esc(pack.alt || fullName(p)) + '" width="56" height="70" loading="lazy" decoding="async"></span>';
  }
  return '<span class="pr-list-thumb pr-list-thumb--ph" style="--thumb-accent:' +
    esc(p.accent) + '" aria-hidden="true">' + esc(catalogInitials(p)) + '</span>';
}

function catalogCard(p) {
  const family = catalog.taxonomy.FAMILY_BY_ID[p.family];
  const href = '/productos/' + p.slug;
  const pack = p.figures && p.figures.pack;
  const src = pack && pack.src ? catalogImgSrc(pack.src) : '';
  const thumb = src
    ? '<img src="' + esc(src) + '" alt="' + esc(pack.alt || fullName(p)) + '" loading="lazy" decoding="async">'
    : '<span>' + esc(catalogInitials(p)) + '</span>';
  const thumbClass = src ? 'product-thumb' : 'product-thumb product-thumb--empty';
  const packLabel = /cubeta/i.test(p.packaging || '') ? p.packaging : (p.packaging ? 'Saco ' + p.packaging : '');
  return '<article class="product-card" data-category="' + esc(p.family) + '" style="--card-accent:' + esc(p.accent || '#2f7d32') + '">' +
    '<a class="product-card-link" href="' + esc(href) + '">' +
    '<div class="' + thumbClass + '">' + thumb + '</div>' +
    '<div class="product-copy">' +
    '<p class="product-kicker">' + esc(family ? family.name : '') + '</p>' +
    '<h3>' + esc(p.name) + '</h3>' +
    (p.variant ? '<p class="product-variant">' + esc(p.variant) + '</p>' : '') +
    (p.line ? '<p class="product-line">' + esc(p.line) + '</p>' : '') +
    '<p class="product-meta"><span>' + esc(packLabel) + '</span><span class="product-go">Ver ficha</span></p>' +
    '</div></a></article>';
}

function catalogGridHtml() {
  const stats = catalog.stats();
  const filters = ['<button type="button" class="filter-btn active" data-filter="all" aria-pressed="true">Todos</button>'].concat(
    catalog.taxonomy.FAMILIES.map(function (f) {
      return '<button type="button" class="filter-btn" data-filter="' + f.id + '" aria-pressed="false">' + esc(f.name) + '</button>';
    })
  ).join('\n                    ');
  const families = catalog.byFamily().map(function (g) {
    const n = g.items.length;
    const cards = g.items.map(catalogCard).join('\n                ');
    return '<section class="catalog-family" id="' + esc(g.family.id) + '" data-family="' + esc(g.family.id) + '">' +
      '<header class="catalog-family-head">' +
      '<h2>' + esc(g.family.name) + '</h2>' +
      '<span>' + n + ' ' + (n === 1 ? 'producto' : 'productos') + '</span>' +
      (g.family.note ? '<p>' + esc(g.family.note) + '</p>' : '') +
      '</header>' +
      '<div class="product-grid">' + cards + '</div></section>';
  }).join('\n            ');
  return '<div class="catalog-toolbar" role="navigation" aria-label="Filtrar por familia">' +
    '\n            <div class="filter-group">\n                    ' + filters + '\n            </div>\n            </div>\n' +
    '            <div class="catalog-body" data-published="' + stats.published + '">\n            ' + families + '\n            </div>';
}

function patchCatalogPage() {
  const file = path.join(ROOT, 'public', 'catalogo.html');
  if (!fs.existsSync(file)) return;
  const html = fs.readFileSync(file, 'utf8');
  const start = '<!-- PR-CATALOG-GRID:START -->';
  const end = '<!-- PR-CATALOG-GRID:END -->';
  const i = html.indexOf(start);
  const j = html.indexOf(end);
  if (i === -1 || j === -1 || j < i) {
    throw new Error('catalogo.html: faltan los marcadores PR-CATALOG-GRID');
  }
  const next = html.slice(0, i + start.length) + '\n            ' + catalogGridHtml() + '\n            ' + html.slice(j);
  fs.writeFileSync(file, next);
  console.log('  public/catalogo.html (tarjetas → /productos/<slug>)');
}

const OLD_PRODUCT_PAGES = [
  ['producto-waxtard-perla.html', '/productos/waxtard-blanco-perla'],
  ['producto-waxtard-extra-anclaje.html', '/productos/waxtard-extra-anclaje'],
  ['producto-cemento-plastico-concreto.html', '/productos/cemento-plastico-concreto'],
];

function writeRedirect(file, dest) {
  const html = '<!DOCTYPE html>\n<html lang="es">\n<head>\n' +
    '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>Redirigiendo a la ficha técnica</title>\n' +
    '<link rel="canonical" href="' + ORIGIN + dest + '">\n' +
    '<meta http-equiv="refresh" content="0;url=' + dest + '">\n' +
    '<script>location.replace(' + JSON.stringify(dest) + ');</script>\n' +
    '</head>\n<body>\n<p><a href="' + dest + '">Continuar a la ficha técnica</a></p>\n' +
    '</body>\n</html>\n';
  fs.writeFileSync(path.join(ROOT, 'public', file), html);
  console.log('  public/' + file + ' → ' + dest);
}

validate();

console.log('Fichas de producto:');
write('index.html', indexPage());
catalog.published().forEach(function (p) {
  write(p.slug + '.html', productPage(p));
});
catalog.legacy().forEach(function (p) {
  write('descontinuados/' + p.slug + '.html', productPage(p));
  const stale = path.join(OUT, p.slug + '.html');
  if (fs.existsSync(stale)) {
    fs.unlinkSync(stale);
    console.log('  (quitado) public/productos/' + p.slug + '.html');
  }
});
patchCatalogPage();
OLD_PRODUCT_PAGES.forEach(function (pair) { writeRedirect(pair[0], pair[1]); });

/* ── Sitemap ─────────────────────────────────────────────────────── */

const sitemapPath = path.join(ROOT, 'public', 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  let sm = fs.readFileSync(sitemapPath, 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  const urls = [[ORIGIN + '/productos', '0.9']].concat(
    catalog.published().map(function (p) { return [ORIGIN + '/productos/' + p.slug, '0.8']; })
  );
  OLD_PRODUCT_PAGES.forEach(function (pair) {
    const oldLoc = ORIGIN + '/' + pair[0];
    sm = sm.replace(new RegExp('\\s*<url>\\s*<loc>' + oldLoc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '<\\/loc>[\\s\\S]*?<\\/url>', 'g'), '');
  });
  catalog.legacy().forEach(function (p) {
    const loc = ORIGIN + '/productos/' + p.slug;
    sm = sm.replace(new RegExp('\\s*<url>\\s*<loc>' + loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '<\\/loc>[\\s\\S]*?<\\/url>', 'g'), '');
  });
  const original = fs.readFileSync(sitemapPath, 'utf8');
  let extra = '';
  urls.forEach(function (u) {
    if (sm.indexOf('<loc>' + u[0] + '</loc>') === -1) {
      extra += '    <url>\n        <loc>' + u[0] + '</loc>\n        <lastmod>' + today +
        '</lastmod>\n        <changefreq>monthly</changefreq>\n        <priority>' + u[1] + '</priority>\n    </url>\n';
    }
  });
  const next = sm.replace('</urlset>', extra + '</urlset>');
  if (next !== original) {
    fs.writeFileSync(sitemapPath, next);
    console.log('  sitemap.xml actualizado');
  }
}

const s = catalog.stats();
console.log('Listo: ' + s.published + ' publicados (' + s.verified + ' verificados, ' + s.drafts +
  ' borradores) en ' + s.families + ' familias, ' + s.legacy + ' descontinuados.');
