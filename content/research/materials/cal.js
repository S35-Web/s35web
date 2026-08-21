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
    es: 'La cal hidratada no es un polvo inerte. Es caliza que se coció, se apagó con agua y espera volver a piedra. El ciclo es el de siempre: CaCO₃ a unos 900 °C suelta CO₂ y queda cal viva (CaO); el agua la convierte en hidróxido de calcio, el polvo blanco de esta ficha; en la obra, esa pasta reabsorbe CO₂ del aire y endurece por carbonatación, meses más que minutos. No es un fraguado hidráulico. Es un regreso lento a carbonato.\n\nLa referencia visual muestra un polvo blanco, muy fino, de presentación habitual en saco. El grano es pulverulento, sin la angularidad de una marmolina ni el redondeo de una arena. No se publica planta ni proveedor. La clase declarada es cal hidratada de alto calcio, familia NMX-C-003-ONNCCE / ASTM C207 — no cal viva, no NHL, no cal en pasta. En obra esos nombres se intercambian; en el archivo, no.\n\nLo que la cal aporta a un mortero o a un estuco es plasticidad y retención de agua. El hidróxido alcaliniza (pH de solución saturada típico 12.4) y da tiempo de trabajo que el cemento no da. A cambio, el endurecimiento depende del aire: no se le pide resistencia estructural ni durabilidad en saturación permanente. La cal hidráulica (NHL) es otro material; si el certificado no lo dice, no se asume.\n\nLos números de cabecera —calcinación ~900 °C, Ca(OH)₂ ≥90 %, pH 12.4, fraguado en meses— y la composición típica (90–96 % Ca(OH)₂, CaCO₃ <5 %, MgO <2 %) son perfiles de comercio y de norma, no un análisis de este saco. Donde el lote no se ensayó, se lee NOT YET MEASURED.\n\nMateriaLab publica el ciclo y la clase. No publica la dosificación con la que S-35 la incorpora a un recubrimiento.',
    en: 'Hydrated lime is cooked, slaked limestone waiting to become stone again. The visual reference is a fine white powder. Header figures and typical composition are commercial/normative profiles, not a lot assay. Unmeasured fields are NOT YET MEASURED.',
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
  relatedMaterials: ['marmolina-fina', 'cemento-gris'],
  relatedResearch: ['caracterizacion-cal'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
};
