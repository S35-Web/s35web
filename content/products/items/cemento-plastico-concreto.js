'use strict';

const { draft, storagePairs, NOTICE_VERIFIED } = require('../sheet');

// Contenido tomado de la ficha publicada de Cemento Plástico Concreto Aparente.

module.exports = draft({
  slug: 'cemento-plastico-concreto',
  code: 'FT-MC-001',
  family: 'microconcretos',
  status: 'verified',
  name: 'CEMENTO PLÁSTICO',
  variant: 'Concreto Aparente',
  line: 'Microconcreto de acabado · Dolphin Fin',
  accent: '#5a5a5a',
  packaging: '25 kg',
  description: 'Cemento Plástico Concreto Aparente: microconcreto de acabado en capas delgadas, tono Dolphin Fin. Muros, pisos de tránsito ligero y mobiliario. Saco de 25 kg.',
  strip: [
    'Microconcreto de acabado · Dolphin Fin',
    'Capas delgadas a llana · saco de 25 kg',
  ],
  lead: 'Microconcreto de acabado aparente aplicado en capas delgadas a llana. Se pule para obtener un acabado continuo tono Dolphin Fin (gris pulido). No es aplanado grueso ni un adhesivo flexible. La variación de tono es propia del concreto aparente, no un defecto.',
  pack: '/Assets/productos_background/cemento-plastico.png',
  packAlt: 'Saco de 25 kg de Cemento Plástico Concreto Aparente',
  identification: [
    { label: 'Tipo de producto', value: 'Microconcreto de acabado aparente' },
    { label: 'Color', value: 'Dolphin Fin · gris pulido' },
    { label: 'Función', value: 'Acabado continuo en capas delgadas, muros, pisos y detalle' },
  ],
  kpis: [
    { value: '25 kg', label: 'saco · producto seco' },
    { value: 'Solo agua', label: 'consistencia de llana' },
    { value: 'Delgadas', label: 'varias manos a llana' },
    { value: 'Pulido', label: 'acabado continuo aparente' },
  ],
  sections: [
    {
      kind: 'prose',
      n: '1.0',
      title: 'Cómo funciona',
      prose: [
        'Se aplica en capas delgadas y se pule. El resultado es un paño continuo con el aspecto de concreto aparente, sin los espesores de un aplanado convencional.',
        'La variación de tono entre paños y lotes es característica del acabado mineral. No es un recubrimiento elástico ni un adhesivo de pieza.',
      ],
    },
    {
      kind: 'items',
      n: '2.0',
      title: 'Usos y aplicaciones',
      items: [
        { title: 'Muros y plafones.', text: 'Interiores. Acabado continuo pulido.' },
        { title: 'Pisos y firmes.', text: 'Tránsito residencial y comercial ligero.' },
        { title: 'Mobiliario y detalle.', text: 'Cubiertas de cocina y baño, barras y escaleras.' },
        { title: 'No aplicar sobre.', text: 'Sustratos flexibles, pintura suelta, madera sin refuerzo, plástico, humedad activa ni inmersión permanente.' },
      ],
    },
    {
      kind: 'steps',
      n: '3.0',
      title: 'Modo de empleo',
      steps: [
        { title: '1. Preparar.', text: 'Sustrato firme, limpio y estable. Solo agua, a consistencia de trabajo para llana. No añadir arena, cal ni cemento.' },
        { title: '2. Aplicar.', text: 'Capas delgadas a llana, varias manos. Dejar tomar la anterior antes de la siguiente.' },
        { title: '3. Acabar.', text: 'Pular para obtener el paño continuo. Proteger del secado violento las primeras horas.' },
        { title: '4. Tono.', text: 'La variación de tono es propia del concreto aparente; un paño de prueba define el criterio del proyecto.' },
      ],
    },
    {
      kind: 'pairs',
      n: '4.0',
      title: 'Manejo y almacenamiento',
      pairs: storagePairs('bag'),
    },
    {
      kind: 'notes',
      n: 'Anexo',
      title: 'Datos de interés',
      notes: [
        'No es aplanado grueso: el espesor de trabajo es el de un microconcreto de acabado.',
        'No sustituye un sistema impermeable ni un recubrimiento para inmersión.',
        'Dolphin Fin es el tono de referencia; el mineral y el pulido mueven el gris de un paño a otro.',
      ],
    },
  ],
  notice: NOTICE_VERIFIED,
});
