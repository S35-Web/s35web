#!/usr/bin/env node
'use strict';

const {
  planPosFolioRepair,
  formatPosFolio,
  parsePosSeq,
  maxPosSeq,
  allocatePosFolio
} = require('../api/_lib/pos-folio');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL', msg);
    process.exit(1);
  }
}

const older = {
  id: 'sale-old-402',
  folio: 'POS-0402',
  createdAt: '2026-11-20T18:00:00.000Z',
  customer: 'Cliente antiguo',
  total: 100
};
const newer402 = {
  id: 'sale-new-402',
  folio: 'POS-0402',
  createdAt: '2026-11-26T18:00:00.000Z',
  customer: 'Cliente reciente',
  total: 200
};
const newer403 = {
  id: 'sale-new-403',
  folio: 'POS-0403',
  createdAt: '2026-11-26T19:00:00.000Z',
  customer: 'Otro',
  total: 300
};
const older403 = {
  id: 'sale-old-403',
  folio: 'pos-0403',
  createdAt: '2026-11-21T18:00:00.000Z',
  customer: 'Se queda',
  total: 50
};
const solo = {
  id: 'sale-404',
  folio: 'POS-0404',
  createdAt: '2026-11-22T18:00:00.000Z',
  customer: 'Único',
  total: 10
};

const plan = planPosFolioRepair([newer402, older, solo, newer403, older403]);
assert(plan.beforeMax === 404, 'el máximo histórico es 404');
assert(plan.changes.length === 2, 'solo se reasignan las copias recientes');
assert(plan.changes[0].id === 'sale-new-402' && plan.changes[0].to === 'POS-0405', '0402 reciente pasa a 0405');
assert(plan.changes[1].id === 'sale-new-403' && plan.changes[1].to === 'POS-0406', '0403 reciente pasa a 0406');
assert(plan.changes.every(function (row) { return row.from !== row.to; }), 'el folio nuevo es distinto');
assert(plan.afterMax === 406, 'la secuencia queda en el último folio asignado');
assert(plan.nextFolio === 'POS-0407', 'el siguiente cobro es mayor que todos');
assert(plan.duplicateFolios.join(',') === 'POS-0402,POS-0403', '0404 no está repetido');

const kept = plan.changes.map(function (row) { return row.keptId; }).sort();
assert(kept[0] === 'sale-old-402' && kept[1] === 'sale-old-403', 'la venta más antigua conserva el folio');

assert(parsePosSeq('POS-0007') === 7, 'lee el consecutivo');
assert(parsePosSeq('HIST-R1') === null, 'ignora folios que no son POS');
assert(maxPosSeq([{ folio: 'POS-0002' }, { deleted: true, folio: 'POS-0099' }]) === 99, 'un borrado físico todavía cuenta si sigue en la lista');
assert(formatPosFolio(8) === 'POS-0008', 'rellena a 4 dígitos');

function memoryDb(initial) {
  const state = { seq: initial || 0, sales: [], keys: {} };
  return {
    state: state,
    collection: function (name) {
      if (name === 'pos_folio_seq') {
        return {
          updateOne: async function (_q, update) {
            const floor = update.$max && update.$max.seq;
            if (floor > state.seq) state.seq = floor;
            return { acknowledged: true };
          },
          findOneAndUpdate: async function (_q, update) {
            state.seq += update.$inc.seq;
            return { seq: state.seq };
          }
        };
      }
      if (name === 'pos_sales') {
        return {
          createIndex: async function () { return 'ok'; },
          insertOne: async function (doc) {
            if (state.sales.some(function (row) { return row.folio === doc.folio || row._id === doc._id; })) {
              const err = new Error('dup');
              err.code = 11000;
              throw err;
            }
            state.sales.push(doc);
            return { acknowledged: true };
          },
          findOne: async function (q) {
            return state.sales.filter(function (row) { return row._id === q._id; })[0] || null;
          }
        };
      }
      if (name === 'pos_checkout_keys') {
        return { createIndex: async function () { return 'ok'; } };
      }
      if (name === 'panel_state') {
        return { findOne: async function () { return { value: { items: [] } }; } };
      }
      throw new Error('colección inesperada ' + name);
    }
  };
}

async function twoCharges() {
  const db = memoryDb(404);
  const a = allocatePosFolio(db, null, 404);
  const b = allocatePosFolio(db, null, 404);
  const folios = await Promise.all([a, b]);
  const values = folios.map(function (row) { return row.folio; }).sort();
  assert(values[0] !== values[1], 'dos cobros simultáneos no comparten folio');
  assert(values[0] === 'POS-0405' && values[1] === 'POS-0406', 'siguen al máximo, no al conteo');
  const afterCancel = await allocatePosFolio(db, null, 100);
  assert(afterCancel.folio === 'POS-0407', 'cancelar o bajar el piso no retrocede la secuencia');
  assert(db.state.seq === 407, 'el contador queda en 407');
}

twoCharges().then(function () {
  console.log('ok pos folio: duplicados 0402/0403 → 0405/0406, secuencia 407, cobros paralelos distintos');
}).catch(function (err) {
  console.error(err);
  process.exit(1);
});
