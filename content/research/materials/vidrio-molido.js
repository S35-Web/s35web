const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de vidrio molido (agregado de vidrio reciclado, GGA) de grado construcción, compilado en briefing interno S-35 FT-MP-040. Valores típicos de comercio/norma (ASTM C1866, ASTM C1260, ASTM C128), no ensayo de este lote. No se publica planta.';

module.exports = {
  code: 'ML-AGG-008',
  slug: 'vidrio-molido',
  slugEn: 'ground-glass',
  name: { es: 'Vidrio molido', en: 'Ground glass' },
  scientificName: 'Crushed post-consumer soda-lime glass (ground glass aggregate, GGA)',
  category: 'AGG',
  classLabel: { es: 'AGREGADO RECICLADO', en: 'RECYCLED AGGREGATE' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de vidrio molido. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Vidrio reciclado triturado y clasificado por tamaño. Vidrio post-consumo molido a granulometría de arena, sin proceso de expansión ni fusión. Conserva la densidad del vidrio sólido y su superficie angular y afilada; su sílice amorfa puede volverse reactiva bajo álcalis, lo que exige control de formulación —y, molida fina, puede trabajar como puzolana.\n\nA diferencia del vidrio expandido, aquí no hay horno: botella, ventana o plano se trituran y se tamizan como cualquier agregado. La densidad (2.4–2.6 g/cm³) es la de la arena de sílice; la geometría no: es fractura, no rodado de río. La arena de cuarzo es sílice cristalina; este vidrio es amorfo. Esa diferencia abre dos oficios: agregado visible (terrazo, color) y, por debajo de 75 µm, material cementante suplementario. El ensayo ASTM C1260 decide si el lote entra en concreto estructural.\n\nLos números de esta ficha (densidad relativa 2.4–2.6 g/cm³, absorción ≤1 %, expansión RAS ≤0.10 % a 16 días) son valores típicos de GGA comercial según ASTM C1866 / C1260, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Recycled glass crushed and sized. Post-consumer glass ground to a sand grading, without expansion or remelting. It keeps the density of solid glass and a sharp angular surface; its amorphous silica can react under alkalis, which requires mix control — and, when ground fine, can work as a pozzolan.\n\nUnlike expanded glass there is no kiln: bottle, window or flat glass is crushed and sieved like any aggregate. Density (2.4–2.6 g/cm³) matches silica sand; geometry does not: it is fracture, not river rounding. Quartz sand is crystalline silica; this glass is amorphous. That difference opens two trades: visible aggregate (terrazzo, colour) and, below 75 µm, a supplementary cementitious material. ASTM C1260 decides whether a lot belongs in structural concrete.\n\nFigures in this file (relative density, absorption, ASR expansion) are typical commercial values for GGA (ASTM C1866 / C1260), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Vidrio reciclado post-consumo, triturado y tamizado', 'observation', {
    note: 'Clase comercial. No se publica planta ni marca.',
    sampleId: 'ML-SMP-00031',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp([2.4, 2.6], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL + ' Densidad relativa típica de vidrio sosa-cal sólido; no es densidad de este lote.',
      method: 'ASTM C128 (referencia de método; no ejecutado sobre este lote)',
    }),
    waterAbsorption: dp(1, 'reference', {
      unit: '% máx.',
      source: TYPICAL,
      method: 'ASTM C128 (referencia de método; no ejecutado sobre este lote)',
    }),
    color: dp('Fragmentos angulares translúcidos: claro, verde y ámbar mezclados', 'observation', {
      sampleId: 'ML-SMP-00031',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Vidrio sólido triturado, bordes de fractura afilados', 'observation', {
      sampleId: 'ML-SMP-00031',
      date: '2026-08-27',
      method: 'Visual',
    }),
    grainRange: dp('Malla 4 a malla 200, según grado', 'reference', {
      source: TYPICAL + ' Rango comercial ASTM C1866. No es curva de este lote.',
    }),
    asrExpansion: dp(0.1, 'reference', {
      unit: '% a 16 días, umbral típico',
      source: TYPICAL,
      method: 'ASTM C1260 (referencia de método; no ejecutado sobre este lote)',
      note: 'Umbral de aptitud sin mitigación adicional. Cada lote se ensaya por separado.',
    }),
  },
  chemical: [
    {
      compound: 'Vidrio reciclado',
      percent: dp(100, 'reference', {
        unit: '%',
        source: TYPICAL,
        note: 'Contenido declarado de vidrio post-consumo. Contaminantes cerámica/metal ≤1–5 % según grado ASTM C1866.',
      }),
    },
  ],
  morphology: {
    surface: dp('Fragmentos vítreos angulares, translúcidos, de color mixto', 'observation', {
      sampleId: 'ML-SMP-00031',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Partícula angular de fractura, no redondeada', 'observation', {
      sampleId: 'ML-SMP-00031',
      date: '2026-08-27',
    }),
    edgeProfile: dp('Bordes afilados; manejo manual pide guante resistente al corte', 'observation', {
      sampleId: 'ML-SMP-00031',
      date: '2026-08-27',
    }),
  },
  images: {
    macro: [
      {
        id: 'vidrio-molido',
        alt: 'Referencia visual de vidrio molido: montículo de fragmentos angulares claros, verdes y ámbar sobre fondo blanco y detalle de textura',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Densidad 2.4–2.6 g/cm³', effect: 'Sustituye arena en peso; el vidrio expandido, en cambio, aligera', direction: '→' },
    { property: 'Sílice amorfa', effect: 'Molida fina (<75 µm) puede trabajar como puzolana; gruesa pide ensayo RAS', direction: '↑' },
    { property: 'Partícula angular', effect: 'Traba y brilla en terrazo; corta más que un grano de río', direction: '↑' },
    { property: 'Absorción ≤1 %', effect: 'Casi no roba agua de amasado, como un silíceo convencional', direction: '↑' },
    { property: 'ASTM C1260 por lote', effect: 'Ninguna fuente de vidrio se asume apta en concreto estructural sin ensayo', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia los fragmentos son angulares, translúcidos, con mezcla de claro, verde y ámbar. No hay ensayo de densidad ASTM C128, RAS ASTM C1260 ni contaminantes ASTM C1866 publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the fragments are angular and translucent, mixed clear, green and amber. No ASTM C128 density, ASTM C1260 ASR or ASTM C1866 contaminant test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['vidrio-expandido', 'arena-de-cuarzo', 'arena-silicea-graduada', 'cemento-gris', 'microsilice'],
  relatedResearch: ['caracterizacion-vidrio-molido'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'vidrio-molido.html',
  techMotion: true,
};
