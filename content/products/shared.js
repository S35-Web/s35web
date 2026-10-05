/* Blocks that repeat verbatim across several S-35 datasheets.
 * Transcribed from the printed fichas técnicas; do not reword without checking
 * the source document. */

/** Lám. I — the "water out, vapour free" cutaway used by the hydrophobic line. */
const PLATE_HYDROPHOBIC = {
  kind: 'plate',
  cite: 'Lám. I — Agua fuera, vapor libre',
  tag: 'corte del acabado',
  stack: [
    { label: 'gota de agua', marker: 'dot', count: 2 },
    { bar: 'v' },
    { bar: 'd' },
    { label: 'vapor que sale', marker: 'tick', count: 3, side: 'left' },
  ],
  legend: [
    '<em>1.</em> Acabado hidrófugo: rechaza el agua líquida',
    '<em>2.</em> Sustrato: mantiene su permeabilidad al vapor',
  ],
  foot: 'Sin agua entrando no hay sales migrando: el muro no salitra ni ampolla.',
};

/** Section 1.0 prose for the hydrophobic line. */
const HOW_IT_WORKS_HYDROPHOBIC = [
  'El producto trabaja en dos frentes. La base mineral fragua y se une al sustrato como cualquier mortero de acabado, mientras el sistema polimérico le da flexibilidad y adherencia sobre superficies difíciles.',
  'Sobre eso actúa el sistema hidrófugo: recubre internamente los poros y hace que el agua líquida no entre por capilaridad, pero deja libre el paso del vapor. Ese equilibrio es lo que frena el salitre, porque el salitre no es más que sal que viaja con el agua y cristaliza al secar. Sin agua entrando, no hay sal aflorando.',
];

/** Section 6.1 — extreme heat protocol. Identical in all three verified fichas. */
const HEAT_PROTOCOL = {
  t: 'callout',
  n: '6.1',
  title: 'Aplicación en clima de calor extremo',
  intro: 'En regiones como Sinaloa, con temperaturas ambientales por encima de 35 °C y hasta 45 °C, el problema no es el producto sino la velocidad de evaporación: el agua se va antes de que el mortero alcance a fraguar, y eso cuesta adherencia, resistencia y repelencia. El producto sí puede aplicarse en esas condiciones siguiendo este protocolo.',
  points: [
    { t: 'Trabajar en las horas frescas.', p: 'Aplicar antes de las 11:00 o después de las 17:00, y nunca sobre muro expuesto al sol directo. Sombrear el paño con malla o lona y, si es posible, seguir la cara del edificio que esté en sombra.' },
    { t: 'Enfriar la superficie, no encharcarla.', p: 'El sustrato no debe pasar de 35 °C al tacto. Humedecer con neblina (spray) de agua 30 minutos antes y repetir hasta que deje de absorber de golpe; aplicar cuando esté húmedo mate, sin brillo ni escurrimiento.' },
    { t: 'Agua fría y sacos a la sombra.', p: 'Amasar con agua limpia fría (por debajo de 20 °C, con hielo si es necesario) y mantener el material bajo cubierta. Un saco caliente reduce el tiempo abierto a la mitad.' },
    { t: 'Lotes pequeños y avance corto.', p: 'Preparar solo lo que se aplique en 20 – 30 minutos y trabajar paños de 2 – 3 m². No reamasar con agua extra la mezcla que empezó a endurecer: se desecha.' },
    { t: 'Curado reforzado.', p: 'Humedecer con neblina (spray) 2 o 3 veces al día durante los primeros 2 días, empezando cuando el acabado ya resista el tacto. Con viento seco, cubrir con malla sombra: el viento deshidrata más que el sol.' },
    { t: 'Señales de alarma.', p: 'Cuarteo fino en malla, superficie que se pulveriza al frotar o pérdida de tono uniforme indican secado prematuro. Suspender la aplicación arriba de 40 °C a pleno sol o con viento superior a 30 km/h.' },
  ],
};

/** Anexo — datos de interés, hydrophobic line. */
const ANNEX_HYDROPHOBIC = {
  t: 'annex',
  n: 'Anexo',
  title: 'Datos de interés',
  notes: [
    'El salitre no aparece sin agua: Son sales minerales (como sulfatos y carbonatos) presentes en los materiales que son disueltas por la humedad y cristalizan en la superficie al evaporarse. Cortar el paso del agua es cortar la migración de sales.',
    'Hidrófugo no es impermeable. Un acabado que sella por completo atrapa la humedad interior y termina desprendiéndose.',
    'El empaque de 25 kg se produce con menor huella de carbono y es reutilizable y reciclable.',
  ],
};

/** Section 7.0 — handling and storage for 25 kg bagged dry mortars. */
const HANDLING_BAG = {
  t: 'pairs',
  n: '7.0',
  title: 'Manejo y almacenamiento',
  pairs: [
    { label: 'Almacenamiento', p: 'Sacos cerrados, sobre tarima, en lugar seco y ventilado, separados de muros y piso húmedo. Vida útil de 6 meses en empaque original cerrado. Estibar máximo 10 sacos y consumir por lote.' },
    { label: 'Seguridad', p: 'Producto alcalino: usar guantes, gafas y mascarilla N95/FFP2 al amasar. Evitar contacto prolongado con la piel y lavar con agua abundante en caso de contacto. Mantener fuera del alcance de los niños. No verter residuos al drenaje.' },
  ],
};

/** Section 7.0 — handling and storage for liquid products in pails. */
const HANDLING_LIQUID = {
  t: 'pairs',
  n: '7.0',
  title: 'Manejo y almacenamiento',
  pairs: [
    { label: 'Almacenamiento', p: 'Envase original bien cerrado, en lugar fresco, seco y a la sombra, entre 5 y 30 °C. Proteger de la congelación y del sol directo: una vez congelado el producto pierde sus propiedades. Vida útil de 12 meses en envase cerrado.' },
    { label: 'Seguridad', p: 'Producto no inflamable y de baja toxicidad. Usar guantes y gafas; evitar el contacto con los ojos y lavar con agua abundante en caso de contacto. No ingerir. Mantener fuera del alcance de los niños. No verter residuos al drenaje ni a cuerpos de agua.' },
  ],
};

/** Common lab-values disclaimer, dry mortars. */
const NOTICE_MORTAR =
  'Valores típicos obtenidos en laboratorio a 23 °C y 50 % HR; no constituyen especificación de garantía. ' +
  'El desempeño en obra depende del sustrato, el espesor, la dosificación de agua y las condiciones de aplicación ' +
  'y curado. Se recomienda un paño de prueba en cada proyecto. La formulación del producto es información ' +
  'propietaria de S-35.';

/** Composition table note. */
const COMPOSITION_NOTE =
  'La composición se declara por función. La formulación y las proporciones son información propietaria de S-35.';

/** "Qué resuelve en obra" rows shared by the hydrophobic stucco line. */
const SOLVES_HYDROPHOBIC = [
  ['Salitre y manchas blancas', 'Corta la entrada de agua, que es el vehículo de las sales.'],
  ['Humedad de fachada y lluvia batiente', 'Absorción capilar reducida sin sellar el muro.'],
  ['Ampollas y desprendimiento de pintura', 'Permeable al vapor: el muro seca hacia afuera.'],
  ['Microfisuras del acabado', 'Sistema polimérico que aporta flexibilidad.'],
];

/** Fig. 2 — water absorption over time versus a conventional stucco. */
function absorptionChart(label) {
  return {
    cap: 'Fig. 2 · Absorción de agua en el tiempo frente a un estuco convencional',
    yTop: 'alta',
    yBottom: 'nula',
    xLabels: [{ x: 44, label: '0 min' }, { x: 110, label: '30 min' }, { x: 200, label: '24 h' }],
    series: [
      {
        tone: 'ref',
        points: [[0, 0], [18, 42], [37, 67], [58, 81], [94, 89]],
        label: 'Estuco convencional sin hidrófugo: se satura en minutos.',
      },
      {
        tone: 'accent',
        points: [[0, 0], [18, 6], [37, 10], [58, 13], [94, 15]],
        label: label,
      },
    ],
    foot: 'Curva de referencia de laboratorio; el desempeño real depende del sustrato y del espesor aplicado.',
  };
}

/** Properties rows shared verbatim by the hydrophobic stucco line. */
const PROPS_SHARED_TAIL = [
  ['Agua de amasado', '24 – 28 % · 6.0 – 7.0 L por saco', 'Ajustar el agua según la consistencia deseada en obra; la adición excesiva puede atenuar el tono final y comprometer la resistencia mecánica.', 'Interno'],
  ['Tiempo abierto de trabajo', '60 – 90 min a 23 °C', 'Ventana amplia para extender y afinar; se acorta con calor y viento.', 'EN 1015-9'],
  ['Absorción capilar de agua', 'Clase W1 · ≤ 0.40 kg/m²·min<sup>0.5</sup>', 'Repelencia media: reduce de forma marcada la absorción de agua líquida, de modo que la lluvia escurre en lugar de penetrar.', 'EN 1015-18'],
  ['Permeabilidad al vapor', 'µ ≤ 15', 'El muro respira: la humedad interna sale y no ampolla el acabado.', 'EN 1015-19'],
];

const PROPS_SHARED_END = [
  ['Resistencia a compresión', 'Clase CS II · 1.5 – 5.0 MPa', 'Resistente pero deformable: acompaña al muro sin fisurar por rigidez.', 'EN 1015-11'],
  ['Densidad aparente en polvo', '1.2 – 1.4 g/cm³', 'Un saco de 25 kg ocupa cerca de 19 litros: fácil de estibar y dosificar.', 'ASTM C29'],
  ['pH (pasta fresca)', '11 – 13', 'Alcalino: usar pigmentos y pinturas resistentes a álcali, y protección personal.', 'Potenciómetro'],
  ['Reacción al fuego', 'Clase A1 · incombustible', 'Producto mineral: no aporta carga de fuego ni humo.', 'EN 13501-1'],
  ['Temperatura de aplicación', '5 – 35 °C · ver nota para clima extremo', 'Evitar sol directo intenso, viento fuerte y riesgo de lluvia en las 24 h. Arriba de 35 °C aplica el protocolo de calor extremo. <br>(<i>Ver Sección 6.1</i>)', 'Interno'],
];

module.exports = {
  PLATE_HYDROPHOBIC,
  HOW_IT_WORKS_HYDROPHOBIC,
  HEAT_PROTOCOL,
  ANNEX_HYDROPHOBIC,
  HANDLING_BAG,
  HANDLING_LIQUID,
  NOTICE_MORTAR,
  COMPOSITION_NOTE,
  SOLVES_HYDROPHOBIC,
  absorptionChart,
  PROPS_SHARED_TAIL,
  PROPS_SHARED_END,
};
