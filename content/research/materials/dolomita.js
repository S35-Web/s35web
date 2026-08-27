const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de dolomita molida (carbonato doble de calcio y magnesio, grado industrial), compilado en briefing interno S-35 FT-MP-023. Valores típicos de comercio/norma (ASTM D4794, ASTM C25), no ensayo de este lote.';

module.exports = {
  code: 'ML-FIL-003',
  slug: 'dolomita',
  slugEn: 'dolomite',
  name: { es: 'Dolomita', en: 'Dolomite' },
  scientificName: 'CaMg(CO₃)₂ · dolomite',
  category: 'FIL',
  classLabel: { es: 'CARGA MINERAL CARBONATADA', en: 'CARBONATE MINERAL FILLER' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de dolomita. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Se parece al carbonato de calcio y a la marmolina en aspecto y uso, pero lleva magnesio en su estructura. Ese detalle la hace más dura, más densa y menos reactiva con ácido: una carga con matices propios donde parecería intercambiable.\n\nLa dolomita es un carbonato doble: por cada catión de calcio hay uno de magnesio, ordenados en capas alternas. El carbonato de calcio y la marmolina son CaCO₃ sin ese segundo catión. El magnesio compacta la red: la dureza sube de 3 a 3.5–4 Mohs, la densidad real sube un poco y la efervescencia con ácido se vuelve lenta. A simple vista, las tres cargas son casi indistinguibles.\n\nLos números de esta ficha (pureza ≥95 % dolomita, densidad real 2.85–2.95 g/cm³, dureza 3.5–4 Mohs, blancura ISO 85–92) son valores típicos de dolomita comercial molida, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'It looks and is used like calcium carbonate and marble dust, but magnesium sits in the crystal. That makes it harder, denser and slower to react with acid: a filler with its own character where it would seem interchangeable.\n\nDolomite is a double carbonate: one magnesium for each calcium, in alternating layers. Calcium carbonate and marble dust are CaCO₃ without that second cation.\n\nFigures in this file (dolomite purity, real density, 3.5–4 Mohs, ISO whiteness) are typical commercial values for ground dolomite, not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Grado industrial · carbonato doble molido', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni proveedor.',
    sampleId: 'ML-SMP-00014',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp([1.30, 1.50], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL,
      method: 'ASTM C29 (referencia de método; no ejecutado sobre este lote)',
      note: 'Similar al carbonato de calcio, algo más denso por el magnesio.',
    }),
    specificGravity: dp([2.85, 2.95], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL,
      method: 'Densidad real (referencia de método; no ejecutado sobre este lote)',
    }),
    hardnessMohs: dp([3.5, 4], 'reference', {
      source: 'Dureza de la dolomita, escala de Mohs. Klein & Dutrow, Manual of Mineral Science.',
      note: 'Más dura que la calcita: mejora abrasión superficial.',
    }),
    waterAbsorption: dp(null, 'in-progress', { unit: '%', note: 'NOT YET MEASURED on this lot' }),
    oilAbsorption: dp([12, 18], 'reference', {
      unit: 'g / 100 g',
      source: TYPICAL,
      method: 'ASTM D281 (referencia de método; no ejecutado sobre este lote)',
      note: 'Algo menor que el carbonato puro: pide un poco menos de resina.',
    }),
    porosity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    color: dp('Blanco a blanco grisáceo, opaco', 'observation', {
      sampleId: 'ML-SMP-00014',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Carga molida de dolomita; presentación compacta en montículo', 'observation', {
      sampleId: 'ML-SMP-00014',
      date: '2026-08-27',
      method: 'Visual',
    }),
    grainRange: dp([3, 100], 'reference', {
      unit: 'µm D50',
      source: 'Rango comercial de grados grueso a micronizado según briefing interno FT-MP-023. No es D10–D90 de este lote.',
    }),
    whiteness: dp([85, 92], 'reference', {
      unit: 'ISO',
      source: TYPICAL,
      method: 'ISO 2470 (referencia de método; no ejecutado sobre este lote)',
      note: 'Ligeramente menos blanca que el carbonato de calcio puro.',
    }),
    phSaturated: dp([8.5, 9.5], 'reference', {
      source: TYPICAL + ' pH en suspensión.',
      method: 'Potenciómetro (referencia de método; no ejecutado sobre este lote)',
      note: 'Compatible con cemento, cal y yeso.',
    }),
    calcinationTemp: dp('≈730 y ≈900', 'reference', {
      unit: '°C',
      source: TYPICAL + ' Descomposición térmica en dos etapas.',
      method: 'Termogravimetría (referencia de método; no ejecutado sobre este lote)',
    }),
  },
  chemical: [
    {
      compound: 'Carbonato de calcio',
      formula: 'CaCO₃',
      percent: dp([50.0, 58.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Carbonato de magnesio',
      formula: 'MgCO₃',
      percent: dp([38.0, 44.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de silicio',
      formula: 'SiO₂',
      percent: dp([0.2, 1.5], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de hierro',
      formula: 'Fe₂O₃',
      percent: dp([0, 0.3], 'reference', { unit: '%', source: TYPICAL, note: 'Límite típico superior.' }),
    },
    {
      compound: 'Óxido de aluminio',
      formula: 'Al₂O₃',
      percent: dp([0, 0.3], 'reference', { unit: '%', source: TYPICAL, note: 'Límite típico superior.' }),
    },
  ],
  granulometry: {
    d10: dp(null, 'in-progress', { unit: 'µm', note: 'NOT YET MEASURED' }),
    d50: dp(null, 'in-progress', { unit: 'µm', note: 'NOT YET MEASURED on this lot — el grado comercial se declara por D50' }),
    d90: dp(null, 'in-progress', { unit: 'µm', note: 'NOT YET MEASURED' }),
  },
  morphology: {
    surface: dp('Superficie mate, granulada, sin brillo de fractura de mármol', 'observation', {
      sampleId: 'ML-SMP-00014',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Agregados irregulares de carga molida; el grano individual es de micras', 'observation', {
      sampleId: 'ML-SMP-00014',
      date: '2026-08-27',
    }),
    edgeProfile: dp('Contorno rugoso, fragmento de roca triturada, no cara pulida', 'observation', {
      sampleId: 'ML-SMP-00014',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'dolomita',
        alt: 'Referencia visual de dolomita: montículo blanco-gris sobre fondo blanco y detalle de gránulos mate irregulares',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Dureza 3.5–4 Mohs', effect: 'Más resistente a abrasión que el carbonato de calcio puro', direction: '↑' },
    { property: 'Reacción ácida lenta', effect: 'Menos erosión y eflorescencia en fachada con lluvia', direction: '↑' },
    { property: 'Ca:Mg ≈ 1:1', effect: 'No es caliza magnesiana: es otro mineral, otra red', direction: '↑' },
    { property: 'No es intercambiable a ciegas', effect: 'Absorción de aceite distinta: reajustar la fórmula', direction: '↓' },
    { property: 'Menos blanca (ISO 85–92)', effect: 'Cede blancura máxima a cambio de intemperie', direction: '↓' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el material se ve blanco a gris claro, compacto, con agregados mate e irregulares. No hay ensayo de blancura, D50, ni reacción con HCl publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the material is off-white to light grey, compact, with matte irregular agglomerates. No whiteness, D50 or HCl-reaction test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['carbonato-de-calcio', 'marmolina-fina', 'cal', 'cemento-blanco'],
  relatedResearch: ['caracterizacion-dolomita'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'dolomita.html',
  techMotion: true,
};
