const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de yeso de construcción grado comercial (~95 % de pureza declarada de clase), compilado en briefing interno S-35 FT-MP-015. Valores típicos de comercio/norma, no ensayo de este lote.';

module.exports = {
  code: 'ML-BND-002',
  slug: 'yeso',
  slugEn: 'gypsum',
  name: { es: 'Yeso', en: 'Gypsum' },
  scientificName: 'CaSO₄·2H₂O',
  category: 'BND',
  classLabel: { es: 'SULFATO MINERAL · CEMENTANTE', en: 'MINERAL SULFATE · BINDER' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-19',
  updatedAt: '2026-08-19',
  revisionHistory: [
    { rev: 1, date: '2026-08-19', change: 'Primera ficha pública: referencia visual y perfil típico de yeso. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'El yeso es el cementante más rápido del taller y el menos estructural. Piedra blanda (2 Mohs: se raya con la uña) que, al calentarse cerca de 150 °C, suelta parte de su agua de cristalización y se vuelve hemihidrato en polvo. Al amasarla, recristaliza en agujas entrelazadas y endurece en minutos. No seca: cristaliza. El ciclo es reversible; cada vuelta pierde finura y resistencia.\n\nLa referencia visual muestra un polvo blanco a marfil, fino, de presentación habitual. No se publica yacimiento ni proveedor. La clase se declara como sulfato de calcio dihidratado / hemihidrato de grado comercial, no como piedra de cantera ni como escayola de alta resistencia.\n\nEsa velocidad es la razón de usarlo y la razón de no usarlo. La ventana típica de fraguado inicial (8–15 min) obliga a colar de una sola vez. La expansión ligera al endurecer copia el molde con detalle. A cambio, es ligeramente soluble en agua (~2 g/L): el agua lo desgasta. Interiores, no saturación. Las sales solubles, si están, migran y dejan velos blancos; son el defecto a vigilar, no un número que esta ficha invente para este saco.\n\nLos valores de cabecera —≈21 % de su peso es agua cristalizada, 8–15 min de fraguado inicial, 150 °C de calcinación, 2 Mohs— y la química típica (SO₃ 44–46.5 %, CaO 31–33 %, agua de cristalización 18–21 %) son perfiles de literatura y de comercio. El lote no tiene aún ensayo ASTM C472 ni tamizado. Donde no hay dato de este saco, se lee NOT YET MEASURED.\n\nLaboratorio describe el ciclo del sulfato. No describe la fórmula de un estuco S-35.',
    en: 'Gypsum is the fastest binder in the shop and the least structural. The visual reference is a fine white-to-ivory powder. Header figures and typical chemistry are commercial/literature profiles, not a lot assay.',
  },
  origin: dp('México', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni proveedor.',
    sampleId: 'ML-SMP-00004',
    date: '2026-08-11',
  }),
  physical: {
    bulkDensity: dp([0.7, 0.9], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL + ' Densidad aparente típica de polvo de yeso; no medida en este lote.',
    }),
    specificGravity: dp([2.31, 2.35], 'reference', {
      source: 'Densidad real típica del yeso. Klein & Dutrow / perfiles de yeso de construcción. No es densidad de este lote.',
    }),
    hardnessMohs: dp(2, 'reference', {
      source: 'Dureza del yeso, escala de Mohs. Klein & Dutrow, Manual of Mineral Science.',
    }),
    waterAbsorption: dp(null, 'in-progress', { unit: '%', note: 'NOT YET MEASURED' }),
    color: dp('Blanco a marfil', 'observation', {
      sampleId: 'ML-SMP-00004',
      date: '2026-08-11',
      method: 'Referencia visual',
    }),
    structure: dp('Polvo fino de hemihidrato / dihidrato', 'observation', {
      sampleId: 'ML-SMP-00004',
      date: '2026-08-11',
      method: 'Visual',
    }),
    initialSet: dp([8, 15], 'reference', {
      unit: 'min',
      source: TYPICAL + ' Fraguado inicial típico ASTM C472; no ejecutado sobre este lote.',
      method: 'ASTM C472 (referencia de método)',
    }),
    calcinationTemp: dp(150, 'reference', {
      unit: '°C',
      source: TYPICAL + ' Temperatura típica de calcinación a hemihidrato.',
    }),
  },
  chemical: [
    { compound: 'Yeso', formula: 'CaSO₄·2H₂O', percent: dp([85, 95], 'reference', { unit: '%', source: TYPICAL }) },
    { compound: 'Anhidrita', formula: 'CaSO₄', percent: dp([0, 5], 'reference', { unit: '%', source: TYPICAL, note: 'Límite típico superior.' }) },
    { compound: 'Carbonatos (calcita / dolomita)', percent: dp([0, 5], 'reference', { unit: '%', source: TYPICAL, note: 'Límite típico superior.' }) },
    { compound: 'Trióxido de azufre', formula: 'SO₃', percent: dp([44, 46.5], 'reference', { unit: '%', source: TYPICAL }) },
    { compound: 'Óxido de calcio', formula: 'CaO', percent: dp([31, 33], 'reference', { unit: '%', source: TYPICAL }) },
  ],
  morphology: {
    surface: dp('Polvo fino; cristales no resueltos a lupa de campo', 'observation', {
      sampleId: 'ML-SMP-00004',
      date: '2026-08-11',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Partículas pulverulentas, sin forma de agregado', 'observation', {
      sampleId: 'ML-SMP-00004',
      date: '2026-08-11',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [{ id: 'yeso', alt: 'Referencia visual de yeso: montículo blanco sobre fondo blanco y detalle de polvo', width: 1536, height: 1024 }],
  },
  whyItMatters: [
    { property: 'Fraguado en minutos', effect: 'Ventana de trabajo corta; hay que colar de una sola vez', direction: '↓' },
    { property: 'Cristalización, no secado', effect: 'Copia el molde con detalle; suelta calor al fraguar', direction: '↑' },
    { property: 'Solubilidad en agua', effect: 'El agua lo desgasta; uso de interiores, no saturación', direction: '↓' },
    { property: 'Dureza 2 Mohs', effect: 'Se raya con la uña; no es material estructural', direction: '↓' },
  ],
  labNotes: [
    {
      date: '2026-08-11',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. No hay ASTM C472, ni tamizado, ni ensayo de sales solubles publicado.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. No ASTM C472, sieve or soluble-salt test is published.',
      },
    },
  ],
  relatedMaterials: ['cemento-gris', 'perlita-expandida', 'bentonita-sodica', 'vermiculita-expandida'],
  relatedResearch: ['caracterizacion-yeso'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'yeso.html',
  techMotion: true,
};
