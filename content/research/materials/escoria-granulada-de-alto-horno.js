const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de escoria granulada de alto horno (GGBFS) de grado construcción, compilado en briefing interno S-35 FT-MP-032. Valores típicos de comercio/norma (ASTM C989, EN 15167, ASTM C188), no ensayo de este lote. No se publica planta.';

module.exports = {
  code: 'ML-BND-006',
  slug: 'escoria-granulada-de-alto-horno',
  slugEn: 'ground-granulated-blast-furnace-slag',
  name: { es: 'Escoria granulada de alto horno', en: 'Ground granulated blast-furnace slag' },
  scientificName: 'Quenched glassy calcium-aluminosilicate slag (GGBFS, ASTM C989)',
  category: 'BND',
  classLabel: { es: 'CEMENTANTE LATENTE', en: 'LATENT HYDRAULIC BINDER' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de escoria granulada de alto horno. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'El subproducto vítreo de fundir hierro, enfriado de golpe con agua y molido a la finura del cemento. A diferencia de las puzolanas, no solo reacciona con la cal libre: tiene capacidad cementante propia, latente hasta que el medio alcalino del cemento la activa.\n\nAl fundir mineral de hierro, las impurezas flotan como escoria a más de 1 500 °C. Enfriada despacio, cristaliza y queda inerte; granulada con agua a presión, se vitrifica: un vidrio de composición cercana al clínker, sin tiempo de ordenarse en cristales. Molido, ese vidrio puede formar los mismos silicatos de calcio hidratados que dan resistencia al Portland, pero solo cuando un medio alcalino —el del propio cemento, o la cal— lo despierta. La ceniza volante y el metacaolín son puzolanas; la escoria es el cementante de alta sustitución: 30–70 %, reacción más lenta, color más claro que el Portland.\n\nLos números de esta ficha (contenido vítreo ≥95 %, grados 80/100/120, densidad 2.85–2.95 g/cm³, sustitución 30–70 %) son valores típicos de escoria comercial según ASTM C989 / EN 15167, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'The glassy by-product of iron-making, water-quenched and ground to cement fineness. Unlike pozzolans it does not only consume free lime: it has its own cementing capacity, latent until the alkaline medium of cement activates it.\n\nIron-ore impurities float as slag above 1 500 °C. Slow cooling crystallises it into an inert rock; water granulation freezes it as glass, close in composition to clinker. Ground, that glass can form the same calcium-silicate hydrates as Portland, but only when an alkaline medium — Portland itself, or lime — wakes it. Fly ash and metakaolin are pozzolans; slag is the high-replacement binder: 30–70 %, slower reaction, a paler concrete than Portland.\n\nFigures in this file (glass content, activity grades, density, replacement) are typical commercial values for GGBFS (ASTM C989 / EN 15167), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('GGBFS · subproducto siderúrgico molido', 'observation', {
    note: 'Clase comercial. No se publica planta ni marca.',
    sampleId: 'ML-SMP-00023',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { unit: 'g/cm³', note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp([2.85, 2.95], 'reference', {
      source: TYPICAL + ' Densidad real típica ASTM C188; no es densidad de este lote.',
      method: 'ASTM C188 (referencia de método; no ejecutado sobre este lote)',
    }),
    color: dp('Gris ceniza uniforme, gránulos angulares e irregulares', 'observation', {
      sampleId: 'ML-SMP-00023',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Granulado vítreo de enfriamiento rápido; superficie rugosa y porosa', 'observation', {
      sampleId: 'ML-SMP-00023',
      date: '2026-08-27',
      method: 'Visual',
    }),
    glassContent: dp(95, 'reference', {
      unit: '% mínimo fase amorfa',
      source: TYPICAL + ' Contenido vítreo típico de granulación correcta; no es difracción de este lote.',
      method: 'Difracción RX (referencia de método; no ejecutado sobre este lote)',
    }),
    hydraulicGrade: dp('80 / 100 / 120', 'reference', {
      source: TYPICAL + ' Grados de actividad hidráulica ASTM C989; no es ensayo de este lote.',
      method: 'ASTM C989 (referencia de método; no ejecutado sobre este lote)',
    }),
    cementReplacement: dp([30, 70], 'reference', {
      unit: '%',
      source: TYPICAL + ' Sustitución típica de cemento; admite dosis altas porque es cementante latente, no solo puzolana.',
    }),
    heatReduction: dp([40, 60], 'reference', {
      unit: '%',
      source: TYPICAL + ' Reducción de calor de hidratación típica ASTM C186.',
      method: 'ASTM C186 (referencia de método; no ejecutado sobre este lote)',
    }),
  },
  chemical: [
    {
      compound: 'Contenido vítreo',
      formula: 'fase amorfa',
      percent: dp(95, 'reference', {
        unit: '% mínimo',
        source: TYPICAL,
        note: 'Un contenido bajo indica granulación deficiente y menor reactividad.',
      }),
    },
  ],
  morphology: {
    surface: dp('Gránulos grises angulares, rugosos y porosos, de arena gruesa a milímetros', 'observation', {
      sampleId: 'ML-SMP-00023',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Fragmentos irregulares de vidrio de escoria granulada', 'observation', {
      sampleId: 'ML-SMP-00023',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'escoria-granulada-de-alto-horno',
        alt: 'Referencia visual de escoria granulada de alto horno: montículo de gránulos grises angulares sobre fondo blanco y detalle de superficie rugosa y porosa',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Cementante latente, 30–70 %', effect: 'Sustituye clínker en dosis altas y gana resistencia después de 28 días', direction: '↑' },
    { property: 'Vidrio ≥95 %', effect: 'La granulación correcta deja fase amorfa reactiva; el enfriado lento no', direction: '↑' },
    { property: 'Menos calor de hidratación, 40–60 %', effect: 'Útil en concreto masivo, más que ceniza o metacaolín', direction: '↑' },
    { property: 'Distinto de las puzolanas', effect: 'Capacidad cementante propia; necesita medio alcalino para activarse', direction: '→' },
    { property: 'Grado 80, 100 o 120', effect: 'El grado marca qué tan rápido iguala al Portland de referencia', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el material es granulado gris ceniza, angular e irregular, con superficie rugosa y porosa. No hay ensayo de grado ASTM C989, contenido vítreo ni densidad ASTM C188 publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the material is ash-grey, angular and irregular granules with a rough, porous surface. No ASTM C989 grade, glass-content or ASTM C188 density test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['ceniza-volante', 'metacaolin', 'cemento-gris', 'cal'],
  relatedResearch: ['caracterizacion-escoria-granulada-de-alto-horno'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'escoria-granulada-de-alto-horno.html',
  techMotion: true,
};
