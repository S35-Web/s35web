'use strict';

const { draft, NOTICE_VERIFIED } = require('../sheet');

// Ficha de Pegaxpress Porcelánico Universal. Valores de adhesivo tipo C
// (ANSI A118.4 / NMX-C-420) adaptados a saco de 25 kg. No se copia marca,
// imprimador ni garantía de terceros. Agua al 23–27 % sobre 25 kg.

module.exports = draft({
  slug: 'porcelanico-universal',
  code: 'FT-AD-001',
  family: 'adhesivos-pro',
  status: 'verified',
  name: 'PEGAXPRESS',
  variant: 'Porcelánico Universal',
  line: 'Adhesivo para porcelánico y porcelanato',
  accent: '#e65100',
  packaging: '25 kg',
  description: 'Pegaxpress Porcelánico Universal: adhesivo cementoso tipo C enriquecido con polímeros para piezas porcelánicas y porcelanato hasta 90 × 90 cm. Saco de 25 kg.',
  strip: [
    'Adhesivo para porcelánico · firmes interior y exterior',
    'Tipo C · saco de 25 kg',
  ],
  lead: 'Mortero adhesivo de granulometría media, enriquecido con polímeros, para pegar porcelánico y porcelanato de baja absorción. El dorso denso no toma agua como la cerámica habitual: el adhesivo tiene que mojar pieza y soporte. Porcelánico hasta 90 × 90 cm; cerámico en cualquier formato.',
  pack: '/Assets/productos_background/porcelanico.png',
  packAlt: 'Saco de 25 kg de Pegaxpress Porcelánico Universal',
  identification: [
    { label: 'Tipo de producto', value: 'Mortero adhesivo cementoso tipo C, enriquecido con polímeros' },
    { label: 'Función', value: 'Pegado de porcelánico, porcelanato y cerámico; piso sobre piso interior residencial' },
    { label: 'Referencia normativa', value: 'ANSI A118.1 / A118.4 · NMX-C-420-1-ONNCCE-2017' },
  ],
  kpis: [
    { value: '25 kg', label: 'saco · producto seco' },
    { value: '5.75–6.75 L', label: 'agua de amasado por saco (23–27 %)' },
    { value: '120 min', label: 'vida en charola a 23 °C' },
    { value: '90 × 90 cm', label: 'porcelánico máximo de esta ficha' },
  ],
  sections: [
    {
      kind: 'prose',
      n: '1.0',
      title: 'Cómo funciona',
      prose: [
        'El porcelánico absorbe poco. Los polímeros mojan el dorso denso y el firme, con 120 min de vida en charola para asentar y ajustar. El desplazamiento llega a 4 mm: en muro hay que rallar bien y no forzar el peso.',
        'Porcelánico hasta 90 × 90 cm. Formatos mayores, inmersión, tráfico industrial o pieza de alta gama: Ultraforce. Cerámica de media y alta absorción en interior: Pegaxpress Cerámico. Los desniveles se corrigen con Leveltec. Desde 40 × 40 cm, doble encolado.',
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
          practical: 'Mortero cementoso modificado para porcelánico y pieza de baja absorción.',
          method: 'NMX-C-420',
        },
        {
          param: 'Agua de amasado',
          value: '23 – 27 % · 5.75 – 6.75 L por saco de 25 kg',
          practical: 'En clima extremo puede moverse ± 2 %. No añadir agua después de amasar. Rebatir cada 15 min, a la sombra.',
          method: 'Ficha',
        },
        {
          param: 'Desplazamiento',
          value: '≤ 4 mm',
          practical: 'Más holgura que Cerámico o Ultraforce. En muro, rallado horizontal y asiento inmediato; no dejar la pieza “colgando”.',
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
          value: '≈ 0.9 MPa · 9 kg/cm²',
          practical: 'Agarre de clase ANSI A118.4 sobre azulejo tipo C, en condiciones de laboratorio.',
          method: 'ANSI A118.4',
        },
        {
          param: 'Resistencia a compresión a 28 días',
          value: '≈ 11.5 MPa · 115 kg/cm²',
          practical: 'Cuerpo del mortero ya curado, para asentar la pieza.',
          method: 'NMX-C-420',
        },
        {
          param: 'Resistencia al corte',
          value: '≈ 1.9 MPa · 19 kg/cm²',
          practical: 'Aguanta despellejado en uso residencial y comercial de tránsito medio.',
          method: 'ANSI A118.4',
        },
        {
          param: 'Formato de porcelánico',
          value: 'Hasta 90 × 90 cm',
          practical: 'Arriba de ese formato, o en fachada, consultar a Especificaciones S-35; el recambio habitual es Ultraforce.',
          method: 'Ficha',
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
          title: 'Porcelánico y porcelanato',
          text: 'Pensado para pieza densa de baja absorción hasta 90 × 90 cm, con 120 min para asentar y ajustar.',
        },
        {
          title: 'Piso sobre piso interior',
          text: 'Coloca recubrimiento nuevo sobre cerámica existente firme, en interior residencial, sin demoler el piso viejo.',
        },
        {
          title: 'Firmes interior y exterior',
          text: 'Piso sobre concreto, block o tabique en uso residencial y comercial de tránsito medio. Fachada: consultar.',
        },
      ],
    },
    {
      kind: 'items',
      n: '4.0',
      title: 'Usos y sustratos',
      items: [
        {
          title: 'Porcelánico, cerámico y piso sobre piso.',
          text: 'Porcelánico hasta 90 × 90 cm. Cerámico en cualquier formato. Piso sobre piso: interior residencial, sobre pieza existente firme. Firmes: interior y exterior, residencial y comercial. Muros: interior residencial y comercial.',
        },
        {
          title: 'Recubrimientos.',
          text: 'Porcelánicos, cerámicos, mallas, blocks de vidrio y pétreos (consultar ficha del recubrimiento). Excepto slates y mármol verde.',
        },
        {
          title: 'Sustratos.',
          text: 'Cemento-arena capaz de cargar el peso extra, concreto pulido, block, tabique, cerámica existente y paneles de yeso o cemento preparados. Sobre yeso, el imprimador lo indica Especificaciones S-35; no se prescribe aquí un sellador de otra marca.',
        },
        {
          title: 'No aplicar en.',
          text: 'Inmersión permanente (alberca, fuente, cisterna): Ultraforce. Formato mayor de 90 × 90 cm, tráfico industrial o pieza de alta gama: Ultraforce. Metal, impermeabilizante o superficie no descrita: consultar. Fachada: consultar a Especificaciones S-35.',
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
            ['Porcelánico', 'Hasta 90 × 90 cm.'],
            ['Piso sobre piso', 'Interior residencial, pieza existente firme.'],
            ['Firmes', 'Interior y exterior, residencial y comercial.'],
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
          text: 'Estructuralmente firme, sólido y nivelado. Quitar polvo, rebabas, grasa, aceites e impermeabilizantes. Limpiar también el reverso de la pieza. El concreto nuevo: mínimo 14 días de fraguado. Pieza hueca: se retira, no se cubre. Recubrimientos a la sombra antes de pegar.',
        },
        {
          title: '2. Amasar.',
          text: 'En cubeta o charola limpia, 5.75 a 6.75 L de agua por saco de 25 kg. Mezclar sin grumos, reposar 5 a 10 min y remezclar. Mezclador eléctrico a baja velocidad. No añadir más agua. No mezclar sobre el firme de concreto.',
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
          text: 'Separadores, crucetas o niveladores según el fabricante del recubrimiento. Transitar y emboquillar a las 24 h, salvo que el clima pida más espera.',
        },
        {
          title: '6. Lo que no hacer.',
          text: 'No retemplar. No usar en inmersión. No pegar porcelánico mayor de 90 × 90 cm con esta ficha. No pegar sobre metal, impermeabilizante o sustratos ajenos sin consulta. En calor (> 35 °C aire o > 50 °C sustrato) humedecer sin saturar.',
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
          text: 'Piezas desde 40 × 40 cm y porcelánico en general: adhesivo en la pieza y en el sustrato. Baja el rendimiento por saco.',
        },
        {
          title: 'Fachada y formato grande.',
          text: 'Fachada: consultar a Especificaciones S-35. Por encima de 90 × 90 cm o inmersión: Ultraforce.',
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
        'Esta ficha es tipo C para pieza densa hasta 90 × 90 cm. Cerámica de media y alta absorción en interior: Pegaxpress Cerámico. Inmersión, tráfico industrial o formato mayor: Ultraforce. Piso sobre piso más exigente: Pegaxpress Piso sobre piso o Ultraforce. Nivelación del firme: Leveltec.',
        'Sobre paneles de yeso, sellar la cara con el imprimador que indique Especificaciones S-35; no se prescribe aquí un sellador de otra marca.',
        'Los valores de tensión, corte, desplazamiento y vida en charola son típicos de adhesivo tipo C según ANSI A118.4 y NMX-C-420, a 23 °C. No constituyen especificación de garantía.',
      ],
    },
  ],
  notice: NOTICE_VERIFIED,
});
