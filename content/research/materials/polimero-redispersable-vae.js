const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de polímero redispersable VAE (copolímero vinil acetato-etileno) de grado construcción, compilado en briefing interno S-35 FT-MP-029. Valores típicos de comercio/norma (EN 1015-12, ASTM C1042, ASTM D2354, ASTM D2369), no ensayo de este lote. No se publica planta.';

module.exports = {
  code: 'ML-ADM-002',
  slug: 'polimero-redispersable-vae',
  slugEn: 'redispersible-vae-polymer',
  name: { es: 'Polímero redispersable VAE', en: 'Redispersible VAE polymer' },
  scientificName: 'Vinyl acetate–ethylene copolymer (VAE)',
  category: 'ADM',
  classLabel: { es: 'POLÍMERO FUNCIONAL', en: 'FUNCTIONAL POLYMER' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de polímero redispersable VAE. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Un polvo blanco que en agua vuelve a ser el látex del que salió. Al secar dentro de la mezcla forma una película flexible que abraza cada partícula: convierte un mortero rígido en un sistema que se adhiere, flexiona y resiste sin fisurar.\n\nEl VAE nace como látex líquido. Se seca por aspersión para poder mezclarlo en seco con el cemento; al rehidratar, las esferas de polímero coalescen y forman una red continua entrelazada con los cristales de cemento. Esa película es el oficio. La HPMC retiene el agua que esa película necesita para formarse; el VAE aporta la adherencia y la flexibilidad que la celulosa no da. Dosis distintas, oficios distintos: HPMC en décimas de porcentaje; VAE en 1–5 %.\n\nLos números de esta ficha (dosis 1–5 %, adherencia 0.8–1.5 MPa a 5 %, TMFF 0–15 °C, sólidos ≥98 %) son valores típicos de VAE comercial de grado construcción según EN 1015 / ASTM C1042, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'A white powder that in water becomes the latex it came from. As the mix dries it forms a flexible film around each particle: a rigid mortar becomes a system that bonds, flexes and resists without cracking.\n\nVAE starts as a liquid latex, spray-dried so it can be dry-blended with cement. On rewetting the polymer spheres coalesce into a continuous network interlocked with cement crystals. That film is the job. HPMC holds the water the film needs to form; VAE supplies adhesion and flexibility that cellulose does not. Different doses, different jobs: HPMC in tenths of a percent; VAE at 1–5 %.\n\nFigures in this file (dose, tensile adhesion, minimum film-forming temperature, solids) are typical commercial values for construction-grade VAE (EN 1015 / ASTM C1042), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Aditivo funcional · grado construcción', 'observation', {
    note: 'Clase comercial. No se publica planta ni marca.',
    sampleId: 'ML-SMP-00020',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { unit: 'g/cm³', note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp(null, 'in-progress', { note: 'NOT YET MEASURED on this lot' }),
    color: dp('Blanco puro, granular fino, con racimos irregulares mate', 'observation', {
      sampleId: 'ML-SMP-00020',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Polvo redispersable de copolímero VAE, fluido', 'observation', {
      sampleId: 'ML-SMP-00020',
      date: '2026-08-27',
      method: 'Visual',
    }),
    dosage: dp([1, 5], 'reference', {
      unit: '% sobre mezcla seca',
      source: TYPICAL + ' Rango de dosis habitual; no una dosificación S-35.',
      note: '1–2 % mejora adherencia básica; 3–5 % es rango típico en EIFS y anclaje.',
    }),
    tensileAdhesion: dp([0.8, 1.5], 'reference', {
      unit: 'MPa a 5 % de dosis',
      source: TYPICAL + ' Adherencia a tracción típica EN 1015-12; no es ensayo de este saco.',
      method: 'EN 1015-12 (referencia de método; no ejecutado sobre este lote)',
    }),
    filmTemp: dp([0, 15], 'reference', {
      unit: '°C (TMFF)',
      source: TYPICAL + ' Temperatura mínima de formación de película según grado ASTM D2354.',
      method: 'ASTM D2354 (referencia de método; no ejecutado sobre este lote)',
    }),
  },
  chemical: [
    {
      compound: 'Copolímero vinil acetato-etileno',
      formula: 'VAE',
      percent: dp(98, 'reference', {
        unit: '% mín. sólidos activos',
        source: TYPICAL + ' Contenido de sólidos activos típico ASTM D2369; no es ensayo de este lote.',
        method: 'ASTM D2369 (referencia de método; no ejecutado sobre este lote)',
        note: 'Casi todo el polvo es polímero activo.',
      }),
    },
    {
      compound: 'Humedad de suministro',
      formula: 'H₂O',
      percent: dp(2, 'reference', {
        unit: '% máx.',
        source: TYPICAL + ' Máximo típico de humedad de suministro.',
        note: 'Exceso de humedad apelmaza el polvo y dificulta la redispersión.',
      }),
    },
  ],
  morphology: {
    surface: dp('Polvo blanco granular fino, con racimos irregulares de superficie rugosa', 'observation', {
      sampleId: 'ML-SMP-00020',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Partículas de polímero spray-dried, no agregados minerales', 'observation', {
      sampleId: 'ML-SMP-00020',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'polimero-redispersable-vae',
        alt: 'Referencia visual de polímero redispersable VAE: montículo de polvo blanco granular sobre fondo blanco y detalle de racimos irregulares mate',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Película flexible continua', effect: 'Adherencia y movimiento térmico que el cemento solo no da', direction: '↑' },
    { property: 'Adherencia 2–4×', effect: 'Tracción típica 0.8–1.5 MPa a 5 % frente a mortero sin polímero', direction: '↑' },
    { property: 'TMFF 0–15 °C', effect: 'El grado elige si la película coalescé en frío, en EIFS o en anclaje', direction: '→' },
    { property: 'Sinergia con HPMC', effect: 'La celulosa retiene el agua que la película necesita para formarse', direction: '↑' },
    { property: 'No es HPMC', effect: 'HPMC reología y agua; VAE película y adherencia. Oficios distintos', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el polvo es blanco, granular fino, con racimos irregulares mate. No hay ensayo de adherencia EN 1015-12, TMFF ASTM D2354 ni sólidos ASTM D2369 publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the powder is white, finely granular, with matte irregular clusters. No EN 1015-12 adhesion, ASTM D2354 MFFT or ASTM D2369 solids test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['celulosa-hpmc', 'eter-de-almidon', 'cemento-gris', 'cemento-blanco', 'yeso'],
  relatedResearch: ['caracterizacion-polimero-redispersable-vae'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'polimero-redispersable-vae.html',
  techMotion: true,
};
