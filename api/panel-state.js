/**
 * Estado compartido del panel Colaboradores (MongoDB).
 * Un documento por clave localStorage → colección `panel_state`.
 *
 * Conflicto: last-write-wins por `updatedAt` (ISO). Si el cliente envía un
 * updatedAt más antiguo que el remoto, el PUT no pisa ese key (rejected).
 *
 * GET  → { ok, stores: { [key]: { value, updatedAt } } }
 * PUT  → body { stores: { [key]: { value, updatedAt } } }
 *        → { ok, accepted[], rejected[], stores }
 */
'use strict';

const { getDb } = require('./_lib/mongo');
const { requirePanelUser } = require('./_lib/auth');

/** Claves de negocio que el panel puede sincronizar (no UI/sesión). */
const ALLOWED_KEYS = [
  's35_plant_inventory',
  's35_plant_families',
  's35_finished_stock',
  's35_plant_formulas_v3',
  's35_production_lots',
  's35_compra_tickets',
  's35_plant_unit_costs_v1',
  's35_plant_count_20260922b',
  's35_pos_prices_v4',
  's35_pos_sales',
  's35_caja_gastos_v1',
  's35_sale_edits_v1',
  's35_promo_codes_v1',
  's35_product_families',
  's35_product_family_overrides',
  's35_product_catalog_v1',
  's35_hist_sales_imported_v13'
];

const ALLOWED_SET = new Set(ALLOWED_KEYS);

/**
 * Colecciones que se fusionan por id (unión) en vez de LWW puro.
 * Evita que un tab con menos tickets/gastos borre los de otro dispositivo.
 * Ventas: además se excluyen imports históricos (viven en JSON, no en s35_pos_sales).
 */
const MERGE_ITEMS_KEYS = new Set([
  's35_pos_sales',
  's35_caja_gastos_v1',
  's35_production_lots',
  's35_compra_tickets',
  's35_promo_codes_v1'
]);

const MERGE_MAP_KEYS = new Set([
  's35_sale_edits_v1'
]);

function isHistoricalImportSale(row) {
  if (!row) return false;
  if (row.user === 'import-historico') return true;
  const src = row.meta && row.meta.source;
  return src === 'old-panel';
}

function itemRecency(row) {
  if (!row || typeof row !== 'object') return 0;
  return Date.parse(row.editedAt || row.updatedAt || row.createdAt || '') || 0;
}

function extractItems(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.items)) return value.items;
  return [];
}

function mergeItemLists(a, b, opts) {
  opts = opts || {};
  const dropHistorical = !!opts.dropHistoricalSales;
  const byId = Object.create(null);
  const order = [];
  function consider(row) {
    if (!row || typeof row !== 'object') return;
    if (dropHistorical && isHistoricalImportSale(row)) return;
    const id = row.id != null ? String(row.id) : (row.code != null ? String(row.code) : '');
    if (!id) return;
    if (!byId[id]) {
      byId[id] = row;
      order.push(id);
      return;
    }
    if (itemRecency(row) >= itemRecency(byId[id])) byId[id] = row;
  }
  (a || []).forEach(consider);
  (b || []).forEach(consider);
  return order.map(function (id) { return byId[id]; });
}

function mergeItemsValue(key, prevValue, nextValue, updatedAt) {
  const dropHistorical = key === 's35_pos_sales';
  const merged = mergeItemLists(
    extractItems(prevValue),
    extractItems(nextValue),
    { dropHistoricalSales: dropHistorical }
  );
  const base = (nextValue && typeof nextValue === 'object' && !Array.isArray(nextValue))
    ? nextValue
    : ((prevValue && typeof prevValue === 'object' && !Array.isArray(prevValue)) ? prevValue : {});
  const out = Object.assign({}, base, { items: merged });
  if (updatedAt) out.updatedAt = updatedAt;
  return out;
}

function mergeByIdMaps(prevValue, nextValue, updatedAt) {
  const prevMap = (prevValue && prevValue.byId && typeof prevValue.byId === 'object') ? prevValue.byId : {};
  const nextMap = (nextValue && nextValue.byId && typeof nextValue.byId === 'object') ? nextValue.byId : {};
  const outMap = Object.assign({}, prevMap);
  Object.keys(nextMap).forEach(function (id) {
    const a = outMap[id];
    const b = nextMap[id];
    if (!a) {
      outMap[id] = b;
      return;
    }
    if (!b) return;
    outMap[id] = itemRecency(b) >= itemRecency(a) ? Object.assign({}, a, b) : Object.assign({}, b, a);
  });
  const base = (nextValue && typeof nextValue === 'object') ? nextValue : (prevValue || {});
  const out = Object.assign({}, base, { byId: outMap });
  if (updatedAt) out.updatedAt = updatedAt;
  return out;
}

/** Migra un documento legado `plant_state` (sync anterior) a claves panel_state. */
async function migrateFromPlantState(db, col) {
  try {
    const count = await col.countDocuments({ _id: { $in: ALLOWED_KEYS } });
    if (count > 0) return false;
    const plant = await db.collection('plant_state').findOne({ _id: 'plant' });
    if (!plant) return false;
    const now = plant.updatedAt || new Date().toISOString();
    const rows = [];
    if (Array.isArray(plant.inventory) && plant.inventory.length) {
      rows.push({
        _id: 's35_plant_inventory',
        value: { items: plant.inventory, updatedAt: now },
        updatedAt: now
      });
    }
    if (plant.finished && typeof plant.finished === 'object') {
      rows.push({
        _id: 's35_finished_stock',
        value: { items: plant.finished, updatedAt: now },
        updatedAt: now
      });
    }
    if (plant.formulas && typeof plant.formulas === 'object' && Object.keys(plant.formulas).length) {
      rows.push({
        _id: 's35_plant_formulas_v3',
        value: { items: plant.formulas, updatedAt: now },
        updatedAt: now
      });
    }
    if (Array.isArray(plant.lots) && plant.lots.length) {
      rows.push({
        _id: 's35_production_lots',
        value: { items: plant.lots, updatedAt: now },
        updatedAt: now
      });
    }
    if (Array.isArray(plant.purchases) && plant.purchases.length) {
      rows.push({
        _id: 's35_compra_tickets',
        value: { items: plant.purchases, updatedAt: now },
        updatedAt: now
      });
    }
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      await col.updateOne(
        { _id: row._id },
        { $set: { value: row.value, updatedAt: row.updatedAt, updatedBy: 'migrate:plant_state' } },
        { upsert: true }
      );
    }
    return rows.length > 0;
  } catch (err) {
    console.warn('[panel-state] migrate plant_state', err && err.message);
    return false;
  }
}

function parseBody(req) {
  try {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    if (req.body && Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8'));
    if (typeof req.body === 'string') return JSON.parse(req.body);
  } catch (_) {}
  return {};
}

function normalizeIso(ts) {
  const s = String(ts || '').trim();
  if (!s) return null;
  const t = Date.parse(s);
  if (!isFinite(t)) return null;
  return new Date(t).toISOString();
}

function cmpIso(a, b) {
  const ta = Date.parse(a || '') || 0;
  const tb = Date.parse(b || '') || 0;
  return ta - tb;
}

module.exports = async function handler(req, res) {
  const user = requirePanelUser(req);
  if (!user) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  try {
    const db = await getDb();
    const col = db.collection('panel_state');

    if (req.method === 'GET') {
      await migrateFromPlantState(db, col);
      const q = (req.query && req.query.keys) || '';
      let keys = ALLOWED_KEYS;
      if (q) {
        keys = String(q)
          .split(',')
          .map(function (k) { return k.trim(); })
          .filter(function (k) { return ALLOWED_SET.has(k); });
      }
      const docs = await col.find({ _id: { $in: keys } }).toArray();
      const stores = {};
      docs.forEach(function (doc) {
        stores[doc._id] = {
          value: doc.value,
          updatedAt: doc.updatedAt || null
        };
      });
      res.status(200).json({
        ok: true,
        keys: ALLOWED_KEYS,
        stores: stores,
        strategy: 'last-write-wins:updatedAt'
      });
      return;
    }

    if (req.method === 'PUT') {
      const body = parseBody(req);
      const incoming = body && body.stores && typeof body.stores === 'object' ? body.stores : null;
      if (!incoming) {
        res.status(400).json({ ok: false, error: 'Falta stores{}' });
        return;
      }

      const accepted = [];
      const rejected = [];
      const out = {};
      const who = user.sub || user.username || null;

      const keys = Object.keys(incoming).filter(function (k) { return ALLOWED_SET.has(k); });
      const existing = keys.length
        ? await col.find({ _id: { $in: keys } }).toArray()
        : [];
      const byId = {};
      existing.forEach(function (d) { byId[d._id] = d; });

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const entry = incoming[key];
        if (!entry || typeof entry !== 'object') {
          rejected.push({ key: key, reason: 'invalid-entry' });
          continue;
        }
        const updatedAt = normalizeIso(entry.updatedAt) || new Date().toISOString();
        const prev = byId[key];
        const isMergeKey = MERGE_ITEMS_KEYS.has(key) || MERGE_MAP_KEYS.has(key);

        // Colecciones: fusionar siempre (aunque el cliente venga "stale") para no
        // perder tickets/gastos únicos del otro lado. El resto sigue LWW estricto.
        if (!isMergeKey && prev && prev.updatedAt && cmpIso(updatedAt, prev.updatedAt) < 0) {
          rejected.push({
            key: key,
            reason: 'stale',
            remoteUpdatedAt: prev.updatedAt
          });
          out[key] = { value: prev.value, updatedAt: prev.updatedAt };
          continue;
        }

        let valueToStore = entry.value;
        let tsToStore = updatedAt;
        if (isMergeKey && prev && prev.value != null) {
          if (MERGE_ITEMS_KEYS.has(key)) {
            valueToStore = mergeItemsValue(key, prev.value, entry.value, updatedAt);
          } else if (MERGE_MAP_KEYS.has(key)) {
            valueToStore = mergeByIdMaps(prev.value, entry.value, updatedAt);
          }
          // Si el remoto era más nuevo, conservar su marca salvo que el merge
          // aportó ítems nuevos (entonces "ahora" para propagar la unión).
          if (prev.updatedAt && cmpIso(updatedAt, prev.updatedAt) < 0) {
            const prevCount = MERGE_ITEMS_KEYS.has(key)
              ? extractItems(prev.value).length
              : Object.keys((prev.value && prev.value.byId) || {}).length;
            const nextCount = MERGE_ITEMS_KEYS.has(key)
              ? extractItems(valueToStore).length
              : Object.keys((valueToStore && valueToStore.byId) || {}).length;
            tsToStore = nextCount > prevCount
              ? new Date().toISOString()
              : (normalizeIso(prev.updatedAt) || prev.updatedAt);
            if (valueToStore && typeof valueToStore === 'object') {
              valueToStore = Object.assign({}, valueToStore, { updatedAt: tsToStore });
            }
          }
        } else if (MERGE_ITEMS_KEYS.has(key)) {
          // Primera escritura: igual limpiar imports históricos de ventas.
          valueToStore = mergeItemsValue(key, null, entry.value, updatedAt);
        }

        await col.updateOne(
          { _id: key },
          {
            $set: {
              value: valueToStore,
              updatedAt: tsToStore,
              updatedBy: who
            }
          },
          { upsert: true }
        );
        accepted.push(key);
        out[key] = { value: valueToStore, updatedAt: tsToStore };
      }

      res.status(200).json({
        ok: true,
        accepted: accepted,
        rejected: rejected,
        stores: out,
        strategy: 'last-write-wins:updatedAt'
      });
      return;
    }

    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: (err && err.message) || 'Error de servidor'
    });
  }
};

module.exports.ALLOWED_KEYS = ALLOWED_KEYS;
