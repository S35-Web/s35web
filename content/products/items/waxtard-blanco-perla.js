'use strict';

// Contenido tomado de la ficha técnica oficial "Ficha Tecnica - Waxtard Blanco
// Perla" (Rev. 01 · 2026). Blanco Absoluto y Gris reutilizan estos datos.

const waxtardPremium = require('../waxtard-premium');

module.exports = waxtardPremium({
  slug: 'waxtard-blanco-perla',
  code: 'FT-PR-001',
  variant: 'Blanco Perla',
  accent: '#2f7d32',
  packSrc: '/Assets/productos_background/WAXTARD-blanco-perla.png',
  packAlt: 'Saco de 25 kg de Waxtard Blanco Perla',
  seo: 'Waxtard Blanco Perla: estuco premium hidrófugo y antisalitre para exteriores e interiores. Repele el agua líquida sin cerrar el paso al vapor. Saco de 25 kg.',
  lead: 'Mortero seco de acabado, listo para amasar con agua. Da un acabado blanco perla terso y, al mismo tiempo, repele el agua líquida sin cerrar el paso al vapor: el muro sigue respirando mientras la lluvia y el salitre se quedan afuera. Formulado para aplicarse a mano o proyectado en espesores delgados, sobre repellos, block, concreto y sistemas de fachada. Aporta un acabado tono blanco perla cálido con matices minerales naturales, ideal para acabados aparentes rústicos o contemporáneos, o como base estabilizada para pintura.',
  aggregateAporta: 'Cuerpo, blancura y textura del acabado.',
  finishProblem: ['Acabado gris o desigual', 'Base blanco perla estable, lista para pintar o dejar aparente.'],
  aspectoValue: 'Polvo blanco perla · acabado mate',
  aspectoPractical: 'Se puede dejar aparente o usar como base de pintura sin sellador previo.',
});
