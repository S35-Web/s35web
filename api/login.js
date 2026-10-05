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

function matchUser(username, password, expectedUser, expectedPass) {
  return safeEqual(username, expectedUser) && safeEqual(password, expectedPass);
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
  const ventasUser = String(process.env.VENTAS_USERNAME || 'ventas').trim().toLowerCase();
  const ventasPassword = process.env.VENTAS_PASSWORD || 'ventas123';
  const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

  if (!username || !password) {
    res.status(400).json({ ok: false, error: 'Faltan usuario o contraseña' });
    return;
  }

  let role = null;
  let sub = null;
  if (matchUser(username, password, adminUser, adminPassword)) {
    role = 'admin';
    sub = adminUser;
  } else if (matchUser(username, password, ventasUser, ventasPassword)) {
    role = 'ventas';
    sub = ventasUser;
  } else {
    res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    return;
  }

  const displayName = sub.charAt(0).toUpperCase() + sub.slice(1);
  const token = jwt.sign({ role: role, sub: sub }, jwtSecret, { expiresIn: '8h' });
  res.status(200).json({
    ok: true,
    token,
    user: {
      id: sub,
      username: sub,
      name: displayName,
      role: role
    }
  });
};
