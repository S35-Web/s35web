const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de bentonita sódica de grado industrial, compilado en briefing interno S-35 FT-MP-014. Valores típicos de comercio/norma (ASTM D5890, API 13A), no ensayo de este lote.';

module.exports = {
  code: 'ML-MIN-001',
  slug: 'bentonita-sodica',
  slugEn: 'sodium-bentonite',
  name: { es: 'Bentonita sódica', en: 'Sodium bentonite' },
  scientificName: '(Na,Ca)₀.₃₃(Al,Mg)₂Si₄O₁₀(OH)₂·nH₂O',
  category: 'MIN',
  classLabel: { es: 'ARCILLA MINERAL', en: 'MINERAL CLAY' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de bentonita sódica de grado industrial. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Arcilla natural que absorbe agua hasta multiplicar su volumen. Sella, espesa y aglomera. Es el material que convierte agua en gel y polvo en barrera.\n\nLa montmorillonita está hecha de láminas microscópicas apiladas como hojas de papel: dos capas de silicio con una de aluminio en medio (arcilla 2:1). Entre cada par de láminas viven iones de sodio. Cuando entra agua, el sodio la atrae y las láminas se separan: la partícula se abre, gana volumen y el conjunto se vuelve gel. Hinchamiento, impermeabilidad, viscosidad y poder aglomerante son el mismo fenómeno visto desde distintos ángulos.\n\nLos números de esta ficha (hinchamiento ≥24 ml / 2 g, superficie interna ≈750 m²/g, pH 8.5–10.5, 90–95 % pasa #200) son valores típicos de bentonita sódica comercial de grado industrial según ASTM D5890 / API 13A, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Natural clay that absorbs water until it multiplies its volume. It seals, thickens and agglomerates: water becomes gel and powder becomes a barrier.\n\nMontmorillonite is stacked microscopic sheets — two silica layers with aluminium in between (a 2:1 clay). Sodium ions live between the sheets. Water is pulled in, the sheets separate, the particle opens and the mix turns to gel.\n\nFigures in this file (swell index, internal surface, pH, #200 passing) are typical commercial values for industrial-grade sodium bentonite (ASTM D5890 / API 13A), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Grado industrial', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni proveedor.',
    sampleId: 'ML-SMP-00010',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp([0.80, 1.00], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL,
      method: 'Gravimetría (referencia de método; no ejecutado sobre este lote)',
    }),
    specificGravity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    hardnessMohs: dp(null, 'in-progress', { note: 'NOT YET MEASURED — arcilla, no grano pétreo' }),
    waterAbsorption: dp([15, 20], 'reference', {
      unit: '× volumen seco',
      source: TYPICAL,
      method: 'ASTM D5890 (referencia de método; no ejecutado sobre este lote)',
    }),
    porosity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    color: dp('Polvo fino pálido, cremoso a beige', 'observation', {
      sampleId: 'ML-SMP-00010',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Arcilla laminar 2:1, montmorillonita sódica', 'observation', {
      sampleId: 'ML-SMP-00010',
      date: '2026-08-27',
      method: 'Visual',
    }),
    grainRange: dp(75, 'reference', {
      unit: 'µm',
      source: 'Tamaño de partícula típico: 90–95 % pasa malla #200 según briefing interno FT-MP-014. No es curva de este lote.',
    }),
    swellIndex: dp(24, 'reference', {
      unit: 'ml / 2 g mínimo',
      source: TYPICAL,
      method: 'ASTM D5890 (referencia de método; no ejecutado sobre este lote)',
    }),
    marshViscosity: dp([35, 50], 'reference', {
      unit: 's (6 %)',
      source: TYPICAL,
      method: 'API 13A (referencia de método; no ejecutado sobre este lote)',
    }),
    filtrateLoss: dp(15.0, 'reference', {
      unit: 'ml máximo',
      source: TYPICAL,
      method: 'API 13B-1 (referencia de método; no ejecutado sobre este lote)',
    }),
    phSaturated: dp([8.5, 10.5], 'reference', {
      source: TYPICAL + ' Solución al 5 %.',
      method: 'Potenciómetro (referencia de método; no ejecutado sobre este lote)',
    }),
    supplyMoisture: dp([10, 12], 'reference', {
      unit: '% máximo',
      source: TYPICAL,
    }),
    cec: dp([70, 100], 'reference', {
      unit: 'meq / 100 g',
      source: TYPICAL,
      method: 'Acetato de amonio (referencia de método; no ejecutado sobre este lote)',
    }),
    specificSurface: dp(750, 'reference', {
      unit: 'm²/g',
      source: TYPICAL + ' Superficie interna típica de montmorillonita sódica.',
    }),
  },
  chemical: [
    {
      compound: 'Dióxido de silicio',
      formula: 'SiO₂',
      percent: dp([55.0, 65.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de aluminio',
      formula: 'Al₂O₃',
      percent: dp([18.0, 21.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de hierro',
      formula: 'Fe₂O₃',
      percent: dp([3.0, 5.0], 'reference', { unit: '%', source: TYPICAL, note: 'Explica el tono beige o amarillento del polvo.' }),
    },
    {
      compound: 'Óxido de sodio',
      formula: 'Na₂O',
      percent: dp([2.0, 3.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de magnesio',
      formula: 'MgO',
      percent: dp([1.5, 2.5], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de calcio',
      formula: 'CaO',
      percent: dp([0.5, 1.5], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Pérdida por calcinación',
      formula: 'L.O.I.',
      percent: dp([5.0, 8.0], 'reference', { unit: '%', source: TYPICAL, note: 'Agua estructural que se va al calentar.' }),
    },
  ],
  morphology: {
    surface: dp('Polvo fino, textura de talco, sin grano perceptible al tacto', 'observation', {
      sampleId: 'ML-SMP-00010',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Partículas laminares de montmorillonita, aglomeradas en polvo', 'observation', {
      sampleId: 'ML-SMP-00010',
      date: '2026-08-27',
    }),
    edgeProfile: dp('Aglomerados irregulares, porosos, de aspecto terroso', 'observation', {
      sampleId: 'ML-SMP-00010',
      date: '2026-08-27',
    }),
    voidStructure: dp('Espacio interlaminar 2:1: iones Na⁺ y agua adsorbida', 'reference', {
      source: TYPICAL,
    }),
  },
  images: {
    macro: [
      {
        id: 'bentonita-sodica',
        alt: 'Referencia visual de bentonita sódica: montículo de polvo granular beige sobre fondo blanco y detalle de textura',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Hinchamiento 15–20×', effect: 'Sella cavidades y baja la permeabilidad varios órdenes de magnitud', direction: '↑' },
    { property: 'Tixotropía', effect: 'Fluye al bombear y recupera cuerpo en reposo; no sedimenta', direction: '↑' },
    { property: 'Dosis 1–5 %', effect: 'Basta poco para cambiar reología y cohesión; no es una carga', direction: '↑' },
    { property: 'Sensible al calcio', effect: 'Agua dura, yeso o cemento colapsan el hinchamiento', direction: '↓' },
    { property: 'Contracción al secar', effect: 'Lo que se hincha también se encoge; pide desgrasante y secado lento', direction: '↓' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el polvo es beige a gris claro, granular, con aglomerados irregulares. No hay ensayo de hinchamiento ASTM D5890, viscosidad Marsh ni pH publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the powder is beige to light grey, granular, with irregular agglomerates. No ASTM D5890 swell, Marsh viscosity or pH test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['arena-silicea-graduada', 'yeso', 'cemento-gris'],
  relatedResearch: ['caracterizacion-bentonita-sodica'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'bentonita-sodica.html',
  techMotion: true,
};
