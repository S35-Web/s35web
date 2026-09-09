'use strict';

const DIR = '/Assets/overview/pegaxpress-block';

module.exports = {
  kicker: 'Waxtard S-35',
  headline: ['Pegaxpress', '/Block'],
  deck: 'La mezcla deja de ser una variable. Dosificada en laboratorio, gramo por gramo, para que cada saco se comporte exactamente igual que el anterior.',
  meta: 'Saco de 30 kg · Solo agrega agua',
  stats: [
    { value: '30 kg', label: 'Un solo saco premezclado' },
    { value: '9.5 m²', label: 'Hasta de rendimiento' },
    { value: '60 min', label: 'Tiempo abierto de la mezcla' },
    { value: '3–6 mm', label: 'Junta recomendada' },
  ],
  hero: {
    src: DIR + '/hero.png',
    alt: 'Saco de Pegaxpress/Block sobre fondo negro, con el polvo de la fórmula en suspensión',
    placeholder: 'HERO: saco de Pegaxpress/Block flotando en negro, iluminación dramática lateral, polvo de la fórmula estallando atrás, ligera perspectiva 3/4. Estilo Apple product hero.',
  },
  problem: {
    kicker: 'El problema',
    title: 'En obra, nunca se mezcla dos veces igual.',
    text: 'Una pala más de cemento, un poco menos de agua, arena de otra procedencia. Cada bache de mezcla sale distinto, y esa variación es la causa más común de que las juntas se agrieten meses después.',
    compare: {
      left: {
        src: DIR + '/problem-fail.png',
        alt: 'Junta de block agrietada: la mezcla rígida de obra se abre meses después',
        label: 'Mezcla en obra',
        note: 'Dosificación variable, junta rígida',
      },
      right: {
        src: DIR + '/problem-ok.png',
        alt: 'Junta de Pegaxpress/Block continua, uniforme y sin fisuras',
        label: 'Pegaxpress/Block',
        note: 'Fórmula fija, junta continua',
      },
    },
  },
  flex: {
    kicker: 'Micro flexibilidad',
    title: 'Una junta que se mueve con el muro, no contra él.',
    text: 'Los polímeros modificados de la fórmula dan a la junta ya curada la capacidad de absorber el movimiento natural entre piezas. Donde una mezcla rígida se fisura, esta cede lo justo y vuelve.',
    video: DIR + '/flex.mp4',
    poster: DIR + '/compare-flex.png',
    fallback: {
      src: DIR + '/compare-flex.png',
      alt: 'Dos bloques bajo el mismo esfuerzo: a la izquierda la junta se rompe; a la derecha se estira y sostiene',
      placeholder: 'VIDEO LOOP: close-up de una junta micro flexible deformándose y recuperando, en cámara lenta, fondo neutro de estudio.',
    },
  },
  lab: {
    kicker: 'Formulación',
    title: 'Dosificada en laboratorio. No en obra.',
    text: 'Cada insumo se pesa y controla antes de entrar a la fórmula. Lo que llega al saco es una proporción medida y repetible, no un estimado hecho en el momento.',
    video: DIR + '/lab.mp4',
    poster: DIR + '/lab.png',
  },
  apply: {
    kicker: 'En obra',
    title: 'Abrir, agregar agua, pegar.',
    steps: [
      { n: '01', title: 'Mezclar con agua', text: 'Hasta consistencia uniforme, sin grumos. Sin dosificar cemento, cal ni arena.' },
      { n: '02', title: 'Aplicar con llana', text: 'Capa uniforme en la base y laterales del block.' },
      { n: '03', title: 'Colocar la pieza', text: 'Presionar y ajustar dentro del tiempo abierto de 60 minutos.' },
    ],
    image: {
      src: DIR + '/apply.png',
      alt: 'Llana dentada aplicando Pegaxpress/Block sobre una hilada, con el saco al fondo',
      placeholder: 'APLICACIÓN: foto vertical de un albañil aplicando el pegamento con llana dentada sobre un block, manos en primer plano, luz natural de obra, muy limpia y aspiracional.',
    },
  },
  yield: {
    kicker: 'Rendimiento',
    title: 'Cuánto muro levanta un saco.',
    note: 'Valores de referencia sobre saco de 30 kg. La tabla completa está en Technical data.',
    joints: ['3 mm', '6 mm', '10 mm'],
    defaultJoint: '3 mm',
    rows: {
      '3 mm': [
        { medida: '10 × 20 × 40', m2: '9.5 m²', detalle: '≈ 119 piezas' },
        { medida: '12 × 20 × 40', m2: '7.9 m²', detalle: '≈ 99 piezas' },
        { medida: '15 × 20 × 40', m2: '6.3 m²', detalle: '≈ 79 piezas' },
        { medida: '20 × 20 × 40', m2: '4.8 m²', detalle: '≈ 60 piezas' },
      ],
      '6 mm': [
        { medida: '10 × 20 × 40', m2: '4.8 m²', detalle: '≈ 60 piezas' },
        { medida: '12 × 20 × 40', m2: '4.0 m²', detalle: '≈ 49 piezas' },
        { medida: '15 × 20 × 40', m2: '3.2 m²', detalle: '≈ 40 piezas' },
        { medida: '20 × 20 × 40', m2: '2.4 m²', detalle: '≈ 30 piezas' },
      ],
      '10 mm': [
        { medida: '10 × 20 × 40', m2: '2.9 m²', detalle: '≈ 36 piezas' },
        { medida: '12 × 20 × 40', m2: '2.4 m²', detalle: '≈ 30 piezas' },
        { medida: '15 × 20 × 40', m2: '1.9 m²', detalle: '≈ 24 piezas' },
        { medida: '20 × 20 × 40', m2: '1.4 m²', detalle: '≈ 18 piezas' },
      ],
    },
  },
  close: {
    image: {
      src: DIR + '/wall.png',
      alt: 'Muro de block terminado, juntas regulares, luz lateral cálida',
      placeholder: 'CIERRE: muro de block terminado, de frente, luz lateral que resalta la regularidad de las juntas. Fondo oscuro. Full bleed.',
    },
    title: 'La misma junta, durante toda la obra.',
    text: 'Cuando la fórmula deja de cambiar, el resultado es estable. Eso es todo lo que un muro necesita.',
    cta: 'Ver ficha técnica completa',
  },
};
