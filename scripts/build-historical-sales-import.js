#!/usr/bin/env node
/**
 * Genera public/colaboradores/data/historical-sales-import.json
 * desde notas_lineas (1 ticket = 1 nota/recibo, fecha y hora real).
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DEFAULT_LINES = path.join(ROOT, 'content/panel/analysis/notas_lineas_20260921_151210.csv');
const MAP_PATH = path.join(ROOT, 'content/panel/product-name-map.json');
const OUT_PATH = path.join(ROOT, 'public/colaboradores/data/historical-sales-import.json');

const linesPath = process.argv[2] || DEFAULT_LINES;

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      q = !q;
      continue;
    }
    if (c === ',' && !q) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function readLinesCsv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      'No se encontró el CSV de líneas: ' + filePath +
      '\nExporta notas_lineas desde el panel viejo o pásalo como argumento.'
    );
  }
  return fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
}

/** ISO local (sin Z) para que el navegador respete hora de planta en vistas Día. */
function createdAtLocal(dateStr, timeStr) {
  const d = String(dateStr || '').trim();
  const t = String(timeStr || '12:00:00').trim();
  const parts = t.split(':');
  const hh = parts[0] || '12';
  const mm = parts[1] || '00';
  const ss = parts[2] || '00';
  return d + 'T' + hh.padStart(2, '0') + ':' + mm.padStart(2, '0') + ':' + ss.padStart(2, '0');
}

function mergeLineItems(items) {
  const byProduct = {};
  items.forEach(function (it) {
    const key = it.product;
    if (!byProduct[key]) {
      byProduct[key] = Object.assign({}, it);
      return;
    }
    const prev = byProduct[key];
    prev.qty = round2(prev.qty + it.qty);
    prev.lineTotal = round2(prev.lineTotal + it.lineTotal);
    prev.price = prev.qty > 0 ? round2(prev.lineTotal / prev.qty) : prev.price;
  });
  return Object.keys(byProduct).map(function (k) { return byProduct[k]; });
}

function build() {
  const mapData = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
  const nameMap = mapData.map || mapData;
  const buckets = new Set(mapData.buckets_non_sellable || []);

  const rows = readLinesCsv(linesPath);
  const receipts = {};
  let skippedLines = 0;
  let skippedAmount = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = parseCsvLine(rows[i]);
    const receiptId = String(r[0] || '').trim();
    const date = r[1];
    const time = r[2];
    if (!receiptId || !date) continue;

    const name = r[7];
    const qty = Number(r[8]) || 0;
    const lineTotal = Number(r[11]) || 0;
    if (!lineTotal) continue;

    const slug = nameMap[name];
    if (!slug || buckets.has(slug)) {
      skippedLines += 1;
      skippedAmount += lineTotal;
      continue;
    }

    if (!receipts[receiptId]) {
      receipts[receiptId] = {
        receiptId: receiptId,
        transactionId: String(r[5] || '').trim(),
        date: date,
        time: time,
        lines: [],
      };
    }
    receipts[receiptId].lines.push({
      product: slug,
      name: slug,
      code: '',
      unit: 'Pza',
      price: qty > 0 ? round2(lineTotal / qty) : round2(lineTotal),
      qty: round2(qty),
      lineTotal: round2(lineTotal),
    });
  }

  const items = Object.keys(receipts)
    .map(function (id) { return receipts[id]; })
    .filter(function (rcpt) { return rcpt.lines.length > 0; })
    .sort(function (a, b) {
      const ta = createdAtLocal(a.date, a.time);
      const tb = createdAtLocal(b.date, b.time);
      return ta.localeCompare(tb) || Number(a.receiptId) - Number(b.receiptId);
    })
    .map(function (rcpt) {
      const merged = mergeLineItems(rcpt.lines);
      const total = round2(merged.reduce(function (n, it) { return n + it.lineTotal; }, 0));
      const y = Number(rcpt.date.slice(0, 4));
      const m = Number(rcpt.date.slice(5, 7));
      const d = Number(rcpt.date.slice(8, 10));
      return {
        id: 'sale-hist-rcpt-' + rcpt.receiptId,
        folio: 'HIST-R' + rcpt.receiptId,
        createdAt: createdAtLocal(rcpt.date, rcpt.time),
        customer: 'Histórico importado',
        paymentMethod: 'transferencia',
        billing: 'sin_facturar',
        items: merged,
        total: total,
        user: 'import-historico',
        meta: {
          source: 'old-panel',
          kind: 'receipt',
          receiptId: Number(rcpt.receiptId) || rcpt.receiptId,
          transactionId: rcpt.transactionId || null,
          year: y,
          month: m,
          day: d,
        },
      };
    });

  const payload = {
    version: 3,
    importVersion: 3,
    note: 'Un ticket por nota de venta del panel viejo (fecha y hora reales). v3 reemplaza agregados mensuales v1/v2.',
    generatedAt: new Date().toISOString().slice(0, 10),
    source: path.basename(linesPath),
    items: items,
    stats: {
      tickets: items.length,
      skippedLines: skippedLines,
      skippedAmount: round2(skippedAmount),
    },
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(payload));
  const mb = (Buffer.byteLength(JSON.stringify(payload)) / (1024 * 1024)).toFixed(2);
  console.log(
    'historical-sales-import.json v3:',
    items.length, 'notas ·', mb, 'MB · skipped', skippedLines, 'lines ·',
    round2(skippedAmount), 'MXN sin mapear'
  );
}

build();
