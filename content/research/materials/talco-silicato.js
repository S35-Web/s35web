const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de talco (silicato de magnesio hidratado) de grado industrial, compilado en briefing interno S-35 FT-MP-036. Valores típicos de comercio/norma (ASTM D605, ISO 2470, ASTM D281), no ensayo de este lote. No se publica yacimiento.';

module.exports = {
  code: 'ML-MIN-006',
  slug: 'talco-silicato',
  slugEn: 'talc',
  name: { es: 'Talco silicato de magnesio', en: 'Magnesium silicate talc' },
  scientificName: 'Mg₃Si₄O₁₀(OH)₂ · talc',
  category: 'MIN',
  classLabel: { es: 'CARGA MINERAL LAMINAR', en: 'LAMELLAR MINERAL FILLER' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de talco. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Silicato de magnesio hidratado, Mg₃Si₄O₁₀(OH)₂. El mineral más blando conocido: su estructura en láminas se desliza sobre sí misma con una presión mínima. Molido fino, aporta tacto suave, ayuda a la trabajabilidad en pastas y controla el brillo y la sedimentación de recubrimientos, sin aportar resistencia mecánica.\n\nEs un filosilicato: láminas unidas por fuerzas débiles, dureza 1 en la escala de Mohs. Bajo cizalla las partículas planas se orientan y reducen la fricción interna de una pasta. El carbonato de calcio solo rellena; el caolín pide más agua; el talco lubrica. La mica, de la misma familia laminar, brilla y arma; el talco es mate, grasoso y blando.\n\nLos números de esta ficha (dureza Mohs 1, pureza 85–98 %, blancura ISO 80–95, partícula 2–20 µm) son valores típicos de talco comercial según ASTM D605, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Hydrated magnesium silicate, Mg₃Si₄O₁₀(OH)₂. The softest known mineral: its sheet structure slides on itself under almost no pressure. Ground fine, it gives a soft feel, helps paste workability and controls gloss and settling, without adding mechanical strength.\n\nIt is a phyllosilicate: weakly bound sheets, Mohs 1. Under shear the plates orient and cut internal friction. Calcium carbonate only fills; kaolin asks for more water; talc lubricates. Mica, of the same lamellar family, shines and reinforces; talc is matte, greasy and soft.\n\nFigures in this file (Mohs hardness, purity, ISO whiteness, particle size) are typical commercial values for talc (ASTM D605), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Silicato de magnesio hidratado, Mg₃Si₄O₁₀(OH)₂', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni marca.',
    sampleId: 'ML-SMP-00026',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { unit: 'g/cm³', note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp([2.7, 2.8], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL + ' Densidad real típica ASTM C188; no es densidad de este lote.',
      method: 'ASTM C188 (referencia de método; no ejecutado sobre este lote)',
    }),
    hardnessMohs: dp(1, 'reference', {
      source: TYPICAL + ' Dureza mínima de la escala de Mohs.',
    }),
    color: dp('Blanco brillante, polvo fino con láminas y grumos suaves', 'observation', {
      sampleId: 'ML-SMP-00026',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Filosilicato laminar; láminas que se deslizan entre sí', 'observation', {
      sampleId: 'ML-SMP-00026',
      date: '2026-08-27',
      method: 'Visual',
    }),
    grainRange: dp([2, 20], 'reference', {
      unit: 'µm',
      source: TYPICAL + ' Tamaño medio típico; no es D10–D90 de este lote.',
    }),
    whiteness: dp([80, 95], 'reference', {
      unit: '% ISO',
      source: TYPICAL,
      method: 'ISO 2470 (referencia de método; no ejecutado sobre este lote)',
    }),
    oilAbsorption: dp([30, 45], 'reference', {
      unit: 'g / 100 g',
      source: TYPICAL,
      method: 'ASTM D281 (referencia de método; no ejecutado sobre este lote)',
    }),
  },
  chemical: [
    {
      compound: 'Talco',
      formula: 'Mg₃Si₄O₁₀(OH)₂',
      percent: dp([85, 98], 'reference', {
        unit: '%',
        source: TYPICAL,
        note: 'El resto suele ser clorita, magnesita o dolomita.',
      }),
    },
  ],
  morphology: {
    surface: dp('Polvo blanco, fino, con láminas irregulares y grumos suaves', 'observation', {
      sampleId: 'ML-SMP-00026',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Láminas muy planas, de bordes irregulares', 'observation', {
      sampleId: 'ML-SMP-00026',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'talco-silicato',
        alt: 'Referencia visual de talco: montículo de polvo blanco sobre fondo blanco y detalle de láminas finas e irregulares',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Dureza Mohs 1', effect: 'El mineral más blando: tacto suave y fácil de lijar en pastas', direction: '↑' },
    { property: 'Morfología laminar', effect: 'Lubrica la pasta bajo cizalla; reduce fricción interna', direction: '↑' },
    { property: 'Superficie hidrófoba', effect: 'Baja afinidad al agua; útil en selladores y recubrimientos', direction: '↑' },
    { property: 'Distinto de mica y caolín', effect: 'Mate y grasoso; la mica brilla, el caolín pide más agua', direction: '→' },
    { property: 'Carga funcional, no cementante', effect: 'Dosis de 1–3 % ya cambian el tacto; no aporta resistencia', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el polvo es blanco brillante, fino, con láminas y grumos suaves. No hay ensayo de pureza ASTM D605, blancura ISO 2470 ni absorción de aceite ASTM D281 publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the powder is bright white, fine, with flakes and soft clumps. No ASTM D605 purity, ISO 2470 whiteness or ASTM D281 oil-absorption test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['mica', 'carbonato-de-calcio', 'caolin'],
  relatedResearch: ['caracterizacion-talco-silicato'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'talco-silicato.html',
  techMotion: true,
};
