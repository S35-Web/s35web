#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { buildDataset, createReadRuntime } = require('../api/_lib/copilot-read');
const { stripSensitive } = require('../api/_lib/copilot-summaries');
const chat = require('../api/s35-chat');

const SECRET = 'SECRETO-NO-DEBE-SALIR';
const MONGO = 'mongodb://user:pass@cluster.example/db';

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL', msg);
    process.exit(1);
  }
}

function eq(actual, expected, msg) {
  if (actual !== expected) {
    console.error('FAIL', msg, 'got', actual, 'expected', expected);
    process.exit(1);
  }
}

function group(result, key) {
  const row = (result.items || []).filter(function (r) { return r.key === key; })[0];
  assert(row, 'falta grupo ' + key);
  return row;
}

const finished = JSON.stringify({
  value: {
    items: {
      'saco-a': {
        stock: 13,
        minStock: 1,
        unit: 'Pza',
        byCity: { culiacan: 10, mochis: 3, mazatlan: 0 }
      },
      'saco-b': {
        stock: 7,
        minStock: 0,
        byCity: { culiacan: 7 }
      }
    },
    updatedAt: '2026-10-12T12:00:00.000Z'
  }
});

const prices = JSON.stringify({
  'saco-a': { presentationKg: 20, tiers: [50, 40, 30, 20, 10, 5], distributorPrice: 45 },
  'saco-b': 11
});

const sales = [
  {
    id: 's1',
    folio: 'N-1',
    createdAt: '2026-10-01T18:00:00.000Z',
    clientId: 'c1',
    client: { id: 'c1', name: 'Ana' },
    paymentMethod: 'efectivo',
    city: 'culiacan',
    total: 100,
    user: MONGO,
    items: [{ product: 'a', name: 'Producto A', qty: 2, price: 50 }]
  },
  {
    id: 's2',
    folio: 'N-2',
    createdAt: '2026-10-02T18:00:00.000Z',
    clientId: 'c1',
    client: { id: 'c1', name: 'Ana' },
    paymentMethod: 'por_cobrar',
    city: 'mochis',
    total: 40,
    items: [{ product: 'b', name: 'Producto B', qty: 1, price: 40 }]
  },
  {
    id: 's3',
    folio: 'N-3',
    createdAt: '2026-10-02T20:00:00.000Z',
    customer: 'Luis',
    paymentMethod: 'efectivo',
    city: 'culiacan',
    total: 10,
    items: [{ product: 'a', name: 'Producto A', qty: 1, price: 10 }]
  }
];

const promos = [];
for (let i = 0; i < 41; i++) {
  promos.push({ id: 'p' + i, code: 'PROMO' + i, type: 'percent', active: true, percentOff: 5 });
}

const dataset = buildDataset({
  historical: [],
  liveSales: sales,
  clients: [{ id: 'c1', name: 'Ana', password: SECRET, token: 'x', apiKey: 'k', creditLimit: 500 }],
  materials: { items: [{ id: 'cemento', name: 'Cemento', stock: 5, minStock: 10, unit: 'kg' }] },
  finished: finished,
  prices: prices,
  formulas: {
    value: {
      items: {
        'saco-a': {
          name: 'Saco A',
          items: [{ plantId: 'cemento', amount: 1, unit: 'kg', role: 'base', password: SECRET }]
        }
      }
    }
  },
  promos: { items: promos },
  edits: {
    byId: {
      s9: { editedAt: '2026-10-02T18:00:00.000Z', note: 'ajuste', password: SECRET }
    },
    updatedAt: '2026-10-02T18:00:00.000Z'
  },
  catalog: { names: { 'saco-a': 'Saco A' }, added: [{ slug: 'extra', name: 'Extra', deleted: true }] },
  updatedAtByKey: { s35_finished_stock: '2026-10-12T12:00:00.000Z' },
  warnings: []
});

eq(dataset.finished['saco-a'].byCity.culiacan, 10, 'forma tolerante saco-a culiacan');
eq(dataset.finished['saco-b'].byCity.culiacan, 7, 'forma tolerante saco-b');
eq(dataset.prices['saco-a'].tiers[0], 50, 'precio string tiers[0]');
eq(dataset.prices['saco-b'].tiers[0], 11, 'precio numérico');
eq(dataset.clients[0].creditLimit, 500, 'crédito solo si existe');
assert(dataset.clients[0].password == null, 'compactClient no copia password');
assert(dataset.formulas['saco-a'], 'fórmula desenvuelta');
eq(dataset.updatedAtByKey.s35_finished_stock, '2026-10-12T12:00:00.000Z', 'updatedAtByKey');

const runtime = createReadRuntime(dataset);
const ex = runtime.execute.bind(runtime);

const inv = ex('get_inventory_totals', { city: 'culiacan' });
eq(inv.totals.pieces, 17, 'piezas Culiacán');
eq(inv.totals.value, 577, 'valor Culiacán 577');
eq(inv.totals.amount, 577, 'amount = value');
assert(String(inv.priceBasis).indexOf('tiers[0]') >= 0, 'priceBasis');

const all = ex('get_inventory_totals', {});
eq(all.byCity.mochis.value, 150, 'valor Mochis');
eq(all.totals.value, 727, 'valor tres ciudades');
eq(all.totals.pieces, 20, 'piezas tres ciudades');

const from = '2026-10-01';
const to = '2026-10-02';

const byDay = ex('get_sales_breakdown', { from: from, to: to, by: 'day' });
eq(byDay.totals.amount, 150, 'total ventas');
eq(byDay.totals.tickets, 3, 'notas');
eq(byDay.totals.pieces, 4, 'piezas vendidas');
eq(group(byDay, '2026-10-01').amount, 100, 'día 1');
eq(group(byDay, '2026-10-01').tickets, 1, 'tickets día 1');
eq(group(byDay, '2026-10-01').pieces, 2, 'piezas día 1');
eq(group(byDay, '2026-10-02').amount, 50, 'día 2');
eq(group(byDay, '2026-10-02').tickets, 2, 'tickets día 2');

const byProduct = ex('get_sales_breakdown', { from: from, to: to, by: 'product' });
eq(group(byProduct, 'a').amount, 110, 'producto a');
eq(group(byProduct, 'a').pieces, 3, 'piezas a');
eq(group(byProduct, 'b').amount, 40, 'producto b');
eq(byProduct.totals.amount, 150, 'totals de producto cubre notas');

const byClient = ex('get_sales_breakdown', { from: from, to: to, by: 'client' });
eq(group(byClient, 'c1').amount, 140, 'Ana');
eq(group(byClient, 'Luis').amount, 10, 'Luis');

const byCity = ex('get_sales_breakdown', { from: from, to: to, by: 'city' });
eq(group(byCity, 'culiacan').amount, 110, 'ciudad culiacan');
eq(group(byCity, 'mochis').amount, 40, 'ciudad mochis');

const balances = ex('get_client_balances', { query: 'Ana' });
eq(balances.items[0].balance, 40, 'saldo por_cobrar');
eq(balances.items[0].creditLimit, 500, 'límite copiado');
eq(balances.totals.amount, 40, 'total saldos');
assert(!balances.warnings || balances.warnings.indexOf('saldo no disponible') < 0, 'sí hay método de pago');

const low = ex('get_below_min', {});
assert(low.items.some(function (r) { return r.kind === 'material' && r.id === 'cemento'; }), 'cemento bajo mínimo');
assert(!low.items.some(function (r) { return r.slug === 'saco-a' || r.slug === 'saco-b'; }), 'sacos no están bajo mínimo');

const promosResult = ex('get_promos', {});
eq(promosResult.totalRows, 41, 'promos completas');
eq(promosResult.items.length, 40, 'lista recortada');
assert(promosResult.truncated === true, 'truncated');
eq(promosResult.totals.rows, 41, 'totals del conjunto completo');

const formulas = ex('get_formulas', { query: 'saco-a' });
assert(formulas.confidential === true, 'fórmula confidencial');
assert(formulas.items[0].items[0].plantId === 'cemento', 'dosis');
assert(formulas.items[0].items[0].password == null, 'dosis sin password');

const edits = ex('get_sale_edits', { from: from, to: to });
eq(edits.items.length, 1, 'una edición');
assert(edits.items[0].fields.indexOf('password') < 0, 'edición sin campo password');

const emptyPay = createReadRuntime(buildDataset({
  liveSales: [{ id: 'z', createdAt: '2026-10-01T18:00:00.000Z', total: 10, city: 'culiacan', items: [] }],
  clients: [{ id: 'c9', name: 'SinPago' }]
})).execute('get_client_balances', {});
assert(emptyPay.warnings && emptyPay.warnings.indexOf('saldo no disponible') >= 0, 'saldo no disponible');

const deniedNav = chat.rejectRawTool('navigate');
eq(deniedNav.status, 400, 'raw rechaza navigate');
eq(deniedNav.body.error, 'Tool no permitida', 'mensaje raw');
assert(deniedNav.body.dataAsOf, 'raw 400 trae dataAsOf');
assert(Array.isArray(deniedNav.body.warnings), 'raw 400 trae warnings');

const deniedWrite = chat.rejectRawTool('drop_collection');
eq(deniedWrite.status, 400, 'raw rechaza tool fuera de lista');
assert(chat.rejectRawTool('get_inventory_totals') == null, 'raw acepta tool de lectura');
assert(chat.CLIENT_DATA_TOOLS.get_formulas === true, 'fórmulas en lista blanca');
assert(!chat.CLIENT_DATA_TOOLS.navigate, 'navigate fuera de la lista');

const stripped = stripSensitive({
  password: SECRET,
  token: 'x',
  nested: { apiKey: 'k', hash: 'h', note: MONGO, ok: 'visible' }
});
assert(stripped.password == null && stripped.token == null, 'stripSensitive claves');
assert(stripped.nested.apiKey == null && stripped.nested.hash == null, 'stripSensitive anidado');
assert(stripped.nested.note == null, 'stripSensitive mongodb uri');
eq(stripped.nested.ok, 'visible', 'deja el resto');

const blob = JSON.stringify({
  inv: inv,
  balances: balances,
  formulas: formulas,
  edits: edits,
  search: ex('search_sales', { query: 'Ana', from: from, to: to })
});
assert(blob.indexOf(SECRET) < 0, 'no sale el secreto');
assert(blob.indexOf('mongodb://') < 0, 'no sale mongodb uri');
assert(!/"(password|token|secret|hash|apiKey|api_key)"/i.test(blob), 'no hay campos sensibles');

const readSrc = fs.readFileSync(path.join(__dirname, '../api/_lib/copilot-read.js'), 'utf8');
const sumSrc = fs.readFileSync(path.join(__dirname, '../api/_lib/copilot-summaries.js'), 'utf8');
assert(!/\.(insertOne|insertMany|updateOne|updateMany|deleteOne|deleteMany|bulkWrite|findOneAndUpdate|replaceOne)\s*\(/.test(readSrc + sumSrc), 'solo lectura');

console.log('ok copilot-read 577 balances breakdowns below-min raw sensitive');
