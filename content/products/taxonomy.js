'use strict';

// Familias de producto S-35, en el orden en que deben aparecer en el catálogo
// y en el índice de /productos.
const FAMILIES = [
  {
    id: 'estucos-premium',
    name: 'Estucos premium',
    note: 'Estucos hidrófugos de acabado, línea Waxtard.',
  },
  {
    id: 'microconcretos',
    name: 'Microconcretos',
    note: 'Acabados de concreto aparente aplicados en capas delgadas.',
  },
  {
    id: 'panel-system',
    name: 'Panel System',
    note: 'Adhesivos y recubrimientos para sistemas de panel, fachada y placas de poliestireno.',
  },
  {
    id: 'pro-systems',
    name: 'Pro+ Systems',
    note: 'Sistemas profesionales de pegado y nivelación.',
  },
  {
    id: 'adhesivos-pro',
    name: 'Adhesivos PRO+',
    note: 'Adhesivos en seco de la línea Pegaxpress para piezas de acabado.',
  },
  {
    id: 'liquidos',
    name: 'Líquidos',
    note: 'Selladores y adhesivos líquidos, en cubeta.',
  },
];

const FAMILY_BY_ID = FAMILIES.reduce(function (acc, f) {
  acc[f.id] = f;
  return acc;
}, {});

// `verified` = contenido tomado de la ficha técnica oficial del producto.
// `draft`    = redacción interna pendiente de revisión comercial.
const STATUS = {
  verified: { label: 'Ficha verificada' },
  draft: { label: 'Borrador por revisar' },
};

module.exports = { FAMILIES, FAMILY_BY_ID, STATUS };
