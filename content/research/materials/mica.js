const { dp } = require('../dp');

const TYPICAL =
  'Perfil típico de mica (moscovita molida) de grado industrial, compilado en briefing interno S-35 FT-MP-033. Valores típicos de comercio/norma (ASTM D6721, ASTM C188, ASTM D149), no ensayo de este lote. No se publica yacimiento.';

module.exports = {
  code: 'ML-FIL-004',
  slug: 'mica',
  slugEn: 'mica',
  name: { es: 'Mica', en: 'Mica' },
  scientificName: 'Potassium aluminium phyllosilicate (muscovite group)',
  category: 'FIL',
  classLabel: { es: 'MINERAL LAMINAR', en: 'LAMELLAR MINERAL' },
  status: 'documented',
  revision: 1,
  publishedAt: '2026-08-27',
  updatedAt: '2026-08-27',
  revisionHistory: [
    { rev: 1, date: '2026-08-27', change: 'Primera ficha pública: referencia visual y perfil típico de mica. Sin ensayo de lote.' },
  ],
  summary: {
    es: 'Filosilicato de aluminio y potasio, grupo de la moscovita. Mineral que se exfolia en láminas ultrafinas, flexibles y de brillo metálico natural. Molida, aporta un efecto perlado o metálico y un armado laminar en la matriz que ninguna carga esférica reproduce, sin participar en reacciones químicas.\n\nComo el talco, tiene estructura en láminas, pero aquí la relación de aspecto es mucho más alta (50:1 a 200:1) y las placas son elásticas, no blandas. Orientadas paralelas a la superficie, cada lámina actúa como un espejo y, a la vez, como barrera al paso de agua o vapor. El talco lubrica y es mate; el caolín da blancura; la mica brilla y arma.\n\nLos números de esta ficha (malla 60–325, densidad 2.7–3.0 g/cm³, dureza Mohs 2–2.5, estabilidad hasta ~500 °C) son valores típicos de mica comercial según ASTM D6721, no un análisis de este saco. Donde el archivo no tiene dato de lote, se lee NOT YET MEASURED.\n\nLaboratorio publica lo que se sabe de la materia prima. No publica la dosificación con la que S-35 la convierte en un recubrimiento.',
    en: 'Potassium aluminium phyllosilicate, muscovite group. A mineral that splits into ultra-thin, flexible sheets with a natural metallic lustre. Ground, it gives a pearlescent or metallic effect and a laminar barrier that no spherical filler can match, without taking part in chemical reactions.\n\nLike talc it is sheet-structured, but here the aspect ratio is much higher (50:1 to 200:1) and the plates are elastic, not soft. Oriented parallel to the surface, each flake acts as a mirror and as a barrier to water or vapour. Talc lubricates and is matte; kaolin gives whiteness; mica shines and reinforces.\n\nFigures in this file (mesh, density, Mohs hardness, thermal stability) are typical commercial values for mica (ASTM D6721), not an assay of this lot. Unmeasured lot properties are marked NOT YET MEASURED.',
  },
  origin: dp('Filosilicato de aluminio y potasio, grupo de la moscovita', 'observation', {
    note: 'Clase comercial. No se publica yacimiento ni marca.',
    sampleId: 'ML-SMP-00029',
    date: '2026-08-27',
  }),
  physical: {
    bulkDensity: dp(null, 'in-progress', { unit: 'g/cm³', note: 'NOT YET MEASURED on this lot' }),
    specificGravity: dp([2.7, 3.0], 'reference', {
      unit: 'g/cm³',
      source: TYPICAL + ' Densidad real típica ASTM C188; no es densidad de este lote.',
      method: 'ASTM C188 (referencia de método; no ejecutado sobre este lote)',
    }),
    hardnessMohs: dp([2, 2.5], 'reference', {
      source: TYPICAL + ' Dureza Mohs típica de moscovita.',
    }),
    color: dp('Gris claro plateado, escamas con brillo nacarado', 'observation', {
      sampleId: 'ML-SMP-00029',
      date: '2026-08-27',
      method: 'Referencia visual',
    }),
    structure: dp('Láminas flexibles de alta relación de aspecto, brillo metálico', 'observation', {
      sampleId: 'ML-SMP-00029',
      date: '2026-08-27',
      method: 'Visual',
    }),
    grainRange: dp('Malla 60 – 325', 'reference', {
      source: TYPICAL + ' Rango comercial de malla; no es granulometría de este lote.',
    }),
  },
  chemical: [],
  morphology: {
    surface: dp('Escamas gris plateadas, planas, con brillo nacarado y bordes irregulares', 'observation', {
      sampleId: 'ML-SMP-00029',
      date: '2026-08-27',
      method: 'Referencia visual de presentación habitual',
    }),
    geometry: dp('Placas delgadas, flexibles, de relación de aspecto 50:1 a 200:1', 'observation', {
      sampleId: 'ML-SMP-00029',
      date: '2026-08-27',
    }),
    voidStructure: dp(null, 'in-progress', { note: 'MICROGRAPHY PENDING — SEM imaging not yet performed' }),
  },
  images: {
    macro: [
      {
        id: 'mica',
        alt: 'Referencia visual de mica: montículo de escamas gris plateadas sobre fondo blanco y detalle de láminas translúcidas con brillo nacarado',
        width: 1536,
        height: 1024,
      },
    ],
  },
  whyItMatters: [
    { property: 'Relación de aspecto 50:1 a 200:1', effect: 'Armado laminar: barrera al vapor y orientación paralela a la superficie', direction: '↑' },
    { property: 'Brillo perlado / metálico', effect: 'Cada lámina refleja luz; efecto visual que el talco no da', direction: '↑' },
    { property: 'Láminas flexibles', effect: 'Se orientan sin fracturarse como una placa rígida', direction: '↑' },
    { property: 'Distinta del talco', effect: 'Firme y brillante; el talco es mate, grasoso y blando', direction: '→' },
    { property: 'Carga funcional, no cementante', effect: 'Decorativa y de barrera; la malla define destello o brillo sutil', direction: '→' },
  ],
  labNotes: [
    {
      date: '2026-08-27',
      text: {
        es: 'La FIG. A es una referencia visual de presentación habitual, no la fotografía de un lote ensayado. En esa referencia el material es escamas gris plateadas, planas, con brillo nacarado. No hay ensayo de malla ASTM D6721, densidad ASTM C188 ni resistencia dieléctrica ASTM D149 publicado de este saco.',
        en: 'FIG. A is a visual reference of typical appearance, not a photograph of a tested lot. In that reference the material is silver-grey, flat flakes with a pearlescent lustre. No ASTM D6721 mesh, ASTM C188 density or ASTM D149 dielectric test of this bag is published.',
      },
    },
  ],
  relatedMaterials: ['talco-silicato', 'caolin', 'carbonato-de-calcio'],
  relatedResearch: ['caracterizacion-mica'],
  applicationHref: '/catalogo.html',
  applicationLabel: 'Sistemas de recubrimiento S-35',
  techFile: 'mica.html',
  techMotion: true,
};
