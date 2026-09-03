'use strict';

// Mapas internos de formulación para el panel Colaboradores.
// Cada receta lista materias primas del archivo de Laboratorio por función.
// Las dosis de saco se editan en el panel (localStorage) y no se publican aquí.

function item(slug, role, extra) {
  return Object.assign({ slug: slug, role: role }, extra || {});
}

function dryMortar(opts) {
  const items = [];
  (opts.cement || []).forEach(function (slug) {
    items.push(item(slug, 'Cementante'));
  });
  (opts.aggregate || []).forEach(function (slug) {
    items.push(item(slug, 'Agregado'));
  });
  (opts.filler || []).forEach(function (slug) {
    items.push(item(slug, 'Carga'));
  });
  (opts.mineral || []).forEach(function (slug) {
    items.push(item(slug, 'Mineral funcional'));
  });
  (opts.admixture || []).forEach(function (pair) {
    items.push(item(pair[0], pair[1]));
  });
  (opts.pigment || []).forEach(function (slug) {
    items.push(item(slug, 'Pigmento'));
  });
  (opts.notesOnMix || []).forEach(function (text) {
    items.push({ slug: null, role: 'Nota de mezcla', note: text });
  });
  return {
    product: opts.product,
    kind: 'seco',
    water: opts.water || '',
    status: opts.status || 'mapa-funcional',
    note: opts.note || 'Mapa de materias primas por función. La dosificación de planta es información propietaria.',
    items: items,
  };
}

function liquidMix(opts) {
  return {
    product: opts.product,
    kind: 'liquido',
    water: opts.water || '',
    status: 'pendiente',
    note: opts.note || 'Producto líquido en cubeta. Receta de planta pendiente de cargar.',
    items: opts.items || [],
  };
}

const FINISH_ADMIX = [
  ['polimero-redispersable-vae', 'Polímero redispersable'],
  ['celulosa-hpmc', 'Retención de agua / reología'],
  ['eter-de-almidon', 'Antideslizamiento'],
];

const TILE_ADMIX = [
  ['polimero-redispersable-vae', 'Polímero redispersable'],
  ['celulosa-hpmc', 'Retención de agua / reología'],
  ['eter-de-almidon', 'Antideslizamiento'],
];

module.exports = [
  dryMortar({
    product: 'waxtard-blanco-perla',
    water: '6.0–7.0 L / saco 25 kg',
    cement: ['cemento-blanco'],
    aggregate: ['marmolina-fina'],
    filler: ['carbonato-de-calcio'],
    admixture: FINISH_ADMIX,
    pigment: ['dioxido-de-titanio'],
  }),
  dryMortar({
    product: 'waxtard-blanco-absoluto',
    water: '6.0–7.0 L / saco 25 kg',
    cement: ['cemento-blanco'],
    aggregate: ['marmolina-fina'],
    filler: ['carbonato-de-calcio'],
    admixture: FINISH_ADMIX,
    pigment: ['dioxido-de-titanio'],
  }),
  dryMortar({
    product: 'waxtard-gris',
    water: '6.0–7.0 L / saco 25 kg',
    cement: ['cemento-gris'],
    aggregate: ['marmolina-fina'],
    filler: ['carbonato-de-calcio', 'dolomita'],
    admixture: FINISH_ADMIX,
  }),
  dryMortar({
    product: 'waxtard-extra-anclaje',
    water: 'Solo agua, consistencia de trabajo',
    cement: ['cemento-blanco'],
    aggregate: ['marmolina-fina', 'arena-silicea-graduada'],
    filler: ['carbonato-de-calcio'],
    mineral: ['metacaolin'],
    admixture: FINISH_ADMIX,
    pigment: ['dioxido-de-titanio'],
    note: 'Anclaje químico sobre sustrato liso: más polímero y metacaolín que un Waxtard de absorbente. Dosificación de planta pendiente.',
  }),
  dryMortar({
    product: 'cemento-plastico-concreto',
    water: 'Solo agua, consistencia de llana',
    cement: ['cemento-gris'],
    aggregate: ['marmolina-fina', 'arena-de-cuarzo'],
    filler: ['carbonato-de-calcio'],
    mineral: ['metacaolin'],
    admixture: [
      ['polimero-redispersable-vae', 'Polímero redispersable'],
      ['celulosa-hpmc', 'Retención de agua / reología'],
    ],
    pigment: ['oxido-de-hierro-rojo'],
    notesOnMix: ['Tono Dolphin Fin: el gris pulido sale del cemento y la carga, no de un colorante de recubrimiento.'],
  }),
  dryMortar({
    product: 'basecoat-plus-gris',
    water: '6.1 L llana / 7.5 L proyección · saco 25 kg',
    cement: ['cemento-gris'],
    aggregate: ['arena-silicea-graduada'],
    filler: ['carbonato-de-calcio'],
    admixture: TILE_ADMIX,
    notesOnMix: ['Microfibras de refuerzo: aún no hay ficha de fibra en Laboratorio.'],
  }),
  dryMortar({
    product: 'basecoat-plus-blanco',
    water: '6.1 L llana / 7.5 L proyección · saco 25 kg',
    cement: ['cemento-blanco'],
    aggregate: ['arena-silicea-graduada'],
    filler: ['carbonato-de-calcio'],
    admixture: TILE_ADMIX,
    pigment: ['dioxido-de-titanio'],
    notesOnMix: ['Microfibras de refuerzo: aún no hay ficha de fibra en Laboratorio.'],
  }),
  dryMortar({
    product: 'styrobond-pro',
    water: 'Solo agua',
    cement: ['cemento-gris'],
    aggregate: ['arena-silicea-graduada'],
    filler: ['carbonato-de-calcio'],
    admixture: TILE_ADMIX,
    notesOnMix: ['Microfibras para recubrimiento de EPS: ficha de fibra pendiente.'],
  }),
  dryMortar({
    product: 'leveltec-pro',
    water: '4.0 L / saco 35 kg',
    cement: ['cemento-gris'],
    aggregate: ['arena-silicea-graduada'],
    filler: ['carbonato-de-calcio'],
    admixture: [
      ['polimero-redispersable-vae', 'Polímero redispersable'],
      ['celulosa-hpmc', 'Reología de autonivelado (grado baja viscosidad)'],
    ],
  }),
  dryMortar({
    product: 'pegaxpress-block',
    water: 'Solo agua',
    cement: ['cemento-gris'],
    aggregate: ['arena-silicea-graduada'],
    filler: ['carbonato-de-calcio'],
    admixture: TILE_ADMIX,
  }),
  dryMortar({
    product: 'ceramico',
    water: 'Solo agua',
    cement: ['cemento-gris'],
    aggregate: ['arena-silicea-graduada'],
    filler: ['carbonato-de-calcio', 'caolin'],
    admixture: TILE_ADMIX,
  }),
  dryMortar({
    product: 'porcelanico-universal',
    water: 'Solo agua',
    cement: ['cemento-gris'],
    aggregate: ['arena-silicea-graduada'],
    filler: ['carbonato-de-calcio'],
    admixture: TILE_ADMIX,
    note: 'Tipo C: más polímero que el Cerámico. Dosificación de planta pendiente.',
  }),
  dryMortar({
    product: 'pegaxpress-psp',
    water: 'Solo agua',
    cement: ['cemento-gris'],
    aggregate: ['arena-silicea-graduada'],
    filler: ['carbonato-de-calcio'],
    admixture: TILE_ADMIX,
  }),
  dryMortar({
    product: 'ultraforce',
    water: 'Solo agua',
    cement: ['cemento-gris', 'cemento-aluminato-de-calcio'],
    aggregate: ['arena-silicea-graduada'],
    filler: ['carbonato-de-calcio'],
    mineral: ['microsilice'],
    admixture: TILE_ADMIX,
    note: 'Tipo C semiflexible. CAC y microsílice entran como mapa funcional, no como receta de saco.',
  }),
  liquidMix({
    product: 'nanotech-hidrofobico',
    note: 'Sellador hidrofóbico líquido. Receta de planta (activos, solvente o vehículo) pendiente de cargar.',
  }),
  liquidMix({
    product: 'sellador-premium-pintura',
    note: 'Sellador líquido para pintura. Receta de planta pendiente de cargar.',
  }),
  liquidMix({
    product: 'adhesivo-darawell',
    note: 'Adhesivo líquido. Receta de planta pendiente de cargar.',
  }),
  liquidMix({
    product: 'adhesivo-heavy-duty',
    note: 'Adhesivo líquido de alto desempeño. Receta de planta pendiente de cargar.',
  }),
];
