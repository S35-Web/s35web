'use strict';

const { draft, NOTICE_VERIFIED } = require('../sheet');

// Ficha de Pegaxpress Ultraforce. Valores de adhesivo tipo C semiflexible
// (ANSI A118.4 / NMX-C-420) adaptados a saco de 25 kg. No se copia marca,
// certificado, imprimador ni garantía de terceros. Agua al 23–26 % sobre 25 kg.

module.exports = draft({
  slug: 'ultraforce',
  code: 'FT-AD-003',
  family: 'adhesivos-pro',
  status: 'verified',
  name: 'PEGAXPRESS',
  variant: 'Ultraforce',
  line: 'Adhesivo semiflexible de alto desempeño',
  accent: '#7b1fa2',
  packaging: '25 kg',
  description: 'Pegaxpress Ultraforce: adhesivo cementoso semiflexible con adherencia química superior para piezas de alta gama, piso sobre piso, inmersión y tráfico industrial. Saco de 25 kg.',
  strip: [
    'Adhesivo semiflexible · interior, exterior e inmersión',
    'Tipo C · saco de 25 kg',
  ],
  lead: 'Mortero adhesivo semiflexible de granulometría media, modificado con polímeros, para pegar piezas de alta gama. Soporta flexiones, vibraciones, cambios de temperatura, inmersión permanente y tráfico industrial. Sirve también para piso sobre piso. Los desniveles se corrigen con Leveltec.',
  pack: '/Assets/productos_background/ultraforce.png',
  packAlt: 'Saco de 25 kg de Pegaxpress Ultraforce',
  identification: [
    { label: 'Tipo de producto', value: 'Mortero adhesivo cementoso semiflexible tipo C, modificado con polímeros' },
    { label: 'Función', value: 'Pegado de pieza de alta gama, piso sobre piso, inmersión y tráfico industrial' },
    { label: 'Referencia normativa', value: 'ANSI A118.1 / A118.4 · NMX-C-420-1-ONNCCE-2017' },
  ],
  kpis: [
    { value: '25 kg', label: 'saco · producto seco' },
    { value: '5.75–6.5 L', label: 'agua de amasado por saco (23–26 %)' },
    { value: '120 min', label: 'vida en charola a 23 °C' },
    { value: '24 h', label: 'tránsito y emboquillado' },
  ],
  sections: [
    {
      kind: 'prose',
      n: '1.0',
      title: 'Cómo funciona',
      prose: [
        'Los polímeros dan adherencia química y una deformación acotada: la pieza sigue microflexiones y vibraciones del soporte (hasta L/360) sin despegarse como un adhesivo rígido convencional.',
        'Para mármol, cantera, granito, gran formato, cochera, alberca y piso sobre piso en uso industrial. En formatos de 40 × 40 cm o más, doble encolado.',
      ],
    },
    {
      kind: 'properties',
      n: '2.0',
      title: 'Propiedades y qué significan',
      rows: [
        {
          param: 'Clasificación',
          value: 'Adhesivo tipo C semiflexible',
          practical: 'Mortero cementoso modificado para pieza exigente, inmersión y tráfico industrial.',
          method: 'NMX-C-420',
        },
        {
          param: 'Agua de amasado',
          value: '23 – 26 % · 5.75 – 6.5 L por saco de 25 kg',
          practical: 'En clima extremo puede moverse ± 2 %. No añadir agua después de amasar. Rebatir cada 15 min, a la sombra.',
          method: 'Ficha',
        },
        {
          param: 'Desplazamiento',
          value: '≤ 2 mm',
          practical: 'La pieza no resbala al asentar en muro si el rallado y el peso están en rango.',
          method: 'NMX-C-420',
        },
        {
          param: 'Vida en charola / tiempo abierto',
          value: '120 min a 23 °C y 48 % HR',
          practical: 'Colocar mientras el adhesivo esté fresco al tacto. Calor, viento o sustrato caliente acortan la ventana.',
          method: 'NMX-C-420',
        },
        {
          param: 'Resistencia a tensión (estándar)',
          value: '≈ 1.10 MPa · 11 kg/cm²',
          practical: 'Agarre de clase ANSI A118.4 sobre azulejo tipo C, en condiciones de laboratorio.',
          method: 'ANSI A118.4',
        },
        {
          param: 'Resistencia a compresión a 28 días',
          value: '≈ 15 MPa · 150 kg/cm²',
          practical: 'Cuerpo del mortero ya curado, para asentar la pieza.',
          method: 'NMX-C-420',
        },
        {
          param: 'Resistencia al corte',
          value: '≈ 3.0 MPa · 30 kg/cm²',
          practical: 'Aguanta despellejado en uso comercial, industrial y tráfico pesado de referencia.',
          method: 'ANSI A118.4',
        },
        {
          param: 'Flexión y vibración',
          value: 'Hasta L/360',
          practical: 'Pensado para soportes que se mueven un poco: losa, madera de grado exterior o tráfico con impacto.',
          method: 'Ficha',
        },
        {
          param: 'Tránsito y emboquillado',
          value: '24 h',
          practical: 'Esperar al menos un día antes de caminar o aplicar la boquilla. El clima puede alargar el tiempo.',
          method: 'Ficha',
        },
        {
          param: 'Llenado de alberca o fuente',
          value: 'Mínimo 7 días',
          practical: 'La inmersión permanente espera a que el adhesivo haya tomado. La dureza máxima es a 28 días.',
          method: 'Ficha',
        },
        {
          param: 'Concreto nuevo',
          value: 'Fraguado mínimo 14 días',
          practical: 'No pegar sobre firme fresco: espera a que el concreto haya tomado.',
          method: 'Ficha',
        },
        {
          param: 'Temperatura de aplicación',
          value: 'No por debajo de 5 °C; cuidado sobre 35 °C (aire) o 50 °C (sustrato)',
          practical: 'Con calor o viento, humedecer sustrato y pieza sin saturar. Consultar a Especificaciones S-35 en clima extremo o fachada.',
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
          title: 'Semiflexible y de alta gama',
          text: 'Adherencia química y deformación acotada para mármol, cantera, granito y formatos exigentes, con piso sobre piso incluido.',
        },
        {
          title: 'Inmersión permanente',
          text: 'Albercas, fuentes, espejos de agua y muros llorones. Llenar a los 7 días; no usar Pegaxpress Piso sobre piso en inmersión.',
        },
        {
          title: 'Tráfico industrial',
          text: 'Cocheras, estacionamientos y agencias. El recubrimiento asentado puede cargar el peso de un montacargas cuando el sistema está bien ejecutado.',
        },
      ],
    },
    {
      kind: 'items',
      n: '4.0',
      title: 'Usos y sustratos',
      items: [
        {
          title: 'Piso, muro y piso sobre piso.',
          text: 'Interior y exterior en uso residencial, comercial e industrial. Cerámica existente, concreto pulido, block, tabique y repello cemento-arena capaz de cargar el peso extra.',
        },
        {
          title: 'Recubrimientos de alta gama.',
          text: 'Pétreos, mármol, cantera, granito, cerámicos y porcelánicos (consultar ficha del recubrimiento). Excepto slates y mármol verde. Formato libre sobre firme: doble encolado.',
        },
        {
          title: 'Inmersión y tráfico pesado.',
          text: 'Albercas, fuentes, espejos de agua, muros llorones, cocheras, estacionamientos y agencias automotrices. Llenar el vaso a los 7 días como mínimo.',
        },
        {
          title: 'Sustratos especiales.',
          text: 'Madera de grado exterior y paneles de yeso o cemento solo si están preparados. Sobre yeso, sellar la cara con el imprimador que indique Especificaciones S-35; no se prescribe aquí un sellador de otra marca. Metal, impermeabilizante o superficie no descrita: consultar.',
        },
      ],
    },
    {
      kind: 'tables',
      n: '5.0',
      title: 'Rendimiento',
      tables: [
        {
          label: 'Por saco de 25 kg, superficie lisa',
          head: ['Llana dentada cuadrada', 'Área aproximada'],
          rows: [
            ['6 mm (1/4″ × 1/4″ × 1/4″)', '≈ 7.5 m²'],
            ['6 × 10 mm (1/4″ × 3/8″ × 1/4″)', '≈ 4.75 m²'],
            ['13 mm (1/2″ × 1/2″ × 1/2″)', '≈ 3.25 m²'],
          ],
          note: 'Llana a 60° según NMX-C-420. El dibujo posterior de la pieza y el desnivel cambian el consumo. Doble encolado reduce el rendimiento.',
        },
        {
          label: 'Límites de pieza en muro',
          head: ['Recubrimiento', 'Criterio'],
          rows: [
            ['Peso en muro', 'Hasta 70 kg de recubrimiento, no más de 2.5 m de altura.'],
            ['Arriba de esa altura', 'Anclaje mecánico y consulta a Especificaciones S-35.'],
            ['Mármol o piedra en fachada', 'Anclaje mecánico; no basta el adhesivo solo.'],
            ['Desde 40 × 40 cm', 'Llana de 13 mm y doble capa: pieza y sustrato.'],
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
          title: '1. Preparar el sustrato.',
          text: 'Estructuralmente firme, sólido y nivelado. Quitar polvo, rebabas, grasa, aceites e impermeabilizantes. Limpiar también el reverso de la pieza. El concreto nuevo: mínimo 14 días de fraguado. Pieza hueca: se retira, no se cubre. Recubrimientos a la sombra antes de pegar.',
        },
        {
          title: '2. Amasar.',
          text: 'En cubeta o charola limpia, 5.75 a 6.5 L de agua por saco de 25 kg. Mezclar sin grumos, reposar 5 a 10 min y remezclar. Mezclador eléctrico a baja velocidad. No añadir más agua. No mezclar sobre el firme de concreto.',
        },
        {
          title: '3. Tender.',
          text: 'Con el lado liso, una capa no más gruesa que el diente. Con el lado dentado, surcos rectos y paralelos. En vertical, rallado horizontal. El sobrante vuelve a la charola. Rebatir cada 15 min, a la sombra, sin agua extra.',
        },
        {
          title: '4. Asentar.',
          text: 'Colocar la pieza con el adhesivo fresco al tacto. Embeber con mazo de hule. Levantar una pieza de control: cobertura mínima 95 % en interior y exterior. Retirar el exceso de las juntas antes de emboquillar.',
        },
        {
          title: '5. Juntas y tránsito.',
          text: 'Separadores, crucetas o niveladores según el fabricante del recubrimiento. Transitar y emboquillar a las 24 h, salvo que el clima pida más espera. Alberca o fuente: llenar a los 7 días como mínimo.',
        },
        {
          title: '6. Lo que no hacer.',
          text: 'No retemplar. No pegar sobre metal, impermeabilizante o sustratos ajenos a esta ficha sin consulta. En calor (> 35 °C aire o > 50 °C sustrato) humedecer sin saturar. No abrasión directa sobre el adhesivo antes de 28 días.',
        },
      ],
    },
    {
      kind: 'callout',
      n: '6.1',
      title: 'Condiciones de aplicación',
      intro: 'Tiempo abierto, secado y rendimiento cambian con el clima, el sustrato y la llana. No forzar el adhesivo.',
      points: [
        {
          title: 'Deshidratación.',
          text: 'Si el adhesivo ya no está fresco al tacto, no asienta: se descarta el tendido y se vuelve a peinar material fresco.',
        },
        {
          title: 'Clima extremo.',
          text: 'Por debajo de 5 °C no aplicar. Arriba de 35 °C o con viento, humedecer y consultar a Especificaciones S-35; la especificación puede ajustarse.',
        },
        {
          title: 'Doble encolado.',
          text: 'Piezas desde 40 × 40 cm, gran formato e interior/exterior exigente: adhesivo en la pieza y en el sustrato. Baja el rendimiento por saco.',
        },
        {
          title: 'Alberca y fachada.',
          text: 'Llenar el vaso a los 7 días. En fachada y piedra natural, anclaje mecánico y consulta a Especificaciones S-35.',
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
          text: 'Producto cementante alcalino al amasar. Usar guantes, gafas y mascarilla. Evitar contacto prolongado con piel y ojos; lavar con agua. No ingerir. Mantener fuera del alcance de los niños. No verter residuos al drenaje.',
        },
      ],
    },
    {
      kind: 'notes',
      n: 'Anexo',
      title: 'Datos de interés',
      notes: [
        'Ultraforce pega pieza de alta gama, cubre inmersión, vibración y tráfico industrial, y también piso sobre piso. Para solo loseta sobre loseta sin inmersión, Pegaxpress Piso sobre piso. Nivelación del firme: Leveltec.',
        'Sobre paneles de yeso, sellar la cara con el imprimador que indique Especificaciones S-35; no se prescribe aquí un sellador de otra marca.',
        'Los valores de tensión, corte, desplazamiento y vida en charola son típicos de adhesivo tipo C semiflexible según ANSI A118.4 y NMX-C-420, a 23 °C. No constituyen especificación de garantía.',
      ],
    },
  ],
  notice: NOTICE_VERIFIED,
});
