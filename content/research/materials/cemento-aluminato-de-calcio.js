const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de cemento de aluminato de calcio (CAC) de grado estándar / industrial, compilado en briefing interno S-35 FT-MP-027. Valores típicos de comercio/norma (ASTM C219, EN 14647, ASTM C109), no ensayo de este lote. No se publica planta.';

module.exports = {
  code: 'ML-BND-005',
  slug: 'cemento-aluminato-de-calcio',
  slugEn: 'calcium-aluminate-cement',
  name: { es: 'Cemento de aluminato de calcio', en: 'Calcium aluminate cement' },
  scientificName: 'CaAl₂O₄ · monocalcium aluminate (CAC)',
  category: 'BND',
  classLabel: { es: 'CEMENTANTE HIDRÁULICO ESPECIAL', en: 'SPECIAL HYDRAULIC BINDER' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de cemento de aluminato de calcio. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Un cementante hidráulico distinto del Portland: fragua por hidratación de aluminatos, no de silicatos. Desarrolla resistencia en horas en lugar de semanas y soporta temperatura donde el cemento gris se descompone.\n\nEl Portland gana resistencia porque sus silicatos de calcio reaccionan con agua durante semanas. El CAC sigue otra ruta: su fase principal, el aluminato monocálcico, hidrata mucho más rápido y forma una red de cristales casi de inmediato. Los hidratos iniciales son metaestables y, con el tiempo, se reorganizan en una fase más densa (conversión): un cambio previsto, que se diseña desde la mezcla y no se usa como cementante de obra general.\n\nLos números de esta ficha (resistencia ≥40 MPa a 24 h, Al₂O₃ 36–42 % en grado estándar, servicio hasta 1 800 °C en grado refractario, fraguado inicial 2.5–5 h) son valores típicos de CAC comercial según EN 14647 / ASTM C109, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'A hydraulic binder unlike Portland: it sets by hydrating aluminates, not silicates. It develops strength in hours instead of weeks and withstands temperatures where grey cement breaks down.\n\nPortland gains strength as calcium silicates react with water over weeks. CAC takes another path: monocalcium aluminate hydrates much faster. Early hydrates are metastable and later reorganise into a denser phase (conversion) — an expected change, designed into the mix, not used as a general-purpose structural cement.\n\nFigures in this file (24-hour strength, alumina content, service temperature, initial set) are typical commercial values for CAC (EN 14647 / ASTM C109), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Grado refractario e industrial', 'observation', {
    note: 'Clase comercial. No se publica planta ni marca.',
    sampleId: 'ML-SMP-00018',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { unit: 'g/cm³', note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    color: dp('Gris medio uniforme, con microagregados mate', 'observation', {
      sampleId: 'ML-SMP-00018',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Polvo hidráulico fino de aluminato monocálcico', 'observation', {
      sampleId: 'ML-SMP-00018',
      date: '2026-08-27',
      method: 'Visual',
    }),
    kilnTemp: dp(1450, 'reference', {
      unit: '°C',
      source: TYPICAL + ' Fusión de caliza y bauxita.',
    }),
    strengthClass: dp(40, 'reference', {
      unit: 'MPa a 24 h',
      source: TYPICAL + ' Resistencia típica a 24 h según ASTM C109; no es ensayo de este saco.',
      method: 'ASTM C109 (referencia de método; no ejecutado sobre este lote)',
    }),
    waterCementRatio: dp(0.40, 'reference', {
      source: TYPICAL + ' Relación a/c de diseño habitual por debajo de 0.40 para limitar la pérdida por conversión; no una dosificación S-35.',
      note: 'Máximo de diseño recomendado; más agua acelera la conversión.',
    }),
    serviceTemp: dp(1800, 'reference', {
      unit: '°C',
      source: TYPICAL + ' Temperatura de servicio de grado refractario.',
      method: 'ASTM C288 (referencia de método; no ejecutado sobre este lote)',
    }),
    settingTime: dp([2.5, 5], 'reference', {
      unit: 'h (fraguado inicial)',
      source: TYPICAL,
      method: 'ASTM C266 (referencia de método; no ejecutado sobre este lote)',
    }),
  },
  chemical: [
    {
      compound: 'Óxido de aluminio',
      formula: 'Al₂O₃',
      percent: dp([36.0, 42.0], 'reference', { unit: '%', source: TYPICAL, note: 'Grado estándar. Grados blanco y refractario suben el Al₂O₃.' }),
    },
    {
      compound: 'Óxido de calcio',
      formula: 'CaO',
      percent: dp([36.0, 40.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de hierro',
      formula: 'Fe₂O₃',
      percent: dp([12.0, 16.0], 'reference', { unit: '%', source: TYPICAL, note: 'Da el gris oscuro, distinto del gris azulado del Portland.' }),
    },
    {
      compound: 'Dióxido de silicio',
      formula: 'SiO₂',
      percent: dp([4.0, 8.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de titanio',
      formula: 'TiO₂',
      percent: dp([1.5, 2.5], 'reference', { unit: '%', source: TYPICAL }),
    },
  ],
  morphology: {
    surface: dp('Polvo fino gris, con nódulos y microagregados porosos', 'observation', {
      sampleId: 'ML-SMP-00018',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Partículas de molienda, sin forma de agregado', 'observation', {
      sampleId: 'ML-SMP-00018',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'cemento-aluminato-de-calcio',
        alt: 'Referencia visual de cemento de aluminato de calcio: montículo de polvo gris medio sobre fondo blanco y detalle de microagregados mate',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Aluminatos, no silicatos', effect: 'Resistencia útil en 6–24 h, no en 7–28 días', direction: '↑' },
    { property: 'Hasta 1 800 °C (grado refractario)', effect: 'Sigue en servicio donde el Portland se descompone', direction: '↑' },
    { property: 'Alta resistencia a sulfatos', effect: 'Apto en suelos y aguas agresivas sin tipo especial de Portland', direction: '↑' },
    { property: 'Conversión de hidratos', effect: 'Diseñar con la resistencia post-conversión, no con el pico de 24 h', direction: '→' },
    { property: 'Incompatible con Portland y cal', effect: 'Fraguado relámpago: silos, herramientas y mezclas por separado', direction: '↓' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el polvo es gris medio, uniforme, con nódulos y microagregados mate. No hay ensayo de fraguado ASTM C266, resistencia ASTM C109 ni conversión publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the powder is medium grey, uniform, with matte nodules and micro-aggregates. No ASTM C266 set, ASTM C109 strength or conversion test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['cemento-gris', 'cemento-blanco', 'cal', 'yeso'],
  relatedResearch: ['caracterizacion-cemento-aluminato-de-calcio'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'cemento-aluminato-de-calcio.html',
  techMotion: true,
};
