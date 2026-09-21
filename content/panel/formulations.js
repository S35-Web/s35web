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
    status: 'lote-planta',
    note: 'Dosificación de planta por lote (755.5 kg → ~30 sacos).',
  }),
  dryMortar({
    product: 'waxtard-blanco-absoluto',
    water: '6.0–7.0 L / saco 25 kg',
    cement: ['cemento-blanco'],
    aggregate: ['marmolina-fina'],
    filler: ['carbonato-de-calcio'],
    admixture: FINISH_ADMIX,
    pigment: ['dioxido-de-titanio'],
    status: 'lote-planta',
    note: 'Dosificación de planta por lote (729 kg → ~29 sacos).',
  }),
  dryMortar({
    product: 'waxtard-gris',
    water: '6.0–7.0 L / saco 25 kg',
    cement: ['cemento-gris'],
    aggregate: ['arena-silicea-graduada'],
    filler: ['carbonato-de-calcio'],
    admixture: FINISH_ADMIX,
    status: 'lote-planta',
    note: 'Dosificación de planta por lote (754 kg → ~30 sacos).',
  }),
  dryMortar({
    product: 'waxtard-extra-anclaje',
    water: 'Solo agua, consistencia de trabajo',
    cement: ['cemento-blanco'],
    aggregate: ['marmolina-fina'],
    filler: ['carbonato-de-calcio'],
    admixture: FINISH_ADMIX,
    pigment: ['dioxido-de-titanio'],
    status: 'lote-planta',
    note: 'Dosificación de planta por lote (793 kg → ~31.72 sacos).',
  }),
  dryMortar({
    product: 'cemento-plastico-concreto',
    water: 'Solo agua, consistencia de llana',
    cement: ['cemento-gris'],
    filler: ['carbonato-de-calcio'],
    admixture: [
      ['polimero-redispersable-vae', 'Polímero redispersable'],
      ['celulosa-hpmc', 'Retención de agua / reología'],
    ],
    status: 'lote-planta',
    note: 'Dosificación de planta por lote (529.5 kg → ~21.18 sacos). TALCO 200 → marmolina-talco-200 (malla 200).',
    notesOnMix: ['Tono Dolphin Fin: el gris pulido sale del cemento y la carga, no de un colorante de recubrimiento.'],
  }),
  dryMortar({
    product: 'basecoat-plus-gris',
    water: '6.1 L llana / 7.5 L proyección · saco 25 kg',
    cement: ['cemento-gris'],
    aggregate: ['marmolina-fina'],
    filler: ['carbonato-de-calcio'],
    admixture: TILE_ADMIX,
    status: 'lote-planta',
    note: 'Dosificación de planta por lote (841.75 kg → ~33.67 sacos). TALCO NORMAL → marmolina-talco-100 (misma regla FT-PS-001).',
    notesOnMix: [
      'Arbocel → arbocel-celulosa (fibra de celulosa de planta).',
      'Mortero de planta (plantId mortero) sin ficha de Laboratorio.',
    ],
  }),
  dryMortar({
    product: 'basecoat-plus-blanco',
    water: '6.1 L llana / 7.5 L proyección · saco 25 kg',
    cement: ['cemento-blanco'],
    aggregate: ['marmolina-fina'],
    filler: ['carbonato-de-calcio'],
    admixture: TILE_ADMIX,
    pigment: ['dioxido-de-titanio'],
    status: 'lote-planta',
    note: 'Dosificación de planta por lote (842.5 kg → ~33.7 sacos). TALCO NORMAL → marmolina-talco-100 (no hay talco sin malla en catálogo de planta).',
    notesOnMix: ['Arbocel → arbocel-celulosa (fibra de celulosa de planta).'],
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
    cement: ['cemento-gris', 'cal'],
    aggregate: ['arena-silicea-graduada', 'marmolina-fina', 'jal-pumita'],
    filler: ['carbonato-de-calcio'],
    admixture: [
      ['polimero-redispersable-vae', 'Polímero redispersable'],
      ['celulosa-hpmc', 'Reología de autonivelado (grado baja viscosidad)'],
    ],
    status: 'lote-planta',
    note: 'Dosificación de planta por lote (518.2 kg → ~14.81 sacos de 35 kg). PELOS DE FIBRA → fibra-de-polipropileno. TALCO 100 → marmolina-talco-100. JAL CRIBADO → jal-cribado (labSlug jal-pumita). CAL → calidra.',
    notesOnMix: ['Mortero de planta (plantId mortero) sin ficha de Laboratorio.'],
  }),
  dryMortar({
    product: 'pegaxpress-block',
    water: 'Solo agua',
    cement: ['cemento-gris', 'cal'],
    aggregate: ['arena-silicea-graduada'],
    filler: ['carbonato-de-calcio'],
    status: 'lote-planta',
    note: 'Dosificación de planta por lote (775 kg → ~25.83 sacos de 30 kg). ARENA → arena-cribada-fina (equivalente genérico). TALCO 100 → marmolina-talco-100.',
  }),
  dryMortar({
    product: 'ceramico',
    water: 'Solo agua',
    cement: ['cemento-gris', 'cal'],
    aggregate: ['arena-silicea-graduada'],
    filler: ['carbonato-de-calcio'],
    admixture: [
      ['polimero-redispersable-vae', 'Polímero redispersable'],
      ['celulosa-hpmc', 'Retención de agua / reología'],
    ],
    status: 'lote-planta',
    note: 'Dosificación de planta por lote (869 kg → ~34.76 sacos). ARENA DESHIDRATADA FINA → arena-deshidratada (única deshidratada en catálogo). TALCO 100 → marmolina-talco-100.',
    notesOnMix: ['Mortero de planta (plantId mortero) sin ficha de Laboratorio.'],
  }),
  dryMortar({
    product: 'porcelanico-universal',
    water: 'Solo agua',
    cement: ['cemento-gris', 'cal'],
    aggregate: ['marmolina-fina'],
    filler: ['carbonato-de-calcio'],
    admixture: [
      ['polimero-redispersable-vae', 'Polímero redispersable'],
      ['celulosa-hpmc', 'Retención de agua / reología'],
    ],
    status: 'lote-planta',
    note: 'Dosificación de planta por lote (748.6 kg → ~29.94 sacos). CAL → calidra. TALCO NORMAL → marmolina-talco-100 (misma regla FT-PS-001).',
    notesOnMix: ['Mortero de planta (plantId mortero) sin ficha de Laboratorio.'],
  }),
  dryMortar({
    product: 'pegaxpress-psp',
    water: 'Solo agua',
    cement: ['cemento-gris', 'cal'],
    aggregate: ['arena-silicea-graduada', 'marmolina-fina'],
    admixture: [
      ['polimero-redispersable-vae', 'Polímero redispersable'],
      ['celulosa-hpmc', 'Retención de agua / reología'],
    ],
    status: 'lote-planta',
    note: 'Dosificación de planta por lote (750.6 kg → ~30.02 sacos). CAL → calidra. ARENA DESHIDRATADA → arena-deshidratada.',
    notesOnMix: ['Mortero de planta (plantId mortero) sin ficha de Laboratorio.'],
  }),
  dryMortar({
    product: 'ultraforce',
    water: 'Solo agua',
    cement: ['cemento-gris', 'cal'],
    aggregate: ['arena-silicea-graduada'],
    filler: ['carbonato-de-calcio'],
    admixture: [
      ['polimero-redispersable-vae', 'Polímero redispersable'],
      ['celulosa-hpmc', 'Retención de agua / reología'],
    ],
    status: 'lote-planta',
    note: 'Dosificación de planta por lote (758.6 kg → ~30.34 sacos). CAL → calidra. TALCO NORMAL → marmolina-talco-100 (misma regla FT-PS-001). ARENA DESHIDRATADA → arena-deshidratada.',
    notesOnMix: ['Mortero de planta (plantId mortero) sin ficha de Laboratorio.'],
  }),
  liquidMix({
    product: 'nanotech-hidrofobico',
    note: 'Sellador hidrofóbico líquido. Receta de planta (activos, solvente o vehículo) pendiente de cargar.',
  }),
  liquidMix({
    product: 'sellador-premium-pintura',
    note: 'Sellador premium adhesivo (FT-PR-008 Litro / FT-PC-008 Cubeta). Receta de planta pendiente de cargar.',
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
