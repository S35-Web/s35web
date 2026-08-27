const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de carbonato de calcio molido (GCC, caliza micronizada de grado industrial), compilado en briefing interno S-35 FT-MP-021. Valores típicos de comercio/norma (ASTM D4794, ASTM C25, ISO 2470), no ensayo de este lote.';

module.exports = {
  code: 'ML-FIL-002',
  slug: 'carbonato-de-calcio',
  slugEn: 'calcium-carbonate',
  name: { es: 'Carbonato de calcio', en: 'Calcium carbonate' },
  scientificName: 'CaCO₃ · calcite',
  category: 'FIL',
  classLabel: { es: 'CARGA MINERAL CALCÁREA', en: 'CALCAREOUS MINERAL FILLER' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de carbonato de calcio molido. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Piedra caliza molida hasta el tamaño de partícula que pide cada uso. No reacciona con el agua ni con el cementante: ocupa volumen, aporta blancura y reduce el costo de una fórmula. Por eso se le llama carga.\n\nEs el mismo mineral de la marmolina y de la cal —calcita, CaCO₃— pero aquí el tamaño cambia el oficio. Un grano de marmolina se ve y se pule; una carga de micras se esconde en la pasta, cierra poros y rinde litros. El proceso es mecánico: trituración, molienda y clasificación. La química no cambia.\n\nLos números de esta ficha (pureza ≥97 % CaCO₃, densidad real 2.70–2.75 g/cm³, blancura ISO 92–96, dureza 3 Mohs) son valores típicos de carbonato comercial molido, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Ground limestone taken to the particle size each use requires. It does not react with water or the binder: it occupies volume, adds whiteness and lowers the cost of a formula. That is why it is called a filler.\n\nIt is the same mineral as marble dust and lime — calcite, CaCO₃ — but size changes the job. A marble-dust grain is seen and polished; a micron-scale filler hides in the paste, closes pores and yields litres.\n\nFigures in this file (CaCO₃ purity, real density, ISO whiteness, Mohs hardness) are typical commercial values for ground calcium carbonate, not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Grado industrial · caliza molida', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni proveedor.',
    sampleId: 'ML-SMP-00012',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp([1.20, 1.40], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL,
      method: 'ASTM C29 (referencia de método; no ejecutado sobre este lote)',
      note: 'Más ligero que la arena sílice: aligera levemente la mezcla.',
    }),
    specificGravity: dp([2.70, 2.75], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL + ' Densidad real de calcita industrial molida.',
      method: 'Densidad real (referencia de método; no ejecutado sobre este lote)',
    }),
    hardnessMohs: dp(3, 'reference', {
      source: 'Dureza de la calcita, escala de Mohs. Klein & Dutrow, Manual of Mineral Science.',
      note: 'Más blando que el cuarzo: se raya con facilidad.',
    }),
    waterAbsorption: dp(null, 'in-progress', { unit: '%', note: 'NOT YET MEASURED on this lot' }),
    oilAbsorption: dp([14, 22], 'reference', {
      unit: 'g / 100 g',
      source: TYPICAL,
      method: 'ASTM D281 (referencia de método; no ejecutado sobre este lote)',
      note: 'Define cuánta resina o aglutinante necesita para dispersarse.',
    }),
    porosity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    color: dp('Blanco a gris muy claro, opaco', 'observation', {
      sampleId: 'ML-SMP-00012',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Carga molida de calcita; presentación compacta en montículo', 'observation', {
      sampleId: 'ML-SMP-00012',
      date: '2026-08-27',
      method: 'Visual',
    }),
    grainRange: dp([3, 100], 'reference', {
      unit: 'µm D50',
      source: 'Rango comercial de grados grueso a micronizado según briefing interno FT-MP-021. No es D10–D90 de este lote.',
    }),
    whiteness: dp([92, 96], 'reference', {
      unit: 'ISO',
      source: TYPICAL,
      method: 'ISO 2470 (referencia de método; no ejecutado sobre este lote)',
      note: 'Sube el blanco de la mezcla sin diluir el pigmento de color.',
    }),
    phSaturated: dp([8.5, 9.5], 'reference', {
      source: TYPICAL + ' pH en suspensión.',
      method: 'Potenciómetro (referencia de método; no ejecutado sobre este lote)',
      note: 'Ligeramente alcalino: compatible con cemento, cal y yeso.',
    }),
    calcinationTemp: dp(825, 'reference', {
      unit: '°C',
      source: TYPICAL + ' Descomposición térmica a cal viva.',
      method: 'Termogravimetría (referencia de método; no ejecutado sobre este lote)',
    }),
  },
  chemical: [
    {
      compound: 'Carbonato de calcio',
      formula: 'CaCO₃',
      percent: dp([97.0, 99.5], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Carbonato de magnesio',
      formula: 'MgCO₃',
      percent: dp([0.2, 1.5], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de silicio',
      formula: 'SiO₂',
      percent: dp([0.1, 1.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de hierro',
      formula: 'Fe₂O₃',
      percent: dp([0, 0.1], 'reference', {
        unit: '%',
        source: TYPICAL,
        note: 'Por encima de 0.1 % el blanco pierde neutralidad y vira a crema.',
      }),
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
    surface: dp('Superficie mate, compactada; no brilla como la fractura del mármol', 'observation', {
      sampleId: 'ML-SMP-00012',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Agregados irregulares de carga molida; el grano individual es de micras', 'observation', {
      sampleId: 'ML-SMP-00012',
      date: '2026-08-27',
    }),
    edgeProfile: dp('Contorno redondeado en el montículo; no caras de fractura angulosas', 'observation', {
      sampleId: 'ML-SMP-00012',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'carbonato-de-calcio',
        alt: 'Referencia visual de carbonato de calcio: montículo blanco-gris sobre fondo blanco y detalle de textura granular',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Ocupa volumen sin reaccionar', effect: 'Rinde litros y baja el costo de la fórmula', direction: '↑' },
    { property: 'Blancura ISO 92–96', effect: 'Base neutra para blancos y colores claros', direction: '↑' },
    { property: 'Finura por D50', effect: 'Grueso da cuerpo; micronizado cierra poro y aclara', direction: '↑' },
    { property: 'No sustituye al cementante', effect: 'En exceso baja la resistencia mecánica', direction: '↓' },
    { property: 'Reactividad a ácidos', effect: 'Efervesce con HCl; no resiste medio ácido sostenido', direction: '↓' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el material se ve blanco a gris claro, compacto, con agregados mate. No hay ensayo de blancura ISO 2470, ni D50, ni absorción de aceite publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the material is off-white to light grey, compact, with a matte agglomerated look. No ISO 2470 whiteness, D50 or oil-absorption test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['marmolina-fina', 'cal', 'cemento-blanco', 'yeso', 'dolomita', 'caolin'],
  relatedResearch: ['caracterizacion-carbonato-de-calcio'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'carbonato-de-calcio.html',
  techMotion: true,
};
