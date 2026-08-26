'use strict';

const { draft, storagePairs, NOTICE_VERIFIED } = require('../sheet');

// Contenido tomado de la ficha publicada de Waxtard Extra Anclaje (EIFS Extra
// Anclaje). El saco es el de EIFS / Extra Anclaje; no se usa el de Estuco Base.

module.exports = draft({
  slug: 'waxtard-extra-anclaje',
  code: 'FT-PR-004',
  family: 'estucos-premium',
  status: 'verified',
  name: 'WAXTARD',
  variant: 'Extra Anclaje',
  line: 'Estuco hidrófugo fino con anclaje químico',
  accent: '#0060a8',
  packaging: '25 kg',
  description: 'Waxtard Extra Anclaje: estuco hidrófugo fino con anclaje químico para sustratos lisos, concreto cimbrado, EIFS y pintura firme. Saco de 25 kg.',
  strip: [
    'Estuco hidrófugo fino · anclaje químico',
    'Para sustratos lisos · saco de 25 kg',
  ],
  lead: 'Estuco para sustrato de baja o nula absorción. Ancla químicamente sin necesidad de picar el sustrato ni aplicar un puente adhesivo aparte. Acabado blanco perla, fino. Pensado para superficies lisas o poco porosas: concreto cimbrado, prefabricado, sistemas EIFS/panel, pintura firme y azulejo o vitrificado sin picar.',
  pack: '/Assets/productos_background/WAXTARD-extra-anclaje.jpg',
  packAlt: 'Saco de 25 kg de Waxtard Extra Anclaje (EIFS Extra Anclaje)',
  identification: [
    { label: 'Tipo de producto', value: 'Estuco hidrófugo fino con anclaje químico' },
    { label: 'Función', value: 'Acabado sobre sustratos lisos o de baja absorción' },
    { label: 'También conocido como', value: 'EIFS Extra Anclaje' },
  ],
  kpis: [
    { value: '25 kg', label: 'saco · producto seco' },
    { value: 'Solo agua', label: 'amasado, sin aditivos ajenos' },
    { value: 'Fino', label: 'acabado blanco perla' },
    { value: 'Sin picar', label: 'anclaje químico al sustrato liso' },
  ],
  sections: [
    {
      kind: 'prose',
      n: '1.0',
      title: 'Cómo funciona',
      prose: [
        'El mortero lleva un sistema de anclaje químico pensado para superficies donde un estuco convencional no agarra: concreto liso de cimbra, paneles, pintura bien adherida o vitrificados. No hace falta picar ni poner un puente aparte.',
        'Es un estuco de acabado. Para block, zarpeo y sustratos absorbentes el producto correcto es Waxtard Blanco Perla.',
      ],
    },
    {
      kind: 'items',
      n: '2.0',
      title: 'Usos y sustratos',
      items: [
        { title: 'Concreto liso o cimbrado.', text: 'Muros y plafones de concreto aparente o descimbrado, sin picar.' },
        { title: 'Concreto prefabricado y paneles.', text: 'Piezas de baja absorción y sistemas EIFS / panel.' },
        { title: 'Pintura firme y vitrificados.', text: 'Pintura bien adherida, azulejo o vitrificado limpio, sin picar.' },
        { title: 'No aplicar sobre.', text: 'Pintura suelta o descascarada, esmaltes brillantes sin lijar, yeso, madera, plástico, humedad activa.' },
      ],
    },
    {
      kind: 'steps',
      n: '3.0',
      title: 'Modo de empleo',
      steps: [
        { title: '1. Preparar el sustrato.', text: 'Limpio, firme, sin polvo ni pintura suelta. Si la pintura está suelta, no pega: hay que retirarla. Los esmaltes brillantes se lijan.' },
        { title: '2. Amasar.', text: 'Solo agua, a consistencia de trabajo, en cubeta limpia. No añadir arena, cal ni cemento.' },
        { title: '3. Aplicar.', text: 'Directo sobre el sustrato limpio, en capas delgadas de acabado.' },
        { title: '4. Sobre block o zarpeo.', text: 'Si el sustrato es absorbente, usar Waxtard Blanco Perla.' },
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
        'Extra Anclaje ancla en liso; Blanco Perla trabaja sobre absorbente. Cada uno a su sustrato.',
        'Es estuco de acabado. En el saco aparece como EIFS / Extra Anclaje; es el mismo producto que esta ficha.',
      ],
    },
  ],
  notice: NOTICE_VERIFIED,
});
