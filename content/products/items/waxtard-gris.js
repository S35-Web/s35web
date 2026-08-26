'use strict';

// Misma ficha que Waxtard Blanco Perla. Cambia el color (gris) y el saco.

const waxtardPremium = require('../waxtard-premium');

module.exports = waxtardPremium({
  slug: 'waxtard-gris',
  code: 'FT-PR-003',
  variant: 'Gris',
  accent: '#3d3d3d',
  packSrc: '/Assets/productos_background/WAXTARD-gris.png',
  packAlt: 'Saco de 25 kg de Waxtard Gris',
  seo: 'Waxtard Gris: estuco premium hidrófugo y antisalitre para exteriores e interiores. Color gris. Repele el agua líquida sin cerrar el paso al vapor. Saco de 25 kg.',
  lead: 'Mortero seco de acabado, listo para amasar con agua. Da un acabado gris terso y, al mismo tiempo, repele el agua líquida sin cerrar el paso al vapor: el muro sigue respirando mientras la lluvia y el salitre se quedan afuera. Formulado para aplicarse a mano o proyectado en espesores delgados, sobre repellos, block, concreto y sistemas de fachada. Aporta un acabado tono gris mineral, ideal para acabados aparentes rústicos o contemporáneos, o como base estabilizada para recubrimiento.',
  aggregateAporta: 'Cuerpo, tono gris y textura del acabado.',
  finishProblem: ['Tono irregular entre paños', 'Base gris mineral estable; un paño de prueba fija el criterio de obra.'],
  aspectoValue: 'Polvo gris · acabado mate',
  aspectoPractical: 'Se puede dejar aparente o usar como base de recubrimiento. El color es gris.',
});
