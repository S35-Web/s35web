'use strict';

const { google } = require('googleapis');
const { getDb } = require('./mongo');

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'openid',
  'email',
];
const TOKEN_DOC_ID = 'contacto';

function redirectUri() {
  return String(
    process.env.GOOGLE_REDIRECT_URI ||
    'https://www.s-35.com.mx/api/gmail-oauth'
  ).trim().replace(/\/$/, '');
}

function panelReturnUrl() {
  return String(
    process.env.GMAIL_PANEL_RETURN ||
    'https://www.s-35.com.mx/colaboradores/panel#messages'
  ).trim();
}

function createOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    const err = new Error('Faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET');
    err.code = 'GMAIL_NOT_CONFIGURED';
    throw err;
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri());
}

async function loadTokenDoc() {
  const db = await getDb();
  return db.collection('gmail_oauth').findOne({ _id: TOKEN_DOC_ID });
}

async function saveTokens(tokens, email) {
  const db = await getDb();
  const now = new Date();
  const $set = {
    email: email || process.env.GMAIL_USER || 'contacto@s35.com.mx',
    access_token: tokens.access_token || null,
    expiry_date: tokens.expiry_date || null,
    scope: tokens.scope || GMAIL_SCOPES.join(' '),
    token_type: tokens.token_type || 'Bearer',
    updatedAt: now,
  };
  if (tokens.refresh_token) $set.refresh_token = tokens.refresh_token;
  await db.collection('gmail_oauth').updateOne(
    { _id: TOKEN_DOC_ID },
    { $set: $set, $setOnInsert: { createdAt: now } },
    { upsert: true }
  );
}

async function clearTokens() {
  const db = await getDb();
  await db.collection('gmail_oauth').deleteOne({ _id: TOKEN_DOC_ID });
}

async function getAuthedClient() {
  const doc = await loadTokenDoc();
  if (!doc || !doc.refresh_token) {
    const err = new Error('Gmail no está conectado');
    err.code = 'GMAIL_NOT_CONNECTED';
    throw err;
  }
  const client = createOAuthClient();
  client.setCredentials({
    refresh_token: doc.refresh_token,
    access_token: doc.access_token,
    expiry_date: doc.expiry_date,
    token_type: doc.token_type,
    scope: doc.scope,
  });
  client.on('tokens', async function (tokens) {
    try {
      const patch = { updatedAt: new Date() };
      if (tokens.access_token) patch.access_token = tokens.access_token;
      if (tokens.expiry_date) patch.expiry_date = tokens.expiry_date;
      if (tokens.refresh_token) patch.refresh_token = tokens.refresh_token;
      const db = await getDb();
      await db.collection('gmail_oauth').updateOne(
        { _id: TOKEN_DOC_ID },
        { $set: patch }
      );
    } catch (e) {
      console.error('gmail token refresh persist error', e);
    }
  });
  return { client, email: doc.email };
}

function headerValue(headers, name) {
  const key = String(name || '').toLowerCase();
  const hit = (headers || []).find(function (h) {
    return String(h.name || '').toLowerCase() === key;
  });
  return hit ? String(hit.value || '') : '';
}

function decodeBodyData(data) {
  if (!data) return '';
  const normalized = String(data).replace(/-/g, '+').replace(/_/g, '/');
  try {
    return Buffer.from(normalized, 'base64').toString('utf8');
  } catch (_) {
    return '';
  }
}

function decodeBodyBuffer(data) {
  if (!data) return null;
  const normalized = String(data).replace(/-/g, '+').replace(/_/g, '/');
  try {
    return Buffer.from(normalized, 'base64');
  } catch (_) {
    return null;
  }
}

function partHeader(part, name) {
  return headerValue((part && part.headers) || [], name);
}

function contentIdKey(raw) {
  return String(raw || '')
    .trim()
    .replace(/^<|>$/g, '')
    .toLowerCase();
}

function walkParts(payload, acc) {
  if (!payload) return acc;
  const mime = String(payload.mimeType || '');
  const data = payload.body && payload.body.data;
  if (data && (mime === 'text/plain' || mime === 'text/html')) {
    acc.bodies.push({ mime: mime, text: decodeBodyData(data) });
  }

  const filename =
    (payload.filename && String(payload.filename).trim()) ||
    (() => {
      const cd = partHeader(payload, 'Content-Disposition');
      const m = cd.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
      return m ? decodeURIComponent(m[1].replace(/"/g, '').trim()) : '';
    })();
  const cid = contentIdKey(partHeader(payload, 'Content-ID'));
  const disposition = String(partHeader(payload, 'Content-Disposition') || '').toLowerCase();
  const isAttach =
    !!filename ||
    disposition.indexOf('attachment') >= 0 ||
    (cid && mime.indexOf('image/') === 0) ||
    (payload.body && payload.body.attachmentId && mime && mime.indexOf('multipart/') !== 0);

  if (isAttach && mime.indexOf('multipart/') !== 0) {
    acc.parts.push({
      mimeType: mime || 'application/octet-stream',
      filename: filename || (cid ? cid.split('@')[0] : 'adjunto'),
      size: Number((payload.body && payload.body.size) || 0) || 0,
      attachmentId: (payload.body && payload.body.attachmentId) || null,
      data: data || null,
      contentId: cid || null,
      inline: disposition.indexOf('inline') >= 0 || (!!cid && disposition.indexOf('attachment') < 0),
    });
  }

  (payload.parts || []).forEach(function (p) {
    walkParts(p, acc);
  });
  return acc;
}

function extractBodies(payload) {
  const acc = { bodies: [], parts: [] };
  walkParts(payload, acc);
  const plain = acc.bodies.filter(function (p) { return p.mime === 'text/plain'; }).map(function (p) { return p.text; }).join('\n');
  const html = acc.bodies.filter(function (p) { return p.mime === 'text/html'; }).map(function (p) { return p.text; }).join('\n');
  let text = plain;
  let htmlOut = html || '';
  if (!text && htmlOut) {
    text = htmlOut.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  if (!text && !htmlOut) {
    text = decodeBodyData(payload && payload.body && payload.body.data);
  }
  return { text: text || '', html: htmlOut, parts: acc.parts };
}

function toDataUrl(mime, buf) {
  if (!buf || !buf.length) return null;
  const type = mime || 'application/octet-stream';
  return 'data:' + type + ';base64,' + buf.toString('base64');
}

async function resolvePartBuffer(gmail, messageId, part) {
  if (part.data) return decodeBodyBuffer(part.data);
  if (!part.attachmentId) return null;
  const res = await gmail.users.messages.attachments.get({
    userId: 'me',
    messageId: messageId,
    id: part.attachmentId,
  });
  return decodeBodyBuffer(res.data && res.data.data);
}

function rewriteCidHtml(html, cidMap) {
  if (!html || !cidMap) return html || '';
  return String(html).replace(
    /(?:src|href)\s*=\s*(["'])cid:([^"']+)\1/gi,
    function (full, quote, cid) {
      const key = contentIdKey(cid);
      const url = cidMap[key];
      if (!url) return full;
      const attr = full.toLowerCase().indexOf('href') === 0 ? 'href' : 'src';
      return attr + '=' + quote + url + quote;
    }
  ).replace(
    /url\(\s*(['"]?)cid:([^)'"]+)\1\s*\)/gi,
    function (full, quote, cid) {
      const url = cidMap[contentIdKey(cid)];
      return url ? ('url(' + (quote || '') + url + (quote || '') + ')') : full;
    }
  );
}

function formatBytes(n) {
  n = Number(n) || 0;
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(n < 10 * 1024 ? 1 : 0) + ' KB';
  return (n / (1024 * 1024)).toFixed(1) + ' MB';
}

function parseFrom(fromHeader) {
  const raw = String(fromHeader || '').trim();
  const m = raw.match(/^(.*)<([^>]+)>$/);
  if (m) {
    return {
      nombre: m[1].replace(/^["']|["']$/g, '').trim() || m[2].trim(),
      email: m[2].trim(),
    };
  }
  if (raw.indexOf('@') >= 0) return { nombre: raw, email: raw };
  return { nombre: raw || 'Sin remitente', email: '' };
}

function mapListItem(msg) {
  const headers = (msg.payload && msg.payload.headers) || [];
  const from = parseFrom(headerValue(headers, 'From'));
  const subject = headerValue(headers, 'Subject') || '(sin asunto)';
  const dateHeader = headerValue(headers, 'Date');
  const internal = msg.internalDate ? new Date(Number(msg.internalDate)) : null;
  const createdAt = internal || (dateHeader ? new Date(dateHeader) : null);
  const unread = Array.isArray(msg.labelIds) && msg.labelIds.indexOf('UNREAD') >= 0;
  return {
    _id: 'gmail:' + msg.id,
    source: 'gmail',
    gmailId: msg.id,
    threadId: msg.threadId,
    nombre: from.nombre,
    email: from.email,
    empresa: '',
    asunto: subject,
    mensaje: msg.snippet || '',
    newsletter: false,
    unread: unread,
    createdAt: createdAt,
  };
}

async function mapDetail(gmail, msg) {
  const base = mapListItem(msg);
  const bodies = extractBodies(msg.payload);
  base.mensaje = bodies.text || base.mensaje;

  const cidMap = {};
  const attachments = [];

  for (let i = 0; i < bodies.parts.length; i++) {
    const part = bodies.parts[i];
    let dataUrl = null;
    const isImage = String(part.mimeType || '').indexOf('image/') === 0;
    const needInline = part.inline || (part.contentId && isImage);
    // Inline images / CID: embed as data URL (cap ~4MB decoded)
    if (needInline && isImage && (part.size || 0) <= 4 * 1024 * 1024) {
      try {
        const buf = await resolvePartBuffer(gmail, msg.id, part);
        if (buf && buf.length && buf.length <= 4 * 1024 * 1024) {
          dataUrl = toDataUrl(part.mimeType, buf);
          if (part.contentId && dataUrl) cidMap[part.contentId] = dataUrl;
        }
      } catch (e) {
        console.warn('gmail inline attach', e && e.message);
      }
    }

    attachments.push({
      id: part.attachmentId || ('inline-' + i),
      filename: part.filename || ('adjunto-' + (i + 1)),
      mimeType: part.mimeType,
      size: part.size,
      sizeLabel: formatBytes(part.size),
      contentId: part.contentId,
      inline: !!needInline,
      previewUrl: dataUrl || null,
      downloadable: !!part.attachmentId || !!part.data,
    });
  }

  base.html = rewriteCidHtml(bodies.html || '', cidMap);
  base.attachments = attachments;
  base.labelIds = msg.labelIds || [];
  return base;
}

async function listInbox(maxResults) {
  const { client } = await getAuthedClient();
  const gmail = google.gmail({ version: 'v1', auth: client });
  const list = await gmail.users.messages.list({
    userId: 'me',
    maxResults: Math.min(Math.max(Number(maxResults) || 50, 1), 100),
    q: 'in:inbox',
  });
  const refs = list.data.messages || [];
  if (!refs.length) return [];
  const detailed = await Promise.all(
    refs.map(function (ref) {
      return gmail.users.messages.get({
        userId: 'me',
        id: ref.id,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date'],
      });
    })
  );
  return detailed.map(function (r) {
    return mapListItem(r.data);
  });
}

async function getMessage(id) {
  const { client } = await getAuthedClient();
  const gmail = google.gmail({ version: 'v1', auth: client });
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: id,
    format: 'full',
  });
  return mapDetail(gmail, res.data);
}

async function getAttachment(messageId, attachmentId) {
  const { client } = await getAuthedClient();
  const gmail = google.gmail({ version: 'v1', auth: client });
  const res = await gmail.users.messages.attachments.get({
    userId: 'me',
    messageId: messageId,
    id: attachmentId,
  });
  const buf = decodeBodyBuffer(res.data && res.data.data);
  if (!buf) {
    const err = new Error('Adjunto vacío');
    err.code = 'EMPTY_ATTACHMENT';
    throw err;
  }
  return {
    data: buf,
    size: Number(res.data.size) || buf.length,
  };
}

async function trashMessage(id) {
  const { client } = await getAuthedClient();
  const gmail = google.gmail({ version: 'v1', auth: client });
  await gmail.users.messages.trash({ userId: 'me', id: id });
}

module.exports = {
  GMAIL_SCOPES,
  TOKEN_DOC_ID,
  createOAuthClient,
  redirectUri,
  panelReturnUrl,
  loadTokenDoc,
  saveTokens,
  clearTokens,
  getAuthedClient,
  listInbox,
  getMessage,
  getAttachment,
  trashMessage,
};
