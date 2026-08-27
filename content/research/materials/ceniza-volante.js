const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de ceniza volante de grado construcción (ASTM C618 clase F/C), compilado en briefing interno S-35 FT-MP-031. Valores típicos de comercio/norma (ASTM C618, EN 450-1, ASTM C311), no ensayo de este lote. No se publica planta.';

module.exports = {
  code: 'ML-MIN-005',
  slug: 'ceniza-volante',
  slugEn: 'fly-ash',
  name: { es: 'Ceniza volante', en: 'Fly ash' },
  scientificName: 'Coal-combustion glassy aluminosilicate microspheres (ASTM C618 Class F/C)',
  category: 'MIN',
  classLabel: { es: 'PUZOLANA', en: 'POZZOLAN' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de ceniza volante. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'El residuo mineral que queda al quemar carbón en una termoeléctrica, recuperado antes de que salga por la chimenea. Es sílice y alúmina vitrificadas en microesferas: la misma química reactiva del metacaolín, obtenida de un subproducto industrial en lugar de calcinar arcilla a propósito.\n\nA más de 1 300 °C los minerales del carbón se funden en el aire y se enfrían de golpe: no cristalizan, quedan esferas de vidrio, muchas huecas. Esa forma rueda como balines y baja la demanda de agua; el vidrio reacciona con la cal libre del Portland y densifica la pasta a largo plazo. El metacaolín es más rápido, más blanco y más caro; el jal es puzolánico y aligerante. La ceniza es la puzolana de volumen: 15–35 % de sustitución, reacción lenta, color gris.\n\nLos números de esta ficha (óxidos reactivos ≥70 % en clase F, actividad ≥75 % a 28 días, partícula 10–20 µm, densidad 2.0–2.6 g/cm³) son valores típicos de ceniza comercial según ASTM C618 / C311, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'The mineral residue left when coal is burned in a power plant, recovered before it leaves the stack. Silica and alumina vitrified as microspheres: the same reactive chemistry as metakaolin, from an industrial by-product instead of calcining clay on purpose.\n\nAbove 1 300 °C coal minerals melt in air and quench: they do not crystallise, they freeze as glass spheres, many hollow. That shape rolls like ball bearings and cuts water demand; the glass reacts with Portland free lime and densifies the paste over time. Metakaolin is faster, whiter and dearer; jal is pozzolanic and lightweight. Fly ash is the volume pozzolan: 15–35 % replacement, slow reaction, grey colour.\n\nFigures in this file (reactive oxides, pozzolanic activity, particle size, density) are typical commercial values for fly ash (ASTM C618 / C311), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Subproducto de combustión de carbón · clase F/C', 'observation', {
    note: 'Clase comercial. No se publica planta ni marca.',
    sampleId: 'ML-SMP-00022',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { unit: 'g/cm³', note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp([2.0, 2.6], 'reference', {
      source: TYPICAL + ' Densidad real típica ASTM C188; no es densidad de este lote.',
      method: 'ASTM C188 (referencia de método; no ejecutado sobre este lote)',
    }),
    color: dp('Gris medio uniforme, con microgrumos y esferas mate', 'observation', {
      sampleId: 'ML-SMP-00022',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Microesferas vítreas de silicoaluminato, mayoría huecas', 'observation', {
      sampleId: 'ML-SMP-00022',
      date: '2026-08-27',
      method: 'Visual',
    }),
    grainRange: dp([10, 20], 'reference', {
      unit: 'µm',
      source: TYPICAL + ' Tamaño de partícula típico; no es D10–D90 de este lote.',
    }),
    pozzolanicActivity: dp(75, 'reference', {
      unit: '% a 28 días mínimo',
      source: TYPICAL,
      method: 'ASTM C311 (referencia de método; no ejecutado sobre este lote)',
    }),
    cementReplacement: dp([15, 35], 'reference', {
      unit: '%',
      source: TYPICAL + ' Sustitución típica de cemento; clase F 15–25 %, clase C hasta 35 %.',
    }),
    waterReduction: dp([5, 15], 'reference', {
      unit: '%',
      source: TYPICAL + ' Reducción de agua típica ASTM C1437 por forma esférica.',
      method: 'ASTM C1437 (referencia de método; no ejecutado sobre este lote)',
    }),
  },
  chemical: [
    {
      compound: 'Óxidos reactivos',
      formula: 'SiO₂ + Al₂O₃ + Fe₂O₃',
      percent: dp(70, 'reference', {
        unit: '% mínimo clase F',
        source: TYPICAL,
        note: 'Clase F ≥70 %; clase C ≥50 % (ASTM C618).',
      }),
    },
    {
      compound: 'Óxido de calcio',
      formula: 'CaO',
      percent: dp([0, 10], 'reference', {
        unit: '% clase F',
        source: TYPICAL,
        note: 'Clase F <10 %. Clase C típica 15–30 %.',
      }),
    },
    {
      compound: 'Pérdida por calcinación (LOI)',
      formula: 'C no quemado',
      percent: dp(6, 'reference', {
        unit: '% máx.',
        source: TYPICAL + ' Carbono no quemado ASTM C114.',
        method: 'ASTM C114 (referencia de método; no ejecutado sobre este lote)',
        note: 'Un LOI alto absorbe aire incorporado y oscurece el concreto.',
      }),
    },
  ],
  morphology: {
    surface: dp('Polvo gris fino, con grumos y racimos de microesferas mate', 'observation', {
      sampleId: 'ML-SMP-00022',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Esferas vítreas, muchas huecas (cenosferas)', 'observation', {
      sampleId: 'ML-SMP-00022',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'ceniza-volante',
        alt: 'Referencia visual de ceniza volante: montículo de polvo gris medio sobre fondo blanco y detalle de microesferas y grumos mate',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Microesferas vítreas', effect: 'Bajan demanda de agua y mejoran fluidez y bombeo', direction: '↑' },
    { property: 'Puzolana lenta, 15–35 %', effect: 'Sustituye clínker y gana resistencia después de 28 días', direction: '↑' },
    { property: 'Menos calor de hidratación', effect: 'Útil en concreto masivo, donde el calor agrieta', direction: '↑' },
    { property: 'No es metacaolín', effect: 'Misma química; origen industrial, más lenta, gris y de volumen', direction: '→' },
    { property: 'LOI y clase F/C', effect: 'El carbono no quemado y la clase cambian el lote: pedir certificado', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el polvo es gris medio, fino, con microgrumos y racimos de esferas mate. No hay ensayo de actividad puzolánica ASTM C311, LOI ASTM C114 ni clasificación F/C publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the powder is medium grey, fine, with micro-clumps and clusters of matte spheres. No ASTM C311 pozzolanic-activity, ASTM C114 LOI or F/C class test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['metacaolin', 'jal-pumita', 'cemento-gris', 'cal'],
  relatedResearch: ['caracterizacion-ceniza-volante'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'ceniza-volante.html',
  techMotion: true,
};
