const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de cal hidratada de alto calcio, grado comercial, compilado en briefing interno S-35 FT-MP-018. Valores típicos de comercio/norma, no ensayo de este lote.';

module.exports = {
  code: 'ML-BND-001',
  slug: 'cal',
  slugEn: 'lime',
  name: { es: 'Cal', en: 'Hydrated lime' },
  scientificName: 'Ca(OH)₂',
  category: 'BND',
  classLabel: { es: 'CAL HIDRATADA · CEMENTANTE AÉREO', en: 'HYDRATED LIME · AERIAL BINDER' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-19',
  updatedAt: '2026-08-19',
  revisionHistory: [
    { rev: 1, date: '2026-08-19', change: 'Primera ficha pública: referencia visual y perfil típico de cal hidratada. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Hidróxido de calcio · cal común hidratada. Caliza cocida y apagada con agua. No endurece por hidratación como el cemento: fragua lentamente tomando CO₂ del aire hasta volver a ser piedra caliza. Aporta plasticidad, retención de agua y permeabilidad al vapor.',
    en: 'Calcium hydroxide · common hydrated lime. Cooked limestone slaked with water. It does not harden by hydration like cement: it sets slowly by taking CO₂ from the air until it is limestone again.',
  },
  origin: dp('México', 'observation', {
    note: 'Clase comercial. No se publica planta ni proveedor.',
    sampleId: 'ML-SMP-00003',
    date: '2026-08-11',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { unit: 'g/cm³', note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp(2.24, 'reference', {
      source: 'Densidad de portlandita, Ca(OH)₂. Klein & Dutrow, Manual of Mineral Science. No es densidad aparente de este lote.',
    }),
    hardnessMohs: dp([2, 3], 'reference', {
      source: 'Dureza de la portlandita. Klein & Dutrow, Manual of Mineral Science.',
    }),
    waterAbsorption: dp(null, 'in-progress', { unit: '%', note: 'NOT YET MEASURED' }),
    color: dp('Blanco', 'observation', {
      sampleId: 'ML-SMP-00003',
      date: '2026-08-11',
      method: 'Referencia visual',
    }),
    structure: dp('Polvo fino hidratado, no calcinado en esta presentación', 'observation', {
      sampleId: 'ML-SMP-00003',
      date: '2026-08-11',
      method: 'Visual',
    }),
    calcinationTemp: dp(900, 'reference', {
      unit: '°C',
      source: TYPICAL + ' Temperatura típica de calcinación de caliza para cal viva; no es un ensayo de este lote.',
    }),
    phSaturated: dp(12.4, 'reference', {
      source: TYPICAL + ' pH típico de solución saturada de Ca(OH)₂.',
    }),
  },
  chemical: [
    { compound: 'Hidróxido de calcio', formula: 'Ca(OH)₂', percent: dp([90, 96], 'reference', { unit: '%', source: TYPICAL }) },
    { compound: 'Carbonato de calcio residual', formula: 'CaCO₃', percent: dp([0, 5], 'reference', { unit: '%', source: TYPICAL, note: 'Límite típico superior.' }) },
    { compound: 'Óxido de magnesio', formula: 'MgO', percent: dp([0, 2], 'reference', { unit: '%', source: TYPICAL, note: 'Límite típico superior.' }) },
    { compound: 'Insolubles (SiO₂, Al₂O₃, Fe₂O₃)', percent: dp([0, 2], 'reference', { unit: '%', source: TYPICAL, note: 'Límite típico superior.' }) },
  ],
  morphology: {
    surface: dp('Polvo pulverulento, grano no resuelto a lupa de campo', 'observation', {
      sampleId: 'ML-SMP-00003',
      date: '2026-08-11',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Partículas muy finas, sin forma de agregado', 'observation', {
      sampleId: 'ML-SMP-00003',
      date: '2026-08-11',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [{ id: 'cal', alt: 'Referencia visual de cal hidratada: montículo blanco sobre fondo blanco y detalle de polvo', width: 1536, height: 1024 }],
  },
  whyItMatters: [
    { property: 'Fraguado por carbonatación', effect: 'Endurece en meses, no en minutos; pide aire, no saturación permanente', direction: '→' },
    { property: 'Plasticidad de la pasta', effect: 'Retiene agua y da tiempo de trabajo al mortero y al estuco', direction: '↑' },
    { property: 'pH alcalino', effect: 'Alcaliniza la mezcla; cáustico en fresco', direction: '↑' },
    { property: 'No es cal viva ni NHL', effect: 'Hay que leer el certificado; los nombres se intercambian en obra y no son el mismo material', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-11',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. No hay ensayo de pureza Ca(OH)₂, ni pH, ni finura Blaine publicado. La clase se declara como cal hidratada por presentación; no se distingue aquí de una NHL sin certificado.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. No Ca(OH)₂ purity, pH or Blaine test is published.',
      },
    },
  ],
  relatedMaterials: ['marmolina-fina', 'cemento-gris', 'cemento-aluminato-de-calcio', 'perlita-expandida', 'jal-pumita', 'vermiculita-expandida', 'ceniza-volante'],
  relatedResearch: ['caracterizacion-cal'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'cal.html',
  techMotion: true,
};
