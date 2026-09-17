/**
 * Lista de precios mayoristas S-35 por volumen de compra.
 *
 * Presentaciones canónicas (id, código, tamaño, categoría, listName):
 *   content/products/commerce.js
 *
 * Este archivo solo aporta precios por tramo (+ overrides menores de nombre/nota).
 * Fuente oficial: precios YA en presentación de venta.
 * No convertir kg salvo que oldKg ≠ size de la presentación.
 *
 * Escalones (unidades totales en el ticket / carrito):
 *   1) 1–100  2) 100–500  3) 500–999  4) 1000–2000  5) 2000–3000  6) 3000–5000
 */
'use strict';

const commerce = require('../products/commerce');

const VOLUME_TIERS = [
  { id: 't1', label: '1 a 100', min: 1, max: 99 },
  { id: 't2', label: '100 a 500', min: 100, max: 499 },
  { id: 't3', label: '500 a 999', min: 500, max: 999 },
  { id: 't4', label: '1000 a 2000', min: 1000, max: 1999 },
  { id: 't5', label: '2000 a 3000', min: 2000, max: 2999 },
  { id: 't6', label: '3000 a 5000', min: 3000, max: Infinity },
];

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function convertTiers(prices, oldSize, newSize) {
  if (!oldSize || !newSize || oldSize === newSize) {
    return prices.map(function (p) { return round2(p); });
  }
  return prices.map(function (p) {
    return round2((Number(p) / oldSize) * newSize);
  });
}

/**
 * Precios por id de presentación (commerce).
 * oldKg: tamaño histórico de la fila de precios (si ≠ presentation.size, se convierte).
 * name / note opcionales para overrides de lista.
 */
const PRICES_BY_ID = {
  'waxtard-blanco-perla': { oldKg: 25, prices: [210, 189, 183.33, 165, 161.7, 158.46], note: 'FT-PR-001' },
  'waxtard-blanco-absoluto': { oldKg: 25, prices: [230, 207, 200.79, 180.71, 177.1, 173.55], note: 'FT-PR-002 · ficha Waxtard Blanco Absoluto' },
  'waxtard-gris': { oldKg: 25, prices: [205, 184.5, 178.97, 161.07, 157.85, 154.69], note: 'FT-PR-003' },
  'waxtard-extra-anclaje': { oldKg: 25, prices: [335, 301.5, 292.46, 263.21, 257.95, 252.79], note: 'FT-PR-004' },

  'basecoat-plus-blanco': { oldKg: 25, prices: [360, 324, 314.28, 282.85, 277.19, 271.65], note: 'FT-PS-001 · canónico (merge: basecoat-blanco-intenso-plus)' },
  'basecoat-plus-gris': { oldKg: 25, prices: [340, 306, 296.82, 267.14, 261.8, 256.56], note: 'FT-PS-002 · canónico (merge: waxtard-basecoat-gris-plus)' },

  'cemento-plastico-concreto': { oldKg: 25, prices: [545, 490.5, 475.79, 428.21, 419.64, 411.25], note: 'FT-MC-001' },
  'styrobond-pro': { oldKg: 25, prices: [435.71, 392.14, 380.38, 342.34, 335.49, 328.78], note: 'FT-PP-001' },
  'leveltec-pro': { oldKg: 25, prices: [220, 198, 192.06, 172.85, 169.4, 166.01], note: 'FT-PP-003' },

  'ultraforce': { oldKg: 25, prices: [500, 450, 436.5, 392.85, 384.99, 377.29], note: 'FT-AD-003' },
  'pegaxpress-psp': { oldKg: 25, prices: [350, 315, 305.55, 275, 269.5, 264.11], note: 'FT-AD-004 · canónico (sin variante blanco suelta)' },
  'porcelanico-universal': { oldKg: 25, prices: [264.29, 211.43, 190.29, 152.23, 149.18, 146.2], note: 'FT-AD-001 · canónico (sin variante blanco suelta)' },
  'ceramico': { oldKg: 25, prices: [228.57, 182.86, 146.29, 131.66, 129.02, 126.44], note: 'FT-AD-002 · canónico (sin variante blanco suelta)' },
  'pegaxpress-block': { oldKg: 30, prices: [160, 144, 139.68, 125.71, 123.2, 120.73], note: 'FT-PR-006 · 30 kg (precio de lista, sin convertir desde 35)' },

  'adhesivo-darawell': { oldKg: 1, prices: [100, 90, 87.3, 78.57, 77, 75.46], note: 'FT-PR-007 · Litro' },
  'adhesivo-darawell-18': { oldKg: 18, prices: [1200, 1080, 1047.6, 942.84, 923.98, 905.5], note: 'FT-PC-007 · Cubeta' },
  'sellador-premium-pintura': { oldKg: 1, prices: [85, 76.5, 74.21, 66.78, 65.45, 64.14], note: 'FT-PR-008 · Litro' },
  'sellador-premium-pintura-18': { oldKg: 18, prices: [850, 765, 742.05, 667.85, 654.49, 641.4], note: 'FT-PC-008 · Cubeta' },
  'adhesivo-heavy-duty': { oldKg: 1, prices: [155, 139.5, 135.32, 121.78, 119.35, 116.96], note: 'FT-PR-009 · Litro' },
  'nanotech-hidrofobico': { oldKg: 1, prices: [230, 207, 200.79, 180.71, 177.1, 173.55], note: 'FT-PR-005 · Litro' },
  'nanotech-hidrofobico-18': { oldKg: 18, prices: [3315, 2983.5, 2894, 2604.6, 2552.5, 2501.45], note: 'FT-PC-005 · Cubeta' },
};

const items = commerce.PRESENTATIONS.map(function (pres) {
  const row = PRICES_BY_ID[pres.id];
  if (!row || !Array.isArray(row.prices) || row.prices.length !== 6) {
    throw new Error('price-list: faltan precios (6 tramos) para presentación ' + pres.id);
  }
  const size = Number(pres.size);
  const oldKg = row.oldKg != null ? Number(row.oldKg) : size;
  const tiers = convertTiers(row.prices, oldKg, size);
  const isBucket = !!pres.parentId || pres.label === 'Cubeta';
  return {
    id: pres.id,
    name: row.name || pres.listName,
    category: row.category || pres.category,
    kind: pres.kind,
    presentationKg: size,
    oldKg: oldKg,
    recipeSlug: isBucket ? null : pres.productSlug,
    code: pres.code,
    note: row.note || '',
    unitLabel: pres.kind === 'liquido' ? pres.label : '',
    productSlug: pres.productSlug,
    parentId: pres.parentId || null,
    tiers: tiers,
    pricesByTier: {
      t1: tiers[0],
      t2: tiers[1],
      t3: tiers[2],
      t4: tiers[3],
      t5: tiers[4],
      t6: tiers[5],
    },
  };
});

// IDs en PRICES_BY_ID sin presentación canónica = error duro en load.
Object.keys(PRICES_BY_ID).forEach(function (id) {
  if (!commerce.byId(id)) {
    throw new Error('price-list: precio huérfano sin presentación en commerce.js: ' + id);
  }
});

module.exports = {
  VOLUME_TIERS: VOLUME_TIERS,
  items: items,
  PRICES_BY_ID: PRICES_BY_ID,
  version: 3,
  presentationNote: 'Lista oficial vía commerce.js: sacos 25 kg (Pastablock 30 kg); líquidos Litro (FT-PR) / Cubeta 18 L (FT-PC). Precios por tramo sin conversión salvo oldKg ≠ size.',
};
