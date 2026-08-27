const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de hidroxipropilmetilcelulosa (HPMC) de grado construcción, compilado en briefing interno S-35 FT-MP-028. Valores típicos de comercio/norma (EN 1015-8, ASTM C1714, ASTM D3876), no ensayo de este lote. No se publica planta.';

module.exports = {
  code: 'ML-ADM-001',
  slug: 'celulosa-hpmc',
  slugEn: 'hpmc-cellulose',
  name: { es: 'Celulosa HPMC', en: 'HPMC cellulose' },
  scientificName: 'Hydroxypropyl methylcellulose (HPMC)',
  category: 'ADM',
  classLabel: { es: 'MODIFICADOR REOLÓGICO', en: 'RHEOLOGY MODIFIER' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de celulosa HPMC. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Un polímero derivado de la madera que, en dosis mínimas —menos del 1 %—, transforma cómo se comporta un mortero: retiene agua, abre la ventana de trabajo y da la trabajabilidad suave de una mezcla moderna.\n\nLa HPMC parte de celulosa vegetal a la que se injertan grupos metilo e hidroxipropilo. Esa modificación la vuelve soluble en agua fría: al disolverse, sus cadenas largas forman una red que atrapa agua. Esa red es el oficio. No hincha como la bentonita (arcilla mineral, 1–5 %); aquí el efecto es polimérico y se mide en décimas de porcentaje. El grado de viscosidad elige el uso: baja para autonivelar, alta para no escurrir en vertical.\n\nLos números de esta ficha (dosis 0.1–0.5 %, retención de agua 95–99 %, gelificación 55–70 °C, metoxilo 19–30 %) son valores típicos de HPMC comercial de grado construcción según EN 1015 / ASTM C1714, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'A wood-derived polymer that, at doses under 1 %, changes how a mortar behaves: it holds water, opens the working window and gives the smooth feel of a modern mix.\n\nHPMC starts as plant cellulose with methyl and hydroxypropyl groups grafted on. That makes it soluble in cold water; the long chains form a network that traps water. That network is the job. It does not swell like bentonite (a mineral clay at 1–5 %); here the effect is polymeric and measured in tenths of a percent. Viscosity grade chooses the use: low for self-levelling, high to stay on a vertical face.\n\nFigures in this file (dose, water retention, gel temperature, methoxyl content) are typical commercial values for construction-grade HPMC (EN 1015 / ASTM C1714), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Aditivo funcional · grado construcción', 'observation', {
    note: 'Clase comercial. No se publica planta ni marca.',
    sampleId: 'ML-SMP-00019',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { unit: 'g/cm³', note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    color: dp('Blanco brillante, uniforme, con microgrumos mate', 'observation', {
      sampleId: 'ML-SMP-00019',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Polvo fino de éter de celulosa; soluble en agua fría', 'observation', {
      sampleId: 'ML-SMP-00019',
      date: '2026-08-27',
      method: 'Visual',
    }),
    waterRetention: dp([95, 99], 'reference', {
      unit: '%',
      source: TYPICAL + ' Retención de agua típica EN 1015-8; no es ensayo de este saco.',
      method: 'EN 1015-8 (referencia de método; no ejecutado sobre este lote)',
    }),
    gelTemp: dp([55, 70], 'reference', {
      unit: '°C',
      source: TYPICAL + ' Temperatura de gelificación típica del grado construcción.',
    }),
    phSaturated: dp([5.5, 8.0], 'reference', {
      source: TYPICAL + ' pH en solución; estable en el medio alcalino del cemento.',
    }),
    dosage: dp([0.1, 0.5], 'reference', {
      unit: '% sobre mezcla seca',
      source: TYPICAL + ' Rango de dosis habitual; no una dosificación S-35.',
      note: 'Por debajo de 0.1 % el efecto no alcanza; por encima de 0.5 % el fraguado se retrasa en exceso.',
    }),
  },
  chemical: [
    {
      compound: 'Hidroxipropilmetilcelulosa',
      formula: 'HPMC',
      percent: dp(null, 'in-progress', { unit: '%', note: 'NOT YET MEASURED on this lot' }),
    },
    {
      compound: 'Grupos metoxilo',
      formula: '–OCH₃',
      percent: dp([19.0, 30.0], 'reference', {
        unit: '%',
        source: TYPICAL + ' Contenido de metoxilo típico ASTM D3876; define gelificación y solubilidad del grado.',
        method: 'ASTM D3876 (referencia de método; no ejecutado sobre este lote)',
      }),
    },
    {
      compound: 'Humedad de suministro',
      formula: 'H₂O',
      percent: dp(5, 'reference', {
        unit: '% máx.',
        source: TYPICAL + ' Máximo típico de humedad de suministro.',
        note: 'Exceso de humedad reduce solubilidad posterior y efecto real en obra.',
      }),
    },
  ],
  morphology: {
    surface: dp('Polvo fino blanco, con microgrumos blandos e irregulares', 'observation', {
      sampleId: 'ML-SMP-00019',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Partículas de polímero, sin forma de agregado', 'observation', {
      sampleId: 'ML-SMP-00019',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'celulosa-hpmc',
        alt: 'Referencia visual de celulosa HPMC: montículo de polvo blanco brillante sobre fondo blanco y detalle de microgrumos mate',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Retención de agua 95–99 %', effect: 'El cemento hidrata a tiempo aunque el sustrato sea absorbente', direction: '↑' },
    { property: 'Dosis 0.1–0.5 %', effect: 'Cambia la reología del mortero sin ser carga ni cementante', direction: '↑' },
    { property: 'Pseudoplasticidad', effect: 'Espesa en reposo y afloja bajo la llana: sensación cremosa', direction: '↑' },
    { property: 'El grado es el uso', effect: 'Baja viscosidad autonivela; alta viscosidad sostiene en vertical', direction: '→' },
    { property: 'No es bentonita', effect: 'Red polimérica, no hinchamiento de arcilla; oficios distintos', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el polvo es blanco brillante, uniforme, con microgrumos mate. No hay ensayo de retención EN 1015-8, viscosidad ni metoxilo ASTM D3876 publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the powder is bright white, uniform, with matte micro-clumps. No EN 1015-8 water-retention, viscosity or ASTM D3876 methoxyl test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['polimero-redispersable-vae', 'perlita-expandida', 'arena-silicea-graduada', 'bentonita-sodica', 'yeso'],
  relatedResearch: ['caracterizacion-celulosa-hpmc'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'celulosa-hpmc.html',
  techMotion: true,
};
