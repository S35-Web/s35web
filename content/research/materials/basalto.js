const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de basalto triturado de grado construcción, compilado en briefing interno S-35 FT-MP-042. Valores típicos de comercio/norma (ASTM C33, ASTM C127, ASTM C131, ASTM D7012, ASTM E303), no ensayo de este lote. No se publica banco.';

module.exports = {
  code: 'ML-AGG-009',
  slug: 'basalto',
  slugEn: 'basalt',
  name: { es: 'Basalto', en: 'Basalt' },
  scientificName: 'Mafic extrusive igneous rock (fine-grained Fe-Mg silicates)',
  category: 'AGG',
  classLabel: { es: 'AGREGADO VOLCÁNICO DENSO', en: 'DENSE VOLCANIC AGGREGATE' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-28',
  updatedAt: '2026-08-28',
  revisionHistory: [
    { rev: 1, date: '2026-08-28', change: 'Primera ficha pública: referencia visual y perfil típico de basalto triturado. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Roca ígnea volcánica de composición máfica. Roca extrusiva formada por el enfriamiento rápido de lava rica en hierro y magnesio. A diferencia de la perlita o la pumicita, no es vesicular ni ligera: es densa, dura y prácticamente inerte, y se usa como agregado de alta resistencia y masa donde la piedra caliza o el granito no bastan.\n\nEl jal es la misma familia volcánica del otro lado: espuma de gas, 500–900 kg/m³, un poco puzolánica. El basalto se enfrió sin esas burbujas: grano fino, densidad 2.8–3.0, Mohs ~6. La barita es más densa todavía, pero es lastre, no traba. La arena de río es redonda y aluvial; el basalto triturado es angular y rugoso, y por eso engancha en asfalto y en pisos de alto desgaste.\n\nLos números de esta ficha (densidad 2.8–3.0 g/cm³, absorción 0.5–1.5 %, Los Ángeles ≤18 %, compresión de roca 1 500–3 000 kg/cm²) son valores típicos de basalto comercial según ASTM C33 / C131, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Mafic volcanic igneous rock. Extrusive rock from the rapid cooling of iron- and magnesium-rich lava. Unlike perlite or pumice it is not vesicular or light: it is dense, hard and practically inert, used as a high-strength, high-mass aggregate where limestone or granite are not enough.\n\nPumice is the same volcanic family on the other side: gas foam, 500–900 kg/m³, mildly pozzolanic. Basalt cooled without those bubbles: fine grain, density 2.8–3.0, Mohs ~6. Barite is denser still, but it is ballast, not interlock. River sand is round and alluvial; crushed basalt is angular and rough, which is why it grips in asphalt and high-wear floors.\n\nFigures in this file (density, absorption, Los Angeles abrasion, rock compressive strength) are typical commercial values for basalt (ASTM C33 / C131), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Banco de roca volcánica, triturado y clasificado por malla', 'observation', {
    note: 'Clase comercial. No se publica banco ni marca.',
    sampleId: 'ML-SMP-00033',
    date: '2026-08-28',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp([2.8, 3.0], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL + ' Densidad relativa típica ASTM C127; no es densidad de este lote.',
      method: 'ASTM C127 (referencia de método; no ejecutado sobre este lote)',
    }),
    hardnessMohs: dp(6, 'reference', {
      source: TYPICAL + ' Dureza aproximada del basalto; no es ensayo de este lote.',
    }),
    waterAbsorption: dp([0.5, 1.5], 'reference', {
      unit: '%',
      source: TYPICAL,
      method: 'ASTM C127 (referencia de método; no ejecutado sobre este lote)',
    }),
    color: dp('Gris carbón a negro, gránulos angulares mate', 'observation', {
      sampleId: 'ML-SMP-00033',
      date: '2026-08-28',
      method: 'Referencia visual',
    }),
    structure: dp('Roca de grano fino, partículas angulares de fractura', 'observation', {
      sampleId: 'ML-SMP-00033',
      date: '2026-08-28',
      method: 'Visual',
    }),
    abrasionLosAngeles: dp(18, 'reference', {
      unit: '% pérdida, máx.',
      source: TYPICAL,
      method: 'ASTM C131 (referencia de método; no ejecutado sobre este lote)',
    }),
    compressiveStrength: dp([1500, 3000], 'reference', {
      unit: 'kg/cm² (roca)',
      source: TYPICAL,
      method: 'ASTM D7012 (referencia de método; no ejecutado sobre este lote)',
    }),
  },
  chemical: [
    {
      compound: 'Silicatos de hierro y magnesio',
      percent: dp('Roca máfica, prácticamente inerte', 'reference', {
        source: TYPICAL,
        note: 'No es análisis de óxidos de este lote. El oficio es densidad y traba, no reactividad.',
      }),
    },
  ],
  morphology: {
    surface: dp('Gránulos angulares gris oscuro a negro, superficie mate y rugosa', 'observation', {
      sampleId: 'ML-SMP-00033',
      date: '2026-08-28',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Partícula angular de trituración, sin caras planas de clivaje', 'observation', {
      sampleId: 'ML-SMP-00033',
      date: '2026-08-28',
    }),
    edgeProfile: dp('Bordes angulosos; manejo manual pide guante', 'observation', {
      sampleId: 'ML-SMP-00033',
      date: '2026-08-28',
    }),
  },
  images: {
    macro: [
      {
        id: 'basalto',
        alt: 'Referencia visual de basalto: montículo de gránulos angulares gris oscuro a negro sobre fondo blanco y detalle de textura',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Enfriamiento rápido, grano fino', effect: 'Roca homogénea, sin planos de debilidad: resiste compresión y desgaste', direction: '↑' },
    { property: 'Partícula angular', effect: 'Traba mecánica y adherencia al cementante; pide un poco más de pasta', direction: '↑' },
    { property: 'Los Ángeles ≤18 %', effect: 'Capas de rodadura y pisos de alto tránsito; muy por debajo del límite 40 %', direction: '↑' },
    { property: 'Absorción 0.5–1.5 %', effect: 'Poca agua extra que ajustar, a diferencia del jal vesicular', direction: '↑' },
    { property: 'Tono gris-negro', effect: 'Se transmite al concreto expuesto; no es el agregado de un acabado claro', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-28',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia los gránulos son gris carbón a negro, angulares, de superficie mate. No hay ensayo de densidad ASTM C127, abrasión ASTM C131 ni compresión ASTM D7012 publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the granules are charcoal-grey to black, angular, matte. No ASTM C127 density, ASTM C131 abrasion or ASTM D7012 compression test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['arena-de-rio', 'barita', 'jal-pumita', 'cemento-gris', 'puzolana-volcanica'],
  relatedResearch: ['caracterizacion-basalto'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'basalto.html',
  techMotion: true,
};
