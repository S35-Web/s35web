const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de dióxido de titanio (TiO₂) de grado recubrimientos, compilado en briefing interno S-35 FT-MP-041. Valores típicos de comercio/norma (ASTM D476, ISO 591, ISO 13320, ASTM D2805, ASTM D4214), no ensayo de este lote. No se publica planta.';

module.exports = {
  code: 'ML-PIG-001',
  slug: 'dioxido-de-titanio',
  slugEn: 'titanium-dioxide',
  name: { es: 'Dióxido de titanio', en: 'Titanium dioxide' },
  scientificName: 'TiO₂ · rutile or anatase',
  category: 'PIG',
  classLabel: { es: 'PIGMENTO MINERAL', en: 'MINERAL PIGMENT' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de dióxido de titanio. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'TiO₂, forma cristalina rutilo o anatasa. El pigmento blanco de mayor poder cubriente conocido: no tiñe absorbiendo color, sino que dispersa la luz visible casi por completo. Su índice de refracción, casi tan alto como el del diamante, es la razón física de su blancura y opacidad.\n\nEl caolín y el carbonato de calcio también blanquean, pero como cargas: índice de refracción ~1.56, ocupan volumen y extienden. El TiO₂ es pigmento: 2.7 de índice, partícula de ~0.2 µm —la mitad de una longitud de onda visible— y ≥98 % de pureza en grado recubrimientos. El cemento blanco es la base; el titanio es el tope de blancura. En exterior se usa rutilo recubierto: la anatasa es más fotocatalítica y degrada el ligante orgánico bajo UV.\n\nLos números de esta ficha (índice 2.7, TiO₂ ≥98 %, partícula 0.2–0.3 µm, contraste ≥0.98) son valores típicos de pigmento comercial según ASTM D476 / ISO 591, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'TiO₂, rutile or anatase. The white pigment with the highest known hiding power: it does not tint by absorbing colour, it scatters visible light almost completely. Its refractive index, almost as high as diamond, is the physical reason for its whiteness and opacity.\n\nKaolin and calcium carbonate also whiten, but as fillers: refractive index ~1.56, they occupy volume and extend. TiO₂ is pigment: index 2.7, particle ~0.2 µm — half a visible wavelength — and ≥98 % purity in coatings grade. White cement is the base; titanium is the ceiling of whiteness. Outdoors, coated rutile is the standard: anatase is more photocatalytic and degrades the organic binder under UV.\n\nFigures in this file (refractive index, TiO₂, particle size, contrast ratio) are typical commercial values for pigment-grade TiO₂ (ASTM D476 / ISO 591), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Mineral de ilmenita o rutilo, procesado industrialmente', 'observation', {
    note: 'Clase comercial. No se publica planta ni marca.',
    sampleId: 'ML-SMP-00032',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    refractiveIndex: dp(2.7, 'reference', {
      source: TYPICAL + ' Índice de refracción del rutilo; no es medición de este lote.',
    }),
    grainRange: dp([0.2, 0.3], 'reference', {
      unit: 'µm',
      source: TYPICAL + ' Tamaño medio óptimo para dispersión de luz visible según ISO 13320. No es D10–D90 de este lote.',
      method: 'ISO 13320 (referencia de método; no ejecutado sobre este lote)',
    }),
    color: dp('Blanco brillante, polvo fino con microagregados suaves', 'observation', {
      sampleId: 'ML-SMP-00032',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Cristales de rutilo o anatasa, grado pigmento', 'observation', {
      sampleId: 'ML-SMP-00032',
      date: '2026-08-27',
      method: 'Visual',
    }),
    hidingPower: dp(0.98, 'reference', {
      unit: 'contraste, mín.',
      source: TYPICAL,
      method: 'ASTM D2805 (referencia de método; no ejecutado sobre este lote)',
    }),
  },
  chemical: [
    {
      compound: 'Dióxido de titanio',
      formula: 'TiO₂',
      percent: dp(98, 'reference', {
        unit: '% mínimo, grado recubrimientos',
        source: TYPICAL,
        note: 'El resto son recubrimientos superficiales de sílice/alúmina que mejoran dispersión y durabilidad.',
      }),
    },
  ],
  morphology: {
    surface: dp('Polvo blanco brillante, fino, con microagregados irregulares', 'observation', {
      sampleId: 'ML-SMP-00032',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Partícula de ~0.2 µm; los aglomerados visibles son racimos, no el cristal individual', 'observation', {
      sampleId: 'ML-SMP-00032',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'dioxido-de-titanio',
        alt: 'Referencia visual de dióxido de titanio: montículo de polvo blanco brillante sobre fondo blanco y detalle de microagregados',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Índice de refracción 2.7', effect: 'Dispersa la luz visible: blancura y opacidad que una carga no alcanza', direction: '↑' },
    { property: 'Partícula ~0.2 µm', effect: 'Tamaño óptimo de dispersión; aglomerada, pierde cubriente', direction: '↑' },
    { property: 'TiO₂ ≥98 %', effect: 'Grado recubrimientos; el resto es recubrimiento de sílice/alúmina', direction: '↑' },
    { property: 'Rutilo recubierto en exterior', effect: 'La anatasa es más fotocatalítica y degrada el ligante orgánico bajo UV', direction: '↑' },
    { property: 'Cargas extendedoras', effect: 'Caolín y carbonato espacian las partículas y rinden el kilo de pigmento', direction: '↑' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el polvo es blanco brillante, fino, con microagregados suaves. No hay ensayo de TiO₂ ASTM D476, tamaño ISO 13320 ni contraste ASTM D2805 publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the powder is brilliant white, fine, with soft micro-aggregates. No ASTM D476 TiO₂, ISO 13320 size or ASTM D2805 contrast test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['caolin', 'carbonato-de-calcio', 'cemento-blanco', 'cal', 'oxido-de-hierro-rojo'],
  relatedResearch: ['caracterizacion-dioxido-de-titanio'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'dioxido-de-titanio.html',
  techMotion: true,
};
