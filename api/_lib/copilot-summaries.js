/**
 * Totales de solo lectura del copiloto. No habla con Mongo.
 * Las cifras se suman aquí; el modelo no debe recalcularlas.
 */
'use strict';

const SENSITIVE_KEY = /^(password|passwd|token|secret|hash|apikey|api_key|authorization|mongodb_uri|openai_api_key)$/i;
const TOOL_BYTE_LIMIT = 60 * 1024;
const RAW_BYTE_LIMIT = 200 * 1024;
const LIST_CAP = 40;

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function stripSensitive(value) {
  if (Array.isArray(value)) return value.map(stripSensitive);
  if (!value || typeof value !== 'object') {
    if (typeof value === 'string' && /^mongodb(\+srv)?:\/\//i.test(value)) return null;
    return value;
  }
  const out = {};
  Object.keys(value).forEach(function (key) {
    if (SENSITIVE_KEY.test(key)) return;
    out[key] = stripSensitive(value[key]);
  });
  return out;
}

function capToolResult(result, limit) {
  const max = limit || TOOL_BYTE_LIMIT;
  if (!result || typeof result !== 'object') return result;
  if (JSON.stringify(result).length <= max) return result;
  const copy = Object.assign({}, result, { truncated: true });
  ['items', 'results', 'rows'].forEach(function (key) {
    if (Array.isArray(copy[key])) copy[key] = [];
  });
  copy.note = 'Lista recortada por tamaño. totals cubre el conjunto completo.';
  if (JSON.stringify(copy).length <= max) return copy;
  return {
    ok: false,
    truncated: true,
    error: 'respuesta demasiado grande',
    totals: result.totals || null
  };
}

function capRawPayload(payload, limit) {
  const max = limit || RAW_BYTE_LIMIT;
  if (JSON.stringify(payload).length <= max) return payload;
  const next = Object.assign({}, payload);
  next.result = capToolResult(next.result, 8 * 1024);
  next.truncated = true;
  if (JSON.stringify(next).length <= max) return next;
  next.result = { ok: false, truncated: true, error: 'respuesta demasiado grande', totals: payload.result && payload.result.totals };
  return next;
}

function ymdOf(iso, saleYmd) {
  return saleYmd({ createdAt: iso }) || '';
}

function inRange(iso, from, to, saleYmd) {
  const ymd = ymdOf(iso, saleYmd);
  if (!ymd) return false;
  if (from && ymd < from) return false;
  if (to && ymd > to) return false;
  return true;
}

function needRange(args) {
  const from = String((args && args.from) || '').trim();
  const to = String((args && args.to) || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return { error: 'Faltan from y to en YYYY-MM-DD.' };
  }
  return { from: from, to: to };
}

function piecesOf(sale) {
  return (sale.items || []).reduce(function (n, it) { return n + (Number(it.qty) || 0); }, 0);
}

function isPending(sale) {
  if (!sale) return false;
  if ((sale.paymentMethod || '') === 'mixto' && Array.isArray(sale.payments)) {
    return sale.payments.length > 0 && sale.payments.every(function (p) { return p && p.method === 'por_cobrar'; });
  }
  return (sale.paymentMethod || '') === 'por_cobrar';
}

function hasPaymentSignal(sales) {
  return (sales || []).some(function (s) {
    return s && (s.paymentMethod || (Array.isArray(s.payments) && s.payments.length));
  });
}

function pack(rows, totals) {
  const totalRows = rows.length;
  return {
    items: rows.slice(0, LIST_CAP),
    totalRows: totalRows,
    truncated: totalRows > LIST_CAP,
    totals: totals
  };
}

function listPrice(entry) {
  if (!entry) return null;
  if (Array.isArray(entry.tiers) && entry.tiers.length) return round2(entry.tiers[0]);
  return null;
}

function executeSummary(name, args, bag, helpers) {
  args = args || {};
  const names = {
    get_client_balances: 1,
    get_prices: 1,
    get_cash_cuts: 1,
    get_treasury: 1,
    get_production_lots: 1,
    get_formulas: 1,
    get_purchases: 1,
    get_promos: 1,
    get_sale_edits: 1,
    get_catalog: 1,
    get_inventory_totals: 1,
    get_sales_breakdown: 1,
    get_below_min: 1
  };
  if (!names[name]) return null;
  const saleYmd = helpers.saleYmd;
  const cityId = helpers.normalizeCityId(args.city);
  const sales = bag.sales || [];

  if (name === 'get_client_balances') {
    const warnings = [];
    const creditOnFile = (bag.clients || []).some(function (c) {
      return c && (c.creditLimit != null || c.limite != null || c.limiteCredito != null || c.saldo != null || c.balance != null);
    });
    if (!creditOnFile && !hasPaymentSignal(sales)) warnings.push('saldo no disponible');
    const needle = helpers.normalizeSearchText(args.query || '');
    const rows = [];
    (bag.clients || []).forEach(function (c) {
      if (!c) return;
      if (needle) {
        const hay = [c.name, c.company, c.rfc, c.id].join(' ');
        if (!helpers.textMatchesTokens(hay, helpers.searchTokens(args.query), needle) &&
          helpers.normalizeSearchText(c.name).indexOf(needle) < 0) return;
      }
      const own = sales.filter(function (s) {
        if (c.id && s.clientId === c.id) return true;
        return false;
      });
      const pending = own.filter(isPending);
      const balance = round2(pending.reduce(function (n, s) { return n + (Number(s.total) || 0); }, 0));
      const row = {
        id: c.id,
        name: c.name,
        company: c.company || '',
        tickets: own.length,
        pendingTickets: pending.length,
        balance: balance,
        open: c.id ? ('[[client:' + c.id + '|' + (c.name || 'Cliente') + ']]') : null
      };
      if (c.creditLimit != null) row.creditLimit = c.creditLimit;
      if (c.limite != null) row.limite = c.limite;
      if (c.limiteCredito != null) row.limiteCredito = c.limiteCredito;
      if (c.saldo != null) row.saldo = c.saldo;
      if (c.balance != null) row.balanceField = c.balance;
      rows.push(row);
    });
    const totals = {
      rows: rows.length,
      pieces: 0,
      amount: round2(rows.reduce(function (n, r) { return n + r.balance; }, 0)),
      tickets: rows.reduce(function (n, r) { return n + r.pendingTickets; }, 0)
    };
    return Object.assign({
      ok: true,
      query: args.query || '',
      note: creditOnFile
        ? 'balance suma notas por_cobrar. Los campos de crédito se copian solo si el cliente ya los trae.'
        : 'El panel no guarda límite de crédito. balance es la suma de notas con paymentMethod por_cobrar.',
      warnings: warnings
    }, pack(rows, totals));
  }

  if (name === 'get_prices') {
    const needle = helpers.normalizeSearchText(args.query || '');
    const rows = [];
    Object.keys(bag.prices || {}).forEach(function (slug) {
      if (needle && helpers.normalizeSearchText(slug).indexOf(needle) < 0 &&
        !helpers.textMatchesTokens(slug, helpers.searchTokens(args.query), needle)) return;
      const entry = bag.prices[slug] || {};
      rows.push({
        slug: slug,
        presentationKg: entry.presentationKg != null ? entry.presentationKg : null,
        listPrice: listPrice(entry),
        tiers: entry.tiers || [],
        distributorPrice: entry.distributorPrice != null ? entry.distributorPrice : null,
        open: '[[product:' + slug + '|' + slug + ']]'
      });
    });
    rows.sort(function (a, b) { return String(a.slug).localeCompare(String(b.slug), 'es'); });
    return Object.assign({
      ok: true,
      city: cityId || 'all',
      note: 'Lista única: no hay precio distinto por ciudad. listPrice es tiers[0], menudeo.',
      priceBasis: 'tiers[0]'
    }, pack(rows, {
      rows: rows.length,
      pieces: 0,
      amount: round2(rows.reduce(function (n, r) { return n + (Number(r.listPrice) || 0); }, 0))
    }));
  }

  if (name === 'get_cash_cuts') {
    const range = needRange(args);
    if (range.error) return { ok: false, error: range.error };
    let list = sales.filter(function (s) { return inRange(s.createdAt, range.from, range.to, saleYmd); });
    if (args.city && args.city !== 'all') list = list.filter(function (s) { return s.city === cityId; });
    const byMethod = { efectivo: 0, tarjeta: 0, transferencia: 0, por_cobrar: 0, otro: 0 };
    list.forEach(function (s) {
      const key = byMethod[s.paymentMethod] != null ? s.paymentMethod : 'otro';
      byMethod[key] = round2(byMethod[key] + (Number(s.total) || 0));
    });
    let gastos = (bag.gastos || []).filter(function (g) {
      return g && !g.deleted && inRange(g.createdAt, range.from, range.to, saleYmd);
    });
    if (args.city && args.city !== 'all') gastos = gastos.filter(function (g) { return (g.city || 'culiacan') === cityId; });
    const gastoTotal = round2(gastos.reduce(function (n, g) { return n + (Number(g.amount) || 0); }, 0));
    const pieces = round2(list.reduce(function (n, s) { return n + piecesOf(s); }, 0));
    const amount = round2(list.reduce(function (n, s) { return n + (Number(s.total) || 0); }, 0));
    const gastoRows = gastos.map(function (g) {
      return { id: g.id, createdAt: g.createdAt, city: g.city || null, amount: round2(g.amount), concept: g.concept || g.note || '' };
    });
    return Object.assign({
      ok: true,
      from: range.from,
      to: range.to,
      city: args.city && args.city !== 'all' ? cityId : 'all',
      byMethod: byMethod,
      efectivoNeto: round2(byMethod.efectivo - gastoTotal),
      cajaGastosTotal: gastoTotal
    }, pack(gastoRows, { rows: list.length, pieces: pieces, amount: amount, tickets: list.length }));
  }

  if (name === 'get_treasury') {
    const range = needRange(args);
    if (range.error) return { ok: false, error: range.error };
    let rows = (bag.treasury || []).filter(function (m) {
      return m && !m.deleted && inRange(m.createdAt, range.from, range.to, saleYmd);
    });
    if (args.account) rows = rows.filter(function (m) { return m.account === args.account; });
    const signed = round2(rows.reduce(function (n, m) {
      const amt = Math.abs(Number(m.amount) || 0);
      if (m.type === 'retiro' || m.type === 'gasto') return n - amt;
      return n + (Number(m.signed) || amt);
    }, 0));
    const view = rows.map(function (m) {
      return {
        id: m.id,
        createdAt: m.createdAt,
        account: m.account || null,
        type: m.type || null,
        amount: round2(m.amount),
        city: m.city || null,
        note: m.note || ''
      };
    });
    return Object.assign({
      ok: true,
      from: range.from,
      to: range.to,
      account: args.account || 'all'
    }, pack(view, { rows: rows.length, pieces: 0, amount: signed, tickets: rows.length }));
  }

  if (name === 'get_production_lots') {
    const range = needRange(args);
    if (range.error) return { ok: false, error: range.error };
    const needle = helpers.normalizeSearchText(args.query || '');
    let rows = (bag.lots || []).filter(function (lot) {
      if (!lot || lot.deleted) return false;
      const stamp = lot.issuedAt || lot.createdAt || lot.confirmedAt;
      return inRange(stamp, range.from, range.to, saleYmd);
    });
    if (needle) {
      rows = rows.filter(function (lot) {
        const hay = [lot.id, lot.code, lot.name, lot.product].join(' ');
        return helpers.textMatchesTokens(hay, helpers.searchTokens(args.query), needle);
      });
    }
    const bags = round2(rows.reduce(function (n, lot) { return n + (Number(lot.bagsOut != null ? lot.bagsOut : lot.bagsExpected) || 0); }, 0));
    const view = rows.map(function (lot) {
      return {
        id: lot.id,
        product: lot.product || null,
        code: lot.code || null,
        name: lot.name || null,
        status: lot.status || null,
        issuedAt: lot.issuedAt || lot.createdAt || null,
        city: lot.city || null,
        bagsExpected: lot.bagsExpected != null ? lot.bagsExpected : null,
        bagsOut: lot.bagsOut != null ? lot.bagsOut : null
      };
    });
    return Object.assign({
      ok: true,
      from: range.from,
      to: range.to
    }, pack(view, { rows: rows.length, pieces: bags, amount: 0, tickets: rows.length }));
  }

  if (name === 'get_formulas') {
    const needle = helpers.normalizeSearchText(args.query || '');
    if (!needle || needle.length < 2) return { ok: false, error: 'query corta' };
    const rows = [];
    Object.keys(bag.formulas || {}).forEach(function (slug) {
      const f = bag.formulas[slug];
      if (!f || typeof f !== 'object') return;
      const hay = slug + ' ' + (f.name || '');
      if (!helpers.textMatchesTokens(hay, helpers.searchTokens(args.query), needle) &&
        helpers.normalizeSearchText(slug).indexOf(needle) < 0) return;
      const items = (Array.isArray(f.items) ? f.items : []).slice(0, 40).map(function (it) {
        return {
          plantId: it && it.plantId || null,
          name: it && it.name || null,
          amount: it && it.amount != null ? it.amount : null,
          unit: it && it.unit || null,
          role: it && it.role || null
        };
      });
      rows.push({
        slug: slug,
        name: f.name || slug,
        confidential: true,
        items: items
      });
    });
    return Object.assign({
      ok: true,
      confidential: true,
      note: 'Fórmula confidencial. Solo lectura.'
    }, pack(rows, { rows: rows.length, pieces: 0, amount: 0, tickets: rows.length }));
  }

  if (name === 'get_purchases') {
    const range = needRange(args);
    if (range.error) return { ok: false, error: range.error };
    const needle = helpers.normalizeSearchText(args.query || '');
    let rows = (bag.purchases || []).filter(function (p) {
      if (!p || p.deleted) return false;
      return inRange(p.createdAt || p.issuedAt, range.from, range.to, saleYmd);
    });
    if (needle) {
      rows = rows.filter(function (p) {
        const hay = [p.id, p.supplier, p.name, p.concept].join(' ');
        return helpers.textMatchesTokens(hay, helpers.searchTokens(args.query), needle);
      });
    }
    const amount = round2(rows.reduce(function (n, p) { return n + (Number(p.total != null ? p.total : p.amount) || 0); }, 0));
    const view = rows.map(function (p) {
      return {
        id: p.id,
        createdAt: p.createdAt || p.issuedAt || null,
        supplier: p.supplier || p.name || '',
        total: round2(p.total != null ? p.total : p.amount),
        city: p.city || null
      };
    });
    return Object.assign({ ok: true, from: range.from, to: range.to }, pack(view, {
      rows: rows.length, pieces: 0, amount: amount, tickets: rows.length
    }));
  }

  if (name === 'get_promos') {
    const rows = (bag.promos || []).filter(function (p) { return p && !p.deleted; }).map(function (p) {
      return {
        id: p.id || p.code || null,
        code: p.code || null,
        type: p.type || null,
        active: p.active !== false,
        percentOff: p.percentOff != null ? p.percentOff : null,
        fixedOff: p.fixedOff != null ? p.fixedOff : null,
        palletSize: p.palletSize != null ? p.palletSize : null
      };
    });
    return Object.assign({ ok: true }, pack(rows, { rows: rows.length, pieces: 0, amount: 0, tickets: rows.length }));
  }

  if (name === 'get_sale_edits') {
    const range = needRange(args);
    if (range.error) return { ok: false, error: range.error };
    const rows = [];
    Object.keys(bag.edits || {}).forEach(function (id) {
      const patch = bag.edits[id];
      if (!patch || typeof patch !== 'object') return;
      const stamp = patch.editedAt || patch.updatedAt;
      if (!inRange(stamp, range.from, range.to, saleYmd)) return;
      rows.push({
        id: id,
        editedAt: stamp || null,
        deleted: !!patch.deleted,
        fields: Object.keys(patch).filter(function (k) { return !SENSITIVE_KEY.test(k); })
      });
    });
    return Object.assign({ ok: true, from: range.from, to: range.to }, pack(rows, {
      rows: rows.length, pieces: 0, amount: 0, tickets: rows.length
    }));
  }

  if (name === 'get_catalog') {
    const needle = helpers.normalizeSearchText(args.query || '');
    const catalog = bag.catalog || { names: {}, added: [] };
    const rows = [];
    Object.keys(catalog.names || {}).forEach(function (slug) {
      const name = catalog.names[slug];
      if (needle && helpers.normalizeSearchText(slug + ' ' + name).indexOf(needle) < 0) return;
      rows.push({ slug: slug, name: name, source: 'names', open: '[[product:' + slug + '|' + name + ']]' });
    });
    (catalog.added || []).forEach(function (item) {
      if (!item || item.deleted) return;
      const slug = item.slug;
      if (!slug) return;
      if (needle && helpers.normalizeSearchText(slug + ' ' + (item.name || '')).indexOf(needle) < 0) return;
      rows.push({ slug: slug, name: item.name || slug, source: 'added', open: '[[product:' + slug + '|' + (item.name || slug) + ']]' });
    });
    return Object.assign({ ok: true }, pack(rows, { rows: rows.length, pieces: 0, amount: 0, tickets: rows.length }));
  }

  if (name === 'get_inventory_totals') {
    const focus = args.city && args.city !== 'all' ? cityId : 'all';
    const byCity = { culiacan: { pieces: 0, value: 0, skus: 0 }, mochis: { pieces: 0, value: 0, skus: 0 }, mazatlan: { pieces: 0, value: 0, skus: 0 } };
    let missingPrice = 0;
    Object.keys(bag.finished || {}).forEach(function (slug) {
      const row = bag.finished[slug];
      if (!row) return;
      const price = listPrice((bag.prices || {})[slug]);
      if (price == null) missingPrice += 1;
      helpers.CITIES.forEach(function (c) {
        const qty = Number(row.byCity && row.byCity[c.id]) || 0;
        if (!(qty > 0)) return;
        byCity[c.id].pieces = round2(byCity[c.id].pieces + qty);
        byCity[c.id].skus += 1;
        if (price != null) byCity[c.id].value = round2(byCity[c.id].value + qty * price);
      });
    });
    const cities = focus === 'all' ? ['culiacan', 'mochis', 'mazatlan'] : [focus];
    const totals = cities.reduce(function (acc, id) {
      acc.pieces = round2(acc.pieces + byCity[id].pieces);
      acc.value = round2(acc.value + byCity[id].value);
      acc.skus += byCity[id].skus;
      return acc;
    }, { pieces: 0, value: 0, skus: 0, rows: Object.keys(bag.finished || {}).length, amount: 0, tickets: 0 });
    totals.amount = totals.value;
    return {
      ok: true,
      city: focus,
      priceBasis: 'tiers[0] precio de lista (menudeo). No usa precio de distribuidor ni el precio de la última nota.',
      missingPrice: missingPrice,
      byCity: byCity,
      items: cities.map(function (id) {
        return { city: id, pieces: byCity[id].pieces, value: byCity[id].value, skus: byCity[id].skus };
      }),
      totalRows: cities.length,
      truncated: false,
      totals: totals
    };
  }

  if (name === 'get_sales_breakdown') {
    const range = needRange(args);
    if (range.error) return { ok: false, error: range.error };
    const by = ['day', 'product', 'client', 'city'].indexOf(args.by) >= 0 ? args.by : 'day';
    const list = sales.filter(function (s) { return inRange(s.createdAt, range.from, range.to, saleYmd); });
    const groups = {};
    function add(key, label, amount, pieces, tickets) {
      if (!groups[key]) groups[key] = { key: key, label: label, amount: 0, pieces: 0, tickets: 0 };
      groups[key].amount = round2(groups[key].amount + amount);
      groups[key].pieces = round2(groups[key].pieces + pieces);
      groups[key].tickets += tickets;
    }
    list.forEach(function (s) {
      if (by === 'day') {
        const day = ymdOf(s.createdAt, saleYmd);
        add(day, day, Number(s.total) || 0, piecesOf(s), 1);
        return;
      }
      if (by === 'city') {
        add(s.city || 'culiacan', helpers.cityLabel(s.city), Number(s.total) || 0, piecesOf(s), 1);
        return;
      }
      if (by === 'client') {
        const id = s.clientId || helpers.customerName(s) || 'mostrador';
        add(id, helpers.customerName(s) || id, Number(s.total) || 0, piecesOf(s), 1);
        return;
      }
      (s.items || []).forEach(function (it) {
        const slug = it.product || it.name || 'otro';
        const line = it.lineTotal != null ? Number(it.lineTotal) : (Number(it.qty) || 0) * (Number(it.price) || 0);
        add(slug, it.name || slug, line, Number(it.qty) || 0, 1);
      });
    });
    const rows = Object.keys(groups).map(function (k) { return groups[k]; })
      .sort(function (a, b) { return b.amount - a.amount; });
    const totals = {
      rows: rows.length,
      pieces: round2(list.reduce(function (n, s) { return n + piecesOf(s); }, 0)),
      amount: round2(list.reduce(function (n, s) { return n + (Number(s.total) || 0); }, 0)),
      tickets: list.length
    };
    return Object.assign({ ok: true, from: range.from, to: range.to, by: by }, pack(rows, totals));
  }

  if (name === 'get_below_min') {
    const materials = (bag.materials || []).filter(function (m) {
      const minStock = Number(m.minStock) || 0;
      return minStock > 0 && helpers.materialFree(m) < minStock;
    }).map(function (m) {
      const qty = helpers.materialQuantities(m);
      return {
        kind: 'material',
        id: m.id || null,
        name: m.name || m.id,
        free: qty.free,
        minStock: Number(m.minStock) || 0,
        unit: m.unit || '',
        byCity: qty.byCity
      };
    });
    const finished = Object.keys(bag.finished || {}).filter(function (slug) {
      const row = bag.finished[slug];
      const minStock = Number(row.minStock) || 0;
      return minStock > 0 && (Number(row.stock) || 0) < minStock;
    }).map(function (slug) {
      const row = bag.finished[slug];
      return {
        kind: 'finished',
        slug: slug,
        name: row.name || slug,
        stock: Number(row.stock) || 0,
        minStock: Number(row.minStock) || 0,
        byCity: row.byCity || null
      };
    });
    const rows = materials.concat(finished);
    return Object.assign({ ok: true }, pack(rows, {
      rows: rows.length,
      pieces: round2(rows.reduce(function (n, r) { return n + (Number(r.free != null ? r.free : r.stock) || 0); }, 0)),
      amount: 0,
      tickets: rows.length
    }));
  }

  return null;
}

module.exports = {
  executeSummary: executeSummary,
  stripSensitive: stripSensitive,
  capToolResult: capToolResult,
  capRawPayload: capRawPayload,
  SENSITIVE_KEY: SENSITIVE_KEY,
  TOOL_BYTE_LIMIT: TOOL_BYTE_LIMIT,
  RAW_BYTE_LIMIT: RAW_BYTE_LIMIT
};
