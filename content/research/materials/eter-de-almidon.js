const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de éter de almidón de grado construcción, compilado en briefing interno S-35 FT-MP-030. Valores típicos de comercio/norma (EN 1015, ASTM C1714), no ensayo de este lote. No se publica planta.';

module.exports = {
  code: 'ML-ADM-003',
  slug: 'eter-de-almidon',
  slugEn: 'starch-ether',
  name: { es: 'Éter de almidón', en: 'Starch ether' },
  scientificName: 'Hydroxyalkyl starch ether',
  category: 'ADM',
  classLabel: { es: 'MODIFICADOR REOLÓGICO', en: 'RHEOLOGY MODIFIER' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de éter de almidón. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Un polímero de almidón vegetal transformado para volverse soluble en frío. Su fuerza está en dar deslizamiento y untuosidad a la llana en dosis mínimas, casi siempre junto a la celulosa, sin competir con ella en retención de agua.\n\nEl almidón crudo no se disuelve en agua fría. Al eterificarlo —hidroxietilo o hidroxipropilo— se vuelve soluble desde el primer contacto. Sus cadenas son más cortas que las de la HPMC: menos enredo, menos retención, más lubricidad. La HPMC atrapa agua (0.1–0.5 %); el VAE forma película (1–5 %); el éter de almidón reduce la fricción entre partículas (0.02–0.1 %). Tres oficios, tres dosis.\n\nLos números de esta ficha (dosis 0.02–0.1 %, viscosidad 50–500 mPa·s al 2 %, pH 5–8, humedad ≤8 %) son valores típicos de éter de almidón comercial de grado construcción según EN 1015 / ASTM C1714, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'A plant-starch polymer modified to dissolve in cold water. Its strength is slip and trowel creaminess at very low doses, almost always with cellulose, without competing on water retention.\n\nRaw starch does not dissolve in cold water. Etherification — hydroxyethyl or hydroxypropyl — makes it soluble on first contact. Its chains are shorter than HPMC: less entanglement, less retention, more lubricity. HPMC holds water (0.1–0.5 %); VAE forms a film (1–5 %); starch ether cuts friction between particles (0.02–0.1 %). Three jobs, three doses.\n\nFigures in this file (dose, viscosity, pH, moisture) are typical commercial values for construction-grade starch ether (EN 1015 / ASTM C1714), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Aditivo funcional · grado construcción', 'observation', {
    note: 'Clase comercial. No se publica planta ni marca.',
    sampleId: 'ML-SMP-00021',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { unit: 'g/cm³', note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    color: dp('Blanco brillante, fino, con grumos blandos e irregulares', 'observation', {
      sampleId: 'ML-SMP-00021',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Polvo de almidón eterificado, soluble en agua fría', 'observation', {
      sampleId: 'ML-SMP-00021',
      date: '2026-08-27',
      method: 'Visual',
    }),
    dosage: dp([0.02, 0.1], 'reference', {
      unit: '% sobre mezcla seca',
      source: TYPICAL + ' Rango de dosis habitual; no una dosificación S-35.',
      note: 'Por encima de 0.1 % rara vez se gana más; el exceso vuelve la mezcla demasiado resbaladiza.',
    }),
    viscosity: dp([50, 500], 'reference', {
      unit: 'mPa·s (2 % en agua)',
      source: TYPICAL + ' Viscosidad típica Brookfield al 2 %; no es ensayo de este saco.',
      method: 'Viscosímetro Brookfield (referencia de método; no ejecutado sobre este lote)',
    }),
    phSaturated: dp([5.0, 8.0], 'reference', {
      source: TYPICAL + ' pH en solución; estable en el medio alcalino del cemento.',
    }),
  },
  chemical: [
    {
      compound: 'Éter de almidón hidroxialquilo',
      formula: 'Starch ether',
      percent: dp(null, 'in-progress', { unit: '%', note: 'NOT YET MEASURED on this lot' }),
    },
    {
      compound: 'Humedad de suministro',
      formula: 'H₂O',
      percent: dp(8, 'reference', {
        unit: '% máx.',
        source: TYPICAL + ' Máximo típico de humedad de suministro.',
        note: 'Más tolerante que la HPMC, pero conviene controlarla.',
      }),
    },
  ],
  morphology: {
    surface: dp('Polvo fino blanco, con grumos blandos y racimos aireados', 'observation', {
      sampleId: 'ML-SMP-00021',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Partículas de polímero vegetal, sin forma de agregado', 'observation', {
      sampleId: 'ML-SMP-00021',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'eter-de-almidon',
        alt: 'Referencia visual de éter de almidón: montículo de polvo blanco brillante sobre fondo blanco y detalle de grumos blandos aireados',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Deslizamiento bajo la llana', effect: 'Untuosidad y peinado limpio que la HPMC sola no iguala', direction: '↑' },
    { property: 'Dosis 0.02–0.1 %', effect: 'Cambia el tacto con una fracción de la dosis de celulosa', direction: '↑' },
    { property: 'Poca retención de agua', effect: 'No sustituye a la HPMC; la acompaña', direction: '→' },
    { property: 'Efecto mínimo en fraguado', effect: 'No retrasa el cemento como una HPMC en dosis alta', direction: '↑' },
    { property: 'No es HPMC ni VAE', effect: 'HPMC retiene; VAE forma película; el almidón lubrica', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el polvo es blanco brillante, fino, con grumos blandos e irregulares. No hay ensayo de viscosidad Brookfield, pH ni retención EN 1015-8 publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the powder is bright white, fine, with soft irregular clumps. No Brookfield viscosity, pH or EN 1015-8 retention test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['celulosa-hpmc', 'polimero-redispersable-vae', 'yeso'],
  relatedResearch: ['caracterizacion-eter-de-almidon'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'eter-de-almidon.html',
  techMotion: true,
};
