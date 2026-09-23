/**
 * S35 Copiloto — chat admin con OpenAI.
 * El cliente envía un contexto de negocio ya agregado (no el histórico completo).
 */
const jwt = require('jsonwebtoken');

function parseBody(req) {
  try {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    if (req.body && Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8'));
    if (typeof req.body === 'string') return JSON.parse(req.body);
  } catch (_) {}
  return {};
}

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

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'navigate',
      description:
        'Navega el panel Colaboradores a una sección y opcionalmente abre un corte (periodo/ciudad), cliente o producto.',
      parameters: {
        type: 'object',
        properties: {
          section: {
            type: 'string',
            enum: [
              'dashboard',
              'venta',
              'cortes',
              'clients',
              'cobranza',
              'salesHistory',
              'products',
              'materials',
              'production',
              'promos',
              'messages'
            ]
          },
          period: {
            type: 'string',
            enum: ['day', 'week', 'month', 'year', 'historial'],
            description: 'Solo para Cortes'
          },
          city: {
            type: 'string',
            enum: ['all', 'culiacan', 'mochis', 'mazatlan'],
            description: 'Sucursal del corte'
          },
          clientId: { type: 'string' },
          productSlug: { type: 'string' },
          reason: { type: 'string', description: 'Por qué navegas (breve, para el usuario)' }
        },
        required: ['section']
      }
    }
  }
];

function systemPrompt(context) {
  const ctx = context && typeof context === 'object' ? context : {};
  return [
    'Eres el copiloto operativo de S-35 Midday (materiales de construcción, México).',
    'Responde siempre en español, breve y claro. Usa montos en MXN con formato $X,XXX.XX.',
    'SOLO usa cifras del CONTEXTO DE NEGOCIO que te pasan. Si no hay dato, dilo y sugiere abrir Cortes o importar datos.',
    'Cuando el usuario pida ver una gráfica, corte, cliente o producto, llama a la tool navigate.',
    'No inventes tickets, clientes ni inventarios. No menciones API keys ni detalles técnicos internos.',
    'Las cifras del contexto son las ventas unificadas del sistema. Si un ticket trae usuario/vendedor, puedes mencionarlo.',
    '',
    'CONTEXTO DE NEGOCIO (JSON):',
    JSON.stringify(ctx).slice(0, 12000)
  ].join('\n');
}

async function openaiChat(messages) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const err = new Error('Falta OPENAI_API_KEY en el servidor');
    err.code = 'NO_KEY';
    throw err;
  }
  const model = process.env.S35_AI_MODEL || 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      temperature: 0.3,
      messages: messages,
      tools: TOOLS,
      tool_choice: 'auto'
    })
  });
  const data = await res.json().catch(function () {
    return {};
  });
  if (!res.ok) {
    const msg =
      (data && data.error && data.error.message) ||
      ('OpenAI error HTTP ' + res.status);
    const err = new Error(msg);
    err.code = 'OPENAI';
    err.status = res.status;
    throw err;
  }
  return data;
}

function extractActions(message) {
  const actions = [];
  const calls = (message && message.tool_calls) || [];
  calls.forEach(function (call) {
    if (!call || !call.function || call.function.name !== 'navigate') return;
    let args = {};
    try {
      args = JSON.parse(call.function.arguments || '{}');
    } catch (_) {
      args = {};
    }
    actions.push({
      type: 'navigate',
      section: args.section,
      period: args.period || null,
      city: args.city || null,
      clientId: args.clientId || null,
      productSlug: args.productSlug || null,
      reason: args.reason || ''
    });
  });
  return actions;
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

  const user = requireAdmin(req);
  if (!user) {
    res.status(401).json({ ok: false, error: 'Solo admin puede usar el copiloto' });
    return;
  }

  const body = parseBody(req);
  const messagesIn = Array.isArray(body.messages) ? body.messages : [];
  const context = body.context || {};
  const mode = body.mode === 'briefing' ? 'briefing' : 'chat';

  const cleaned = messagesIn
    .filter(function (m) {
      return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string';
    })
    .slice(-12)
    .map(function (m) {
      return { role: m.role, content: String(m.content).slice(0, 4000) };
    });

  if (mode === 'briefing') {
    cleaned.length = 0;
    cleaned.push({
      role: 'user',
      content:
        'Genera el briefing de apertura del dashboard en 3 a 5 frases cortas: ' +
        'cómo van ventas hoy vs ayer, ciudades relevantes, alertas de atención si hay, ' +
        'y una sugerencia de acción. Sin saludos largos.'
    });
  } else if (!cleaned.length) {
    res.status(400).json({ ok: false, error: 'Falta mensaje' });
    return;
  }

  const apiMessages = [{ role: 'system', content: systemPrompt(context) }].concat(cleaned);

  try {
    let data = await openaiChat(apiMessages);
    let choice = data.choices && data.choices[0];
    let message = choice && choice.message;
    let actions = extractActions(message);

    // Un round de tools: respondemos al modelo con resultado sintético y pedimos texto final
    if (actions.length && message && message.tool_calls) {
      const follow = apiMessages.concat([
        {
          role: 'assistant',
          content: message.content || null,
          tool_calls: message.tool_calls
        }
      ]);
      message.tool_calls.forEach(function (call) {
        follow.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify({
            ok: true,
            queued: true,
            note: 'El panel ejecutará la navegación en el cliente.'
          })
        });
      });
      data = await openaiChat(follow);
      choice = data.choices && data.choices[0];
      message = choice && choice.message;
      // keep original navigate actions
    }

    const reply = String((message && message.content) || '').trim() ||
      (actions.length
        ? (actions[0].reason || 'Listo, te llevo ahí.')
        : 'No pude generar respuesta. Intenta de nuevo.');

    res.status(200).json({
      ok: true,
      reply: reply,
      actions: actions,
      model: process.env.S35_AI_MODEL || 'gpt-4o-mini',
      usage: data.usage || null
    });
  } catch (err) {
    const status = err.code === 'NO_KEY' ? 503 : err.status && err.status < 500 ? 400 : 502;
    res.status(status).json({
      ok: false,
      error: err.message || 'Error del copiloto'
    });
  }
};
