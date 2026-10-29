/**
 * Envía la nota de venta por correo (Resend).
 * Si no hay llave o el envío falla, responde fallback para que el panel abra el correo del dispositivo.
 */
const jwt = require('jsonwebtoken');

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

function parseBody(req) {
  try {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    if (req.body && Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8'));
    if (typeof req.body === 'string') return JSON.parse(req.body);
  } catch (_) {}
  return {};
}

function recipients(raw) {
  return String(raw || '')
    .split(/[,;]/)
    .map(function (s) { return s.trim(); })
    .filter(function (s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); })
    .slice(0, 5);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }
  if (!requirePanelUser(req)) {
    res.status(401).json({ ok: false, fallback: true, error: 'No autorizado' });
    return;
  }

  const body = parseBody(req);
  const to = recipients(body.to);
  const subject = String(body.subject || 'Nota de venta · S-35').trim().slice(0, 180);
  const text = String(body.text || '').trim().slice(0, 12000);
  if (!to.length || !text) {
    res.status(400).json({ ok: false, error: 'Falta correo o nota' });
    return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  const mailFrom = process.env.MAIL_FROM;
  if (!resendKey || !mailFrom) {
    res.status(200).json({ ok: true, sent: false, fallback: true });
    return;
  }

  try {
    const { Resend } = require('resend');
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: mailFrom,
      to: to,
      reply_to: process.env.MAIL_REPLY_TO || mailFrom,
      subject: subject,
      text: text
    });
    res.status(200).json({ ok: true, sent: true });
  } catch (err) {
    console.error('sale-note mail:', err && err.message ? err.message : err);
    res.status(200).json({ ok: true, sent: false, fallback: true });
  }
};
