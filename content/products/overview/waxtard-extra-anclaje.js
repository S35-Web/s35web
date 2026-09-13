'use strict';

const DIR = '/Assets/overview/waxtard-extra-anclaje';

module.exports = {
  kicker: 'Waxtard S-35',
  headline: ['WAXTARD', 'EXTRA ANCLAJE'],
  deck: 'Donde un estuco normal no agarra, este ancla. Concreto liso, prefabricado, sistemas EIFS y pintura firme.',
  meta: 'Saco de 25 kg · Anclaje químico reforzado',
  stats: [
    { value: '25 kg', label: 'Un solo saco, listo para amasar' },
    { value: '8–10 m²', label: 'Rendimiento por saco a 2 mm' },
    { value: '≥0.8 MPa', label: 'Adherencia · anclaje químico' },
    { value: 'µ ≤ 15', label: 'Permeabilidad al vapor' },
  ],
  hero: {
    theme: 'blue',
    src: DIR + '/hero.png',
    alt: 'Saco de Waxtard Extra Anclaje, con el anclaje químico uniendo concreto y acabado',
  },
  problem: {
    kicker: 'El problema',
    title: 'Un estuco normal no agarra en todos lados.',
    text: 'Concreto liso, prefabricado o pintura firme son superficies de baja absorción: un mortero de acabado convencional se resbala, no ancla y termina desprendiéndose. La solución habitual es picar el sustrato o aplicar un puente adherente aparte.',
    compare: {
      left: {
        src: DIR + '/problem-fail.png',
        alt: 'Estuco convencional desprendido sobre un sustrato liso de concreto',
        label: 'Estuco convencional',
        note: 'Falla de adherencia sobre superficie lisa',
      },
      right: {
        src: DIR + '/problem-ok.png',
        alt: 'Acabado de Waxtard Extra Anclaje anclado sobre concreto liso',
        label: 'Waxtard Extra Anclaje',
        note: 'Anclaje químico, sin picar el muro',
      },
    },
  },
  flex: {
    kicker: 'Doble acción',
    title: 'Anclaje reforzado, más hidrófugo.',
    text: 'Un sistema polimérico reforzado se ancla químicamente al sustrato, incluso donde la absorción es baja. Sobre esa base actúa el sistema hidrófugo de la línea Waxtard: el agua líquida no entra por capilaridad, pero el vapor sigue saliendo.',
    image: {
      src: DIR + '/action.png',
      alt: 'Corte del acabado: anclaje al concreto y agua perlada en la superficie hidrófuga',
    },
  },
  lab: {
    kicker: 'Formulación',
    title: 'Dosificada en laboratorio. No en obra.',
    text: 'Cada insumo se pesa y controla antes de entrar a la fórmula. Lo que llega al saco es una proporción medida y repetible, no un estimado hecho en el momento.',
    video: '/Assets/overview/pegaxpress-block/lab.mp4',
    poster: '/Assets/overview/pegaxpress-block/lab.png',
  },
  apply: {
    kicker: 'En obra',
    title: 'Amasar, aplicar, dejar respirar.',
    steps: [
      { n: '01', title: 'Amasar con agua', text: '6.0 – 7.0 L por saco. Sin cemento, cal ni aditivos ajenos.' },
      { n: '02', title: 'Aplicar en capas finas', text: 'De 1 a 3 mm, a llana o proyectado.' },
      { n: '03', title: 'Curar sin exponer', text: 'Proteger del sol, viento y lluvia las primeras 24 h.' },
    ],
    image: {
      src: DIR + '/apply.png',
      alt: 'Aplicador extendiendo Waxtard Extra Anclaje sobre malla, con el saco al lado',
    },
  },
  performance: {
    kicker: 'Desempeño',
    title: 'Absorción de agua frente a un estuco convencional.',
    waxtard: 'Waxtard Extra Anclaje: absorción mínima y estable.',
    conventional: 'Estuco convencional sin hidrófugo: se satura en minutos.',
    note: 'Curva de referencia de laboratorio. El desempeño real depende del sustrato y del espesor aplicado; los valores completos están en Technical data.',
  },
  close: {
    theme: 'cool',
    title: 'Anclaje que no se rinde.',
    text: 'Donde otros necesitan picar el muro o un puente adherente aparte, este producto ya trae la solución en la fórmula.',
    cta: 'Ver ficha técnica completa',
  },
};
