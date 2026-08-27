const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de perlita expandida de grado construcción, compilado en briefing interno S-35 FT-MP-016. Valores típicos de comercio/norma (ASTM C549, ASTM C332), no ensayo de este lote.';

module.exports = {
  code: 'ML-AGG-002',
  slug: 'perlita-expandida',
  slugEn: 'expanded-perlite',
  name: { es: 'Perlita expandida', en: 'Expanded perlite' },
  scientificName: 'Expanded rhyolitic volcanic glass',
  category: 'AGG',
  classLabel: { es: 'AGREGADO LIGERO', en: 'LIGHTWEIGHT AGGREGATE' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-26',
  updatedAt: '2026-08-26',
  revisionHistory: [
    { rev: 1, date: '2026-08-26', change: 'Primera ficha pública: referencia visual y perfil típico de perlita expandida de grado construcción. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Vidrio volcánico que al calentarse revienta como palomita de maíz y multiplica su volumen. Queda un gránulo blanco, poroso y liviano: aligera morteros, aísla del calor y absorbe agua sin reaccionar químicamente con la mezcla.\n\nLa perlita cruda retiene entre 2 y 5 % de agua estructural. Al pasar por el horno (850–1 100 °C) el vidrio se reblandece y esa agua se convierte en vapor: la partícula se infla desde dentro y queda hecha de celdas huecas de pared muy delgada. El aire encerrado explica la ligereza y el aislamiento; la porosidad abierta explica la absorción de agua; la delgadez de las paredes explica por qué el gránulo se muele si se maltrata en la mezcladora.\n\nLos números de esta ficha (densidad aparente 80–150 kg/m³, conductividad 0.04–0.06 W/m·K, absorción 200–300 % en peso) son valores típicos de perlita comercial de grado construcción según ASTM C549 / ASTM C332, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Volcanic glass that pops like popcorn when heated and multiplies its volume. What remains is a white, porous, lightweight granule: it lightens mortars, insulates against heat and absorbs water without reacting chemically with the mix.\n\nCrude perlite holds 2–5 % structural water. In the kiln (850–1 100 °C) the glass softens and that water turns to steam: the particle inflates from the inside into thin-walled hollow cells.\n\nFigures in this file (bulk density, thermal conductivity, water absorption) are typical commercial values for construction-grade expanded perlite (ASTM C549 / ASTM C332), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Grado construcción', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni proveedor.',
    sampleId: 'ML-SMP-00007',
    date: '2026-08-26',
  }),
  physical: {
    bulkDensity: dp([80, 150], 'reference', {
      unit: 'kg/m³',
      source: TYPICAL,
      method: 'ASTM C549 (referencia de método; no ejecutado sobre este lote)',
    }),
    specificGravity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    hardnessMohs: dp(null, 'in-progress', { note: 'NOT YET MEASURED — grano frágil, baja resistencia al aplastamiento' }),
    waterAbsorption: dp([200, 300], 'reference', {
      unit: '% en peso',
      source: TYPICAL,
      method: 'ASTM C830 (referencia de método; no ejecutado sobre este lote)',
    }),
    porosity: dp('Celdas abiertas de pared delgada', 'reference', {
      source: TYPICAL,
    }),
    color: dp('Blanco a gris muy claro', 'observation', {
      sampleId: 'ML-SMP-00007',
      date: '2026-08-26',
      method: 'Referencia visual',
    }),
    structure: dp('Gránulo expandido, poroso, liviano', 'observation', {
      sampleId: 'ML-SMP-00007',
      date: '2026-08-26',
      method: 'Visual',
    }),
    grainRange: dp([0.2, 3.0], 'reference', {
      unit: 'mm',
      source: 'Grado fino a medio comercial de perlita expandida de construcción según briefing interno FT-MP-016. No es D10–D90 de este lote.',
    }),
    thermalConductivity: dp([0.04, 0.06], 'reference', {
      unit: 'W/m·K',
      source: TYPICAL,
      method: 'ASTM C177 (referencia de método; no ejecutado sobre este lote)',
    }),
    serviceTemp: dp(900, 'reference', {
      unit: '°C',
      source: TYPICAL + ' Estabilidad térmica de servicio continuo; EN 13501-1 como referencia de reacción al fuego.',
    }),
    phSaturated: dp([6.5, 8.0], 'reference', {
      source: TYPICAL,
      method: 'Potenciómetro (referencia de método; no ejecutado sobre este lote)',
    }),
    expansionRatio: dp([10, 20], 'reference', {
      unit: '×',
      source: TYPICAL + ' Expansión volumétrica respecto al mineral crudo.',
    }),
  },
  chemical: [
    {
      compound: 'Dióxido de silicio',
      formula: 'SiO₂',
      percent: dp([70.0, 76.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de aluminio',
      formula: 'Al₂O₃',
      percent: dp([12.0, 16.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de potasio',
      formula: 'K₂O',
      percent: dp([3.0, 5.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de sodio',
      formula: 'Na₂O',
      percent: dp([2.5, 4.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de hierro',
      formula: 'Fe₂O₃',
      percent: dp([0.5, 1.5], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de calcio',
      formula: 'CaO',
      percent: dp([0.5, 1.5], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Agua combinada (mineral crudo)',
      percent: dp([2.0, 5.0], 'reference', { unit: '%', source: TYPICAL, note: 'Agua estructural del mineral crudo, no del grano expandido.' }),
    },
  ],
  morphology: {
    surface: dp('Porosa, irregular, celdas abiertas visibles a simple vista', 'observation', {
      sampleId: 'ML-SMP-00007',
      date: '2026-08-26',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Gránulo expandido, contorno irregular', 'observation', {
      sampleId: 'ML-SMP-00007',
      date: '2026-08-26',
    }),
    edgeProfile: dp('Paredes delgadas, frágiles al aplastamiento', 'observation', {
      sampleId: 'ML-SMP-00007',
      date: '2026-08-26',
    }),
    voidStructure: dp('Celdas huecas de pared delgada; proceso irreversible', 'reference', {
      source: TYPICAL,
    }),
  },
  images: {
    macro: [
      {
        id: 'perlita-expandida',
        alt: 'Referencia visual de perlita expandida: montículo de gránulos blancos porosos sobre fondo blanco y detalle de textura',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Celdas de aire de pared delgada', effect: 'Aligera el mortero sin cambiar el volumen de trabajo', direction: '↑' },
    { property: 'Conductividad 0.04–0.06 W/m·K', effect: 'Aísla del calor; recubrimiento templado al tacto', direction: '↑' },
    { property: 'Absorción 200–300 % en peso', effect: 'Roba agua de amasado si no se prehumedece', direction: '↓' },
    { property: 'Grano frágil', effect: 'El mezclado agresivo muele el gránulo y pierde el aire', direction: '↓' },
    { property: 'pH 6.5–8.0, inerte', effect: 'Compatible con cemento, cal y yeso sin reaccionar', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-26',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia los gránulos son blancos, porosos e irregulares. No hay ensayo de densidad aparente, conductividad ni absorción publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the granules are white, porous and irregular. No bulk-density, conductivity or absorption test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['yeso', 'cal', 'arena-de-rio', 'jal-pumita', 'vermiculita-expandida', 'celulosa-hpmc', 'diatomita', 'barita', 'vidrio-expandido'],
  relatedResearch: ['caracterizacion-perlita-expandida'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'perlita-expandida.html',
  techMotion: true,
};
