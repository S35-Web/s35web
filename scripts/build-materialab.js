#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const archive = require('../content/research');
const { CATEGORIES, STATUS, PROVENANCE_LABEL } = archive.taxonomy;
const config = archive.config;
const stats = archive.stats();

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'materialab');
const MEDIA = '/Assets/MateriaLAB/media';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pad2(n) {
  return n < 10 ? '0' + n : String(n);
}

function loc(es, en, tag) {
  tag = tag || 'span';
  return '<' + tag + ' data-ml-lang="es">' + es + '</' + tag + '>' +
    '<' + tag + ' data-ml-lang="en" hidden>' + en + '</' + tag + '>';
}

function locText(v, tag) {
  if (v == null || v === '') return '';
  if (typeof v === 'string') return esc(v);
  return loc(esc(v.es || v.en || ''), esc(v.en || v.es || ''), tag || 'span');
}

function i18n(key, esDefault) {
  return '<span data-i18n="' + key + '">' + esDefault + '</span>';
}

function i18nHtml(key, esDefault) {
  return '<span data-i18n="' + key + '" data-i18n-html>' + esDefault + '</span>';
}

function locParas(obj) {
  return locParasSlice(obj, 0);
}

function locParasSlice(obj, from, to) {
  if (!obj) return '';
  var es = String(obj.es || '').split(/\n\n/).filter(Boolean).slice(from, to);
  var en = String(obj.en || obj.es || '').split(/\n\n/).filter(Boolean).slice(from, to);
  return es.map(function (p) { return '<p data-ml-lang="es">' + esc(p) + '</p>'; }).join('') +
    en.map(function (p) { return '<p data-ml-lang="en" hidden>' + esc(p) + '</p>'; }).join('');
}

function summaryHasRest(obj) {
  return String((obj && obj.es) || '').split(/\n\n/).filter(Boolean).length > 2;
}

function ftSec(num, key, es, inner, extraClass) {
  return '<section class="ml-ft-sec' + (extraClass ? ' ' + extraClass : '') + '">' +
    '<div class="ml-ft-rail"><span class="ml-ft-n">' + num + '</span><h2 data-i18n="' + key + '">' + es + '</h2></div>' +
    '<div class="ml-ft-body">' + inner + '</div></section>';
}

function headlineStats(m) {
  var p = m.physical || {};
  var candidates = [
    { es: 'Índice de blancura', en: 'Whiteness index', point: p.whiteness },
    { es: 'Resistencia a 28 d', en: '28-day strength', point: p.strengthClass },
    { es: 'Relación a/c', en: 'Water/cement ratio', point: p.waterCementRatio },
    { es: 'Dureza Mohs', en: 'Mohs hardness', point: p.hardnessMohs },
    { es: 'Tamaño máximo', en: 'Maximum size', point: p.maxSize },
    { es: 'Módulo de finura', en: 'Fineness modulus', point: p.finenessModulus },
    { es: 'Densidad aparente', en: 'Bulk density', point: p.bulkDensity },
    { es: 'Densidad relativa', en: 'Specific gravity', point: p.specificGravity },
    { es: 'Absorción de agua', en: 'Water absorption', point: p.waterAbsorption },
    { es: 'pH', en: 'pH', point: p.phSaturated || p.phFresh },
  ];
  (m.chemical || []).forEach(function (c) {
    if (c.formula === 'Fe₂O₃' || c.formula === 'CaO' || c.formula === 'CaCO₃' || c.formula === 'Ca(OH)₂') {
      candidates.splice(3, 0, {
        es: (c.formula || c.compound) + ' típico',
        en: 'Typical ' + (c.formula || c.compound),
        point: c.percent,
      });
    }
  });
  var out = [];
  candidates.forEach(function (c) {
    if (out.length >= 4) return;
    if (!c.point || c.point.value === null || typeof c.point.value === 'undefined') return;
    out.push(c);
  });
  return out;
}

function fmtVal(point) {
  if (!point || point.value === null || typeof point.value === 'undefined') {
    return '<span class="ml-empty">—</span>';
  }
  var v = point.value;
  var text;
  if (Array.isArray(v)) text = v[0] + '–' + v[1];
  else text = String(v);
  if (point.unit) text += ' ' + point.unit;
  return esc(text);
}

function prov(point) {
  if (!point) return '';
  if (point.value === null || typeof point.value === 'undefined') {
    return '<span class="ml-prov">—</span>';
  }
  var lab = PROVENANCE_LABEL[point.provenance];
  var title = lab ? (lab.es + ' / ' + lab.en) : point.provenance;
  return '<span class="ml-prov" title="' + esc(title) + '">' + esc(lab ? lab.short : point.provenance) + '</span>';
}

function practicalCell(point) {
  var n = point && point.note ? String(point.note).trim() : '';
  if (n && n.length <= 110) return esc(n);
  var src = point && point.source ? String(point.source).trim() : '';
  if (src.length > 120) {
    var parts = src.split(/\.\s+/);
    var last = parts[parts.length - 1].replace(/\.$/, '');
    if (last && last.length <= 110 && parts.length > 1) return esc(last);
  }
  return '<span class="ml-empty">—</span>';
}

function methodCell(point) {
  if (!point) return '';
  if (point.value === null || typeof point.value === 'undefined') {
    return i18n('ml.notMeasured', 'AÚN NO MEDIDO');
  }
  if (point.method) return esc(point.method);
  var src = point.source ? String(point.source).trim() : '';
  if (src && src.length <= 90) return esc(src);
  if (src) return esc('Valores típicos de clase/norma, no ensayo de este lote.');
  return esc(point.note || '');
}

function picture(id, opts) {
  opts = opts || {};
  var sizes = [640, 960, 1280, 1536];
  var avif = sizes.map(function (w) { return MEDIA + '/' + id + '-' + w + '.avif ' + w + 'w'; }).join(', ');
  var webp = sizes.map(function (w) { return MEDIA + '/' + id + '-' + w + '.webp ' + w + 'w'; }).join(', ');
  var sizesAttr = opts.sizes || '(max-width: 768px) 100vw, 70vw';
  var img = '<img src="' + MEDIA + '/' + id + '-960.webp" alt="' + esc(opts.alt || '') + '" width="' + (opts.width || 1536) + '" height="' + (opts.height || 1024) + '"' +
    (opts.priority ? ' fetchpriority="high"' : ' loading="lazy"') +
    ' decoding="async"' + (opts.className ? ' class="' + opts.className + '"' : '') + '>';
  return '<picture><source type="image/avif" srcset="' + avif + '" sizes="' + sizesAttr + '"><source type="image/webp" srcset="' + webp + '" sizes="' + sizesAttr + '">' + img + '</picture>';
}

function navLinks(current) {
  var items = [
    ['/materialab/materials', 'ml.navMaterials', 'Materiales'],
    ['/materialab/research', 'ml.navResearch', 'Investigación'],
    ['/materialab/methodology', 'ml.navMethodology', 'Metodología'],
    ['/materialab/about', 'ml.navAbout', 'Acerca de'],
  ];
  return items.map(function (it) {
    var cur = '';
    if (current && current.indexOf(it[0]) === 0 && it[0] !== '/materialab') cur = ' aria-current="page"';
    if (current === '/materialab' && it[0] === '/materialab/materials') cur = '';
    return '<a href="' + it[0] + '"' + cur + ' data-i18n="' + it[1] + '">' + it[2] + '</a>';
  }).join('');
}

function s35Nav() {
  return '<nav class="nav">\n' +
    '  <div class="nav-container">\n' +
    '    <div class="nav-logo"><a href="/"><img src="/Assets/Logotipo Principal.png" alt="S-35 Technology" class="logo-image"></a></div>\n' +
    '    <div class="nav-menu">\n' +
    '      <div class="nav-dropdown"><a href="http://s-35.com/clientes/#login" class="nav-link" target="_blank" rel="noopener"><span data-i18n="nav.login">Iniciar sesión</span> <i class="fas fa-chevron-right"></i></a></div>\n' +
    '      <a href="/#noticias" class="nav-link" data-i18n="nav.news">News</a>\n' +
    '      <a href="/catalogo.html" class="nav-link" data-i18n="nav.catalog">Catálogo</a>\n' +
    '      <a href="/materialab" class="nav-link" data-i18n="nav.materialab">MateriaLab</a>\n' +
    '      <a href="/#contacto" class="nav-link contact-btn" data-i18n="nav.contact">Contact</a>\n' +
    '    </div>\n' +
    '    <div class="nav-toggle"><span></span><span></span><span></span></div>\n' +
    '  </div>\n' +
    '  <div class="pixel-tracker" id="pixelTracker"></div>\n' +
    '</nav>';
}

function mlFooter() {
  var s = stats;
  return '<footer class="ml-footer" data-print-url="' + esc(config.siteOrigin) + '/materialab">\n' +
    '<div class="ml-grid">\n' +
    '<div class="ml-footer-brand"><strong>MateriaLab</strong><div>' + i18n('ml.footerDivision', 'DIVISIÓN DE INVESTIGACIÓN DE MATERIALES · S-35®') + '</div><div>' + config.hq.city + ', ' + config.hq.state + ', ' + config.hq.countryLong + '</div></div>\n' +
    '<nav class="ml-footer-nav">\n' +
    '<a href="/materialab/materials" data-i18n="ml.indexTitle">ÍNDICE DE MATERIALES</a>\n' +
    '<a href="/materialab/research" data-i18n="ml.researchTitle">ÍNDICE DE INVESTIGACIÓN</a>\n' +
    '<a href="/materialab/methodology" data-i18n="ml.methodology">METODOLOGÍA</a>\n' +
    '<a href="/materialab/about" data-i18n="ml.navAbout">Acerca de</a>\n' +
    '<a href="/" data-i18n="ml.back">← S-35</a>\n' +
    '</nav>\n' +
    '<div class="ml-footer-stats">\n' +
    '<span data-i18n="ml.footerExpanding">EL ARCHIVO SE EXPANDE DE FORMA CONTINUA.</span>\n' +
    '<span>' + pad2(s.materialsDocumented) + ' ' + i18n('ml.footerDocumented', 'MATERIALES DOCUMENTADOS') + '</span>\n' +
    '<span>' + pad2(s.experiments) + ' ' + i18n('ml.footerExperiments', 'EXPERIMENTOS') + '</span>\n' +
    '<span>' + pad2(s.materialsInStudy) + ' ' + i18n('ml.footerStudy', 'EN ESTUDIO') + '</span>\n' +
    (s.lastUpdated ? '<span>' + i18n('ml.footerUpdated', 'ÚLTIMA ACTUALIZACIÓN') + '  ' + s.lastUpdated + '</span>' : '') +
    '</div></div></footer>';
}

function layout(opts, body) {
  var title = opts.title;
  var desc = opts.description;
  var canonical = config.siteOrigin + opts.path;
  var og = opts.og || config.siteOrigin + '/Assets/Logotipo_Principal.png';
  var jsonLd = opts.jsonLd ? '<script type="application/ld+json">' + JSON.stringify(opts.jsonLd) + '</script>' : '';
  var bodyAttrs = 'class="ml-page" data-ml-page="' + esc(opts.page || '') + '"';
  if (opts.i18nPage) bodyAttrs += ' data-i18n-page="' + esc(opts.i18nPage) + '"';
  if (opts.titleEs) {
    bodyAttrs += ' data-ml-title-es="' + esc(opts.titleEs) + '" data-ml-title-en="' + esc(opts.titleEn || opts.titleEs) + '"';
  }
  if (opts.descEs) {
    bodyAttrs += ' data-ml-desc-es="' + esc(opts.descEs) + '" data-ml-desc-en="' + esc(opts.descEn || opts.descEs) + '"';
  }
  return '<!DOCTYPE html>\n<html lang="es">\n<head>\n' +
    '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<title>' + esc(title) + '</title>\n' +
    '<meta name="description" content="' + esc(desc) + '">\n' +
    '<link rel="canonical" href="' + esc(canonical) + '">\n' +
    '<meta property="og:type" content="website">\n' +
    '<meta property="og:url" content="' + esc(canonical) + '">\n' +
    '<meta property="og:title" content="' + esc(title) + '">\n' +
    '<meta property="og:description" content="' + esc(desc) + '">\n' +
    '<meta property="og:image" content="' + esc(og) + '">\n' +
    '<meta name="theme-color" content="#000000">\n' +
    '<link rel="stylesheet" href="/styles.css">\n' +
    '<link rel="stylesheet" href="/materialab/materialab.css">\n' +
    '<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">\n' +
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">\n' +
    jsonLd + '\n</head>\n<body ' + bodyAttrs + '>\n' +
    s35Nav() + '\n' +
    '<div class="ml-subnav"><div class="ml-subnav-inner"><nav class="ml-subnav-links">' + navLinks(opts.path) + '</nav>' +
    '<a class="ml-subnav-back" href="/" data-i18n="ml.back">← S-35</a></div></div>\n' +
    body + '\n' +
    mlFooter() + '\n' +
    '<script src="/i18n.js"></script>\n<script src="/script.js"></script>\n<script src="/materialab/materialab.js"></script>\n' +
    '</body>\n</html>\n';
}

function legend() {
  return '<ul class="ml-legend">' +
    Object.keys(PROVENANCE_LABEL).map(function (k) {
      var p = PROVENANCE_LABEL[k];
      return '<li><span class="ml-prov">' + p.short + '</span> ' + loc(esc(p.es), esc(p.en)) + '</li>';
    }).join('') +
    '</ul>';
}

function materialRows() {
  return archive.materials.map(function (m) {
    var cat = CATEGORIES[m.category];
    var clickable = m.status === 'documented';
    var href = clickable ? '/materialab/materials/' + m.slug : '';
    var origin = m.origin && m.origin.value ? m.origin.value : '—';
    var classCell = locText(m.classLabel || (cat ? cat.singular : m.category));
    var statusCell = locText(STATUS[m.status] || m.status);
    var nameCell = loc(
      '<span class="ml-name">' + esc(m.name.es) + '</span>',
      '<span class="ml-name">' + esc(m.name.en) + '</span>'
    );
    var inner = '<td>' + esc(m.code) + '</td>' +
      '<td>' + nameCell + '</td>' +
      '<td>' + classCell + '</td>' +
      '<td>' + esc(origin) + '</td>' +
      '<td class="ml-status">' + statusCell + '</td>';
    var rowClass = 'ml-row' + (clickable ? '' : ' ml-row-disabled');
    var row = '<tr class="' + rowClass + '" data-status="' + m.status + '"' +
      (clickable ? '' : ' aria-disabled="true"') + '>' +
      (clickable
        ? '<td><a href="' + href + '">' + esc(m.code) + '</a></td>' +
          '<td><a href="' + href + '">' + nameCell + '</a></td>' +
          '<td><a href="' + href + '">' + classCell + '</a></td>' +
          '<td><a href="' + href + '">' + esc(origin) + '</a></td>' +
          '<td><a href="' + href + '" class="ml-status">' + statusCell + '</a></td>'
        : inner) +
      '</tr>';
    return row;
  }).join('\n');
}

function psdChart(material) {
  var g = material.granulometry;
  if (!g) return '<p class="ml-empty">' + i18n('ml.chartPsdPending', 'DISTRIBUCIÓN GRANULOMÉTRICA — CURVA DE MUESTRA AÚN NO MEDIDA') + '</p>';
  var W = 900, H = 420, pL = 56, pR = 24, pT = 20, pB = 48;
  var innerW = W - pL - pR, innerH = H - pT - pB;
  var dMin = 0.075, dMax = 9.5;
  function xOf(d) {
    return pL + ((Math.log(d) - Math.log(dMin)) / (Math.log(dMax) - Math.log(dMin))) * innerW;
  }
  function yOf(pct) {
    return pT + (1 - pct / 100) * innerH;
  }
  var ticks = [4.75, 2.36, 1.18, 0.6, 0.3, 0.15, 0.075];
  var tickLabels = { 4.75: '4.75', 2.36: '2.36', 1.18: '1.18', 0.6: '0.60', 0.3: '0.30', 0.15: '0.15', 0.075: '0.075' };
  var grid = '';
  ticks.forEach(function (t) {
    var x = xOf(t);
    grid += '<line x1="' + x + '" y1="' + pT + '" x2="' + x + '" y2="' + (H - pB) + '" stroke="#e5e5e5" stroke-width="1"/>';
    grid += '<text x="' + x + '" y="' + (H - 18) + '" text-anchor="middle" fill="#737373" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" letter-spacing="0.06em">' + tickLabels[t] + '</text>';
  });
  [0, 25, 50, 75, 100].forEach(function (pct) {
    var y = yOf(pct);
    grid += '<line x1="' + pL + '" y1="' + y + '" x2="' + (W - pR) + '" y2="' + y + '" stroke="#e5e5e5" stroke-width="1"/>';
    grid += '<text x="' + (pL - 8) + '" y="' + (y + 4) + '" text-anchor="end" fill="#737373" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">' + pct + '</text>';
  });
  var band = '';
  if (g.specBand && g.specBand.limits) {
    var maxPts = g.specBand.limits.map(function (l) { return xOf(l.openingMm) + ',' + yOf(l.max); }).join(' ');
    var minPts = g.specBand.limits.map(function (l) { return xOf(l.openingMm) + ',' + yOf(l.min); }).join(' ');
    band = '<polyline fill="none" stroke="#737373" stroke-width="1" stroke-dasharray="3 3" points="' + maxPts + '"/>' +
      '<polyline fill="none" stroke="#737373" stroke-width="1" stroke-dasharray="3 3" points="' + minPts + '"/>';
  }
  var measured = (g.sieves || []).filter(function (s) { return s.passingPercent && s.passingPercent.value !== null; });
  var curve = '';
  if (measured.length) {
    var pts = measured.map(function (s) { return xOf(s.openingMm) + ',' + yOf(s.passingPercent.value); }).join(' ');
    curve = '<polyline fill="none" stroke="#000" stroke-width="1.5" points="' + pts + '"/>';
  }
  var markers = '';
  [['d10', 10], ['d50', 50], ['d90', 90]].forEach(function (pair) {
    var dp = g[pair[0]];
    if (dp && dp.value !== null && typeof dp.value === 'number') {
      var x = xOf(dp.value);
      var y = yOf(pair[1]);
      markers += '<line x1="' + x + '" y1="' + pT + '" x2="' + x + '" y2="' + (H - pB) + '" stroke="#a33b16" stroke-width="1" stroke-dasharray="2 3"/>';
      markers += '<text x="' + (x + 4) + '" y="' + (y - 4) + '" fill="#a33b16" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">' + pair[0].toUpperCase() + '</text>';
    }
  });
  var caption = measured.length
    ? i18n('ml.chartPsd', 'DISTRIBUCIÓN GRANULOMÉTRICA')
    : i18n('ml.chartPsdPending', 'DISTRIBUCIÓN GRANULOMÉTRICA — CURVA DE MUESTRA AÚN NO MEDIDA') + (g.specBand ? ' · ' + i18n('ml.chartEnvelope', 'ENVOLVENTE PUNTEADA ASTM C33 AGREGADO FINO (REF)') : '');
  return '<div class="ml-chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Particle size distribution">' +
    '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#fff"/>' +
    grid +
    '<line x1="' + pL + '" y1="' + pT + '" x2="' + pL + '" y2="' + (H - pB) + '" stroke="#000" stroke-width="1"/>' +
    '<line x1="' + pL + '" y1="' + (H - pB) + '" x2="' + (W - pR) + '" y2="' + (H - pB) + '" stroke="#000" stroke-width="1"/>' +
    band + curve + markers +
    '<text x="' + (pL + innerW / 2) + '" y="' + (H - 4) + '" text-anchor="middle" fill="#737373" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">mm · LOG</text>' +
    '<text transform="translate(14 ' + (pT + innerH / 2) + ') rotate(-90)" text-anchor="middle" fill="#737373" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">%</text>' +
    '</svg><p class="ml-label" style="margin-top:0.75rem">' + caption + '</p></div>';
}

function chemBlock(material) {
  if (!material.chemical || !material.chemical.length) return '';
  var rows = material.chemical.map(function (c) {
    return '<tr><td>' + esc(c.compound) + (c.formula ? ' <span class="ml-label">' + esc(c.formula) + '</span>' : '') +
      '</td><td>' + fmtVal(c.percent) + ' ' + prov(c.percent) + '</td></tr>';
  }).join('');
  return '<table class="ml-ft-mini"><thead><tr><th scope="col" data-i18n="ml.ftOxide">ÓXIDO</th><th scope="col" data-i18n="ml.ftRange">RANGO %</th></tr></thead><tbody>' +
    rows + '</tbody></table>';
}

function datasheet(material) {
  var rows = [];
  function add(key, esLabel, point) {
    if (!point) return;
    rows.push('<tr><td' + (key ? ' data-i18n="' + key + '"' : '') + '>' + esLabel + '</td><td>' +
      fmtVal(point) + ' ' + prov(point) + '</td><td>' + practicalCell(point) + '</td><td>' + methodCell(point) + '</td></tr>');
  }
  var p = material.physical || {};
  add('ml.dsBulk', 'Densidad aparente', p.bulkDensity);
  add('ml.dsSg', 'Densidad relativa', p.specificGravity);
  add('ml.dsHardness', 'Dureza (Mohs)', p.hardnessMohs);
  add('ml.dsAbsorption', 'Absorción de agua', p.waterAbsorption);
  add('ml.dsPorosity', 'Porosidad', p.porosity);
  add('ml.dsColour', 'Color', p.color);
  add('ml.dsStructure', 'Estructura', p.structure);
  add('ml.dsMaxSize', 'Tamaño máximo', p.maxSize);
  add('ml.dsFm', 'Módulo de finura', p.finenessModulus);
  add('ml.dsGrain', 'Rango de grano', p.grainRange);
  add('ml.dsWhiteness', 'Blancura', p.whiteness);
  add('ml.dsCalcination', 'Temperatura de calcinación', p.calcinationTemp);
  add('ml.dsKiln', 'Temperatura de horno', p.kilnTemp);
  add('ml.dsPh', 'pH (saturado / pasta fresca)', p.phSaturated || p.phFresh);
  add('ml.dsSet', 'Fraguado inicial', p.initialSet);
  add('ml.dsStrength', 'Clase de resistencia', p.strengthClass);
  add('ml.dsWc', 'Relación agua/cemento', p.waterCementRatio);
  (material.chemical || []).forEach(function (c) {
    add('', c.compound, c.percent);
  });
  if (material.morphology) {
    add('ml.dsSurface', 'Superficie', material.morphology.surface);
    add('ml.dsGeometry', 'Geometría', material.morphology.geometry);
    add('ml.dsEdge', 'Perfil de arista', material.morphology.edgeProfile);
  }
  return '<div class="ml-index-table-wrap"><p class="ml-scroll-hint" data-i18n="ml.scroll">DESPLAZA PARA VER MÁS →</p><table class="ml-table ml-datasheet"><thead><tr>' +
    '<th scope="col" data-i18n="ml.ftParam">PARÁMETRO</th>' +
    '<th scope="col" data-i18n="ml.ftTypical">VALOR TÍPICO</th>' +
    '<th scope="col" data-i18n="ml.ftPractical">EN TÉRMINOS PRÁCTICOS</th>' +
    '<th scope="col" data-i18n="ml.ftNorm">NORMA / FUENTE</th>' +
    '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>' + legend();
}

function materialTableWrap(innerTable) {
  return '<div class="ml-index-table-wrap"><p class="ml-scroll-hint" data-i18n="ml.scroll">DESPLAZA PARA VER MÁS →</p>' + innerTable + '</div>';
}

function archiveMast(right) {
  return '<div class="ml-sheet-mast">' +
    '<span class="ml-sheet-mast-brand"><img src="/Assets/Logotipo Principal.png" alt="S-35" class="ml-sheet-logo">S35®Tech · Laboratorio de Materiales Pétreos</span>' +
    '<span>' + right + '</span></div>' +
    '<div class="ml-m-hair"></div>';
}

function archiveOpen(right) {
  return '<article class="ml-archive ml-sheet--motion">' + archiveMast(right);
}

function archiveClose() {
  return '</article>';
}

function pageHome() {
  var featured = archive.featuredResearch();
  var featMat = featured ? archive.bySlug(featured.materialSlug) : archive.documentedMaterials()[0];
  var featImg = featMat && featMat.images.macro[0];
  var stepKeys = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8'];
  var stepEs = ['ORIGEN', 'MUESTRA', 'CLASIFICAR', 'MEDIR', 'ENSAYAR', 'FORMULAR', 'VALIDAR', 'DOCUMENTAR'];
  var chain = [
    ['ml.chainMineral', 'MINERAL'],
    ['ml.chainAggregate', 'AGREGADO'],
    ['ml.chainFormulation', 'FORMULACIÓN'],
    ['ml.chainMaterial', 'MATERIAL'],
    ['ml.chainSurface', 'SUPERFICIE'],
    ['ml.chainArchitecture', 'ARQUITECTURA'],
  ];
  var body = '<div hidden class="ml-banner ml-banner--warn" data-not-found data-i18n="ml.notFound">CÓDIGO NO ENCONTRADO EN EL ARCHIVO — ESTA INVESTIGACIÓN PUEDE NO ESTAR PUBLICADA AÚN</div>' +
    archiveOpen('MateriaLab · Archivo abierto') +
    '<div class="ml-sheet-row">' +
    '<div class="ml-rail"><strong>Archivo de<br>investigación</strong><div style="margin-top:10px">S-35®</div><div style="margin-top:10px">Rev. 01 · 2026</div></div>' +
    '<div><h1 class="ml-archive-title">MateriaLab</h1>' +
    '<p class="ml-archive-lead"><span data-i18n="ml.heroSub">Investigación y desarrollo de materiales</span><br><br><br>' +
    '<span data-i18n="ml.heroLine">Estudiamos la materia antes de convertirla en material.</span> ' +
    '<span data-i18n="ml.heroDesc">Una colección abierta de investigaciones sobre minerales, agregados, cementantes y materias primas desarrollada por S-35.</span></p></div></div>' +
    '<div class="ml-sheet-row"><div class="ml-rail">Identificación</div>' +
    '<div class="ml-m-id ml-id-grid">' +
    '<div><div class="ml-label" style="margin-bottom:4px">División</div><div style="font-size:15px;line-height:1.4">Investigación de materiales</div></div>' +
    '<div><div class="ml-label" style="margin-bottom:4px">Establecido</div><div style="font-size:15px;line-height:1.4">' + config.founded + '</div></div>' +
    '<div><div class="ml-label" style="margin-bottom:4px">Sede</div><div style="font-size:15px;line-height:1.4">' + config.hq.city + ', ' + config.hq.state + '</div></div>' +
    '<div><div class="ml-label" style="margin-bottom:4px">Coordenadas</div><div style="font-size:15px;line-height:1.4">' + config.hq.latLabel + ' · ' + config.hq.lonLabel + '</div></div>' +
    '</div></div>' +
    '<div class="ml-sheet-row"><div class="ml-rail"><div>1.0</div><div style="font-size:16px;font-weight:700;line-height:1.25;letter-spacing:-0.01em;color:#000;margin-top:6px;text-transform:none;letter-spacing:-0.01em" data-i18n="ml.manifestoTitle">Manifiesto</div></div>' +
    '<div><div class="ml-m-rule"></div><div class="ml-prose"><p data-i18n="ml.manifestoP1">Cada material empieza mucho antes de convertirse en un producto. Empieza en una partícula. Su composición química, mineralogía, granulometría, densidad, absorción, morfología y procedencia determinan gran parte de su comportamiento.</p>' +
    '<p data-i18n="ml.manifestoP2">MateriaLab es el archivo de investigación de S-35 dedicado a estudiar estas variables, documentarlas y convertir ese conocimiento en mejores materiales.</p></div>' +
    '<p class="ml-close">' + i18nHtml('ml.manifestoClose', 'La investigación informa la formulación.<br>La formulación informa el desempeño.') + '</p></div></div>' +
    '<div class="ml-sheet-row" id="index"><div class="ml-rail"><div>2.0</div><div style="font-size:16px;font-weight:700;line-height:1.25;color:#000;margin-top:6px;text-transform:none;letter-spacing:-0.01em" data-i18n="ml.indexTitle">Índice de materiales</div></div>' +
    '<div><div class="ml-m-rule"></div>' +
    materialTableWrap('<table class="ml-table"><thead><tr><th scope="col" data-i18n="ml.thCode">CÓDIGO</th><th scope="col" data-i18n="ml.thName">NOMBRE</th><th scope="col" data-i18n="ml.thClass">CLASE</th><th scope="col" data-i18n="ml.thOrigin">ORIGEN</th><th scope="col" data-i18n="ml.thStatus">ESTADO</th></tr></thead><tbody>' +
    materialRows() + '</tbody></table>') + '</div></div>';
  if (featured && featMat) {
    body += '<div class="ml-sheet-row"><div class="ml-rail"><div>3.0</div><div style="font-size:16px;font-weight:700;line-height:1.25;color:#000;margin-top:6px;text-transform:none;letter-spacing:-0.01em" data-i18n="ml.featured">Investigación destacada</div></div>' +
      '<div><div class="ml-m-rule"></div><article class="ml-featured ml-m-plate"><div class="ml-featured-visual">' +
      picture(featImg.id, { alt: featImg.alt, width: featImg.width, height: featImg.height, sizes: '(max-width: 1024px) 100vw, 60vw' }) +
      '</div><div class="ml-featured-meta"><p class="ml-label">' + esc(featured.code) + ' · ' + featured.date + ' · REV ' + pad2(featured.revision) + '</p>' +
      '<h3><a href="/materialab/materials/' + featMat.slug + '">' + locText(featured.title) + '</a></h3>' +
      locParas(featured.summary) +
      '<p class="ml-label" style="margin-top:1.5rem"><a href="/materialab/materials/' + featMat.slug + '" data-i18n="ml.openFile">ABRIR FICHA →</a></p>' +
      '</div></article></div></div>';
  }
  body += '<div class="ml-sheet-row"><div class="ml-rail"><div>4.0</div><div style="font-size:16px;font-weight:700;line-height:1.25;color:#000;margin-top:6px;text-transform:none;letter-spacing:-0.01em" data-i18n="ml.methodology">Metodología</div></div>' +
    '<div><div class="ml-m-rule"></div><p class="ml-lede" data-i18n="ml.methodologyLede">MateriaLab utiliza una metodología progresiva para caracterizar materias primas antes de evaluar su incorporación a sistemas formulados.</p>' +
    '<div class="ml-steps">' + stepKeys.map(function (k, i) {
      return '<div class="ml-step"><span class="ml-step-n">' + pad2(i + 1) + '</span><span class="ml-step-l" data-i18n="ml.' + k + '">' + stepEs[i] + '</span></div>';
    }).join('') + '</div>' +
    '<p class="ml-close" style="margin-top:1.5rem"><a href="/materialab/methodology" data-i18n="ml.fullMethodology">METODOLOGÍA COMPLETA →</a></p></div></div>' +
    '<div class="ml-sheet-row"><div class="ml-rail"><div>5.0</div><div style="font-size:16px;font-weight:700;line-height:1.25;color:#000;margin-top:6px;text-transform:none;letter-spacing:-0.01em" data-i18n="ml.chainTitle">De la materia al material</div></div>' +
    '<div><div class="ml-m-rule"></div><p class="ml-chain">' + chain.map(function (c, i) { return i18n(c[0], c[1]) + (i < chain.length - 1 ? '<span>→</span>' : ''); }).join('') + '</p>' +
    '<p class="ml-close" data-i18n="ml.chainClose">La investigación es donde empieza cada material S-35.</p></div></div>' +
    '<div class="ml-sheet-row" id="research"><div class="ml-rail"><div>6.0</div><div style="font-size:16px;font-weight:700;line-height:1.25;color:#000;margin-top:6px;text-transform:none;letter-spacing:-0.01em" data-i18n="ml.researchTitle">Índice de investigación</div></div>' +
    '<div><div class="ml-m-rule"></div>' + researchTable() + '</div></div>' +
    archiveClose();
  return layout({
    title: 'MateriaLab — Investigación y desarrollo de materiales | S-35',
    description: 'Archivo abierto de caracterización de materias primas de S-35. Agregados, cargas y cementantes documentados con procedencia.',
    path: '/materialab',
    page: 'home',
    i18nPage: 'mlHome',
    og: featImg ? config.siteOrigin + MEDIA + '/' + featImg.id + '-og.webp' : undefined,
  }, body);
}

function researchTable() {
  var cats = archive.categoriesInUse();
  var filters = '<div class="ml-filters" data-filter-group="#ml-research-table"><button type="button" data-cat="ALL" aria-pressed="true" data-i18n="ml.filterAll">TODOS</button>' +
    cats.map(function (c) {
      return '<button type="button" data-cat="' + c + '" aria-pressed="false" data-i18n="ml.cat' + c + '">' + esc(CATEGORIES[c].es.toUpperCase()) + '</button>';
    }).join('') + '</div>';
  var rows = archive.researchFiles.map(function (r) {
    var href = '/materialab/materials/' + r.materialSlug;
    return '<tr data-cat="' + r.category + '"><td><a href="' + href + '">' + esc(r.code) + '</a></td><td><a href="' + href + '">' + locText(r.title) + '</a></td><td>' + locText(CATEGORIES[r.category]) + '</td><td>' + esc(r.date) + '</td><td>' + pad2(r.revision) + '</td><td class="ml-status">' + locText(STATUS[r.status] || { es: r.status, en: r.status }) + '</td></tr>';
  }).join('');
  return filters + materialTableWrap('<table class="ml-table" id="ml-research-table"><thead><tr><th scope="col" data-i18n="ml.thCode">CÓDIGO</th><th scope="col" data-i18n="ml.thTitle">TÍTULO</th><th scope="col" data-i18n="ml.thCategory">CATEGORÍA</th><th scope="col" data-i18n="ml.thDate">FECHA</th><th scope="col" data-i18n="ml.thRev">REV</th><th scope="col" data-i18n="ml.thStatus">ESTADO</th></tr></thead><tbody>' + rows + '</tbody></table>');
}

function pageMaterialsIndex() {
  var body = archiveOpen('MateriaLab · Archivo abierto') +
    '<div class="ml-sheet-row"><div class="ml-rail"><strong>Índice de<br>materiales</strong><div style="margin-top:10px">Rev. 01 · 2026</div></div>' +
    '<div><h1 class="ml-file-title" data-i18n="ml.materialsH1">Materiales</h1>' +
    '<p class="ml-lede">' + pad2(stats.materialsDocumented) + ' ' + i18n('ml.materialsLede', 'MATERIALES DOCUMENTADOS. El archivo empieza pequeño y crece a la vista.') + '</p>' +
    '<div class="ml-m-rule"></div>' +
    materialTableWrap('<table class="ml-table"><thead><tr><th scope="col" data-i18n="ml.thCode">CÓDIGO</th><th scope="col" data-i18n="ml.thName">NOMBRE</th><th scope="col" data-i18n="ml.thClass">CLASE</th><th scope="col" data-i18n="ml.thOrigin">ORIGEN</th><th scope="col" data-i18n="ml.thStatus">ESTADO</th></tr></thead><tbody>' +
    materialRows() + '</tbody></table>') + '</div></div>' + archiveClose();
  return layout({
    title: 'Índice de materiales — MateriaLab | S-35',
    description: 'Índice de materias primas documentadas e en estudio en MateriaLab, la división de investigación de materiales de S-35.',
    path: '/materialab/materials',
    page: 'materials',
    i18nPage: 'mlMaterials',
  }, body);
}

function pageResearch() {
  var body = archiveOpen('MateriaLab · Archivo abierto') +
    '<div class="ml-sheet-row"><div class="ml-rail"><strong>Índice de<br>investigación</strong><div style="margin-top:10px">Rev. 01 · 2026</div></div>' +
    '<div><h1 class="ml-file-title" data-i18n="ml.researchH1">Investigación</h1>' +
    '<p class="ml-lede" data-i18n="ml.researchLede">Investigaciones publicadas. Los filtros solo muestran categorías con al menos un documento.</p>' +
    '<div class="ml-m-rule"></div>' +
    researchTable() + '</div></div>' + archiveClose();
  return layout({
    title: 'Índice de investigación — MateriaLab | S-35',
    description: 'Índice de investigaciones de MateriaLab sobre agregados, cargas y cementantes.',
    path: '/materialab/research',
    page: 'research',
    i18nPage: 'mlResearch',
  }, body);
}

function pageAbout() {
  var body = archiveOpen('MateriaLab · Archivo abierto') +
    '<div class="ml-sheet-row"><div class="ml-rail"><strong>Acerca de<br>MateriaLab</strong><div style="margin-top:10px">Rev. 01 · 2026</div></div>' +
    '<div><h1 class="ml-file-title" data-i18n="ml.aboutTitle">Qué es MateriaLab — y qué no es</h1></div></div>' +
    '<div class="ml-sheet-row"><div class="ml-rail"><div>1.0</div><div style="font-size:16px;font-weight:700;line-height:1.25;color:#000;margin-top:6px;text-transform:none;letter-spacing:-0.01em" data-i18n="ml.aboutWhat">Qué es</div></div>' +
    '<div><div class="ml-m-rule"></div><div class="ml-prose"><p data-i18n="ml.aboutWhatP" data-i18n-html>MateriaLab es un archivo abierto de caracterización de materias primas desarrollado por S-35. Publica lo que se observa y se mide sobre minerales, agregados, cementantes y cargas <em>antes</em> de convertirlos en un producto. El orden es deliberado: primero conocimiento, después autoridad, después marca, después producto.</p></div></div></div>' +
    '<div class="ml-sheet-row"><div class="ml-rail"><div>2.0</div><div style="font-size:16px;font-weight:700;line-height:1.25;color:#000;margin-top:6px;text-transform:none;letter-spacing:-0.01em" data-i18n="ml.aboutNot">Qué no es</div></div>' +
    '<div><div class="ml-m-rule"></div><div class="ml-prose"><p data-i18n="ml.aboutNotP" data-i18n-html>MateriaLab no es un laboratorio acreditado. No es un organismo de certificación. No es una fuente de especificación de producto. Los datos de caracterización <strong>no constituyen especificación técnica ni garantía de desempeño</strong> de ningún producto S-35.</p></div></div></div>' +
    '<div class="ml-sheet-row"><div class="ml-rail"><div>3.0</div><div style="font-size:16px;font-weight:700;line-height:1.25;color:#000;margin-top:6px;text-transform:none;letter-spacing:-0.01em" data-i18n="ml.aboutHow">Cómo se obtienen los datos</div></div>' +
    '<div><div class="ml-m-rule"></div><div class="ml-prose"><p data-i18n="ml.aboutHowP">Cada valor publicable lleva una etiqueta de procedencia. Si un número no tiene procedencia, el archivo no lo publica — el build falla.</p></div>' +
    legend() +
    '<div class="ml-prose" style="margin-top:1.25rem">' +
    '<p><span class="ml-prov">MEAS</span> — ' + i18n('ml.aboutMeas', 'medido por S-35 sobre una muestra identificada, con fecha.') + ' <span class="ml-prov">REF</span> — ' + i18n('ml.aboutRef', 'tomado de bibliografía, norma o ficha de proveedor, siempre con fuente.') + ' <span class="ml-prov">OBS</span> — ' + i18n('ml.aboutObs', 'observación interna no instrumentada (vista o referencia visual).') + ' <span class="ml-prov">HYP</span> — ' + i18n('ml.aboutHyp', 'hipótesis de trabajo.') + ' <span class="ml-prov">WIP</span> — ' + i18n('ml.aboutWip', 'ensayo iniciado, sin conclusión; en la tabla se lee AÚN NO MEDIDO.') + '</p>' +
    '<p data-i18n="ml.aboutFirst">Las primeras fichas combinan una referencia visual de presentación habitual con perfiles típicos de norma o de comercio, etiquetados REF. Donde el lote no se ensayó, el campo está vacío a propósito.</p>' +
    '<p data-i18n="ml.aboutPublishes" data-i18n-html>MateriaLab publica <em>qué se sabe sobre la materia prima</em>. No publica qué hace S-35 con ella: ni dosificaciones, ni curvas objetivo de producción, ni proveedores.</p>' +
    '</div></div></div>' + archiveClose();
  return layout({
    title: 'Qué es MateriaLab — y qué no es | S-35',
    description: 'MateriaLab es un archivo abierto de caracterización de materias primas. No es un laboratorio acreditado ni una especificación de producto S-35.',
    path: '/materialab/about',
    page: 'about',
    i18nPage: 'mlAbout',
  }, body);
}

function pageMethodology() {
  var stepKeys = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8'];
  var stepEs = ['ORIGEN', 'MUESTRA', 'CLASIFICAR', 'MEDIR', 'ENSAYAR', 'FORMULAR', 'VALIDAR', 'DOCUMENTAR'];
  var stepP = [
    'Se declara la región de origen. No se publica cantera ni proveedor.',
    'Se documenta el material con un código (ML-SMP) y una referencia visual de presentación habitual.',
    'Se asigna categoría (AGG, BND, FIL…) y código correlativo. El código no se reutiliza.',
    'Ensayos instrumentados, con norma o método y fecha. Si no hay ensayo, el campo queda vacío.',
    'Ensayos sobre una o más muestras (ML-EXP). Solo se listan experimentos que existen.',
    'El conocimiento informa la formulación. La formulación no se publica aquí.',
    'Revisión interna antes de pasar de EN ESTUDIO a DOCUMENTADO.',
    'Ficha pública con procedencia, revisión y disclaimer. El archivo se actualiza a la vista.',
  ];
  var body = archiveOpen('MateriaLab · Archivo abierto') +
    '<div class="ml-sheet-row"><div class="ml-rail"><strong>Metodología</strong><div style="margin-top:10px">Rev. 01 · 2026</div></div>' +
    '<div><h1 class="ml-file-title" data-i18n="ml.methodTitle">Cómo se estudian los materiales</h1>' +
    '<p class="ml-lede" data-i18n="ml.methodLede">MateriaLab utiliza una metodología progresiva para caracterizar materias primas antes de evaluar su incorporación a sistemas formulados. No afirmamos acreditaciones, equipos ni normas que no hayamos ejecutado sobre la muestra publicada.</p></div></div>' +
    '<div class="ml-sheet-row"><div class="ml-rail"><div>1.0</div><div style="font-size:16px;font-weight:700;line-height:1.25;color:#000;margin-top:6px;text-transform:none;letter-spacing:-0.01em">Pasos</div></div>' +
    '<div><div class="ml-m-rule"></div><div class="ml-steps">' + stepKeys.map(function (k, i) {
      return '<div class="ml-step"><span class="ml-step-n">' + pad2(i + 1) + '</span><span class="ml-step-l" data-i18n="ml.' + k + '">' + stepEs[i] + '</span></div>';
    }).join('') + '</div>' +
    '<div class="ml-prose" style="margin-top:1.5rem">' + stepKeys.map(function (k, i) {
      return '<p><strong>' + pad2(i + 1) + ' ' + i18n('ml.' + k, stepEs[i]) + '.</strong> ' + i18n('ml.' + k + 'p', stepP[i]) + '</p>';
    }).join('') +
    '<p data-i18n="ml.methodClose">Si un ensayo se hizo en laboratorio externo, se nombra el laboratorio o se dice “laboratorio externo”. Nunca se omite para insinuar capacidad propia. En esta primera publicación no hay ensayos instrumentados de lote: hay referencia visual, observación y referencia normativa.</p>' +
    '</div></div></div>' + archiveClose();
  return layout({
    title: 'Metodología — MateriaLab | S-35',
    description: 'Cómo MateriaLab caracteriza materias primas: origen, muestra, clasificación, medición, documentación. Sin acreditaciones no confirmadas.',
    path: '/materialab/methodology',
    page: 'methodology',
    i18nPage: 'mlMethodology',
  }, body);
}

function loadTechFile(m) {
  if (!m.techFile) return '';
  var full = path.join(__dirname, '..', 'content', 'research', 'tech-files', m.techFile);
  var html = fs.readFileSync(full, 'utf8');
  var img = m.images.macro[0];
  var year = String(m.updatedAt || m.publishedAt || '').slice(0, 4);
  html = html.split('{{IMAGE}}').join(picture(img.id, {
    alt: img.alt,
    width: img.width,
    height: img.height,
    priority: true,
    sizes: '(min-width: 900px) 320px, 100vw',
  }));
  html = html.split('{{CODE}}').join(esc(m.code));
  html = html.split('{{REV}}').join(pad2(m.revision));
  html = html.split('{{YEAR}}').join(esc(year || '2026'));
  return html;
}

function pageMaterial(m) {
  var cat = CATEGORIES[m.category];
  var img = m.images.macro[0];
  var sample = archive.samples.filter(function (s) { return s.materialSlug === m.slug; })[0];
  var relatedR = (m.relatedResearch || []).map(function (slug) {
    return archive.researchFiles.filter(function (r) { return r.slug === slug; })[0];
  }).filter(Boolean);
  var relatedM = (m.relatedMaterials || []).map(archive.bySlug).filter(Boolean);
  var descEs = (m.name.es + '. ' + String(m.summary.es || '').split(/\n\n/)[0]).slice(0, 158);
  var descEn = (m.name.en + '. ' + String(m.summary.en || m.summary.es || '').split(/\n\n/)[0]).slice(0, 158);
  var catLabel = cat ? cat.singular : { es: 'material', en: 'material' };
  var titleEs = m.name.es + ' — Caracterización de ' + String(catLabel.es || 'material').toLowerCase() + ' | MateriaLab S-35';
  var titleEn = m.name.en + ' — ' + (catLabel.en || 'material') + ' characterisation | MateriaLab S-35';
  var jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: m.name.es + ' (' + m.name.en + ') — Caracterización | MateriaLab S-35',
      datePublished: m.publishedAt,
      dateModified: m.updatedAt,
      inLanguage: 'es',
      creator: { '@type': 'Organization', name: 'S-35' },
      publisher: { '@type': 'Organization', name: 'S-35' },
      license: config.siteOrigin + '/terminos.html',
      url: config.siteOrigin + '/materialab/materials/' + m.slug,
    },
  ];
  if (m.granulometry) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: 'Particle size distribution — ' + m.name.en,
      creator: { '@type': 'Organization', name: 'S-35' },
      dateModified: m.updatedAt,
      license: config.siteOrigin + '/terminos.html',
      description: m.granulometry.specBand
        ? 'ASTM C33 fine-aggregate envelope (reference). Lot PSD not yet measured.'
        : 'Particle size distribution for ' + m.name.en,
    });
  }
  var layoutOpts = {
    title: titleEs,
    description: descEs,
    titleEs: titleEs,
    titleEn: titleEn,
    descEs: descEs,
    descEn: descEn,
    path: '/materialab/materials/' + m.slug,
    page: 'material',
    og: config.siteOrigin + MEDIA + '/' + img.id + '-og.webp',
    jsonLd: jsonLd,
  };
  var tech = loadTechFile(m);
  var body = '<div hidden class="ml-banner" data-packaging-banner>' + i18n('ml.packaging', 'ESCANEADO DESDE EL EMPAQUE') + ' · ' + esc(m.code) + ' · ' + i18n('ml.packagingWelcome', 'BIENVENIDO AL ARCHIVO') + '</div>';
  if (tech) {
    var sheetClass = 'ml-sheet' + (m.techMotion ? ' ml-sheet--motion' : '');
    return layout(layoutOpts, body + '<article class="' + sheetClass + '">' + tech + '</article>');
  }
  body += '<article class="ml-ft-doc">' +
    '<div class="ml-ft-mast"><span data-i18n="ml.ftBrand">MATERIALAB · S-35® · ARCHIVO DE CARACTERIZACIÓN</span>' +
    '<span>' + esc(m.code) + ' · REV ' + pad2(m.revision) + ' · ' + esc(m.updatedAt) + '</span></div>' +
    '<div class="ml-ft-hero"><div>' +
    '<h1 class="ml-ft-title">' + locText(m.name) + '</h1>' +
    '<p class="ml-ft-kicker">' + locText(m.classLabel || catLabel) + '</p>' +
    '<div class="ml-ft-lead">' + locParasSlice(m.summary, 0, 2) + '</div></div>' +
    '<figure class="ml-ft-fig">' + picture(img.id, { alt: img.alt, width: img.width, height: img.height, priority: true, sizes: '(min-width: 900px) 42vw, 100vw' }) +
    '<figcaption><span data-i18n="ml.ftFigA">FIG. A · REFERENCIA VISUAL</span></figcaption></figure></div>' +
    '<dl class="ml-ft-id">' +
    '<div><dt data-i18n="ml.ftChemName">NOMBRE QUÍMICO</dt><dd>' + esc(m.scientificName || m.name.es) + '</dd></div>' +
    '<div><dt data-i18n="ml.ftFamily">FAMILIA</dt><dd>' + esc(m.category) + ' · ' + locText(cat ? cat.singular : '') + '</dd></div>' +
    '<div><dt data-i18n="ml.metaOrigin">ORIGEN</dt><dd>' + esc(m.origin.value || '—') + (sample ? '<div class="ml-label">' + esc(sample.id) + '</div>' : '') + '</dd></div>' +
    '</dl>';
  var stats = headlineStats(m);
  if (stats.length) {
    body += '<div class="ml-ft-kpis">' + stats.map(function (s) {
      return '<div class="ml-ft-kpi"><div class="ml-ft-kpi-val">' + fmtVal(s.point) + '</div>' +
        '<div class="ml-ft-kpi-lab">' + loc(esc(s.es), esc(s.en)) + ' · ' + prov(s.point) + '</div></div>';
    }).join('') + '</div>';
  }
  var sec = 0;
  function nextSec() {
    sec += 1;
    return sec + '.0';
  }
  if (summaryHasRest(m.summary)) {
    body += ftSec(nextSec(), 'ml.hSummary', 'Resumen', '<div class="ml-prose">' + locParasSlice(m.summary, 2) + '</div>');
  }
  if (m.chemical && m.chemical.length) {
    body += ftSec(nextSec(), 'ml.ftComp', 'Composición', chemBlock(m));
  }
  body += ftSec(nextSec(), 'ml.ftProps', 'Propiedades y qué significan', datasheet(m));
  if (m.granulometry) {
    body += ftSec(nextSec(), 'ml.hParticle', 'Análisis granulométrico',
      psdChart(m) +
      '<dl class="ml-ft-id" style="border-top:0;padding-top:1rem">' +
      '<div><dt>D10</dt><dd>' + fmtVal(m.granulometry.d10) + ' ' + prov(m.granulometry.d10) + '</dd></div>' +
      '<div><dt>D50</dt><dd>' + fmtVal(m.granulometry.d50) + ' ' + prov(m.granulometry.d50) + '</dd></div>' +
      '<div><dt>D90</dt><dd>' + fmtVal(m.granulometry.d90) + ' ' + prov(m.granulometry.d90) + '</dd></div></dl>');
  }
  body += ftSec(nextSec(), 'ml.hMorphology', 'Morfología',
    '<div class="ml-micro-pending"><p class="ml-label" data-i18n="ml.micrography">MICROGRAFÍA</p><p data-i18n="ml.microPending">PENDIENTE — aún no hay imagen SEM</p>' +
    (m.morphology ? '<p class="ml-prose" style="margin-top:1rem">' + esc((m.morphology.geometry && m.morphology.geometry.value) || '') + '. ' + esc((m.morphology.surface && m.morphology.surface.value) || '') + '</p>' : '') +
    '</div>');
  if (m.whyItMatters && m.whyItMatters.length) {
    body += ftSec(nextSec(), 'ml.hWhy', 'Por qué importa',
      '<div class="ml-ft-why">' + m.whyItMatters.map(function (w, i) {
        return '<article><span class="ml-label">' + String.fromCharCode(65 + i) + '</span><strong>' +
          loc(esc(w.property), esc(w.propertyEn || w.property)) + '</strong><p>' +
          loc(esc(w.effect), esc(w.effectEn || w.effect)) + '</p></article>';
      }).join('') + '</div>');
  }
  if (m.labNotes && m.labNotes.length) {
    body += ftSec(nextSec(), 'ml.hNotes', 'Notas de laboratorio',
      '<div class="ml-ft-notes ml-notes">' +
      m.labNotes.map(function (n) { return '<p><time datetime="' + n.date + '">' + n.date + '</time> — ' + locText(n.text) + '</p>'; }).join('') +
      '</div>');
  }
  var exps = archive.experiments.filter(function (e) {
    return sample && e.sampleIds && e.sampleIds.indexOf(sample.id) !== -1;
  });
  if (exps.length) {
    body += ftSec(nextSec(), 'ml.hExperiments', 'Registro de experimentos',
      '<table class="ml-table"><thead><tr><th>ID</th><th data-i18n="ml.thTitle">TÍTULO</th><th data-i18n="ml.thDate">FECHA</th><th data-i18n="ml.thStatus">ESTADO</th></tr></thead><tbody>' +
      exps.map(function (e) { return '<tr><td>' + esc(e.id) + '</td><td>' + esc(e.title) + '</td><td>' + esc(e.date) + '</td><td>' + esc(e.status) + '</td></tr>'; }).join('') +
      '</tbody></table>');
  }
  body += ftSec(nextSec(), 'ml.hRevision', 'Historial de revisiones',
    '<table class="ml-table"><thead><tr><th scope="col" data-i18n="ml.thRev">REV</th><th scope="col" data-i18n="ml.thDate">FECHA</th><th scope="col" data-i18n="ml.hRevision">CAMBIO</th></tr></thead><tbody>' +
    m.revisionHistory.map(function (r) {
      var change = typeof r.change === 'string' ? r.change : locText(r.change);
      return '<tr><td>' + pad2(r.rev) + '</td><td>' + esc(r.date) + '</td><td>' + (typeof r.change === 'string' ? esc(change) : change) + '</td></tr>';
    }).join('') + '</tbody></table>');
  if (m.applicationHref) {
    body += ftSec(nextSec(), 'ml.hApplication', 'Aplicación de la investigación',
      '<p class="ml-prose">' + i18n('ml.applicationLead', 'Esta caracterización informa sistemas de materiales S-35.') + ' <a href="' + esc(m.applicationHref) + '">' + esc(m.applicationLabel || 'S-35') + '</a></p>');
  }
  if (relatedR.length || relatedM.length) {
    var relatedInner = '';
    relatedR.forEach(function (r) {
      relatedInner += '<p><a href="/materialab/materials/' + r.materialSlug + '">' + esc(r.code) + ' — ' + locText(r.title) + '</a></p>';
    });
    relatedM.forEach(function (rm) {
      if (rm.status === 'documented') {
        relatedInner += '<p><a href="/materialab/materials/' + rm.slug + '">' + esc(rm.code) + ' — ' + locText(rm.name) + '</a></p>';
      }
    });
    body += ftSec(nextSec(), 'ml.hRelated', 'Investigación relacionada', '<div class="ml-prose">' + relatedInner + '</div>');
  }
  body += ftSec('AVISO', 'ml.ftAviso', 'Aviso',
    '<div class="ml-actions"><button type="button" data-print data-i18n="ml.download">DESCARGAR FICHA / PDF</button></div>' +
    '<p class="ml-disclaimer" data-i18n="ml.disclaimer">Los datos de caracterización de materias primas publicados en MateriaLab tienen fines informativos y de divulgación técnica. No constituyen especificación de producto, ficha técnica ni garantía de desempeño de ningún producto S-35.</p>',
    'ml-ft-aviso') +
    '<div class="ml-ft-end"><span>' + i18n('ml.ftDoc', 'DOCUMENTO TÉCNICO') + ' · ' + loc(esc(m.name.es.toUpperCase()), esc(m.name.en.toUpperCase())) + '</span>' +
    '<span data-i18n="ml.ftOpen">ARCHIVO ABIERTO</span></div></article>';
  return layout(layoutOpts, body);
}

function write(rel, html) {
  var full = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
  console.log('wrote public/materialab/' + rel);
}

write('index.html', pageHome());
write('about.html', pageAbout());
write('methodology.html', pageMethodology());
write('research.html', pageResearch());
write('materials/index.html', pageMaterialsIndex());
archive.documentedMaterials().forEach(function (m) {
  write('materials/' + m.slug + '.html', pageMaterial(m));
});

var sitemapPath = path.join(ROOT, 'public', 'sitemap.xml');
var urls = [
  ['https://s35web.vercel.app/materialab', '1.0'],
  ['https://s35web.vercel.app/materialab/materials', '0.9'],
  ['https://s35web.vercel.app/materialab/research', '0.8'],
  ['https://s35web.vercel.app/materialab/methodology', '0.7'],
  ['https://s35web.vercel.app/materialab/about', '0.8'],
].concat(archive.documentedMaterials().map(function (m) {
  return ['https://s35web.vercel.app/materialab/materials/' + m.slug, '0.9'];
}));
var sm = fs.readFileSync(sitemapPath, 'utf8');
var extra = '';
urls.forEach(function (u) {
  if (sm.indexOf('<loc>' + u[0] + '</loc>') === -1) {
    extra += '    <url>\n        <loc>' + u[0] + '</loc>\n        <lastmod>' + stats.lastUpdated + '</lastmod>\n        <changefreq>monthly</changefreq>\n        <priority>' + u[1] + '</priority>\n    </url>\n';
  }
});
if (extra) {
  sm = sm.replace('</urlset>', extra + '\n</urlset>');
  fs.writeFileSync(sitemapPath, sm);
  console.log('updated sitemap.xml');
}

console.log('MateriaLab build complete.');
