#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const catalog = require('../content/products');
const commerce = require('../content/products/commerce');
const research = require('../content/research');
const formulations = require('../content/panel/formulations');
const plantMaterials = require('../content/panel/plant-materials');
const priceList = require('../content/panel/price-list');
const batchDoses = require('../content/panel/batch-doses');

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
  out = out.replace(/:\s*(.)/g, function (_, c) {
    return ': ' + String(c).toLocaleUpperCase('es');
  });
  out = out.replace(/\((.)/g, function (_, c) {
    return '(' + String(c).toLocaleUpperCase('es');
  });
  out = out.replace(/\bplus\b/gi, 'Plus');
  out = out.replace(/\bhpmc\b/gi, 'HPMC');
  out = out.replace(/(\d)\s*l\b/g, '$1L');
  return out;
}

function productDisplayName(p) {
  if (p.variant && (p.family === 'adhesivos-pro' || p.family === 'microconcretos' || p.family === 'panel-system')) {
    return normalizeName(p.name) + ': ' + normalizeName(p.variant);
  }
  const raw = p.variant ? p.name + ' ' + p.variant : p.name;
  return normalizeName(raw);
}

const THUMB_BY_SLUG = {
  'waxtard-blanco-perla': '/Assets/productos_thumbs/WAXTARD-blanco-perla.jpg',
  'waxtard-blanco-absoluto': '/Assets/productos_thumbs/WAXTARD-BLANCO-ABSOLUTO.jpg',
  'waxtard-gris': '/Assets/productos_thumbs/WAXTARD-gris.jpg',
  'waxtard-extra-anclaje': '/Assets/productos_thumbs/WAXTARD-extra-anclaje.jpg',
  'cemento-plastico-concreto': '/Assets/productos_thumbs/cemento-plastico.jpg',
  'basecoat-plus-gris': '/Assets/productos_thumbs/basecoat.jpg',
  'basecoat-plus-blanco': '/Assets/productos_thumbs/basecoat-blanco.jpg',
  'styrobond-pro': '/Assets/productos_thumbs/styrobond.jpg',
  'leveltec-pro': '/Assets/productos_thumbs/LEVELTEC-pro.jpg',
  'pegaxpress-block': '/Assets/productos_thumbs/pastablock.jpg',
  'ceramico': '/Assets/productos_thumbs/ceramico.jpg',
  'porcelanico-universal': '/Assets/productos_thumbs/porcelanico.jpg',
  'pegaxpress-psp': '/Assets/productos_thumbs/piso-sobre-piso.jpg',
  'ultraforce': '/Assets/productos_thumbs/ultraforce.jpg',
  'nanotech-hidrofobico': '/Assets/productos_thumbs/nanotech-hidrofobico.jpg',
  'sellador-premium-pintura': '/Assets/productos_thumbs/sellador-premium-pintura.jpg',
  'adhesivo-darawell': '/Assets/productos_thumbs/adhesivo-darawell.jpg',
  'adhesivo-heavy-duty': '/Assets/productos_thumbs/adhesivo-heavy-duty.jpg',
};

function productImage(p) {
  if (THUMB_BY_SLUG[p.slug]) return THUMB_BY_SLUG[p.slug];
  const pack = p.figures && p.figures.pack;
  const src = pack && pack.src ? pack.src : '';
  if (!src) return '';
  const base = path.basename(src).replace(/\.[^.]+$/, '');
  const thumb = '/Assets/productos_thumbs/' + base + '.jpg';
  if (fs.existsSync(path.join(__dirname, '..', 'public', thumb.replace(/^\//, '')))) return thumb;
  return src;
}

function productImageAlt(p) {
  const pack = p.figures && p.figures.pack;
  if (pack && pack.alt) return pack.alt;
  return productDisplayName(p);
}

function productStrip(p) {
  const raw = p.strip;
  if (Array.isArray(raw)) {
    return raw.map(function (s) { return String(s || '').trim(); }).filter(Boolean);
  }
  if (typeof raw === 'string' && raw.trim()) return [raw.trim()];
  return [];
}

function productKpis(p) {
  return (p.kpis || []).slice(0, 4).map(function (k) {
    return {
      value: String((k && k.value) || '').trim(),
      label: String((k && k.label) || '').trim(),
    };
  }).filter(function (k) { return k.value; });
}

function productDescription(p) {
  const seo = (p.seo && p.seo.description) || '';
  if (seo) return String(seo).trim();
  const lead = String(p.lead || '').trim();
  if (!lead) return '';
  if (lead.length <= 220) return lead;
  const cut = lead.slice(0, 217).replace(/\s+\S*$/, '');
  return cut + '…';
}

const products = catalog.published().map(function (p) {
  return {
    slug: p.slug,
    name: productDisplayName(p),
    code: p.code || '',
    family: FAM[p.family] || p.family || '',
    status: p.status || '',
    line: p.line || '',
    packaging: p.packaging || '',
    description: productDescription(p),
    lead: String(p.lead || '').trim(),
    strip: productStrip(p),
    kpis: productKpis(p),
    image: productImage(p),
    imageAlt: productImageAlt(p),
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
  const product = byProd[f.product] || { slug: f.product, name: f.product, code: '', family: '', image: '', imageAlt: '' };
  const full = catalog.bySlug(f.product);
  const image = product.image || (full ? productImage(full) : '') || (THUMB_BY_SLUG[f.product] || '');
  const imageAlt = product.imageAlt || (full ? productImageAlt(full) : product.name);
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
    image: image,
    imageAlt: imageAlt,
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
    unitCost: Math.max(0, Math.round((Number(m.unitCost) || 0) * 100) / 100),
    stock: Math.max(0, Number(m.stock) || 0)
  };
});

const PREFERRED_PLANT = {
  'carbonato-de-calcio': 'marmolina-talco-200',
  'arena-silicea-graduada': 'arena-deshidratada',
  'arena-de-rio': 'arena-cribada-gruesa',
  'polimero-redispersable-vae': 'resina-rdp740h',
  'celulosa-hpmc': 'celulosa-hpmc',
  'cal': 'calidra',
  'yeso': 'yeso-sayro',
  'marmolina-fina': 'marmolina-fina',
  'cemento-gris': 'cemento-portland-gris',
  'cemento-blanco': 'cemento-portland-blanco',
};
const EXTRA_PLANT = {
  'basecoat-plus-gris': [{ plantId: 'fibra-de-polipropileno', role: 'Fibra' }],
  'basecoat-plus-blanco': [{ plantId: 'fibra-de-polipropileno', role: 'Fibra' }],
  'styrobond-pro': [{ plantId: 'fibra-de-polipropileno', role: 'Fibra' }],
};

const plantById = {};
inventory.forEach(function (m) { plantById[m.id] = m; });
const plantByLab = {};
inventory.forEach(function (m) {
  if (!m.labSlug) return;
  if (!plantByLab[m.labSlug]) plantByLab[m.labSlug] = [];
  plantByLab[m.labSlug].push(m.id);
});

function pickPlant(labSlug) {
  const ids = plantByLab[labSlug] || [];
  if (PREFERRED_PLANT[labSlug] && ids.indexOf(PREFERRED_PLANT[labSlug]) !== -1) {
    return PREFERRED_PLANT[labSlug];
  }
  return ids[0] || null;
}

recipes.forEach(function (r) {
  const dose = batchDoses[r.product] || null;
  if (dose) {
    const pack = Number(dose.packSizeKg) || 25;
    function mapItems(list) {
      return (list || []).map(function (it) {
        if (!plantById[it.plantId]) {
          throw new Error('batch-doses ' + r.product + ': plantId desconocido ' + it.plantId);
        }
        return {
          plantId: it.plantId,
          amount: Number(it.amount) || 0,
          unit: normalizeUnit(it.unit || 'Kg') || 'Kg',
          role: it.role || '',
        };
      });
    }
    function versionMeta(items, ver) {
      const totalKg = items.reduce(function (sum, it) {
        return sum + ((it.unit || 'Kg') === 'Kg' ? (Number(it.amount) || 0) : 0);
      }, 0);
      return {
        id: ver.id,
        name: ver.name || ver.id,
        label: ver.label || '',
        yieldMin: Number(ver.yieldMin != null ? ver.yieldMin : dose.yieldMin) || 0,
        yieldMax: Number(ver.yieldMax != null ? ver.yieldMax : dose.yieldMax) || 0,
        yieldTheoretical: pack > 0 ? Math.round((totalKg / pack) * 100) / 100 : 0,
        totalKg: Math.round(totalKg * 1000) / 1000,
        items: items,
      };
    }
    let versions = [];
    if (Array.isArray(dose.versions) && dose.versions.length) {
      versions = dose.versions.map(function (ver) {
        return versionMeta(mapItems(ver.items), ver);
      });
    } else {
      versions = [versionMeta(mapItems(dose.items), {
        id: 'v1',
        name: 'V1',
        label: 'Estándar',
        yieldMin: dose.yieldMin,
        yieldMax: dose.yieldMax,
      })];
    }
    const defaultId = dose.defaultVersionId || (versions[0] && versions[0].id) || 'v1';
    const active = versions.filter(function (v) { return v.id === defaultId; })[0] || versions[0];
    r.batchDose = {
      mode: dose.mode || 'plant-lot',
      packSizeKg: pack,
      packagingPlantId: dose.packagingPlantId || null,
      note: dose.note || '',
      defaultVersionId: defaultId,
      versions: versions,
      // Compat: campos del default para seeds antiguos / suggested
      yieldMin: active.yieldMin,
      yieldMax: active.yieldMax,
      yieldTheoretical: active.yieldTheoretical,
      totalKg: active.totalKg,
      items: active.items,
    };
  } else {
    r.batchDose = null;
  }

  const seen = {};
  r.suggested = [];
  if (r.batchDose) {
    (r.batchDose.versions || []).forEach(function (ver) {
      (ver.items || []).forEach(function (it) {
        if (seen[it.plantId]) return;
        seen[it.plantId] = true;
        r.suggested.push({
          plantId: it.plantId,
          unit: it.unit,
          role: it.role || '',
          amount: it.amount,
        });
      });
    });
  }
  (r.items || []).forEach(function (it) {
    if (!it.slug) return;
    const plantId = pickPlant(it.slug);
    if (!plantId || seen[plantId]) return;
    seen[plantId] = true;
    const mat = plantById[plantId];
    r.suggested.push({
      plantId: plantId,
      unit: (mat && mat.unit) || 'Kg',
      role: it.role || '',
    });
  });
  (EXTRA_PLANT[r.product] || []).forEach(function (extra) {
    if (!extra.plantId || seen[extra.plantId] || !plantById[extra.plantId]) return;
    seen[extra.plantId] = true;
    const mat = plantById[extra.plantId];
    r.suggested.push({
      plantId: extra.plantId,
      unit: (mat && mat.unit) || 'Kg',
      role: extra.role || '',
    });
  });
});

const out = 'window.S35_PANEL_DATA = ' + JSON.stringify({
  products: products,
  materials: materials,
  plantMaterials: inventory,
  recipes: recipes,
  usedIn: usedIn,
  presentations: commerce.PRESENTATIONS,
  priceList: {
    version: priceList.version,
    presentationNote: priceList.presentationNote,
    tiers: priceList.VOLUME_TIERS,
    items: priceList.items,
  },
}, null, 2) + ';\n';

const dest = path.join(__dirname, '..', 'public', 'colaboradores-data.js');
fs.writeFileSync(dest, out);
console.log(
  'colaboradores-data.js:',
  products.length, 'productos,',
  inventory.length, 'inventario planta,',
  materials.length, 'fichas lab,',
  recipes.length, 'recetas,',
  priceList.items.length, 'precios'
);
