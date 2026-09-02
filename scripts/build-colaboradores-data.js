#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const catalog = require('../content/products');
const research = require('../content/research');
const formulations = require('../content/panel/formulations');
const plantMaterials = require('../content/panel/plant-materials');

const FAM = {};
catalog.taxonomy.FAMILIES.forEach(function (f) { FAM[f.id] = f.name; });
const CAT = {
  ADM: 'Aditivos',
  AGG: 'Agregados',
  BND: 'Cementantes',
  FIL: 'Cargas',
  MIN: 'Minerales',
  PIG: 'Pigmentos',
  FIB: 'Fibras',
};

function normalizeUnit(unit) {
  const key = String(unit || '').trim().toLowerCase();
  if (!key) return '';
  if (key === 'kg') return 'Kg';
  if (key === 'l' || key === 'lt' || key === 'lts' || key === 'litro' || key === 'litros') return 'L';
  if (key === 'pza' || key === 'pzas' || key === 'pieza' || key === 'piezas') return 'Pza';
  return String(unit).trim();
}

function normalizeName(name) {
  const s = String(name || '').trim().replace(/\s+/g, ' ');
  if (!s) return s;
  let out = s.toLocaleLowerCase('es');
  out = out.charAt(0).toLocaleUpperCase('es') + out.slice(1);
  out = out.replace(/\((.)/g, function (_, c) {
    return '(' + String(c).toLocaleUpperCase('es');
  });
  out = out.replace(/(\d)\s*l\b/g, '$1L');
  return out;
}

const products = catalog.published().map(function (p) {
  const raw = p.variant ? p.name + ' ' + p.variant : p.name;
  return {
    slug: p.slug,
    name: normalizeName(raw),
    code: p.code || '',
    family: FAM[p.family] || p.family || '',
    status: p.status || '',
  };
}).sort(function (a, b) { return String(a.code).localeCompare(String(b.code)); });

const materials = research.materials.map(function (m) {
  return {
    slug: m.slug,
    name: (m.name && m.name.es) || m.name || m.slug,
    code: m.code || '',
    category: CAT[m.category] || m.category || '',
    categoryId: m.category || '',
    classLabel: (m.classLabel && m.classLabel.es) || '',
    status: m.status || '',
  };
});

const byMat = {};
materials.forEach(function (m) { byMat[m.slug] = m; });
const byProd = {};
products.forEach(function (p) { byProd[p.slug] = p; });

const recipes = formulations.map(function (f) {
  const product = byProd[f.product] || { slug: f.product, name: f.product, code: '', family: '' };
  const items = (f.items || []).map(function (it) {
    if (!it.slug) return { slug: null, name: '', code: '', category: '', role: it.role, note: it.note || '' };
    const mat = byMat[it.slug];
    if (!mat) throw new Error('Formulación ' + f.product + ': materia prima desconocida ' + it.slug);
    return {
      slug: mat.slug,
      name: mat.name,
      code: mat.code,
      category: mat.category,
      role: it.role,
      note: it.note || '',
    };
  });
  return {
    product: product.slug,
    name: normalizeName(product.name),
    code: product.code,
    family: product.family,
    kind: f.kind,
    water: f.water || '',
    status: f.status,
    note: f.note,
    items: items,
  };
});

const usedIn = {};
recipes.forEach(function (r) {
  r.items.forEach(function (it) {
    if (!it.slug) return;
    if (!usedIn[it.slug]) usedIn[it.slug] = [];
    usedIn[it.slug].push({ slug: r.product, name: r.name, code: r.code, role: it.role });
  });
});

const inventory = plantMaterials.map(function (m) {
  return {
    id: m.id,
    name: normalizeName(m.name),
    unit: normalizeUnit(m.unit),
    minStock: Number(m.minStock) || 0,
    category: m.category || '',
    labSlug: m.labSlug || null,
  };
});

const out = 'window.S35_PANEL_DATA = ' + JSON.stringify({
  products: products,
  materials: materials,
  plantMaterials: inventory,
  recipes: recipes,
  usedIn: usedIn,
}, null, 2) + ';\n';

const dest = path.join(__dirname, '..', 'public', 'colaboradores-data.js');
fs.writeFileSync(dest, out);
console.log('colaboradores-data.js:', products.length, 'productos,', inventory.length, 'inventario planta,', materials.length, 'fichas lab,', recipes.length, 'recetas');
