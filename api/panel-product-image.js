/**
 * Subida de foto de producto del panel.
 * Preferencia: Vercel Blob (BLOB_READ_WRITE_TOKEN).
 * Sin token: responde con data URL comprimida para guardar en catálogo.
 *
 * POST { slug, dataUrl } → { ok, url, storage: 'blob'|'inline' }
 */
'use strict';

const { put } = require('@vercel/blob');
const { requirePanelUser } = require('./_lib/auth');

const MAX_BYTES = 900 * 1024; // ~900 KB (JPEG ya comprimido en cliente)
const ALLOWED_PREFIX = /^data:image\/(jpeg|jpg|png|webp);base64,/i;

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

function slugOk(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(String(slug || '')) && String(slug).length <= 80;
}

function dataUrlToBuffer(dataUrl) {
  const raw = String(dataUrl || '');
  if (!ALLOWED_PREFIX.test(raw)) return null;
  const comma = raw.indexOf(',');
  if (comma < 0) return null;
  const b64 = raw.slice(comma + 1);
  try {
    const buf = Buffer.from(b64, 'base64');
    if (!buf.length || buf.length > MAX_BYTES) return null;
    return buf;
  } catch (_) {
    return null;
  }
}

function mimeFromDataUrl(dataUrl) {
  const m = String(dataUrl || '').match(/^data:(image\/[a-z0-9.+-]+);base64,/i);
  return (m && m[1]) || 'image/jpeg';
}

function extFromMime(mime) {
  if (/png/i.test(mime)) return 'png';
  if (/webp/i.test(mime)) return 'webp';
  return 'jpg';
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const user = requirePanelUser(req);
  if (!user) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  const body = parseBody(req);
  const slug = String(body.slug || '').trim().toLowerCase();
  const dataUrl = String(body.dataUrl || '');
  if (!slugOk(slug)) {
    res.status(400).json({ ok: false, error: 'slug inválido' });
    return;
  }
  if (!ALLOWED_PREFIX.test(dataUrl)) {
    res.status(400).json({ ok: false, error: 'imagen inválida (usa JPEG/PNG/WebP)' });
    return;
  }

  const buf = dataUrlToBuffer(dataUrl);
  if (!buf) {
    res.status(400).json({ ok: false, error: 'imagen demasiado grande o corrupta' });
    return;
  }

  const mime = mimeFromDataUrl(dataUrl);
  const ext = extFromMime(mime);
  const token = process.env.BLOB_READ_WRITE_TOKEN || '';

  if (token) {
    try {
      const blob = await put('panel-products/' + slug + '-' + Date.now() + '.' + ext, buf, {
        access: 'public',
        contentType: mime,
        token: token,
        addRandomSuffix: false
      });
      res.status(200).json({ ok: true, url: blob.url, storage: 'blob' });
      return;
    } catch (err) {
      console.warn('[panel-product-image] blob', err && err.message);
      res.status(500).json({ ok: false, error: 'No se pudo subir a Blob' });
      return;
    }
  }

  // Sin Blob: el cliente guarda el data URL en el catálogo (sync).
  res.status(200).json({ ok: true, url: dataUrl, storage: 'inline' });
};
