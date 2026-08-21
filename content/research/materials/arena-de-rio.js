const { dp } = require('../dp');

/** ASTM C33 / NMX-C-111 fine-aggregate grading envelope (percent passing). Public standard. */
const ASTM_C33_FINE = [
  { openingMm: 9.5, min: 100, max: 100, sieve: '3/8 in' },
  { openingMm: 4.75, min: 95, max: 100, sieve: '#4' },
  { openingMm: 2.36, min: 80, max: 100, sieve: '#8' },
  { openingMm: 1.18, min: 50, max: 85, sieve: '#16' },
  { openingMm: 0.6, min: 25, max: 60, sieve: '#30' },
  { openingMm: 0.3, min: 5, max: 30, sieve: '#50' },
  { openingMm: 0.15, min: 0, max: 10, sieve: '#100' },
  { openingMm: 0.075, min: 0, max: 3, sieve: '#200' },
];

const ASTM_C33 = 'ASTM C33 / NMX-C-111-ONNCCE, agregado fino para concreto (banda normativa, no curva de este lote)';

module.exports = {
  code: 'ML-AGG-001',
  slug: 'arena-de-rio',
  slugEn: 'river-sand',
  name: { es: 'Arena de río', en: 'River sand' },
  scientificName: 'Natural siliceous fine aggregate',
  category: 'AGG',
  classLabel: { es: 'AGREGADO FINO NATURAL', en: 'NATURAL FINE AGGREGATE' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-19',
  updatedAt: '2026-08-19',
  revisionHistory: [
    { rev: 1, date: '2026-08-19', change: 'Primera ficha pública: referencia visual y marco normativo ASTM C33. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'La arena de río que entra a una planta de materiales no es un insumo genérico. Es el resultado de un transporte fluvial: la corriente arranca fragmentos de la sierra, los golpea entre sí durante kilómetros y deposita primero lo pesado y después lo fino. Ese viaje redondea aristas y clasifica tamaños. Un grano fluvial no se comporta como un grano de trituración: rueda entre sus vecinos en lugar de trabarse.\n\nEn Sinaloa, los depósitos aluviales arrastran una mineralogía mixta —cuarzo, feldespatos y líticos volcánicos de la Sierra Madre Occidental— visible a simple vista en la referencia visual: partículas translúcidas junto a opacas grises y pardas, de contorno subredondeado. MateriaLab documenta esa presentación como caracterización de materia prima, no como curva objetivo de producción ni como ficha de un producto S-35.\n\nComo agregado fino, la arena de río ocupa el espacio entre las piedras más gruesas de un concreto o un mortero. Su forma redondeada reduce la demanda de agua respecto a una arena triturada de la misma granulometría; a cambio, aporta menos trabazón mecánica. Quien formula un estuco o un concreto tiene que decidir cuánta fluidez necesita y cuánta resistencia al corte espera del esqueleto granular. Esa decisión no se improvisa en obra: se documenta aquí, con procedencia a la vista.\n\nEsta ficha no publica un ensayo granulométrico de un lote medido. Publica el marco normativo contra el que ese ensayo se comparará —la banda de agregado fino de ASTM C33 / NMX-C-111-ONNCCE— y deja en NOT YET MEASURED lo que todavía no se midió: absorción, densidad aparente, módulo de finura del lote, equivalentes de arena. Los valores de cabecera (tamaño máximo 4.75 mm, módulo de finura admisible 2.3–3.1, densidad relativa típica 2.60) son perfiles de referencia de la norma y de la literatura, no resultados de un saco concreto.\n\nEl archivo crece en ese orden a propósito: primero la referencia visual, después la observación, después el número medido. Publicar una curva inventada destruiría la razón de ser de MateriaLab.',
    en: 'River sand arriving at a materials plant is not a generic input. It is the product of fluvial transport: the current strips fragments from the range, knocks them against each other for kilometres, and deposits the heavy fraction first. That journey rounds edges and sorts sizes. A fluvial grain does not behave like a crushed grain: it rolls among its neighbours instead of interlocking.\n\nIn Sinaloa, alluvial deposits carry mixed mineralogy — quartz, feldspars and volcanic lithics from the Sierra Madre Occidental — visible in the visual reference. MateriaLab records that appearance as raw-material characterisation, not as a production target curve and not as a product data sheet.\n\nThis file does not publish a sieve analysis of a measured lot. It publishes the ASTM C33 / NMX-C-111 envelope against which that analysis will be compared, and marks unmeasured properties as NOT YET MEASURED.',
  },
  origin: dp('Sinaloa, MX', 'observation', {
    note: 'Región de procedencia declarada. No se publica banco ni proveedor.',
    sampleId: 'ML-SMP-00001',
    date: '2026-08-11',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { unit: 'g/cm³', note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp(2.6, 'reference', {
      unit: '',
      source: 'Valor típico de arena silícea; Kosmatka, Kerkhoff & Panarese, Design and Control of Concrete Mixtures, PCA. No es densidad de este lote.',
      method: 'ASTM C128 (referencia de método; no ejecutado aquí)',
    }),
    hardnessMohs: dp([6, 7], 'reference', {
      source: 'Dureza del cuarzo, mineral dominante en arenas fluviales silíceas. Klein & Dutrow, Manual of Mineral Science. La muestra es polimineral; el rango describe el grano de cuarzo, no el lote completo.',
    }),
    waterAbsorption: dp(null, 'in-progress', { unit: '%', note: 'NOT YET MEASURED on this lot' }),
    porosity: dp(null, 'in-progress', { note: 'NOT YET MEASURED' }),
    color: dp('Beige a gris pardo, mixto', 'observation', {
      sampleId: 'ML-SMP-00001',
      date: '2026-08-11',
      method: 'Referencia visual',
    }),
    structure: dp('Granular, granos sueltos, sin cementación', 'observation', {
      sampleId: 'ML-SMP-00001',
      date: '2026-08-11',
      method: 'Visual',
    }),
    maxSize: dp(4.75, 'reference', {
      unit: 'mm',
      source: ASTM_C33 + '. El 4.75 mm (malla #4) define agregado fino; no es un Dmax medido de este lote.',
      method: 'ASTM C33',
    }),
    finenessModulus: dp([2.3, 3.1], 'reference', {
      source: 'Rango admisible habitual de módulo de finura para arena de concreto, ASTM C33. No es el MF de este lote.',
      method: 'ASTM C33 / ASTM C136',
    }),
  },
  chemical: [
    {
      compound: 'Cuarzo y silicatos (SiO₂)',
      formula: 'SiO₂',
      percent: dp(null, 'in-progress', { unit: '%', note: 'Ensayo químico del lote no realizado. Mineralogía típica fluvial: cuarzo dominante.' }),
    },
    {
      compound: 'Feldespatos',
      percent: dp(null, 'in-progress', { unit: '%', note: 'NOT YET MEASURED' }),
    },
    {
      compound: 'Líticos volcánicos',
      percent: dp(null, 'in-progress', { unit: '%', note: 'NOT YET MEASURED' }),
    },
  ],
  granulometry: {
    sieves: ASTM_C33_FINE.map(function (row) {
      return {
        openingMm: row.openingMm,
        sieve: row.sieve,
        passingPercent: dp(null, 'in-progress', {
          unit: '%',
          note: 'Curva del lote no medida. Ver banda ASTM C33 en la gráfica.',
        }),
      };
    }),
    specBand: {
      provenance: 'reference',
      source: ASTM_C33,
      limits: ASTM_C33_FINE,
    },
    d10: dp(null, 'in-progress', { unit: 'mm', note: 'NOT YET MEASURED' }),
    d50: dp(null, 'in-progress', { unit: 'mm', note: 'NOT YET MEASURED' }),
    d90: dp(null, 'in-progress', { unit: 'mm', note: 'NOT YET MEASURED' }),
  },
  morphology: {
    surface: dp('Lisa a ligeramente rugosa; aristas desgastadas', 'observation', {
      sampleId: 'ML-SMP-00001',
      date: '2026-08-11',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Subredondeado', 'observation', {
      sampleId: 'ML-SMP-00001',
      date: '2026-08-11',
      method: 'Comparación visual con clases de forma fluvial (redondeado / subredondeado / anguloso)',
    }),
    edgeProfile: dp('Contornos suavizados por arrastre fluvial', 'observation', {
      sampleId: 'ML-SMP-00001',
      date: '2026-08-11',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'arena-de-rio',
        alt: 'Referencia visual de arena de río de Sinaloa: montículo sobre fondo blanco y detalle de granos',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Forma subredondeada', effect: 'Menor demanda de agua a igual granulometría; mezcla más fluida', direction: '↑' },
    { property: 'Traba mecánica', effect: 'Menor interlocking que una arena triturada; menor contribución a resistencia al corte', direction: '↓' },
    { property: 'Mineralogía mixta', effect: 'Color y densidad varían por banco y por temporada; hay que verificar lote', direction: '→' },
    { property: 'Finos no controlados', effect: 'Si el equivalente de arena baja, el cemento “se come” y cae la resistencia', direction: '↓' },
  ],
  labNotes: [
    {
      date: '2026-08-11',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia los granos mezclan cuarzo translúcido, opacos grises y partículas pardas; la forma predominante es subredondeada. No hay ensayo de mallas ni absorción publicado.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the grains mix translucent quartz, opaque greys and brown particles; the dominant shape is sub-rounded. No sieve or absorption test is published.',
      },
    },
  ],
  relatedMaterials: ['marmolina-fina', 'cemento-gris'],
  relatedResearch: ['caracterizacion-arena-de-rio'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'arena-de-rio.html',
};
