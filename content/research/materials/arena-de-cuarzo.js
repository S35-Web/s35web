const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de arena de cuarzo de banco (sílice extraída y cribada, sin lavado industrial), compilado en briefing interno S-35 FT-MP-022. Valores típicos de comercio/norma (ASTM C33, ASTM C144), no ensayo de este lote.';

module.exports = {
  code: 'ML-AGG-005',
  slug: 'arena-de-cuarzo',
  slugEn: 'quartz-sand',
  name: { es: 'Arena de cuarzo', en: 'Quartz sand' },
  scientificName: 'SiO₂ · crystalline quartz',
  category: 'AGG',
  classLabel: { es: 'AGREGADO SILÍCEO DE BANCO', en: 'BANK SILICEOUS AGGREGATE' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de arena de cuarzo. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Sílice de banco, tal como se extrae y criba, sin el lavado ni la clasificación estricta de la arena silícea graduada. Es el punto medio entre la arena de río y la sílice graduada: más pura que la primera, menos controlada que la segunda.\n\nTres niveles de la misma familia mineral. La arena de río aporta grano redondeado de origen fluvial, mezclado con otros minerales. La arena de cuarzo es sílice dominante sin refinar: cribado simple, finos naturales, tono beige a blanco. La arena silícea graduada es esa misma sílice, lavada y separada por malla. Cada nivel cuesta más y ofrece más control.\n\nLos números de esta ficha (sílice 85–95 %, dureza 7 Mohs, densidad real 2.65 g/cm³, absorción 0.3–1.2 %) son valores típicos de arena de cuarzo comercial según ASTM C33 / C144, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Bank silica as extracted and screened, without the washing or strict sieve classification of graded silica sand. It sits between river sand and graded silica: purer than the first, less controlled than the second.\n\nThree grades of the same mineral family. River sand is rounded fluvial grain mixed with other minerals. Quartz sand is dominant silica, simply screened. Graded silica sand is that same silica, washed and cut by sieve.\n\nFigures in this file (silica 85–95 %, 7 Mohs, specific gravity 2.65, absorption 0.3–1.2 %) are typical commercial values for bank quartz sand (ASTM C33 / C144), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Grado comercial · banco cribado, sin lavado industrial', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni proveedor.',
    sampleId: 'ML-SMP-00013',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp([1450, 1650], 'reference', {
      unit: 'kg/m³',
      source: TYPICAL,
      method: 'ASTM C29 (referencia de método; no ejecutado sobre este lote)',
      note: 'Similar a otras arenas silíceas: material denso de manejar.',
    }),
    specificGravity: dp(2.65, 'reference', {
      unit: 'g/cm³',
      source: TYPICAL,
      method: 'ASTM C128 (referencia de método; no ejecutado sobre este lote)',
    }),
    hardnessMohs: dp(7, 'reference', {
      source: TYPICAL + ' Dureza del cuarzo cristalino.',
      note: 'Raya el vidrio y el acero blando.',
    }),
    waterAbsorption: dp([0.3, 1.2], 'reference', {
      unit: '%',
      source: TYPICAL,
      method: 'ASTM C128 (referencia de método; no ejecutado sobre este lote)',
      note: 'Algo mayor que la graduada por finos residuales.',
    }),
    porosity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    color: dp('Beige claro a blanco; granos translúcidos', 'observation', {
      sampleId: 'ML-SMP-00013',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Granular suelto, cribado simple, sin lavado industrial', 'observation', {
      sampleId: 'ML-SMP-00013',
      date: '2026-08-27',
      method: 'Visual',
    }),
    grainRange: dp(null, 'in-progress', {
      unit: 'mm',
      note: 'NOT YET MEASURED — cribado simple de banco; no hay D10–D90 de este lote.',
    }),
    finenessModulus: dp([2.2, 3.2], 'reference', {
      source: TYPICAL,
      method: 'ASTM C136 (referencia de método; no ejecutado sobre este lote)',
      note: 'Más variable de lote a lote que la graduada.',
    }),
    finesPassing200: dp([2, 6], 'reference', {
      unit: '%',
      source: TYPICAL,
      method: 'ASTM C117 (referencia de método; no ejecutado sobre este lote)',
      note: 'Más finos naturales que la arena lavada.',
    }),
    supplyMoisture: dp([1, 4], 'reference', {
      unit: '% a granel',
      source: TYPICAL,
      note: 'Humedad natural de banco; secado obligatorio para mezcla seca envasada.',
    }),
  },
  chemical: [
    {
      compound: 'Dióxido de silicio',
      formula: 'SiO₂',
      percent: dp([85, 95], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Sílice libre cristalina',
      percent: dp([80, 90], 'reference', {
        unit: '%',
        source: TYPICAL,
        method: 'Difracción RX (referencia de método; no ejecutado sobre este lote)',
        note: 'Riesgo de silicosis: protección respiratoria con polvo fino.',
      }),
    },
    {
      compound: 'Materia orgánica',
      percent: dp('Trazas posibles', 'reference', { source: TYPICAL, method: 'ASTM C40 (referencia de método; no ejecutado sobre este lote)' }),
    },
  ],
  granulometry: {
    d10: dp(null, 'in-progress', { unit: 'mm', note: 'NOT YET MEASURED' }),
    d50: dp(null, 'in-progress', { unit: 'mm', note: 'NOT YET MEASURED' }),
    d90: dp(null, 'in-progress', { unit: 'mm', note: 'NOT YET MEASURED' }),
  },
  morphology: {
    surface: dp('Lisa a ligeramente rugosa; granos translúcidos de cuarzo', 'observation', {
      sampleId: 'ML-SMP-00013',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Subredondeado', 'observation', {
      sampleId: 'ML-SMP-00013',
      date: '2026-08-27',
    }),
    edgeProfile: dp('Contorno suave de banco, no arista de molienda ni redondeo fluvial completo', 'observation', {
      sampleId: 'ML-SMP-00013',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'arena-de-cuarzo',
        alt: 'Referencia visual de arena de cuarzo: montículo beige-blanco sobre fondo blanco y detalle de granos translúcidos subredondeados',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Sílice 85–95 %', effect: 'Más pura que el río, menos controlada que la graduada', direction: '↑' },
    { property: 'Cribado simple', effect: 'Rinde en mortero general y prefabricado sin pagar malla certificada', direction: '↑' },
    { property: 'Finos 2–6 %', effect: 'Más limo que la lavada: ajustar agua de amasado por lote', direction: '↓' },
    { property: 'No es blanco puro', effect: 'El beige natural limita acabados que piden blancura total', direction: '↓' },
    { property: 'Sílice cristalina', effect: 'Riesgo de silicosis: protección respiratoria con el polvo fino', direction: '↓' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia los granos son beige a blanco, translúcidos, de contorno subredondeado, con partículas oscuras aisladas. No hay ensayo de mallas, absorción ni sílice libre publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the grains are beige to white, translucent, subrounded, with isolated dark particles. No sieve, absorption or free-silica test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['arena-de-rio', 'arena-silicea-graduada', 'cemento-gris', 'marmolina-fina', 'barita', 'vidrio-molido'],
  relatedResearch: ['caracterizacion-arena-de-cuarzo'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'arena-de-cuarzo.html',
  techMotion: true,
};
