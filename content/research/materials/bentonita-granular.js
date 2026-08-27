const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de bentonita granular (montmorillonita sódica compactada), compilado en briefing interno S-35 FT-MP-019. Valores típicos de comercio/norma (ASTM D5890), no ensayo de este lote.';

module.exports = {
  code: 'ML-MIN-002',
  slug: 'bentonita-granular',
  slugEn: 'granular-bentonite',
  name: { es: 'Bentonita granular', en: 'Granular bentonite' },
  scientificName: '(Na,Ca)₀.₃₃(Al,Mg)₂Si₄O₁₀(OH)₂·nH₂O',
  category: 'MIN',
  classLabel: { es: 'ARCILLA MINERAL', en: 'MINERAL CLAY' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de bentonita granular. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'La misma arcilla de la bentonita en polvo, pero prensada y cribada en gránulos. Cambia la forma de dosificar, no la química: se maneja sin polvo, se aplica a granel y se hidrata más despacio, capa por capa.\n\nEl gránulo es bentonita compactada a presión, triturada y cribada. Sigue siendo montmorillonita sódica capaz de multiplicar su volumen con agua. Un gránulo se hidrata de afuera hacia adentro: la capa externa se hincha primero y frena el paso del agua hacia el centro. Tarda más en desarrollar todo su gel que el polvo, pero no genera nube de partícula fina y se dosifica a granel sin apelmazarse.\n\nLos números de esta ficha (gránulo 2–6 mm, hinchamiento ≥24 ml / 2 g, densidad aparente 0.95–1.10 g/cm³, hidratación 2–6 h) son valores típicos de bentonita granular comercial según ASTM D5890, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'The same clay as powdered bentonite, pressed and screened into granules. The chemistry does not change: it is handled without dust, applied in bulk and hydrates more slowly, layer by layer.\n\nA granule hydrates from the outside in: the outer layer swells first and slows water reaching the core. Full gel takes longer than powder, but there is no cloud of fines.\n\nFigures in this file (granule size, swell index, bulk density, hydration time) are typical commercial values for granular bentonite (ASTM D5890), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Grado industrial · gránulo compactado', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni proveedor.',
    sampleId: 'ML-SMP-00011',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp([0.95, 1.10], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL,
      method: 'Gravimetría (referencia de método; no ejecutado sobre este lote)',
    }),
    specificGravity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    hardnessMohs: dp(null, 'in-progress', { note: 'NOT YET MEASURED — resistencia al aplastamiento media, observación' }),
    waterAbsorption: dp([15, 20], 'reference', {
      unit: '× volumen seco',
      source: TYPICAL,
      method: 'ASTM D5890 (referencia de método; no ejecutado sobre este lote)',
    }),
    porosity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    color: dp('Gránulo compacto beige a gris claro', 'observation', {
      sampleId: 'ML-SMP-00011',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Gránulo compactado de montmorillonita sódica, malla 8–30', 'observation', {
      sampleId: 'ML-SMP-00011',
      date: '2026-08-27',
      method: 'Visual',
    }),
    grainRange: dp([2, 6], 'reference', {
      unit: 'mm',
      source: 'Rango comercial de malla 8–30 según briefing interno FT-MP-019. No es D10–D90 de este lote.',
    }),
    swellIndex: dp(24, 'reference', {
      unit: 'ml / 2 g mínimo',
      source: TYPICAL,
      method: 'ASTM D5890 (referencia de método; no ejecutado sobre este lote)',
    }),
    hydrationTime: dp([2, 6], 'reference', {
      unit: 'h',
      source: TYPICAL + ' Tiempo típico para hinchamiento total del gránulo.',
    }),
    phSaturated: dp([8.5, 10.5], 'reference', {
      source: TYPICAL + ' Solución al 5 %.',
      method: 'Potenciómetro (referencia de método; no ejecutado sobre este lote)',
    }),
    supplyMoisture: dp([10, 12], 'reference', {
      unit: '% máximo',
      source: TYPICAL,
    }),
    cec: dp([70, 100], 'reference', {
      unit: 'meq / 100 g',
      source: TYPICAL,
      method: 'Acetato de amonio (referencia de método; no ejecutado sobre este lote)',
    }),
  },
  chemical: [
    {
      compound: 'Dióxido de silicio',
      formula: 'SiO₂',
      percent: dp([55.0, 65.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de aluminio',
      formula: 'Al₂O₃',
      percent: dp([18.0, 21.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de hierro',
      formula: 'Fe₂O₃',
      percent: dp([3.0, 5.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de sodio',
      formula: 'Na₂O',
      percent: dp([2.0, 3.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de magnesio',
      formula: 'MgO',
      percent: dp([1.5, 2.5], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Pérdida por calcinación',
      formula: 'L.O.I.',
      percent: dp([5.0, 8.0], 'reference', { unit: '%', source: TYPICAL }),
    },
  ],
  morphology: {
    surface: dp('Superficie rugosa, compactada, sin nube de finos al vaciar', 'observation', {
      sampleId: 'ML-SMP-00011',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Gránulo irregular, compactado, cribado', 'observation', {
      sampleId: 'ML-SMP-00011',
      date: '2026-08-27',
    }),
    edgeProfile: dp('Contorno redondeado a subangular; resiste caída libre en pozo', 'observation', {
      sampleId: 'ML-SMP-00011',
      date: '2026-08-27',
    }),
    voidStructure: dp('Hidratación de afuera hacia adentro; gel continuo al completar', 'reference', {
      source: TYPICAL,
    }),
  },
  images: {
    macro: [
      {
        id: 'bentonita-granular',
        alt: 'Referencia visual de bentonita granular: montículo de gránulos beige compactados sobre fondo blanco y detalle de textura',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Hidratación 2–6 h', effect: 'Se coloca antes de sellar; el gel se forma en sitio', direction: '↑' },
    { property: 'Sin polvo en el aire', effect: 'Se vacía como grava fina, no como talco', direction: '↑' },
    { property: 'Fluye a granel', effect: 'Banda, tolva o vaciado directo, sin mezclado especial', direction: '↑' },
    { property: 'No sustituye al polvo', effect: 'Para reología rápida (lodos, pastas) sigue haciendo falta el grado fino', direction: '↓' },
    { property: 'Sensible al calcio', effect: 'Agua dura o cemento reduce el hinchamiento final, igual que en polvo', direction: '↓' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia los gránulos son beige a gris claro, compactos e irregulares. No hay ensayo de hinchamiento ASTM D5890 ni de tiempo de hidratación publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the granules are beige to light grey, compact and irregular. No ASTM D5890 swell or hydration-time test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['bentonita-sodica', 'yeso', 'cemento-gris'],
  relatedResearch: ['caracterizacion-bentonita-granular'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'bentonita-granular.html',
  techMotion: true,
};
