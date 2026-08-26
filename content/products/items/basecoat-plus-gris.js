'use strict';

// Ficha de Basecoat Plus Gris. El PDF de referencia es el de tono gris;
// Blanco Absoluto reutiliza estos datos y solo cambia el color.

const basecoatPlus = require('../basecoat-plus');

module.exports = basecoatPlus({
  slug: 'basecoat-plus-gris',
  code: 'FT-PS-002',
  variant: 'Gris',
  color: 'Gris',
  colorLower: 'gris',
  accent: '#4a4a4a',
  pack: '/Assets/productos_background/basecoat.png',
  packAlt: 'Saco de 25 kg de Basecoat Plus Gris',
  seo: 'Basecoat Plus Gris: adhesivo y recubrimiento para paneles de cemento, yeso y poliestireno. Interior y exterior. Saco de 25 kg.',
  lead: 'Mortero adhesivo y recubrimiento de la línea Panel System, en gris. Base cemento con resinas y microfibras: sirve como base sobre paneles de cemento, yeso y poliestireno que van a recibir texturizado o pintura; como adhesivo de placas y molduras de EPS; y como recubrimiento decorativo de molduras. Interior y exterior.',
  colorPractical: 'Tono gris de la capa de protección. Elegir gris cuando el acabado posterior no pide fondo blanco.',
});
