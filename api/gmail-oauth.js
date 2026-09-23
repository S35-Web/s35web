'use strict';

/**
 * OAuth de Gmail para contacto@s35.com.mx
 *
 * GET ?action=start     → URL de autorización (requiere JWT admin)
 * GET ?code=&state=     → callback de Google
 * GET ?action=status    → ¿conectado? (JWT admin)
 * POST ?action=disconnect → desconectar (JWT admin)
 */
const { requireAdmin, signOAuthState, verifyOAuthState } = require('./_lib/auth');
const {
  GMAIL_SCOPES,
  createOAuthClient,
  panelReturnUrl,
  redirectUri,
  saveTokens,
  clearTokens,
  loadTokenDoc,
} = require('./_lib/gmail');
const { google } = require('googleapis');

function wantsJson(req) {
  const accept = String(req.headers.accept || '');
  return accept.indexOf('application/json') >= 0 || req.query.format === 'json';
}

module.exports = async function handler(req, res) {
  const action = String((req.query && req.query.action) || '').toLowerCase();

  // Callback de Google (sin Bearer)
  if (req.method === 'GET' && req.query && req.query.code) {
    const state = verifyOAuthState(req.query.state);
    if (!state) {
      res.status(400).send('Estado OAuth inválido o expirado. Vuelve al panel e intenta conectar de nuevo.');
      return;
    }
    try {
      const client = createOAuthClient();
      const { tokens } = await client.getToken({
        code: String(req.query.code),
        redirect_uri: redirectUri(),
      });
      client.setCredentials(tokens);
      let email = process.env.GMAIL_USER || 'contacto@s35.com.mx';
      try {
        const oauth2 = google.oauth2({ version: 'v2', auth: client });
        const me = await oauth2.userinfo.get();
        if (me.data && me.data.email) email = me.data.email;
      } catch (_) {}
      if (!tokens.refresh_token) {
        const prev = await loadTokenDoc();
        if (prev && prev.refresh_token) {
          tokens.refresh_token = prev.refresh_token;
        }
      }
      if (!tokens.refresh_token) {
        res.status(400).send(
          'Google no devolvió refresh_token. Abre https://myaccount.google.com/permissions , ' +
            'quita el acceso a «S-35 System» y vuelve a Conectar Gmail (debe pedir Allow otra vez).'
        );
        return;
      }
      await saveTokens(tokens, email);
      const base = panelReturnUrl().split('#')[0];
      res.statusCode = 302;
      res.setHeader('Location', base + '?gmail=connected#messages');
      res.end();
      return;
    } catch (e) {
      console.error('gmail oauth callback', e);
      const detail =
        (e.response && e.response.data && (e.response.data.error_description || e.response.data.error)) ||
        e.message ||
        'error desconocido';
      res.status(500).send(
        'No se pudo completar la conexión con Gmail.<br><br>' +
          '<code style="font-size:13px">' + String(detail).replace(/[<>&]/g, '') + '</code><br><br>' +
          'Vuelve al panel e intenta Conectar Gmail de nuevo (el código de Google solo sirve una vez).'
      );
      return;
    }
  }

  if (req.method === 'GET' && action === 'status') {
    const user = requireAdmin(req);
    if (!user) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }
    try {
      const configured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
      const doc = await loadTokenDoc();
      res.status(200).json({
        ok: true,
        configured: configured,
        connected: !!(doc && doc.refresh_token),
        email: doc && doc.email ? doc.email : (process.env.GMAIL_USER || 'contacto@s35.com.mx'),
        updatedAt: doc && doc.updatedAt ? doc.updatedAt : null,
      });
      return;
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'Error del servidor' });
      return;
    }
  }

  if (req.method === 'GET' && (action === 'start' || !action)) {
    const user = requireAdmin(req);
    if (!user) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }
    try {
      const client = createOAuthClient();
      const state = signOAuthState({ sub: user.sub || user.username || 'admin' });
      const url = client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: GMAIL_SCOPES,
        state: state,
        include_granted_scopes: true,
        login_hint: process.env.GMAIL_USER || 'contacto@s35.com.mx',
      });
      if (wantsJson(req) || action === 'start') {
        res.status(200).json({ ok: true, url: url });
        return;
      }
      res.statusCode = 302;
      res.setHeader('Location', url);
      res.end();
      return;
    } catch (e) {
      if (e.code === 'GMAIL_NOT_CONFIGURED') {
        res.status(503).json({
          ok: false,
          error: 'Gmail no está configurado. Faltan GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET en Vercel.',
        });
        return;
      }
      console.error(e);
      res.status(500).json({ ok: false, error: 'Error del servidor' });
      return;
    }
  }

  if ((req.method === 'POST' || req.method === 'DELETE') && action === 'disconnect') {
    const user = requireAdmin(req);
    if (!user) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }
    try {
      await clearTokens();
      res.status(200).json({ ok: true });
      return;
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'Error del servidor' });
      return;
    }
  }

  res.status(405).json({ ok: false, error: 'Method Not Allowed' });
};
