/**
 * Estado de planta compartido (MongoDB): inventario MP, PT, lotes y tickets de compra.
 * GET: lee el documento
 * PUT: reemplaza el documento completo (última escritura gana)
 */
'use strict';

const { getDb } = require('./_lib/mongo');
const { requireAdmin } = require('./_lib/auth');

const DOC_ID = 'plant';

function parseBody(req) {
  try {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    if (req.body && Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8'));
    if (typeof req.body === 'string') return JSON.parse(req.body);
  } catch (_) {}
  return {};
}

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

function asObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
}

module.exports = async function handler(req, res) {
  const user = requireAdmin(req);
  if (!user) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  try {
    const db = await getDb();
    const col = db.collection('plant_state');

    if (req.method === 'GET') {
      const doc = await col.findOne({ _id: DOC_ID });
      if (!doc) {
        res.status(200).json({
          ok: true,
          empty: true,
          inventory: [],
          finished: {},
          lots: [],
          purchases: [],
          updatedAt: null
        });
        return;
      }
      res.status(200).json({
        ok: true,
        empty: false,
        inventory: asArray(doc.inventory),
        finished: asObject(doc.finished),
        lots: asArray(doc.lots),
        purchases: asArray(doc.purchases),
        updatedAt: doc.updatedAt || null
      });
      return;
    }

    if (req.method === 'PUT') {
      const body = parseBody(req);
      const inventory = asArray(body.inventory);
      const finished = asObject(body.finished);
      const lots = asArray(body.lots).slice(0, 300);
      const purchases = asArray(body.purchases).slice(0, 200);
      const updatedAt = new Date().toISOString();
      await col.updateOne(
        { _id: DOC_ID },
        {
          $set: {
            inventory: inventory,
            finished: finished,
            lots: lots,
            purchases: purchases,
            updatedAt: updatedAt,
            updatedBy: user.sub || user.username || null
          }
        },
        { upsert: true }
      );
      res.status(200).json({
        ok: true,
        updatedAt: updatedAt,
        totals: {
          inventory: inventory.length,
          lots: lots.length,
          purchases: purchases.length
        }
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
