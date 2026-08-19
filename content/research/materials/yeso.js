const { dp } = require('../dp');

function inStudy(opts) {
  return {
    code: opts.code,
    slug: opts.slug,
    slugEn: opts.slugEn,
    name: opts.name,
    scientificName: opts.scientificName,
    category: opts.category,
    classLabel: opts.classLabel,
    status: 'in-study',
    revision: 0,
    publishedAt: '',
    updatedAt: '2026-08-19',
    revisionHistory: [],
    summary: {
      es: 'Material en estudio. La ficha pública se publicará cuando exista macrofotografía calibrada, al menos un dato medido y un resumen editorial.',
      en: 'Material in study. A public file will be issued when a calibrated macro photograph, at least one measured data point, and an editorial summary exist.',
    },
    origin: dp(opts.origin, 'observation', { note: 'Región o clase declarada; caracterización instrumental pendiente.' }),
    physical: {
      color: dp(opts.color, 'observation', { method: 'Visual sobre fotografía de muestra real', date: '2026-08-11' }),
      structure: dp(opts.structure, 'observation', { method: 'Visual', date: '2026-08-11' }),
    },
    chemical: [],
    images: {
      macro: [
        {
          id: opts.imageId,
          alt: opts.name.es + ' — muestra fotografiada por S-35, ficha en estudio',
          width: 1536,
          height: 1024,
        },
      ],
    },
    whyItMatters: [],
  };
}

module.exports = inStudy({
  code: 'ML-BND-002',
  slug: 'yeso',
  slugEn: 'gypsum',
  name: { es: 'Yeso', en: 'Gypsum' },
  scientificName: 'CaSO₄·2H₂O',
  category: 'BND',
  classLabel: 'CEMENTANTE',
  origin: 'México',
  color: 'Blanco a marfil',
  structure: 'Polvo fino',
  imageId: 'yeso',
});
