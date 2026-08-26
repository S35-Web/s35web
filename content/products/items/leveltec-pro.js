'use strict';

const { draft, NOTICE_VERIFIED } = require('../sheet');

// Contenido tomado de la ficha de Leveltec Pro® que entregó el equipo.
// Densidades, tiempos, resistencias, adherencia y contracción son estimaciones
// de referencia: no se asignan métodos de ensayo que no vengan en esa ficha.

module.exports = draft({
  slug: 'leveltec-pro',
  code: 'FT-PP-003',
  family: 'pro-systems',
  status: 'verified',
  name: 'LEVELTEC',
  variant: 'Pro',
  line: 'Nivelante cementante de pisos para uso profesional',
  accent: '#9aa318',
  packaging: '35 kg',
  description: 'Leveltec Pro: mortero nivelante cementante para corregir irregularidades y preparar pisos antes del revestimiento. Interior y exterior. Saco de 35 kg.',
  strip: [
    'Nivelante cementante de pisos · uso profesional',
    '2–10 mm por capa · saco de 35 kg',
  ],
  lead: 'Mortero nivelante de base cementante para corregir irregularidades, nivelar y dejar una base lisa, uniforme y resistente antes de instalar el revestimiento. Residencial, comercial e industrial; interior y exterior. No es un recubrimiento de acabado aparente ni un adhesivo de loseta. No es autonivelante: se tiende con llana, rastra o regla.',
  pack: '/Assets/productos_background/LEVELTEC-pro.jpg',
  packAlt: 'Saco de 35 kg de Leveltec Pro, nivelante cementante de pisos',
  identification: [
    { label: 'Tipo de producto', value: 'Mortero nivelante cementante para pisos' },
    { label: 'Función', value: 'Nivelar y preparar el firme antes del revestimiento' },
    { label: 'Presentación', value: 'Saco de 35 kg · color gris cemento' },
  ],
  kpis: [
    { value: '35 kg', label: 'saco · producto seco' },
    { value: '4.0 L', label: 'agua de amasado por saco' },
    { value: '2–10 mm', label: 'espesor recomendado por capa' },
    { value: '≈ 3.88 m²', label: 'rendimiento de referencia a 5 mm' },
  ],
  sections: [
    {
      kind: 'prose',
      n: '1.0',
      title: 'Cómo funciona',
      prose: [
        'Se amasa solo con agua y se tiende sobre el concreto para regular el plano: corrige desniveles y pequeñas irregularidades, y deja una base sólida para cerámico, porcelánico, vinílico, alfombra u otro revestimiento compatible.',
        'Es un mortero de aplicación asistida. No sustituye a Cemento Plástico (acabado aparente) ni a Pegaxpress (adhesivo de pieza). Tampoco debe tomarse por autonivelante, salvo que S-35 lo especifique por escrito.',
      ],
    },
    {
      kind: 'properties',
      n: '2.0',
      title: 'Propiedades y qué significan',
      rows: [
        {
          param: 'Aspecto y color',
          value: 'Polvo gris cemento',
          practical: 'El tono del polvo es el del cemento; no es un acabado aparente de piso.',
          method: 'Visual',
        },
        {
          param: 'Agua de amasado',
          value: '4.0 L por saco de 35 kg · ≈ 11.4 %',
          practical: 'Dosificar el agua; de más ablanda el mortero y baja resistencias. No añadir agua una vez empezada la aplicación.',
          method: 'Ficha',
        },
        {
          param: 'Densidad aparente del polvo',
          value: '≈ 1.40 kg/L',
          practical: 'Sirve para estimar volumen de estiba y dosificación en obra.',
          method: 'Estimado',
        },
        {
          param: 'Densidad de mezcla fresca',
          value: '≈ 2.01 kg/L',
          practical: 'Un saco rinde cerca de 19.4 L de mezcla colocada.',
          method: 'Estimado',
        },
        {
          param: 'Espesor de aplicación',
          value: '2 – 10 mm por capa',
          practical: 'Debajo de 2 mm no regulariza; arriba de 10 mm hay que consultar a Especificaciones S-35.',
          method: 'Ficha',
        },
        {
          param: 'Tiempo de trabajabilidad',
          value: '≈ 25 – 30 min a 23 °C',
          practical: 'Ventana corta: tender en cuanto esté homogeneizado. El calor la acorta.',
          method: 'Estimado',
        },
        {
          param: 'Fraguado',
          value: 'Inicio ≈ 35 – 50 min · final ≈ 50 – 75 min',
          practical: 'No retemplar con agua el material que ya empezó a endurecer.',
          method: 'Estimado',
        },
        {
          param: 'Tránsito peatonal ligero',
          value: '≈ 4 – 6 h',
          practical: 'Criterio en condiciones normales; proteger de tránsito, sol, viento y agua mientras endurece.',
          method: 'Estimado',
        },
        {
          param: 'Recibir revestimiento cerámico',
          value: '≈ 24 h',
          practical: 'Depende del clima, el espesor y el sustrato. En vinílicos, verificar humedad residual con el fabricante del piso.',
          method: 'Estimado',
        },
        {
          param: 'Resistencia a compresión',
          value: '≈ 14 MPa a 1 día · ≈ 22 MPa a 7 días · ≈ 30 MPa a 28 días',
          practical: 'Base sólida para tránsito y para recibir el recubrimiento; no es un concreto estructural.',
          method: 'Estimado',
        },
        {
          param: 'Resistencia a flexión a 28 días',
          value: '≈ 5.5 MPa',
          practical: 'Acompaña pequeños movimientos del firme sin deshacerse.',
          method: 'Estimado',
        },
        {
          param: 'Adherencia al concreto',
          value: '≈ 1.5 MPa',
          practical: 'El sustrato tiene que estar firme y limpio; el aditivo no pega sobre polvo, grasa o concreto suelto.',
          method: 'Estimado',
        },
        {
          param: 'Contracción lineal a 28 días',
          value: '≤ 0.10 %',
          practical: 'Baja merma estimada; aun así hay que respetar juntas del proyecto.',
          method: 'Estimado',
        },
        {
          param: 'Temperatura de aplicación',
          value: 'Evitar por debajo de 5 °C o por encima de 50 °C',
          practical: 'No aplicar sobre superficies congeladas. Con calor o viento, evitar que la mezcla pierda agua demasiado rápido.',
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
          title: 'Base lista para el piso',
          text: 'Deja un plano liso y uniforme para cerámico, porcelánico, vinílico, alfombra y otros revestimientos compatibles.',
        },
        {
          title: 'Ventana de obra más corta',
          text: 'Fraguado pensado para transitar a las 4–6 h y, como criterio, recibir cerámico a las 24 h, según clima y espesor.',
        },
        {
          title: 'Interior, exterior y radiante',
          text: 'Sirve en losa de concreto en ambos ambientes y puede formar parte de un sistema de piso con calefacción radiante.',
        },
      ],
    },
    {
      kind: 'items',
      n: '4.0',
      title: 'Usos y sustratos',
      items: [
        {
          title: 'Concreto y losas.',
          text: 'Nivelación y regularización de superficies de concreto, desniveles y pequeñas irregularidades.',
        },
        {
          title: 'Antes del revestimiento.',
          text: 'Preparar el firme para cerámico, porcelánico, vinílico, alfombra u otro recubrimiento compatible.',
        },
        {
          title: 'Interior y exterior.',
          text: 'También sobre sistemas de piso radiante, como parte del paquete de instalación.',
        },
        {
          title: 'No aplicar sobre.',
          text: 'Superficies contaminadas, débiles o inestables, congeladas, metal, madera, pintura, impermeabilizantes u otros sustratos no contemplados sin consultar a Especificaciones S-35. No es adhesivo de loseta ni acabado aparente.',
        },
      ],
    },
    {
      kind: 'tables',
      n: '5.0',
      title: 'Rendimiento',
      tables: [
        {
          label: 'Por saco de 35 kg',
          head: ['Espesor', 'Área aproximada'],
          rows: [
            ['2 mm', '≈ 9.7 m²'],
            ['5 mm', '≈ 3.88 m²'],
            ['10 mm', '≈ 1.9 m²'],
          ],
          note: 'Volumen aproximado de mezcla colocada: ≈ 19.4 L por saco. El consumo sube con rugosidad, absorción, desperdicio y espesor real.',
        },
        {
          label: 'Qué cambia el consumo',
          head: ['Variable', 'Efecto'],
          rows: [
            ['Rugosidad del firme', 'Más material para rellenar huecos.'],
            ['Absorción del concreto', 'Puede pedir más mezcla o un criterio de imprimación con Especificaciones S-35.'],
            ['Método y desperdicio', 'Llana, rastra y recortes alteran el rendimiento de catálogo.'],
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
          text: 'Firme, estable, limpio, sin polvo, grasa, aceites ni partes sueltas. Reparar grietas, oquedades y desprendimientos. Quitar concreto débil o pulverulento. En absorbentes altos, poco absorbentes o casos especiales, consultar a Especificaciones S-35 antes de instalar.',
        },
        {
          title: '2. Amasar.',
          text: 'Poner 4.0 L de agua limpia en recipiente o mezcladora. Agregar el saco poco a poco y mezclar a baja velocidad hasta pasta homogénea, sin grumos. Evitar revoluciones altas (incorporan aire). No añadir agua extra al aplicar, ni cemento, arena, cal u otros aditivos.',
        },
        {
          title: '3. Aplicar.',
          text: 'Verter sobre el sustrato y distribuir con llana, rastra o regla hasta el espesor de 2 a 10 mm. No rebasar 10 mm por capa sin consultar. No mezclar sobre el piso de concreto: usar cubeta o equipo. No es autonivelante.',
        },
        {
          title: '4. Curar y proteger.',
          text: 'Proteger de tránsito prematuro, calor extremo, sol, viento, agua y suciedad mientras endurece. Tránsito peatonal ligero: unas 4 a 6 h en condiciones normales. Cerámico: unas 24 h, sujeto a clima, espesor y sustrato.',
        },
        {
          title: '5. Recibir el piso.',
          text: 'En vinílicos y revestimientos sensibles a humedad, comprobar que la humedad residual del nivelante cumpla lo que pide el fabricante del piso.',
        },
        {
          title: '6. Lo que no hacer.',
          text: 'No retemplar. No usar agua de más. No aplicar sobre firme inestable. No instalar sobre metal, madera, pintura u otros sustratos ajenos a esta ficha sin consulta previa.',
        },
      ],
    },
    {
      kind: 'callout',
      n: '6.1',
      title: 'Condiciones de aplicación',
      intro: 'Trabajabilidad y fraguado cambian con el clima, el sustrato y el agua. Ajustar la faena; no forzar el producto.',
      points: [
        {
          title: 'Qué lo modifica.',
          text: 'Temperatura del aire y del firme, humedad relativa, absorción, espesor, ventilación, cantidad de agua y el método de tendido.',
        },
        {
          title: 'Límites de temperatura.',
          text: 'Por debajo de 5 °C o por encima de 50 °C el comportamiento puede cambiar. No aplicar sobre superficies congeladas.',
        },
        {
          title: 'Calor o viento.',
          text: 'Evitar que la mezcla pierda humedad demasiado rápido durante el tendido y el fraguado inicial.',
        },
        {
          title: 'Sustrato.',
          text: 'Tiene que estar estructuralmente estable y limpio. Un firme contaminado o débil no se arregla con más agua ni con más capa.',
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
          text: 'Envase original cerrado, en lugar fresco, seco y protegido de la humedad. Sacos sobre tarima, sin contacto con piso húmedo. Proteger de lluvia y condensación en almacén y transporte. Vida útil de 12 meses desde fabricación, si se conserva cerrado y en esas condiciones.',
        },
        {
          label: 'Seguridad',
          text: 'Base cementante: al amasar con agua genera medio alcalino. Usar guantes, gafas y protección respiratoria. Evitar contacto prolongado con piel y ojos; lavar con agua abundante. Si hay irritación persistente, atención médica. No ingerir. Mantener fuera del alcance de los niños.',
        },
      ],
    },
    {
      kind: 'notes',
      n: 'Anexo',
      title: 'Datos de interés',
      notes: [
        'Leveltec Pro no es autonivelante salvo especificación expresa de S-35.',
        'No es Cemento Plástico ni Pegaxpress: nivela el firme; no es el acabado aparente ni el adhesivo de la pieza.',
        'Para metal, madera, pintura, impermeabilizantes u otros sustratos no contemplados, consultar al Departamento de Especificaciones S-35.',
        'Densidad, fraguado, resistencias, adherencia y contracción son valores estimados de referencia y deben confirmarse con ensayos de laboratorio sobre el producto.',
      ],
    },
  ],
  notice: 'Los valores de densidad aparente, tiempos de fraguado, resistencias mecánicas, adherencia y contracción son estimaciones técnicas de referencia y deberán confirmarse mediante ensayos de laboratorio sobre el producto. ' + NOTICE_VERIFIED,
});
