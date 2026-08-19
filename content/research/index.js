const fs = require('fs');
const path = require('path');

function loadDir(rel) {
  const dir = path.join(__dirname, rel);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(function (f) { return f.endsWith('.js'); })
    .sort()
    .map(function (f) { return require(path.join(dir, f)); });
}

const materials = loadDir('materials').sort(function (a, b) {
  if (a.status === 'documented' && b.status !== 'documented') return -1;
  if (b.status === 'documented' && a.status !== 'documented') return 1;
  return a.code.localeCompare(b.code);
});
const researchFiles = loadDir('research-files');
const samples = require('./samples');
const experiments = require('./experiments');
const qrMap = require('./qr-map');
const config = require('./config');
const taxonomy = require('./taxonomy');

function bySlug(slug) {
  return materials.filter(function (m) { return m.slug === slug; })[0];
}

function documentedMaterials() {
  return materials.filter(function (m) { return m.status === 'documented'; });
}

function inStudyMaterials() {
  return materials.filter(function (m) { return m.status === 'in-study'; });
}

function lastUpdated() {
  var dates = [];
  materials.forEach(function (m) {
    if (m.updatedAt) dates.push(m.updatedAt);
    if (m.publishedAt) dates.push(m.publishedAt);
  });
  researchFiles.forEach(function (r) {
    if (r.date) dates.push(r.date);
  });
  dates.sort();
  return dates.length ? dates[dates.length - 1] : '';
}

function categoriesInUse() {
  var used = {};
  researchFiles.forEach(function (r) { used[r.category] = true; });
  return Object.keys(taxonomy.CATEGORIES).filter(function (k) { return used[k]; });
}

function featuredResearch() {
  var featured = researchFiles.filter(function (r) { return r.featured; })[0];
  return featured || researchFiles[0] || null;
}

function pad2(n) {
  return n < 10 ? '0' + n : String(n);
}

function stats() {
  return {
    materialsDocumented: documentedMaterials().length,
    materialsInStudy: inStudyMaterials().length,
    experiments: experiments.length,
    researchFiles: researchFiles.filter(function (r) { return r.status === 'published'; }).length,
    lastUpdated: lastUpdated(),
  };
}

module.exports = {
  materials: materials,
  researchFiles: researchFiles,
  samples: samples,
  experiments: experiments,
  qrMap: qrMap,
  config: config,
  taxonomy: taxonomy,
  bySlug: bySlug,
  documentedMaterials: documentedMaterials,
  inStudyMaterials: inStudyMaterials,
  lastUpdated: lastUpdated,
  categoriesInUse: categoriesInUse,
  featuredResearch: featuredResearch,
  stats: stats,
  pad2: pad2,
};
