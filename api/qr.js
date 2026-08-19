const qrMap = require('../content/research/qr-map');

function readCode(req) {
  if (req.query && req.query.code) return String(req.query.code);
  var parts = (req.url || '').split('?')[0].split('/');
  return parts[parts.length - 1] || '';
}

module.exports = function handler(req, res) {
  var raw = readCode(req).trim().toLowerCase();
  var entry = qrMap[raw];
  var loc;
  if (entry && entry.slug) {
    loc =
      '/materialab/materials/' +
      entry.slug +
      '?utm_source=packaging&utm_medium=qr&utm_campaign=' +
      encodeURIComponent(raw);
  } else {
    loc = '/materialab?notice=not-found';
  }
  res.statusCode = 302;
  res.setHeader('Location', loc);
  res.setHeader('Cache-Control', 'no-store');
  res.end();
};
