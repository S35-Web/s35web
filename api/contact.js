const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const contentType = req.headers['content-type'] || '';
    let body = {};

    // Support JSON and form-urlencoded
    if (contentType.includes('application/json')) {
      body = req.body || {};
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // Vercel parses automatically if using Node runtime – but fallback just in case
      body = req.body || {};
    } else {
      // Try to parse as JSON by default
      body = req.body || {};
    }

    const {
      nombre,
      email,
      empresa = '',
      mensaje,
      newsletter,
      website // honeypot
    } = body;

    // Honeypot check
    if (website) {
      return res.status(200).json({ ok: true, message: 'Received' });
    }

    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios' });
    }

    const to = process.env.MAIL_TO;
    const from = process.env.MAIL_FROM;

    if (!to || !from) {
      console.log('Missing environment variables:', { to: !!to, from: !!from, resendKey: !!process.env.RESEND_API_KEY });
      return res.status(500).json({ 
        ok: false, 
        error: 'Config de correo incompleta',
        debug: {
          hasTo: !!to,
          hasFrom: !!from,
          hasResendKey: !!process.env.RESEND_API_KEY
        }
      });
    }

    const subject = `Nuevo mensaje de contacto: ${nombre}`;
    const html = `
      <div style="font-family:Inter, Arial, sans-serif; line-height:1.6; color:#111">
        <h2 style="margin:0 0 12px">Nuevo mensaje de la web</h2>
        <p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${empresa ? `<p><strong>Empresa:</strong> ${escapeHtml(empresa)}</p>` : ''}
        <p><strong>Newsletter:</strong> ${newsletter ? 'Sí' : 'No'}</p>
        <hr style="border:none; border-top:1px solid #e5e5e5; margin:16px 0" />
        <p style="white-space:pre-wrap">${escapeHtml(mensaje)}</p>
      </div>
    `;

    console.log('Sending email:', { from, to, subject });
    
    // Guardar mensaje en "base de datos" (por ahora en memoria)
    const message = {
      id: Date.now().toString(),
      nombre,
      email,
      empresa: empresa || '',
      mensaje,
      newsletter: !!newsletter,
      createdAt: new Date().toISOString(),
      read: false
    };

    // Aquí normalmente guardarías en una base de datos real
    // Por ahora solo logueamos
    console.log('Mensaje guardado:', message);

    // Enviar email
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html
    });

    console.log('Resend result:', result);

    if (result && result.error) {
      console.error('Resend error:', result.error);
      return res.status(500).json({ ok: false, error: result.error.message || 'Error al enviar' });
    }

    console.log('Email sent successfully');
    return res.status(200).json({ 
      ok: true, 
      message: 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.' 
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Error inesperado' });
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


