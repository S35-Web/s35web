'use strict';

/**
 * Folios POS. La secuencia vive en Mongo (findOneAndUpdate $inc), que es el
 * equivalente atómico a un UPDATE ... RETURNING: nunca retrocede y dos cobros
 * simultáneos reciben números distintos. El índice único de `folio` rechaza
 * un duplicado si la secuencia se hubiera quedado atrás.
 *
 * Colecciones:
 *   pos_folio_seq      { _id: 'POS', seq }
 *   pos_sales          una venta por documento, folio único
 *   pos_checkout_keys  una fila por intento de cobro (idempotencia)
 */

const SEQ_ID = 'POS';
const SEQ_COLLECTION = 'pos_folio_seq';
const SALES_COLLECTION = 'pos_sales';
const KEYS_COLLECTION = 'pos_checkout_keys';
const PANEL_STATE = 'panel_state';
const SALES_KEY = 's35_pos_sales';

function parsePosSeq(folio) {
  const m = /^POS-(\d+)$/i.exec(String(folio || '').trim());
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return n > 0 ? n : null;
}

function formatPosFolio(n) {
  const seq = Math.floor(Number(n) || 0);
  if (seq < 1) return '';
  return 'POS-' + String(seq).padStart(4, '0');
}

function maxPosSeq(sales) {
  let max = 0;
  (sales || []).forEach(function (sale) {
    const n = parsePosSeq(sale && sale.folio);
    if (n && n > max) max = n;
  });
  return max;
}

function saleStamp(sale) {
  const t = Date.parse(sale && (sale.createdAt || sale.updatedAt || sale.editedAt) || '');
  return isFinite(t) ? t : 0;
}

/**
 * Los duplicados más recientes reciben el siguiente folio libre.
 * La copia más antigua conserva el folio original.
 * `reservedMax` sube el piso con folios que ya existen en otro lado
 * (por ejemplo el libro pos_sales) para no reutilizarlos.
 * No escribe nada.
 */
function planPosFolioRepair(sales, reservedMax) {
  const list = (sales || []).filter(function (sale) {
    return sale && sale.id && !sale.deleted && parsePosSeq(sale.folio);
  });
  const groups = Object.create(null);
  list.forEach(function (sale) {
    const folio = String(sale.folio).trim().toUpperCase();
    if (!groups[folio]) groups[folio] = [];
    groups[folio].push(sale);
  });
  const changes = [];
  let max = Math.max(maxPosSeq(list), Math.floor(Number(reservedMax) || 0));
  const beforeMax = max;
  Object.keys(groups).sort().forEach(function (folio) {
    const rows = groups[folio].slice().sort(function (a, b) {
      const delta = saleStamp(a) - saleStamp(b);
      if (delta) return delta;
      return String(a.id).localeCompare(String(b.id));
    });
    if (rows.length < 2) return;
    const kept = rows[0];
    rows.slice(1).forEach(function (row) {
      max += 1;
      changes.push({
        id: row.id,
        from: folio,
        to: formatPosFolio(max),
        createdAt: row.createdAt || '',
        customer: row.customer || '',
        total: row.total == null ? null : Number(row.total),
        keptId: kept.id,
        keptCreatedAt: kept.createdAt || ''
      });
    });
  });
  return {
    beforeMax: beforeMax,
    afterMax: max,
    nextFolio: formatPosFolio(max + 1),
    duplicateFolios: Object.keys(groups).filter(function (folio) {
      return groups[folio].length > 1;
    }).sort(),
    changes: changes
  };
}

function extractSales(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.items)) return value.items;
  return [];
}

function isDuplicateKey(err) {
  return !!(err && (err.code === 11000 || err.code === 11001));
}

function updatedDoc(result) {
  if (!result) return null;
  if (typeof result === 'object' &&
      Object.prototype.hasOwnProperty.call(result, 'value') &&
      Object.prototype.hasOwnProperty.call(result, 'ok')) {
    return result.value || null;
  }
  return result;
}

function sessionOpts(session) {
  return session ? { session: session } : {};
}

let indexesReady = null;

async function ensurePosIndexes(db) {
  if (!indexesReady) {
    indexesReady = Promise.all([
      db.collection(SALES_COLLECTION).createIndex(
        { folio: 1 },
        { unique: true, name: 'pos_sales_folio_unique' }
      ),
      db.collection(KEYS_COLLECTION).createIndex(
        { folio: 1 },
        { name: 'pos_checkout_keys_folio' }
      )
    ]).catch(function (err) {
      indexesReady = null;
      throw err;
    });
  }
  await indexesReady;
}

async function readBlobSales(db) {
  const doc = await db.collection(PANEL_STATE).findOne({ _id: SALES_KEY });
  return extractSales(doc && doc.value);
}

async function readLedgerSales(db) {
  const rows = await db.collection(SALES_COLLECTION).find(
    {},
    { projection: { folio: 1, id: 1, createdAt: 1, customer: 1, total: 1, status: 1, deleted: 1 } }
  ).toArray();
  return rows.map(function (row) {
    if (!row.id && row._id) row.id = String(row._id);
    return row;
  });
}

async function loadFolioSources(db) {
  const blob = await readBlobSales(db);
  let ledger = [];
  try {
    ledger = await readLedgerSales(db);
  } catch (_) {
    ledger = [];
  }
  return { blob: blob, ledger: ledger, combined: blob.concat(ledger) };
}

async function raiseCounterFloor(db, floor, session) {
  const col = db.collection(SEQ_COLLECTION);
  const opts = Object.assign({ upsert: true }, sessionOpts(session));
  await col.updateOne(
    { _id: SEQ_ID },
    { $max: { seq: floor } },
    opts
  );
}

async function bumpCounter(db, session) {
  const col = db.collection(SEQ_COLLECTION);
  const result = await col.findOneAndUpdate(
    { _id: SEQ_ID },
    { $inc: { seq: 1 } },
    Object.assign({ upsert: true, returnDocument: 'after' }, sessionOpts(session))
  );
  const doc = updatedDoc(result);
  const seq = doc && Math.floor(Number(doc.seq) || 0);
  if (!seq || seq < 1) throw new Error('No se pudo avanzar la secuencia de folios');
  return seq;
}

/**
 * Sube el piso al máximo ya usado y luego incrementa.
 * $max no baja la secuencia si ya iba más adelante.
 */
async function allocatePosFolio(db, session, floor) {
  const base = Math.max(0, Math.floor(Number(floor) || 0));
  await raiseCounterFloor(db, base, session);
  const seq = await bumpCounter(db, session);
  return { seq: seq, folio: formatPosFolio(seq) };
}

function sanitizeIncomingSale(raw) {
  const sale = raw && typeof raw === 'object' ? Object.assign({}, raw) : null;
  if (!sale) return { error: 'Falta la venta' };
  const items = Array.isArray(sale.items) ? sale.items : [];
  if (!items.length) return { error: 'La venta no trae productos' };
  const total = Number(sale.total);
  if (!isFinite(total)) return { error: 'Total inválido' };
  delete sale.folio;
  delete sale.idempotencyKey;
  if (sale.status === 'cancelada') delete sale.status;
  const id = String(sale.id || '').trim();
  if (!/^sale-[a-z0-9-]{6,80}$/i.test(id)) {
    return { error: 'Identificador de venta inválido' };
  }
  sale.id = id;
  sale.total = Math.round(total * 100) / 100;
  sale.items = items.map(function (it) {
    const row = {
      product: it && it.product,
      name: it && it.name,
      code: it && it.code,
      unit: it && it.unit,
      price: Number(it && it.price) || 0,
      qty: Number(it && it.qty) || 0,
      lineTotal: it && it.lineTotal != null ? Number(it.lineTotal) : (Number(it && it.qty) || 0) * (Number(it && it.price) || 0)
    };
    if (it && it.basePrice != null) row.basePrice = it.basePrice;
    if (it && it.priceOverride != null) row.priceOverride = it.priceOverride;
    if (it && it.priceOverridePct != null) row.priceOverridePct = it.priceOverridePct;
    if (it && it.isPromo) row.isPromo = true;
    if (it && it.promoCode) row.promoCode = it.promoCode;
    if (it && it.promoAuto) row.promoAuto = true;
    if (it && it.promoPriceAuto) row.promoPriceAuto = true;
    return row;
  });
  return { sale: sale };
}

async function insertSaleWithUniqueFolio(db, sale, session, floor) {
  const col = db.collection(SALES_COLLECTION);
  let guard = 0;
  let lastError = null;
  while (guard < 8) {
    guard += 1;
    const issued = await allocatePosFolio(db, session, floor);
    const doc = Object.assign({}, sale, {
      _id: sale.id,
      folio: issued.folio,
      folioSeq: issued.seq,
      status: sale.status || 'activa'
    });
    if (doc.note && typeof doc.note === 'object') {
      doc.note = Object.assign({}, doc.note, { folio: issued.folio });
    }
    try {
      await col.insertOne(doc, sessionOpts(session));
      return doc;
    } catch (err) {
      lastError = err;
      if (!isDuplicateKey(err)) throw err;
      const again = await col.findOne({ _id: sale.id }, sessionOpts(session));
      if (again) return again;
      floor = issued.seq;
    }
  }
  throw lastError || new Error('No se pudo reservar un folio único');
}

async function checkoutPosSaleInSession(db, input, session) {
  const key = String(input && input.idempotencyKey || '').trim();
  if (!/^ck-[a-z0-9-]{8,80}$/i.test(key)) {
    return { status: 400, body: { error: 'Falta la clave del intento de cobro' } };
  }
  const parsed = sanitizeIncomingSale(input && input.sale);
  if (parsed.error) return { status: 400, body: { error: parsed.error } };

  const keys = db.collection(KEYS_COLLECTION);
  const existing = await keys.findOne({ _id: key }, sessionOpts(session));
  if (existing && existing.sale && existing.sale.folio) {
    return { status: 200, body: { ok: true, replay: true, sale: existing.sale } };
  }

  if (!existing) {
    try {
      await keys.insertOne({
        _id: key,
        status: 'pending',
        saleId: parsed.sale.id,
        createdAt: new Date().toISOString()
      }, sessionOpts(session));
    } catch (err) {
      if (!isDuplicateKey(err)) throw err;
      const raced = await keys.findOne({ _id: key }, sessionOpts(session));
      if (raced && raced.sale && raced.sale.folio) {
        return { status: 200, body: { ok: true, replay: true, sale: raced.sale } };
      }
      return { status: 409, body: { error: 'Ese cobro ya se está registrando. Reintenta con la misma clave.' } };
    }
  }

  const sources = await loadFolioSources(db);
  const floor = maxPosSeq(sources.combined);
  const stored = await insertSaleWithUniqueFolio(db, parsed.sale, session, floor);
  const publicSale = Object.assign({}, stored);
  delete publicSale._id;
  await keys.updateOne(
    { _id: key },
    { $set: { status: 'done', folio: publicSale.folio, sale: publicSale, finishedAt: new Date().toISOString() } },
    sessionOpts(session)
  );
  return { status: 200, body: { ok: true, replay: false, sale: publicSale } };
}

async function checkoutPosSale(db, input) {
  await ensurePosIndexes(db);
  // $inc del contador y el índice único de folio son atómicos cada uno.
  // No hace falta una transacción multi-documento: si el insert del folio
  // choca, se pide otro número y el anterior queda consumido.
  return checkoutPosSaleInSession(db, input, null);
}

async function cancelPosSale(db, input) {
  await ensurePosIndexes(db);
  const folio = String(input && input.folio || '').trim().toUpperCase();
  const id = String(input && input.id || '').trim();
  if (!parsePosSeq(folio)) return { status: 400, body: { error: 'Folio POS inválido' } };
  if (!id) return { status: 400, body: { error: 'Falta la venta' } };
  const now = new Date().toISOString();
  const patch = {
    status: 'cancelada',
    cancelledAt: now,
    cancelledBy: input && input.cancelledBy ? input.cancelledBy : null,
    updatedAt: now,
    editedAt: now
  };
  const col = db.collection(SALES_COLLECTION);
  const existing = await col.findOne({ $or: [{ _id: id }, { folio: folio }] });
  if (existing && existing.folio && String(existing.folio).toUpperCase() !== folio) {
    return { status: 409, body: { error: 'La venta ya tiene otro folio' } };
  }
  if (!existing) {
    await col.insertOne(Object.assign({
      _id: id,
      id: id,
      folio: folio,
      folioSeq: parsePosSeq(folio)
    }, patch));
  } else {
    await col.updateOne(
      { _id: existing._id },
      { $set: patch }
    );
  }
  const floor = Math.max(parsePosSeq(folio) || 0, maxPosSeq(await readBlobSales(db)));
  await raiseCounterFloor(db, floor, null);
  return { status: 200, body: { ok: true, folio: folio, statusSale: 'cancelada' } };
}

function formatRepairReport(plan) {
  const lines = [];
  lines.push('Folios POS duplicados');
  lines.push('Máximo antes: ' + (plan.beforeMax ? formatPosFolio(plan.beforeMax) : 'ninguno'));
  lines.push('Máximo después: ' + (plan.afterMax ? formatPosFolio(plan.afterMax) : 'ninguno'));
  lines.push('Siguiente folio: ' + (plan.nextFolio || '—'));
  lines.push('Folios repetidos: ' + (plan.duplicateFolios.length ? plan.duplicateFolios.join(', ') : 'ninguno'));
  lines.push('');
  if (!plan.changes.length) {
    lines.push('No hay copias recientes que reasignar.');
    return lines.join('\n');
  }
  lines.push('ANTES → DESPUÉS (se queda la venta más antigua de cada folio)');
  plan.changes.forEach(function (row) {
    lines.push(
      row.from + '  ' + row.id +
      '  ' + (row.createdAt || 'sin fecha') +
      '  ' + (row.customer || 'sin cliente') +
      '  $' + (row.total == null ? '—' : row.total) +
      '  →  ' + row.to +
      '   (conserva ' + row.from + ': ' + row.keptId + ')'
    );
  });
  return lines.join('\n');
}

module.exports = {
  SEQ_ID: SEQ_ID,
  SALES_KEY: SALES_KEY,
  parsePosSeq: parsePosSeq,
  formatPosFolio: formatPosFolio,
  maxPosSeq: maxPosSeq,
  planPosFolioRepair: planPosFolioRepair,
  extractSales: extractSales,
  formatRepairReport: formatRepairReport,
  ensurePosIndexes: ensurePosIndexes,
  loadFolioSources: loadFolioSources,
  allocatePosFolio: allocatePosFolio,
  checkoutPosSale: checkoutPosSale,
  cancelPosSale: cancelPosSale,
  readBlobSales: readBlobSales
};
