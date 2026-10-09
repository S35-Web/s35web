'use strict';

const fs = require('fs');
const path = require('path');
const taxonomy = require('./taxonomy');
const commerce = require('./commerce');

const ITEMS_DIR = path.join(__dirname, 'items');

const products = fs
  .readdirSync(ITEMS_DIR)
  .filter(function (f) { return f.endsWith('.js'); })
  .reduce(function (acc, f) {
    const mod = require(path.join(ITEMS_DIR, f));
    return acc.concat(Array.isArray(mod) ? mod : [mod]);
  }, [])
  // Borradores con otro esquema (sin slug) no entran al catálogo ni al build.
  .filter(function (p) { return p && p.slug; });

function bySlug(slug) {
  return products.filter(function (p) { return p.slug === slug; })[0] || null;
}

// Activos = no descontinuados (incluye borradores). Sirve para sync de precios,
// formulaciones y panel interno. El catálogo público usa `published()`.
function active() {
  return products.filter(function (p) { return !p.legacy; });
}

// Públicos = verificados y no descontinuados. Los `status: 'draft'` quedan en
// content/ pero fuera del índice, fichas públicas y sitemap. Publicar uno es
// cambiar su status a `verified` y correr `npm run build:products`.
function published() {
  return active().filter(function (p) { return p.status === 'verified'; });
}

function drafts() {
  return active().filter(function (p) { return p.status !== 'verified'; });
}

function legacy() {
  return products.filter(function (p) { return !!p.legacy; });
}

function byFamily() {
  return taxonomy.FAMILIES.map(function (family) {
    return {
      family: family,
      items: published()
        .filter(function (p) { return p.family === family.id; })
        .sort(function (a, b) { return String(a.code).localeCompare(String(b.code)); }),
    };
  }).filter(function (group) { return group.items.length > 0; });
}

function stats() {
  const pub = published();
  const dr = drafts();
  return {
    published: pub.length,
    active: active().length,
    legacy: legacy().length,
    verified: pub.length,
    drafts: dr.length,
    families: byFamily().length,
  };
}

module.exports = {
  taxonomy: taxonomy,
  products: products,
  commerce: commerce,
  bySlug: bySlug,
  active: active,
  published: published,
  drafts: drafts,
  legacy: legacy,
  byFamily: byFamily,
  stats: stats,
};
