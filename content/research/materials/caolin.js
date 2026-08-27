const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de caolín de grado industrial (caolinita), compilado en briefing interno S-35 FT-MP-025. Valores típicos de comercio/norma (ISO 3262, ISO 2470), no ensayo de este lote.';

module.exports = {
  code: 'ML-MIN-003',
  slug: 'caolin',
  slugEn: 'kaolin',
  name: { es: 'Caolín', en: 'Kaolin' },
  scientificName: 'Al₂Si₂O₅(OH)₄ · kaolinite',
  category: 'MIN',
  classLabel: { es: 'ARCILLA MINERAL', en: 'MINERAL CLAY' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de caolín. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Arcilla blanca de partícula plana, casi sin capacidad de hinchamiento. Donde la bentonita gestiona agua y sella, el caolín aporta blancura, carga fina y control de textura sin cambiar de volumen ni gelificar.\n\nLa caolinita también está hecha de láminas, pero de un solo par por capa —una de silicio y una de aluminio, arcilla 1:1— unidas por enlaces de hidrógeno fuertes que no dejan entrar agua entre ellas. Es la diferencia estructural clave frente a la bentonita, cuyas láminas 2:1 se separan al hidratarse. Por eso el caolín no gelifica ni sella: sus partículas planas se orientan al secar y dan una superficie lisa, uniforme y blanca.\n\nLos números de esta ficha (blancura ISO 78–90, dureza 2 Mohs, hinchamiento 0–5×, partícula 1–15 µm) son valores típicos de caolín comercial de grado industrial según ISO 3262 / ISO 2470, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'White clay with flat particles and almost no swelling. Where bentonite manages water and seals, kaolin brings whiteness, fine filler and texture control without changing volume or gelling.\n\nKaolinite is also made of sheets, but one silica and one alumina layer per unit — a 1:1 clay — locked by hydrogen bonds that keep water out. That is the structural difference from bentonite, whose 2:1 sheets open on hydration.\n\nFigures in this file (ISO whiteness, 2 Mohs, swell, particle size) are typical commercial values for industrial-grade kaolin (ISO 3262 / ISO 2470), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Grado industrial', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni proveedor.',
    sampleId: 'ML-SMP-00016',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp([0.35, 0.55], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL,
      method: 'Gravimetría (referencia de método; no ejecutado sobre este lote)',
    }),
    specificGravity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    hardnessMohs: dp(2, 'reference', {
      source: 'Dureza de la caolinita, escala de Mohs. Klein & Dutrow, Manual of Mineral Science.',
      note: 'Muy blanda: se raya con la uña.',
    }),
    waterAbsorption: dp([0, 5], 'reference', {
      unit: '× volumen seco',
      source: TYPICAL,
      note: 'Hinchamiento prácticamente nulo frente a la bentonita (15–20×).',
    }),
    oilAbsorption: dp([35, 55], 'reference', {
      unit: 'g / 100 g',
      source: TYPICAL,
      method: 'ASTM D281 (referencia de método; no ejecutado sobre este lote)',
      note: 'Alta demanda de aglutinante por forma laminar y finura.',
    }),
    porosity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    color: dp('Polvo blanco a crema, con aglomerados blandos', 'observation', {
      sampleId: 'ML-SMP-00016',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Arcilla laminar 1:1, caolinita; sin espacio interlaminar', 'observation', {
      sampleId: 'ML-SMP-00016',
      date: '2026-08-27',
      method: 'Visual',
    }),
    grainRange: dp([1, 15], 'reference', {
      unit: 'µm',
      source: 'Tamaño de partícula típico de caolín industrial según briefing interno FT-MP-025. No es D10–D90 de este lote.',
    }),
    whiteness: dp([78, 90], 'reference', {
      unit: 'ISO',
      source: TYPICAL,
      method: 'ISO 2470 (referencia de método; no ejecutado sobre este lote)',
      note: 'El hierro y el titanio, aunque bajos, limitan la blancura máxima.',
    }),
    phSaturated: dp([4.5, 7.0], 'reference', {
      source: TYPICAL + ' pH en suspensión.',
      method: 'Potenciómetro (referencia de método; no ejecutado sobre este lote)',
      note: 'Ligeramente ácido a neutro, a diferencia del pH alcalino de la bentonita.',
    }),
    supplyMoisture: dp([1, 2], 'reference', {
      unit: '% máximo',
      source: TYPICAL,
    }),
    cec: dp([3, 15], 'reference', {
      unit: 'meq / 100 g',
      source: TYPICAL,
      method: 'Acetato de amonio (referencia de método; no ejecutado sobre este lote)',
      note: 'Mucho menor que la bentonita (70–100 meq / 100 g).',
    }),
  },
  chemical: [
    {
      compound: 'Dióxido de silicio',
      formula: 'SiO₂',
      percent: dp([45.0, 48.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de aluminio',
      formula: 'Al₂O₃',
      percent: dp([36.0, 39.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de hierro',
      formula: 'Fe₂O₃',
      percent: dp([0, 1.0], 'reference', { unit: '%', source: TYPICAL, note: 'Típico < 1.0 %; limita la blancura máxima.' }),
    },
    {
      compound: 'Óxido de titanio',
      formula: 'TiO₂',
      percent: dp([0, 1.5], 'reference', { unit: '%', source: TYPICAL, note: 'Típico < 1.5 %; limita la blancura máxima.' }),
    },
    {
      compound: 'Pérdida por calcinación',
      formula: 'L.O.I.',
      percent: dp([12.0, 14.0], 'reference', { unit: '%', source: TYPICAL, note: 'Agua estructural que se va al calentar.' }),
    },
  ],
  morphology: {
    surface: dp('Polvo fino, suave al tacto, con aglomerados blandos y porosos', 'observation', {
      sampleId: 'ML-SMP-00016',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Partícula plana laminar (plaqueta de caolinita)', 'observation', {
      sampleId: 'ML-SMP-00016',
      date: '2026-08-27',
    }),
    edgeProfile: dp('Muy blanda; se raya con la uña', 'observation', {
      sampleId: 'ML-SMP-00016',
      date: '2026-08-27',
    }),
    voidStructure: dp('Sin espacio interlaminar; enlaces de hidrógeno fijos entre capas 1:1', 'reference', {
      source: TYPICAL,
    }),
  },
  images: {
    macro: [
      {
        id: 'caolin',
        alt: 'Referencia visual de caolín: montículo de polvo blanco a crema sobre fondo blanco y detalle de partículas y aglomerados blandos',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Arcilla 1:1, sin hinchamiento', effect: 'Carga y blancura sin gelificar ni sellar como la bentonita', direction: '↑' },
    { property: 'Blancura ISO 78–90', effect: 'Base para blancos puros; realza pigmentos sin diluirlos', direction: '↑' },
    { property: 'Partícula plana 1–15 µm', effect: 'Cobertura, opacidad y textura fina al orientarse al secar', direction: '↑' },
    { property: 'Absorción de aceite 35–55 g/100 g', effect: 'Pide más aglutinante por kilo que el carbonato de calcio', direction: '↓' },
    { property: 'pH 4.5–7.0', effect: 'Compatible con pigmentos; no es el medio alcalino de la bentonita', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el material es polvo blanco a crema, con aglomerados blandos e irregulares. No hay ensayo de blancura ISO 2470, hinchamiento, pH ni absorción de aceite publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the material is white-to-cream powder with soft, irregular agglomerates. No ISO 2470 whiteness, swell, pH or oil-absorption test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['bentonita-sodica', 'carbonato-de-calcio', 'marmolina-fina', 'cemento-blanco'],
  relatedResearch: ['caracterizacion-caolin'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'caolin.html',
  techMotion: true,
};
