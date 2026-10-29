'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function requireAdmin(req) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return null;
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    if (payload.role !== 'admin') return null;
    return payload;
  } catch (_) {
    return null;
  }
}

/** Admin o ventas — acceso al panel Colaboradores / sync de estado. */
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

function signOAuthState(extra) {
  return jwt.sign(
    Object.assign({ purpose: 'gmail-oauth' }, extra || {}),
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '15m' }
  );
}

function verifyOAuthState(state) {
  try {
    const payload = jwt.verify(state, process.env.JWT_SECRET || 'dev-secret');
    if (payload.purpose !== 'gmail-oauth') return null;
    return payload;
  } catch (_) {
    return null;
  }
}

function headerValue(req, name) {
  const raw = req && req.headers ? req.headers[name] : '';
  if (Array.isArray(raw)) return String(raw[0] || '');
  return raw == null ? '' : String(raw);
}

/**
 * Llave fija de solo lectura (S35_AGENT_KEY). No autoriza el panel.
 * El caller solo debe aceptarla cuando mode === "agent".
 * Si la variable no está, siempre devuelve false.
 */
function agentKeyMatches(req) {
  const expected = String(process.env.S35_AGENT_KEY || '').trim();
  const dedicated = headerValue(req, 'x-s35-agent-key').trim();
  const auth = headerValue(req, 'authorization');
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const got = dedicated || bearer;
  if (!expected || !got) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(got);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { requireAdmin, requirePanelUser, signOAuthState, verifyOAuthState, agentKeyMatches };
