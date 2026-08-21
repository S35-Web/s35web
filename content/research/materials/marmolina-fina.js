const { dp } = require('../dp');

const TYPICAL_MARBLE_FLOUR =
  'Especificación típica de marmolina / harina de mármol calcítica de grado fino, compilada en briefing interno S-35 FT-MP-020. Valores típicos de comercio, no ensayo de este lote.';

module.exports = {
  code: 'ML-FIL-001',
  slug: 'marmolina-fina',
  slugEn: 'fine-marble-dust',
  name: { es: 'Marmolina fina', en: 'Fine marble dust' },
  scientificName: 'CaCO₃ · calcite',
  category: 'FIL',
  classLabel: { es: 'AGREGADO FINO TRITURADO · CARGA CALCÁREA', en: 'CRUSHED FINE AGGREGATE · CALCAREOUS FILLER' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-19',
  updatedAt: '2026-08-19',
  revisionHistory: [
    { rev: 1, date: '2026-08-19', change: 'Primera ficha pública: referencia visual y perfil típico de marmolina fina. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'La marmolina fina no es arena. Es mármol o caliza recristalizada, triturada y clasificada: un carbonato de calcio que conserva las caras de fractura del golpe y no ha pasado por un horno. Esa diferencia —triturado, no calcinado— explica casi todo su comportamiento en un estuco, un terrazo o un concreto arquitectónico.\n\nLa referencia visual muestra un polvo granular blanco de grado fino. A simple vista, los granos son angulosos, de color blanco a gris muy claro, con alguna partícula parda. El origen se declara por región: Comarca Lagunera, Torreón, Coahuila. No se nombra cantera ni proveedor.\n\nQuímicamente, el mármol calcítico es CaCO₃. Esa composición le da afinidad con pastas de cal y de cemento que una arena silícea no tiene: el grano no es un inerte perfecto, participa de la matriz. También le quita resistencia a los ácidos —un chorro de vinagre o un limpiador ácido ataca el pulido— y fija la dureza en 3 Mohs, la de la calcita: se pule con facilidad y se raya con facilidad. No es un piso de alto tráfico; es un acabado que refleja luz en caras planas, no un blanco lechoso de carga ultrafina.\n\nLos números de esta ficha (pureza ≥95 % CaCO₃, rango 0.3–1.2 mm, blancura 90–95 %, absorción 0.3–1.0 %) son valores típicos de marmolina comercial de grado fino, no un análisis de este saco. El lote fotografiado no tiene aún ensayo de mallas, ni colorimetría, ni absorción medida. Donde el archivo no tiene dato, se lee NOT YET MEASURED.\n\nMateriaLab publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento. Esa frontera —caracterización versus formulación— es deliberada.',
    en: 'Fine marble dust is not sand. It is crushed, classified marble or recrystallised limestone: calcium carbonate that keeps its fracture faces and has not been calcined. That difference explains its behaviour in stucco, terrazzo and architectural concrete.\n\nThe visual reference is a white fine-grade granular powder with angular grains. Origin is declared as a region — Comarca Lagunera, Torreón, Coahuila — not as a quarry or supplier.\n\nFigures in this file (CaCO₃ purity, 0.3–1.2 mm grade, whiteness, absorption) are typical commercial values for fine marble flour, not an assay of this lot. Unmeasured properties are marked NOT YET MEASURED.',
  },
  origin: dp('Torreón, Coahuila · Comarca Lagunera, MX', 'observation', {
    note: 'Región de procedencia declarada. No se publica cantera ni proveedor.',
    sampleId: 'ML-SMP-00002',
    date: '2026-08-11',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { unit: 'g/cm³', note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp(2.71, 'reference', {
      source: 'Densidad de la calcita (CaCO₃). Klein & Dutrow, Manual of Mineral Science. No es densidad aparente de este lote.',
    }),
    hardnessMohs: dp(3, 'reference', {
      source: 'Dureza de la calcita, escala de Mohs. Klein & Dutrow, Manual of Mineral Science.',
    }),
    waterAbsorption: dp([0.3, 1.0], 'reference', {
      unit: '%',
      source: TYPICAL_MARBLE_FLOUR,
      method: 'ASTM C128 (referencia de método; no ejecutado sobre este lote)',
    }),
    porosity: dp('Baja, grano cristalino denso', 'reference', {
      source: TYPICAL_MARBLE_FLOUR,
    }),
    color: dp('Blanco a gris muy claro', 'observation', {
      sampleId: 'ML-SMP-00002',
      date: '2026-08-11',
      method: 'Referencia visual',
    }),
    structure: dp('Granular triturado, caras de fractura angulosas', 'observation', {
      sampleId: 'ML-SMP-00002',
      date: '2026-08-11',
      method: 'Visual',
    }),
    grainRange: dp([0.3, 1.2], 'reference', {
      unit: 'mm',
      source: 'Grado fino comercial de marmolina (0.3–1.2 mm) según briefing interno FT-MP-020. No es D10–D90 de este lote.',
    }),
    whiteness: dp([90, 95], 'reference', {
      unit: '% reflectancia',
      source: TYPICAL_MARBLE_FLOUR + ' Método de referencia ASTM E313 no ejecutado aquí.',
    }),
  },
  chemical: [
    {
      compound: 'Carbonato de calcio',
      formula: 'CaCO₃',
      percent: dp([95, 99], 'reference', { unit: '%', source: TYPICAL_MARBLE_FLOUR }),
    },
    {
      compound: 'Carbonato de magnesio',
      formula: 'MgCO₃',
      percent: dp([0, 3], 'reference', { unit: '%', source: TYPICAL_MARBLE_FLOUR, note: 'Límite típico superior.' }),
    },
    {
      compound: 'Insolubles (SiO₂, arcillas)',
      percent: dp([0, 2], 'reference', { unit: '%', source: TYPICAL_MARBLE_FLOUR, note: 'Límite típico superior.' }),
    },
    {
      compound: 'Óxido de hierro',
      formula: 'Fe₂O₃',
      percent: dp([0, 0.2], 'reference', {
        unit: '%',
        source: TYPICAL_MARBLE_FLOUR,
        note: 'Por encima de ~0.2 % Fe₂O₃ suele aparecer moteado amarillo en acabados claros.',
      }),
    },
  ],
  granulometry: {
    sieves: [
      { openingMm: 2.36, sieve: '#8', passingPercent: dp(null, 'in-progress', { unit: '%', note: 'NOT YET MEASURED' }) },
      { openingMm: 1.18, sieve: '#16', passingPercent: dp(null, 'in-progress', { unit: '%', note: 'NOT YET MEASURED' }) },
      { openingMm: 0.6, sieve: '#30', passingPercent: dp(null, 'in-progress', { unit: '%', note: 'NOT YET MEASURED' }) },
      { openingMm: 0.3, sieve: '#50', passingPercent: dp(null, 'in-progress', { unit: '%', note: 'NOT YET MEASURED' }) },
      { openingMm: 0.15, sieve: '#100', passingPercent: dp(null, 'in-progress', { unit: '%', note: 'NOT YET MEASURED' }) },
      { openingMm: 0.075, sieve: '#200', passingPercent: dp(null, 'in-progress', { unit: '%', note: 'NOT YET MEASURED' }) },
    ],
    d10: dp(null, 'in-progress', { unit: 'mm', note: 'NOT YET MEASURED' }),
    d50: dp(null, 'in-progress', { unit: 'mm', note: 'NOT YET MEASURED' }),
    d90: dp(null, 'in-progress', { unit: 'mm', note: 'NOT YET MEASURED' }),
  },
  morphology: {
    surface: dp('Caras de fractura planas; brillo vítreo a perlado', 'observation', {
      sampleId: 'ML-SMP-00002',
      date: '2026-08-11',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Anguloso (trituración, no arrastre fluvial)', 'observation', {
      sampleId: 'ML-SMP-00002',
      date: '2026-08-11',
    }),
    edgeProfile: dp('Aristas vivas de golpe, no redondeadas', 'observation', {
      sampleId: 'ML-SMP-00002',
      date: '2026-08-11',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'marmolina-fina',
        alt: 'Referencia visual de marmolina fina: montículo blanco sobre fondo blanco y detalle de granos angulosos',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Caras de fractura angulosas', effect: 'Refleja luz en planos; blanco brillante, no lechoso', direction: '↑' },
    { property: 'Afinidad CaCO₃–cal/cemento', effect: 'Mejor unión a la pasta que una arena silícea inerte', direction: '↑' },
    { property: 'Dureza 3 Mohs', effect: 'Se pule con facilidad; se raya con facilidad', direction: '↓' },
    { property: 'Reactividad a ácidos', effect: 'Vinagre o limpiadores ácidos atacan el pulido', direction: '↓' },
    { property: 'Absorción baja (típica)', effect: 'No roba agua de la mezcla en la misma medida que un poroso', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-11',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia los granos son angulosos, predominantemente blancos, con partículas aisladas pardas. No hay ataque con HCl, ni colorimetría, ni ensayo de mallas publicado.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the grains are angular, mostly white, with isolated brown particles. No HCl test, colorimetry or sieve analysis is published.',
      },
    },
  ],
  relatedMaterials: ['arena-de-rio', 'cal', 'cemento-blanco'],
  relatedResearch: ['caracterizacion-marmolina-fina'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'marmolina-fina.html',
  techMotion: true,
};
