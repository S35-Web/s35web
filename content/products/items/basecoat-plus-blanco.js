'use strict';

// Misma ficha que Basecoat Plus Gris. Solo cambia el color (blanco absoluto)
// y el saco.

const basecoatPlus = require('../basecoat-plus');

module.exports = basecoatPlus({
  slug: 'basecoat-plus-blanco',
  code: 'FT-PS-001',
  variant: 'Blanco Absoluto',
  color: 'Blanco absoluto',
  colorLower: 'blanco absoluto',
  accent: '#1a1a1a',
  pack: '/Assets/productos_background/basecoat-blanco.png',
  packAlt: 'Saco de 25 kg de Basecoat Plus Blanco Absoluto',
  seo: 'Basecoat Plus Blanco Absoluto: adhesivo y recubrimiento para paneles de cemento, yeso y poliestireno. Color blanco. Interior y exterior. Saco de 25 kg.',
  lead: 'Mortero adhesivo y recubrimiento de la línea Panel System, en blanco absoluto. Misma función que el Gris, en color blanco: base sobre paneles de cemento, yeso y poliestireno que van a recibir texturizado o pintura; adhesivo de placas y molduras de EPS; recubrimiento decorativo de molduras. Interior y exterior. No es un estuco Waxtard, no pega loseta y no sustituye a Styrobond como mortero dedicado del EPS en Pro+.',
  colorPractical: 'Base blanca para el acabado posterior. Elegir blanco absoluto cuando el texturizado o la pintura pide fondo claro.',
});
