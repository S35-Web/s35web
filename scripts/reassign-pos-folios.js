#!/usr/bin/env node
'use strict';

/**
 * Reasigna folios POS duplicados. Por defecto solo imprime el antes y el después.
 * No escribe en la base salvo que se pase --apply.
 *
 *   node scripts/reassign-pos-folios.js
 *   node scripts/reassign-pos-folios.js --apply
 */

const { getDb } = require('../api/_lib/mongo');
const {
  planPosFolioRepair,
  formatRepairReport,
  formatPosFolio,
  parsePosSeq,
  maxPosSeq,
  loadFolioSources,
  ensurePosIndexes,
  SEQ_ID
} = require('../api/_lib/pos-folio');

const APPLY = process.argv.indexOf('--apply') >= 0;

function stamp() {
  return new Date().toISOString();
}

async function applyPlan(db, plan) {
  if (!plan.changes.length && plan.afterMax === plan.beforeMax) {
    await db.collection('pos_folio_seq').updateOne(
      { _id: SEQ_ID },
      { $max: { seq: plan.afterMax } },
      { upsert: true }
    );
    return { updated: 0, seq: plan.afterMax };
  }
  const byId = Object.create(null);
  plan.changes.forEach(function (row) { byId[row.id] = row; });
  const now = stamp();
  const state = db.collection('panel_state');
  const doc = await state.findOne({ _id: 's35_pos_sales' });
  const value = (doc && doc.value && typeof doc.value === 'object') ? doc.value : { items: [] };
  const items = Array.isArray(value.items) ? value.items : [];
  let updated = 0;
  const nextItems = items.map(function (sale) {
    const change = sale && byId[sale.id];
    if (!change) return sale;
    updated += 1;
    const meta = Object.assign({}, sale.meta || {}, {
      previousFolio: change.from,
      folioReassignedAt: now
    });
    const note = sale.note && typeof sale.note === 'object'
      ? Object.assign({}, sale.note, { folio: change.to })
      : sale.note;
    return Object.assign({}, sale, {
      folio: change.to,
      note: note,
      meta: meta,
      editedAt: now,
      updatedAt: now
    });
  });
  const ledger = db.collection('pos_sales');
  for (let i = 0; i < plan.changes.length; i++) {
    const change = plan.changes[i];
    const sale = nextItems.filter(function (row) { return row && row.id === change.id; })[0];
    if (!sale) continue;
    const setDoc = Object.assign({}, sale, {
      folio: change.to,
      folioSeq: parsePosSeq(change.to)
    });
    delete setDoc._id;
    await ledger.updateOne(
      { _id: sale.id },
      { $set: setDoc },
      { upsert: true }
    );
  }
  if (doc) {
    await state.updateOne(
      { _id: 's35_pos_sales' },
      { $set: { value: Object.assign({}, value, { items: nextItems, updatedAt: now }), updatedAt: now, updatedBy: 'reassign-pos-folios' } }
    );
  }
  await db.collection('pos_folio_seq').updateOne(
    { _id: SEQ_ID },
    { $max: { seq: plan.afterMax } },
    { upsert: true }
  );
  return { updated: updated, seq: plan.afterMax };
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Falta MONGODB_URI. No se leyó ni se escribió nada.');
    process.exit(1);
  }
  const db = await getDb();
  const sources = await loadFolioSources(db);
  const plan = planPosFolioRepair(sources.blob, maxPosSeq(sources.combined));
  console.log(formatRepairReport(plan));
  console.log('');
  console.log('Ventas en el panel: ' + sources.blob.length + ' · filas en pos_sales: ' + sources.ledger.length);
  if (!APPLY) {
    console.log('');
    console.log('Sin --apply no se modificó la base. El siguiente folio sería ' + (plan.nextFolio || formatPosFolio(plan.afterMax + 1)) + '.');
    return;
  }
  await ensurePosIndexes(db);
  const result = await applyPlan(db, plan);
  console.log('');
  console.log('Aplicado. Ventas reasignadas: ' + result.updated + '. Secuencia en ' + formatPosFolio(result.seq) + '. Siguiente cobro: ' + formatPosFolio(result.seq + 1) + '.');
}

main().catch(function (err) {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
