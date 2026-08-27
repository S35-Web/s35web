const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de barita (sulfato de bario) de grado industrial, compilado en briefing interno S-35 FT-MP-035. Valores típicos de comercio/norma (API 13A, NOM-EM-006), no ensayo de este lote. No se publica yacimiento.';

module.exports = {
  code: 'ML-FIL-006',
  slug: 'barita',
  slugEn: 'barite',
  name: { es: 'Barita', en: 'Barite' },
  scientificName: 'BaSO₄ · baryte',
  category: 'FIL',
  classLabel: { es: 'CARGA MINERAL DE ALTA DENSIDAD', en: 'HIGH-DENSITY MINERAL FILLER' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de barita. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Sulfato de bario, BaSO₄. Mineral no metálico de altísima densidad y solubilidad prácticamente nula. Se usa como carga inerte donde el objetivo no es resistencia ni reactividad, sino masa: blindaje contra radiación, lastre y control de peso en fluidos de perforación.\n\nEl bario es un átomo pesado: con densidad relativa 4.2–4.5 es unas 1.7 veces más densa que la arena de sílice, y su solubilidad en agua es tan baja que se considera inerte en ambiente húmedo. Esa misma masa atómica atenúa rayos X y gamma. La perlita y la pumicita aligeran; la barita es el otro extremo de la escala: lastre.\n\nLos números de esta ficha (densidad 4.2–4.5 g/cm³, pureza BaSO₄ ≥90 %, D90 ≤75 µm) son valores típicos de barita comercial según API 13A, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Barium sulfate, BaSO₄. A non-metallic mineral of very high density and almost no solubility. It is used as an inert filler where the aim is mass, not strength or reactivity: radiation shielding, ballast and weight control in drilling fluids.\n\nBarium is a heavy atom: relative density 4.2–4.5, about 1.7 times denser than silica sand, and so sparingly soluble that it is treated as inert in wet service. That same atomic mass attenuates X-rays and gamma. Perlite and pumice lighten; barite is the other end of the scale: ballast.\n\nFigures in this file (density, BaSO₄ purity, D90) are typical commercial values for barite (API 13A), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Sulfato de bario, BaSO₄', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni marca.',
    sampleId: 'ML-SMP-00025',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { unit: 'g/cm³', note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp([4.2, 4.5], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL + ' Densidad relativa típica API 13A; no es densidad de este lote.',
      method: 'API 13A (referencia de método; no ejecutado sobre este lote)',
    }),
    color: dp('Blanco brillante, gránulos angulares y polvo fino', 'observation', {
      sampleId: 'ML-SMP-00025',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Grava y polvo de sulfato de bario, sólido y denso', 'observation', {
      sampleId: 'ML-SMP-00025',
      date: '2026-08-27',
      method: 'Visual',
    }),
    grainRange: dp(75, 'reference', {
      unit: 'µm D90 máx.',
      source: TYPICAL + ' D90 típico API 13A; no es granulometría de este lote.',
    }),
  },
  chemical: [
    {
      compound: 'Sulfato de bario',
      formula: 'BaSO₄',
      percent: dp(90, 'reference', {
        unit: '% mínimo',
        source: TYPICAL,
        note: 'Grado API mínimo para fluidos de perforación.',
      }),
    },
  ],
  morphology: {
    surface: dp('Blanco, mezcla de polvo fino y gránulos angulares mates a ligeramente cristalinos', 'observation', {
      sampleId: 'ML-SMP-00025',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Fragmentos angulares densos, sin porosidad de partícula', 'observation', {
      sampleId: 'ML-SMP-00025',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'barita',
        alt: 'Referencia visual de barita: montículo de grava y polvo blanco sobre fondo blanco y detalle de gránulos angulares densos',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Densidad 4.2–4.5 g/cm³', effect: 'Aporta masa por unidad de volumen: lastre y control de peso', direction: '↑' },
    { property: '~1.7× la arena de sílice', effect: 'El otro extremo de la perlita y la pumicita en la escala de densidades', direction: '↑' },
    { property: 'Radiopaca', effect: 'Atenúa rayos X y gamma en concretos de blindaje', direction: '↑' },
    { property: 'Prácticamente insoluble', effect: 'Carga inerte en ambiente húmedo; no contamina el sistema', direction: '→' },
    { property: 'Se dosifica por peso', effect: 'Pequeños cambios de volumen mueven mucha masa; vigilar segregación', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el material es blanco, con gránulos angulares y polvo fino. No hay ensayo de densidad relativa, pureza BaSO₄ ni D90 API 13A publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the material is white, with angular granules and fine powder. No relative-density, BaSO₄-purity or API 13A D90 test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['perlita-expandida', 'jal-pumita', 'carbonato-de-calcio', 'arena-de-cuarzo'],
  relatedResearch: ['caracterizacion-barita'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'barita.html',
  techMotion: true,
};
