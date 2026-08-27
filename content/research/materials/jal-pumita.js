const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de jal / pumita de grado construcción, compilado en briefing interno S-35 FT-MP-018. Valores típicos de comercio/norma (ASTM C332, ASTM C618 clase N), no ensayo de este lote.';

module.exports = {
  code: 'ML-AGG-004',
  slug: 'jal-pumita',
  slugEn: 'pumice-jal',
  name: { es: 'Jal · Pumita', en: 'Jal · Pumice' },
  scientificName: 'Vesicular volcanic glass (pumice)',
  category: 'AGG',
  classLabel: { es: 'AGREGADO LIGERO VOLCÁNICO', en: 'LIGHTWEIGHT VOLCANIC AGGREGATE' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-26',
  updatedAt: '2026-08-26',
  revisionHistory: [
    { rev: 1, date: '2026-08-26', change: 'Primera ficha pública: referencia visual y perfil típico de jal / pumita de grado construcción. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Espuma volcánica natural: lava que enfrió con gas adentro y quedó llena de burbujas. Es ligera, porosa y un poco puzolánica: aligera la mezcla y además aporta algo de resistencia con el tiempo.\n\nLa pumita se forma cuando lava rica en sílice y gas llega a superficie y se enfría de golpe. El gas no alcanza a escapar y queda atrapado: el resultado es un vidrio con tantas burbujas que la piedra flota en agua. Esa espuma explica la ligereza y el aislamiento. Como vidrio volcánico —sílice amorfa, no cristalina— reacciona despacio con la cal libre del cemento: es una puzolana natural.\n\nLos números de esta ficha (densidad aparente 500–900 kg/m³, conductividad 0.10–0.20 W/m·K, absorción 15–35 %, actividad puzolánica 75–90 % a 28 días) son valores típicos de jal comercial de grado construcción según ASTM C332 / C618 clase N, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Natural volcanic foam: lava that cooled with gas inside and stayed full of bubbles. It is light, porous and mildly pozzolanic: it lightens the mix and also contributes some strength over time.\n\nPumice forms when silica- and gas-rich lava reaches the surface and cools suddenly. The gas cannot escape and remains trapped. As amorphous volcanic glass it reacts slowly with free lime in cement: it is a natural pozzolan.\n\nFigures in this file (bulk density, thermal conductivity, absorption, pozzolanic activity) are typical commercial values for construction-grade jal/pumice (ASTM C332 / C618 class N), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Grado construcción', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni proveedor. En México se le llama jal, tepojal o pómez según la región.',
    sampleId: 'ML-SMP-00009',
    date: '2026-08-26',
  }),
  physical: {
    bulkDensity: dp([500, 900], 'reference', {
      unit: 'kg/m³',
      source: TYPICAL,
      method: 'ASTM C29 (referencia de método; no ejecutado sobre este lote)',
    }),
    specificGravity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    hardnessMohs: dp(6, 'reference', {
      source: TYPICAL + ' Dureza del vidrio vesicular; grano frágil.',
    }),
    waterAbsorption: dp([15, 35], 'reference', {
      unit: '%',
      source: TYPICAL,
      method: 'ASTM C128 (referencia de método; no ejecutado sobre este lote)',
    }),
    porosity: dp('≈85 % del grano es hueco de gas', 'reference', {
      source: TYPICAL,
    }),
    color: dp('Grano poroso beige, gris u ocre', 'observation', {
      sampleId: 'ML-SMP-00009',
      date: '2026-08-26',
      method: 'Referencia visual',
    }),
    structure: dp('Vidrio volcánico vesicular, triturado y cribado', 'observation', {
      sampleId: 'ML-SMP-00009',
      date: '2026-08-26',
      method: 'Visual',
    }),
    grainRange: dp([0.15, 5], 'reference', {
      unit: 'mm',
      source: 'Grado fino a medio comercial de jal de construcción según briefing interno FT-MP-018. No es D10–D90 de este lote.',
    }),
    thermalConductivity: dp([0.10, 0.20], 'reference', {
      unit: 'W/m·K',
      source: TYPICAL,
      method: 'ASTM C177 (referencia de método; no ejecutado sobre este lote)',
    }),
    pozzolanicActivity: dp([75, 90], 'reference', {
      unit: '% a 28 días',
      source: TYPICAL,
      method: 'ASTM C311 (referencia de método; no ejecutado sobre este lote)',
    }),
    phSaturated: dp([7.0, 8.5], 'reference', {
      source: TYPICAL,
      method: 'Potenciómetro (referencia de método; no ejecutado sobre este lote)',
    }),
    finesPassing200: dp(5, 'reference', {
      unit: '% máximo',
      source: TYPICAL,
      method: 'ASTM C117 (referencia de método; no ejecutado sobre este lote)',
    }),
  },
  chemical: [
    {
      compound: 'Dióxido de silicio',
      formula: 'SiO₂',
      percent: dp([60.0, 75.0], 'reference', { unit: '%', source: TYPICAL, note: 'Sílice amorfa: es lo que la hace puzolánica.' }),
    },
    {
      compound: 'Óxido de aluminio',
      formula: 'Al₂O₃',
      percent: dp([12.0, 18.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de hierro',
      formula: 'Fe₂O₃',
      percent: dp([1.0, 4.0], 'reference', { unit: '%', source: TYPICAL, note: 'El hierro explica los tonos beige, ocre y gris según el yacimiento.' }),
    },
    {
      compound: 'Óxidos alcalinos',
      formula: 'Na₂O + K₂O',
      percent: dp([4.0, 9.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Óxido de calcio',
      formula: 'CaO',
      percent: dp([0.5, 3.0], 'reference', { unit: '%', source: TYPICAL }),
    },
    {
      compound: 'Pérdida por calcinación',
      formula: 'L.O.I.',
      percent: dp([2.0, 6.0], 'reference', { unit: '%', source: TYPICAL }),
    },
  ],
  morphology: {
    surface: dp('Porosa, irregular, vesículas abiertas visibles a simple vista', 'observation', {
      sampleId: 'ML-SMP-00009',
      date: '2026-08-26',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Grano triturado, contorno irregular', 'observation', {
      sampleId: 'ML-SMP-00009',
      date: '2026-08-26',
    }),
    edgeProfile: dp('Paredes de vidrio, grano frágil al aplastamiento', 'observation', {
      sampleId: 'ML-SMP-00009',
      date: '2026-08-26',
    }),
    voidStructure: dp('Vesículas de gas volcánico; ≈85 % del grano es hueco', 'reference', {
      source: TYPICAL,
    }),
  },
  images: {
    macro: [
      {
        id: 'jal-pumita',
        alt: 'Referencia visual de jal / pumita: montículo de granos beige porosos sobre fondo blanco y detalle vesicular',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: '≈85 % hueco de gas', effect: 'Aligera con cuerpo: punto medio entre arena y perlita', direction: '↑' },
    { property: 'Puzolana natural', effect: 'Reacciona con la cal libre; gana resistencia después de 28 días', direction: '↑' },
    { property: 'Absorción 15–35 %', effect: 'Hay que prehumedecer o el mortero se seca antes de fraguar', direction: '↓' },
    { property: 'Grano frágil', effect: 'Soporta mezclado normal; las aspas agresivas lo pulverizan', direction: '↓' },
    { property: 'Color variable por yacimiento', effect: 'Tiñe la mezcla; no sirve para blancos puros sin corregir', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-26',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia los granos son beige a gris, porosos e irregulares, con partículas más oscuras aisladas. No hay ensayo de densidad aparente, absorción ni actividad puzolánica publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the grains are beige to grey, porous and irregular, with isolated darker particles. No bulk-density, absorption or pozzolanic-activity test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['perlita-expandida', 'cal', 'cemento-gris', 'vermiculita-expandida', 'metacaolin', 'ceniza-volante', 'barita', 'puzolana-volcanica', 'vidrio-expandido'],
  relatedResearch: ['caracterizacion-jal-pumita'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'jal-pumita.html',
  techMotion: true,
};
