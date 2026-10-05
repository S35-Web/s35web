#!/usr/bin/env node
/**
 * Valida alineación Precios ↔ Catálogo ↔ Formulaciones (Opción A).
 *
 * Nivel de severidad (documentado):
 *   ERROR  → desync de slugs / códigos / cubetas mal formadas / precios huérfanos.
 *            Falla `npm run build` (exit 1).
 *   WARN   → datos de negocio ambiguos (Leveltec 25 vs 35, 18 vs 19 L, etc.).
 *            Se reportan pero no fallan el build (hasta decisión comercial).
 */
'use strict';

const path = require('path');
const catalog = require(path.join(__dirname, '..', 'content', 'products'));
const commerce = require(path.join(__dirname, '..', 'content', 'products', 'commerce'));
const priceList = require(path.join(__dirname, '..', 'content', 'panel', 'price-list'));
const formulations = require(path.join(__dirname, '..', 'content', 'panel', 'formulations'));

const errors = [];
const warnings = [];

function uniq(arr) {
  const seen = {};
  return arr.filter(function (x) {
    if (seen[x]) return false;
    seen[x] = true;
    return true;
  });
}

function sorted(arr) {
  return arr.slice().sort();
}

function setDiff(a, b) {
  const B = {};
  b.forEach(function (x) { B[x] = true; });
  return a.filter(function (x) { return !B[x]; });
}

function parsePackagingSize(text) {
  const s = String(text || '');
  const kg = s.match(/(\d+(?:\.\d+)?)\s*kg\b/i);
  if (kg) return { size: Number(kg[1]), unit: 'kg' };
  const lit = s.match(/(\d+(?:\.\d+)?)\s*l(?:t|ts|itro|itros)?\b/i);
  if (lit) return { size: Number(lit[1]), unit: 'L' };
  return null;
}

function productTextBlob(p) {
  const bits = [p.packaging, p.description, p.lead];
  (p.strip || []).forEach(function (t) { bits.push(t); });
  (p.identification || []).forEach(function (row) {
    bits.push(row.label, row.value);
  });
  (p.kpis || []).forEach(function (row) {
    bits.push(row.value, row.label);
  });
  return bits.filter(Boolean).join(' · ');
}

const published = catalog.published();
const pubSlugs = sorted(published.map(function (p) { return p.slug; }));
const formSlugs = sorted(uniq(formulations.map(function (f) { return f.product; })));
const priceRecipeSlugs = sorted(uniq(
  priceList.items
    .map(function (it) { return it.recipeSlug; })
    .filter(Boolean)
));
const commerceProductSlugs = sorted(commerce.productSlugs());

// ── 1. Sets de slugs alineados ──────────────────────────────────────────
[
  ['catálogo published', pubSlugs, 'formulaciones', formSlugs],
  ['catálogo published', pubSlugs, 'price-list recipeSlug', priceRecipeSlugs],
  ['catálogo published', pubSlugs, 'commerce productSlug', commerceProductSlugs],
].forEach(function (triple) {
  const aLabel = triple[0];
  const a = triple[1];
  const bLabel = triple[2];
  const b = triple[3];
  setDiff(a, b).forEach(function (s) {
    errors.push(aLabel + ' tiene "' + s + '" ausente en ' + bLabel);
  });
  setDiff(b, a).forEach(function (s) {
    errors.push(bLabel + ' tiene "' + s + '" ausente en ' + aLabel);
  });
});

// ── 2. commerce ↔ price-list por id ─────────────────────────────────────
const priceById = {};
priceList.items.forEach(function (it) { priceById[it.id] = it; });

commerce.PRESENTATIONS.forEach(function (pres) {
  const it = priceById[pres.id];
  if (!it) {
    errors.push('commerce presentación "' + pres.id + '" sin fila en price-list');
    return;
  }
  if (Number(it.presentationKg) !== Number(pres.size)) {
    errors.push(
      'presentación "' + pres.id + '": commerce.size=' +
      pres.size + ' ≠ price-list.presentationKg=' + it.presentationKg
    );
  }
  if (it.code !== pres.code) {
    errors.push(
      'presentación "' + pres.id + '": commerce.code=' +
      pres.code + ' ≠ price-list.code=' + it.code
    );
  }
  const expectRecipe = pres.parentId ? null : pres.productSlug;
  if (it.recipeSlug !== expectRecipe) {
    errors.push(
      'presentación "' + pres.id + '": recipeSlug esperado ' +
      JSON.stringify(expectRecipe) + ', got ' + JSON.stringify(it.recipeSlug)
    );
  }
});

Object.keys(priceById).forEach(function (id) {
  if (!commerce.byId(id)) {
    errors.push('price-list id "' + id + '" sin presentación en commerce.js');
  }
});

// ── 3. Cubetas: recipeSlug null + FT-PC-* + parent ───────────────────────
const buckets = priceList.items.filter(function (it) { return it.recipeSlug == null; });
buckets.forEach(function (it) {
  const pres = commerce.byId(it.id);
  if (!/^FT-PC-\d{3}$/.test(it.code || '')) {
    errors.push('cubeta "' + it.id + '": código debe ser FT-PC-NNN (got ' + (it.code || 'vacío') + ')');
  }
  const parentId = (pres && pres.parentId) || String(it.id).replace(/-18$/, '');
  if (!parentId || parentId === it.id) {
    errors.push('cubeta "' + it.id + '": no se pudo inferir parent');
    return;
  }
  const parentPrice = priceById[parentId];
  const parentPub = catalog.bySlug(parentId);
  if (!parentPrice) {
    errors.push('cubeta "' + it.id + '": parent "' + parentId + '" no está en price-list');
  } else if (!parentPrice.recipeSlug) {
    errors.push('cubeta "' + it.id + '": parent "' + parentId + '" también tiene recipeSlug null');
  }
  if (!parentPub || parentPub.legacy) {
    errors.push('cubeta "' + it.id + '": parent "' + parentId + '" no está en catálogo published');
  }
  if (pres && pres.productSlug !== parentId && (!parentPrice || parentPrice.recipeSlug !== pres.productSlug)) {
    // parentId should match product slug of the liter SKU
    if (pres.productSlug && catalog.bySlug(pres.productSlug)) {
      // ok if productSlug is the published slug and parentId points to liter presentation
    }
  }
  if (pres && !commerce.byId(pres.parentId || parentId)) {
    errors.push('cubeta "' + it.id + '": parentId commerce "' + (pres.parentId || parentId) + '" inexistente');
  }
});

if (!buckets.length) {
  warnings.push('No hay SKUs con recipeSlug null (se esperaban cubetas FT-PC-*)');
}

// ── 4. Códigos FT únicos entre presentaciones sellable ───────────────────
const codeOwner = {};
commerce.PRESENTATIONS.forEach(function (pres) {
  if (!pres.code) {
    errors.push('presentación "' + pres.id + '" sin code');
    return;
  }
  if (codeOwner[pres.code] && codeOwner[pres.code] !== pres.id) {
    errors.push('código duplicado ' + pres.code + ': ' + codeOwner[pres.code] + ' y ' + pres.id);
  }
  codeOwner[pres.code] = pres.id;
});

// ── 5. Warnings: packaging ficha vs presentationKg ───────────────────────
published.forEach(function (p) {
  const primary = commerce.primaryForSlug(p.slug);
  if (!primary) return;
  const pack = parsePackagingSize(p.packaging);
  if (pack && pack.unit === primary.unit && pack.size !== primary.size) {
    warnings.push(
      p.slug + ': ficha packaging "' + p.packaging + '" (' + pack.size + ' ' + pack.unit +
      ') ≠ presentación de venta ' + primary.size + ' ' + primary.unit +
      ' [' + primary.id + '] — pendiente decisión de negocio'
    );
  }

  const blob = productTextBlob(p);
  if (primary.kind === 'liquido') {
    const mentions19 = /\b19\s*l\b/i.test(blob);
    const has18 = commerce.byProductSlug(p.slug).some(function (row) {
      return row.size === 18 && row.unit === 'L';
    });
    if (mentions19 && has18) {
      warnings.push(
        p.slug + ': copy de ficha menciona 19 L pero la lista/commerce vende cubeta 18 L — se mantiene 18 L hasta decisión'
      );
    }
    const hasBucket = commerce.byProductSlug(p.slug).some(function (row) { return !!row.parentId; });
    const mentionsBucket = /cubeta/i.test(blob) && /\b(18|19)\s*l\b/i.test(blob);
    if (mentionsBucket && !hasBucket) {
      warnings.push(
        p.slug + ': ficha menciona cubeta pero no hay presentación FT-PC en commerce/lista (no se añade sin decisión; p.ej. heavy-duty)'
      );
    }
  }
});

// Formulación water vs tamaño de venta (Leveltec, etc.)
formulations.forEach(function (f) {
  const primary = commerce.primaryForSlug(f.product);
  if (!primary || primary.unit !== 'kg') return;
  const water = String(f.water || '');
  const m = water.match(/saco\s+(\d+(?:\.\d+)?)\s*kg/i);
  if (m && Number(m[1]) !== Number(primary.size)) {
    warnings.push(
      f.product + ': formulations.water dice "saco ' + m[1] + ' kg" pero presentación de venta es ' +
      primary.size + ' kg — pendiente decisión de negocio'
    );
  }
});

// ── Report ──────────────────────────────────────────────────────────────
const bucketSummary = buckets.map(function (it) {
  const pres = commerce.byId(it.id);
  return it.id + ' (' + (it.code || '?') + ' → parent ' + ((pres && pres.parentId) || '?') + ')';
});

console.log('Product sync — published: ' + pubSlugs.length +
  ', formulations: ' + formSlugs.length +
  ', price SKUs: ' + priceList.items.length +
  ', commerce: ' + commerce.PRESENTATIONS.length);
console.log('Cubetas (recipeSlug null): ' + (bucketSummary.length ? bucketSummary.join(', ') : '(ninguna)'));

if (warnings.length) {
  console.warn('Product sync WARNINGS (' + warnings.length + '):\n' +
    warnings.map(function (w) { return '  ! ' + w; }).join('\n'));
}

if (errors.length) {
  console.error('Product sync FAILED (' + errors.length + '):\n' +
    errors.map(function (e) { return '  - ' + e; }).join('\n'));
  process.exit(1);
}

console.log('Product sync OK' + (warnings.length ? ' (con ' + warnings.length + ' warnings de negocio)' : '') + '.');
