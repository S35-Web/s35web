'use strict';

// Ficha común de la línea Waxtard de acabado (Perla, Absoluto, Gris).
// El desempeño es el de la ficha verificada de Blanco Perla; lo que cambia
// es el color del acabado y el saco.

function waxtardPremium(tone) {
  const name = 'WAXTARD';
  const full = name + ' ' + tone.variant;

  return {
    slug: tone.slug,
    code: tone.code,
    family: 'estucos-premium',
    status: 'verified',

    name: name,
    variant: tone.variant,
    line: 'Estuco premium hidrófugo',
    accent: tone.accent,
    packaging: '25 kg',
    rev: '01',
    year: '2026',

    seo: {
      description: tone.seo,
    },

    strip: [
      'Estuco premium hidrófugo · exteriores e interiores',
      'Antisalitre · saco de 25 kg',
    ],

    lead: tone.lead,

    figures: {
      pack: {
        src: tone.packSrc,
        alt: tone.packAlt,
        label: 'Fig. B · presentación',
      },
      powder: {
        src: null,
        alt: full + ' en polvo, con detalle de grano',
        caption: ['Fig. A', 'Producto en polvo', 'grano ≤ 1.2 mm'],
      },
    },

    identification: [
      { label: 'Tipo de producto', value: 'Mortero seco de acabado, base cementante mineral' },
      { label: 'Función', value: 'Estuco hidrófugo · antisalitre · exterior e interior' },
      { label: 'Referencia normativa', value: 'Mortero de revoco tipo GP · EN 998-1 / ASTM C926' },
    ],

    kpis: [
      { value: '25 kg', label: 'saco · producto seco' },
      { value: '6.0–7.0 L', label: 'agua de amasado por saco' },
      { value: '5–7 m²', label: 'rendimiento por saco a 3 mm' },
      { value: '2–5 mm', label: 'espesor por capa' },
    ],

    sections: [
      {
        kind: 'prose',
        n: '1.0',
        title: 'Cómo funciona',
        prose: [
          'El producto trabaja en dos frentes. La base mineral fragua y se une al sustrato como cualquier mortero de acabado, mientras el sistema polimérico le da flexibilidad y adherencia sobre superficies difíciles.',
          'Sobre eso actúa el sistema hidrófugo: recubre internamente los poros y hace que el agua líquida no entre por capilaridad, pero deja libre el paso del vapor. Ese equilibrio es lo que frena el salitre, porque el salitre no es más que sal que viaja con el agua y cristaliza al secar. Sin agua entrando, no hay sal aflorando.',
        ],
        plate: {
          title: 'Lám. I — Agua fuera, vapor libre',
          sub: 'corte del acabado',
          layers: [
            { kind: 'drops', note: 'gota de agua' },
            { kind: 'grain', pattern: 'vertical' },
            { kind: 'grain', pattern: 'diagonal' },
            { kind: 'ticks', note: 'vapor que sale' },
          ],
          legend: [
            '<em>1.</em> Acabado hidrófugo: rechaza el agua líquida',
            '<em>2.</em> Sustrato: mantiene su permeabilidad al vapor',
          ],
          foot: 'Sin agua entrando no hay sales migrando: el muro no salitra ni ampolla.',
        },
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
              ['Agregados minerales calcáreos seleccionados', tone.aggregateAporta],
              ['Cementantes hidráulicos', 'Fraguado, resistencia mecánica y anclaje al sustrato.'],
              ['Sistema polimérico redispersable', 'Adherencia, flexibilidad y resistencia a fisuración.'],
              ['Sistema hidrófugo', 'Repelencia al agua líquida y acción antisalitre.'],
              ['Aditivos reológicos y retenedores de agua', 'Trabajabilidad, tiempo abierto y acabado sin cuarteo.'],
            ],
            note: 'La composición se declara por función. La formulación y las proporciones son información propietaria de S-35.',
          },
          {
            label: 'Qué resuelve en obra',
            head: ['Problema', 'Respuesta del producto'],
            rows: [
              ['Salitre y manchas blancas', 'Corta la entrada de agua, que es el vehículo de las sales.'],
              ['Humedad de fachada y lluvia batiente', 'Absorción capilar reducida sin sellar el muro.'],
              ['Ampollas y desprendimiento de pintura', 'Permeable al vapor: el muro seca hacia afuera.'],
              ['Microfisuras del acabado', 'Sistema polimérico que aporta flexibilidad.'],
              tone.finishProblem,
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
            value: tone.aspectoValue,
            practical: tone.aspectoPractical,
            method: 'Visual',
          },
          {
            param: 'Granulometría máxima',
            value: '≤ 1.2 mm',
            practical: 'Permite capas delgadas y acabado terso a llana o esponja.',
            method: 'ASTM C136',
          },
          {
            param: 'Agua de amasado',
            value: '24 – 28 % · 6.0 – 7.0 L por saco',
            practical: 'Ajustar el agua según la consistencia deseada en obra; la adición excesiva puede atenuar el tono final y comprometer la resistencia mecánica.',
            method: 'Interno',
          },
          {
            param: 'Tiempo abierto de trabajo',
            value: '60 – 90 min a 23 °C',
            practical: 'Ventana amplia para extender y afinar; se acorta con calor y viento.',
            method: 'EN 1015-9',
          },
          {
            param: 'Absorción capilar de agua',
            value: 'Clase W1 · ≤ 0.40 kg/m²·min<sup>0.5</sup>',
            practical: 'Repelencia media: reduce de forma marcada la absorción de agua líquida, de modo que la lluvia escurre en lugar de penetrar.',
            method: 'EN 1015-18',
          },
          {
            param: 'Permeabilidad al vapor',
            value: 'µ ≤ 15',
            practical: 'El muro respira: la humedad interna sale y no ampolla el acabado.',
            method: 'EN 1015-19',
          },
          {
            param: 'Adherencia al sustrato',
            value: '≥ 0.5 MPa',
            practical: 'Agarre alto sobre repello, block y concreto; no se desprende por vibración.',
            method: 'EN 1015-12',
          },
          {
            param: 'Resistencia a compresión',
            value: 'Clase CS II · 1.5 – 5.0 MPa',
            practical: 'Resistente pero deformable: acompaña al muro sin fisurar por rigidez.',
            method: 'EN 1015-11',
          },
          {
            param: 'Densidad aparente en polvo',
            value: '1.2 – 1.4 g/cm³',
            practical: 'Un saco de 25 kg ocupa cerca de 19 litros: fácil de estibar y dosificar.',
            method: 'ASTM C29',
          },
          {
            param: 'pH (pasta fresca)',
            value: '11 – 13',
            practical: 'Alcalino: usar pigmentos y pinturas resistentes a álcali, y protección personal.',
            method: 'Potenciómetro',
          },
          {
            param: 'Reacción al fuego',
            value: 'Clase A1 · incombustible',
            practical: 'Producto mineral: no aporta carga de fuego ni humo.',
            method: 'EN 13501-1',
          },
          {
            param: 'Temperatura de aplicación',
            value: '5 – 35 °C · ver nota para clima extremo',
            practical: 'Evitar sol directo intenso, viento fuerte y riesgo de lluvia en las 24 h. Arriba de 35 °C aplica el protocolo de calor extremo <em>(ver sección 6.1)</em>.',
            method: 'Interno',
          },
        ],
      },

      {
        kind: 'cards',
        n: '4.0',
        title: 'Beneficios',
        cards: [
          {
            title: 'Repele el agua',
            text: 'La lluvia escurre en lugar de absorberse. La fachada se mantiene seca, más limpia y con menos crecimiento de moho.',
          },
          {
            title: 'Frena el salitre',
            text: 'Protección barrera contra humedad ascendente y salitre por baja permeabilidad líquida: al reducir la migración de humedad, las sales no afloran ni cristalizan en la superficie.',
          },
          {
            title: 'Rinde y perdona',
            text: 'Capas delgadas, tiempo abierto largo y buena adherencia: menos material, menos reproceso y acabado uniforme a mano.',
          },
        ],
        chart: {
          caption: 'Fig. 2 · Absorción de agua en el tiempo frente a un estuco convencional',
          yLabels: ['alta', 'nula'],
          xLabels: ['0 min', '30 min', '24 h'],
          series: [
            {
              points: '42,78 80,48 120,30 165,20 241,14',
              tone: 'ref',
              dashed: true,
              label: 'Estuco convencional sin hidrófugo: se satura en minutos.',
            },
            {
              points: '42,78 80,74 120,71 165,69 241,67',
              tone: 'accent',
              label: full + ': absorción mínima y estable.',
            },
          ],
          foot: 'Curva de referencia de laboratorio; el desempeño real depende del sustrato y del espesor aplicado.',
        },
      },

      {
        kind: 'items',
        n: '5.0',
        title: 'Usos y sustratos',
        items: [
          {
            title: 'Fachadas y exteriores.',
            text: 'Acabado final sobre repello, block, ladrillo y concreto en zonas de lluvia, humedad o ambiente salino.',
          },
          {
            title: 'Interiores húmedos.',
            text: 'Baños, cocinas, lavanderías y muros con antecedentes de salitre o humedad ascendente.',
          },
          {
            title: 'Remodelación.',
            text: 'Renivelación de acabados existentes firmes y recuperación de muros manchados por salitre.',
          },
          {
            title: 'No aplicar sobre.',
            text: 'Yeso, madera, plástico, superficies con pintura, muros con humedad activa sin resolver ni contacto permanente con agua.',
          },
        ],
      },

      {
        kind: 'steps',
        n: '6.0',
        title: 'Modo de empleo',
        steps: [
          {
            title: '1. Preparar el sustrato.',
            text: 'Firme, limpio, sin polvo, grasa ni pintura suelta. Humedecer sin saturar. Si hay humedad activa o filtración, resolverla antes: ningún acabado sustituye una impermeabilización.',
          },
          {
            title: '2. Amasar.',
            text: 'Agregar el saco sobre 6.0 – 7.0 L de agua limpia, mezclar 3 – 5 min con batidora de bajas revoluciones, reposar 5 min y remezclar. No añadir cemento, cal, arena ni aditivos ajenos.',
          },
          {
            title: '3. Aplicar.',
            text: 'Con llana metálica o proyectado, en capas de 2 – 5 mm. Para mayor espesor, aplicar en dos capas dejando endurecer la primera.',
          },
          {
            title: '4. Afinar y curar.',
            text: 'Texturizar con esponja o llana cuando pierda brillo superficial. Proteger del sol directo, viento y lluvia las primeras 24 h; en clima cálido humedecer ligeramente.',
          },
          {
            title: '5. Pintar, si se desea.',
            text: 'Esperar al menos 7 días y usar pintura permeable al vapor. Un acabado impermeable encima anula la ventaja del sistema.',
          },
          {
            title: 'Consumo de referencia.',
            text: 'Alrededor de 4 kg/m² a 3 mm de espesor; verificar con un paño de prueba antes de calcular el pedido completo.',
          },
        ],
      },

      {
        kind: 'callout',
        n: '6.1',
        title: 'Aplicación en clima de calor extremo',
        intro: 'En regiones como Sinaloa, con temperaturas ambientales por encima de 35 °C y hasta 45 °C, el problema no es el producto sino la velocidad de evaporación: el agua se va antes de que el mortero alcance a fraguar, y eso cuesta adherencia, resistencia y repelencia. El producto sí puede aplicarse en esas condiciones siguiendo este protocolo.',
        points: [
          {
            title: 'Trabajar en las horas frescas.',
            text: 'Aplicar antes de las 11:00 o después de las 17:00, y nunca sobre muro expuesto al sol directo. Sombrear el paño con malla o lona y, si es posible, seguir la cara del edificio que esté en sombra.',
          },
          {
            title: 'Enfriar la superficie, no encharcarla.',
            text: 'El sustrato no debe pasar de 35 °C al tacto. Humedecer con neblina de agua 30 minutos antes y repetir hasta que deje de absorber de golpe; aplicar cuando esté húmedo mate, sin brillo ni escurrimiento.',
          },
          {
            title: 'Agua fría y sacos a la sombra.',
            text: 'Amasar con agua limpia fría, por debajo de 20 °C y con hielo si es necesario, y mantener el material bajo cubierta. Un saco caliente reduce el tiempo abierto a la mitad.',
          },
          {
            title: 'Lotes pequeños y avance corto.',
            text: 'Preparar solo lo que se aplique en 20 – 30 minutos y trabajar paños de 2 – 3 m². No reamasar con agua extra la mezcla que empezó a endurecer: se desecha.',
          },
          {
            title: 'Curado reforzado.',
            text: 'Humedecer con neblina 2 o 3 veces al día durante los primeros 2 días, empezando cuando el acabado ya resista el tacto. Con viento seco, cubrir con malla sombra: el viento deshidrata más que el sol.',
          },
          {
            title: 'Señales de alarma.',
            text: 'Cuarteo fino en malla, superficie que se pulveriza al frotar o pérdida de tono uniforme indican secado prematuro. Suspender la aplicación arriba de 40 °C a pleno sol o con viento superior a 30 km/h.',
          },
        ],
      },

      {
        kind: 'notes',
        n: 'Anexo',
        title: 'Datos de interés',
        notes: [
          'El salitre no aparece sin agua: son sales minerales, como sulfatos y carbonatos, presentes en los materiales, que la humedad disuelve y que cristalizan en la superficie al evaporarse. Cortar el paso del agua es cortar la migración de sales.',
          'El acabado repele el agua líquida y deja pasar el vapor. Un sello total atraparía la humedad interior y terminaría desprendiéndose.',
          'El empaque de 25 kg se produce con menor huella de carbono y es reutilizable y reciclable.',
        ],
      },

      {
        kind: 'pairs',
        n: '7.0',
        title: 'Manejo y almacenamiento',
        pairs: [
          {
            label: 'Almacenamiento',
            text: 'Sacos cerrados, sobre tarima, en lugar seco y ventilado, separados de muros y piso húmedo. Vida útil de 6 meses en empaque original cerrado. Estibar máximo 10 sacos y consumir por lote.',
          },
          {
            label: 'Seguridad',
            text: 'Producto alcalino: usar guantes, gafas y mascarilla N95/FFP2 al amasar. Evitar contacto prolongado con la piel y lavar con agua abundante en caso de contacto. Mantener fuera del alcance de los niños. No verter residuos al drenaje.',
          },
        ],
      },
    ],

    notice: 'Valores típicos obtenidos en laboratorio a 23 °C y 50 % HR; no constituyen especificación de garantía. El desempeño en obra depende del sustrato, el espesor, la dosificación de agua y las condiciones de aplicación y curado. Se recomienda un paño de prueba en cada proyecto. La formulación del producto es información propietaria de S-35.',
  };
}

module.exports = waxtardPremium;
