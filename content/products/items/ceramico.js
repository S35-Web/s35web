'use strict';

const { draft, NOTICE_VERIFIED } = require('../sheet');

// Ficha de Pegaxpress Cerámico. Valores de adhesivo tipo B (ANSI A118.1 /
// NMX-C-420) adaptados a saco de 25 kg. No se copia marca, certificado,
// imprimador ni garantía de terceros. Agua al 23–26 % sobre 25 kg.

module.exports = draft({
  slug: 'ceramico',
  code: 'FT-AD-002',
  family: 'adhesivos-pro',
  status: 'verified',
  name: 'PEGAXPRESS',
  variant: 'Cerámico',
  line: 'Adhesivo para cerámica de media y alta absorción',
  accent: '#0277bd',
  packaging: '25 kg',
  description: 'Pegaxpress Cerámico: adhesivo cementoso tipo B en seco para piezas cerámicas de media y alta absorción, en piso, muro y lambrín interiores. Saco de 25 kg.',
  strip: [
    'Adhesivo para cerámica · piso, muro y lambrín interiores',
    'Tipo B · saco de 25 kg',
  ],
  lead: 'Mortero adhesivo de cemento Portland, cargas seleccionadas y aditivos, para pegar recubrimiento cerámico de media y alta absorción sobre sustrato firme base cemento, rugoso o liso. Uso interior: estancias, recámaras, cocinas y baños. No es para porcelánico de baja o nula absorción, ni para inmersión, ni para nivelar el firme.',
  pack: '/Assets/productos_background/ceramico.png',
  packAlt: 'Saco de 25 kg de Pegaxpress Cerámico',
  identification: [
    { label: 'Tipo de producto', value: 'Mortero adhesivo cementoso tipo B, en seco' },
    { label: 'Función', value: 'Pegado de cerámica de media y alta absorción en interior' },
    { label: 'Referencia normativa', value: 'ANSI A118.1 · NMX-C-420-1-ONNCCE-2017' },
  ],
  kpis: [
    { value: '25 kg', label: 'saco · producto seco' },
    { value: '5.75–6.5 L', label: 'agua de amasado por saco (23–26 %)' },
    { value: '90 min', label: 'vida en charola a 23 °C' },
    { value: '24 h', label: 'tránsito y emboquillado' },
  ],
  sections: [
    {
      kind: 'prose',
      n: '1.0',
      title: 'Cómo funciona',
      prose: [
        'La pieza cerámica de media y alta absorción toma agua del mortero: eso da retención y agarre sobre firme de cemento. El adhesivo pega; no nivela. Los desniveles se corrigen con Leveltec.',
        'Para porcelánico de baja o nula absorción usar Porcelánico Universal. Para piso sobre piso, Ultraforce o Pegaxpress Piso sobre piso. Para alberca, Ultraforce. En formatos de 40 × 40 cm o más, doble encolado.',
      ],
    },
    {
      kind: 'properties',
      n: '2.0',
      title: 'Propiedades y qué significan',
      rows: [
        {
          param: 'Clasificación',
          value: 'Adhesivo tipo B',
          practical: 'Mortero cementoso para cerámica de absorción habitual; no es tipo C ni semiflexible.',
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
          value: '90 min a 23 °C y 48 % HR',
          practical: 'Ventana más corta que Ultraforce o PSP. Colocar mientras el adhesivo esté fresco al tacto.',
          method: 'NMX-C-420',
        },
        {
          param: 'Resistencia a tensión (estándar)',
          value: '≈ 0.75 MPa · 7.5 kg/cm²',
          practical: 'Agarre de clase ANSI A118.1 sobre azulejo tipo B, en condiciones de laboratorio.',
          method: 'ANSI A118.1',
        },
        {
          param: 'Resistencia a compresión a 28 días',
          value: '≈ 7.0 MPa · 70 kg/cm²',
          practical: 'Cuerpo del mortero ya curado; no sustituye un concreto estructural.',
          method: 'NMX-C-420',
        },
        {
          param: 'Resistencia al corte',
          value: '≈ 2.1 MPa · 21 kg/cm²',
          practical: 'Aguanta despellejado en uso residencial interior de referencia.',
          method: 'ANSI A118.1',
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
          practical: 'Con calor o viento, humedecer sustrato y pieza sin saturar. Consultar a Especificaciones S-35 en clima extremo o exterior.',
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
          title: 'Cerámica de obra interior',
          text: 'Piso, muro y lambrín en estancias, recámaras, cocinas y baños. Media y alta absorción.',
        },
        {
          title: 'Trabajo sencillo',
          text: 'Amasado solo con agua, 90 min de vida en charola y desplazamiento acotado en muro.',
        },
        {
          title: 'Sustrato de cemento',
          text: 'Firme rugoso o liso de base cemento. En concreto pulido, consultar a Especificaciones S-35.',
        },
      ],
    },
    {
      kind: 'items',
      n: '4.0',
      title: 'Usos y sustratos',
      items: [
        {
          title: 'Piso, muro y lambrín interiores.',
          text: 'Cerámica de media y alta absorción sobre sustrato firme base cemento, rugoso o liso. Resistente a la humedad de baño y cocina, no a inmersión.',
        },
        {
          title: 'No usar en baja o nula absorción.',
          text: 'Porcelánico y pieza densa: Porcelánico Universal. Formato exigente, mármol o tráfico industrial: Ultraforce.',
        },
        {
          title: 'No usar en inmersión ni piso sobre piso.',
          text: 'Alberca, fuente o cisterna: Ultraforce. Loseta sobre loseta: Pegaxpress Piso sobre piso. Exterior y fachada: consultar a Especificaciones S-35.',
        },
        {
          title: 'Sustratos ajenos.',
          text: 'Metal, impermeabilizante, panel de yeso sin sellar o superficie no descrita: consultar. Sobre yeso, el imprimador lo indica Especificaciones S-35; no se prescribe aquí un sellador de otra marca.',
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
          label: 'Alcance de esta ficha',
          head: ['Situación', 'Criterio'],
          rows: [
            ['Uso principal', 'Interior: piso, muro y lambrín.'],
            ['Exterior / fachada', 'Consultar a Especificaciones S-35.'],
            ['Concreto pulido', 'Consultar a Especificaciones S-35.'],
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
          text: 'Estructuralmente firme, sólido y nivelado. Quitar polvo, rebabas, grasa, aceites e impermeabilizantes. Limpiar también el reverso de la pieza. El concreto nuevo: mínimo 14 días de fraguado. Recubrimientos a la sombra antes de pegar.',
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
          text: 'Colocar la pieza con el adhesivo fresco al tacto. Embeber con mazo de hule. Levantar una pieza de control: cobertura mínima 95 %. Retirar el exceso de las juntas antes de emboquillar.',
        },
        {
          title: '5. Juntas y tránsito.',
          text: 'Separadores, crucetas o niveladores según el fabricante del recubrimiento. Transitar y emboquillar a las 24 h, salvo que el clima pida más espera.',
        },
        {
          title: '6. Lo que no hacer.',
          text: 'No retemplar. No usar en inmersión ni sobre pieza de nula absorción. No pegar sobre metal, impermeabilizante o sustratos ajenos a esta ficha sin consulta. En calor (> 35 °C aire o > 50 °C sustrato) humedecer sin saturar.',
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
          text: 'Piezas desde 40 × 40 cm: adhesivo en la pieza y en el sustrato. Baja el rendimiento por saco.',
        },
        {
          title: 'Exterior y pulido.',
          text: 'Fachada, exterior y concreto pulido: consultar a Especificaciones S-35. Esta ficha es de uso interior.',
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
        'No sustituye a Leveltec: este producto pega la pieza; no nivela el firme.',
        'No es Pegaxpress Porcelánico Universal ni Ultraforce: aquí la pieza es cerámica de media y alta absorción, en interior.',
        'No es Pegaxpress Piso sobre piso ni Pegaxpress Block.',
        'Sobre paneles de yeso, sellar la cara con el imprimador que indique Especificaciones S-35; no se prescribe aquí un sellador de otra marca.',
        'Los valores de tensión, corte, desplazamiento y vida en charola son típicos de adhesivo tipo B según ANSI A118.1 y NMX-C-420, a 23 °C. No constituyen especificación de garantía.',
      ],
    },
  ],
  notice: NOTICE_VERIFIED,
});
