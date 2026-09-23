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

function sendText(res, status, text) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(String(text));
}

function errorDetail(e) {
  if (!e) return 'error desconocido';
  const fromGoogle =
    e.response &&
    e.response.data &&
    (e.response.data.error_description || e.response.data.error);
  if (fromGoogle) return String(fromGoogle);
  if (e.message) return String(e.message);
  return 'error desconocido';
}

module.exports = async function handler(req, res) {
  const action = String((req.query && req.query.action) || '').toLowerCase();

  // Callback de Google (sin Bearer)
  if (req.method === 'GET' && req.query && req.query.code) {
    const state = verifyOAuthState(req.query.state);
    if (!state) {
      sendText(res, 400, 'Estado OAuth inválido o expirado. Vuelve al panel e intenta conectar de nuevo.');
      return;
    }

    const redirect = redirectUri();
    let step = 'init';
    try {
      step = 'create-client';
      const client = createOAuthClient();

      step = 'exchange-code';
      const { tokens } = await client.getToken({
        code: String(req.query.code),
        redirect_uri: redirect,
      });
      client.setCredentials(tokens);

      let email = process.env.GMAIL_USER || 'contacto@s35.com.mx';
      step = 'userinfo';
      try {
        const oauth2 = google.oauth2({ version: 'v2', auth: client });
        const me = await oauth2.userinfo.get();
        if (me.data && me.data.email) email = me.data.email;
      } catch (_) {}

      step = 'load-prev-token';
      if (!tokens.refresh_token) {
        try {
          const prev = await loadTokenDoc();
          if (prev && prev.refresh_token) tokens.refresh_token = prev.refresh_token;
        } catch (mongoErr) {
          const err = new Error(
            'No se pudo leer MongoDB (MONGODB_URI). En Vercel aparece «Needs Attention»: reingresa MONGODB_URI y redespliega. Detalle: ' +
              errorDetail(mongoErr)
          );
          err.code = 'MONGO';
          throw err;
        }
      }

      if (!tokens.refresh_token) {
        sendText(
          res,
          400,
          'Google no devolvió refresh_token.\n\n' +
            '1) Abre https://myaccount.google.com/permissions\n' +
            '2) Quita el acceso a «S-35 System»\n' +
            '3) Vuelve al panel → Conectar Gmail (debe pedir Allow otra vez).'
        );
        return;
      }

      step = 'save-tokens';
      try {
        await saveTokens(tokens, email);
      } catch (mongoErr) {
        const err = new Error(
          'Google autorizó bien, pero falló guardar el token en MongoDB.\n' +
            'Revisa MONGODB_URI en Vercel (badge «Needs Attention»), pega de nuevo el connection string y Redeploy.\n' +
            'Detalle: ' + errorDetail(mongoErr)
        );
        err.code = 'MONGO';
        throw err;
      }

      const base = panelReturnUrl().split('#')[0];
      res.statusCode = 302;
      res.setHeader('Location', base + '?gmail=connected#messages');
      res.end();
      return;
    } catch (e) {
      console.error('gmail oauth callback', { step: step, redirect: redirect, err: e });
      sendText(
        res,
        500,
        'No se pudo completar la conexión con Gmail.\n\n' +
          'Paso: ' + step + '\n' +
          'Redirect URI: ' + redirect + '\n' +
          'Error: ' + errorDetail(e) + '\n\n' +
          'Mongo configurado: ' + (process.env.MONGODB_URI ? 'sí' : 'NO') + '\n' +
          'Google client: ' + (process.env.GOOGLE_CLIENT_ID ? 'sí' : 'NO') + '\n\n' +
          'El código de Google solo sirve una vez: vuelve a Conectar Gmail desde el panel.'
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
      let connected = false;
      let email = process.env.GMAIL_USER || 'contacto@s35.com.mx';
      let updatedAt = null;
      let mongoOk = true;
      let mongoError = null;
      try {
        const doc = await loadTokenDoc();
        connected = !!(doc && doc.refresh_token);
        if (doc && doc.email) email = doc.email;
        if (doc && doc.updatedAt) updatedAt = doc.updatedAt;
      } catch (e) {
        mongoOk = false;
        mongoError = errorDetail(e);
      }
      res.status(200).json({
        ok: true,
        configured: configured,
        connected: connected,
        email: email,
        updatedAt: updatedAt,
        mongoOk: mongoOk,
        mongoError: mongoError,
        redirectUri: redirectUri(),
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
        res.status(200).json({ ok: true, url: url, redirectUri: redirectUri() });
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
      res.status(500).json({ ok: false, error: 'Error del servidor: ' + errorDetail(e) });
      return;
    }
  }

  res.status(405).json({ ok: false, error: 'Method Not Allowed' });
};
