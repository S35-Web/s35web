'use strict';

// Contenido tomado de la ficha oficial "Ficha Tecnica Sellador Premium"
// (FT-PR-003 · Rev. 01 · 2026). El slug conserva /sellador-premium-pintura.

const liquidVerified = require('../liquid-verified');
const S = require('../shared');

module.exports = liquidVerified({
  slug: 'sellador-premium-pintura',
  code: 'FT-PR-003',
  name: 'SELLADOR PREMIUM',
  variant: 'Adhesivo S-35',
  line: 'Adhesivo sellador acrílico',
  accent: '#1e5ab2',
  packaging: 'Cubeta 1 L',
  pack: '/Assets/productos_thumbs/sellador-premium-pintura.jpg',
  packAlt: 'Envase de 1 L de Sellador Premium S-35',
  packLabel: 'Fig. A · presentación 1 L',
  description: 'Sellador Premium S-35: compuesto líquido blanco de media viscosidad para sellar superficies porosas, aditivar mezclas y usarse como adhesivo. 1 L, 1 galón, cubeta 19 L y 200 L.',
  strip: [
    'Adhesivo · aditivo de mezcla · sellador de porosidad',
    '1 litro · 1 galón · cubeta 19 L · 200 litros',
  ],
  lead: 'Sellador Premium S-35® es un compuesto líquido de color blanco de media viscosidad formulado a base de polímeros modificados de gran adherividad. Ampliamente recomendado como adhesivo, aditivo de mezcla o sellador en trabajos de construcción. Especialmente indicado para sellar superficies porosas y disminuir la permeabilidad en concretos, morteros y estucos.',
  identification: [
    { label: 'Tipo de producto', value: 'Emulsión de polímeros modificados en agua, líquido blanco' },
    { label: 'Función', value: 'Sellador de porosidad · aditivo de mezcla · adhesivo' },
    { label: 'Presentación', value: '1 litro · 1 galón · cubeta 19 L · 200 litros' },
  ],
  kpis: [
    { value: '1 L', label: 'envase · producto líquido' },
    { value: '1:1', label: 'puro como sellador / incorporado al agua de amasado como aditivo' },
    { value: '15–20 min', label: 'tiempo abierto a 23 °C' },
    { value: '> 5 °C', label: 'temperatura mínima de aplicación' },
  ],
  sections: [
    {
      kind: 'prose',
      n: '1.0',
      title: 'Cómo funciona',
      prose: [
        'El producto es una emulsión de polímeros modificados en agua. Aplicado sobre una superficie porosa, penetra y cierra los poros abiertos de concretos, morteros y estucos, formando una película continua que reduce el paso del agua.',
        'Esa misma acción sellante, usada en menor dilución dentro del agua de amasado, mejora la cohesión interna de la mezcla y su adherencia al sustrato. Sobre superficies pintadas, sella el poro sin levantar la pintura existente.',
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
            ['Polímeros modificados en emulsión', 'Sellado de poro, adherencia y resistencia al agua.'],
            ['Agua', 'Vehículo de la emulsión; permite su dilución según el uso.'],
            ['Aditivos reológicos y estabilizantes', 'Viscosidad estable y buena penetración en el poro.'],
          ],
          note: S.COMPOSITION_NOTE,
        },
        {
          label: 'Qué resuelve en obra',
          head: ['Problema', 'Respuesta del producto'],
          rows: [
            ['Concreto o mortero que absorbe agua sin control', 'Disminuye la permeabilidad, sellando el poro abierto.'],
            ['Estucos porosos con absorción irregular', 'Sella la superficie y homogeniza la absorción.'],
            ['Superficies pintadas que necesitan protección extra', 'Sella sobre la pintura sin levantarla.'],
            ['Falta de adherencia entre capas de mortero', 'Usado como aditivo, mejora cohesión y adherencia.'],
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
          value: 'Líquido blanco, media viscosidad',
          practical: 'Se aplica directo con brocha o rodillo, sin preparación previa.',
          method: 'Visual',
        },
        {
          param: 'Densidad',
          value: '1.00 – 1.05 g/cm³',
          practical: 'Un litro pesa aproximadamente 1 kg; permite calcular consumo por peso o volumen.',
          method: 'ASTM D1475',
        },
        {
          param: 'Proporción de uso',
          value: 'Puro como sellador · 1:1 incorporado al agua de amasado como aditivo',
          practical: 'No requiere diluirse antes de usarse; como aditivo, se agrega directo al agua de amasado del mortero o concreto.',
          method: 'Interno',
        },
        {
          param: 'Tiempo abierto de trabajo',
          value: '15 – 20 min a 23 °C',
          practical: 'Extender la aplicación dentro de este margen para asegurar la penetración en el poro.',
          method: 'Interno',
        },
        {
          param: 'pH',
          value: '7 – 9',
          practical: 'Prácticamente neutro; compatible con la mayoría de morteros y pinturas.',
          method: 'Potenciómetro',
        },
        {
          param: 'Temperatura mínima de aplicación',
          value: '> 5 °C',
          practical: 'No aplicar por debajo de este límite ni con saturación de humedad o pronóstico de lluvia.',
          method: 'Interno',
        },
        {
          param: 'Toxicidad e inflamabilidad',
          value: 'No tóxico · no flamable',
          practical: 'Manejo seguro en obra sin restricciones especiales de transporte.',
          method: 'Etiqueta',
        },
      ],
    },
    {
      kind: 'cards',
      n: '4.0',
      title: 'Beneficios',
      cards: [
        {
          title: 'Menos permeabilidad',
          text: 'Cierra el poro de concretos, morteros y estucos, reduciendo la absorción de agua sin necesidad de un recubrimiento adicional.',
        },
        {
          title: 'Adhesividad potenciada',
          text: 'Los elementos tratados con Aditivo Sellador S-35® aumentan y potencializan su adhesividad frente a un sellador convencional.',
        },
        {
          title: 'Un producto, tres usos',
          text: 'Se aplica puro como sellador, o diluido como adhesivo y aditivo de mezcla: menos productos que manejar en obra.',
        },
      ],
    },
    {
      kind: 'items',
      n: '5.0',
      title: 'Usos y sustratos',
      items: [
        { title: 'Sellado de superficies porosas.', text: 'Concreto, mortero y estuco expuestos a absorción de agua.' },
        { title: 'Reducción de permeabilidad.', text: 'En concretos, morteros y estucos, antes o después de su colocación.' },
        { title: 'Superficies pintadas.', text: 'Sellado de protección sobre pintura ya aplicada.' },
        { title: 'No aplicar.', text: 'A temperaturas menores de 5 °C, con saturación de humedad o pronóstico de lluvia inmediato.' },
      ],
    },
    {
      kind: 'steps',
      n: '6.0',
      title: 'Modo de empleo',
      steps: [
        { title: '1. Preparar el sustrato.', text: 'Firme, limpio, sin polvo, grasa ni pintura suelta.' },
        { title: '2. Sellar superficies porosas.', text: 'Aplicar puro con brocha o rodillo, en capa uniforme, sobre concreto, mortero o estuco.' },
        { title: '3. Sellar superficies pintadas.', text: 'Aplicar puro en una mano ligera, sin saturar la película de pintura existente.' },
        { title: '4. Usar como aditivo de mezcla.', text: 'Incorporar el producto puro (1:1) directamente al agua de amasado del mortero o concreto; ahí queda diluido, sin necesidad de premezclarlo con agua.' },
        { title: '5. Usar como adhesivo.', text: 'Aplicar puro como puente de adherencia antes de colocar el material nuevo.' },
        { title: 'Consumo de referencia.', text: 'Verificar con un paño de prueba antes de calcular el pedido completo, según la porosidad del sustrato.' },
      ],
    },
    {
      kind: 'pairs',
      n: '7.0',
      title: 'Manejo y almacenamiento',
      pairs: [
        {
          label: 'Almacenamiento',
          text: 'Envase cerrado, en lugar fresco y ventilado, protegido de heladas y de la luz solar directa. Vida útil de 12 meses en empaque original cerrado.',
        },
        {
          label: 'Seguridad',
          text: 'No tóxico, no flamable. Evitar contacto prolongado con los ojos; en caso de contacto, lavar con agua abundante. Mantener fuera del alcance de los niños. No verter residuos al drenaje.',
        },
      ],
    },
  ],
  notice: 'Valores típicos de referencia para la categoría, obtenidos en laboratorio a 23 °C y 50 % HR; no constituyen especificación de garantía. El desempeño en obra depende del sustrato, la dilución, el espesor y las condiciones de aplicación y curado. Se recomienda un paño de prueba en cada proyecto. La formulación del producto es información propietaria de S-35.',
});
