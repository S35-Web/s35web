'use strict';
// Test del state-store contra un mock de MongoDB en memoria.
const assert = require('assert');
const store = require('../api/_lib/state-store');

function makeMockDb() {
  const cols = {};
  function col(name) {
    if (!cols[name]) cols[name] = new Map();
    const map = cols[name];
    return {
      async findOne(q) { return map.get(q._id) || null; },
      find() {
        return { toArray: async () => Array.from(map.values()) };
      },
      async updateOne(q, update, opts) {
        const id = q._id;
        const prev = map.get(id) || { _id: id };
        Object.assign(prev, update.$set);
        prev._id = id;
        if (opts && opts.upsert) map.set(id, prev);
        else if (map.has(id)) map.set(id, prev);
      }
    };
  }
  return { collection: col, _cols: cols };
}

(async function () {
  const db = makeMockDb();

  // Política de claves
  assert.strictEqual(store.isSyncableKey('s35_pos_sales'), true, 'ventas debe sincronizar');
  assert.strictEqual(store.isSyncableKey('s35_plant_formulas_v3'), true, 'fórmulas debe sincronizar');
  assert.strictEqual(store.isSyncableKey('s35_plant_inventory'), true, 'inventario debe sincronizar');
  assert.strictEqual(store.isSyncableKey('s35_admin_token'), false, 'token NO debe sincronizar');
  assert.strictEqual(store.isSyncableKey('s35_panel_theme'), false, 'theme NO debe sincronizar');
  assert.strictEqual(store.isSyncableKey('s35_pos_prices_v3'), false, 'precios legados NO sincronizan');
  assert.strictEqual(store.isSyncableKey('otra_cosa'), false, 'sin prefijo NO sincroniza');

  // PUT rechaza clave no permitida
  await assert.rejects(() => store.putState(db, 's35_admin_token', 'x', { sub: 'admin' }));
  // PUT rechaza value no-string
  await assert.rejects(() => store.putState(db, 's35_pos_sales', { a: 1 }, { sub: 'admin' }));

  // PUT + GET de ventas
  const salesVal = JSON.stringify({ items: [{ id: 'v1', total: 450 }], updatedAt: 't' });
  const r1 = await store.putState(db, 's35_pos_sales', salesVal, { sub: 'ventas' });
  assert.ok(r1.updatedAt, 'putState devuelve updatedAt');

  const one = await store.getOne(db, 's35_pos_sales');
  assert.strictEqual(one.value, salesVal, 'getOne devuelve el mismo string');

  // PUT de fórmulas e inventario
  await store.putState(db, 's35_plant_formulas_v3', JSON.stringify({ f: 1 }), { sub: 'admin' });
  await store.putState(db, 's35_plant_inventory', JSON.stringify({ inv: 2 }), { sub: 'admin' });

  // getAllState incluye las 3 claves
  const all = await store.getAllState(db);
  assert.ok(all.state['s35_pos_sales'], 'estado incluye ventas');
  assert.ok(all.state['s35_plant_formulas_v3'], 'estado incluye fórmulas');
  assert.ok(all.state['s35_plant_inventory'], 'estado incluye inventario');
  assert.ok(all.updatedAt, 'getAllState devuelve updatedAt');

  // meta refleja el conteo
  const meta = await store.getMeta(db);
  assert.strictEqual(meta.count, 3, 'meta.count = 3');
  assert.ok(meta.updatedAt, 'meta.updatedAt presente');

  // Actualizar sobrescribe
  const salesVal2 = JSON.stringify({ items: [{ id: 'v1' }, { id: 'v2' }] });
  await store.putState(db, 's35_pos_sales', salesVal2, { sub: 'ventas' });
  const one2 = await store.getOne(db, 's35_pos_sales');
  assert.strictEqual(one2.value, salesVal2, 'actualización sobrescribe');

  console.log('OK: todos los asserts del state-store pasaron');
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
