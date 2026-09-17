/**
 * Lista de precios mayoristas S-35 por volumen de compra.
 *
 * Fuente oficial (lista reacomodada): precios YA en presentación de venta.
 * No convertir kg salvo que oldKg ≠ newKg / oldLt ≠ newLt.
 *
 * Presentación: sacos 25 kg (Pastablock 30 kg); líquidos 1 L / 18 L.
 *
 * Escalones (unidades totales en el ticket / carrito):
 *   1) 1–100  2) 100–500  3) 500–999  4) 1000–2000  5) 2000–3000  6) 3000–5000
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

function convertTiers(prices, oldSize, newSize) {
  if (!oldSize || !newSize || oldSize === newSize) {
    return prices.map(function (p) { return round2(p); });
  }
  return prices.map(function (p) {
    return round2((Number(p) / oldSize) * newSize);
  });
}

/**
 * Lista oficial. id = clave POS; recipeSlug = ficha FT cuando existe.
 * Variantes duplicadas (PLUS+ sueltos, adhesivos blanco sin ficha) no se listan:
 * el canónico es el FT-* / slug de formulación.
 */
const RAW = [
  // WAXTARD (25 kg) — familia distinta de BASECOAT
  { id: 'waxtard-blanco-perla', name: 'WAXTARD BLANCO PERLA', category: 'WAXTARD', oldKg: 25, newKg: 25, prices: [210, 189, 183.33, 165, 161.7, 158.46], recipeSlug: 'waxtard-blanco-perla', note: 'FT-PR-001' },
  { id: 'waxtard-blanco-absoluto', name: 'WAXTARD BLANCO INTENSO', category: 'WAXTARD', oldKg: 25, newKg: 25, prices: [230, 207, 200.79, 180.71, 177.1, 173.55], recipeSlug: 'waxtard-blanco-absoluto', note: 'FT-PR-002 · ficha Waxtard Blanco Absoluto' },
  { id: 'waxtard-gris', name: 'WAXTARD GRIS', category: 'WAXTARD', oldKg: 25, newKg: 25, prices: [205, 184.5, 178.97, 161.07, 157.85, 154.69], recipeSlug: 'waxtard-gris', note: 'FT-PR-003' },
  { id: 'waxtard-extra-anclaje', name: 'WAXTARD EXTRA ANCLAJE', category: 'WAXTARD', oldKg: 25, newKg: 25, prices: [335, 301.5, 292.46, 263.21, 257.95, 252.79], recipeSlug: 'waxtard-extra-anclaje', note: 'FT-PR-004' },

  // RECUBRIMIENTO PANELES (25 kg) — FT-PS-001 / FT-PS-002
  // NO usar precios Waxtard ni filas PLUS+ sueltas ($599 / $620).
  { id: 'basecoat-plus-blanco', name: 'BASECOAT BLANCO INTENSO', category: 'RECUBRIMIENTO PANELES', oldKg: 25, newKg: 25, prices: [360, 324, 314.28, 282.85, 277.19, 271.65], recipeSlug: 'basecoat-plus-blanco', note: 'FT-PS-001 · canónico (merge: basecoat-blanco-intenso-plus)' },
  { id: 'basecoat-plus-gris', name: 'BASECOAT GRIS', category: 'RECUBRIMIENTO PANELES', oldKg: 25, newKg: 25, prices: [340, 306, 296.82, 267.14, 261.8, 256.56], recipeSlug: 'basecoat-plus-gris', note: 'FT-PS-002 · canónico (merge: waxtard-basecoat-gris-plus)' },

  // PRODUCTOS ARQUITECTÓNICOS (25 kg)
  { id: 'cemento-plastico-concreto', name: 'CONCRETO APARENTE', category: 'PRODUCTOS ARQUITECTONICOS', oldKg: 25, newKg: 25, prices: [545, 490.5, 475.79, 428.21, 419.64, 411.25], recipeSlug: 'cemento-plastico-concreto', note: 'FT-MC-001' },

  // PRODUCTOS PROFESIONALES (25 kg)
  { id: 'styrobond-pro', name: 'STYROBOND PRO+', category: 'PRODUCTOS PROFESIONALES', oldKg: 25, newKg: 25, prices: [435.71, 392.14, 380.38, 342.34, 335.49, 328.78], recipeSlug: 'styrobond-pro', note: 'FT-PP-001' },
  { id: 'leveltec-pro', name: 'LEVELTEC PRO+', category: 'PRODUCTOS PROFESIONALES', oldKg: 25, newKg: 25, prices: [220, 198, 192.06, 172.85, 169.4, 166.01], recipeSlug: 'leveltec-pro', note: 'FT-PP-003' },

  // PEGAXPRESS
  { id: 'ultraforce', name: 'ADHESIVO ULTRAFORCE PRO+', category: 'PEGAXPRESS', oldKg: 25, newKg: 25, prices: [500, 450, 436.5, 392.85, 384.99, 377.29], recipeSlug: 'ultraforce', note: 'FT-AD-003' },
  { id: 'pegaxpress-psp', name: 'ADHESIVO PISO SOBRE PISO PRO+', category: 'PEGAXPRESS', oldKg: 25, newKg: 25, prices: [350, 315, 305.55, 275, 269.5, 264.11], recipeSlug: 'pegaxpress-psp', note: 'FT-AD-004 · canónico (sin variante blanco suelta)' },
  { id: 'porcelanico-universal', name: 'ADHESIVO PORCELANICO PRO+', category: 'PEGAXPRESS', oldKg: 25, newKg: 25, prices: [264.29, 211.43, 190.29, 152.23, 149.18, 146.2], recipeSlug: 'porcelanico-universal', note: 'FT-AD-001 · canónico (sin variante blanco suelta)' },
  { id: 'ceramico', name: 'ADHESIVO CERAMICO PRO+', category: 'PEGAXPRESS', oldKg: 25, newKg: 25, prices: [228.57, 182.86, 146.29, 131.66, 129.02, 126.44], recipeSlug: 'ceramico', note: 'FT-AD-002 · canónico (sin variante blanco suelta)' },
  { id: 'pegaxpress-block', name: 'PASTABLOCK+', category: 'PEGAXPRESS', oldKg: 30, newKg: 30, prices: [160, 144, 139.68, 125.71, 123.2, 120.73], recipeSlug: 'pegaxpress-block', note: 'FT-PR-006 · 30 kg (precio de lista, sin convertir desde 35)' },

  // LÍQUIDOS — 1 L canónico en ficha; 18 L solo lista (sin ficha POS aparte)
  { id: 'adhesivo-darawell', name: 'DARAWELL PREMIUM', category: 'LIQUIDOS', kind: 'liquido', oldKg: 1, newKg: 1, prices: [100, 90, 87.3, 78.57, 77, 75.46], recipeSlug: 'adhesivo-darawell', note: 'FT-PR-002 · 1 L' },
  { id: 'adhesivo-darawell-18', name: 'DARAWELL PREMIUM', category: 'LIQUIDOS', kind: 'liquido', oldKg: 18, newKg: 18, prices: [1200, 1080, 1047.6, 942.84, 923.98, 905.5], recipeSlug: null, note: 'FT-PR-002 · 18 L' },
  { id: 'sellador-premium-pintura', name: 'SELLADOR PREMIUM', category: 'LIQUIDOS', kind: 'liquido', oldKg: 1, newKg: 1, prices: [85, 76.5, 74.21, 66.78, 65.45, 64.14], recipeSlug: 'sellador-premium-pintura', note: 'FT-PR-003 · 1 L' },
  { id: 'sellador-premium-pintura-18', name: 'SELLADOR PREMIUM', category: 'LIQUIDOS', kind: 'liquido', oldKg: 18, newKg: 18, prices: [850, 765, 742.05, 667.85, 654.49, 641.4], recipeSlug: null, note: 'FT-PR-003 · 18 L' },
  { id: 'adhesivo-heavy-duty', name: 'ADHESIVO HEAVY DUTY', category: 'LIQUIDOS', kind: 'liquido', oldKg: 1, newKg: 1, prices: [155, 139.5, 135.32, 121.78, 119.35, 116.96], recipeSlug: 'adhesivo-heavy-duty', note: 'FT-PR-004 · 1 L' },
  { id: 'nanotech-hidrofobico', name: 'NANOTECH HIDROFOBICO', category: 'LIQUIDOS', kind: 'liquido', oldKg: 1, newKg: 1, prices: [230, 207, 200.79, 180.71, 177.1, 173.55], recipeSlug: 'nanotech-hidrofobico', note: 'FT-PR-005 · 1 L' },
  { id: 'nanotech-hidrofobico-18', name: 'NANOTECH HIDROFOBICO', category: 'LIQUIDOS', kind: 'liquido', oldKg: 18, newKg: 18, prices: [3315, 2983.5, 2894, 2604.6, 2552.5, 2501.45], recipeSlug: null, note: 'FT-PR-005 · 18 L' },
];

const items = RAW.map(function (row) {
  const size = row.newKg;
  const tiers = convertTiers(row.prices, row.oldKg, row.newKg);
  const kind = row.kind || 'seco';
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    kind: kind,
    presentationKg: size,
    oldKg: row.oldKg,
    recipeSlug: row.recipeSlug,
    note: row.note || '',
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

module.exports = {
  VOLUME_TIERS: VOLUME_TIERS,
  items: items,
  version: 3,
  presentationNote: 'Lista oficial: sacos 25 kg (Pastablock 30 kg); líquidos 1 L / 18 L. Precios por tramo sin conversión.',
};
