'use strict';

const fs = require('fs');
const path = require('path');
const taxonomy = require('./taxonomy');

const ITEMS_DIR = path.join(__dirname, 'items');

const products = fs
  .readdirSync(ITEMS_DIR)
  .filter(function (f) { return f.endsWith('.js'); })
  .reduce(function (acc, f) {
    const mod = require(path.join(ITEMS_DIR, f));
    return acc.concat(Array.isArray(mod) ? mod : [mod]);
  }, []);

function bySlug(slug) {
  return products.filter(function (p) { return p.slug === slug; })[0] || null;
}

// Los descontinuados se siguen construyendo para no perder el trabajo, pero
// quedan fuera del catálogo, del índice y del sitemap. Reactivar uno es quitar
// `legacy: true` de su archivo.
function published() {
  return products.filter(function (p) { return !p.legacy; });
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
  return {
    published: pub.length,
    legacy: legacy().length,
    verified: pub.filter(function (p) { return p.status === 'verified'; }).length,
    drafts: pub.filter(function (p) { return p.status !== 'verified'; }).length,
    families: byFamily().length,
  };
}

module.exports = {
  taxonomy: taxonomy,
  products: products,
  bySlug: bySlug,
  published: published,
  legacy: legacy,
  byFamily: byFamily,
  stats: stats,
};
