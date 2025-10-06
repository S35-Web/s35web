// Simple serverless function for Vercel: save contact message to MongoDB and optionally send email via Resend
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI');
  cachedClient = cachedClient || new MongoClient(uri);
  if (!cachedClient.topology) {
    await cachedClient.connect();
  }
  const dbName = process.env.MONGODB_DB || 's35web';
  cachedDb = cachedClient.db(dbName);
  await cachedDb.collection('messages').createIndex({ createdAt: -1 });
  return cachedDb;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    const { nombre, email, empresa = '', mensaje, newsletter = false, website = '' } = body;

    if (website) {
      // Honeypot filled => likely bot
      res.status(200).json({ ok: true, message: 'Gracias' });
      return;
    }

    if (!nombre || !email || !mensaje) {
      res.status(400).json({ ok: false, error: 'Campos obligatorios faltantes' });
      return;
    }

    const db = await getDb();
    const doc = {
      nombre,
      email,
      empresa,
      mensaje,
      newsletter: !!newsletter,
      createdAt: new Date(),
      source: 'web',
    };
    const result = await db.collection('messages').insertOne(doc);

    // Optional email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    const mailTo = process.env.MAIL_TO;
    const mailFrom = process.env.MAIL_FROM;
    if (resendKey && mailTo && mailFrom) {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: mailFrom,
          to: mailTo,
          subject: `Nuevo mensaje de contacto: ${nombre}`,
          text: `Nombre: ${nombre}\nEmail: ${email}\nEmpresa: ${empresa}\nNewsletter: ${newsletter ? 'Sí' : 'No'}\n\nMensaje:\n${mensaje}`,
        });
      } catch (e) {
        // Non-fatal
        console.error('Resend error:', e);
      }
    }

    res.status(200).json({ ok: true, id: result.insertedId, message: 'Mensaje enviado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error del servidor' });
  }
};


