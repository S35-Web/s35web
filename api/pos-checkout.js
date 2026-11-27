'use strict';

const { getDb } = require('./_lib/mongo');
const { requirePanelUser } = require('./_lib/auth');
const { checkoutPosSale, cancelPosSale } = require('./_lib/pos-folio');

function parseBody(req) {
  try {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    if (req.body && Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8'));
    if (typeof req.body === 'string') return JSON.parse(req.body);
  } catch (_) {}
  return {};
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  const user = requirePanelUser(req);
  if (!user) {
    res.status(401).json({ error: 'Sesión inválida' });
    return;
  }
  const body = parseBody(req);
  const action = String(body.action || 'checkout');
  try {
    const db = await getDb();
    const outcome = action === 'cancel'
      ? await cancelPosSale(db, body)
      : await checkoutPosSale(db, body);
    res.status(outcome.status).json(outcome.body);
  } catch (err) {
    console.error('[pos-checkout]', err && err.message);
    res.status(500).json({ error: 'No se pudo registrar la venta' });
  }
};
