const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de vermiculita expandida de grado construcción, compilado en briefing interno S-35 FT-MP-024. Valores típicos de comercio/norma (ASTM C516, ASTM C332), no ensayo de este lote.';

module.exports = {
  code: 'ML-AGG-006',
  slug: 'vermiculita-expandida',
  slugEn: 'expanded-vermiculite',
  name: { es: 'Vermiculita expandida', en: 'Expanded vermiculite' },
  scientificName: 'Exfoliated hydrated Mg–Fe–Al phyllosilicate',
  category: 'AGG',
  classLabel: { es: 'AGREGADO LIGERO', en: 'LIGHTWEIGHT AGGREGATE' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de vermiculita expandida de grado construcción. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Mica que al calentarse se abre como acordeón en lugar de reventar como burbuja. Queda un gránulo dorado en escamas, blando y ligero: aísla, aligera y se comprime sin romperse, con menos sed de agua que la perlita.\n\nLa vermiculita cruda es un filosilicato hidratado de magnesio, hierro y aluminio, con agua atrapada entre láminas. Al pasar por el horno (800–1 100 °C) esa agua se vaporiza de golpe y empuja las capas hacia afuera: el mineral crece hasta doce veces su espesor y conserva una estructura laminar flexible. Esa forma de acordeón la distingue de la perlita —celdas de vidrio que revientan— y del jal —vesículas volcánicas naturales—.\n\nLos números de esta ficha (densidad aparente 60–130 kg/m³, conductividad 0.045–0.07 W/m·K, absorción 100–150 % en peso) son valores típicos de vermiculita comercial de grado construcción según ASTM C516 / ASTM C332, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Mica that opens like an accordion when heated instead of popping like a bubble. What remains is a golden, flaky granule: it insulates, lightens and compresses without breaking, with less water thirst than perlite.\n\nCrude vermiculite is a hydrated Mg–Fe–Al phyllosilicate with water trapped between sheets. In the kiln (800–1 100 °C) that water flashes to steam and pushes the layers apart: the mineral grows up to twelve times its thickness and keeps a flexible laminar structure. That accordion form is what sets it apart from perlite (burst glass cells) and jal (natural volcanic vesicles).\n\nFigures in this file (bulk density, thermal conductivity, water absorption) are typical commercial values for construction-grade expanded vermiculite (ASTM C516 / ASTM C332), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Grado construcción', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni proveedor.',
    sampleId: 'ML-SMP-00015',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp([60, 130], 'reference', {
      unit: 'kg/m³',
      source: TYPICAL,
      method: 'ASTM C29 (referencia de método; no ejecutado sobre este lote)',
    }),
    specificGravity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    hardnessMohs: dp(null, 'in-progress', { note: 'NOT YET MEASURED — grano blando, se comprime y no se rompe' }),
    waterAbsorption: dp([100, 150], 'reference', {
      unit: '% en peso',
      source: TYPICAL,
      method: 'ASTM C837 (referencia de método; no ejecutado sobre este lote)',
    }),
    porosity: dp('Láminas abiertas tipo acordeón; porosidad más cerrada que la perlita', 'reference', {
      source: TYPICAL,
    }),
    color: dp('Escamas doradas a bronce, foliadas', 'observation', {
      sampleId: 'ML-SMP-00015',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Gránulo exfoliado en escamas, laminar, liviano', 'observation', {
      sampleId: 'ML-SMP-00015',
      date: '2026-08-27',
      method: 'Visual',
    }),
    grainRange: dp([0.3, 4.0], 'reference', {
      unit: 'mm',
      source: 'Grado fino a medio comercial de vermiculita expandida de construcción según briefing interno FT-MP-024. No es D10–D90 de este lote.',
    }),
    thermalConductivity: dp([0.045, 0.07], 'reference', {
      unit: 'W/m·K',
      source: TYPICAL,
      method: 'ASTM C177 (referencia de método; no ejecutado sobre este lote)',
    }),
    serviceTemp: dp(1100, 'reference', {
      unit: '°C',
      source: TYPICAL + ' Estabilidad térmica de servicio continuo; EN 13501-1 como referencia de reacción al fuego.',
    }),
    phSaturated: dp([7.0, 9.5], 'reference', {
      source: TYPICAL,
      method: 'Potenciómetro (referencia de método; no ejecutado sobre este lote)',
    }),
    expansionRatio: dp([8, 12], 'reference', {
      unit: '×',
      source: TYPICAL + ' Expansión respecto al espesor de la mica cruda.',
    }),
  },
  chemical: [
    {
      compound: 'Dióxido de silicio',
      formula: 'SiO₂',
      percent: dp([36.0, 42.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de magnesio',
      formula: 'MgO',
      percent: dp([18.0, 26.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de aluminio',
      formula: 'Al₂O₃',
      percent: dp([10.0, 16.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de hierro',
      formula: 'Fe₂O₃',
      percent: dp([6.0, 12.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Agua combinada (mineral crudo)',
      percent: dp([8.0, 12.0], 'reference', { unit: '%', source: TYPICAL, note: 'Agua interlaminar del mineral crudo, no del grano exfoliado.' }),
    },
  ],
  morphology: {
    surface: dp('Escamas foliadas con brillo micáceo; capas paralelas visibles a simple vista', 'observation', {
      sampleId: 'ML-SMP-00015',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Gránulo exfoliado, contorno irregular en escamas', 'observation', {
      sampleId: 'ML-SMP-00015',
      date: '2026-08-27',
    }),
    edgeProfile: dp('Láminas flexibles; se comprime, no se rompe', 'observation', {
      sampleId: 'ML-SMP-00015',
      date: '2026-08-27',
    }),
    voidStructure: dp('Capas abiertas tipo acordeón; proceso irreversible', 'reference', {
      source: TYPICAL,
    }),
  },
  images: {
    macro: [
      {
        id: 'vermiculita-expandida',
        alt: 'Referencia visual de vermiculita expandida: montículo de gránulos beige a dorado sobre fondo blanco y detalle de escamas foliadas tipo acordeón',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Láminas en acordeón', effect: 'Aísla y se comprime en vez de pulverizarse como la perlita', direction: '↑' },
    { property: 'Conductividad 0.045–0.07 W/m·K', effect: 'Aísla casi como la perlita, con más cuerpo laminar', direction: '↑' },
    { property: 'Absorción 100–150 % en peso', effect: 'Menos corrección de agua de amasado que la perlita', direction: '↑' },
    { property: 'Hasta ≈1 100 °C', effect: 'Primera opción en protección pasiva contra fuego', direction: '↑' },
    { property: 'Tono dorado a bronce', effect: 'Se nota en acabados claros; no es un aligerante neutro', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia los gránulos son escamas beige a dorado, foliadas, con brillo micáceo. No hay ensayo de densidad aparente, conductividad ni absorción publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the granules are beige-to-gold foliated flakes with a micaceous sheen. No bulk-density, conductivity or absorption test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['perlita-expandida', 'jal-pumita', 'yeso', 'cal', 'diatomita', 'vidrio-expandido'],
  relatedResearch: ['caracterizacion-vermiculita-expandida'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'vermiculita-expandida.html',
  techMotion: true,
};
