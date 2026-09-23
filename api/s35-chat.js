/**
 * S35 Copiloto — cerebro del panel.
 * Tools de lectura se ejecutan en el cliente (datos locales + histórico).
 * navigate se ejecuta en el cliente como acción de UI.
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
      name: 'get_sales_summary',
      description:
        'Consulta ventas reales del sistema para un periodo. Usa offset relativo: 0=periodo actual, -1=anterior, -2=hace dos (ej. día: 0=hoy, -1=ayer, -2=antier).',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['day', 'week', 'month', 'year', 'historial'],
            description: 'Granularidad del corte. Usa historial para toda la historia.'
          },
          offset: {
            type: 'integer',
            description: '0 actual, -1 anterior, -2 el de antes, etc. Default 0'
          },
          city: {
            type: 'string',
            enum: ['all', 'culiacan', 'mochis', 'mazatlan'],
            description: 'Sucursal o all. Default all'
          }
        },
        required: ['period']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'compare_sales_periods',
      description:
        'Compara dos periodos del mismo tipo (ej. ayer vs antier: period=day, offsetA=-1, offsetB=-2).',
      parameters: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['day', 'week', 'month', 'year'] },
          offsetA: { type: 'integer', description: 'Primer periodo (ej. -1 = ayer)' },
          offsetB: { type: 'integer', description: 'Segundo periodo (ej. -2 = antier)' },
          city: {
            type: 'string',
            enum: ['all', 'culiacan', 'mochis', 'mazatlan']
          }
        },
        required: ['period', 'offsetA', 'offsetB']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_sales',
      description: 'Busca tickets/notas por folio, cliente, RFC o texto.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'integer', description: 'Máx resultados, default 8' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'lookup_client',
      description: 'Busca clientes por nombre, empresa, teléfono o RFC y resume actividad.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'integer' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'top_products',
      description: 'Top productos por monto en un periodo (incluye historial = toda la historia).',
      parameters: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['day', 'week', 'month', 'year', 'historial'] },
          offset: { type: 'integer' },
          city: {
            type: 'string',
            enum: ['all', 'culiacan', 'mochis', 'mazatlan']
          },
          limit: { type: 'integer', description: 'Cantidad (ej. 10). Default 10, máx 25' }
        },
        required: ['period']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'top_clients',
      description:
        'Top clientes por monto. Para «toda la historia» usa period=historial y limit=10. Excluye tickets sin cliente real (p. ej. Histórico importado).',
      parameters: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['day', 'week', 'month', 'year', 'historial'] },
          offset: { type: 'integer' },
          city: {
            type: 'string',
            enum: ['all', 'culiacan', 'mochis', 'mazatlan']
          },
          limit: { type: 'integer', description: 'Cantidad (ej. 10). Default 10, máx 25' }
        },
        required: ['period']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'stock_alerts',
      description: 'Alertas de stock bajo / materias primas y productos sin movimiento reciente.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'navigate',
      description:
        'Navega el panel a una sección. Úsalo cuando el usuario quiera VER algo (corte, cliente, producto), no solo preguntar cifras.',
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
            enum: ['day', 'week', 'month', 'year', 'historial']
          },
          city: {
            type: 'string',
            enum: ['all', 'culiacan', 'mochis', 'mazatlan']
          },
          clientId: { type: 'string' },
          productSlug: { type: 'string' },
          reason: { type: 'string' }
        },
        required: ['section']
      }
    }
  }
];

const CLIENT_DATA_TOOLS = {
  get_sales_summary: true,
  compare_sales_periods: true,
  search_sales: true,
  lookup_client: true,
  top_products: true,
  top_clients: true,
  stock_alerts: true
};

function systemPrompt(context) {
  const ctx = context && typeof context === 'object' ? context : {};
  return [
    'Eres el copiloto operativo de S-35 Midday (materiales de construcción, México).',
    'Responde siempre en español, breve y claro. Montos en MXN con formato $X,XXX.XX.',
    'Eres el cerebro del panel: para cifras de periodos, ciudades, clientes, productos o stock DEBES usar tools.',
    'Offsets de día: 0=hoy, -1=ayer, -2=antier. Semana/mes/año igual (0 actual, -1 anterior).',
    'Para «toda la historia / histórico / all time» usa period=historial (no inventes tops).',
    'Si top_clients trae note sobre tickets sin cliente, menciónalo breve y lista el top de items[] (nunca digas que no hay top 10 si items tiene filas).',
    'El CONTEXTO es solo un snapshot rápido. Si falta un dato (ej. antier o top 10), llama la tool correspondiente.',
    'No inventes tickets ni totales. Si la tool devuelve vacío, dilo.',
    'Para abrir pantallas usa navigate. Para solo informar cifras, no navegues salvo que el usuario lo pida.',
    '',
    'SNAPSHOT (JSON):',
    JSON.stringify(ctx).slice(0, 10000)
  ].join('\n');
}

function sanitizeMessages(messagesIn) {
  const out = [];
  (Array.isArray(messagesIn) ? messagesIn : []).forEach(function (m) {
    if (!m || typeof m !== 'object') return;
    if (m.role === 'user') {
      const content = typeof m.content === 'string' ? m.content.slice(0, 4000) : '';
      if (!content.trim()) return;
      out.push({ role: 'user', content: content });
      return;
    }
    if (m.role === 'assistant') {
      const row = { role: 'assistant', content: m.content == null ? null : String(m.content).slice(0, 8000) };
      if (Array.isArray(m.tool_calls) && m.tool_calls.length) {
        row.tool_calls = m.tool_calls.slice(0, 12).map(function (c) {
          return {
            id: c.id,
            type: 'function',
            function: {
              name: c.function && c.function.name,
              arguments:
                typeof (c.function && c.function.arguments) === 'string'
                  ? c.function.arguments.slice(0, 4000)
                  : JSON.stringify((c.function && c.function.arguments) || {}).slice(0, 4000)
            }
          };
        });
      }
      out.push(row);
      return;
    }
    if (m.role === 'tool') {
      out.push({
        role: 'tool',
        tool_call_id: String(m.tool_call_id || ''),
        content: String(m.content || '').slice(0, 12000)
      });
    }
  });
  return out.slice(-24);
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
      temperature: 0.2,
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

function parseToolArgs(call) {
  try {
    return JSON.parse((call.function && call.function.arguments) || '{}');
  } catch (_) {
    return {};
  }
}

function extractNavigateActions(message) {
  const actions = [];
  ((message && message.tool_calls) || []).forEach(function (call) {
    if (!call || !call.function || call.function.name !== 'navigate') return;
    const args = parseToolArgs(call);
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

function classifyToolCalls(message) {
  const calls = (message && message.tool_calls) || [];
  const dataCalls = [];
  const navigateCalls = [];
  calls.forEach(function (call) {
    const name = call && call.function && call.function.name;
    if (!name) return;
    if (name === 'navigate') navigateCalls.push(call);
    else if (CLIENT_DATA_TOOLS[name]) dataCalls.push(call);
  });
  return { dataCalls: dataCalls, navigateCalls: navigateCalls, all: calls };
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
  const context = body.context || {};
  const cleaned = sanitizeMessages(body.messages);

  if (!cleaned.length) {
    res.status(400).json({ ok: false, error: 'Falta mensaje' });
    return;
  }

  const apiMessages = [{ role: 'system', content: systemPrompt(context) }].concat(cleaned);

  try {
    const data = await openaiChat(apiMessages);
    const choice = data.choices && data.choices[0];
    const message = choice && choice.message;
    const classified = classifyToolCalls(message);
    const navigateActions = extractNavigateActions(message);

    // Tools de datos → el cliente las ejecuta y reenvía
    if (classified.dataCalls.length) {
      res.status(200).json({
        ok: true,
        status: 'tool_calls',
        toolCalls: classified.all.map(function (c) {
          return {
            id: c.id,
            name: c.function.name,
            arguments: parseToolArgs(c)
          };
        }),
        assistantToolCalls: classified.all,
        actions: navigateActions,
        model: process.env.S35_AI_MODEL || 'gpt-4o-mini',
        usage: data.usage || null
      });
      return;
    }

    // Solo navigate → sintetizar resultado y pedir texto final
    if (classified.navigateCalls.length && message.tool_calls) {
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
      const data2 = await openaiChat(follow);
      const choice2 = data2.choices && data2.choices[0];
      const message2 = choice2 && choice2.message;
      const reply =
        String((message2 && message2.content) || '').trim() ||
        (navigateActions[0] && navigateActions[0].reason) ||
        'Listo, te llevo ahí.';
      res.status(200).json({
        ok: true,
        status: 'reply',
        reply: reply,
        actions: navigateActions,
        model: process.env.S35_AI_MODEL || 'gpt-4o-mini',
        usage: data2.usage || data.usage || null
      });
      return;
    }

    const reply = String((message && message.content) || '').trim() ||
      'No pude generar respuesta. Intenta de nuevo.';
    res.status(200).json({
      ok: true,
      status: 'reply',
      reply: reply,
      actions: [],
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
