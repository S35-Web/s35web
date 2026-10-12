/**
 * Lectura del Copiloto para modo agent (solo consultas).
 * Mismas tools que executeCopilotTool en pos-module.js.
 * Ventas vivas e inventario: Mongo panel_state.
 * Producto terminado: s35_finished_stock (byCity), no el inventario de planta.
 * Clientes: colección clients (solo lectura, sin sembrar).
 * Historial: historical-sales-import.json + manual-sales-catchup.json.
 * Horario de cortes: America/Mazatlan (UTC-7), como el panel en Sinaloa.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { getDb } = require('./mongo');

const TZ = 'America/Mazatlan';
const HIST_FILE = path.join(
  __dirname,
  '../../public/colaboradores/data/historical-sales-import.json'
);
const HIST_URL = 'https://www.s-35.com.mx/colaboradores/data/historical-sales-import.json';
const CATCHUP_FILE = path.join(
  __dirname,
  '../../public/colaboradores/data/manual-sales-catchup.json'
);
const CATCHUP_URL = 'https://www.s-35.com.mx/colaboradores/data/manual-sales-catchup.json';

const PANEL_KEYS = ['s35_pos_sales', 's35_sale_edits_v1', 's35_plant_inventory', 's35_finished_stock'];

const CITIES = [
  { id: 'culiacan', label: 'Culiacán', short: 'CLN' },
  { id: 'mochis', label: 'Los Mochis', short: 'LMM' },
  { id: 'mazatlan', label: 'Mazatlán', short: 'MZT' }
];

let cachedHistorical = null;

function readItemsFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data && Array.isArray(data.items) ? data.items : [];
}

async function fetchItems(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  return data && Array.isArray(data.items) ? data.items : [];
}

function mergeRowsById(base, extra) {
  const byId = Object.create(null);
  const order = [];
  function put(row) {
    if (!row || !row.id) return;
    const id = String(row.id);
    if (!byId[id]) order.push(id);
    byId[id] = row;
  }
  (base || []).forEach(put);
  (extra || []).forEach(put);
  return order.map(function (id) { return byId[id]; });
}

function roundMoney(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function zonedYmd(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const get = function (type) {
    const row = parts.filter(function (p) { return p.type === type; })[0];
    return Number(row && row.value);
  };
  return { y: get('year'), m: get('month'), d: get('day') };
}

function utcFromZoned(y, m, d, hh, mm, ss) {
  return new Date(Date.UTC(y, m - 1, d, (hh || 0) + 7, mm || 0, ss || 0, 0));
}

function startOfZonedDay(date) {
  const p = zonedYmd(date);
  return utcFromZoned(p.y, p.m, p.d, 0, 0, 0);
}

function addZonedDays(date, n) {
  const p = zonedYmd(date);
  const shifted = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
  return utcFromZoned(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate(), 0, 0, 0);
}

function startOfZonedWeekMonday(date) {
  const start = startOfZonedDay(date);
  const p = zonedYmd(start);
  const dow = new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay();
  const delta = dow === 0 ? -6 : 1 - dow;
  return addZonedDays(start, delta);
}

function startOfZonedMonth(date) {
  const p = zonedYmd(date);
  return utcFromZoned(p.y, p.m, 1, 0, 0, 0);
}

function parseSaleTime(raw) {
  if (raw == null || raw === '') return NaN;
  if (raw instanceof Date) return raw.getTime();
  const s = String(raw).trim();
  if (!s) return NaN;
  if (/[zZ]$/.test(s) || /[+-]\d{2}:?\d{2}$/.test(s)) return Date.parse(s);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return Date.parse(s);
  if (!m[4]) return utcFromZoned(+m[1], +m[2], +m[3], 0, 0, 0).getTime();
  return utcFromZoned(+m[1], +m[2], +m[3], +m[4], +m[5], +(m[6] || 0)).getTime();
}

function normalizeCityId(raw) {
  const v = String(raw || '').toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (v === 'culiacan' || v === 'cln') return 'culiacan';
  if (v === 'mochis' || v === 'los mochis' || v === 'lmm') return 'mochis';
  if (v === 'mazatlan' || v === 'mzt') return 'mazatlan';
  if (CITIES.some(function (c) { return c.id === v; })) return v;
  return 'culiacan';
}

function cityLabel(id) {
  const key = normalizeCityId(id);
  const c = CITIES.filter(function (row) { return row.id === key; })[0];
  return c ? c.label : 'Culiacán';
}

function resolveSaleCity(sale) {
  if (!sale) return 'culiacan';
  if (sale.city) return normalizeCityId(sale.city);
  const meta = sale.meta || {};
  if (meta.city) return normalizeCityId(meta.city);
  const sid = meta.storeId;
  const sname = String(meta.storeName || '');
  if (sid === 35 || sid === '35' || sname === 'Mazatlán' || sname === 'Mazatlan') return 'mazatlan';
  if (sid === 36 || sid === '36' || sname === 'Mochis') return 'mochis';
  if (meta.source === 'cfdi-import' || meta.kind === 'invoice') return 'mochis';
  return 'culiacan';
}

function isHistoricalImportSale(row) {
  if (!row) return false;
  if (row.user === 'import-historico') return true;
  const src = row.meta && row.meta.source;
  return src === 'old-panel';
}

function isExcludedHistoricalStore(sale) {
  if (!sale || !sale.meta) return false;
  const name = sale.meta.storeName;
  if (name === 'Cotizador' || name === 'Mochis') return true;
  const sid = sale.meta.storeId;
  return sid === 32 || sid === '32' || sid === 36 || sid === '36';
}

function saleRecency(row) {
  if (!row || typeof row !== 'object') return 0;
  const stamp = row.editedAt || row.updatedAt;
  if (!stamp || stamp === row.createdAt) return 0;
  return Date.parse(stamp) || 0;
}

function applyEdit(sale, patch) {
  if (!sale || !sale.id) return sale;
  if (!patch) return sale;
  if (patch.deleted) return null;
  const patchTs = saleRecency(patch);
  const saleTs = saleRecency(sale);
  if (saleTs && patchTs && saleTs > patchTs) return sale;
  const next = Object.assign({}, sale, patch);
  if (patch.items) next.items = patch.items;
  if (patch.meta || sale.meta) next.meta = Object.assign({}, sale.meta || {}, patch.meta || {});
  if (patch.client) next.client = patch.client;
  if (patch.note && sale.note) next.note = Object.assign({}, sale.note, patch.note);
  else if (patch.note) next.note = patch.note;
  next.city = resolveSaleCity(next);
  return next;
}

function compactItem(it) {
  if (!it || typeof it !== 'object') return null;
  const product = it.product || it.slug || null;
  return {
    product: product,
    name: it.name || product || 'Producto',
    code: it.code || null,
    qty: Number(it.qty) || 0,
    price: Number(it.price) || 0,
    lineTotal: it.lineTotal != null ? Number(it.lineTotal) : null
  };
}

function customerName(sale) {
  if (!sale || sale.customer == null) return '';
  if (typeof sale.customer === 'object') return String(sale.customer.name || sale.customer.nombre || '').trim();
  return String(sale.customer).trim();
}

function compactClient(c) {
  if (!c || typeof c !== 'object') return null;
  const id = String(c.id || '').trim();
  const name = String(c.name || '').trim();
  if (!id && !name) return null;
  const type = String(c.type || c.kind || 'client').toLowerCase();
  return {
    id: id,
    name: name,
    company: String(c.company || '').trim(),
    phone: String(c.phone || '').trim(),
    email: String(c.email || '').trim(),
    rfc: String(c.rfc || '').trim(),
    type: type === 'distributor' || type === 'distribuidor' ? 'distributor' : 'client'
  };
}

function compactMeta(meta) {
  if (!meta || typeof meta !== 'object') return null;
  const cfdi = meta.cfdi && typeof meta.cfdi === 'object'
    ? { folio: meta.cfdi.folio || null, uuid: meta.cfdi.uuid || null }
    : null;
  return {
    source: meta.source || null,
    storeId: meta.storeId != null ? meta.storeId : null,
    storeName: meta.storeName || null,
    city: meta.city || null,
    kind: meta.kind || null,
    receiptId: meta.receiptId != null ? meta.receiptId : null,
    cfdi: cfdi
  };
}

function compactSale(row) {
  if (!row || !row.id) return null;
  if (row.deleted) return null;
  const items = (Array.isArray(row.items) ? row.items : []).map(compactItem).filter(Boolean);
  return {
    id: String(row.id),
    folio: row.folio || null,
    createdAt: row.createdAt || null,
    clientId: row.clientId || (row.client && row.client.id) || null,
    client: compactClient(row.client),
    customer: customerName(row),
    paymentMethod: row.paymentMethod || null,
    billing: row.billing || 'sin_facturar',
    items: items,
    total: Number(row.total) || 0,
    user: row.user || null,
    city: resolveSaleCity(row),
    meta: compactMeta(row.meta),
    editedAt: row.editedAt || null,
    updatedAt: row.updatedAt || null
  };
}

function extractItems(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.items)) return value.items;
  return [];
}

function extractEditMap(value) {
  if (!value || typeof value !== 'object') return {};
  if (value.byId && typeof value.byId === 'object') return value.byId;
  return {};
}

function extractMaterials(value) {
  const fromList = extractItems(value).filter(function (m) { return m && (m.id || m.name); });
  if (fromList.length) return fromList;
  const map = value && value.items && typeof value.items === 'object' && !Array.isArray(value.items)
    ? value.items
    : null;
  if (!map) return [];
  return Object.keys(map).map(function (id) {
    const row = map[id];
    if (!row || typeof row !== 'object') return null;
    if (!row.id && !row.name) return null;
    if (!row.id) row.id = id;
    return row;
  }).filter(Boolean);
}

function extractFinished(value) {
  const empty = { bySlug: {}, updatedAt: null };
  if (!value || typeof value !== 'object') return empty;
  const updatedAt = value.updatedAt || null;
  const items = value.items && typeof value.items === 'object' && !Array.isArray(value.items)
    ? value.items
    : null;
  if (!items) return { bySlug: {}, updatedAt: updatedAt };
  const bySlug = {};
  Object.keys(items).forEach(function (slug) {
    const row = items[slug];
    if (!row || typeof row !== 'object') return;
    const key = String(row.slug || slug);
    const byCity = { culiacan: 0, mochis: 0, mazatlan: 0 };
    const hasByCity = !!(row.byCity && typeof row.byCity === 'object');
    if (hasByCity) {
      CITIES.forEach(function (c) {
        byCity[c.id] = Math.max(0, Number(row.byCity[c.id]) || 0);
      });
    }
    let stock = Math.max(0, Number(row.stock) || 0);
    if (hasByCity) {
      const summed = CITIES.reduce(function (n, c) { return n + byCity[c.id]; }, 0);
      if (summed === 0 && stock > 0) byCity.culiacan = stock;
      stock = CITIES.reduce(function (n, c) { return n + byCity[c.id]; }, 0);
    } else {
      byCity.culiacan = stock;
    }
    bySlug[key] = {
      slug: key,
      name: row.name || String(key).replace(/-/g, ' '),
      unit: row.unit || 'Pza',
      stock: stock,
      minStock: Number(row.minStock) || 0,
      byCity: byCity
    };
  });
  return { bySlug: bySlug, updatedAt: updatedAt };
}

function parseYmd(raw) {
  const m = String(raw || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? (m[1] + '-' + m[2] + '-' + m[3]) : '';
}

function saleYmd(sale) {
  const raw = sale && sale.createdAt;
  const s = String(raw || '').trim();
  if (!s) return '';
  if (!/[zZ]$/.test(s) && !/[+-]\d{2}:?\d{2}$/.test(s)) {
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? (m[1] + '-' + m[2] + '-' + m[3]) : '';
  }
  const t = parseSaleTime(raw);
  if (!isFinite(t)) return '';
  const p = zonedYmd(new Date(t));
  if (!p.y || !p.m || !p.d) return '';
  return String(p.y) + '-' + String(p.m).padStart(2, '0') + '-' + String(p.d).padStart(2, '0');
}

function saleInYmdRange(sale, from, to) {
  if (!from && !to) return true;
  const ymd = saleYmd(sale);
  if (!ymd) return false;
  if (from && ymd < from) return false;
  if (to && ymd > to) return false;
  return true;
}

function saleOrigin(sale) {
  if (!sale) return 'viva';
  if (isHistoricalImportSale(sale)) return 'historico';
  if (String(sale.folio || '').indexOf('HIST-') === 0) return 'historico';
  if (String(sale.id || '').indexOf('sale-hist-') === 0) return 'historico';
  return 'viva';
}

function periodBounds(period, offset, now, sales) {
  now = now || new Date();
  const off = Number(offset);
  const o = isFinite(off) ? Math.trunc(off) : 0;
  if (period === 'historial') {
    let minY = null;
    let maxY = null;
    (sales || []).forEach(function (s) {
      const t = parseSaleTime(s.createdAt);
      if (!isFinite(t)) return;
      const y = zonedYmd(new Date(t)).y;
      if (minY == null || y < minY) minY = y;
      if (maxY == null || y > maxY) maxY = y;
    });
    const nowY = zonedYmd(now).y;
    if (minY == null) {
      minY = nowY;
      maxY = nowY;
    }
    return {
      start: utcFromZoned(minY, 1, 1, 0, 0, 0),
      end: utcFromZoned(maxY + 1, 1, 1, 0, 0, 0)
    };
  }
  if (period === 'week') {
    const start = addZonedDays(startOfZonedWeekMonday(now), o * 7);
    return { start: start, end: addZonedDays(start, 7) };
  }
  if (period === 'month') {
    const base = startOfZonedMonth(now);
    const p = zonedYmd(base);
    const startUtc = new Date(Date.UTC(p.y, p.m - 1 + o, 1));
    const start = utcFromZoned(startUtc.getUTCFullYear(), startUtc.getUTCMonth() + 1, 1, 0, 0, 0);
    const endUtc = new Date(Date.UTC(startUtc.getUTCFullYear(), startUtc.getUTCMonth() + 1, 1));
    const end = utcFromZoned(endUtc.getUTCFullYear(), endUtc.getUTCMonth() + 1, 1, 0, 0, 0);
    return { start: start, end: end };
  }
  if (period === 'year') {
    const y = zonedYmd(now).y + o;
    return { start: utcFromZoned(y, 1, 1, 0, 0, 0), end: utcFromZoned(y + 1, 1, 1, 0, 0, 0) };
  }
  const start = addZonedDays(startOfZonedDay(now), o);
  return { start: start, end: addZonedDays(start, 1) };
}

function formatPeriodLabel(period, start, end) {
  const dayFmt = new Intl.DateTimeFormat('es-MX', {
    timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric'
  });
  if (period === 'historial') {
    const y0 = zonedYmd(start).y;
    const y1 = zonedYmd(new Date(end.getTime() - 1)).y;
    if (y0 === y1) return 'Historial · ' + y0;
    return 'Historial · ' + y0 + ' – ' + y1;
  }
  if (period === 'day') {
    const today = startOfZonedDay(new Date());
    if (start.getTime() === today.getTime()) return 'Hoy · ' + dayFmt.format(start);
    if (start.getTime() === addZonedDays(today, -1).getTime()) return 'Ayer · ' + dayFmt.format(start);
    if (start.getTime() === addZonedDays(today, -2).getTime()) return 'Antier · ' + dayFmt.format(start);
    const longFmt = new Intl.DateTimeFormat('es-MX', {
      timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
    return longFmt.format(start);
  }
  if (period === 'week') {
    const last = new Date(end.getTime() - 1);
    const shortFmt = new Intl.DateTimeFormat('es-MX', { timeZone: TZ, day: 'numeric', month: 'short' });
    return shortFmt.format(start) + ' – ' + dayFmt.format(last);
  }
  if (period === 'month') {
    return new Intl.DateTimeFormat('es-MX', { timeZone: TZ, month: 'long', year: 'numeric' }).format(start);
  }
  return String(zonedYmd(start).y);
}

function salesInRange(list, start, end) {
  const a = start.getTime();
  const b = end.getTime();
  return (list || []).filter(function (s) {
    const t = parseSaleTime(s.createdAt);
    return isFinite(t) && t >= a && t < b;
  });
}

function filterSalesByCity(list, cityFilter) {
  if (!cityFilter || cityFilter === 'all') return list || [];
  const id = normalizeCityId(cityFilter);
  return (list || []).filter(function (s) { return (s.city || resolveSaleCity(s)) === id; });
}

function sumTotals(list) {
  return (list || []).reduce(function (n, s) { return n + (Number(s.total) || 0); }, 0);
}

function summarizeSalesSlice(list) {
  list = list || [];
  let facturado = 0;
  let sinFacturar = 0;
  const byCity = {};
  CITIES.forEach(function (c) {
    byCity[c.id] = { city: c.id, label: c.label, total: 0, tickets: 0 };
  });
  list.forEach(function (s) {
    const total = Number(s.total) || 0;
    if ((s.billing || 'sin_facturar') === 'facturado') facturado += total;
    else sinFacturar += total;
    const cid = s.city || resolveSaleCity(s);
    if (!byCity[cid]) byCity[cid] = { city: cid, label: cityLabel(cid), total: 0, tickets: 0 };
    byCity[cid].total += total;
    byCity[cid].tickets += 1;
  });
  return {
    total: roundMoney(sumTotals(list)),
    tickets: list.length,
    facturado: roundMoney(facturado),
    sinFacturar: roundMoney(sinFacturar),
    byCity: Object.keys(byCity).map(function (k) {
      const row = byCity[k];
      return {
        city: row.city,
        label: row.label,
        total: roundMoney(row.total),
        tickets: row.tickets
      };
    }).filter(function (r) { return r.tickets > 0 || r.total > 0; })
  };
}

function lineAmount(it) {
  if (!it) return 0;
  if (it.lineTotal != null && isFinite(Number(it.lineTotal))) return Number(it.lineTotal);
  return (Number(it.qty) || 0) * (Number(it.price) || 0);
}

function topProductsInSales(list, limit) {
  const map = {};
  (list || []).forEach(function (s) {
    (s.items || []).forEach(function (it) {
      const slug = it.product || it.name || 'otro';
      if (!map[slug]) map[slug] = { slug: slug, name: it.name || slug, amount: 0, units: 0 };
      map[slug].amount += lineAmount(it);
      map[slug].units += Number(it.qty) || 0;
    });
  });
  return Object.keys(map).map(function (k) { return map[k]; })
    .sort(function (a, b) { return b.amount - a.amount; })
    .slice(0, limit || 5)
    .map(function (r) {
      return {
        slug: r.slug,
        name: r.name,
        amount: roundMoney(r.amount),
        units: Math.round(r.units * 100) / 100
      };
    });
}

function isPlaceholderClientLabel(name) {
  const n = String(name || '').trim().toLowerCase();
  if (!n) return true;
  if (n === 'mostrador' || n === 'sin cliente') return true;
  if (n.indexOf('histórico') >= 0 || n.indexOf('historico') >= 0) return true;
  if (n === 'import' || n.indexOf('importado') >= 0) return true;
  return false;
}

function isDistributor(c) {
  return !!(c && c.type === 'distributor');
}

function clientDisplay(c) {
  if (!c) return 'Sin cliente';
  return c.company ? c.name + ' · ' + c.company : (c.name || 'Sin cliente');
}

function saleClientLabel(sale, byId) {
  if (!sale) return 'Mostrador';
  let c = sale.client || null;
  if ((!c || !c.name) && sale.clientId && byId) c = byId[sale.clientId] || c;
  if (c && c.name) {
    const base = clientDisplay(c);
    return isDistributor(c) ? base + ' · Distribuidor' : base;
  }
  return customerName(sale) || 'Mostrador';
}

function topClientsInSales(list, limit, byId) {
  const map = {};
  let skippedPlaceholderTickets = 0;
  let skippedPlaceholderAmount = 0;
  (list || []).forEach(function (s) {
    const name = saleClientLabel(s, byId) || 'Mostrador';
    if (isPlaceholderClientLabel(name) && !s.clientId && !(s.client && s.client.id)) {
      skippedPlaceholderTickets += 1;
      skippedPlaceholderAmount += Number(s.total) || 0;
      return;
    }
    const id = s.clientId || (s.client && s.client.id) || name.toLowerCase() || 'mostrador';
    if (!map[id]) {
      map[id] = {
        clientId: s.clientId || (s.client && s.client.id) || null,
        name: name,
        amount: 0,
        tickets: 0
      };
    }
    map[id].amount += Number(s.total) || 0;
    map[id].tickets += 1;
  });
  const items = Object.keys(map).map(function (k) { return map[k]; })
    .sort(function (a, b) { return b.amount - a.amount; })
    .slice(0, limit || 5)
    .map(function (r) {
      return {
        clientId: r.clientId,
        name: r.name,
        amount: roundMoney(r.amount),
        tickets: r.tickets
      };
    });
  return {
    items: items,
    meta: {
      excludedPlaceholderTickets: skippedPlaceholderTickets,
      excludedPlaceholderAmount: roundMoney(skippedPlaceholderAmount),
      identifiedClients: Object.keys(map).length
    }
  };
}

function cityQtyMap(src) {
  const out = { culiacan: 0, mochis: 0, mazatlan: 0 };
  if (src && typeof src === 'object') {
    CITIES.forEach(function (c) {
      out[c.id] = Math.max(0, Number(src[c.id]) || 0);
    });
  }
  return out;
}

function materialQuantities(m) {
  const hasByCity = !!(m && m.byCity && typeof m.byCity === 'object');
  const byCity = hasByCity ? cityQtyMap(m.byCity) : cityQtyMap(null);
  if (!hasByCity) byCity.culiacan = Math.max(0, Number(m && m.stock) || 0);
  let stock = CITIES.reduce(function (n, c) { return n + byCity[c.id]; }, 0);
  if (hasByCity && stock === 0) {
    const raw = Math.max(0, Number(m && m.stock) || 0);
    if (raw > 0) {
      byCity.culiacan = raw;
      stock = raw;
    }
  }
  const hasReservedByCity = !!(m && m.reservedByCity && typeof m.reservedByCity === 'object');
  const reservedByCity = hasReservedByCity ? cityQtyMap(m.reservedByCity) : cityQtyMap(null);
  if (!hasReservedByCity) reservedByCity.culiacan = Math.max(0, Number(m && m.reserved) || 0);
  let reserved = CITIES.reduce(function (n, c) { return n + reservedByCity[c.id]; }, 0);
  if (hasReservedByCity && reserved === 0) {
    const raw = Math.max(0, Number(m && m.reserved) || 0);
    if (raw > 0) {
      reservedByCity.culiacan = raw;
      reserved = raw;
    }
  }
  if (reserved > stock) reserved = stock;
  return {
    stock: stock,
    reserved: reserved,
    free: Math.max(0, stock - reserved),
    byCity: byCity,
    reservedByCity: reservedByCity
  };
}

function materialFree(m) {
  return materialQuantities(m).free;
}

function storeUpdatedAt(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value.updatedAt || null;
}

function wantsFullList(query) {
  const needle = normalizeSearchText(query);
  if (!needle) return true;
  return ['todo', 'todos', 'todas', 'inventario', 'existencia', 'existencias', 'stock', 'all', 'completo', 'actual'].indexOf(needle) >= 0;
}

function lowStockMaterials(materials, limit) {
  return (materials || []).filter(function (m) {
    const minStock = Number(m.minStock) || 0;
    return minStock > 0 && materialFree(m) < minStock;
  }).slice(0, limit || 12).map(function (m) {
    const name = m.name || m.id;
    const qty = materialQuantities(m);
    return {
      type: 'stock',
      id: m.id || null,
      name: name,
      free: qty.free,
      stock: qty.stock,
      minStock: Number(m.minStock) || 0,
      unit: m.unit || '',
      byCity: qty.byCity,
      open: m.id ? ('[[material:' + m.id + '|' + name + ']]') : null
    };
  });
}

function staleProducts(sales, limit) {
  const today = startOfZonedDay(new Date());
  const recentStart = addZonedDays(today, -6).getTime();
  const recentEnd = addZonedDays(today, 1).getTime();
  const prevStart = addZonedDays(today, -36).getTime();
  const by = {};
  (sales || []).forEach(function (s) {
    const t = parseSaleTime(s.createdAt);
    if (!isFinite(t)) return;
    (s.items || []).forEach(function (it) {
      const slug = it.product || it.name;
      if (!slug) return;
      if (!by[slug]) by[slug] = { slug: slug, name: it.name || slug, recent: 0, prev: 0 };
      if (t >= recentStart && t < recentEnd) by[slug].recent += lineAmount(it);
      else if (t >= prevStart && t < recentStart) by[slug].prev += lineAmount(it);
    });
  });
  return Object.keys(by).map(function (k) { return by[k]; })
    .filter(function (r) { return r.recent === 0 && r.prev > 0; })
    .sort(function (a, b) { return b.prev - a.prev; })
    .slice(0, limit || 8)
    .map(function (r) {
      return {
        type: 'stale',
        name: r.name,
        slug: r.slug,
        open: '[[product:' + r.slug + '|' + (r.name || r.slug) + ']]'
      };
    });
}

function normalizeSearchText(raw) {
  return String(raw || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_/]+/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function searchTokens(query) {
  const needle = normalizeSearchText(query);
  if (!needle || needle.length < 2) return [];
  return needle.split(' ').filter(function (t) { return t.length >= 2; });
}

function textMatchesTokens(hayRaw, tokens, needle) {
  const hay = normalizeSearchText(hayRaw);
  if (!hay) return false;
  if (needle && hay.indexOf(needle) >= 0) return true;
  if (!tokens.length) return false;
  for (let i = 0; i < tokens.length; i++) {
    if (hay.indexOf(tokens[i]) < 0) return false;
  }
  return true;
}

function saleReceiptId(sale) {
  if (!sale) return '';
  if (sale.meta && sale.meta.receiptId != null && sale.meta.receiptId !== '') {
    return String(sale.meta.receiptId);
  }
  const folio = String(sale.folio || '');
  const m = folio.match(/^HIST-R(\d+)$/i);
  if (m) return m[1];
  const id = String(sale.id || '');
  const m2 = id.match(/sale-hist-rcpt-(\d+)/i);
  return m2 ? m2[1] : '';
}

function saleItemsPreview(sale) {
  const items = (sale && sale.items) || [];
  if (!items.length) return 'Sin ítems';
  const first = String(items[0].name || 'Producto').trim() || 'Producto';
  if (items.length === 1) {
    const qty = Number(items[0].qty) || 0;
    return qty > 1 ? (qty + '× ' + first) : first;
  }
  return items.length + ' ítems · ' + first;
}

function normalizeHistoricalRow(row) {
  if (!row || !row.id || !Array.isArray(row.items) || !row.items.length) return null;
  if (isExcludedHistoricalStore(row)) return null;
  const base = {
    id: row.id,
    folio: row.folio || row.id,
    createdAt: row.createdAt,
    clientId: row.clientId || null,
    client: row.client || null,
    customer: row.customer || 'Histórico',
    paymentMethod: row.paymentMethod || 'transferencia',
    billing: row.billing || 'sin_facturar',
    items: row.items,
    total: Number(row.total) || 0,
    user: row.user || 'import-historico',
    meta: row.meta || { source: 'old-panel' }
  };
  if (row.city) base.city = row.city;
  base.city = resolveSaleCity(base);
  return compactSale(base);
}

async function loadHistoricalRows() {
  if (cachedHistorical) return cachedHistorical;
  const warnings = [];
  let histItems = [];
  let catchItems = [];
  try {
    histItems = fs.existsSync(HIST_FILE) ? readItemsFile(HIST_FILE) : await fetchItems(HIST_URL);
  } catch (err) {
    warnings.push('Historial de notas no disponible en este proceso; las ventas vivas sí.');
  }
  try {
    catchItems = fs.existsSync(CATCHUP_FILE) ? readItemsFile(CATCHUP_FILE) : await fetchItems(CATCHUP_URL);
  } catch (err) {
    warnings.push('Falta el catch-up de notas recientes.');
  }
  const rows = mergeRowsById(histItems, catchItems).map(normalizeHistoricalRow).filter(Boolean);
  cachedHistorical = {
    rows: rows,
    warning: warnings.length ? warnings.join(' ') : null
  };
  return cachedHistorical;
}

function finalizeList(rows, edits) {
  const out = [];
  (rows || []).forEach(function (row) {
    if (!row || !row.id || row.deleted) return;
    const patch = edits && edits[row.id];
    const next = patch ? applyEdit(row, patch) : row;
    if (!next || next.deleted) return;
    out.push(next.id === row.id && next === row ? row : compactSale(next));
  });
  return out.filter(Boolean);
}

function buildDataset(parts) {
  parts = parts || {};
  const edits = parts.edits || {};
  const warnings = (parts.warnings || []).slice();
  const historical = finalizeList(parts.historical || [], edits);
  const liveIn = extractItems(parts.liveSales);
  const live = [];
  liveIn.forEach(function (row) {
    if (!row || !row.id || row.deleted) return;
    const patch = edits[row.id];
    const editedHistorical = isHistoricalImportSale(row) && (row.editedAt || (patch && !patch.deleted));
    if (isHistoricalImportSale(row) && !editedHistorical) return;
    const next = patch ? applyEdit(row, patch) : row;
    if (!next || next.deleted) return;
    const compact = compactSale(next);
    if (compact) live.push(compact);
  });
  const byId = Object.create(null);
  const order = [];
  function put(sale) {
    if (!sale || !sale.id) return;
    if (!byId[sale.id]) order.push(sale.id);
    byId[sale.id] = sale;
  }
  historical.forEach(put);
  live.forEach(put);
  const sales = order.map(function (id) { return byId[id]; })
    .sort(function (a, b) { return (parseSaleTime(a.createdAt) || 0) - (parseSaleTime(b.createdAt) || 0); });
  const clients = (parts.clients || []).map(compactClient).filter(function (c) { return c && c.id && c.name; });
  const materials = extractMaterials(parts.materials);
  const finished = extractFinished(parts.finished);
  return {
    sales: sales,
    clients: clients,
    materials: materials,
    finished: finished.bySlug,
    finishedUpdatedAt: finished.updatedAt || storeUpdatedAt(parts.finished),
    materialsUpdatedAt: storeUpdatedAt(parts.materials),
    liveSalesUpdatedAt: storeUpdatedAt(parts.liveSales),
    warnings: warnings,
    counts: {
      tickets: sales.length,
      historicalTickets: historical.length,
      posTickets: live.length,
      clients: clients.length,
      materials: materials.length,
      finishedSkus: Object.keys(finished.bySlug).length
    }
  };
}

async function loadReadDataset() {
  let db;
  try {
    db = await getDb();
  } catch (err) {
    const e = new Error('El modo agent necesita la base del panel en el servidor.');
    e.code = 'NO_MONGO';
    throw e;
  }

  let stores = {};
  try {
    const docs = await db.collection('panel_state').find({ _id: { $in: PANEL_KEYS } }).toArray();
    docs.forEach(function (doc) { stores[doc._id] = doc.value; });
  } catch (err) {
    console.warn('[s35-chat] agent panel_state failed');
    const e = new Error('No se pudo leer el estado del panel.');
    e.code = 'NO_MONGO';
    throw e;
  }

  let clients = [];
  try {
    const doc = await db.collection('clients').findOne({ _id: 'catalog' });
    clients = doc && Array.isArray(doc.items) ? doc.items : [];
  } catch (err) {
    console.warn('[s35-chat] agent clients failed');
  }

  const historical = await loadHistoricalRows();
  const warnings = [];
  if (historical.warning) warnings.push(historical.warning);

  return buildDataset({
    historical: historical.rows,
    liveSales: stores.s35_pos_sales,
    edits: extractEditMap(stores.s35_sale_edits_v1),
    clients: clients,
    materials: stores.s35_plant_inventory,
    finished: stores.s35_finished_stock,
    warnings: warnings
  });
}

function createReadRuntime(dataset) {
  const data = dataset || { sales: [], clients: [], materials: [], warnings: [], counts: {} };
  const sales = data.sales || [];
  const clients = data.clients || [];
  const materials = data.materials || [];
  const finished = data.finished || {};
  const finishedUpdatedAt = data.finishedUpdatedAt || null;
  const materialsUpdatedAt = data.materialsUpdatedAt || null;
  const liveSalesUpdatedAt = data.liveSalesUpdatedAt || null;
  const byId = Object.create(null);
  clients.forEach(function (c) { if (c && c.id) byId[c.id] = c; });

  function salesFor(period, offset, city) {
    const p = ['day', 'week', 'month', 'year', 'historial'].indexOf(period) >= 0 ? period : 'day';
    const off = Number(offset);
    const o = p === 'historial' ? 0 : (isFinite(off) ? Math.trunc(off) : 0);
    const bounds = periodBounds(p, o, new Date(), sales);
    let list = salesInRange(sales, bounds.start, bounds.end);
    const cityId = city && city !== 'all' ? normalizeCityId(city) : 'all';
    list = filterSalesByCity(list, cityId);
    return {
      ok: true,
      period: p,
      offset: o,
      city: cityId,
      label: formatPeriodLabel(p, bounds.start, bounds.end),
      start: bounds.start.toISOString(),
      end: bounds.end.toISOString(),
      summary: summarizeSalesSlice(list),
      _list: list
    };
  }

  function publicSlice(row) {
    const copy = Object.assign({}, row);
    delete copy._list;
    return copy;
  }

  function snapshot() {
    const today = salesFor('day', 0, 'all');
    const yesterday = salesFor('day', -1, 'all');
    const antier = salesFor('day', -2, 'all');
    const month = salesFor('month', 0, 'all');
    const last7Days = [];
    for (let off = 0; off >= -6; off--) {
      const slice = salesFor('day', off, 'all');
      last7Days.push({
        offset: off,
        label: slice.label,
        date: slice.start.slice(0, 10),
        total: slice.summary.total,
        tickets: slice.summary.tickets
      });
    }
    const attention = lowStockMaterials(materials, 5).map(function (m) {
      return { type: 'stock', name: m.name, meta: 'libre ' + m.free + (m.unit ? ' ' + m.unit : '') };
    });
    const noteParts = [
      'Snapshot leído de Mongo en esta petición (America/Mazatlan).',
      'Producto terminado: get_finished_stock. Sin query lista el inventario actual. updatedAt ' + (finishedUpdatedAt || 'sin marca') + '.',
      'Materias primas: get_material_stock. Sin query lista el inventario actual. updatedAt ' + (materialsUpdatedAt || 'sin marca') + '.',
      'Ventas vivas en s35_pos_sales, updatedAt ' + (liveSalesUpdatedAt || 'sin marca') + '. El historial importado se suma a esas ventas.',
      '«Histórico importado» = data migrada sin nombre de cliente (NO es un cliente).',
      'Offsets: 0=hoy, -1=ayer, -2=antier. 0 piezas es cero, no falta de datos.'
    ];
    (data.warnings || []).forEach(function (w) { if (w) noteParts.push(w); });
    return {
      generatedAt: new Date().toISOString(),
      source: 'mongo:panel_state+historical-sales-import',
      timezone: TZ,
      cloud: {
        finishedUpdatedAt: finishedUpdatedAt,
        materialsUpdatedAt: materialsUpdatedAt,
        liveSalesUpdatedAt: liveSalesUpdatedAt
      },
      note: noteParts.join(' '),
      catalog: data.counts || {
        clients: clients.length,
        tickets: sales.length
      },
      today: today.summary,
      yesterday: yesterday.summary,
      dayBeforeYesterday: antier.summary,
      month: month.summary,
      last7Days: last7Days,
      deltaTodayVsYesterday: {
        amount: roundMoney(today.summary.total - yesterday.summary.total),
        tickets: today.summary.tickets - yesterday.summary.tickets
      },
      topProductsMonth: topProductsInSales(month._list, 5),
      topClientsMonth: topClientsInSales(month._list, 5, byId).items,
      attention: attention,
      cities: CITIES.map(function (c) { return { id: c.id, label: c.label, short: c.short }; })
    };
  }

  function searchSales(query, limit, range) {
    const needle = normalizeSearchText(query);
    if (!needle || needle.length < 2) return { rows: [], truncated: false };
    const tokens = searchTokens(query);
    const max = Math.min(25, Math.max(1, Number(limit) || 8));
    const from = range && range.from;
    const to = range && range.to;
    const out = [];
    for (let i = sales.length - 1; i >= 0; i--) {
      const s = sales[i];
      if (!s || !saleInYmdRange(s, from, to)) continue;
      const folio = normalizeSearchText(s.folio);
      const id = normalizeSearchText(s.id);
      const rid = normalizeSearchText(saleReceiptId(s));
      const clientLabel = normalizeSearchText(saleClientLabel(s, byId));
      const clientRfc = normalizeSearchText((s.client && s.client.rfc) || '');
      const cfdiFolio = normalizeSearchText((s.meta && s.meta.cfdi && s.meta.cfdi.folio) || '');
      const uuid = normalizeSearchText((s.meta && s.meta.cfdi && s.meta.cfdi.uuid) || '');
      const itemsHay = normalizeSearchText((s.items || []).map(function (it) {
        return [it.name, it.product, it.code].filter(Boolean).join(' ');
      }).join(' '));
      let score = 0;
      let matchedVia = null;
      if (folio === needle || id === needle || cfdiFolio === needle || rid === needle) {
        score = 100;
        matchedVia = 'folio';
      } else if (
        (folio && folio.indexOf(needle) === 0) ||
        (cfdiFolio && cfdiFolio.indexOf(needle) === 0) ||
        (rid && rid.indexOf(needle) === 0)
      ) {
        score = 85;
        matchedVia = 'folio';
      } else if (
        (folio && folio.indexOf(needle) >= 0) ||
        (id && id.indexOf(needle) >= 0) ||
        (cfdiFolio && cfdiFolio.indexOf(needle) >= 0) ||
        (rid && rid.indexOf(needle) >= 0)
      ) {
        score = 70;
        matchedVia = 'folio';
      } else if (itemsHay && textMatchesTokens(itemsHay, tokens, needle)) {
        score = 80;
        matchedVia = 'product';
      } else if (clientLabel && textMatchesTokens(clientLabel, tokens, needle)) {
        score = 55;
        matchedVia = 'client';
      } else if (clientRfc && clientRfc.indexOf(needle.replace(/\s+/g, '')) >= 0) {
        score = 52;
        matchedVia = 'rfc';
      } else if (uuid && uuid.indexOf(needle.replace(/\s+/g, '')) >= 0) {
        score = 50;
        matchedVia = 'uuid';
      } else if (String(s.total || '').indexOf(needle) >= 0) {
        score = 40;
        matchedVia = 'total';
      }
      if (score <= 0) continue;
      out.push({ sale: s, score: score, matchedVia: matchedVia });
    }
    out.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return (parseSaleTime(b.sale.createdAt) || 0) - (parseSaleTime(a.sale.createdAt) || 0);
    });
    return { rows: out.slice(0, max), truncated: out.length > max };
  }

  function finishedStockHits(query) {
    const rows = Object.keys(finished).map(function (k) { return finished[k]; });
    if (wantsFullList(query)) {
      rows.sort(function (a, b) {
        return String(a.name || a.slug).localeCompare(String(b.name || b.slug), 'es');
      });
      return { rows: rows.slice(0, 80), truncated: rows.length > 80, listed: true };
    }
    const needle = normalizeSearchText(query);
    if (!needle || needle.length < 2) return { rows: [], truncated: false, listed: false };
    const tokens = searchTokens(query);
    const hits = rows.filter(function (row) {
      const slug = normalizeSearchText(row.slug).replace(/-/g, ' ');
      const name = normalizeSearchText(row.name || '');
      const hay = (slug + ' ' + name).trim();
      if (slug && (slug === needle || slug.indexOf(needle) >= 0 || needle.indexOf(slug) >= 0)) return true;
      return textMatchesTokens(hay, tokens, needle);
    });
    hits.sort(function (a, b) {
      const as = normalizeSearchText(a.slug).replace(/-/g, ' ') === needle ? 1 : 0;
      const bs = normalizeSearchText(b.slug).replace(/-/g, ' ') === needle ? 1 : 0;
      return bs - as;
    });
    return { rows: hits.slice(0, 8), truncated: hits.length > 8, listed: false };
  }

  function focusCityId(raw) {
    if (!raw || raw === 'all') return 'all';
    return normalizeCityId(raw) || 'all';
  }

  function publicFinished(row, cityId) {
    const byCity = {
      culiacan: Number(row.byCity && row.byCity.culiacan) || 0,
      mochis: Number(row.byCity && row.byCity.mochis) || 0,
      mazatlan: Number(row.byCity && row.byCity.mazatlan) || 0
    };
    const cities = CITIES.map(function (c) {
      return { id: c.id, label: c.label, qty: byCity[c.id] };
    });
    const out = {
      slug: row.slug,
      name: row.name || row.slug,
      unit: row.unit || 'Pza',
      stock: Number(row.stock) || 0,
      byCity: byCity,
      cities: cities,
      open: row.slug ? ('[[product:' + row.slug + '|' + (row.name || row.slug) + ']]') : null,
      updatedAt: finishedUpdatedAt,
      source: 'mongo:s35_finished_stock',
      note: '0 es cero piezas en esa ciudad, no falta de datos.'
    };
    if (cityId && cityId !== 'all') {
      out.focusCity = cityId;
      out.qty = byCity[cityId] || 0;
    }
    return out;
  }

  function publicMaterial(m, cityId) {
    const qty = materialQuantities(m);
    const name = m.name || m.id;
    const out = {
      id: m.id || null,
      name: name,
      unit: m.unit || '',
      category: m.category || null,
      stock: qty.stock,
      reserved: qty.reserved,
      free: qty.free,
      minStock: Number(m.minStock) || 0,
      byCity: qty.byCity,
      reservedByCity: qty.reservedByCity,
      open: m.id ? ('[[material:' + m.id + '|' + name + ']]') : null,
      updatedAt: materialsUpdatedAt,
      source: 'mongo:s35_plant_inventory',
      note: 'stock es existencia, reserved es comprometido, free es disponible. byCity es existencia por ciudad. 0 es cero.'
    };
    if (cityId && cityId !== 'all') {
      out.focusCity = cityId;
      out.qty = qty.byCity[cityId] || 0;
      out.qtyFree = Math.max(0, (qty.byCity[cityId] || 0) - (qty.reservedByCity[cityId] || 0));
    }
    return out;
  }

  function materialStockHits(query) {
    const rows = (materials || []).slice();
    if (wantsFullList(query)) {
      rows.sort(function (a, b) {
        return String(a.name || a.id).localeCompare(String(b.name || b.id), 'es');
      });
      return { rows: rows.slice(0, 80), truncated: rows.length > 80, listed: true };
    }
    const needle = normalizeSearchText(query);
    if (!needle || needle.length < 2) return { rows: [], truncated: false, listed: false };
    const tokens = searchTokens(query);
    const hits = rows.filter(function (m) {
      const hay = [m.name, m.id, m.labSlug].filter(Boolean).join(' ');
      const idN = normalizeSearchText(m.id).replace(/-/g, ' ');
      if (idN && (idN === needle || idN.indexOf(needle) >= 0 || needle.indexOf(idN) >= 0)) return true;
      return textMatchesTokens(hay, tokens, needle);
    });
    hits.sort(function (a, b) {
      const as = normalizeSearchText(a.name) === needle ? 1 : 0;
      const bs = normalizeSearchText(b.name) === needle ? 1 : 0;
      return bs - as;
    });
    return { rows: hits.slice(0, 8), truncated: hits.length > 8, listed: false };
  }

  function execute(name, args) {
    args = args || {};
    if (name === 'navigate') {
      return { ok: false, skipped: true, error: 'Modo agent: sin navegación.' };
    }
    if (name === 'get_sales_summary') {
      const row = publicSlice(salesFor(args.period, args.offset, args.city));
      row.source = 'mongo:s35_pos_sales + historial de notas';
      row.liveSalesUpdatedAt = liveSalesUpdatedAt;
      row.historicalTickets = (data.counts && data.counts.historicalTickets) || 0;
      row.posTickets = (data.counts && data.counts.posTickets) || 0;
      return row;
    }
    if (name === 'compare_sales_periods') {
      const a = publicSlice(salesFor(args.period, args.offsetA, args.city));
      const b = publicSlice(salesFor(args.period, args.offsetB, args.city));
      const deltaAmount = roundMoney(a.summary.total - b.summary.total);
      const deltaTickets = a.summary.tickets - b.summary.tickets;
      const pct = b.summary.total > 0
        ? Math.round(((a.summary.total - b.summary.total) / b.summary.total) * 1000) / 10
        : (a.summary.total > 0 ? null : 0);
      return { ok: true, period: a.period, city: a.city, a: a, b: b, delta: { amount: deltaAmount, tickets: deltaTickets, pct: pct } };
    }
    if (name === 'search_sales') {
      const from = parseYmd(args.from);
      const to = parseYmd(args.to);
      const hasRange = !!(from || to);
      const limit = Math.min(25, Math.max(1, Number(args.limit) || (hasRange ? 25 : 8)));
      const found = searchSales(args.query, limit, { from: from, to: to });
      const hits = found.rows.map(function (hit) {
        const s = hit.sale;
        const items = (s.items || []).slice(0, 12).map(function (it) {
          const slug = it.product || null;
          const label = it.name || it.product || 'Producto';
          return {
            name: label,
            product: slug,
            code: it.code || null,
            qty: Number(it.qty) || 0,
            price: Number(it.price) || 0,
            lineTotal: roundMoney(lineAmount(it)),
            open: slug ? ('[[product:' + slug + '|' + label + ']]') : null
          };
        });
        const folio = s.folio || saleReceiptId(s) || s.id;
        return {
          id: s.id,
          folio: s.folio || null,
          receiptId: saleReceiptId(s) || null,
          total: Number(s.total) || 0,
          createdAt: s.createdAt,
          date: saleYmd(s) || null,
          origin: saleOrigin(s),
          client: saleClientLabel(s, byId),
          clientId: s.clientId || (s.client && s.client.id) || null,
          city: cityLabel(s.city),
          billing: s.billing || null,
          paymentMethod: s.paymentMethod || null,
          matchedVia: hit.matchedVia,
          items: items,
          itemsPreview: saleItemsPreview(s),
          open: s.id ? ('[[note:' + s.id + '|Ver nota ' + folio + ']]') : null
        };
      });
      const multi = hits.some(function (h) { return (h.items || []).length > 1; });
      return {
        ok: true,
        query: args.query,
        from: from || null,
        to: to || null,
        truncated: found.truncated,
        results: hits,
        note: multi
          ? 'total es el importe de toda la nota. El precio de cada producto está en items[].price y items[].lineTotal; no atribuyas total a un solo saco.'
          : null
      };
    }
    if (name === 'lookup_client') {
      const needle = String(args.query || '').toLowerCase().trim();
      if (!needle || needle.length < 2) return { ok: false, error: 'query corta' };
      const max = Math.min(10, Number(args.limit) || 5);
      const hits = clients.filter(function (c) {
        const blob = [c.name, c.company, c.phone, c.email, c.rfc].join(' ').toLowerCase();
        return blob.indexOf(needle) >= 0;
      }).slice(0, max).map(function (c) {
        const own = sales.filter(function (s) {
          if (c.id && s.clientId === c.id) return true;
          if (!s.clientId) {
            const n = customerName(s).toLowerCase();
            return n && n === String(c.name || '').trim().toLowerCase();
          }
          return false;
        });
        const total = own.reduce(function (n, s) { return n + (Number(s.total) || 0); }, 0);
        return {
          id: c.id,
          name: c.name,
          company: c.company || '',
          rfc: c.rfc || '',
          type: c.type === 'distributor' ? 'distributor' : 'client',
          phone: c.phone || '',
          tickets: own.length,
          total: roundMoney(total),
          open: c.id ? ('[[client:' + c.id + '|' + (c.name || 'Cliente') + ']]') : null
        };
      });
      return { ok: true, query: args.query, results: hits };
    }
    if (name === 'top_products' || name === 'top_clients') {
      const slice = salesFor(args.period || 'month', args.offset, args.city);
      const limit = Math.min(25, Math.max(1, Number(args.limit) || 10));
      if (name === 'top_products') {
        return {
          ok: true,
          period: slice.period,
          offset: slice.offset,
          city: slice.city,
          label: slice.label,
          items: topProductsInSales(slice._list, limit).map(function (it) {
            return Object.assign({}, it, {
              open: it.slug ? ('[[product:' + it.slug + '|' + (it.name || it.slug) + ']]') : null
            });
          })
        };
      }
      const ranked = topClientsInSales(slice._list, limit, byId);
      return {
        ok: true,
        period: slice.period,
        offset: slice.offset,
        city: slice.city,
        label: slice.label,
        items: ranked.items.map(function (it) {
          return Object.assign({}, it, {
            open: it.clientId ? ('[[client:' + it.clientId + '|' + (it.name || 'Cliente') + ']]') : null
          });
        }),
        note: ranked.meta.excludedPlaceholderTickets
          ? ('«Histórico importado» no es un cliente: son tickets migrados del sistema anterior sin nombre de cliente. ' +
            'Se excluyeron ' + ranked.meta.excludedPlaceholderTickets +
            ' de esos tickets ($' + ranked.meta.excludedPlaceholderAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 }) +
            '). El top lista solo clientes identificados.')
          : null,
        meta: ranked.meta
      };
    }
    if (name === 'stock_alerts') {
      const alerts = lowStockMaterials(materials, 12).concat(staleProducts(sales, 8));
      return {
        ok: true,
        alerts: alerts,
        note: 'Solo materia prima de planta. Para producto terminado usa get_finished_stock.'
      };
    }
    if (name === 'get_finished_stock') {
      const found = finishedStockHits(args.query);
      const cityId = focusCityId(args.city);
      const hits = found.rows.map(function (row) { return publicFinished(row, cityId); });
      if (!hits.length) {
        return {
          ok: true,
          query: args.query || '',
          city: cityId,
          updatedAt: finishedUpdatedAt,
          source: 'mongo:s35_finished_stock',
          results: [],
          note: 'No está en s35_finished_stock. No inventes 0.'
        };
      }
      return {
        ok: true,
        query: args.query || '',
        city: cityId,
        updatedAt: finishedUpdatedAt,
        source: 'mongo:s35_finished_stock',
        truncated: found.truncated,
        listed: found.listed,
        results: hits,
        note: 'byCity.culiacan, byCity.mochis y byCity.mazatlan son piezas en la nube. 0 es cero, no falta de datos.'
      };
    }
    if (name === 'get_material_stock') {
      const found = materialStockHits(args.query);
      const cityId = focusCityId(args.city);
      const hits = found.rows.map(function (row) { return publicMaterial(row, cityId); });
      if (!hits.length) {
        return {
          ok: true,
          query: args.query || '',
          city: cityId,
          updatedAt: materialsUpdatedAt,
          source: 'mongo:s35_plant_inventory',
          results: [],
          note: 'No está en s35_plant_inventory. No inventes 0.'
        };
      }
      return {
        ok: true,
        query: args.query || '',
        city: cityId,
        updatedAt: materialsUpdatedAt,
        source: 'mongo:s35_plant_inventory',
        truncated: found.truncated,
        listed: found.listed,
        results: hits,
        note: 'stock es existencia, reserved es comprometido, free es disponible. byCity es existencia por ciudad. 0 es cero.'
      };
    }
    return { ok: false, error: 'Tool desconocida: ' + name };
  }

  return { execute: execute, snapshot: snapshot };
}

module.exports = {
  loadReadDataset: loadReadDataset,
  createReadRuntime: createReadRuntime,
  buildDataset: buildDataset,
  loadHistoricalRows: loadHistoricalRows
};
