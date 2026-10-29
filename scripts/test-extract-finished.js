'use strict';

const assert = require('assert');
const { extractFinished } = require('../api/_lib/copilot-read');

const byCity = { culiacan: 4, mochis: 1, mazatlan: 0 };
const row = {
  slug: 'waxtard-blanco-perla',
  stock: 5,
  minStock: 0,
  unit: 'Pza',
  byCity: byCity
};

const cases = [
  ['items-map', { items: { 'waxtard-blanco-perla': row }, updatedAt: '2026-10-01T00:00:00.000Z' }],
  ['flat-map', {
    'Waxtard Blanco Perla': { stock: 5, unit: 'Pza', byCity: byCity },
    updatedAt: '2026-10-01T00:00:00.000Z'
  }],
  ['items-array', { items: [row] }],
  ['value-wrap', { value: { items: { 'waxtard-blanco-perla': row } }, updatedAt: '2026-10-02T00:00:00.000Z' }],
  ['string', JSON.stringify({ items: { 'waxtard-blanco-perla': row } })]
];

cases.forEach(function (pair) {
  const name = pair[0];
  const got = extractFinished(pair[1]);
  const hit = got.bySlug['waxtard-blanco-perla'];
  assert.ok(hit, name + ' no devolvió waxtard-blanco-perla');
  assert.strictEqual(hit.slug, 'waxtard-blanco-perla', name);
  assert.strictEqual(hit.byCity.culiacan, 4, name + ' culiacan');
  assert.strictEqual(hit.byCity.mochis, 1, name + ' mochis');
  assert.strictEqual(hit.byCity.mazatlan, 0, name + ' mazatlan');
  assert.ok(got.shape, name + ' sin forma');
});

const numeric = extractFinished({ items: { 'waxtard-blanco-perla': 3 } });
assert.strictEqual(numeric.bySlug['waxtard-blanco-perla'].byCity.culiacan, 3);

console.log('ok ' + cases.length + ' formas + numero');
