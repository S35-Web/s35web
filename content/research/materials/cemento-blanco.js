const { dp } = require('../dp');

module.exports = {
  code: 'ML-BND-004',
  slug: 'cemento-blanco',
  slugEn: 'white-cement',
  name: { es: 'Cemento blanco', en: 'White cement' },
  scientificName: 'White Portland cement',
  category: 'BND',
  classLabel: 'CEMENTANTE',
  status: 'in-study',
  revision: 0,
  publishedAt: '',
  updatedAt: '2026-08-19',
  revisionHistory: [],
  summary: {
    es: 'Material en estudio. La ficha pública se publicará cuando exista macrofotografía calibrada, al menos un dato medido y un resumen editorial.',
    en: 'Material in study.',
  },
  origin: dp('México', 'observation', { note: 'Caracterización instrumental pendiente. No se publica planta ni proveedor.' }),
  physical: {
    color: dp('Blanco', 'observation', { method: 'Visual sobre fotografía de muestra real', date: '2026-08-11' }),
    structure: dp('Polvo hidráulico fino', 'observation', { method: 'Visual', date: '2026-08-11' }),
  },
  chemical: [],
  images: {
    macro: [{ id: 'cemento-blanco', alt: 'Cemento blanco — muestra fotografiada por S-35, ficha en estudio', width: 1536, height: 1024 }],
  },
  whyItMatters: [],
};
