'use strict';

/**
 * Bandeja Gmail (contacto@s35.com.mx) para el panel.
 * GET            → lista inbox
 * GET ?id=       → detalle
 * DELETE ?id=    → papelera
 */
const { requireAdmin } = require('./_lib/auth');
const { listInbox, getMessage, trashMessage } = require('./_lib/gmail');

module.exports = async function handler(req, res) {
  const user = requireAdmin(req);
  if (!user) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const id = req.query && req.query.id ? String(req.query.id) : '';
      if (id) {
        const item = await getMessage(id.replace(/^gmail:/, ''));
        res.status(200).json({ ok: true, item: item });
        return;
      }
      const items = await listInbox(req.query && req.query.limit);
      res.status(200).json({ ok: true, items: items });
      return;
    }

    if (req.method === 'DELETE') {
      const id = req.query && req.query.id ? String(req.query.id) : '';
      if (!id) {
        res.status(400).json({ ok: false, error: 'Falta id' });
        return;
      }
      await trashMessage(id.replace(/^gmail:/, ''));
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (e) {
    if (e.code === 'GMAIL_NOT_CONNECTED') {
      res.status(409).json({ ok: false, error: 'Gmail no está conectado', code: 'GMAIL_NOT_CONNECTED' });
      return;
    }
    if (e.code === 'GMAIL_NOT_CONFIGURED') {
      res.status(503).json({ ok: false, error: e.message, code: 'GMAIL_NOT_CONFIGURED' });
      return;
    }
    console.error('gmail api', e);
    res.status(500).json({ ok: false, error: 'Error al hablar con Gmail' });
  }
};
