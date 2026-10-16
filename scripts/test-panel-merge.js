#!/usr/bin/env node
'use strict';

const {
  mergeItemsValue,
  mergeInventoryValue,
  mergeFinishedValue
} = require('../api/panel-state');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL', msg);
    process.exit(1);
  }
}

const confirmed = {
  id: 'LT-WAX-261012-001',
  product: 'waxtard-blanco-perla',
  status: 'confirmed',
  issuedAt: '2026-10-12T18:00:00.000Z',
  confirmedAt: '2026-10-12T20:00:00.000Z',
  bagsOut: 40
};
const openAgain = {
  id: 'LT-WAX-261012-001',
  product: 'waxtard-blanco-perla',
  status: 'open',
  issuedAt: '2026-10-12T18:00:00.000Z',
  bagsOut: null
};
const lots = mergeItemsValue(
  's35_production_lots',
  { items: [confirmed] },
  { items: [openAgain] },
  '2026-10-13T15:00:00.000Z'
);
assert(lots.items[0].status === 'confirmed', 'un reenvío abierto no desconfirma el lote');
assert(lots.items[0].bagsOut === 40, 'se conservan los sacos confirmados');

const inventory = mergeInventoryValue(
  { items: [{ id: 'cemento', stock: 80, byCity: { culiacan: 80 }, updatedAt: '2026-10-12T20:05:00.000Z' }] },
  { items: [{ id: 'cemento', stock: 130, byCity: { culiacan: 130 } }], updatedAt: '2026-10-13T16:00:00.000Z' },
  '2026-10-13T16:00:00.000Z'
);
assert(inventory.items[0].stock === 80, 'un inventario sin sello de fila no revierte el descuento');

const edited = mergeInventoryValue(
  { items: [{ id: 'cemento', stock: 80, updatedAt: '2026-10-12T20:05:00.000Z' }] },
  { items: [{ id: 'cemento', stock: 75, updatedAt: '2026-10-13T17:00:00.000Z' }] },
  '2026-10-13T17:00:00.000Z'
);
assert(edited.items[0].stock === 75, 'un ajuste con sello más nuevo sí entra');

const finished = mergeFinishedValue(
  { items: { 'waxtard-blanco-perla': { slug: 'waxtard-blanco-perla', stock: 40, updatedAt: '2026-10-12T20:05:00.000Z', byCity: { culiacan: 40 } } } },
  { items: { 'waxtard-blanco-perla': { slug: 'waxtard-blanco-perla', stock: 0, byCity: { culiacan: 0 } } }, updatedAt: '2026-10-13T16:00:00.000Z' },
  '2026-10-13T16:00:00.000Z'
);
assert(finished.items['waxtard-blanco-perla'].stock === 40, 'el PT confirmado no vuelve a 0');

const staleTie = mergeFinishedValue(
  {
    items: {
      'waxtard-blanco-perla': {
        slug: 'waxtard-blanco-perla',
        stock: 802,
        updatedAt: '2026-10-14T04:25:11.282Z',
        byCity: { culiacan: 802 }
      }
    }
  },
  {
    items: {
      'waxtard-blanco-perla': {
        slug: 'waxtard-blanco-perla',
        stock: 40,
        updatedAt: '2026-10-14T04:25:11.282Z',
        byCity: { culiacan: 40 }
      }
    },
    updatedAt: '2026-10-14T05:00:00.000Z'
  },
  '2026-10-14T05:00:00.000Z'
);
assert(staleTie.items['waxtard-blanco-perla'].stock === 802, 'empate de sello: cliente no baja PT');

const staleOlder = mergeFinishedValue(
  {
    items: {
      'waxtard-extra-anclaje': {
        slug: 'waxtard-extra-anclaje',
        stock: 11,
        updatedAt: '2026-10-14T04:25:11.282Z',
        byCity: { culiacan: 11 }
      }
    }
  },
  {
    items: {
      'waxtard-extra-anclaje': {
        slug: 'waxtard-extra-anclaje',
        stock: 0,
        updatedAt: '2026-10-12T12:00:00.000Z',
        byCity: { culiacan: 0 }
      }
    },
    updatedAt: '2026-10-12T12:00:00.000Z'
  },
  '2026-10-12T12:00:00.000Z'
);
assert(staleOlder.items['waxtard-extra-anclaje'].stock === 11, 'sello más viejo no pisa PT');

const saleOk = mergeFinishedValue(
  {
    items: {
      'waxtard-blanco-perla': {
        slug: 'waxtard-blanco-perla',
        stock: 802,
        updatedAt: '2026-10-14T04:25:11.282Z',
        byCity: { culiacan: 802 }
      }
    }
  },
  {
    items: {
      'waxtard-blanco-perla': {
        slug: 'waxtard-blanco-perla',
        stock: 800,
        updatedAt: '2026-10-14T06:00:00.000Z',
        byCity: { culiacan: 800 }
      }
    },
    updatedAt: '2026-10-14T06:00:00.000Z'
  },
  '2026-10-14T06:00:00.000Z'
);
assert(saleOk.items['waxtard-blanco-perla'].stock === 800, 'venta con sello más nuevo sí baja PT');

// Regresión: navegador stale con Perla=250 no puede bajar servidor Perla=557.
const perlaServer = mergeFinishedValue(
  {
    items: {
      'waxtard-blanco-perla': {
        slug: 'waxtard-blanco-perla',
        stock: 557,
        updatedAt: '2026-10-16T12:00:00.000Z',
        byCity: { culiacan: 557 }
      }
    },
    updatedAt: '2026-10-16T12:00:00.000Z'
  },
  {
    items: {
      'waxtard-blanco-perla': {
        slug: 'waxtard-blanco-perla',
        stock: 250,
        updatedAt: '2026-10-10T08:00:00.000Z',
        byCity: { culiacan: 250 }
      }
    },
    updatedAt: '2026-10-10T08:00:00.000Z'
  },
  '2026-10-10T08:00:00.000Z'
);
assert(perlaServer.items['waxtard-blanco-perla'].stock === 557, 'stale Perla=250 no baja servidor 557');

const perlaNoStamp = mergeFinishedValue(
  {
    items: {
      'waxtard-blanco-perla': {
        slug: 'waxtard-blanco-perla',
        stock: 557,
        updatedAt: '2026-10-16T12:00:00.000Z',
        byCity: { culiacan: 557 }
      }
    }
  },
  {
    items: {
      'waxtard-blanco-perla': {
        slug: 'waxtard-blanco-perla',
        stock: 250,
        byCity: { culiacan: 250 }
      }
    },
    updatedAt: '2026-10-16T18:00:00.000Z'
  },
  '2026-10-16T18:00:00.000Z'
);
assert(perlaNoStamp.items['waxtard-blanco-perla'].stock === 557, 'cliente sin sello de fila no baja Perla');

// Ventas: cliente viejo sin la venta nueva no la borra (unión por id).
const salesKeepNew = mergeItemsValue(
  's35_pos_sales',
  {
    items: [
      { id: 'sale-old', total: 100, createdAt: '2026-10-01T10:00:00.000Z' },
      { id: 'sale-new', total: 500, createdAt: '2026-10-16T15:00:00.000Z', editedAt: '2026-10-16T15:01:00.000Z' }
    ],
    updatedAt: '2026-10-16T15:01:00.000Z'
  },
  {
    items: [
      { id: 'sale-old', total: 100, createdAt: '2026-10-01T10:00:00.000Z' }
    ],
    updatedAt: '2026-10-10T09:00:00.000Z'
  },
  '2026-10-10T09:00:00.000Z'
);
assert(
  salesKeepNew.items.some(function (r) { return r.id === 'sale-new' && r.total === 500; }),
  'cliente stale no borra venta nueva'
);

// Tombstone viejo no pisa venta más nueva en el servidor.
const salesNoStaleDelete = mergeItemsValue(
  's35_pos_sales',
  {
    items: [
      { id: 'sale-keep', total: 300, createdAt: '2026-10-16T12:00:00.000Z', editedAt: '2026-10-16T12:05:00.000Z' }
    ]
  },
  {
    items: [
      { id: 'sale-keep', total: 300, deleted: true, editedAt: '2026-10-15T08:00:00.000Z' }
    ]
  },
  '2026-10-15T08:00:00.000Z'
);
assert(
  salesNoStaleDelete.items[0] && !salesNoStaleDelete.items[0].deleted && salesNoStaleDelete.items[0].total === 300,
  'delete stale no borra venta nueva'
);

// Empate de recency en venta: gana servidor (prev), no el cliente.
const salesTieServer = mergeItemsValue(
  's35_pos_sales',
  {
    items: [
      { id: 'sale-tie', total: 900, note: 'server', editedAt: '2026-10-16T10:00:00.000Z' }
    ]
  },
  {
    items: [
      { id: 'sale-tie', total: 100, note: 'client', editedAt: '2026-10-16T10:00:00.000Z' }
    ]
  },
  '2026-10-16T10:00:00.000Z'
);
assert(salesTieServer.items[0].total === 900 && salesTieServer.items[0].note === 'server', 'empate ventas: gana servidor');

console.log('ok merge no revierte producción');
