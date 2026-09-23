/**
 * Clientes compartidos (MongoDB) — visibles en todos los navegadores.
 * GET: lista (si vacío, siembra desde clients-import.json)
 * PUT: reemplaza el catálogo completo
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

const CATALOG_ID = 'catalog';

let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI');
  cachedClient = cachedClient || new MongoClient(uri);
  if (!cachedClient.topology) {
    await cachedClient.connect();
  }
  const dbName = process.env.MONGODB_DB || 's35web';
  cachedDb = cachedClient.db(dbName);
  return cachedDb;
}

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

function loadSeedItems() {
  try {
    const filePath = path.join(
      process.cwd(),
      'public',
      'colaboradores',
      'data',
      'clients-import.json'
    );
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (raw && Array.isArray(raw.items)) return raw.items;
  } catch (_) {}
  return [];
}

function normalizeItem(c) {
  if (!c || typeof c !== 'object') return null;
  const id = String(c.id || '').trim();
  const name = String(c.name || '').trim();
  if (!id || !name) return null;
  const next = Object.assign({}, c, {
    id: id,
    name: name,
    phone: String(c.phone || '').trim(),
    email: String(c.email || '').trim(),
    company: String(c.company || '').trim(),
    rfc: String(c.rfc || '').trim().toUpperCase(),
    type: String(c.type || c.kind || 'client').toLowerCase() === 'distributor' ? 'distributor' : 'client',
    address: String(c.address || '').trim()
  });
  delete next.kind;
  delete next.domicilio;
  delete next.localidad;
  return next;
}

module.exports = async function handler(req, res) {
  const user = requirePanelUser(req);
  if (!user) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  try {
    const db = await getDb();
    const col = db.collection('clients');

    if (req.method === 'GET') {
      let doc = await col.findOne({ _id: CATALOG_ID });
      let seeded = false;
      if (!doc || !Array.isArray(doc.items) || !doc.items.length) {
        const seed = loadSeedItems().map(normalizeItem).filter(Boolean);
        const updatedAt = new Date().toISOString();
        await col.updateOne(
          { _id: CATALOG_ID },
          { $set: { items: seed, updatedAt: updatedAt, seededFromFile: true } },
          { upsert: true }
        );
        doc = { items: seed, updatedAt: updatedAt, seededFromFile: true };
        seeded = true;
      }
      res.status(200).json({
        ok: true,
        items: doc.items || [],
        updatedAt: doc.updatedAt || null,
        seeded: seeded
      });
      return;
    }

    if (req.method === 'PUT') {
      const body = parseBody(req);
      const incoming = Array.isArray(body.items) ? body.items : null;
      if (!incoming) {
        res.status(400).json({ ok: false, error: 'Falta items[]' });
        return;
      }
      const items = incoming.map(normalizeItem).filter(Boolean);
      const updatedAt = new Date().toISOString();
      await col.updateOne(
        { _id: CATALOG_ID },
        {
          $set: {
            items: items,
            updatedAt: updatedAt,
            seededFromFile: false,
            updatedBy: user.sub || user.username || null
          }
        },
        { upsert: true }
      );
      res.status(200).json({ ok: true, total: items.length, updatedAt: updatedAt });
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
