const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de metacaolín de alta reactividad (caolín calcinado), compilado en briefing interno S-35 FT-MP-026. Valores típicos de comercio/norma (ASTM C618 clase N, ASTM C1240, ASTM C311), no ensayo de este lote.';

module.exports = {
  code: 'ML-MIN-004',
  slug: 'metacaolin',
  slugEn: 'metakaolin',
  name: { es: 'Metacaolín', en: 'Metakaolin' },
  scientificName: 'Calcined dehydroxylated kaolinite (Al₂O₃·2SiO₂)',
  category: 'MIN',
  classLabel: { es: 'PUZOLANA REACTIVA', en: 'REACTIVE POZZOLAN' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de metacaolín. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'El mismo caolín, llevado a 650–850 °C hasta perder su agua estructural. Ese cambio lo convierte de carga inerte en puzolana de alta reactividad: consume cal libre, densifica la pasta y sube resistencia y durabilidad del concreto.\n\nEl caolín es estable porque sus capas de sílice y aluminio están ordenadas y saturadas de hidroxilos. Al calcinarlo esos hidroxilos se liberan como vapor y la estructura cristalina colapsa: queda un sólido amorfo, con la sílice y la alúmina expuestas. Cuando el cemento hidrata libera hidróxido de calcio; el metacaolín reacciona con esa cal libre y la convierte en silicatos y aluminatos de calcio adicionales. El jal también es puzolánico, pero de reactividad moderada y como aligerante; el metacaolín es una adición cementante fina y blanca.\n\nLos números de esta ficha (SiO₂ + Al₂O₃ + Fe₂O₃ ≥95 %, actividad puzolánica ≥95 % a 28 días, partícula 1–3 µm, sustitución 5–15 %) son valores típicos de metacaolín comercial de alta reactividad según ASTM C618 clase N / C311, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'The same kaolin, taken to 650–850 °C until it loses its structural water. That turns an inert filler into a high-reactivity pozzolan: it consumes free lime, densifies the paste and raises strength and durability.\n\nOn calcination the ordered kaolinite sheets collapse into an amorphous solid with silica and alumina exposed. Cement hydration releases calcium hydroxide; metakaolin converts that free lime into extra calcium silicates and aluminates. Jal is also pozzolanic, but milder and used as a lightweight aggregate; metakaolin is a fine, white cementitious addition.\n\nFigures in this file (reactive oxides, pozzolanic activity, particle size, cement replacement) are typical commercial values for high-reactivity metakaolin (ASTM C618 class N / C311), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Grado alta reactividad', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni proveedor.',
    sampleId: 'ML-SMP-00017',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { unit: 'g/cm³', note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    hardnessMohs: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    waterAbsorption: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    porosity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    color: dp('Polvo blanco apagado a crema, granular fino, mate', 'observation', {
      sampleId: 'ML-SMP-00017',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Sólido amorfo deshidroxilado; red colapsada de sílice y alúmina', 'observation', {
      sampleId: 'ML-SMP-00017',
      date: '2026-08-27',
      method: 'Visual',
    }),
    grainRange: dp([1, 3], 'reference', {
      unit: 'µm',
      source: 'Tamaño de partícula típico de metacaolín de alta reactividad según briefing interno FT-MP-026. No es D10–D90 de este lote.',
    }),
    whiteness: dp([80, 90], 'reference', {
      unit: 'ISO',
      source: TYPICAL,
      method: 'ISO 2470 (referencia de método; no ejecutado sobre este lote)',
      note: 'Más blanco que el humo de sílice o la ceniza volante.',
    }),
    pozzolanicActivity: dp(95, 'reference', {
      unit: '% a 28 días mínimo',
      source: TYPICAL,
      method: 'ASTM C311 (referencia de método; no ejecutado sobre este lote)',
    }),
    specificSurface: dp([10, 25], 'reference', {
      unit: 'm²/g',
      source: TYPICAL + ' Superficie específica BET.',
      method: 'BET N₂ (referencia de método; no ejecutado sobre este lote)',
    }),
    calcinationTemp: dp([650, 850], 'reference', {
      unit: '°C',
      source: TYPICAL + ' Ventana de calcinación; por encima de ≈900 °C recristaliza y pierde reactividad.',
    }),
    cementReplacement: dp([5, 15], 'reference', {
      unit: '%',
      source: TYPICAL + ' Sustitución típica de cemento.',
    }),
  },
  chemical: [
    {
      compound: 'Óxidos reactivos',
      formula: 'SiO₂ + Al₂O₃ + Fe₂O₃',
      percent: dp(95, 'reference', {
        unit: '% mínimo',
        source: TYPICAL,
        note: 'Cumple el mínimo de puzolana clase N (ASTM C618).',
      }),
    },
  ],
  morphology: {
    surface: dp('Polvo mate, granular fino, con aglomerados blandos e irregulares', 'observation', {
      sampleId: 'ML-SMP-00017',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Partícula amorfa, más fina que el cemento', 'observation', {
      sampleId: 'ML-SMP-00017',
      date: '2026-08-27',
    }),
    edgeProfile: dp('Aglomerados porosos, aspecto de material calcinado', 'observation', {
      sampleId: 'ML-SMP-00017',
      date: '2026-08-27',
    }),
    voidStructure: dp('Red amorfa colapsada; sin láminas 1:1 del caolín crudo', 'reference', {
      source: TYPICAL,
    }),
  },
  images: {
    macro: [
      {
        id: 'metacaolin',
        alt: 'Referencia visual de metacaolín: montículo de polvo blanco apagado a crema sobre fondo blanco y detalle de partículas granulares mate',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Puzolana de alta reactividad', effect: 'Convierte cal libre en más C-S-H y C-A-H: sube resistencia y densifica', direction: '↑' },
    { property: 'Actividad ≥95 % a 28 días', effect: 'Iguala o supera el mortero de referencia sin adición', direction: '↑' },
    { property: 'Partícula 1–3 µm, 10–25 m²/g', effect: 'Reacciona rápido; pide reductor de agua, no más agua directa', direction: '→' },
    { property: 'Blancura ISO 80–90', effect: 'No oscurece el concreto; preferible en arquitectónico blanco', direction: '↑' },
    { property: 'No es caolín crudo', effect: 'Sin calcinar no hay esta reactividad; el oficio es otro', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el material es polvo blanco apagado a crema, granular fino, con aglomerados mate. No hay ensayo de actividad puzolánica ASTM C311, BET ni blancura ISO 2470 publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the material is dull white to cream, finely granular, with matte agglomerates. No ASTM C311 pozzolanic-activity, BET or ISO 2470 whiteness test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['caolin', 'jal-pumita', 'ceniza-volante', 'escoria-granulada-de-alto-horno', 'cemento-gris', 'cemento-blanco'],
  relatedResearch: ['caracterizacion-metacaolin'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'metacaolin.html',
  techMotion: true,
};
