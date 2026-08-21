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
  return '<span class="ml-prov" title="' + esc(lab ? lab.en : point.provenance) + '">' + esc(lab ? lab.short : point.provenance) + '</span>';
}

function methodCell(point) {
  if (!point) return '';
  if (point.value === null || typeof point.value === 'undefined') {
    return '<span class="ml-empty">NOT YET MEASURED</span>';
  }
  return esc(point.method || point.source || point.note || '');
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
    ['/materialab/materials', 'MATERIALS'],
    ['/materialab/research', 'RESEARCH'],
    ['/materialab/methodology', 'METHODOLOGY'],
    ['/materialab/about', 'ABOUT'],
  ];
  return items.map(function (it) {
    var cur = current === it[0] || (current === '/materialab' && it[0] === '/materialab/materials' && false)
      ? ' aria-current="page"' : '';
    if (current && current.indexOf(it[0]) === 0 && it[0] !== '/materialab') cur = ' aria-current="page"';
    if (current === '/materialab' && it[0] === '/materialab/materials') cur = '';
    return '<a href="' + it[0] + '"' + cur + '>' + it[1] + '</a>';
  }).join('');
}

function s35Nav() {
  return '<nav class="nav">\n' +
    '  <div class="nav-container">\n' +
    '    <div class="nav-logo"><a href="/"><img src="/Assets/Logotipo Principal.png" alt="S-35 Technology" class="logo-image"></a></div>\n' +
    '    <div class="nav-menu">\n' +
    '      <div class="nav-dropdown"><a href="http://s-35.com/clientes/#login" class="nav-link" target="_blank" rel="noopener">Login <i class="fas fa-chevron-right"></i></a></div>\n' +
    '      <a href="/#noticias" class="nav-link" data-i18n="nav.news">News</a>\n' +
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
    '<div class="ml-footer-brand"><strong>MateriaLab</strong><div>MATERIAL RESEARCH DIVISION · S-35®</div><div>' + config.hq.city + ', ' + config.hq.state + ', ' + config.hq.countryLong + '</div></div>\n' +
    '<nav class="ml-footer-nav">\n' +
    '<a href="/materialab/materials">MATERIAL INDEX</a>\n' +
    '<a href="/materialab/research">RESEARCH INDEX</a>\n' +
    '<a href="/materialab/methodology">METHODOLOGY</a>\n' +
    '<a href="/materialab/about">ABOUT</a>\n' +
    '<a href="/">← S-35</a>\n' +
    '</nav>\n' +
    '<div class="ml-footer-stats">\n' +
    '<span>THE ARCHIVE IS CONTINUOUSLY EXPANDING.</span>\n' +
    '<span>' + pad2(s.materialsDocumented) + ' MATERIALS DOCUMENTED</span>\n' +
    '<span>' + pad2(s.experiments) + ' EXPERIMENTS</span>\n' +
    '<span>' + pad2(s.materialsInStudy) + ' ACTIVE STUDY</span>\n' +
    (s.lastUpdated ? '<span>LAST UPDATED  ' + s.lastUpdated + '</span>' : '') +
    '</div></div></footer>';
}

function layout(opts, body) {
  var title = opts.title;
  var desc = opts.description;
  var canonical = config.siteOrigin + opts.path;
  var og = opts.og || config.siteOrigin + '/Assets/Logotipo_Principal.png';
  var jsonLd = opts.jsonLd ? '<script type="application/ld+json">' + JSON.stringify(opts.jsonLd) + '</script>' : '';
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
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">\n' +
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">\n' +
    jsonLd + '\n</head>\n<body class="ml-page" data-ml-page="' + esc(opts.page || '') + '">\n' +
    s35Nav() + '\n' +
    '<div class="ml-subnav"><div class="ml-subnav-inner"><nav class="ml-subnav-links">' + navLinks(opts.path) + '</nav>' +
    '<a class="ml-subnav-back" href="/">← S-35</a></div></div>\n' +
    body + '\n' +
    mlFooter() + '\n' +
    '<script src="/i18n.js"></script>\n<script src="/script.js"></script>\n<script src="/materialab/materialab.js"></script>\n' +
    '</body>\n</html>\n';
}

function legend() {
  return '<ul class="ml-legend">' +
    Object.keys(PROVENANCE_LABEL).map(function (k) {
      var p = PROVENANCE_LABEL[k];
      return '<li><span class="ml-prov">' + p.short + '</span> ' + esc(p.en) + '</li>';
    }).join('') +
    '</ul>';
}

function materialRows(withAccordion) {
  return archive.materials.map(function (m) {
    var cat = CATEGORIES[m.category];
    var clickable = m.status === 'documented';
    var href = clickable ? '/materialab/materials/' + m.slug : '';
    var origin = m.origin && m.origin.value ? m.origin.value : '—';
    var photo = m.images && m.images.macro && m.images.macro[0] ? m.images.macro[0].id : '';
    var inner = '<td>' + esc(m.code) + '</td>' +
      '<td><span class="ml-name">' + esc(m.name.es.toUpperCase()) + '</span></td>' +
      '<td class="ml-name-en">' + esc(m.name.en) + '</td>' +
      '<td>' + esc(m.classLabel || (cat ? cat.singular.es : m.category)) + '</td>' +
      '<td>' + esc(origin) + '</td>' +
      '<td class="ml-status">' + esc(STATUS[m.status] || m.status) + '</td>';
    var rowClass = 'ml-row' + (clickable ? '' : ' ml-row-disabled');
    var row = '<tr class="' + rowClass + '" data-photo="' + photo + '" data-status="' + m.status + '" tabindex="0"' +
      (clickable ? '' : ' aria-disabled="true"') + '>' +
      (clickable
        ? '<td><a href="' + href + '">' + esc(m.code) + '</a></td>' +
          '<td><a href="' + href + '"><span class="ml-name">' + esc(m.name.es.toUpperCase()) + '</span></a></td>' +
          '<td><a href="' + href + '" class="ml-name-en">' + esc(m.name.en) + '</a></td>' +
          '<td><a href="' + href + '">' + esc(m.classLabel || '') + '</a></td>' +
          '<td><a href="' + href + '">' + esc(origin) + '</a></td>' +
          '<td><a href="' + href + '" class="ml-status">' + esc(STATUS[m.status]) + '</a></td>'
        : inner) +
      '</tr>';
    if (withAccordion && photo) {
      row += '<tr class="ml-accordion-body" hidden><td colspan="6">' + picture(photo, { alt: m.name.es, width: 1536, height: 1024, sizes: '100vw' }) + '</td></tr>';
    }
    return row;
  }).join('\n');
}

function photoBackdrop() {
  var slots = archive.materials.map(function (m, i) {
    var img = m.images && m.images.macro && m.images.macro[0];
    if (!img) return '';
    return '<div class="ml-photo-slot" data-photo="' + img.id + '">' +
      picture(img.id, { alt: '', width: img.width, height: img.height, sizes: '100vw', priority: i === 0 }) +
      '</div>';
  }).join('');
  return '<div class="ml-index-bg" aria-hidden="true">' + slots + '</div>';
}

function psdChart(material) {
  var g = material.granulometry;
  if (!g) return '<p class="ml-empty">PARTICLE SIZE DISTRIBUTION — NOT YET MEASURED</p>';
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
    ? 'PARTICLE SIZE DISTRIBUTION'
    : 'PARTICLE SIZE DISTRIBUTION — SAMPLE CURVE NOT YET MEASURED' + (g.specBand ? ' · DASHED ENVELOPE ASTM C33 FINE AGGREGATE (REF)' : '');
  return '<div class="ml-chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(caption) + '">' +
    '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#fff"/>' +
    grid +
    '<line x1="' + pL + '" y1="' + pT + '" x2="' + pL + '" y2="' + (H - pB) + '" stroke="#000" stroke-width="1"/>' +
    '<line x1="' + pL + '" y1="' + (H - pB) + '" x2="' + (W - pR) + '" y2="' + (H - pB) + '" stroke="#000" stroke-width="1"/>' +
    band + curve + markers +
    '<text x="' + (pL + innerW / 2) + '" y="' + (H - 4) + '" text-anchor="middle" fill="#737373" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">PARTICLE SIZE (mm) · LOG</text>' +
    '<text transform="translate(14 ' + (pT + innerH / 2) + ') rotate(-90)" text-anchor="middle" fill="#737373" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11">% PASSING</text>' +
    '</svg><p class="ml-label" style="margin-top:0.75rem">' + esc(caption) + '</p></div>';
}

function chemBlock(material) {
  if (!material.chemical || !material.chemical.length) return '';
  var rows = material.chemical.map(function (c) {
    var v = c.percent && c.percent.value;
    var width = '0%';
    if (typeof v === 'number') width = Math.min(100, v) + '%';
    else if (Array.isArray(v)) width = Math.min(100, v[1]) + '%';
    return '<div class="ml-chem-row"><div>' + esc(c.compound) + (c.formula ? '<div class="ml-label">' + esc(c.formula) + '</div>' : '') + '</div>' +
      '<div class="ml-chem-bar" style="grid-template-columns:' + width + ' 1fr"><span></span><i></i></div>' +
      '<div>' + fmtVal(c.percent) + ' ' + prov(c.percent) + '</div></div>';
  }).join('');
  var hero = '';
  var first = material.chemical[0];
  if (first && first.percent && first.percent.value !== null) {
    var hv = Array.isArray(first.percent.value) ? first.percent.value[0] + '–' + first.percent.value[1] : first.percent.value;
    var unit = first.percent.unit ? ' ' + first.percent.unit : '';
    hero = '<div class="ml-chem-hero"><strong>' + esc(String(hv) + unit) + '</strong>' +
      '<div>' + esc(first.formula || first.compound) + '</div><div class="ml-label">' + esc(first.compound) + ' · ' + (PROVENANCE_LABEL[first.percent.provenance] || {}).short + '</div></div>';
  }
  return '<div class="ml-grid" style="padding-left:0;padding-right:0;max-width:none"><div class="ml-chem" style="grid-column:1/8">' + rows + '</div>' + hero + '</div>';
}

function datasheet(material) {
  var rows = [];
  function add(label, point) {
    if (!point) return;
    rows.push('<tr><td>' + esc(label) + '</td><td>' + fmtVal(point) + '</td><td>' + prov(point) + '</td><td>' + methodCell(point) + '</td></tr>');
  }
  add('Origin', material.origin);
  var p = material.physical || {};
  add('Bulk density', p.bulkDensity);
  add('Specific gravity', p.specificGravity);
  add('Hardness (Mohs)', p.hardnessMohs);
  add('Water absorption', p.waterAbsorption);
  add('Porosity', p.porosity);
  add('Colour', p.color);
  add('Structure', p.structure);
  add('Maximum size', p.maxSize);
  add('Fineness modulus', p.finenessModulus);
  add('Grain range', p.grainRange);
  add('Whiteness', p.whiteness);
  add('Calcination temperature', p.calcinationTemp);
  add('Kiln temperature', p.kilnTemp);
  add('pH (saturated / fresh paste)', p.phSaturated || p.phFresh);
  add('Initial set', p.initialSet);
  add('Strength class', p.strengthClass);
  add('Water/cement ratio', p.waterCementRatio);
  (material.chemical || []).forEach(function (c) {
    add(c.compound, c.percent);
  });
  if (material.morphology) {
    add('Surface', material.morphology.surface);
    add('Geometry', material.morphology.geometry);
    add('Edge profile', material.morphology.edgeProfile);
  }
  return '<div class="ml-index-table-wrap"><p class="ml-scroll-hint">SCROLL FOR MORE →</p><table class="ml-table ml-datasheet"><thead><tr><th scope="col">PROPERTY</th><th scope="col">VALUE</th><th scope="col">PROV.</th><th scope="col">METHOD / SOURCE</th></tr></thead><tbody>' + rows.join('') + '</tbody></table></div>' + legend();
}

function pageHome() {
  var featured = archive.featuredResearch();
  var featMat = featured ? archive.bySlug(featured.materialSlug) : archive.documentedMaterials()[0];
  var featImg = featMat && featMat.images.macro[0];
  var steps = ['SOURCE', 'SAMPLE', 'CLASSIFY', 'MEASURE', 'TEST', 'FORMULATE', 'VALIDATE', 'DOCUMENT'];
  var chain = ['MINERAL', 'AGGREGATE', 'FORMULATION', 'MATERIAL', 'SURFACE', 'ARCHITECTURE'];
  var body = '<div hidden class="ml-banner ml-banner--warn" data-not-found>CODE NOT FOUND IN ARCHIVE — THIS RESEARCH MAY NOT BE PUBLISHED YET</div>' +
    '<section class="ml-hero"><div class="ml-grid">' +
    '<p class="ml-hero-kicker">S-35® MATERIAL TECHNOLOGY</p>' +
    '<h1 class="ml-hero-title">MATERIA<br>LAB</h1>' +
    '<div class="ml-hero-side"><p class="ml-hero-sub">Materials Research &amp; Development</p>' +
    '<p class="ml-hero-line">Estudiamos la materia antes de convertirla en material.</p>' +
    '<p class="ml-hero-desc">Una colección abierta de investigaciones sobre minerales, agregados, cementantes y materias primas desarrollada por S-35.</p></div>' +
    '<div class="ml-hero-plate"><span>MATERIAL RESEARCH DIVISION</span><span>S-35® — EST. ' + config.founded + '</span><span>' + config.hq.city + ', ' + config.hq.state + ', ' + config.hq.country + '</span><span>' + config.hq.latLabel + '  ' + config.hq.lonLabel + '</span></div>' +
    '</div></section>' +
    '<section class="ml-block"><div class="ml-grid"><h2>Understanding matter. Building better materials.</h2>' +
    '<div class="ml-prose"><p>Cada material empieza mucho antes de convertirse en un producto. Empieza en una partícula. Su composición química, mineralogía, granulometría, densidad, absorción, morfología y procedencia determinan gran parte de su comportamiento.</p>' +
    '<p>MateriaLab es el archivo de investigación de S-35 dedicado a estudiar estas variables, documentarlas y convertir ese conocimiento en mejores materiales.</p></div>' +
    '<p class="ml-close">Research informs formulation.<br>Formulation informs performance.</p></div></section>' +
    '<section class="ml-block ml-index-section" id="index">' + photoBackdrop() +
    '<div class="ml-grid"><h2 class="ml-h2">MATERIAL INDEX</h2>' +
    '<div class="ml-index-table-wrap"><p class="ml-scroll-hint">SCROLL FOR MORE →</p><table class="ml-table"><thead><tr><th scope="col">CODE</th><th scope="col">NAME</th><th scope="col">EN</th><th scope="col">CLASS</th><th scope="col">ORIGIN</th><th scope="col">STATUS</th></tr></thead><tbody>' +
    materialRows() + '</tbody></table></div></div></section>';
  if (featured && featMat) {
    body += '<section class="ml-block"><div class="ml-grid"><h2 class="ml-h2">FEATURED RESEARCH</h2>' +
      '<article class="ml-featured"><div class="ml-featured-visual">' +
      picture(featImg.id, { alt: featImg.alt, width: featImg.width, height: featImg.height, sizes: '(max-width: 1024px) 100vw, 60vw' }) +
      '</div><div class="ml-featured-meta"><p class="ml-label">' + esc(featured.code) + ' · ' + featured.date + ' · REV ' + pad2(featured.revision) + '</p>' +
      '<h3><a href="/materialab/materials/' + featMat.slug + '">' + esc(featured.title.es) + '</a></h3>' +
      '<p>' + esc(featured.summary.es) + '</p>' +
      '<p class="ml-label" style="margin-top:1.5rem"><a href="/materialab/materials/' + featMat.slug + '">OPEN RESEARCH FILE →</a></p>' +
      '</div></article></div></section>';
  }
  body += '<section class="ml-block"><div class="ml-grid"><h2 class="ml-h2">METHODOLOGY</h2>' +
    '<p class="ml-lede">MateriaLab utiliza una metodología progresiva para caracterizar materias primas antes de evaluar su incorporación a sistemas formulados.</p>' +
    '<div class="ml-steps">' + steps.map(function (s, i) {
      return '<div class="ml-step"><span class="ml-step-n">' + pad2(i + 1) + '</span><span class="ml-step-l">' + s + '</span></div>';
    }).join('') + '</div>' +
    '<p class="ml-close" style="margin-top:1.5rem"><a href="/materialab/methodology">FULL METHODOLOGY →</a></p></div></section>' +
    '<section class="ml-block"><div class="ml-grid"><h2 class="ml-h2">FROM MATTER TO MATERIAL</h2>' +
    '<p class="ml-chain">' + chain.map(function (c, i) { return esc(c) + (i < chain.length - 1 ? '<span>→</span>' : ''); }).join('') + '</p>' +
    '<p class="ml-close">Research is where every S-35 material begins.</p></div></section>' +
    '<section class="ml-block" id="research"><div class="ml-grid"><h2 class="ml-h2">RESEARCH INDEX</h2>' +
    researchTable() + '</div></section>';
  return layout({
    title: 'MateriaLab — Materials Research & Development | S-35',
    description: 'Archivo abierto de caracterización de materias primas de S-35. Agregados, cargas y cementantes documentados con procedencia.',
    path: '/materialab',
    page: 'home',
    og: featImg ? config.siteOrigin + MEDIA + '/' + featImg.id + '-og.webp' : undefined,
  }, body);
}

function researchTable() {
  var cats = archive.categoriesInUse();
  var filters = '<div class="ml-filters" data-filter-group="#ml-research-table"><button type="button" data-cat="ALL" aria-pressed="true">ALL</button>' +
    cats.map(function (c) {
      return '<button type="button" data-cat="' + c + '" aria-pressed="false">' + esc(CATEGORIES[c].en.toUpperCase()) + '</button>';
    }).join('') + '</div>';
  var rows = archive.researchFiles.map(function (r) {
    var href = '/materialab/materials/' + r.materialSlug;
    return '<tr data-cat="' + r.category + '"><td><a href="' + href + '">' + esc(r.code) + '</a></td><td><a href="' + href + '">' + esc(r.title.es) + '</a></td><td>' + esc(CATEGORIES[r.category].en) + '</td><td>' + esc(r.date) + '</td><td>' + pad2(r.revision) + '</td><td class="ml-status">' + esc(r.status.toUpperCase()) + '</td></tr>';
  }).join('');
  return filters + '<div class="ml-index-table-wrap"><p class="ml-scroll-hint">SCROLL FOR MORE →</p><table class="ml-table" id="ml-research-table"><thead><tr><th scope="col">CODE</th><th scope="col">TITLE</th><th scope="col">CATEGORY</th><th scope="col">DATE</th><th scope="col">REV</th><th scope="col">STATUS</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}

function pageMaterialsIndex() {
  var body = '<section class="ml-block ml-index-section" style="border-top:0;padding-top:3rem">' + photoBackdrop() +
    '<div class="ml-grid">' +
    '<p class="ml-label">MATERIAL INDEX</p><h1 class="ml-file-title" style="grid-column:1/-1;font-size:clamp(40px,8vw,96px)">Materials</h1>' +
    '<p class="ml-lede">' + pad2(stats.materialsDocumented) + ' MATERIALS DOCUMENTED. El archivo empieza pequeño y crece a la vista.</p>' +
    '<div class="ml-index-table-wrap"><p class="ml-scroll-hint">SCROLL FOR MORE →</p><table class="ml-table"><thead><tr><th scope="col">CODE</th><th scope="col">NAME</th><th scope="col">EN</th><th scope="col">CLASS</th><th scope="col">ORIGIN</th><th scope="col">STATUS</th></tr></thead><tbody>' +
    materialRows() + '</tbody></table></div></div></section>';
  return layout({
    title: 'Material Index — MateriaLab | S-35',
    description: 'Índice de materias primas documentadas e en estudio en MateriaLab, la división de investigación de materiales de S-35.',
    path: '/materialab/materials',
    page: 'materials',
  }, body);
}

function pageResearch() {
  var body = '<section class="ml-block" style="border-top:0;padding-top:3rem"><div class="ml-grid">' +
    '<p class="ml-label">RESEARCH INDEX</p><h1 class="ml-file-title" style="grid-column:1/-1;font-size:clamp(40px,8vw,96px)">Research</h1>' +
    '<p class="ml-lede">Investigaciones publicadas. Los filtros solo muestran categorías con al menos un documento.</p>' +
    researchTable() + '</div></section>';
  return layout({
    title: 'Research Index — MateriaLab | S-35',
    description: 'Índice de investigaciones de MateriaLab sobre agregados, cargas y cementantes.',
    path: '/materialab/research',
    page: 'research',
  }, body);
}

function pageAbout() {
  var body = '<article class="ml-block" style="border-top:0;padding-top:3rem"><div class="ml-grid">' +
    '<p class="ml-label">WHAT MATERIALAB IS — AND WHAT IT IS NOT</p>' +
    '<h1 class="ml-file-title" style="grid-column:1/-1;font-size:clamp(36px,7vw,84px)">Qué es MateriaLab — y qué no es</h1>' +
    '<div class="ml-prose" style="margin-top:2rem">' +
    '<h2 class="ml-h2">Qué es</h2>' +
    '<p>MateriaLab es un archivo abierto de caracterización de materias primas desarrollado por S-35. Publica lo que se observa y se mide sobre minerales, agregados, cementantes y cargas <em>antes</em> de convertirlos en un producto. El orden es deliberado: primero conocimiento, después autoridad, después marca, después producto.</p>' +
    '<h2 class="ml-h2">Qué no es</h2>' +
    '<p>MateriaLab no es un laboratorio acreditado. No es un organismo de certificación. No es una fuente de especificación de producto. Los datos de caracterización <strong>no constituyen especificación técnica ni garantía de desempeño</strong> de ningún producto S-35.</p>' +
    '<h2 class="ml-h2">Cómo se obtienen los datos</h2>' +
    '<p>Cada valor publicable lleva una etiqueta de procedencia. Si un número no tiene procedencia, el archivo no lo publica — el build falla.</p>' +
    '</div>' + legend() +
    '<div class="ml-prose" style="margin-top:2rem">' +
    '<p><span class="ml-prov">MEAS</span> — medido por S-35 sobre una muestra identificada, con fecha. <span class="ml-prov">REF</span> — tomado de bibliografía, norma o ficha de proveedor, siempre con fuente. <span class="ml-prov">OBS</span> — observación interna no instrumentada (vista, lupa, fotografía). <span class="ml-prov">HYP</span> — hipótesis de trabajo. <span class="ml-prov">WIP</span> — ensayo iniciado, sin conclusión; en la tabla se lee NOT YET MEASURED.</p>' +
    '<p>Las primeras fichas combinan macrofotografía real de S-35 con observaciones visuales y perfiles típicos de norma o de comercio, etiquetados REF. Donde el lote no se ensayó, el campo está vacío a propósito.</p>' +
    '<p>MateriaLab publica <em>qué se sabe sobre la materia prima</em>. No publica qué hace S-35 con ella: ni dosificaciones, ni curvas objetivo de producción, ni proveedores.</p>' +
    '</div></div></article>';
  return layout({
    title: 'What MateriaLab is — and what it is not | S-35',
    description: 'MateriaLab es un archivo abierto de caracterización de materias primas. No es un laboratorio acreditado ni una especificación de producto S-35.',
    path: '/materialab/about',
    page: 'about',
  }, body);
}

function pageMethodology() {
  var steps = [
    ['SOURCE', 'Se declara la región de origen. No se publica cantera ni proveedor.'],
    ['SAMPLE', 'Se recibe un lote físico, se identifica (ML-SMP) y se fotografía.'],
    ['CLASSIFY', 'Se asigna categoría (AGG, BND, FIL…) y código correlativo. El código no se reutiliza.'],
    ['MEASURE', 'Ensayos instrumentados, con norma o método y fecha. Si no hay ensayo, el campo queda vacío.'],
    ['TEST', 'Ensayos sobre una o más muestras (ML-EXP). Solo se listan experimentos que existen.'],
    ['FORMULATE', 'El conocimiento informa la formulación. La formulación no se publica aquí.'],
    ['VALIDATE', 'Revisión interna antes de pasar de IN STUDY a DOCUMENTED.'],
    ['DOCUMENT', 'Ficha pública con procedencia, revisión y disclaimer. El archivo se actualiza a la vista.'],
  ];
  var body = '<article class="ml-block" style="border-top:0;padding-top:3rem"><div class="ml-grid">' +
    '<p class="ml-label">METHODOLOGY</p>' +
    '<h1 class="ml-file-title" style="grid-column:1/-1;font-size:clamp(36px,7vw,84px)">Cómo se estudian los materiales</h1>' +
    '<p class="ml-lede">MateriaLab utiliza una metodología progresiva para caracterizar materias primas antes de evaluar su incorporación a sistemas formulados. No afirmamos acreditaciones, equipos ni normas que no hayamos ejecutado sobre la muestra publicada.</p>' +
    '<div class="ml-steps">' + steps.map(function (s, i) {
      return '<div class="ml-step"><span class="ml-step-n">' + pad2(i + 1) + '</span><span class="ml-step-l">' + s[0] + '</span></div>';
    }).join('') + '</div>' +
    '<div class="ml-prose" style="margin-top:2.5rem">' + steps.map(function (s, i) {
      return '<p><strong>' + pad2(i + 1) + ' ' + s[0] + '.</strong> ' + s[1] + '</p>';
    }).join('') +
    '<p>Si un ensayo se hizo en laboratorio externo, se nombra el laboratorio o se dice “laboratorio externo”. Nunca se omite para insinuar capacidad propia. En esta primera publicación no hay ensayos instrumentados de lote: hay fotografía real, observación y referencia normativa.</p>' +
    '</div></div></article>';
  return layout({
    title: 'Methodology — MateriaLab | S-35',
    description: 'Cómo MateriaLab caracteriza materias primas: origen, muestra, clasificación, medición, documentación. Sin acreditaciones no confirmadas.',
    path: '/materialab/methodology',
    page: 'methodology',
  }, body);
}

function pageMaterial(m) {
  var cat = CATEGORIES[m.category];
  var img = m.images.macro[0];
  var codeParts = m.code.split('-');
  var sample = archive.samples.filter(function (s) { return s.materialSlug === m.slug; })[0];
  var relatedR = (m.relatedResearch || []).map(function (slug) {
    return archive.researchFiles.filter(function (r) { return r.slug === slug; })[0];
  }).filter(Boolean);
  var relatedM = (m.relatedMaterials || []).map(archive.bySlug).filter(Boolean);
  var paras = m.summary.es.split(/\n\n/);
  var desc = (m.name.es + ' (' + m.name.en + '). ' + paras[0]).slice(0, 158);
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
  var body = '<div hidden class="ml-banner" data-packaging-banner>SCANNED FROM PACKAGING · ' + esc(m.code) + ' · WELCOME TO THE ARCHIVE</div>' +
    '<header class="ml-file-head"><div class="ml-grid">' +
    '<p class="ml-file-code">MATERIAL RESEARCH FILE / ' + esc(codeParts.join(' / ')) + '</p>' +
    '<h1 class="ml-file-title">' + esc(m.name.es) + '</h1>' +
    '<p class="ml-file-sub ml-label">' + esc(m.name.es.toUpperCase()) + ' / ' + esc(m.name.en) + (m.scientificName ? ' · ' + esc(m.scientificName) : '') + '<br>' + esc(m.classLabel || (cat && cat.singular.es) || '') + '</p>' +
    '<dl class="ml-meta-row">' +
    '<div><dt>ORIGIN</dt><dd>' + esc(m.origin.value || '—') + '</dd></div>' +
    '<div><dt>CLASS</dt><dd>' + esc(m.category) + ' · ' + esc(cat ? cat.en : '') + '</dd></div>' +
    '<div><dt>STATUS</dt><dd>' + esc(STATUS[m.status]) + '</dd></div>' +
    '<div><dt>REVISION</dt><dd>' + pad2(m.revision) + '</dd></div>' +
    '<div><dt>DATE</dt><dd>' + esc(m.updatedAt) + '</dd></div>' +
    '<div><dt>SAMPLE ID</dt><dd>' + esc(sample ? sample.id : '—') + '</dd></div>' +
    '</dl></div></header>' +
    '<figure class="ml-macro">' + picture(img.id, { alt: img.alt, width: img.width, height: img.height, priority: true, sizes: '100vw' }) +
    '<figcaption class="ml-scale-pending ml-label">SCALE 0—1—2—3—4—5 mm · PENDING CALIBRATION AGAINST THIS FRAME · MACROGRAPH IS REAL, SCALE IS NOT YET SURVEYED</figcaption></figure>' +
    '<section class="ml-block"><div class="ml-grid"><h2 class="ml-h2">Resumen</h2><div class="ml-prose">' +
    paras.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
    '</div></div></section>' +
    '<section class="ml-block"><div class="ml-grid"><h2 class="ml-h2">Datasheet</h2><div style="grid-column:1/-1">' + datasheet(m) + '</div></div></section>';
  if (m.granulometry) {
    body += '<section class="ml-block"><div class="ml-grid"><h2 class="ml-h2">Particle Analysis</h2>' +
    '<div style="grid-column:1/-1">' + psdChart(m) + '</div>' +
    '<dl class="ml-meta-row"><div><dt>D10</dt><dd>' + fmtVal(m.granulometry.d10) + ' ' + prov(m.granulometry.d10) + '</dd></div>' +
    '<div><dt>D50</dt><dd>' + fmtVal(m.granulometry.d50) + ' ' + prov(m.granulometry.d50) + '</dd></div>' +
    '<div><dt>D90</dt><dd>' + fmtVal(m.granulometry.d90) + ' ' + prov(m.granulometry.d90) + '</dd></div></dl>' +
    '</div></section>';
  }
  body += '<section class="ml-block"><div class="ml-grid"><h2 class="ml-h2">Chemical Composition</h2><div style="grid-column:1/-1">' + chemBlock(m) + '</div></div></section>' +
    '<section class="ml-block"><div class="ml-grid"><h2 class="ml-h2">Morphology</h2>' +
    '<div class="ml-micro-pending"><p class="ml-label">MICROGRAPHY</p><p>PENDING — SEM imaging not yet performed</p>' +
    (m.morphology ? '<p class="ml-prose" style="margin-top:1rem">' + esc((m.morphology.geometry && m.morphology.geometry.value) || '') + '. ' + esc((m.morphology.surface && m.morphology.surface.value) || '') + '</p>' : '') +
    '</div></div></section>';
  if (m.whyItMatters && m.whyItMatters.length) {
    body += '<section class="ml-block"><div class="ml-grid"><h2 class="ml-h2">Why It Matters</h2><ul class="ml-why">' +
      m.whyItMatters.map(function (w) {
        return '<li><span>' + esc(w.property) + '</span><span class="ml-dir">' + w.direction + '</span><span>' + esc(w.effect) + '</span></li>';
      }).join('') + '</ul></div></section>';
  }
  if (m.labNotes && m.labNotes.length) {
    body += '<section class="ml-block"><div class="ml-grid"><h2 class="ml-h2">Lab Notes</h2><div class="ml-prose ml-notes">' +
      m.labNotes.map(function (n) { return '<p><time datetime="' + n.date + '">' + n.date + '</time> — ' + esc(n.text.es) + '</p>'; }).join('') +
      '</div></div></section>';
  }
  var exps = archive.experiments.filter(function (e) {
    return sample && e.sampleIds && e.sampleIds.indexOf(sample.id) !== -1;
  });
  if (exps.length) {
    body += '<section class="ml-block"><div class="ml-grid"><h2 class="ml-h2">Experiment Log</h2><table class="ml-table"><thead><tr><th>ID</th><th>TITLE</th><th>DATE</th><th>STATUS</th></tr></thead><tbody>' +
      exps.map(function (e) { return '<tr><td>' + esc(e.id) + '</td><td>' + esc(e.title) + '</td><td>' + esc(e.date) + '</td><td>' + esc(e.status) + '</td></tr>'; }).join('') +
      '</tbody></table></div></section>';
  }
  body += '<section class="ml-block"><div class="ml-grid"><h2 class="ml-h2">Revision History</h2><div style="grid-column:1/-1"><table class="ml-table"><thead><tr><th scope="col">REV</th><th scope="col">DATE</th><th scope="col">CHANGE</th></tr></thead><tbody>' +
    m.revisionHistory.map(function (r) {
      return '<tr><td>' + pad2(r.rev) + '</td><td>' + esc(r.date) + '</td><td>' + esc(r.change) + '</td></tr>';
    }).join('') + '</tbody></table></div></div></section>';
  if (m.applicationHref) {
    body += '<section class="ml-block"><div class="ml-grid"><h2 class="ml-h2">Research Application</h2><p class="ml-prose">Esta caracterización informa sistemas de materiales S-35. <a href="' + esc(m.applicationHref) + '">' + esc(m.applicationLabel || 'S-35') + '</a></p></div></section>';
  }
  if (relatedR.length || relatedM.length) {
    body += '<section class="ml-block"><div class="ml-grid"><h2 class="ml-h2">Related Research</h2><div class="ml-prose">';
    relatedR.forEach(function (r) {
      body += '<p><a href="/materialab/materials/' + r.materialSlug + '">' + esc(r.code) + ' — ' + esc(r.title.es) + '</a></p>';
    });
    relatedM.forEach(function (rm) {
      if (rm.status === 'documented') {
        body += '<p><a href="/materialab/materials/' + rm.slug + '">' + esc(rm.code) + ' — ' + esc(rm.name.es) + '</a></p>';
      }
    });
    body += '</div></div></section>';
  }
  body += '<section class="ml-block"><div class="ml-grid"><div class="ml-actions"><button type="button" data-print>DOWNLOAD RESEARCH FILE / PDF</button></div>' +
    '<p class="ml-disclaimer">Los datos de caracterización de materias primas publicados en MateriaLab tienen fines informativos y de divulgación técnica. No constituyen especificación de producto, ficha técnica ni garantía de desempeño de ningún producto S-35.</p></div></section>';
  return layout({
    title: m.name.es + ' (' + m.name.en + ') — Caracterización de ' + (cat ? cat.singular.es.toLowerCase() : 'material') + ' | MateriaLab S-35',
    description: desc,
    path: '/materialab/materials/' + m.slug,
    page: 'material',
    og: config.siteOrigin + MEDIA + '/' + img.id + '-og.webp',
    jsonLd: jsonLd,
  }, body);
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
