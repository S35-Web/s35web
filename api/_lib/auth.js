'use strict';

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

module.exports = { requireAdmin, requirePanelUser, signOAuthState, verifyOAuthState };
