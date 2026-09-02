#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const catalog = require('../content/products');
const research = require('../content/research');
const formulations = require('../content/panel/formulations');

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

const products = catalog.published().map(function (p) {
  return {
    slug: p.slug,
    name: p.variant ? p.name + ' ' + p.variant : p.name,
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
    name: product.name,
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

const out = 'window.S35_PANEL_DATA = ' + JSON.stringify({
  products: products,
  materials: materials,
  recipes: recipes,
  usedIn: usedIn,
}, null, 2) + ';\n';

const dest = path.join(__dirname, '..', 'public', 'colaboradores-data.js');
fs.writeFileSync(dest, out);
console.log('colaboradores-data.js:', products.length, 'productos,', materials.length, 'materias primas,', recipes.length, 'recetas');
