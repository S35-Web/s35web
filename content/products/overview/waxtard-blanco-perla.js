'use strict';

const DIR = '/Assets/overview/waxtard-blanco-perla';

module.exports = {
  kicker: 'Waxtard S-35',
  headline: ['WAXTARD', 'BLANCO PERLA'],
  deck: 'Deja pasar el vapor. Detiene el agua. Un acabado que respira mientras la lluvia y el salitre se quedan afuera.',
  meta: 'Saco de 25 kg · Exteriores e interiores',
  stats: [
    { value: '25 kg', label: 'Un solo saco, listo para amasar' },
    { value: '5–7 m²', label: 'Rendimiento por saco a 3 mm' },
    { value: 'W2', label: 'Clase de repelencia al agua' },
    { value: 'µ ≤ 15', label: 'Permeabilidad al vapor' },
  ],
  hero: {
    src: DIR + '/hero.png',
    alt: 'Saco de Waxtard Blanco Perla sobre fondo negro, con el polvo de la fórmula en suspensión',
  },
  problem: {
    kicker: 'El problema',
    title: 'Sellar el muro no resuelve el salitre. Lo empeora.',
    text: 'Un acabado impermeable detiene el agua, pero también atrapa la humedad que ya está dentro del muro. Esa humedad busca salida, arrastra sales, y termina ampollando la pintura o manchando la fachada.',
    compare: {
      left: {
        src: DIR + '/problem-fail.png',
        alt: 'Fachada con pintura ampollada y manchas de salitre por un acabado sellado',
        label: 'Acabado sellado / estuco',
        note: 'Atrapa vapor, salitre y ampollas',
      },
      right: {
        src: DIR + '/problem-ok.png',
        alt: 'Acabado de Waxtard Blanco Perla limpio y uniforme junto a una ventana',
        label: 'Waxtard Blanco Perla',
        note: 'Agua fuera, vapor libre',
      },
    },
  },
  flex: {
    kicker: 'Doble acción',
    title: 'Hidrófugo, no impermeable.',
    text: 'El sistema recubre internamente los poros del acabado: el agua líquida no entra por capilaridad, pero el vapor sigue saliendo. Sin agua entrando, no hay sal cristalizando en la superficie.',
    image: {
      src: DIR + '/action.png',
      alt: 'Corte del acabado: el agua perla en la superficie y el vapor sale del muro',
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
      { n: '02', title: 'Aplicar en capas delgadas', text: 'De 2 a 5 mm, a llana o proyectado.' },
      { n: '03', title: 'Curar sin exponer', text: 'Proteger del sol, viento y lluvia las primeras 24 h.' },
    ],
    image: {
      src: DIR + '/apply.png',
      alt: 'Aplicador amasando Waxtard Blanco Perla en obra, con el saco al fondo',
    },
  },
  performance: {
    kicker: 'Desempeño',
    title: 'Absorción de agua frente a un estuco convencional.',
    waxtard: 'Waxtard Blanco Perla: absorción mínima y estable.',
    conventional: 'Estuco convencional sin hidrófugo: se satura en minutos.',
    note: 'Curva de referencia de laboratorio. El desempeño real depende del sustrato y del espesor aplicado; los valores completos están en Technical data.',
  },
  close: {
    theme: 'warm',
    image: {
      src: DIR + '/close.png',
      alt: 'Fachada terminada en Waxtard Blanco Perla, con luz lateral cálida',
    },
    title: 'La misma protección, año tras año.',
    text: 'Un muro que respira no envejece igual que uno que se ahoga. Esa diferencia se ve, con el tiempo, en cada fachada.',
    cta: 'Ver ficha técnica completa',
  },
};
