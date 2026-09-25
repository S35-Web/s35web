/**
 * S35 Copiloto — cerebro del panel.
 * Tools de lectura se ejecutan en el cliente (datos locales + histórico).
 * navigate se ejecuta en el cliente como acción de UI.
 */
const jwt = require('jsonwebtoken');
const { recordCopilotUsage } = require('../lib/copilot-usage');

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
      description:
        'Busca tickets/notas por folio, cliente, RFC, UUID CFDI o producto (nombre, slug o código). ' +
        'Úsala para «quién compró X», «última nota de Pulido», «microconcreto blanco», etc. ' +
        'Los resultados vienen ordenados por relevancia y fecha (más recientes primero) e incluyen items[], client y total.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Texto libre: folio, cliente, RFC o producto (ej. "Pulido", "microconcreto blanco")'
          },
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
        'Top clientes por monto. Para «toda la historia» usa period=historial y limit=10. ' +
        'Nunca trates «Histórico importado» como cliente: es data migrada del sistema anterior sin nombre. ' +
        'Esta tool ya lo excluye; reporta el top de items[] y opcionalmente la note.',
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
        'Navega el panel a una sección o abre un recurso. Úsalo cuando el usuario quiera VER algo (corte, cliente, producto, nota), no solo preguntar cifras. ' +
        'Preferible: en respuestas de texto incluye links [[note:id|…]] / [[product:slug|…]] / [[material:id|…]] / [[client:id|…]] para que el usuario abra con un clic.',
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
          saleId: { type: 'string', description: 'ID de nota/ticket para abrir el modal' },
          materialId: { type: 'string', description: 'ID o nombre de materia prima' },
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
    'Formato: usa Markdown ligero que el chat renderiza (negritas **así**, listas con - o 1.). ' +
      'Para una nota/ticket: 1 frase con el dato clave (cliente/total), luego lista Folio / Fecha / Total / Ítems. ' +
      'Sin tablas, sin # encabezados, sin HTML. No pidas confirmación de más info al final salvo que falte un dato.',
    'ENLACES CLICABLES: el chat convierte [[tipo:id|etiqueta]] en botones. Tipos: note (id de venta), product (slug), material (id), client (id). ' +
      'Cuando cites una nota, incluye al final exactamente el campo open de results[] (ej. [[note:sale-…|Ver nota HIST-R64069]]). ' +
      'Si hay productos relevantes con open/product, añade también [[product:slug|nombre]]. ' +
      'Si citas un cliente con id, [[client:id|nombre]]. Para materias primas de stock_alerts usa su open. ' +
      'Copia los ids de las tools; no inventes ids ni slugs.',
    'Eres el cerebro del panel: para cifras de periodos, ciudades, clientes, productos o stock DEBES usar tools.',
    'Offsets de día: 0=hoy, -1=ayer, -2=antier. Semana/mes/año igual (0 actual, -1 anterior).',
    'Para «toda la historia / histórico / all time» usa period=historial (no inventes tops).',
    'IMPORTANTE sobre «Histórico importado»: NO es un cliente. Es la etiqueta de tickets migrados del sistema anterior a S35 Midday; en esa migración no vino el nombre del cliente. Nunca lo trates, listes ni cites como cliente top. Si el usuario pregunta por clientes en el histórico, usa tops de clientes identificados y, si aplica, menciona en una frase que parte de la data migrada aún no tiene nombre de cliente.',
    'Si top_clients trae note sobre tickets sin cliente, menciónalo breve y lista el top de items[] (nunca digas que no hay top 10 si items tiene filas).',
    'El CONTEXTO es solo un snapshot rápido. Si falta un dato (ej. antier o top 10), llama la tool correspondiente.',
    'No inventes tickets ni totales. Si la tool devuelve vacío, dilo.',
    'Para «último cliente que compró X / nota de producto X» usa search_sales con el nombre del producto; responde con cliente, folio, fecha, total e ítems relevantes de results[0] (ya vienen los más recientes primero) y su link open.',
    'Si search_sales encuentra notas, cita folio/cliente/total/fecha e incluye el botón [[note:…]].',
    'Para abrir pantallas de inmediato (sin esperar clic) usa navigate. Para solo informar, no navegues: deja los botones [[…]] en el texto.',
    '',
    'SNAPSHOT (JSON):',
    JSON.stringify(ctx).slice(0, 10000)
  ].join('\n');
}

function mailSystemPrompt(context) {
  const ctx = context && typeof context === 'object' ? context : {};
  const mail = ctx.mail && typeof ctx.mail === 'object' ? ctx.mail : null;
  return [
    'Eres el copiloto de correo de S-35 Midday (materiales de construcción, México).',
    'Responde siempre en español, breve y claro. Markdown ligero: **negritas**, listas con -.',
    'Sin tablas, sin # encabezados, sin HTML crudo.',
    'Trabajas sobre el mensaje seleccionado en CORREO ACTUAL. Si no hay correo, dilo y pide que seleccionen uno.',
    'Puedes: resumir, detectar intención (cotización, queja, pedido, spam), proponer borrador de respuesta, sugerir siguiente paso.',
    'Si el usuario pide borrador: escribe el cuerpo listo para enviar (saludo + respuesta + cierre S-35). ' +
      'Envuélvelo entre marcadores exactamente así:\n<<<DRAFT>>>\n…texto…\n<<<END_DRAFT>>>',
    'Si parece cliente o hay email/nombre, puedes usar lookup_client para cruzar con clientes S35.',
    'ENLACES: [[client:id|nombre]] cuando lookup_client traiga id. No inventes ids.',
    'No digas que puedes enviar el correo desde aquí: hoy solo ayudas a leer y redactar.',
    '',
    'CORREO ACTUAL (JSON):',
    JSON.stringify(mail || { selected: false }).slice(0, 12000),
    '',
    'CONTEXTO EXTRA:',
    JSON.stringify({ note: ctx.note || null, now: ctx.now || null }).slice(0, 2000)
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

function mergeUsage(a, b) {
  if (!a && !b) return null;
  if (!a) return b;
  if (!b) return a;
  return {
    prompt_tokens: (Number(a.prompt_tokens) || 0) + (Number(b.prompt_tokens) || 0),
    completion_tokens: (Number(a.completion_tokens) || 0) + (Number(b.completion_tokens) || 0),
    total_tokens: (Number(a.total_tokens) || 0) + (Number(b.total_tokens) || 0)
  };
}

async function trackUsage(usage, model) {
  try {
    return await recordCopilotUsage(usage, { model: model });
  } catch (err) {
    console.warn('[s35-chat] usage track failed', err && err.message);
    return null;
  }
}

async function openaiChat(messages, opts) {
  opts = opts || {};
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const err = new Error('Falta OPENAI_API_KEY en el servidor');
    err.code = 'NO_KEY';
    throw err;
  }
  const model = process.env.S35_AI_MODEL || 'gpt-4o-mini';
  const payload = {
    model: model,
    temperature: opts.temperature != null ? opts.temperature : 0.2,
    messages: messages
  };
  if (!opts.noTools) {
    payload.tools = Array.isArray(opts.tools) ? opts.tools : TOOLS;
    payload.tool_choice = 'auto';
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
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
      saleId: args.saleId || null,
      materialId: args.materialId || null,
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
  const isMailMode = body.mode === 'mail';

  if (!cleaned.length) {
    res.status(400).json({ ok: false, error: 'Falta mensaje' });
    return;
  }

  const mailTools = TOOLS.filter(function (t) {
    const n = t && t.function && t.function.name;
    return n === 'lookup_client' || n === 'navigate';
  });

  const apiMessages = [
    { role: 'system', content: isMailMode ? mailSystemPrompt(context) : systemPrompt(context) }
  ].concat(cleaned);

  try {
    const data = await openaiChat(apiMessages, {
      tools: isMailMode ? mailTools : TOOLS,
      temperature: isMailMode ? 0.35 : 0.2
    });
    const choice = data.choices && data.choices[0];
    const message = choice && choice.message;
    const modelName = process.env.S35_AI_MODEL || 'gpt-4o-mini';
    const classified = classifyToolCalls(message);
    const navigateActions = extractNavigateActions(message);

    // Tools de datos → el cliente las ejecuta y reenvía
    if (classified.dataCalls.length) {
      const usageSummary = await trackUsage(data.usage, modelName);
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
        model: modelName,
        usage: data.usage || null,
        usageSummary: usageSummary
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
      const combined = mergeUsage(data.usage, data2.usage);
      const usageSummary = await trackUsage(combined, modelName);
      res.status(200).json({
        ok: true,
        status: 'reply',
        reply: reply,
        actions: navigateActions,
        model: modelName,
        usage: combined,
        usageSummary: usageSummary
      });
      return;
    }

    const reply = String((message && message.content) || '').trim() ||
      'No pude generar respuesta. Intenta de nuevo.';
    const usageSummary = await trackUsage(data.usage, modelName);
    res.status(200).json({
      ok: true,
      status: 'reply',
      reply: reply,
      actions: [],
      model: modelName,
      usage: data.usage || null,
      usageSummary: usageSummary
    });
  } catch (err) {
    const status = err.code === 'NO_KEY' ? 503 : err.status && err.status < 500 ? 400 : 502;
    res.status(status).json({
      ok: false,
      error: err.message || 'Error del copiloto'
    });
  }
};
