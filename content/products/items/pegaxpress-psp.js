'use strict';

const { draft, NOTICE_VERIFIED } = require('../sheet');

// Ficha de Pegaxpress Piso sobre piso. Los valores de clase adhesivo tipo C
// (ANSI A118.4 / NMX-C-420) se adaptan a saco de 25 kg. No se copia marca,
// primer ni garantía de terceros. El agua se expresa al 24–26 % sobre 25 kg.

module.exports = draft({
  slug: 'pegaxpress-psp',
  code: 'FT-AD-004',
  family: 'adhesivos-pro',
  status: 'verified',
  name: 'PEGAXPRESS',
  variant: 'Piso sobre piso',
  line: 'Adhesivo piso sobre piso',
  accent: '#6a1b9a',
  packaging: '25 kg',
  description: 'Pegaxpress Piso sobre piso: adhesivo cementoso polimérico para colocar recubrimiento nuevo sobre piso o muro existente, firme y bien adherido. Saco de 25 kg.',
  strip: [
    'Adhesivo piso sobre piso · interior y exterior',
    'Tipo C · saco de 25 kg',
  ],
  lead: 'Mortero adhesivo de granulometría media, con polímeros, para pegar pieza nueva sobre cerámica existente, concreto pulido, block, tabique o paneles preparados, sin demoler el recubrimiento viejo. La pieza existente debe estar firme y el brillo graso se prepara antes de pegar. Los desniveles se corrigen con Leveltec.',
  pack: '/Assets/productos_background/piso-sobre-piso.png',
  packAlt: 'Saco de 25 kg de Pegaxpress Piso sobre piso',
  identification: [
    { label: 'Tipo de producto', value: 'Mortero adhesivo cementoso tipo C, enriquecido con polímeros' },
    { label: 'Función', value: 'Pegado de recubrimiento sobre recubrimiento o firme existente' },
    { label: 'Referencia normativa', value: 'ANSI A118.1 / A118.4 · NMX-C-420-1-ONNCCE-2017' },
  ],
  kpis: [
    { value: '25 kg', label: 'saco · producto seco' },
    { value: '6.0–6.5 L', label: 'agua de amasado por saco (24–26 %)' },
    { value: '120 min', label: 'vida en charola a 23 °C' },
    { value: '24 h', label: 'tránsito y emboquillado' },
  ],
  sections: [
    {
      kind: 'prose',
      n: '1.0',
      title: 'Cómo funciona',
      prose: [
        'El soporte es la pieza o el firme que ya está: tiene que estar sano, limpio y capaz. El adhesivo aporta agarre químico y una ventana de ajuste para asentar cerámico, porcelánico, pétreos y blocks de vidrio sin levantar el piso viejo.',
        'Si la loseta suena hueca, se levanta; no se tapa con adhesivo. Los desniveles se corrigen con Leveltec, no con Pegaxpress. En formatos de 40 × 40 cm o más, doble encolado (pieza y sustrato).',
      ],
    },
    {
      kind: 'properties',
      n: '2.0',
      title: 'Propiedades y qué significan',
      rows: [
        {
          param: 'Clasificación',
          value: 'Adhesivo tipo C',
          practical: 'Mortero cementoso tipo C para pegar recubrimiento sobre recubrimiento o firme existente.',
          method: 'NMX-C-420',
        },
        {
          param: 'Agua de amasado',
          value: '24 – 26 % · 6.0 – 6.5 L por saco de 25 kg',
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
          value: '≈ 1 MPa · 10 kg/cm²',
          practical: 'Agarre de clase ANSI A118.4 sobre azulejo tipo C, en condiciones de laboratorio.',
          method: 'ANSI A118.4',
        },
        {
          param: 'Resistencia a compresión a 28 días',
          value: '≈ 13 MPa · 130 kg/cm²',
          practical: 'Cuerpo del mortero ya curado, para asentar la pieza.',
          method: 'NMX-C-420',
        },
        {
          param: 'Resistencia al corte',
          value: '≈ 2.1 MPa · 21 kg/cm²',
          practical: 'El recubrimiento resiste esfuerzos de despellejado en uso residencial y comercial.',
          method: 'ANSI A118.4',
        },
        {
          param: 'Tránsito y emboquillado',
          value: '24 h',
          practical: 'Esperar al menos un día antes de caminar o aplicar la boquilla. El clima puede alargar el tiempo.',
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
          title: 'Sin demoler el piso viejo',
          text: 'Coloca el recubrimiento nuevo sobre cerámica existente firme. Menos escombro, menos tiempo de obra.',
        },
        {
          title: 'Agarre y ajuste',
          text: 'Polímeros para adherencia química, 120 min de vida en charola y desplazamiento acotado en muro.',
        },
        {
          title: 'Interior, exterior y tráfico',
          text: 'Pisos y muros en uso residencial y comercial, incluido alto tráfico, cuando el sustrato está preparado.',
        },
      ],
    },
    {
      kind: 'items',
      n: '4.0',
      title: 'Usos y sustratos',
      items: [
        {
          title: 'Piso sobre piso y muro sobre recubrimiento.',
          text: 'Cerámica existente, concreto pulido, block, tabique y repello cemento-arena capaz de cargar el peso extra.',
        },
        {
          title: 'Recubrimientos.',
          text: 'Cerámicos, porcelánicos, mallas, blocks de vidrio y pétreos (consultar ficha del recubrimiento). Excepto slates y mármol verde.',
        },
        {
          title: 'Paneles de yeso o cemento.',
          text: 'Solo si están preparados. Sellado previo de la cara; consultar a Especificaciones S-35 el imprimador adecuado. No usar un sellador de otra marca como receta de esta ficha.',
        },
        {
          title: 'No aplicar sobre.',
          text: 'Pieza suelta o hueca, metal, impermeabilizante, vinil, madera, inmersión permanente (alberca, fuente, cisterna) ni superficies no descritas. Fachadas y exteriores exigentes: consultar a Especificaciones S-35.',
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
            ['13 mm (1/2″ × 1/2″ × 1/2″)', '≈ 3.13 m²'],
          ],
          note: 'Llana a 60° según NMX-C-420. El dibujo posterior de la pieza y el desnivel cambian el consumo. Doble encolado reduce el rendimiento.',
        },
        {
          label: 'Límites de pieza en muro',
          head: ['Recubrimiento', 'Criterio'],
          rows: [
            ['Cerámico / porcelánico', 'Hasta 10 kg por pieza, interior o exterior.'],
            ['Piedra natural', 'Hasta 60 kg/m² y no más de 2.5 m de altura.'],
            ['Arriba de esa altura', 'Anclaje mecánico y consulta a Especificaciones S-35.'],
            ['Desde 40 × 40 cm', 'Doble capa: adhesivo en pieza y en sustrato.'],
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
          text: 'Estructuralmente firme, sólido y nivelado. Quitar polvo, rebabas, grasa, aceites e impermeabilizantes. Limpiar también el reverso de la pieza. El concreto nuevo: mínimo 14 días de fraguado. Pieza hueca: se retira, no se cubre.',
        },
        {
          title: '2. Amasar.',
          text: 'En cubeta o charola limpia, 6.0 a 6.5 L de agua por saco de 25 kg. Mezclar sin grumos, reposar 5 a 10 min y remezclar. Mezclador eléctrico a baja velocidad. No añadir más agua. No mezclar sobre el firme de concreto.',
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
          text: 'Separadores o crucetas según el fabricante del recubrimiento. Transitar y emboquillar a las 24 h, salvo que el clima pida más espera.',
        },
        {
          title: '6. Lo que no hacer.',
          text: 'No retemplar. No usar en inmersión. No pegar sobre metal, impermeabilizante o sustratos ajenos a esta ficha sin consulta. En calor (> 35 °C aire o > 50 °C sustrato) humedecer sin saturar.',
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
          text: 'Piezas desde 40 × 40 cm y formatos libres sobre firme: adhesivo en la pieza y en el sustrato. Baja el rendimiento por saco.',
        },
        {
          title: 'Exteriores y fachada.',
          text: 'Consultar a Especificaciones S-35. Arriba de 2.5 m en piedra, anclaje mecánico.',
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
        'Esta ficha es para piso sobre piso y sustratos ya revestidos o lisos. Nivelación del firme: Leveltec.',
        'Sobre paneles de yeso, sellar la cara con el imprimador que indique Especificaciones S-35; no se prescribe aquí un sellador de otra marca.',
        'Los valores de tensión, corte, desplazamiento y vida en charola son típicos de adhesivo tipo C según ANSI A118.4 y NMX-C-420, a 23 °C. No constituyen especificación de garantía.',
      ],
    },
  ],
  notice: NOTICE_VERIFIED,
});
