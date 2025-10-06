// List contact messages for admin with JWT auth
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

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

function requireAuth(req, res) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return null;
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    if (payload.role !== 'admin') return null;
    return payload;
  } catch (e) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  const db = await getDb();

  if (req.method === 'GET') {
    const items = await db.collection('messages').find({}).sort({ createdAt: -1 }).limit(200).toArray();
    res.status(200).json({ ok: true, items });
    return;
  }

  if (req.method === 'DELETE') {
    const { id } = req.query || {};
    if (!id) {
      res.status(400).json({ ok: false, error: 'Falta id' });
      return;
    }
    await db.collection('messages').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ ok: false, error: 'Method Not Allowed' });
};


