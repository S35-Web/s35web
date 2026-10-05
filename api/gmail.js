'use strict';

/**
 * Bandeja Gmail (contacto@s35.com.mx) para el panel.
 * GET            → lista inbox
 * GET ?id=       → detalle
 * GET ?id=&attachment= → descarga adjunto
 * POST ?id=&action=read|unread → marcar leído / no leído
 * DELETE ?id=    → papelera
 */
const { requireAdmin } = require('./_lib/auth');
const {
  listInbox,
  getMessage,
  getAttachment,
  trashMessage,
  setMessageUnread
} = require('./_lib/gmail');

function contentDisposition(filename) {
  const safe = String(filename || 'adjunto').replace(/[\r\n"]/g, '');
  const encoded = encodeURIComponent(safe);
  return 'attachment; filename="' + safe + '"; filename*=UTF-8\'\'' + encoded;
}

function parseBody(req) {
  try {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    if (req.body && Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8'));
    if (typeof req.body === 'string') return JSON.parse(req.body);
  } catch (_) {}
  return {};
}

module.exports = async function handler(req, res) {
  const user = requireAdmin(req);
  if (!user) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const id = req.query && req.query.id ? String(req.query.id) : '';
      const attachmentId = req.query && req.query.attachment ? String(req.query.attachment) : '';
      if (id && attachmentId) {
        const msgId = id.replace(/^gmail:/, '');
        const file = await getAttachment(msgId, attachmentId);
        const filename = req.query.filename ? String(req.query.filename) : 'adjunto';
        const mime = req.query.mime ? String(req.query.mime) : 'application/octet-stream';
        res.setHeader('Content-Type', mime);
        res.setHeader('Content-Disposition', contentDisposition(filename));
        res.setHeader('Content-Length', String(file.data.length));
        res.status(200).end(file.data);
        return;
      }
      if (id) {
        const item = await getMessage(id.replace(/^gmail:/, ''));
        res.status(200).json({ ok: true, item: item });
        return;
      }
      const items = await listInbox(req.query && req.query.limit);
      res.status(200).json({ ok: true, items: items });
      return;
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      const id = String((req.query && req.query.id) || body.id || '').replace(/^gmail:/, '');
      const action = String((req.query && req.query.action) || body.action || '');
      if (!id) {
        res.status(400).json({ ok: false, error: 'Falta id' });
        return;
      }
      if (action === 'read') {
        await setMessageUnread(id, false);
        res.status(200).json({ ok: true, unread: false });
        return;
      }
      if (action === 'unread') {
        await setMessageUnread(id, true);
        res.status(200).json({ ok: true, unread: true });
        return;
      }
      res.status(400).json({ ok: false, error: 'Acción no válida' });
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
