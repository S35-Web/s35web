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

function walkParts(payload, acc) {
  if (!payload) return acc;
  const mime = String(payload.mimeType || '');
  const data = payload.body && payload.body.data;
  if (data && (mime === 'text/plain' || mime === 'text/html')) {
    acc.push({ mime: mime, text: decodeBodyData(data) });
  }
  (payload.parts || []).forEach(function (p) {
    walkParts(p, acc);
  });
  return acc;
}

function extractBodies(payload) {
  const parts = walkParts(payload, []);
  const plain = parts.filter(function (p) { return p.mime === 'text/plain'; }).map(function (p) { return p.text; }).join('\n');
  const html = parts.filter(function (p) { return p.mime === 'text/html'; }).map(function (p) { return p.text; }).join('\n');
  if (plain) return { text: plain, html: html || '' };
  if (html) {
    const stripped = html.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return { text: stripped, html: html };
  }
  const raw = decodeBodyData(payload && payload.body && payload.body.data);
  return { text: raw, html: '' };
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

function mapDetail(msg) {
  const base = mapListItem(msg);
  const bodies = extractBodies(msg.payload);
  base.mensaje = bodies.text || base.mensaje;
  base.html = bodies.html || '';
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
  return mapDetail(res.data);
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
  trashMessage,
};
