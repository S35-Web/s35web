'use strict';

// Contenido tomado de la ficha oficial
// "Ficha Tecnica - Liquidos - Adhesivo Darawell" (FT-PR-002 · Rev. 02 · 2026).

const liquidVerified = require('../liquid-verified');
const S = require('../shared');

module.exports = liquidVerified({
  slug: 'adhesivo-darawell',
  code: 'FT-PR-002',
  name: 'DARAWELL',
  variant: 'Adhesivo S-35',
  line: 'Adhesivo acrílico multiuso',
  accent: '#c41626',
  packaging: 'Cubeta 1 L',
  rev: '02',
  pack: '/Assets/productos_thumbs/adhesivo-darawell.jpg',
  packAlt: 'Envase de 1 L de Adhesivo Darawell S-35',
  packLabel: 'Fig. A · presentación 1 L',
  description: 'Adhesivo Darawell S-35: compuesto líquido blanco de media viscosidad para lechada de adherencia, aditivo de mezcla y sellador. 1 L, 1 galón, cubeta 19 L y 200 L.',
  strip: [
    'Adhesivo · aditivo de mezcla · lechada de adherencia',
    '1 litro · 1 galón · cubeta 19 L · 200 litros',
  ],
  lead: 'Adhesivo Darawell S-35® es un compuesto líquido de color blanco de media viscosidad formulado a base de polímeros modificados de gran adhesividad, empleado en trabajos de construcción y ampliamente recomendado como adhesivo, aditivo de mezcla o sellador. Es la versión intermedia de la línea Adhesivo S-35®: aporta adherencia y trabajabilidad a la mezcla, entre la mayor concentración de Heavy Duty y el uso como sellador de porosidad de Sellador Premium.',
  identification: [
    { label: 'Tipo de producto', value: 'Emulsión de polímeros sintéticos en agua, líquido blanco' },
    { label: 'Función', value: 'Lechada de adherencia · aditivo de mezcla · sellador' },
    { label: 'Presentaciones', value: '1 litro · 1 galón · cubeta 19 L · 200 litros' },
  ],
  kpis: [
    { value: '4 usos', label: 'lechada, aditivo, aplanado y sellador en un solo producto' },
    { value: '12 meses', label: 'vida útil en envase original cerrado' },
    { value: '15–20 min', label: 'tiempo abierto a 23 °C' },
    { value: '> 5 °C', label: 'temperatura mínima de aplicación' },
  ],
  sections: [
    {
      kind: 'prose',
      n: '1.0',
      title: 'Cómo funciona',
      prose: [
        'El producto es una emulsión de polímeros modificados en agua, en la concentración intermedia de la línea Adhesivo S-35®. Aplicado sobre una superficie firme o incorporado a la mezcla, forma una película que se ancla al sustrato y se integra con el material nuevo antes de terminar de curar.',
        'Ese anclaje es lo que crea el puente de adherencia entre concreto nuevo y viejo, entre un aplanado y el muro, entre yeso y muro, o entre una textura y el muro base. Usado como aditivo dentro del agua de amasado, el mismo sistema mejora la cohesión interna de la mezcla y aporta trabajabilidad, sin llegar a la carga de polímero de Heavy Duty ni a la dilución de Sellador Premium.',
      ],
    },
    {
      kind: 'tables',
      n: '2.0',
      title: 'Naturaleza del producto',
      tables: [
        {
          label: 'Componentes por función',
          head: ['Familia', 'Aporta'],
          rows: [
            ['Polímeros modificados en emulsión', 'Adherencia, flexibilidad y resistencia mecánica.'],
            ['Agua', 'Vehículo de la emulsión; se evapora al curar.'],
            ['Aditivos reológicos y estabilizantes', 'Viscosidad estable y buena incorporación en la mezcla.'],
          ],
          note: S.COMPOSITION_NOTE,
        },
        {
          label: 'Qué resuelve en obra',
          head: ['Problema', 'Respuesta del producto'],
          rows: [
            ['Desprendimiento entre concreto nuevo y viejo', 'Puente de adherencia que une ambas superficies.'],
            ['Falta de agarre entre aplanado y muro', 'Aumenta la adherencia del mortero al sustrato.'],
            ['Separación entre yeso y muro', 'Actúa como puente adhesivo entre yeso y muro.'],
            ['Desprendimiento entre textura y muro', 'Crea puente de adherencia entre la textura y el muro base.'],
          ],
        },
      ],
    },
    {
      kind: 'properties',
      n: '3.0',
      title: 'Propiedades y qué significan',
      rows: [
        {
          param: 'Aspecto y color',
          value: 'Líquido blanco viscoso',
          practical: 'Se aplica directo, sin preparación previa distinta a la dilución indicada.',
          method: 'Visual',
        },
        {
          param: 'Densidad',
          value: '1.02 – 1.04 g/mL',
          practical: 'Prácticamente 1 kg por litro; útil para calcular consumo por peso.',
          method: 'Picnómetro',
        },
        {
          param: 'Viscosidad',
          value: '2 000 – 2 200 cPs',
          practical: 'Cuerpo suficiente para no escurrir en exceso al aplicarse puro.',
          method: 'Brookfield',
        },
        {
          param: 'pH',
          value: '7 – 9',
          practical: 'Prácticamente neutro; compatible con cemento, cal y la mayoría de morteros.',
          method: 'Potenciómetro',
        },
        {
          param: 'Solubilidad',
          value: 'Soluble en agua',
          practical: 'Se diluye en cualquier proporción con agua limpia antes de usarse.',
          method: 'Visual',
        },
        {
          param: 'Temperatura mínima de aplicación',
          value: '> 5 °C',
          practical: 'No aplicar por debajo de este límite ni con saturación de humedad o pronóstico de lluvia.',
          method: 'Interno',
        },
        {
          param: 'Vida útil',
          value: '12 meses en envase cerrado',
          practical: 'Conserva sus propiedades en envase original sellado, en lugar seco y ventilado.',
          method: 'Interno',
        },
        {
          param: 'Toxicidad',
          value: 'Nocivo por ingestión · irritación ocular',
          practical: 'Evitar contacto con ojos y piel; usar protección personal al manejarlo. Ver hoja de datos de seguridad.',
          method: 'HDS',
        },
      ],
    },
    {
      kind: 'cards',
      n: '4.0',
      title: 'Beneficios',
      cards: [
        {
          title: 'Une lo nuevo con lo viejo',
          text: 'Crea un puente de adherencia confiable entre concreto existente y concreto fresco, sin necesidad de picar ni escarificar en exceso.',
        },
        {
          title: 'Adherencia y trabajabilidad',
          text: 'Su concentración intermedia da a la mezcla mejor adherencia y manejo en obra, sin la carga extra de Heavy Duty.',
        },
        {
          title: 'Un producto, varios usos',
          text: 'Sirve como lechada de adherencia, aditivo de mezcla o sellador, ajustando solo la forma de aplicación.',
        },
      ],
    },
    {
      kind: 'items',
      n: '5.0',
      title: 'Usos y sustratos',
      items: [
        { title: 'Lechada de adherencia.', text: 'Entre concreto nuevo y viejo, en reparaciones, ampliaciones y juntas de colado.' },
        { title: 'Aplanados y muros.', text: 'Puente de adherencia entre repellos nuevos y el muro base.' },
        { title: 'Yeso y muro.', text: 'Puente adhesivo entre yeso y superficies de muro.' },
        { title: 'Textura y muro.', text: 'Puente de adherencia entre texturas de acabado y el muro base.' },
      ],
    },
    {
      kind: 'steps',
      n: '6.0',
      title: 'Modo de empleo',
      steps: [
        { title: '1. Preparar el sustrato.', text: 'Firme, limpio, sin polvo, grasa ni pintura suelta. No requiere imprimación adicional.' },
        { title: '2. Aplicar como lechada de adherencia.', text: 'Con brocha o rodillo, sin diluir, en capa uniforme sobre la superficie existente.' },
        { title: '3. Colocar el material nuevo.', text: 'Dentro del tiempo abierto (15 – 20 min), mientras la película sigue húmeda o tacky.' },
        { title: '4. Usar como aditivo de mezcla.', text: 'Incorporar el producto puro (1:1) directamente al agua de amasado del mortero o concreto.' },
        { title: '5. En aplanados, yeso y texturas.', text: 'Aplicar puro como puente de adherencia antes de colocar el material nuevo sobre el muro.' },
        { title: 'Especialmente recomendado.', text: 'Lechada de adherencia entre concreto nuevo y viejo, entre aplanados y muros, entre yeso y muro, y entre textura y muro.' },
      ],
    },
    {
      kind: 'pairs',
      n: '7.0',
      title: 'Manejo y almacenamiento',
      pairs: [
        {
          label: 'Almacenamiento',
          text: 'Envase original perfectamente sellado, en lugar seco y ventilado, entarimado y bajo techo. Conserva sus propiedades 12 meses bajo estas condiciones.',
        },
        {
          label: 'Seguridad',
          text: 'Nocivo en caso de ingestión; provoca irritación ocular y puede ser nocivo por contacto con la piel o inhalación. Usar guantes, gafas y evitar el contacto prolongado. En contacto con los ojos, lavar con agua abundante durante 15 minutos y consultar a un médico. Mantener fuera del alcance de los niños; no verter al drenaje.',
        },
      ],
    },
  ],
  notice: 'Valores típicos obtenidos en laboratorio; no constituyen especificación de garantía. El desempeño en obra depende del sustrato, la dilución, el espesor y las condiciones de aplicación y curado. Se recomienda un paño de prueba en cada proyecto. La formulación del producto es información propietaria de S-35.',
});
