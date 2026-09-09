'use strict';

const { draft, sack2026 } = require('../sheet');

// Contenido tomado de la ficha técnica oficial "Ficha Tecnica Pastablock"
// (Pegaxpress/Block, FT-PR-006 · Rev. 01 · 2026). No se inventan litros de
// amasado ni normas que la ficha no declara. El saco es de 30 kg.

module.exports = draft({
  slug: 'pegaxpress-block',
  code: 'FT-PR-006',
  family: 'adhesivos-pro',
  status: 'verified',
  name: 'PEGAXPRESS',
  variant: 'Block',
  line: 'Pegamento premium en seco para pegado de piezas de block',
  accent: '#3f6b3a',
  packaging: '30 kg',
  description: 'Pegaxpress: Block, pegamento en polvo para pegar piezas de block hueco. Dosificado en laboratorio; solo se añade agua. Saco de 30 kg.',
  strip: [
    'Pegamento premium en seco para pegado de piezas de block',
    'Saco de 30 kg',
  ],
  lead: 'Pegaxpress/Block S-35® es un pegamento en polvo diseñado específicamente para el pegado de piezas de block hueco. Su fórmula incluye una combinación precisa de cemento, polímeros y aditivos dosificados en laboratorio: solo requiere agregar agua para quedar listo, con un desempeño uniforme en cada saco. La dosificación profesional y controlada de su fórmula reduce de forma notable la aparición de grietas frente a una mezcla dosificada en obra.',
  pack: sack2026('Pegaexpress-Block.png'),
  packAlt: 'Saco de 30 kg de Pegaxpress: Block',
  identification: [
    { label: 'Tipo de producto', value: 'Pegamento cementante en polvo, premezclado en seco' },
    { label: 'Función', value: 'Pegado de piezas de block hueco' },
    { label: 'Presentación', value: 'Saco de 30 kg' },
  ],
  kpis: [
    { value: 'Solo agua', label: 'único insumo que se añade en obra' },
    { value: '4.8–9.5 m²', label: 'rendimiento por saco, según ancho de block' },
    { value: '60 min', label: 'tiempo abierto promedio de la mezcla' },
    { value: 'Micro flexible', label: 'permite el movimiento entre piezas sin fisurar' },
  ],
  sections: [
    {
      kind: 'prose',
      n: '1.0',
      title: 'Cómo funciona',
      prose: [
        'El producto es una mezcla cementante en polvo dosificada en laboratorio, con la proporción exacta de cemento, polímeros y aditivos ya fijada de fábrica. En obra solo se agrega agua: el resultado es una pasta con la consistencia y la elasticidad necesarias para pegar block, sin depender del criterio de quien mezcla.',
        'Esa dosificación fija es la diferencia frente a una mezcla hecha en obra con cemento, cal y arena a ojo: una mezcla de obra rara vez logra la misma flexibilidad lote a lote, y esa variación es la causa más común de que las juntas se agrieten. Al venir prediseñada, la pasta se comporta igual en cada saco, y ese comportamiento repetible es lo que reduce la aparición de grietas entre piezas.',
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
            ['Cemento', 'Resistencia mecánica y desarrollo de fraguado.'],
            ['Polímeros modificados', 'Flexibilidad de la junta y prevención de fisuras.'],
            ['Arena selecta graduada', 'Cuerpo y trabajabilidad de la pasta.'],
            ['Aditivos reológicos y retenedores de agua', 'Tiempo abierto consistente y menor mantenimiento en obra.'],
          ],
          note: 'La composición se declara por función. La formulación y las proporciones son información propietaria de S-35.',
        },
        {
          label: 'Qué resuelve en obra',
          head: ['Problema', 'Respuesta del producto'],
          rows: [
            ['Grietas por mezclas mal dosificadas en obra', 'Fórmula fija de fábrica; la misma proporción en cada saco.'],
            ['Rigidez que impide el movimiento natural entre piezas', 'Los polímeros dan flexibilidad a la junta ya curada.'],
            ['Desperdicio y variabilidad al mezclar cemento, cal y arena', 'Un solo saco premezclado; solo se agrega agua.'],
            ['Tiempo perdido en formulación y limpieza en obra', 'Reduce pasos, traslados y administración de insumos.'],
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
          param: 'Aspecto',
          value: 'Polvo gris, granulometría fina',
          practical: 'Se hidrata de forma uniforme, sin grumos, al mezclarse con agua.',
          method: 'Visual',
        },
        {
          param: 'Agua de mezclado',
          value: 'Según ficha, hasta consistencia uniforme',
          practical: 'Se ajusta a ojo hasta lograr una pasta manejable con llana, sin escurrir.',
          method: 'Interno',
        },
        {
          param: 'Flexibilidad de junta',
          value: 'Alta',
          practical: 'Permite el movimiento natural entre piezas sin que la junta fisure.',
          method: 'Interno',
        },
        {
          param: 'Tiempo abierto',
          value: 'Alto',
          practical: 'Da margen para colocar y ajustar el block antes de que la pasta empiece a fraguar.',
          method: 'Interno',
        },
        {
          param: 'Resistencia de adhesión',
          value: 'Potente',
          practical: 'Une las piezas de block con una adherencia fuerte y duradera.',
          method: 'Interno',
        },
        {
          param: 'Protección a salitre',
          value: 'Potente',
          practical: 'Reduce el paso de sales que suelen manchar o dañar la junta.',
          method: 'Interno',
        },
        {
          param: 'Temperatura de aplicación',
          value: '5 – 45 °C',
          practical: 'Fuera de este rango, las propiedades del producto pueden variar sin ser defecto de fabricación.',
          method: 'Interno',
        },
      ],
    },
    {
      kind: 'tables',
      n: '4.0',
      title: 'Rendimiento por tamaño de block',
      tables: [
        {
          label: 'Block de 10 y 12 cm de ancho',
          head: ['Medida (cm)', 'Junta', 'Piezas por saco', 'Muro', 'Consumo'],
          rows: [
            ['10 × 20 × 40', '3 mm', '≈ 119', '≈ 9.5 m²', '≈ 3.2 kg/m²'],
            ['10 × 20 × 40', '6 mm', '≈ 60', '≈ 4.8 m²', '≈ 6.3 kg/m²'],
            ['10 × 20 × 40', '10 mm', '≈ 36', '≈ 2.9 m²', '≈ 10.5 kg/m²'],
            ['12 × 20 × 40', '3 mm', '≈ 99', '≈ 7.9 m²', '≈ 3.8 kg/m²'],
            ['12 × 20 × 40', '6 mm', '≈ 49', '≈ 4.0 m²', '≈ 7.6 kg/m²'],
            ['12 × 20 × 40', '10 mm', '≈ 30', '≈ 2.4 m²', '≈ 12.7 kg/m²'],
          ],
        },
        {
          label: 'Block de 15 y 20 cm de ancho',
          head: ['Medida (cm)', 'Junta', 'Piezas por saco', 'Muro', 'Consumo'],
          rows: [
            ['15 × 20 × 40', '3 mm', '≈ 79', '≈ 6.3 m²', '≈ 4.7 kg/m²'],
            ['15 × 20 × 40', '6 mm', '≈ 40', '≈ 3.2 m²', '≈ 9.4 kg/m²'],
            ['15 × 20 × 40', '10 mm', '≈ 24', '≈ 1.9 m²', '≈ 15.7 kg/m²'],
            ['20 × 20 × 40', '3 mm', '≈ 60', '≈ 4.8 m²', '≈ 6.3 kg/m²'],
            ['20 × 20 × 40', '6 mm', '≈ 30', '≈ 2.4 m²', '≈ 12.6 kg/m²'],
            ['20 × 20 × 40', '10 mm', '≈ 18', '≈ 1.4 m²', '≈ 21.0 kg/m²'],
          ],
          note: 'Rendimiento calculado sobre saco de 30 kg. Espesor de junta sugerido: entre 3 mm y 6 mm; el espesor de 10 mm se incluye como referencia para juntas mayores. Valores de referencia; verificar con prueba en obra según densidad del block y espesor real de junta.',
        },
      ],
    },
    {
      kind: 'cards',
      n: '5.0',
      title: 'Beneficios',
      cards: [
        {
          title: 'Prevención de fisuras',
          text: 'La dosificación de laboratorio da una flexibilidad de junta que una mezcla armada en obra difícilmente logra, reduciendo la aparición de grietas.',
        },
        {
          title: 'Fácil preparación',
          text: 'Solo requiere agregar agua para quedar listo, sin dosificar cemento, cal ni arena en obra.',
        },
        {
          title: 'Logística más simple',
          text: 'Un solo saco de 30 kg, fácil de trasladar y administrar en distintas áreas de la obra.',
        },
      ],
    },
    {
      kind: 'items',
      n: '6.0',
      title: 'Usos',
      items: [
        {
          title: 'Muros de block hueco.',
          text: 'Levantamiento de muros en obra residencial, comercial e industrial.',
        },
        {
          title: 'Pegado pieza a pieza.',
          text: 'Junta de cama y junta vertical entre piezas de block.',
        },
        {
          title: 'Obra que exige estandarización.',
          text: 'Proyectos donde no es viable dosificar mezcla de forma manual y consistente.',
        },
        {
          title: 'No aplicar.',
          text: 'Directamente sobre piso de concreto, ni a temperaturas menores de 5 °C o mayores de 45 °C.',
        },
      ],
    },
    {
      kind: 'steps',
      n: '7.0',
      title: 'Modo de empleo',
      steps: [
        {
          title: '1. Preparar la superficie.',
          text: 'Firme, sólida y nivelada; limpia de polvo, impermeabilizantes, rebabas, grasa y aceites.',
        },
        {
          title: '2. Mezclar con agua.',
          text: 'Hasta obtener una consistencia uniforme, sin grumos.',
        },
        {
          title: '3. Aplicar con llana.',
          text: 'Capa uniforme en la base y laterales del block.',
        },
        {
          title: '4. Colocar la pieza.',
          text: 'Presionar suavemente y ajustar de inmediato, dentro del tiempo abierto de la pasta.',
        },
        {
          title: '5. Terminar la junta.',
          text: 'Eliminar excesos y dejar secar.',
        },
        {
          title: 'Clima extremo.',
          text: 'Con calor o viento excesivo, humedecer el sustrato para evitar succión prematura del agua de la pasta.',
        },
      ],
    },
    {
      kind: 'pairs',
      n: '8.0',
      title: 'Manejo y almacenamiento',
      pairs: [
        {
          label: 'Almacenamiento',
          text: 'Lugar fresco y seco, alejado de la humedad. No agregar ningún componente no indicado en esta ficha.',
        },
        {
          label: 'Seguridad',
          text: 'Usar guantes de goma y evitar el contacto directo con la piel al manipular el producto en polvo. En caso de contacto, lavar con abundante agua durante al menos 15 minutos. No debe ingerirse bajo ninguna circunstancia.',
        },
      ],
    },
  ],
  notice: 'Valores típicos de referencia para la categoría; no constituyen especificación de garantía. El rendimiento y el tiempo de fraguado pueden variar según el sustrato, el clima y el método de instalación, sin considerarse defecto de fabricación. No mezclar directamente sobre pisos de concreto. Para instalaciones en climas extremos o sobre superficies no descritas, consultar al Departamento de Especificaciones S-35®. La formulación del producto es información propietaria de S-35.',
});
