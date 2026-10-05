#!/usr/bin/env node
/**
 * Walks content/research and fails the build if a publishable value
 * is missing provenance, or if provenance rules are broken.
 */
const path = require('path');
const archive = require(path.join(__dirname, '..', 'content', 'research'));
const { PROVENANCES } = require(path.join(__dirname, '..', 'content', 'research', 'dp'));

const errors = [];

function isDataPoint(node) {
  return (
    node &&
    typeof node === 'object' &&
    !Array.isArray(node) &&
    Object.prototype.hasOwnProperty.call(node, 'value') &&
    Object.prototype.hasOwnProperty.call(node, 'provenance')
  );
}

function looksLikeValueBag(node) {
  return (
    node &&
    typeof node === 'object' &&
    !Array.isArray(node) &&
    Object.prototype.hasOwnProperty.call(node, 'value') &&
    !Object.prototype.hasOwnProperty.call(node, 'provenance')
  );
}

function walk(node, trail) {
  if (!node || typeof node !== 'object') return;

  if (isDataPoint(node)) {
    if (PROVENANCES.indexOf(node.provenance) === -1) {
      errors.push(trail + ': provenance inválida (' + node.provenance + ')');
    }
    if (node.provenance === 'reference' && !node.source) {
      errors.push(trail + ': provenance=reference sin source');
    }
    if (node.provenance === 'measured' && (!node.sampleId || !node.date)) {
      errors.push(trail + ': provenance=measured sin sampleId y date');
    }
    return;
  }

  if (looksLikeValueBag(node)) {
    errors.push(trail + ': valor publicable sin provenance');
    return;
  }

  if (Array.isArray(node)) {
    node.forEach(function (item, i) {
      walk(item, trail + '[' + i + ']');
    });
    return;
  }

  Object.keys(node).forEach(function (key) {
    if (key === 'summary' || key === 'name' || key === 'title' || key === 'text' || key === 'images') return;
    walk(node[key], trail + '.' + key);
  });
}

archive.materials.forEach(function (m) {
  if (!m.code || !m.slug || !m.category || !m.status) {
    errors.push((m.slug || '?') + ': material incompleto (code/slug/category/status)');
  }
  walk(m.origin, m.slug + '.origin');
  walk(m.physical, m.slug + '.physical');
  walk(m.chemical, m.slug + '.chemical');
  walk(m.granulometry, m.slug + '.granulometry');
  walk(m.morphology, m.slug + '.morphology');
});

if (!archive.materials.length) {
  errors.push('No hay materiales en content/research/materials');
}

if (errors.length) {
  console.error('Laboratorio validation failed:\n' + errors.map(function (e) { return ' - ' + e; }).join('\n'));
  process.exit(1);
}

console.log(
  'Laboratorio OK — ' +
    archive.materials.length +
    ' materials, ' +
    archive.researchFiles.length +
    ' research files, ' +
    archive.experiments.length +
    ' experiments.'
);
