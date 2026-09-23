/**
 * GET /api/s35-usage — usage global del copiloto (mes actual).
 */
const jwt = require('jsonwebtoken');
const { getCopilotUsageSummary } = require('../lib/copilot-usage');

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
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const user = requirePanelUser(req);
  if (!user) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  try {
    const summary = await getCopilotUsageSummary();
    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: (err && err.message) || 'Error al leer usage'
    });
  }
};
