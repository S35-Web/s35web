#!/usr/bin/env node
/**
 * Genera public/colaboradores/data/historical-sales-import.json
 * desde notas_lineas (fecha real) + product-name-map.json.
 *
 * Un ticket sintético por slug × mes (createdAt = día 1 del mes).
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

function slugShort(slug, max) {
  max = max || 12;
  const s = String(slug || '').replace(/[^a-z0-9-]/gi, '');
  return s.length <= max ? s : s.slice(0, max);
}

function monthKey(dateStr) {
  return String(dateStr || '').slice(0, 7);
}

function readLinesCsv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error('No se encontró el CSV de líneas: ' + filePath);
  }
  return fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
}

function build() {
  const mapData = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
  const nameMap = mapData.map || mapData;
  const buckets = new Set(mapData.buckets_non_sellable || []);

  const rows = readLinesCsv(linesPath);
  const groups = {};
  let skippedLines = 0;
  let skippedAmount = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = parseCsvLine(rows[i]);
    const date = r[1];
    const ym = monthKey(date);
    if (!ym || ym.length < 7) continue;

    const name = r[7];
    const qty = Number(r[9]) || 0;
    const lineTotal = Number(r[11]) || 0;
    if (!lineTotal) continue;

    const slug = nameMap[name];
    if (!slug || buckets.has(slug)) {
      skippedLines += 1;
      skippedAmount += lineTotal;
      continue;
    }

    const key = slug + '|' + ym;
    if (!groups[key]) {
      groups[key] = { slug: slug, ym: ym, year: ym.slice(0, 4), month: ym.slice(5, 7), qty: 0, amount: 0 };
    }
    groups[key].qty += qty;
    groups[key].amount += lineTotal;
  }

  const items = Object.keys(groups)
    .map(function (k) { return groups[k]; })
    .filter(function (g) { return g.amount > 0; })
    .sort(function (a, b) {
      return a.ym.localeCompare(b.ym) || a.slug.localeCompare(b.slug);
    })
    .map(function (g) {
      const qty = round2(g.qty);
      const total = round2(g.amount);
      const price = qty > 0 ? round2(total / qty) : total;
      const id = 'sale-hist-' + g.slug + '-' + g.ym;
      const folio = 'HIST-' + g.ym + '-' + slugShort(g.slug, 10);
      const createdAt = g.year + '-' + g.month + '-01T12:00:00.000Z';
      return {
        id: id,
        folio: folio,
        createdAt: createdAt,
        customer: 'Histórico importado',
        paymentMethod: 'transferencia',
        billing: 'sin_facturar',
        items: [{
          product: g.slug,
          name: g.slug,
          code: '',
          unit: 'Pza',
          price: price,
          qty: qty,
          lineTotal: total,
        }],
        total: total,
        user: 'import-historico',
        meta: {
          source: 'old-panel',
          kind: 'product-month',
          year: Number(g.year),
          month: Number(g.month),
        },
      };
    });

  const payload = {
    version: 2,
    importVersion: 2,
    note: 'Tickets sintéticos por producto y mes (fecha real del panel viejo). Importar una vez; v2 reemplaza tickets anuales v1.',
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
  console.log(
    'historical-sales-import.json:',
    items.length, 'tickets · skipped', skippedLines, 'lines ·',
    round2(skippedAmount), 'MXN sin mapear'
  );
}

build();
