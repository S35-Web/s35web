// Simple admin login that issues a short-lived JWT
const jwt = require('jsonwebtoken');

function parseBody(req) {
  try {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return req.body;
    }
    if (req.body && Buffer.isBuffer(req.body)) {
      return JSON.parse(req.body.toString('utf8'));
    }
    if (typeof req.body === 'string') {
      return JSON.parse(req.body);
    }
  } catch (_) {}
  return {};
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const body = parseBody(req);
  const { password } = body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

  if (!password) {
    res.status(400).json({ ok: false, error: 'Falta contraseña' });
    return;
  }

  if (password !== adminPassword) {
    res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    return;
  }

  const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '2h' });
  res.status(200).json({ ok: true, token });
};


