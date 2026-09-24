/**
 * Estado del panel de Colaboradores en la nube (MongoDB).
 *
 *   GET  /api/state            -> { ok, state: { clave: value }, updatedAt }
 *   GET  /api/state?meta=1     -> { ok, updatedAt, count }
 *   GET  /api/state?key=CLAVE  -> { ok, key, value, updatedAt }
 *   PUT  /api/state?key=CLAVE  body { value: <string> } -> { ok, key, updatedAt }
 *
 * Requiere JWT de panel (rol admin o ventas), igual que /api/clients.
 */
const jwt = require('jsonwebtoken');
const { getDb } = require('./_lib/mongo');
const store = require('./_lib/state-store');

function parseBody(req) {
  try {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    if (req.body && Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8'));
    if (typeof req.body === 'string') return JSON.parse(req.body);
  } catch (_) {}
  return {};
}

function requirePanelUser(req) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return null;
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    if (payload.role !== 'admin' && payload.role !== 'ventas') return null;
    return payload;
  } catch (_) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  const user = requirePanelUser(req);
  if (!user) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  try {
    const db = await getDb();
    const query = req.query || {};
    const key = query.key ? String(query.key) : null;

    if (req.method === 'GET') {
      if (query.meta) {
        const meta = await store.getMeta(db);
        res.status(200).json({ ok: true, updatedAt: meta.updatedAt, count: meta.count });
        return;
      }
      if (key) {
        const one = await store.getOne(db, key);
        res.status(200).json({
          ok: true,
          key: key,
          value: one ? one.value : null,
          updatedAt: one ? one.updatedAt : null
        });
        return;
      }
      const all = await store.getAllState(db);
      res.status(200).json({ ok: true, state: all.state, updatedAt: all.updatedAt });
      return;
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      if (!key) {
        res.status(400).json({ ok: false, error: 'Falta key' });
        return;
      }
      const body = parseBody(req);
      const result = await store.putState(db, key, body.value, user);
      res.status(200).json({ ok: true, key: key, updatedAt: result.updatedAt });
      return;
    }

    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err) {
    res.status(err && err.status ? err.status : 500).json({
      ok: false,
      error: (err && err.message) || 'Error de servidor'
    });
  }
};
