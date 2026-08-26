'use strict';

const { draft, NOTICE_VERIFIED } = require('../sheet');

// Ficha de Styrobond Pro+. Datos de mortero para pegar y revestir EPS/XPS,
// adaptados a saco de 25 kg. No se copia marca ni garantía de terceros.
// El PDF de referencia no trae ensayos ANSI/NMX de tensión o corte: no se inventan.

module.exports = draft({
  slug: 'styrobond-pro',
  code: 'FT-PP-001',
  family: 'pro-systems',
  status: 'verified',
  name: 'STYROBOND',
  variant: 'Pro+',
  line: 'Pegamento y recubrimiento para poliestireno expandido (EPS)',
  accent: '#e65100',
  packaging: '25 kg',
  description: 'Styrobond Pro+: mortero para adherir y revestir placas y molduras de poliestireno expandido y extruido, interior y exterior. Saco de 25 kg.',
  strip: [
    'Pegamento y recubrimiento para EPS · interior y exterior',
    'Línea Pro+ · saco de 25 kg',
  ],
  lead: 'Mortero para pegar y revestir placas y elementos decorativos de poliestireno expandido (EPS) y extruido, en interior y exterior. Reforzado con microfibras para reducir agrietamientos. Como acabado se flotea y se puede pintar. No es un estuco Waxtard, no pega loseta y no sustituye a Basecoat del sistema de panel.',
  pack: '/Assets/productos_background/styrobond.png',
  packAlt: 'Saco de 25 kg de Styrobond Pro+, pegamento y recubrimiento para EPS',
  identification: [
    { label: 'Tipo de producto', value: 'Mortero adhesivo y recubrimiento para poliestireno' },
    { label: 'Función', value: 'Pegado y revestido de placas EPS/XPS, prefabricados y molduras' },
    { label: 'Presentación', value: 'Saco de 25 kg' },
  ],
  kpis: [
    { value: '25 kg', label: 'saco · producto seco' },
    { value: '6.0–6.1 L', label: 'agua de amasado por saco (24.0–24.5 %)' },
    { value: '10 min', label: 'reposo de la mezcla' },
    { value: '8–38 °C', label: 'temperatura de la superficie' },
  ],
  sections: [
    {
      kind: 'prose',
      n: '1.0',
      title: 'Cómo funciona',
      prose: [
        'Sirve en dos pasos del mismo sistema: primero pega la placa de poliestireno al muro (cordones horizontales en sustrato y en la placa); después la reviste con dos capas y malla de refuerzo, y se flotea.',
        'Las microfibras ayudan a que el recubrimiento no se agriete. El acabado queda de apariencia sólida y se puede pintar. No nivela un piso. No pega cerámica. El acabado fino hidrófugo del sistema, si se pide, es Waxtard Extra Anclaje.',
      ],
    },
    {
      kind: 'properties',
      n: '2.0',
      title: 'Propiedades y qué significan',
      rows: [
        {
          param: 'Función',
          value: 'Pegamento y recubrimiento EPS/XPS',
          practical: 'Un solo mortero para fijar la placa y para revestirla con malla. No es adhesivo de loseta ni estuco de acabado fino.',
          method: 'Ficha',
        },
        {
          param: 'Agua de amasado',
          value: '24.0 – 24.5 % · 6.0 – 6.1 L por saco de 25 kg',
          practical: 'Rango estrecho: no “al ojo”. No añadir agua después de amasar. Remezclar de vez en cuando para mantener la consistencia.',
          method: 'Ficha',
        },
        {
          param: 'Reposo de la mezcla',
          value: '10 min, luego rebatir',
          practical: 'Dejar tomar, remezclar y trabajar. Cubeta o charola de plástico, no sobre el firme de concreto.',
          method: 'Ficha',
        },
        {
          param: 'Microfibras',
          value: 'Refuerzo de fácil dispersión',
          practical: 'Reducen agrietamientos en el recubrimiento cuando la malla y las dos capas están bien ejecutadas.',
          method: 'Ficha',
        },
        {
          param: 'Temperatura de superficie',
          value: '8 – 38 °C',
          practical: 'Fuera de ese rango no aplicar. En clima extremo, consultar a Especificaciones S-35.',
          method: 'Ficha',
        },
        {
          param: 'Secado del recubrimiento',
          value: 'Minutos entre capas · 20–30 min antes de flotar',
          practical: 'La primera capa no debe secar del todo antes de embeber la malla. El floteado espera a que la segunda capa haya tomado.',
          method: 'Ficha',
        },
        {
          param: 'Acabado',
          value: 'Floteado con esponja · se puede pintar',
          practical: 'Textura uniforme de apariencia sólida. La pintura va encima cuando el recubrimiento ya curó.',
          method: 'Ficha',
        },
      ],
    },
    {
      kind: 'cards',
      n: '3.0',
      title: 'Beneficios',
      cards: [
        {
          title: 'Pega y reviste',
          text: 'Un mortero para fijar la placa de poliestireno y para cubrirla con malla. Menos productos en el andamio.',
        },
        {
          title: 'Microfibras',
          text: 'Refuerzo disperso para un recubrimiento más continuo y menos propenso a fisuras de retracción.',
        },
        {
          title: 'Interior, exterior y pintura',
          text: 'Placas, prefabricados y molduras. Acabado floteado que se puede pintar.',
        },
      ],
    },
    {
      kind: 'items',
      n: '4.0',
      title: 'Usos y sustratos',
      items: [
        {
          title: 'Placas de poliestireno.',
          text: 'Expandido (EPS) y extruido, interior y exterior. Pegado al muro y recubrimiento con malla.',
        },
        {
          title: 'Prefabricados y molduras.',
          text: 'Paneles de cemento-arena o yeso preparados, y molduras decorativas de poliestireno. Reviste y da apariencia sólida.',
        },
        {
          title: 'No aplicar sobre.',
          text: 'Tablas de yeso sin sellar, OSB (viruta de madera), plástico, madera, metal, ni inmersión prolongada de agua. Esos sustratos piden otro sistema o consulta a Especificaciones S-35.',
        },
        {
          title: 'No sustituye a.',
          text: 'Basecoat Plus (recubrimiento de panel), Cellbond (block celular), Pegaxpress (loseta) ni Waxtard Extra Anclaje (estuco de acabado sobre EIFS).',
        },
      ],
    },
    {
      kind: 'tables',
      n: '5.0',
      title: 'Dos modos de trabajo',
      tables: [
        {
          label: 'Cómo se usa',
          head: ['Modo', 'Qué hacer'],
          rows: [
            ['Como adhesivo', 'Capa lisa + cordones horizontales en el muro y en la placa. Asentar y presionar con llana de plástico.'],
            ['Como recubrimiento', 'Primera capa sobre el EPS, embeber malla, segunda capa, esperar 20–30 min y flotar con esponja.'],
          ],
          note: 'El rendimiento cambia con la rugosidad, el desnivel y el espesor de las capas. No hay un m² único por saco en esta ficha.',
        },
        {
          label: 'Lo que esta ficha no cubre',
          head: ['Sustrato / uso', 'Criterio'],
          rows: [
            ['Yeso sin sellar, OSB, plástico, madera, metal', 'No aplicar.'],
            ['Inmersión prolongada', 'No aplicar.'],
            ['Loseta, block celular, nivelación de piso', 'Usar Pegaxpress, Cellbond o Leveltec.'],
            ['Acabado fino hidrófugo sobre el sistema', 'Waxtard Extra Anclaje.'],
          ],
        },
      ],
    },
    {
      kind: 'steps',
      n: '6.0',
      title: 'Modo de empleo',
      steps: [
        {
          title: '1. Preparar.',
          text: 'Placa limpia por ambos lados: sin polvo, rebabas, grasa, pintura, ácidos ni aceite. El muro, firme y capaz. Humedecer ligeramente el sustrato, sin saturar.',
        },
        {
          title: '2. Amasar.',
          text: 'En cubeta o charola de plástico, 6.0 a 6.1 L de agua por saco de 25 kg. Mezclar sin grumos, reposar 10 min y remezclar. No añadir más agua. Remezclar de vez en cuando. No mezclar sobre el firme de concreto.',
        },
        {
          title: '3. Pegar la placa.',
          text: 'Con el lado liso, una capa sobre el muro. Con el dentado, cordones horizontales paralelos. Lo mismo en la cara de la placa. Colocar la placa con los cordones alineados al rallado del muro. Presionar con llana de plástico suave en toda el área.',
        },
        {
          title: '4. Juntas antes de revestir.',
          text: 'Cuando todas las placas estén fijas: desvanecer bordes, tratar juntas y puntos críticos, y dejar la cara limpia de polvo.',
        },
        {
          title: '5. Recubrir con malla.',
          text: 'Primera capa fresca sobre el EPS. Colocar la malla de refuerzo y embeberla con llana lisa. Esperar unos minutos sin dejar secar del todo. Segunda capa hasta cubrir la malla por completo.',
        },
        {
          title: '6. Flotar y pintar.',
          text: 'Esperar 20 a 30 min según el clima. Flotar con esponja. Pintar cuando el recubrimiento haya curado. No retemplar ni añadir agua extra.',
        },
      ],
    },
    {
      kind: 'callout',
      n: '6.1',
      title: 'Condiciones de aplicación',
      intro: 'El secado y el agarre cambian con el clima, el espesor y el sustrato. No forzar el mortero.',
      points: [
        {
          title: 'Deshidratación.',
          text: 'Si la mezcla extendida ya no está fresca, no adhiere: se descarta el tendido y se vuelve a aplicar material fresco.',
        },
        {
          title: 'Temperatura.',
          text: 'Superficie entre 8 y 38 °C. Fuera de rango o clima extremo: consultar a Especificaciones S-35.',
        },
        {
          title: 'Malla.',
          text: 'La primera capa no debe secar del todo antes de embeber. La malla tiene que quedar cubierta por la segunda capa.',
        },
        {
          title: 'Sustratos prohibidos.',
          text: 'OSB, yeso sin sellar, plástico, madera y metal quedan fuera de esta ficha. Tampoco inmersión prolongada.',
        },
      ],
    },
    {
      kind: 'pairs',
      n: '7.0',
      title: 'Manejo y almacenamiento',
      pairs: [
        {
          label: 'Almacenamiento',
          text: 'Sacos cerrados, sobre tarima, en lugar fresco y seco, sin humedad. Vida útil de 6 meses en empaque original cerrado. Estibar con criterio y consumir por lote.',
        },
        {
          label: 'Seguridad',
          text: 'Usar guantes, ropa de trabajo y, en muro, gafas. Ventilar; si el polvo se acumula, mascarilla. Lavar las manos después de aplicar. Evitar contacto prolongado con la piel. Mantener fuera del alcance de los niños. No verter residuos al drenaje.',
        },
      ],
    },
    {
      kind: 'notes',
      n: 'Anexo',
      title: 'Datos de interés',
      notes: [
        'No sustituye a Leveltec ni a Pegaxpress: pega y reviste poliestireno, no nivela pisos ni pega loseta.',
        'No es Basecoat Plus: aquel recubre el sistema de panel. Styrobond es el pegamento y recubrimiento del EPS.',
        'No es Cellbond ni Pegaxpress Block.',
        'El acabado fino hidrófugo sobre el sistema, si el proyecto lo pide, es Waxtard Extra Anclaje.',
        'Esta ficha no asigna ensayos ANSI ni rendimientos en m²: el PDF de referencia no los trae. El consumo lo define el espesor y la rugosidad en obra.',
      ],
    },
  ],
  notice: NOTICE_VERIFIED,
});
