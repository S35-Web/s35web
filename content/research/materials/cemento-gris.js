const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de cemento Portland compuesto CPC 30R, grado comercial, compilado en briefing interno S-35 FT-MP-016. Valores típicos de clase/norma (NMX-C-414 / ASTM C150), no ensayo de este lote. No se publica planta.';

module.exports = {
  code: 'ML-BND-003',
  slug: 'cemento-gris',
  slugEn: 'grey-cement',
  name: { es: 'Cemento gris', en: 'Grey Portland cement' },
  scientificName: 'Portland cement (clinker + calcium sulfate)',
  category: 'BND',
  classLabel: { es: 'CEMENTO HIDRÁULICO · CPC 30R', en: 'HYDRAULIC CEMENT · CPC 30R' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-19',
  updatedAt: '2026-08-19',
  revisionHistory: [
    { rev: 1, date: '2026-08-19', change: 'Primera ficha pública: referencia visual y perfil típico de cemento gris CPC 30R. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'El cemento gris no seca: cristaliza. Es un polvo mineral cocido a unos 1 450 °C —clínker de caliza y arcilla, molido con yeso— que, al mezclarse con agua, forma un gel de silicato de calcio hidratado (C-S-H). Esa red de fibras trabas los granos y no se deshace: la reacción es irreversible. El cemento fraguado no vuelve a polvo.\n\nLa referencia visual muestra un polvo gris, fino, de tono que en comercio va de verdoso a oscuro según el hierro. No se publica planta ni marca. La clase se declara como Portland compuesto CPC 30R, familia NMX-C-414 / ASTM C150. El 30R es una clase de resistencia, no el resultado de un cubo colado con este saco.\n\nLas fases del clínker explican el comportamiento mejor que el color. Alita (C₃S) da resistencia temprana; belita (C₂S), la tardía; aluminato (C₃A), fraguado y calor; ferrita (C₄AF), el gris. El yeso molido regula el fraguado. El hierro define el tono: a mayor Fe₂O₃, más oscuro y verdoso. El cemento blanco es el mismo oficio con el hierro casi eliminado, no un material distinto de familia.\n\nLos números de cabecera —horno 1 450 °C, ≥30 MPa a 28 días como clase, relación a/c de trabajo 0.45–0.60, pH de pasta ~12.5— y los rangos de óxidos (CaO 60–67 %, SiO₂ 17–25 %, Fe₂O₃ 0.5–6 %) son perfiles de clase y de literatura. Este lote no tiene Blaine, ni C191, ni resistencia medida. NOT YET MEASURED donde corresponde.\n\nLaboratorio caracteriza el cementante. No publica la dosificación de ningún concreto ni recubrimiento S-35.',
    en: 'Grey Portland cement crystallises; it does not dry. The visual reference is a fine grey powder, class CPC 30R. Header figures and oxide ranges are class/literature profiles, not a lot assay. Plant and brand are not published.',
  },
  origin: dp('México', 'observation', {
    note: 'Clase comercial CPC 30R. No se publica planta ni marca.',
    sampleId: 'ML-SMP-00005',
    date: '2026-08-11',
  }),
  physical: {
    bulkDensity: dp([1.0, 1.3], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL + ' Densidad aparente típica de cemento en polvo; no medida en este lote.',
    }),
    specificGravity: dp([3.1, 3.15], 'reference', {
      source: TYPICAL + ' Densidad real típica ASTM C188; no ejecutada sobre este lote.',
      method: 'ASTM C188 (referencia de método)',
    }),
    color: dp('Gris medio a gris verdoso', 'observation', {
      sampleId: 'ML-SMP-00005',
      date: '2026-08-11',
      method: 'Referencia visual',
    }),
    structure: dp('Polvo hidráulico fino', 'observation', {
      sampleId: 'ML-SMP-00005',
      date: '2026-08-11',
      method: 'Visual',
    }),
    kilnTemp: dp(1450, 'reference', {
      unit: '°C',
      source: TYPICAL + ' Temperatura típica de horno de clínker Portland.',
    }),
    strengthClass: dp(30, 'reference', {
      unit: 'MPa a 28 d (clase)',
      source: TYPICAL + ' Clase CPC 30R según NMX-C-414. No es resistencia medida de este saco.',
      method: 'NMX-C-414',
    }),
    waterCementRatio: dp([0.45, 0.6], 'reference', {
      source: TYPICAL + ' Relación a/c de trabajo habitual (ACI 211), no una dosificación S-35.',
      method: 'ACI 211 (referencia de práctica)',
    }),
    phFresh: dp(12.5, 'reference', {
      source: TYPICAL + ' pH típico de pasta fresca de Portland.',
    }),
  },
  chemical: [
    { compound: 'Óxido de calcio', formula: 'CaO', percent: dp([60, 67], 'reference', { unit: '%', source: TYPICAL }) },
    { compound: 'Dióxido de silicio', formula: 'SiO₂', percent: dp([17, 25], 'reference', { unit: '%', source: TYPICAL }) },
    { compound: 'Óxido de aluminio', formula: 'Al₂O₃', percent: dp([3, 8], 'reference', { unit: '%', source: TYPICAL }) },
    { compound: 'Óxido de hierro', formula: 'Fe₂O₃', percent: dp([0.5, 6], 'reference', { unit: '%', source: TYPICAL, note: 'Define el gris. A mayor Fe₂O₃, tono más oscuro y verdoso.' }) },
    { compound: 'Trióxido de azufre', formula: 'SO₃', percent: dp([2, 4], 'reference', { unit: '%', source: TYPICAL }) },
  ],
  morphology: {
    surface: dp('Polvo fino; grano individual no resuelto a lupa de campo', 'observation', {
      sampleId: 'ML-SMP-00005',
      date: '2026-08-11',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Partículas de molienda, sin forma de agregado', 'observation', {
      sampleId: 'ML-SMP-00005',
      date: '2026-08-11',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [{ id: 'cemento-gris', alt: 'Referencia visual de cemento gris: montículo gris sobre fondo blanco y detalle de polvo', width: 1536, height: 1024 }],
  },
  whyItMatters: [
    { property: 'Hidratación irreversible', effect: 'El cemento fraguado no vuelve a polvo; no es un ciclo como el del yeso', direction: '→' },
    { property: 'Clase 30R', effect: 'Define un piso de resistencia a 28 días; no sustituye el ensayo del lote', direction: '↑' },
    { property: 'Fe₂O₃', effect: 'Pinta de gris; el blanco es el mismo oficio con el hierro casi eliminado', direction: '→' },
    { property: 'Relación a/c', effect: 'Cada décima extra de agua cuesta resistencia y durabilidad', direction: '↓' },
  ],
  labNotes: [
    {
      date: '2026-08-11',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. No hay Blaine, ni tiempo de fraguado, ni resistencia a compresión publicados. La clase CPC 30R se declara como categoría comercial, no como resultado de cubos de un saco concreto.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. No Blaine, setting time or compressive-strength test is published.',
      },
    },
  ],
  relatedMaterials: ['cemento-blanco', 'cemento-aluminato-de-calcio', 'yeso', 'metacaolin', 'ceniza-volante', 'escoria-granulada-de-alto-horno', 'polimero-redispersable-vae', 'puzolana-volcanica', 'microsilice', 'vidrio-molido'],
  relatedResearch: ['caracterizacion-cemento-gris'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'cemento-gris.html',
  techMotion: true,
};
