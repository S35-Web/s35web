'use strict';

// Contenido tomado de la ficha oficial "Ficha Tecnica Adhesivo Heavy Duty"
// (FT-PR-004 · Rev. 01 · 2026).

const liquidVerified = require('../liquid-verified');
const S = require('../shared');

module.exports = liquidVerified({
  slug: 'adhesivo-heavy-duty',
  code: 'FT-PR-004',
  name: 'HEAVY DUTY',
  variant: 'Adhesivo S-35',
  line: 'Adhesivo acrílico multiuso',
  accent: '#e64a19',
  packaging: 'Cubeta 1 L',
  pack: '/Assets/productos_thumbs/adhesivo-heavy-duty.jpg',
  packAlt: 'Envase de 1 L de Adhesivo Heavy Duty S-35',
  packLabel: 'Fig. A · presentación 1 L',
  description: 'Adhesivo Heavy Duty S-35: versión más concentrada de la línea Adhesivo S-35, para aditivar concreto y mortero. 1 L, 1 galón, cubeta 19 L y 200 L.',
  strip: [
    'Aditivo de mezcla de alta concentración para concreto y mortero',
    '1 litro · 1 galón · cubeta 19 L · 200 litros',
  ],
  lead: 'Adhesivo Heavy Duty S-35® es la versión más concentrada y viscosa de la línea Adhesivo S-35®, formulada a base de polímeros modificados de gran adhesividad. Está pensado para aditivar fuertemente la mezcla: se incorpora directo al concreto o mortero para elevar de forma notable su adherencia y resistencia mecánica, más allá de lo que logra un puente de adherencia convencional.',
  identification: [
    { label: 'Tipo de producto', value: 'Emulsión de polímeros modificados en agua, líquido blanco' },
    { label: 'Función', value: 'Aditivo de mezcla de alta concentración' },
    { label: 'Presentaciones', value: '1 litro · 1 galón · cubeta 19 L · 200 litros' },
  ],
  kpis: [
    { value: 'Alta', label: 'viscosidad, pensado para aditivar mezclas' },
    { value: 'Concentrado', label: 'se incorpora puro al agua de amasado' },
    { value: '15–20 min', label: 'tiempo abierto a 23 °C' },
    { value: 'No tóxico', label: 'no flamable' },
  ],
  sections: [
    {
      kind: 'prose',
      n: '1.0',
      title: 'Cómo funciona',
      prose: [
        'El producto es una emulsión de polímeros modificados en agua, formulada en la concentración más alta de la línea Adhesivo S-35®. Incorporado directo al agua de amasado del concreto o mortero, aporta una carga mucho mayor de polímero por litro que las versiones diluidas de la misma línea.',
        'Esa mayor concentración es lo que le permite aditivar fuertemente la mezcla: eleva su adherencia y su resistencia a tracción, flexión, abrasión e impacto de forma más marcada que un puente de adherencia convencional. Es la opción de la línea para cuando el objetivo es reforzar el concreto o mortero mismo, no solo unir dos superficies.',
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
            ['Aditivos reológicos y estabilizantes', 'Viscosidad estable y tiempo de manejo consistente.'],
          ],
          note: S.COMPOSITION_NOTE,
        },
        {
          label: 'Qué resuelve en obra',
          head: ['Problema', 'Respuesta del producto'],
          rows: [
            ['Concreto o mortero con baja resistencia a tracción e impacto', 'Su alta concentración de polímero eleva de forma marcada la resistencia mecánica de la mezcla.'],
            ['Mezclas sometidas a vibración, tránsito o carga estructural', 'Mayor cohesión interna que reduce el riesgo de fisuras y desprendimientos.'],
            ['Reparaciones y anclajes que exigen máxima adherencia', 'Aporta más carga de polímero por litro que las versiones comunes.'],
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
          value: 'Líquido blanco, alta viscosidad',
          practical: 'Se aplica directo a la mezcla.',
          method: 'Visual',
        },
        {
          param: 'Densidad',
          value: '1.00 – 1.05 g/cm³',
          practical: 'Un litro pesa aproximadamente 1 kg; permite calcular consumo por peso o volumen.',
          method: 'ASTM D1475',
        },
        {
          param: 'Concentración',
          value: 'Versión más concentrada de la línea Adhesivo S-35®',
          practical: 'Se usa puro, sin diluir; no se recomienda rebajarlo con agua antes de incorporarlo a la mezcla.',
          method: 'Interno',
        },
        {
          param: 'Tiempo abierto de trabajo',
          value: '15 – 20 min a 23 °C',
          practical: 'El material nuevo debe colocarse mientras la película sigue húmeda o tacky.',
          method: 'Interno',
        },
        {
          param: 'pH',
          value: '7 – 9',
          practical: 'Prácticamente neutro; compatible con la mayoría de morteros y acabados.',
          method: 'Potenciómetro',
        },
        {
          param: 'Temperatura de aplicación',
          value: '5 – 35 °C',
          practical: 'Rango ideal de trabajo.',
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
          title: 'Máxima concentración de la línea',
          text: 'Aporta más carga de polímero por litro que Adhesivo Darawell y Sellador Premium, para cuando la mezcla necesita el mayor refuerzo posible.',
        },
        {
          title: 'Más resistencia, menos fisuras',
          text: 'Eleva de forma marcada la resistencia a tracción, flexión, abrasión e impacto del concreto o mortero.',
        },
        {
          title: 'Enfocado en aditivar la mezcla',
          text: 'A diferencia de Darawell (adherencia y trabajabilidad) y Sellador Premium (sellado antes de pintar), Heavy Duty está pensado para reforzar la mezcla misma.',
        },
      ],
    },
    {
      kind: 'items',
      n: '5.0',
      title: 'Usos y sustratos',
      items: [
        { title: 'Concreto estructural.', text: 'Aditivo en mezclas que requieren mayor resistencia a tracción, flexión e impacto.' },
        { title: 'Morteros de reparación y anclaje.', text: 'Donde la adherencia y resistencia mecánica son críticas.' },
        { title: 'Elementos sujetos a vibración o carga.', text: 'Pisos, bases de maquinaria y elementos de tránsito pesado.' },
        { title: 'No aplicar.', text: 'Como lechada de adherencia general o como sellador de porosidad: para esos usos, ver Adhesivo Darawell y Sellador Premium S-35®.' },
      ],
    },
    {
      kind: 'steps',
      n: '6.0',
      title: 'Modo de empleo',
      steps: [
        { title: '1. Preparar los materiales.', text: 'Cemento, arena y agua limpia, en las proporciones habituales del diseño de mezcla.' },
        { title: '2. Incorporar el aditivo.', text: 'Agregar el producto puro, sin diluir, directamente al agua de amasado antes o durante el mezclado.' },
        { title: '3. Mezclar de forma homogénea.', text: 'Hasta obtener una consistencia uniforme, sin grumos ni zonas sin aditivar.' },
        { title: '4. Colocar y compactar.', text: 'Dentro del tiempo abierto (15 – 20 min a 23 °C), antes de que la mezcla comience a perder trabajabilidad.' },
        { title: '5. Curar normalmente.', text: 'Seguir el curado habitual del concreto o mortero; el aditivo no sustituye el curado húmedo.' },
        { title: 'Especialmente recomendado.', text: 'Concreto y mortero que requieren mayor resistencia mecánica y adherencia interna que la que da un aditivo estándar.' },
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
