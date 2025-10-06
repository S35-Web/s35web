// Simple admin login that issues a short-lived JWT
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const { password } = req.body && typeof req.body === 'object' ? req.body : {};
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

  if (!adminPassword) {
    res.status(500).json({ ok: false, error: 'Falta ADMIN_PASSWORD' });
    return;
  }

  if (password !== adminPassword) {
    res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    return;
  }

  const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '2h' });
  res.status(200).json({ ok: true, token });
};


