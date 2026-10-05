/**
 * Presentaciones de venta canónicas (SKU POS) indexadas por producto de ficha.
 *
 * Fuente de producto: content/products (slug).
 * Esta capa solo define qué se vende (id, código FT, tamaño, etiqueta).
 * Los precios por tramo viven en content/panel/price-list.js y se cruzan por `id`.
 *
 * Cubetas: misma ficha (productSlug) que el Litro; recipeSlug en lista = null;
 * código FT-PC-* (C = Cubeta). No inventar SKUs ausentes de la lista oficial.
 */
'use strict';

/**
 * @typedef {Object} Presentation
 * @property {string} id            Clave POS / price-list
 * @property {string} productSlug   Slug de ficha + formulación
 * @property {string} code          Código FT-* de esta presentación
 * @property {'seco'|'liquido'} kind
 * @property {'kg'|'L'} unit
 * @property {number} size          Tamaño de venta (kg o L)
 * @property {string} label         Etiqueta UI (Saco / Litro / Cubeta)
 * @property {string} category      Categoría de lista
 * @property {string} listName      Nombre comercial POS
 * @property {string} [parentId]    Presentación padre (solo cubetas)
 * @property {boolean} [sellable]
 */

/** @type {Presentation[]} */
const PRESENTATIONS = [
  // WAXTARD
  { id: 'waxtard-blanco-perla', productSlug: 'waxtard-blanco-perla', code: 'FT-PR-001', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'WAXTARD', listName: 'WAXTARD BLANCO PERLA', sellable: true },
  { id: 'waxtard-blanco-absoluto', productSlug: 'waxtard-blanco-absoluto', code: 'FT-PR-002', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'WAXTARD', listName: 'WAXTARD BLANCO INTENSO', sellable: true },
  { id: 'waxtard-gris', productSlug: 'waxtard-gris', code: 'FT-PR-003', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'WAXTARD', listName: 'WAXTARD GRIS', sellable: true },
  { id: 'waxtard-extra-anclaje', productSlug: 'waxtard-extra-anclaje', code: 'FT-PR-004', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'WAXTARD', listName: 'WAXTARD EXTRA ANCLAJE', sellable: true },

  // RECUBRIMIENTO PANELES
  { id: 'basecoat-plus-blanco', productSlug: 'basecoat-plus-blanco', code: 'FT-PS-001', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'RECUBRIMIENTO PANELES', listName: 'BASECOAT BLANCO INTENSO', sellable: true },
  { id: 'basecoat-plus-gris', productSlug: 'basecoat-plus-gris', code: 'FT-PS-002', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'RECUBRIMIENTO PANELES', listName: 'BASECOAT GRIS', sellable: true },

  // ARQUITECTÓNICOS / PROFESIONALES
  { id: 'cemento-plastico-concreto', productSlug: 'cemento-plastico-concreto', code: 'FT-MC-001', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'PRODUCTOS ARQUITECTONICOS', listName: 'CONCRETO APARENTE', sellable: true },
  { id: 'styrobond-pro', productSlug: 'styrobond-pro', code: 'FT-PP-001', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'PRODUCTOS PROFESIONALES', listName: 'STYROBOND PRO+', sellable: true },
  // Lista oficial 25 kg; ficha/formulación aún dicen 35 kg → warning en validador (no cambiar sin negocio).
  { id: 'leveltec-pro', productSlug: 'leveltec-pro', code: 'FT-PP-003', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'PRODUCTOS PROFESIONALES', listName: 'LEVELTEC PRO+', sellable: true },

  // PEGAXPRESS
  { id: 'ultraforce', productSlug: 'ultraforce', code: 'FT-AD-003', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'PEGAXPRESS', listName: 'ADHESIVO ULTRAFORCE PRO+', sellable: true },
  { id: 'pegaxpress-psp', productSlug: 'pegaxpress-psp', code: 'FT-AD-004', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'PEGAXPRESS', listName: 'ADHESIVO PISO SOBRE PISO PRO+', sellable: true },
  { id: 'porcelanico-universal', productSlug: 'porcelanico-universal', code: 'FT-AD-001', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'PEGAXPRESS', listName: 'ADHESIVO PORCELANICO PRO+', sellable: true },
  { id: 'ceramico', productSlug: 'ceramico', code: 'FT-AD-002', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'PEGAXPRESS', listName: 'ADHESIVO CERAMICO PRO+', sellable: true },
  { id: 'pegaxpress-block', productSlug: 'pegaxpress-block', code: 'FT-PR-006', kind: 'seco', unit: 'kg', size: 30, label: 'Saco', category: 'PEGAXPRESS', listName: 'PASTABLOCK+', sellable: true },

  // LÍQUIDOS — Litro (FT-PR) / Cubeta (FT-PC). Cubetas se mantienen en 18 L como lista oficial.
  { id: 'adhesivo-darawell', productSlug: 'adhesivo-darawell', code: 'FT-PR-007', kind: 'liquido', unit: 'L', size: 1, label: 'Litro', category: 'LIQUIDOS', listName: 'Darawell adhesivo', sellable: true },
  { id: 'adhesivo-darawell-18', productSlug: 'adhesivo-darawell', code: 'FT-PC-007', kind: 'liquido', unit: 'L', size: 18, label: 'Cubeta', category: 'LIQUIDOS', listName: 'Darawell adhesivo', parentId: 'adhesivo-darawell', sellable: true },
  { id: 'sellador-premium-pintura', productSlug: 'sellador-premium-pintura', code: 'FT-PR-008', kind: 'liquido', unit: 'L', size: 1, label: 'Litro', category: 'LIQUIDOS', listName: 'Sellador premium adhesivo', sellable: true },
  { id: 'sellador-premium-pintura-18', productSlug: 'sellador-premium-pintura', code: 'FT-PC-008', kind: 'liquido', unit: 'L', size: 18, label: 'Cubeta', category: 'LIQUIDOS', listName: 'Sellador premium adhesivo', parentId: 'sellador-premium-pintura', sellable: true },
  { id: 'adhesivo-heavy-duty', productSlug: 'adhesivo-heavy-duty', code: 'FT-PR-009', kind: 'liquido', unit: 'L', size: 1, label: 'Litro', category: 'LIQUIDOS', listName: 'Heavy duty adhesivo', sellable: true },
  // Sin cubeta heavy-duty en lista oficial (no añadir FT-PC-009 sin decisión de negocio).
  { id: 'nanotech-hidrofobico', productSlug: 'nanotech-hidrofobico', code: 'FT-PR-005', kind: 'liquido', unit: 'L', size: 1, label: 'Litro', category: 'LIQUIDOS', listName: 'Nanotech sellador hidrofóbico', sellable: true },
  { id: 'nanotech-hidrofobico-18', productSlug: 'nanotech-hidrofobico', code: 'FT-PC-005', kind: 'liquido', unit: 'L', size: 18, label: 'Cubeta', category: 'LIQUIDOS', listName: 'Nanotech sellador hidrofóbico', parentId: 'nanotech-hidrofobico', sellable: true },

  // HISTÓRICO REACTIVADO / NUEVOS (borrador 2026-09)
  { id: 'textura-adhesile', productSlug: 'textura-adhesile', code: 'FT-PR-010', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'WAXTARD', listName: 'TEXTURA ADHESILE', sellable: true },
  { id: 'tirol-plaste', productSlug: 'tirol-plaste', code: 'FT-PR-011', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'WAXTARD', listName: 'TIROL PLASTE', sellable: true },
  { id: 'microconcreto-blanco-pulido', productSlug: 'microconcreto-blanco-pulido', code: 'FT-MC-002', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'PRODUCTOS ARQUITECTONICOS', listName: 'MICROCONCRETO BLANCO (PULIDO)', sellable: true },
  { id: 'mortercom', productSlug: 'mortercom', code: 'FT-PR-012', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'PRODUCTOS PROFESIONALES', listName: 'MORTERCOM', sellable: true },
  { id: 'cemencom', productSlug: 'cemencom', code: 'FT-PR-013', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'PRODUCTOS PROFESIONALES', listName: 'CEMENCOM', sellable: true },
  { id: 'aditivo-sp85', productSlug: 'aditivo-sp85', code: 'FT-PR-014', kind: 'seco', unit: 'kg', size: 1, label: 'Kg', category: 'LIQUIDOS', listName: 'ADITIVO SP85', sellable: true },
  { id: 'waxtard-thermo', productSlug: 'waxtard-thermo', code: 'FT-PR-015', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'WAXTARD', listName: 'WAXTARD THERMO', sellable: true },
  { id: 'cellbond-pro', productSlug: 'cellbond-pro', code: 'FT-PP-002', kind: 'seco', unit: 'kg', size: 25, label: 'Saco', category: 'PRODUCTOS PROFESIONALES', listName: 'CELLBOND PRO+', sellable: true },
];

function byId(id) {
  return PRESENTATIONS.filter(function (p) { return p.id === id; })[0] || null;
}

function byProductSlug(slug) {
  return PRESENTATIONS.filter(function (p) { return p.productSlug === slug; });
}

function primaryForSlug(slug) {
  const rows = byProductSlug(slug);
  return rows.filter(function (p) { return !p.parentId; })[0] || rows[0] || null;
}

function productSlugs() {
  const seen = {};
  return PRESENTATIONS.map(function (p) { return p.productSlug; }).filter(function (s) {
    if (seen[s]) return false;
    seen[s] = true;
    return true;
  });
}

module.exports = {
  PRESENTATIONS: PRESENTATIONS,
  byId: byId,
  byProductSlug: byProductSlug,
  primaryForSlug: primaryForSlug,
  productSlugs: productSlugs,
  version: 1,
  note: 'Presentaciones canónicas (Opción A). Precios en price-list; fichas en items/; URLs /productos/:slug sin cambio.',
};
