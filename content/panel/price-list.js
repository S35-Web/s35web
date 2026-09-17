/**
 * Lista de precios mayoristas S-35 por volumen de compra.
 *
 * Conversión a presentación nueva (mantener precio/kg):
 *   newPrice = round2((oldTierPrice / oldKg) * newKg)
 *
 * Presentación objetivo: 25 kg en todos los sacos, excepto Pastablock = 30 kg.
 *
 * Escalones (unidades totales en el ticket / carrito):
 *   1) 1–100  2) 100–500  3) 500–999  4) 1000–2000  5) 2000–3000  6) 3000–5000
 *
 * Ejemplos:
 *   Pastablock 35→30 tier1: (160/35)*30 = 137.14
 *   Estuco Base / Styrobond 35→25 tier1: (220/35)*25 = 157.14 · (610/35)*25 = 435.71
 */
'use strict';

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

function convertTiers(prices, oldKg, newKg) {
  return prices.map(function (p) {
    return round2((Number(p) / oldKg) * newKg);
  });
}

/**
 * Fuente: lista mayorista (presentación antigua) → precios convertidos.
 * id estable (slug de formulación cuando existe; si no, id de catálogo futuro).
 */
const RAW = [
  // PRODUCTO CLÁSICOS
  { id: 'waxtard-blanco-perla', name: 'WAXTARD BLANCO PERLA', category: 'PRODUCTO CLASICOS', oldKg: 25, newKg: 25, prices: [210, 189, 183.33, 165, 161.7, 158.46], recipeSlug: 'waxtard-blanco-perla' },
  { id: 'waxtard-blanco-absoluto', name: 'WAXTARD BLANCO INTENSO', category: 'PRODUCTO CLASICOS', oldKg: 25, newKg: 25, prices: [230, 207, 200.79, 180.71, 177.1, 173.55], recipeSlug: 'waxtard-blanco-absoluto', note: 'Mapeado a Waxtard Blanco Absoluto' },
  { id: 'waxtard-gris', name: 'WAXTARD GRIS', category: 'PRODUCTO CLASICOS', oldKg: 25, newKg: 25, prices: [205, 184.5, 178.97, 161.07, 157.85, 154.69], recipeSlug: 'waxtard-gris' },
  { id: 'waxtard-extra-anclaje', name: 'WAXTARD EXTRA ANCLAJE', category: 'PRODUCTO CLASICOS', oldKg: 25, newKg: 25, prices: [335, 301.5, 292.46, 263.21, 257.95, 252.79], recipeSlug: 'waxtard-extra-anclaje' },
  { id: 'estuco-base-s35', name: 'ESTUCO BASE S35', category: 'PRODUCTO CLASICOS', oldKg: 35, newKg: 25, prices: [220, 198, 188.1, 159.89, 156.69, 153.55], recipeSlug: null },
  { id: 'aplanado-base-pro', name: 'APLANADO BASE PRO+', category: 'PRODUCTO CLASICOS', oldKg: 35, newKg: 25, prices: [220, 198, 190.08, 161.57, 158.34, 155.17], recipeSlug: null },

  // RECUBRIMIENTO PANELES
  // Precios PLUS+ (antes filas sueltas basecoat-blanco-intenso-plus / waxtard-basecoat-gris-plus)
  // mergeados a las fichas FT-PS-001 / FT-PS-002 para no duplicar en POS.
  { id: 'basecoat-plus-blanco', name: 'BASECOAT BLANCO INTENSO PLUS+', category: 'RECUBRIMIENTO PANELES', oldKg: 25, newKg: 25, prices: [620, 558, 541.26, 487.13, 477.39, 467.84], recipeSlug: 'basecoat-plus-blanco', note: 'FT-PS-001 · precio de basecoat-blanco-intenso-plus' },
  { id: 'basecoat-plus-gris', name: 'BASECOAT GRIS PLUS+', category: 'RECUBRIMIENTO PANELES', oldKg: 25, newKg: 25, prices: [599, 539.1, 522.93, 470.63, 461.22, 452], recipeSlug: 'basecoat-plus-gris', note: 'FT-PS-002 · precio de waxtard-basecoat-gris-plus' },

  // PRODUCTOS ARQUITECTÓNICOS
  { id: 'microconcreto-pulido', name: 'MICROCONCRETO PULIDO', category: 'PRODUCTOS ARQUITECTONICOS', oldKg: 25, newKg: 25, prices: [360, 324, 314.28, 282.85, 277.19, 271.65], recipeSlug: null },
  { id: 'cemento-plastico-concreto', name: 'CONCRETO APARENTE', category: 'PRODUCTOS ARQUITECTONICOS', oldKg: 25, newKg: 25, prices: [545, 490.5, 475.79, 428.21, 419.64, 411.25], recipeSlug: 'cemento-plastico-concreto' },
  { id: 'coloriometry-series', name: 'COLORIOMETRY SERIES', category: 'PRODUCTOS ARQUITECTONICOS', oldKg: 10, newKg: 25, prices: [530, 477, 462.69, 416.42, 408.09, 399.93], recipeSlug: null },

  // PRODUCTOS PROFESIONALES
  { id: 'styrobond-pro', name: 'STYROBOND PRO+', category: 'PRODUCTOS PROFESIONALES', oldKg: 35, newKg: 25, prices: [610, 549, 532.53, 479.28, 469.69, 460.3], recipeSlug: 'styrobond-pro' },
  { id: 'cellbond-pro', name: 'CELLBOND PRO+', category: 'PRODUCTOS PROFESIONALES', oldKg: 35, newKg: 25, prices: [610, 549, 532.53, 479.28, 469.69, 460.3], recipeSlug: null },
  { id: 'ultraforce', name: 'ADHESIVO ULTRAFORCE PRO+', category: 'PRODUCTOS PROFESIONALES', oldKg: 35, newKg: 25, prices: [700, 630, 611.1, 549.99, 538.99, 528.21], recipeSlug: 'ultraforce' },
  { id: 'pegaxpress-psp', name: 'ADHESIVO PISO SOBRE PISO PRO+', category: 'PRODUCTOS PROFESIONALES', oldKg: 35, newKg: 25, prices: [490, 441, 427.77, 384.99, 377.29, 369.75], recipeSlug: 'pegaxpress-psp', note: 'Variante gris/pro como precio POS principal' },
  { id: 'pegaxpress-psp-blanco', name: 'ADHESIVO PISO SOBRE PISO BLANCO PRO+', category: 'PRODUCTOS PROFESIONALES', oldKg: 35, newKg: 25, prices: [490, 441, 427.77, 384.99, 377.29, 369.75], recipeSlug: null },
  { id: 'porcelanico-blanco', name: 'ADHESIVO PORCELANICO BLANCO PRO+', category: 'PRODUCTOS PROFESIONALES', oldKg: 35, newKg: 25, prices: [400, 340, 329.8, 263.84, 258.56, 253.39], recipeSlug: null },
  { id: 'porcelanico-universal', name: 'ADHESIVO PORCELANICO GRIS PRO+', category: 'PRODUCTOS PROFESIONALES', oldKg: 35, newKg: 25, prices: [370, 296, 266.4, 213.12, 208.86, 204.68], recipeSlug: 'porcelanico-universal', note: 'GRIS como precio primario del slug único' },
  { id: 'ceramico-blanco', name: 'ADHESIVO CERAMICO BLANCO PRO+', category: 'PRODUCTOS PROFESIONALES', oldKg: 35, newKg: 25, prices: [350, 280, 224, 201.6, 197.57, 193.62], recipeSlug: null },
  { id: 'ceramico', name: 'ADHESIVO CERAMICO GRIS PRO+', category: 'PRODUCTOS PROFESIONALES', oldKg: 35, newKg: 25, prices: [320, 256, 204.8, 184.32, 180.63, 177.02], recipeSlug: 'ceramico', note: 'GRIS como precio primario del slug único' },
  { id: 'leveltec-pro', name: 'LEVELTEC PRO+', category: 'PRODUCTOS PROFESIONALES', oldKg: 25, newKg: 25, prices: [220, 198, 192.06, 172.85, 169.4, 166.01], recipeSlug: 'leveltec-pro' },
  { id: 'pegaxpress-block', name: 'PASTABLOCK+', category: 'PRODUCTOS PROFESIONALES', oldKg: 35, newKg: 30, prices: [160, 144, 139.68, 125.71, 123.2, 120.73], recipeSlug: 'pegaxpress-block' },
];

const items = RAW.map(function (row) {
  const tiers = convertTiers(row.prices, row.oldKg, row.newKg);
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    presentationKg: row.newKg,
    oldKg: row.oldKg,
    recipeSlug: row.recipeSlug,
    note: row.note || '',
    tiers: tiers,
    // Alias por índice de escalón para editores / localStorage
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

module.exports = {
  VOLUME_TIERS: VOLUME_TIERS,
  items: items,
  version: 2,
  presentationNote: 'Todos los sacos a 25 kg excepto Pastablock (30 kg). Precios convertidos conservando $/kg.',
};
