const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de cemento Portland blanco CPB 30, grado comercial, compilado en briefing interno S-35 FT-MP-017. Valores típicos de clase/norma, no ensayo de este lote. No se publica planta.';

module.exports = {
  code: 'ML-BND-004',
  slug: 'cemento-blanco',
  slugEn: 'white-cement',
  name: { es: 'Cemento blanco', en: 'White Portland cement' },
  scientificName: 'White Portland cement (low-iron clinker + calcium sulfate)',
  category: 'BND',
  classLabel: { es: 'CEMENTO HIDRÁULICO BLANCO · CPB 30', en: 'WHITE HYDRAULIC CEMENT · CPB 30' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-19',
  updatedAt: '2026-08-19',
  revisionHistory: [
    { rev: 1, date: '2026-08-19', change: 'Primera ficha pública: referencia visual y perfil típico de cemento blanco CPB 30. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'El cemento blanco no es un cemento distinto: es Portland con el hierro casi fuera. Se fabrica con caliza pura y caolín, se cuece más alto (~1 500 °C) y se enfría de modo que el hierro no oxide. El resultado es una base estable para pigmento y para acabados claros. Hidrata igual que el gris: gel C-S-H, reacción irreversible.\n\nLa referencia visual muestra un polvo blanco, ligeramente crema a simple vista. No se publica planta. La clase se declara CPB 30, familia NMX-C-414 / ASTM C150. El índice de blancura típico de comercio (≥85 % de reflectancia) no es una medición de este saco.\n\nLa química lo dice en una línea: Fe₂O₃ típico 0.15–0.50 %. Cada décima se ve; por encima de ~0.5 % el polvo toma tono crema. Manganeso y cromo tiñen aunque estén en trazas. La ferrita (C₄AF) queda casi ausente (0.5–2 %), frente al 5–15 % del gris. A cambio, suele molerse más fino (Blaine típico 3 800–5 000 cm²/g): más blancura aparente y un poco más de demanda de agua.\n\nResistencia de clase (≥30 MPa a 28 d), relación a/c 0.45–0.60 y pH 12.5–13.5 son los mismos órdenes que el cemento gris. El blanco no es más débil por ser blanco; es más caro de producir y más sensible al hierro. Este lote no tiene reflectometría, ni Blaine, ni resistencia medida.\n\nLaboratorio explica por qué es blanco. No explica la pigmentación de un producto S-35.',
    en: 'White Portland cement is grey Portland with iron almost removed. The visual reference is a white, slightly cream powder, class CPB 30. Whiteness and oxide ranges are commercial/class profiles, not a lot assay.',
  },
  origin: dp('México', 'observation', {
    note: 'Clase comercial CPB 30. No se publica planta ni marca.',
    sampleId: 'ML-SMP-00006',
    date: '2026-08-11',
  }),
  physical: {
    bulkDensity: dp([1.0, 1.3], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL + ' Densidad aparente típica; no medida en este lote.',
    }),
    specificGravity: dp([3.1, 3.15], 'reference', {
      source: TYPICAL + ' Densidad real típica ASTM C188; no ejecutada sobre este lote.',
      method: 'ASTM C188 (referencia de método)',
    }),
    color: dp('Blanco, ligeramente crema', 'observation', {
      sampleId: 'ML-SMP-00006',
      date: '2026-08-11',
      method: 'Referencia visual',
    }),
    structure: dp('Polvo hidráulico fino', 'observation', {
      sampleId: 'ML-SMP-00006',
      date: '2026-08-11',
      method: 'Visual',
    }),
    kilnTemp: dp(1500, 'reference', {
      unit: '°C',
      source: TYPICAL + ' Temperatura típica de horno para clínker blanco.',
    }),
    strengthClass: dp(30, 'reference', {
      unit: 'MPa a 28 d (clase)',
      source: TYPICAL + ' Clase CPB 30 según NMX-C-414. No es resistencia medida de este saco.',
      method: 'NMX-C-414',
    }),
    waterCementRatio: dp([0.45, 0.6], 'reference', {
      source: TYPICAL + ' Relación a/c de trabajo habitual, no una dosificación S-35.',
    }),
    whiteness: dp([85, 90], 'reference', {
      unit: '% reflectancia',
      source: TYPICAL + ' Índice de blancura comercial típico; ASTM C1783 no ejecutado aquí.',
      method: 'ASTM C1783 (referencia de método)',
    }),
  },
  chemical: [
    { compound: 'Óxido de calcio', formula: 'CaO', percent: dp([63, 69], 'reference', { unit: '%', source: TYPICAL }) },
    { compound: 'Dióxido de silicio', formula: 'SiO₂', percent: dp([21, 24], 'reference', { unit: '%', source: TYPICAL }) },
    { compound: 'Óxido de aluminio', formula: 'Al₂O₃', percent: dp([4, 6], 'reference', { unit: '%', source: TYPICAL }) },
    { compound: 'Óxido de hierro', formula: 'Fe₂O₃', percent: dp([0.15, 0.5], 'reference', { unit: '%', source: TYPICAL, note: 'Por encima de ~0.5 % el polvo toma tono crema.' }) },
    { compound: 'Trióxido de azufre', formula: 'SO₃', percent: dp([2, 4], 'reference', { unit: '%', source: TYPICAL }) },
  ],
  morphology: {
    surface: dp('Polvo fino blanco; grano no resuelto a lupa de campo', 'observation', {
      sampleId: 'ML-SMP-00006',
      date: '2026-08-11',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Partículas de molienda, sin forma de agregado', 'observation', {
      sampleId: 'ML-SMP-00006',
      date: '2026-08-11',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [{ id: 'cemento-blanco', alt: 'Referencia visual de cemento blanco: montículo blanco sobre fondo blanco y detalle de polvo', width: 1536, height: 1024 }],
  },
  whyItMatters: [
    { property: 'Fe₂O₃ muy bajo', effect: 'Permite color claro y pigmentación fiel; cada décima de hierro se ve', direction: '↑' },
    { property: 'Misma hidratación que el gris', effect: 'No es un cementante más débil por ser blanco; es más caro de producir', direction: '→' },
    { property: 'Molienda más fina (típica)', effect: 'Más blancura aparente y algo más de demanda de agua', direction: '↑' },
    { property: 'pH cáustico', effect: 'Quema la piel y decolora pigmentos no estables, igual que el gris', direction: '↓' },
  ],
  labNotes: [
    {
      date: '2026-08-11',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. No hay reflectometría, ni Blaine, ni resistencia publicados. El tono ligeramente crema se declara por la referencia visual, no por índice de blancura medido.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. No reflectometry, Blaine or strength test is published.',
      },
    },
  ],
  relatedMaterials: ['cemento-gris', 'cemento-aluminato-de-calcio', 'marmolina-fina', 'caolin', 'metacaolin'],
  relatedResearch: ['caracterizacion-cemento-blanco'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'cemento-blanco.html',
  techMotion: true,
};
