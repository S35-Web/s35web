const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de arena silícea graduada de grado comercial, compilado en briefing interno S-35 FT-MP-017. Valores típicos de comercio/norma (ASTM C33, ASTM C144, ASTM C778), no ensayo de este lote.';

module.exports = {
  code: 'ML-AGG-003',
  slug: 'arena-silicea-graduada',
  slugEn: 'graded-silica-sand',
  name: { es: 'Arena silícea graduada', en: 'Graded silica sand' },
  scientificName: 'SiO₂ · crystalline quartz',
  category: 'AGG',
  classLabel: { es: 'AGREGADO SILÍCEO', en: 'SILICEOUS AGGREGATE' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-26',
  updatedAt: '2026-08-26',
  revisionHistory: [
    { rev: 1, date: '2026-08-26', change: 'Primera ficha pública: referencia visual y perfil típico de arena silícea graduada. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Cuarzo molido y tamizado en fracciones controladas. A diferencia de la arena de río, aquí la curva granulométrica es el producto: cada malla se separa para poder armar la mezcla exacta que un mortero necesita.\n\nLa arena no aporta reacción química: aporta esqueleto. El cemento, la cal o el yeso solo tienen que llenar los huecos entre granos y pegarlos. Cuanto mejor empaquetados estén, menos pasta se necesita y menos se contrae la mezcla al secar. Al combinar mallas gruesas, medias y finas los granos chicos ocupan los huecos de los grandes; el vacío baja de un 40 % a cerca de un 25 %.\n\nLos números de esta ficha (sílice ≥95 %, dureza 7 Mohs, densidad real 2.65 g/cm³, absorción 0.2–0.8 %) son valores típicos de arena silícea comercial según ASTM C33 / C144 / C778, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Ground quartz sieved into controlled fractions. Unlike river sand, here the grading curve is the product: each sieve cut is separated so a mortar can be built to an exact mix.\n\nSand does not react chemically: it is skeleton. Cement, lime or gypsum only have to fill the voids between grains and bind them. Combining coarse, medium and fine cuts lets small grains occupy the voids of large ones; void content falls from about 40 % to about 25 %.\n\nFigures in this file (silica ≥95 %, 7 Mohs, specific gravity 2.65, absorption 0.2–0.8 %) are typical commercial values for graded silica sand (ASTM C33 / C144 / C778), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Grado comercial · clasificada por malla', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni proveedor.',
    sampleId: 'ML-SMP-00008',
    date: '2026-08-26',
  }),
  physical: {
    bulkDensity: dp([1400, 1600], 'reference', {
      unit: 'kg/m³',
      source: TYPICAL,
      method: 'ASTM C29 (referencia de método; no ejecutado sobre este lote)',
    }),
    specificGravity: dp(2.65, 'reference', {
      unit: 'g/cm³',
      source: TYPICAL,
      method: 'ASTM C128 (referencia de método; no ejecutado sobre este lote)',
    }),
    hardnessMohs: dp(7, 'reference', {
      source: TYPICAL + ' Dureza del cuarzo cristalino.',
    }),
    waterAbsorption: dp([0.2, 0.8], 'reference', {
      unit: '%',
      source: TYPICAL,
      method: 'ASTM C128 (referencia de método; no ejecutado sobre este lote)',
    }),
    porosity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    color: dp('Grano translúcido, blanco a ámbar', 'observation', {
      sampleId: 'ML-SMP-00008',
      date: '2026-08-26',
      method: 'Referencia visual',
    }),
    structure: dp('Granular, granos sueltos, clasificados por malla', 'observation', {
      sampleId: 'ML-SMP-00008',
      date: '2026-08-26',
      method: 'Visual',
    }),
    grainRange: dp([0.075, 1.19], 'reference', {
      unit: 'mm',
      source: 'Rango comercial de mallas #200 a #16 según briefing interno FT-MP-017. No es D10–D90 de este lote.',
    }),
    finenessModulus: dp([1.8, 3.1], 'reference', {
      source: TYPICAL,
      method: 'ASTM C136 (referencia de método; no ejecutado sobre este lote)',
    }),
    meltingPoint: dp(1713, 'reference', {
      unit: '°C',
      source: TYPICAL + ' Punto de fusión del cuarzo.',
    }),
    finesPassing200: dp(3, 'reference', {
      unit: '% máximo',
      source: TYPICAL,
      method: 'ASTM C117 (referencia de método; no ejecutado sobre este lote)',
    }),
    supplyMoisture: dp(0.5, 'reference', {
      unit: '% máximo',
      source: TYPICAL + ' Requisito habitual para mezcla seca envasada, secada en horno.',
    }),
  },
  chemical: [
    {
      compound: 'Dióxido de silicio',
      formula: 'SiO₂',
      percent: dp([95.0, 99.5], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de aluminio',
      formula: 'Al₂O₃',
      percent: dp([0.2, 2.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de hierro',
      formula: 'Fe₂O₃',
      percent: dp([0.05, 0.5], 'reference', { unit: '%', source: TYPICAL, note: 'Por debajo de 0.1 % la arena es prácticamente blanca.' }),
    },
    {
      compound: 'Óxidos alcalinos',
      formula: 'Na₂O + K₂O',
      percent: dp(0.5, 'reference', { unit: '% máximo', source: TYPICAL }),
    },
    {
      compound: 'Arcilla y finos plásticos',
      percent: dp(1.0, 'reference', { unit: '% máximo', source: TYPICAL }),
    },
    {
      compound: 'Materia orgánica',
      percent: dp('Ausente', 'reference', { source: TYPICAL }),
    },
  ],
  granulometry: {
    sieves: [
      { openingMm: 1.19, sieve: '#16', passingPercent: dp(null, 'in-progress', { unit: '%', note: 'Curva del lote no medida.' }) },
      { openingMm: 0.6, sieve: '#30', passingPercent: dp(null, 'in-progress', { unit: '%', note: 'Curva del lote no medida.' }) },
      { openingMm: 0.3, sieve: '#50', passingPercent: dp(null, 'in-progress', { unit: '%', note: 'Curva del lote no medida.' }) },
      { openingMm: 0.15, sieve: '#100', passingPercent: dp(null, 'in-progress', { unit: '%', note: 'Curva del lote no medida.' }) },
      { openingMm: 0.075, sieve: '#200', passingPercent: dp(null, 'in-progress', { unit: '%', note: 'Curva del lote no medida.' }) },
    ],
    d10: dp(null, 'in-progress', { unit: 'mm', note: 'NOT YET MEASURED' }),
    d50: dp(null, 'in-progress', { unit: 'mm', note: 'NOT YET MEASURED' }),
    d90: dp(null, 'in-progress', { unit: 'mm', note: 'NOT YET MEASURED' }),
  },
  morphology: {
    surface: dp('Lisa a ligeramente rugosa; grano de cuarzo', 'observation', {
      sampleId: 'ML-SMP-00008',
      date: '2026-08-26',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Subangular a angular', 'observation', {
      sampleId: 'ML-SMP-00008',
      date: '2026-08-26',
    }),
    edgeProfile: dp('Aristas de molienda, no redondeo fluvial', 'observation', {
      sampleId: 'ML-SMP-00008',
      date: '2026-08-26',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'arena-silicea-graduada',
        alt: 'Referencia visual de arena silícea graduada: montículo beige de granos clasificados sobre fondo blanco y detalle de textura',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Curva controlada por malla', effect: 'Se arma el empaquetamiento; menos vacío, menos pasta, menos contracción', direction: '↑' },
    { property: 'Grano subangular', effect: 'Traba mejor que el grano redondo de río; pide algo más de trabajabilidad', direction: '↑' },
    { property: 'Absorción 0.2–0.8 %', effect: 'Casi no roba agua de amasado; el agua queda para la pasta', direction: '↑' },
    { property: 'Sílice cristalina >95 %', effect: 'Riesgo de silicosis: el polvo fino exige protección respiratoria estricta', direction: '↓' },
    { property: 'Inerte, sin sales', effect: 'No cambia el pH ni aporta eflorescencias; el color viene del grano', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-26',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia los granos son beige a crema, de tamaño uniforme, con partículas más oscuras aisladas. No hay ensayo de mallas, absorción ni sílice libre publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the grains are beige to cream, even in size, with isolated darker particles. No sieve, absorption or free-silica test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['arena-de-rio', 'marmolina-fina', 'cemento-gris', 'bentonita-sodica', 'arena-de-cuarzo'],
  relatedResearch: ['caracterizacion-arena-silicea-graduada'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'arena-silicea-graduada.html',
  techMotion: true,
};
