const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de puzolana volcánica natural (ASTM C618 clase N), compilado en briefing interno S-35 FT-MP-037. Valores típicos de comercio/norma (ASTM C618, ASTM C311, NMX-C-414), no ensayo de este lote. No se publica yacimiento.';

module.exports = {
  code: 'ML-MIN-007',
  slug: 'puzolana-volcanica',
  slugEn: 'volcanic-pozzolan',
  name: { es: 'Puzolana volcánica', en: 'Volcanic pozzolan' },
  scientificName: 'Natural glassy volcanic ash / tuff (ASTM C618 Class N)',
  category: 'MIN',
  classLabel: { es: 'PUZOLANA NATURAL', en: 'NATURAL POZZOLAN' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de puzolana volcánica. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Ceniza y roca volcánica molida, de origen natural. Material piroclástico rico en sílice y alúmina vítreas, formado por el enfriamiento rápido de magma. México tiene depósitos extensos; molida a finura de cemento, reacciona con la cal libre igual que una puzolana artificial, sin proceso térmico.\n\nEl enfriamiento brusco de la erupción deja vidrio volcánico amorfo. Molido, ese vidrio consume la cal libre del Portland y la convierte en más C-S-H. La ceniza volante es un subproducto de termoeléctrica; el metacaolín se calcina a propósito; el jal es puzolánico y aligerante. Esta es la puzolana de yacimiento: solo molienda y clasificación, 15–35 % de sustitución, reactividad moderada.\n\nLos números de esta ficha (óxidos reactivos ≥70 %, actividad ≥75 % a 28 días, retenido malla 325 ≤34 %, densidad 2.4–2.7 g/cm³) son valores típicos de puzolana natural clase N según ASTM C618 / C311, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Ground volcanic ash and rock, of natural origin. A pyroclastic material rich in glassy silica and alumina, formed by rapid cooling of magma. Mexico has extensive deposits; ground to cement fineness it reacts with free lime like an artificial pozzolan, without thermal processing.\n\nThe eruption quench leaves amorphous volcanic glass. Ground, that glass consumes Portland free lime and turns it into more C-S-H. Fly ash is a power-plant by-product; metakaolin is calcined on purpose; jal is pozzolanic and lightweight. This is the quarry pozzolan: milling and classification only, 15–35 % replacement, moderate reactivity.\n\nFigures in this file (reactive oxides, pozzolanic activity, fineness, density) are typical commercial values for Class N natural pozzolan (ASTM C618 / C311), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Ceniza y roca volcánica molida, de origen natural', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni marca.',
    sampleId: 'ML-SMP-00027',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { unit: 'g/cm³', note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp([2.4, 2.7], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL + ' Densidad real típica ASTM C188; no es densidad de este lote.',
      method: 'ASTM C188 (referencia de método; no ejecutado sobre este lote)',
    }),
    color: dp('Gris carbón a pardo, gránulos porosos e irregulares', 'observation', {
      sampleId: 'ML-SMP-00027',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Vidrio volcánico vesicular molido; partículas angulares y porosas', 'observation', {
      sampleId: 'ML-SMP-00027',
      date: '2026-08-27',
      method: 'Visual',
    }),
    pozzolanicActivity: dp(75, 'reference', {
      unit: '% a 28 días mínimo',
      source: TYPICAL,
      method: 'ASTM C311 (referencia de método; no ejecutado sobre este lote)',
    }),
    cementReplacement: dp([15, 35], 'reference', {
      unit: '%',
      source: TYPICAL + ' Sustitución típica de cemento en puzolana natural clase N.',
    }),
  },
  chemical: [
    {
      compound: 'Óxidos reactivos',
      formula: 'SiO₂ + Al₂O₃ + Fe₂O₃',
      percent: dp(70, 'reference', {
        unit: '% mínimo clase N',
        source: TYPICAL,
        note: 'Umbral ASTM C618 para puzolana natural.',
      }),
    },
  ],
  morphology: {
    surface: dp('Gránulos gris oscuro a pardo, rugosos y vesiculares, con polvo fino', 'observation', {
      sampleId: 'ML-SMP-00027',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Fragmentos irregulares de escoria volcánica porosa', 'observation', {
      sampleId: 'ML-SMP-00027',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'puzolana-volcanica',
        alt: 'Referencia visual de puzolana volcánica: montículo de gránulos gris oscuro sobre fondo blanco y detalle de partículas vesiculares y porosas',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Puzolana natural, clase N', effect: 'Reacciona con la cal libre del Portland sin proceso térmico', direction: '↑' },
    { property: '15–35 % de sustitución', effect: 'Baja clínker y calor de hidratación en concreto masivo', direction: '↑' },
    { property: 'Solo molienda', effect: 'El vidrio ya viene de la erupción; no depende de una industria externa', direction: '↑' },
    { property: 'Distinta de ceniza y metacaolín', effect: 'Yacimiento natural; reactividad moderada, consistencia por depósito', direction: '→' },
    { property: 'Cada yacimiento es distinto', effect: 'Verificar el lote; no asumir igual al anterior', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el material es gris carbón a pardo, granular y vesicular. No hay ensayo de óxidos ASTM C618, actividad C311 ni finura de malla 325 publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the material is charcoal-grey to brown, granular and vesicular. No ASTM C618 oxide, C311 activity or No. 325 fineness test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['ceniza-volante', 'metacaolin', 'jal-pumita', 'cemento-gris'],
  relatedResearch: ['caracterizacion-puzolana-volcanica'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'puzolana-volcanica.html',
  techMotion: true,
};
