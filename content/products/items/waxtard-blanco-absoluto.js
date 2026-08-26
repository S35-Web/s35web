'use strict';

// Misma ficha que Waxtard Blanco Perla. Cambia el color (blanco intenso) y el saco.

const waxtardPremium = require('../waxtard-premium');

module.exports = waxtardPremium({
  slug: 'waxtard-blanco-absoluto',
  code: 'FT-PR-002',
  variant: 'Blanco Absoluto',
  accent: '#c62828',
  packSrc: '/Assets/productos_background/WAXTARD-BLANCO-ABSOLUTO.png',
  packAlt: 'Saco de 25 kg de Waxtard Blanco Absoluto',
  seo: 'Waxtard Blanco Absoluto: estuco premium hidrófugo y antisalitre para exteriores e interiores. Color blanco intenso. Repele el agua líquida sin cerrar el paso al vapor. Saco de 25 kg.',
  lead: 'Mortero seco de acabado, listo para amasar con agua. Da un acabado blanco intenso, más limpio y uniforme, y, al mismo tiempo, repele el agua líquida sin cerrar el paso al vapor: el muro sigue respirando mientras la lluvia y el salitre se quedan afuera. Formulado para aplicarse a mano o proyectado en espesores delgados, sobre repellos, block, concreto y sistemas de fachada. Aporta un acabado tono blanco intenso, ideal para acabados aparentes contemporáneos, o como base estabilizada para pintura.',
  aggregateAporta: 'Cuerpo, blancura y textura del acabado.',
  finishProblem: ['Acabado gris o desigual', 'Base blanco intenso estable, lista para pintar o dejar aparente.'],
  aspectoValue: 'Polvo blanco intenso · acabado mate',
  aspectoPractical: 'Se puede dejar aparente o usar como base de pintura sin sellador previo. El blanco intenso es más limpio y uniforme que el Blanco Perla.',
});
