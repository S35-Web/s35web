const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de óxido de hierro rojo (hematita, PR101) de grado construcción, compilado en briefing interno S-35 FT-MP-043. Valores típicos de comercio/norma (ASTM C979, EN 12878), no ensayo de este lote. No se publica planta.';

module.exports = {
  code: 'ML-PIG-002',
  slug: 'oxido-de-hierro-rojo',
  slugEn: 'red-iron-oxide',
  name: { es: 'Óxido de hierro rojo', en: 'Red iron oxide' },
  scientificName: 'Fe₂O₃ · hematite (synthetic or micronised natural)',
  category: 'PIG',
  classLabel: { es: 'PIGMENTO INORGÁNICO', en: 'INORGANIC PIGMENT' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-28',
  updatedAt: '2026-08-28',
  revisionHistory: [
    { rev: 1, date: '2026-08-28', change: 'Primera ficha pública: referencia visual y perfil típico de óxido de hierro rojo. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Fe₂O₃, hematita sintética o natural micronizada. El pigmento inorgánico más estable y usado en construcción para dar color permanente a morteros y concretos. A diferencia de un colorante orgánico, no se degrada por UV ni se disuelve en el agua de la mezcla: es color mineral, tan durable como el material que pigmenta.\n\nEl dióxido de titanio dispersa luz y da blanco; este óxido absorbe azul y verde y refleja rojo. El enlace metal-oxígeno no se rompe con el sol ni con el pH ~13 del cemento fresco. El amarillo de la misma familia (goetita) se deshidrata a rojo sobre ~150 °C; el negro (magnetita) puede oxidarse. El rojo anhidro es el de intemperie. Dosis típica ≤5 % sobre el cementante: más no intensifica el tono a la par y empieza a pesarle a la resistencia.\n\nLos números de esta ficha (Fe₂O₃ ≥95 %, partícula 0.1–1 µm, insoluble, álcali-resistente) son valores típicos de pigmento comercial según ASTM C979 / EN 12878, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Fe₂O₃, synthetic or micronised natural hematite. The most stable inorganic pigment used in construction to give permanent colour to mortars and concretes. Unlike an organic dye it does not degrade under UV or dissolve in mix water: it is mineral colour, as durable as the material it pigments.\n\nTitanium dioxide scatters light and makes white; this oxide absorbs blue and green and reflects red. The metal–oxygen bond does not break in sun or in the pH ~13 of fresh cement. Yellow in the same family (goethite) dehydrates to red above ~150 °C; black (magnetite) can oxidise. Anhydrous red is the weathering grade. Typical dose ≤5 % on binder: more does not intensify tone in proportion and starts to weigh on strength.\n\nFigures in this file (Fe₂O₃, particle size, insolubility, alkali resistance) are typical commercial values for pigment (ASTM C979 / EN 12878), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Síntesis controlada (Penniman/Laux) o mineral natural micronizado', 'observation', {
    note: 'Clase comercial. No se publica planta ni marca. Familia PR101 / CI 77491.',
    sampleId: 'ML-SMP-00034',
    date: '2026-08-28',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    grainRange: dp([0.1, 1], 'reference', {
      unit: 'µm',
      source: TYPICAL + ' Tamaño típico de pigmento ASTM C979. No es D10–D90 de este lote.',
    }),
    color: dp('Rojo óxido a terracota, polvo fino con microgrumos mates', 'observation', {
      sampleId: 'ML-SMP-00034',
      date: '2026-08-28',
      method: 'Referencia visual',
    }),
    structure: dp('Hematita anhidra, Fe₂O₃, polvo micronizado', 'observation', {
      sampleId: 'ML-SMP-00034',
      date: '2026-08-28',
      method: 'Visual',
    }),
  },
  chemical: [
    {
      compound: 'Óxido férrico',
      formula: 'Fe₂O₃',
      percent: dp(95, 'reference', {
        unit: '% mínimo',
        source: TYPICAL,
        note: 'A mayor pureza, tono más intenso y consistente entre lotes.',
      }),
    },
  ],
  morphology: {
    surface: dp('Polvo rojo óxido, fino, mate, con nódulos irregulares suaves', 'observation', {
      sampleId: 'ML-SMP-00034',
      date: '2026-08-28',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Partícula 0.1–1 µm; los grumos visibles son agregados, no el cristal individual', 'observation', {
      sampleId: 'ML-SMP-00034',
      date: '2026-08-28',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'oxido-de-hierro-rojo',
        alt: 'Referencia visual de óxido de hierro rojo: montículo de polvo rojo óxido sobre fondo blanco y detalle de textura granulada',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Enlace Fe–O de hematita', effect: 'Color permanente a UV e intemperie; no es un tinte orgánico', direction: '↑' },
    { property: 'Estable a pH ~13', effect: 'No se decolora en cemento fresco ni curado', direction: '↑' },
    { property: 'Insoluble en agua', effect: 'No migra ni se lava con la humedad de servicio', direction: '↑' },
    { property: 'Dosis ≤5 % sobre cementante', effect: 'Más no intensifica el tono a la par; premezclar en seco con el cementante', direction: '→' },
    { property: 'Familia rojo–amarillo–negro', effect: 'Con goetita y magnetita se arma toda la gama tierra', direction: '↑' },
  ],
  labNotes: [
    {
      date: '2026-08-28',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el polvo es rojo óxido a terracota, fino, mate, con microgrumos. No hay ensayo de Fe₂O₃ ni de estabilidad alcalina ASTM C979 publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the powder is oxide-red to terracotta, fine, matte, with micro-clumps. No ASTM C979 Fe₂O₃ or alkali-stability test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['dioxido-de-titanio', 'cemento-gris', 'cemento-blanco'],
  relatedResearch: ['caracterizacion-oxido-de-hierro-rojo'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'oxido-de-hierro-rojo.html',
  techMotion: true,
};
