const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de microsílice (humo de sílice) de grado construcción, compilado en briefing interno S-35 FT-MP-038. Valores típicos de comercio/norma (ASTM C1240, EN 13263, ASTM C188), no ensayo de este lote. No se publica planta.';

module.exports = {
  code: 'ML-MIN-008',
  slug: 'microsilice',
  slugEn: 'silica-fume',
  name: { es: 'Microsílice / humo de sílice', en: 'Silica fume' },
  scientificName: 'Amorphous SiO₂ microspheres (silica fume, ASTM C1240)',
  category: 'MIN',
  classLabel: { es: 'PUZOLANA ULTRAFINA', en: 'ULTRAFINE POZZOLAN' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de microsílice. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Humo de sílice: SiO₂ amorfo ultrafino. Subproducto de la producción de silicio y ferrosilicio: partículas esféricas de sílice amorfa, unas 100 veces más finas que el cemento. Reacciona rápido con la cal libre y, sobre todo, rellena los espacios entre granos de cemento que ningún otro material alcanza, densificando la pasta.\n\nAl reducir cuarzo en horno de arco, parte del SiO se volatiliza y condensa como esferas de ~0.15 µm. El efecto es doble: químico (más C-S-H) y físico (relleno de huecos). El metacaolín es fino y rápido; la ceniza es de volumen; la escoria es cementante latente. La microsílice es la puzolana de escala: 5–10 % de sustitución, área BET ~20 000 m²/kg, siempre con superplastificante.\n\nLos números de esta ficha (SiO₂ ≥85 %, partícula ~0.15 µm, actividad ≥105 % a 7 días, densidad 2.20–2.25 g/cm³) son valores típicos de microsílice comercial según ASTM C1240, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Silica fume: ultrafine amorphous SiO₂. A by-product of silicon and ferrosilicon production: glassy silica spheres about 100 times finer than cement. It reacts quickly with free lime and, above all, fills the gaps between cement grains that no other material can reach, densifying the paste.\n\nWhen quartz is reduced in an arc furnace, some SiO volatilises and condenses as ~0.15 µm spheres. The effect is both chemical (more C-S-H) and physical (void filling). Metakaolin is fine and fast; fly ash is volume; slag is latent hydraulic. Silica fume is the scale pozzolan: 5–10 % replacement, BET area ~20 000 m²/kg, always with a superplasticiser.\n\nFigures in this file (SiO₂, particle size, activity, density) are typical commercial values for silica fume (ASTM C1240), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Silica fume · SiO₂ amorfo ultrafino', 'observation', {
    note: 'Clase comercial. No se publica planta ni marca.',
    sampleId: 'ML-SMP-00028',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { unit: 'g/cm³', note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp([2.20, 2.25], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL + ' Densidad real típica ASTM C188; no es densidad de este lote.',
      method: 'ASTM C188 (referencia de método; no ejecutado sobre este lote)',
    }),
    color: dp('Gris carbón mate, polvo ultrafino con microgrumos', 'observation', {
      sampleId: 'ML-SMP-00028',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Esferas de sílice amorfa ultrafinas, ~0.15 µm', 'observation', {
      sampleId: 'ML-SMP-00028',
      date: '2026-08-27',
      method: 'Visual',
    }),
    grainRange: dp(0.15, 'reference', {
      unit: 'µm típico',
      source: TYPICAL + ' Tamaño medio típico; no es D50 de este lote.',
    }),
    pozzolanicActivity: dp(105, 'reference', {
      unit: '% a 7 días mínimo',
      source: TYPICAL,
      method: 'ASTM C1240 (referencia de método; no ejecutado sobre este lote)',
    }),
    cementReplacement: dp([5, 10], 'reference', {
      unit: '%',
      source: TYPICAL + ' Sustitución típica; la dosis óptima suele estar entre 5 y 8 %.',
    }),
    specificSurface: dp(20000, 'reference', {
      unit: 'm²/kg BET',
      source: TYPICAL + ' Área superficial típica 15 000–25 000 m²/kg.',
      method: 'ASTM C1240 (referencia de método; no ejecutado sobre este lote)',
    }),
  },
  chemical: [
    {
      compound: 'Sílice amorfa',
      formula: 'SiO₂',
      percent: dp(85, 'reference', {
        unit: '% mínimo',
        source: TYPICAL,
        note: 'Por debajo de ese umbral la reactividad puzolánica no cumple norma.',
      }),
    },
  ],
  morphology: {
    surface: dp('Polvo gris carbón, ultrafino, con racimos de microgrumos mate', 'observation', {
      sampleId: 'ML-SMP-00028',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Esferas vítreas de ~0.15 µm, aglomeradas en racimos', 'observation', {
      sampleId: 'ML-SMP-00028',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'microsilice',
        alt: 'Referencia visual de microsílice: montículo de polvo gris carbón sobre fondo blanco y detalle de microgrumos ultrafinos',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Partícula ~0.15 µm', effect: 'Rellena huecos entre granos de cemento que ninguna otra SCM alcanza', direction: '↑' },
    { property: '5–10 % de sustitución', effect: 'Poco es suficiente: densifica y sube resistencia', direction: '↑' },
    { property: 'Área BET ~20 000 m²/kg', effect: 'Pide superplastificante; sin él la mezcla se vuelve inmanejable', direction: '→' },
    { property: 'Distinta de ceniza, metacaolín y escoria', effect: 'Escala única de relleno físico; las otras aportan volumen o velocidad', direction: '→' },
    { property: 'Curado húmedo temprano', effect: 'Consume agua rápido: el curado inmediato evita fisuración plástica', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el polvo es gris carbón, ultrafino, con microgrumos. No hay ensayo de SiO₂ ASTM C1240, BET ni actividad puzolánica a 7 días publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the powder is charcoal grey, ultrafine, with micro-clumps. No ASTM C1240 SiO₂, BET or 7-day pozzolanic-activity test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['ceniza-volante', 'metacaolin', 'escoria-granulada-de-alto-horno', 'diatomita', 'cemento-gris'],
  relatedResearch: ['caracterizacion-microsilice'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'microsilice.html',
  techMotion: true,
};
