const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de diatomita (tierra de diatomeas) de grado industrial, compilado en briefing interno S-35 FT-MP-034. Valores típicos de comercio/norma (ASTM D604, ASTM C837, ASTM D281), no ensayo de este lote. No se publica yacimiento.';

module.exports = {
  code: 'ML-FIL-005',
  slug: 'diatomita',
  slugEn: 'diatomite',
  name: { es: 'Diatomita', en: 'Diatomite' },
  scientificName: 'Amorphous biogenic SiO₂ (diatom frustules)',
  category: 'FIL',
  classLabel: { es: 'CARGA SILÍCEA POROSA', en: 'POROUS SILICEOUS FILLER' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de diatomita. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Tierra de diatomeas: sílice amorfa de origen fósil. Roca sedimentaria formada por los esqueletos silíceos de diatomeas. Cada partícula conserva su estructura porosa original, con una capacidad de absorción y una densidad aparente muy por encima de una sílice molida convencional.\n\nLas diatomeas construyen su pared con sílice disuelta; al morir, esas frústulas se acumulan y forman una roca ligera. Molida, no es sílice compacta: es un esqueleto microscópico hueco. Esa porosidad interna —distinta de la perlita, que se expande con calor— retiene aceite, agua o resina y ocupa volumen con muy poco peso. La microsílice densifica; la diatomita absorbe y aligera.\n\nLos números de esta ficha (SiO₂ amorfo ≥88 %, densidad aparente 0.11–0.3 g/cm³, absorción de aceite 150–200 %) son valores típicos de diatomita comercial según ASTM D604 / D281, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Diatomaceous earth: fossil amorphous silica. Sedimentary rock of diatom skeletons. Each particle keeps its original porous structure, with absorption and bulk density far beyond ground compact silica.\n\nDiatoms build a siliceous wall; those frustules accumulate as a light rock. Ground, it is a hollow microscopic skeleton, not compact silica. That internal porosity — unlike thermally expanded perlite — holds oil, water or resin and occupies volume at very low weight. Microsilica densifies; diatomite absorbs and lightens.\n\nFigures in this file (amorphous silica, bulk density, oil absorption) are typical commercial values for diatomite (ASTM D604 / D281), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Tierra de diatomeas, SiO₂ amorfo de origen fósil', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni marca.',
    sampleId: 'ML-SMP-00024',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp([0.11, 0.3], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL + ' Densidad aparente típica ASTM C29; no es densidad de este lote.',
      method: 'ASTM C29 (referencia de método; no ejecutado sobre este lote)',
    }),
    specificGravity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    color: dp('Beige claro a crema, polvo fino con microgrumos suaves', 'observation', {
      sampleId: 'ML-SMP-00024',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Frústulas silíceas porosas: discos y tubos microscópicos', 'observation', {
      sampleId: 'ML-SMP-00024',
      date: '2026-08-27',
      method: 'Visual',
    }),
    oilAbsorption: dp([150, 200], 'reference', {
      unit: 'g / 100 g',
      source: TYPICAL,
      method: 'ASTM D281 (referencia de método; no ejecutado sobre este lote)',
    }),
  },
  chemical: [
    {
      compound: 'Sílice amorfa',
      formula: 'SiO₂',
      percent: dp(88, 'reference', {
        unit: '% mínimo',
        source: TYPICAL,
        note: 'A mayor pureza, menor sílice cristalina residual del proceso de calcinación.',
      }),
    },
  ],
  morphology: {
    surface: dp('Polvo beige claro, fino, con grumos suaves y aspecto ligero', 'observation', {
      sampleId: 'ML-SMP-00024',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Esqueletos de diatomea: discos alveolados y fragmentos tubulares', 'observation', {
      sampleId: 'ML-SMP-00024',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'diatomita',
        alt: 'Referencia visual de diatomita: montículo de polvo beige claro sobre fondo blanco y detalle de frústulas porosas de diatomea',
        width: 1535,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Frústula porosa fósil', effect: 'Absorbe líquidos en el interior de la partícula, no solo en superficie', direction: '↑' },
    { property: 'Densidad aparente 0.11–0.3 g/cm³', effect: 'Aligera formulaciones sin burbujas de aire artificiales', direction: '↑' },
    { property: 'Absorción de aceite 150–200 %', effect: 'Matifica recubrimientos y porta aditivos líquidos en polvo', direction: '↑' },
    { property: 'Distinta de perlita y microsílice', effect: 'Porosidad biológica frente a expansión térmica o densificación', direction: '→' },
    { property: 'Carga funcional, no cementante', effect: 'Absorción y aligeramiento; dosis altas bajan densidad y resistencia', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el polvo es beige claro a crema, fino, con microgrumos suaves. No hay ensayo de SiO₂ amorfo ASTM D604, absorción de aceite ASTM D281 ni densidad ASTM C29 publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the powder is pale beige to cream, fine, with soft micro-clumps. No ASTM D604 amorphous-silica, ASTM D281 oil-absorption or ASTM C29 density test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['perlita-expandida', 'microsilice', 'vermiculita-expandida'],
  relatedResearch: ['caracterizacion-diatomita'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'diatomita.html',
  techMotion: true,
};
