'use strict';

const { draft, NOTICE_VERIFIED } = require('./sheet');

// Ficha común de Basecoat Plus (Gris y Blanco Absoluto).
// Datos de mortero para paneles de cemento, yeso y poliestireno, adaptados a
// saco de 25 kg. No se copia marca, imprimador ni garantía de terceros.
// El PDF de referencia no trae ensayos ANSI/NMX ni rendimientos en m²: no se inventan.

function basecoatPlus(tone) {
  const color = tone.color;
  const colorLower = tone.colorLower;

  return draft({
    slug: tone.slug,
    code: tone.code,
    family: 'panel-system',
    status: 'verified',
    name: 'BASECOAT PLUS',
    variant: tone.variant,
    line: 'Adhesivo y recubrimiento para paneles de cemento, yeso y poliestireno',
    accent: tone.accent,
    packaging: '25 kg',
    description: tone.seo,
    strip: [
      'Interior y exterior · microfibras · alta impermeabilidad',
      tone.variant + ' · saco de 25 kg',
    ],
    lead: tone.lead,
    pack: tone.pack,
    packAlt: tone.packAlt,
    identification: [
      { label: 'Tipo de producto', value: 'Adhesivo y recubrimiento base cemento, con resinas y microfibras' },
      { label: 'Función', value: 'Base de panel · pegado de placas y molduras EPS · recubrimiento' },
      { label: 'Color', value: color },
    ],
    kpis: [
      { value: '25 kg', label: 'saco · producto seco' },
      { value: '6.1 L', label: 'agua de amasado con llana (24.5 %)' },
      { value: '7.5 L', label: 'agua con brocha o compresor (30 %)' },
      { value: '8–38 °C', label: 'temperatura de la superficie' },
    ],
    sections: [
      {
        kind: 'prose',
        n: '1.0',
        title: 'Cómo funciona',
        prose: [
          'Mortero de la línea Panel System en ' + colorLower + '. Sirve en tres modos: como base sobre paneles de cemento, yeso y poliestireno que van a recibir texturizado o pintura; como adhesivo de placas y molduras de poliestireno sobre concreto, block, ladrillo o yeso ya sellado; y como recubrimiento decorativo de molduras de EPS.',
          'Las resinas dan agarre y manejabilidad. Las microfibras reducen agrietamientos. El recubrimiento aporta un alto grado de impermeabilidad y se flotea; encima puede ir textura o pintura.',
        ],
      },
      {
        kind: 'properties',
        n: '2.0',
        title: 'Propiedades y qué significan',
        rows: [
          {
            param: 'Función',
            value: 'Base, adhesivo y recubrimiento de panel',
            practical: 'Un mortero para la capa de protección del sistema de panel y para pegar placas o molduras de EPS.',
            method: 'Ficha',
          },
          {
            param: 'Color',
            value: color,
            practical: tone.colorPractical,
            method: 'Ficha',
          },
          {
            param: 'Agua · aplicación con llana',
            value: '24.5 % · 6.1 L por saco de 25 kg',
            practical: 'Consistencia de trabajo con llana. No “al ojo” y no añadir agua después de amasar. Remezclar de vez en cuando.',
            method: 'Ficha',
          },
          {
            param: 'Agua · brocha o compresor',
            value: '30 % · 7.5 L por saco de 25 kg',
            practical: 'Mezcla más fluida para proyección o brocha. No pasar de 7.5 L. No usar esta dosificación si se trabaja con llana.',
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
            param: 'Impermeabilidad',
            value: 'Alto grado · protege contra humedad',
            practical: 'Capa de protección del panel y la fachada contra humedad.',
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
        ],
      },
      {
        kind: 'cards',
        n: '3.0',
        title: 'Beneficios',
        cards: [
          {
            title: 'Tres modos de trabajo',
            text: 'Base sobre el panel, adhesivo de placas y molduras de EPS, y recubrimiento decorativo. Interior y exterior.',
          },
          {
            title: 'Microfibras e impermeabilidad',
            text: 'Refuerzo disperso contra fisuras de retracción y un recubrimiento que protege contra humedad.',
          },
          {
            title: 'Llana o proyección',
            text: 'Dos dosificaciones de agua: 6.1 L para llana y 7.5 L para brocha o compresor. Cada una a su herramienta.',
          },
        ],
      },
      {
        kind: 'items',
        n: '4.0',
        title: 'Usos y sustratos',
        items: [
          {
            title: 'Como base sobre paneles.',
            text: 'Cemento, yeso sellado y poliestireno que van a recibir texturizados o pintura. Capa de protección del sistema de panel.',
          },
          {
            title: 'Como adhesivo de EPS.',
            text: 'Hojas y molduras de poliestireno expandido o extruido sobre concreto colado, block, ladrillo o paneles de yeso ya sellados.',
          },
          {
            title: 'Como recubrimiento decorativo.',
            text: 'Molduras y placas de poliestireno: dos capas con malla, floteado, y luego textura o pintura si el proyecto lo pide.',
          },
          {
            title: 'No aplicar sobre.',
            text: 'Tablas de yeso sin sellar, OSB (viruta de madera), plástico, madera, metal, ni inmersión prolongada de agua. El imprimador del yeso lo indica Especificaciones S-35.',
          },
        ],
      },
      {
        kind: 'tables',
        n: '5.0',
        title: 'Dosificación y modos',
        tables: [
          {
            label: 'Agua por saco de 25 kg',
            head: ['Herramienta', 'Agua', 'Qué esperar'],
            rows: [
              ['Llana', '6.1 L (24.5 %)', 'Consistencia de tendido y cordones. No añadir más agua.'],
              ['Brocha o compresor', '7.5 L (30 %)', 'Mezcla más fluida para proyección. No usar esta agua con llana.'],
            ],
            note: 'Reposo de 10 min y rebatir. Remezclar de vez en cuando. El rendimiento cambia con la rugosidad y el espesor: esta ficha no asigna un m² único por saco.',
          },
          {
            label: 'Cómo se usa',
            head: ['Modo', 'Qué hacer'],
            rows: [
              ['Como adhesivo', 'Capa lisa + cordones horizontales en el muro y en la placa. Asentar y presionar con llana de plástico.'],
              ['Como recubrimiento', 'Primera capa, embeber malla, segunda capa, esperar 20–30 min y flotar con esponja.'],
            ],
          },
          {
            label: 'Alcance de esta ficha',
            head: ['Sustrato / uso', 'Criterio'],
            rows: [
              ['Yeso sin sellar, OSB, plástico, madera, metal', 'No aplicar.'],
              ['Inmersión prolongada', 'No aplicar.'],
              ['Loseta o nivelación de piso', 'Usar Pegaxpress o Leveltec.'],
              ['Pegado y revestido dedicado de EPS en Pro+', 'Styrobond Pro+.'],
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
            text: 'Sustrato sólido, limpio: sin polvo, rebabas, grasa, pintura, ácidos ni aceite. Humedecer ligeramente, sin saturar. El yeso debe ir sellado; el imprimador lo indica Especificaciones S-35.',
          },
          {
            title: '2. Amasar.',
            text: 'En cubeta o charola de plástico: 6.1 L de agua por saco si se trabaja con llana, o 7.5 L si se aplica con brocha o compresor. Mezclar sin grumos, reposar 10 min y remezclar. No añadir más agua. No mezclar sobre el firme de concreto.',
          },
          {
            title: '3. Pegar la placa (si aplica).',
            text: 'Con el lado liso, una capa sobre el muro. Con el dentado, cordones horizontales paralelos. Lo mismo en la cara de la placa. Colocar la placa alineada al rallado, presionar con llana de plástico suave en toda el área.',
          },
          {
            title: '4. Juntas antes de revestir.',
            text: 'Cuando las placas estén fijas: desvanecer bordes, tratar juntas y puntos críticos, y dejar la cara limpia de polvo.',
          },
          {
            title: '5. Recubrir con malla.',
            text: 'Primera capa fresca. Colocar la malla de refuerzo y embeberla con llana lisa. Esperar unos minutos sin dejar secar del todo. Segunda capa hasta cubrir la malla. En paneles de yeso o fibrocemento la malla va si el sistema lo pide.',
          },
          {
            title: '6. Flotar y acabar.',
            text: 'Esperar 20 a 30 min según el clima. Flotar con esponja. Encima puede ir texturizado o pintura cuando el recubrimiento haya curado. No retemplar ni añadir agua extra.',
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
            title: 'Dos aguas, dos herramientas.',
            text: '6.1 L es para llana. 7.5 L es para brocha o compresor. No mezclar los dos criterios en la misma cubeta.',
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
          'Gris y Blanco Absoluto son el mismo producto en color distinto: misma dosificación, mismos usos, mismo saco de 25 kg.',
          'El acabado fino hidrófugo sobre el sistema, si el proyecto lo pide, es Waxtard Extra Anclaje.',
          'El yeso debe ir sellado. El imprimador no se indica en esta ficha: consultar a Especificaciones S-35.',
          'Esta ficha no asigna ensayos ANSI ni rendimientos en m²: el PDF de referencia no los trae. El consumo lo define el espesor y la rugosidad en obra.',
        ],
      },
    ],
    notice: NOTICE_VERIFIED,
  });
}

module.exports = basecoatPlus;
