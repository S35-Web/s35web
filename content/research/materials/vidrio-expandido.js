const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de vidrio expandido (granulado celular de vidrio reciclado) de grado construcción, compilado en briefing interno S-35 FT-MP-039. Valores típicos de comercio/norma (EN 13055, ASTM C330, EN 1097-3, EN 1097-6, EN 12667, EN 13501-1), no ensayo de este lote. No se publica planta.';

module.exports = {
  code: 'ML-AGG-007',
  slug: 'vidrio-expandido',
  slugEn: 'expanded-glass',
  name: { es: 'Vidrio expandido', en: 'Expanded glass' },
  scientificName: 'Expanded recycled-glass granulate (closed-cell cellular glass)',
  category: 'AGG',
  classLabel: { es: 'AGREGADO LIGERO', en: 'LIGHTWEIGHT AGGREGATE' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de vidrio expandido. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Granulado celular de vidrio reciclado, espumado térmicamente. Vidrio post-consumo molido, mezclado con un agente espumante y expandido a temperatura de reblandecimiento: cada gránulo queda con una espuma de celdas cerradas de vidrio, rígida y muy ligera. Un agregado ligero de origen reciclado, sin proceso de minería.\n\nLa perlita también es vidrio expandido, pero volcánico y de celda abierta: se bebe el agua de amasado. Aquí la celda es cerrada e impermeable, así que absorbe mucho menos y se dosifica más parecida a un agregado convencional. El jal es pumita natural, vesicular y un poco puzolánica. El vidrio molido es el mismo residuo sin inflar: denso, angular, con densidad de arena. Este oficio es aligerar y aislar a partir de un envase, no de un yacimiento.\n\nLos números de esta ficha (densidad aparente 0.15–0.4 g/cm³, conductividad 0.07–0.09 W/m·K, absorción ≤20 % en volumen, clase A1) son valores típicos de granulado comercial según EN 13055 / ASTM C330, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Cellular granulate of recycled glass, thermally foamed. Post-consumer glass is ground, mixed with a mineral foaming agent and expanded at softening temperature: each granule keeps a rigid foam of closed glass cells. A lightweight aggregate from waste, without mining.\n\nPerlite is also expanded glass, but volcanic and open-celled: it drinks mix water. Here the cell is closed and impermeable, so absorption is much lower and batching is closer to a conventional aggregate. Pumice is natural vesicular glass, mildly pozzolanic. Ground glass is the same feedstock unfoamed: dense, angular, sand-like density. This trade is to lighten and insulate from a bottle, not from a quarry.\n\nFigures in this file (bulk density, conductivity, absorption, fire class) are typical commercial values for expanded-glass granulate (EN 13055 / ASTM C330), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Vidrio reciclado post-consumo, molido y espumado térmicamente', 'observation', {
    note: 'Clase comercial. No se publica planta ni marca.',
    sampleId: 'ML-SMP-00030',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp([0.15, 0.4], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL + ' Densidad aparente típica EN 1097-3; no es densidad de este lote.',
      method: 'EN 1097-3 (referencia de método; no ejecutado sobre este lote)',
    }),
    specificGravity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    waterAbsorption: dp(20, 'reference', {
      unit: '% en volumen, 24 h, máx.',
      source: TYPICAL,
      method: 'EN 1097-6 (referencia de método; no ejecutado sobre este lote)',
    }),
    porosity: dp('Celdas cerradas, predominantemente impermeables', 'reference', {
      source: TYPICAL,
    }),
    color: dp('Gris claro a translúcido, gránulos redondeados vesiculares', 'observation', {
      sampleId: 'ML-SMP-00030',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Gránulo celular de vidrio espumado, celda cerrada', 'observation', {
      sampleId: 'ML-SMP-00030',
      date: '2026-08-27',
      method: 'Visual',
    }),
    thermalConductivity: dp([0.07, 0.09], 'reference', {
      unit: 'W/m·K',
      source: TYPICAL,
      method: 'EN 12667 (referencia de método; no ejecutado sobre este lote)',
    }),
    fireReaction: dp('Clase A1', 'reference', {
      source: TYPICAL + ' Reacción al fuego EN 13501-1.',
      method: 'EN 13501-1 (referencia de método; no ejecutado sobre este lote)',
    }),
  },
  chemical: [
    {
      compound: 'Vidrio reciclado',
      percent: dp(100, 'reference', {
        unit: '%',
        source: TYPICAL,
        note: 'Contenido declarado de vidrio post-consumo. Composición de sosa-cal típica; no es análisis de este lote.',
      }),
    },
  ],
  morphology: {
    surface: dp('Gránulos gris claro, subredondeados, con brillo vítreo y poros visibles', 'observation', {
      sampleId: 'ML-SMP-00030',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Gránulo expandido, contorno irregular a subredondeado', 'observation', {
      sampleId: 'ML-SMP-00030',
      date: '2026-08-27',
    }),
    voidStructure: dp('Espuma de celdas cerradas de vidrio; el mezclado agresivo puede fracturar el grano', 'reference', {
      source: TYPICAL,
    }),
  },
  images: {
    macro: [
      {
        id: 'vidrio-expandido',
        alt: 'Referencia visual de vidrio expandido: montículo de gránulos grises translúcidos sobre fondo blanco y detalle de textura vesicular',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Celda cerrada', effect: 'Absorbe mucho menos agua que perlita o vermiculita; menos ajuste de amasado', direction: '↑' },
    { property: 'Densidad aparente 0.15–0.4 g/cm³', effect: 'Aligera morteros y rellenos sin minería de mineral virgen', direction: '↑' },
    { property: 'Conductividad 0.07–0.09 W/m·K', effect: 'Aísla en rellenos de piso, cubierta y morteros ligeros', direction: '↑' },
    { property: '100 % vidrio reciclado', effect: 'Mismo residuo que el vidrio molido, inflado en lugar de triturado', direction: '↑' },
    { property: 'Grano de espuma', effect: 'El mezclado agresivo fractura el gránulo y pierde parte del aire', direction: '↓' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia los gránulos son gris claro a translúcidos, subredondeados, con poros visibles. No hay ensayo de densidad EN 1097-3, absorción EN 1097-6 ni conductividad EN 12667 publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the granules are light grey to translucent, subrounded, with visible pores. No EN 1097-3 density, EN 1097-6 absorption or EN 12667 conductivity test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['perlita-expandida', 'vermiculita-expandida', 'jal-pumita', 'vidrio-molido'],
  relatedResearch: ['caracterizacion-vidrio-expandido'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'vidrio-expandido.html',
  techMotion: true,
};
