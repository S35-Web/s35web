// Login de Colaboradores: emite un JWT de corta duración
const crypto = require('crypto');
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

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  const len = Math.max(left.length, right.length, 1);
  const aPad = Buffer.alloc(len);
  const bPad = Buffer.alloc(len);
  left.copy(aPad);
  right.copy(bPad);
  return crypto.timingSafeEqual(aPad, bPad) && left.length === right.length;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const body = parseBody(req);
  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');
  const adminUser = String(process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'villa2012';
  const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

  if (!username || !password) {
    res.status(400).json({ ok: false, error: 'Faltan usuario o contraseña' });
    return;
  }

  if (!safeEqual(username, adminUser) || !safeEqual(password, adminPassword)) {
    res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    return;
  }

  const token = jwt.sign({ role: 'admin', sub: adminUser }, jwtSecret, { expiresIn: '8h' });
  res.status(200).json({ ok: true, token, user: { username: adminUser, role: 'admin' } });
};
