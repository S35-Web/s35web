// List contact messages for admin with JWT auth
const { ObjectId } = require('mongodb');
const { getDb } = require('./_lib/mongo');
const { requireAdmin } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  const user = requireAdmin(req);
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
