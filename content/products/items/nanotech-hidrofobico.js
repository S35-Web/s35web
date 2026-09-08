'use strict';

// Contenido tomado de la ficha oficial "Ficha Tecnica Sellador Hidrofobico"
// (FT-PR-005 · Rev. 01 · 2026).

const liquidVerified = require('../liquid-verified');
const S = require('../shared');

module.exports = liquidVerified({
  slug: 'nanotech-hidrofobico',
  code: 'FT-PR-005',
  name: 'NANOTECH',
  variant: 'Sellador hidrofóbico S-35',
  line: 'Sellador hidrofóbico transparente',
  accent: '#8bb432',
  packaging: 'Cubeta 1 L',
  pack: '/Assets/productos_thumbs/nanotech-hidrofobico.jpg',
  packAlt: 'Envase de 1 L de Nanotech Sellador hidrofóbico S-35',
  packLabel: 'Fig. A · presentación 1 L',
  description: 'Nanotech Sellador Hidrofóbico S-35: compuesto líquido transparente de baja viscosidad que crea una barrera hidrofóbica invisible sobre materiales pétreos. 1 L, 1 galón, cubeta 19 L y 200 L.',
  strip: [
    'Barrera hidrofóbica invisible para materiales pétreos',
    '1 litro · 1 galón · cubeta 19 L · 200 litros',
  ],
  lead: 'Sellador Hidrofóbico Premium S-35® es un compuesto líquido transparente y de baja viscosidad formulado con polímeros modificados de alta calidad, para proteger superficies de la humedad y crear una barrera hidrofóbica que repele el agua de manera efectiva. No altera la apariencia original del material tratado: el agua forma gotas que perlan y escurren, sin penetrar.',
  identification: [
    { label: 'Tipo de producto', value: 'Emulsión de polímeros modificados, líquido transparente' },
    { label: 'Función', value: 'Barrera hidrofóbica invisible, no forma película visible' },
    { label: 'Presentaciones', value: '1 litro · 1 galón · cubeta 19 L · 200 litros' },
  ],
  kpis: [
    { value: 'Invisible', label: 'no altera el color ni la apariencia original' },
    { value: 'Puro', label: 'se aplica sin diluir, directo de envase' },
    { value: '24 h', label: 'tiempo de curado, sin exposición a agua' },
    { value: 'No tóxico', label: 'no flamable' },
  ],
  sections: [
    {
      kind: 'prose',
      n: '1.0',
      title: 'Cómo funciona',
      prose: [
        'El producto es una emulsión de polímeros modificados. Aplicado sobre un material pétreo, penetra en su estructura porosa y forma una barrera hidrofóbica a nivel molecular, sin crear una película superficial visible ni cambiar el color, la textura o el brillo del material.',
        'Esa barrera hace que el agua ya no penetre: al contacto, forma gotas que perlan sobre la superficie y escurren, en lugar de absorberse. El material queda protegido de la humedad sin dejar rastro visible del tratamiento.',
      ],
      plate: {
        title: 'Lám. I — Agua fuera, vapor libre',
        sub: 'corte del material tratado',
        layers: [
          { kind: 'drops', note: 'gota de agua' },
          { kind: 'grain', pattern: 'vertical' },
          { kind: 'grain', pattern: 'diagonal' },
          { kind: 'ticks', note: 'vapor que sale' },
        ],
        legend: [
          '<em>1.</em> Barrera hidrofóbica: el agua perla y escurre',
          '<em>2.</em> El material sigue permeable al vapor',
        ],
        foot: 'No forma película visible: el material se ve igual que sin tratar.',
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
            ['Polímeros modificados de baja viscosidad', 'Penetración profunda y barrera hidrofóbica a nivel molecular.'],
            ['Vehículo transparente', 'Se evapora al curar, sin dejar película ni cambiar la apariencia.'],
            ['Aditivos estabilizantes', 'Uniformidad de penetración en la superficie tratada.'],
          ],
          note: S.COMPOSITION_NOTE,
        },
        {
          label: 'Qué resuelve en obra',
          head: ['Problema', 'Respuesta del producto'],
          rows: [
            ['Humedad que penetra fachadas y muros', 'Barrera hidrofóbica que repele el agua antes de que se absorba.'],
            ['Acabados que no deben cambiar de apariencia', 'No forma película visible; el material se ve igual que sin tratar.'],
            ['Piedra, block y tabique expuestos a intemperie', 'Protege el material sin sellar su porosidad natural al vapor.'],
            ['Fachadas de microconcreto y estuco', 'Repele el agua y reduce manchas de humedad y salitre.'],
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
          value: 'Líquido transparente, baja viscosidad',
          practical: 'Fluye y penetra con facilidad en superficies porosas.',
          method: 'Visual',
        },
        {
          param: 'Efecto sobre la apariencia',
          value: 'Ninguno visible',
          practical: 'No oscurece, abrillanta ni cambia el acabado del material tratado.',
          method: 'Visual',
        },
        {
          param: 'Efecto hidrofóbico',
          value: 'Perlado del agua al contacto',
          practical: 'El agua forma gotas y escurre en lugar de absorberse.',
          method: 'Visual',
        },
        {
          param: 'Modo de aplicación',
          value: 'Puro, sin diluir',
          practical: 'Se usa directo del envase; no se mezcla con agua ni con otros aditivos.',
          method: 'Interno',
        },
        {
          param: 'Tiempo de curado',
          value: '24 horas',
          practical: 'La superficie no debe mojarse durante este periodo para que la barrera se forme correctamente.',
          method: 'Interno',
        },
        {
          param: 'Permeabilidad al vapor',
          value: 'Se conserva',
          practical: 'El material sigue respirando: repele agua líquida sin bloquear el vapor.',
          method: 'Interno',
        },
        {
          param: 'Toxicidad e inflamabilidad',
          value: 'No tóxico · no flamable',
          practical: 'Manejo seguro en obra sin restricciones especiales de transporte.',
          method: 'Etiqueta',
        },
      ],
    },
    {
      kind: 'cards',
      n: '4.0',
      title: 'Beneficios',
      cards: [
        {
          title: 'Protección sin cambiar la apariencia',
          text: 'No forma película ni altera el color, la textura o el brillo del material tratado.',
        },
        {
          title: 'Repele el agua, deja pasar el vapor',
          text: 'Bloquea la entrada de agua líquida sin sellar la porosidad natural del material.',
        },
        {
          title: 'Aplicación directa',
          text: 'Se usa puro, con brocha, rodillo o aspersor, sin preparar mezclas ni diluciones.',
        },
      ],
    },
    {
      kind: 'items',
      n: '5.0',
      title: 'Usos y sustratos',
      items: [
        { title: 'Fachadas de microconcreto.', text: 'Protección hidrofóbica sin alterar el acabado original.' },
        { title: 'Fachadas interiores y exteriores.', text: 'Muros y paredes expuestos a humedad o intemperie.' },
        { title: 'Estuco, piedra, block y tabique.', text: 'Materiales pétreos y de mampostería expuestos.' },
        { title: 'Paredes y tableros de yeso.', text: 'Protección hidrofóbica en interiores sensibles a la humedad.' },
      ],
    },
    {
      kind: 'steps',
      n: '6.0',
      title: 'Modo de empleo',
      steps: [
        { title: '1. Preparar la superficie.', text: 'Asegurarse de que esté limpia, seca y libre de polvo, grasa o contaminantes.' },
        { title: '2. Aplicar el producto.', text: 'Con brocha, rodillo o aspersor, extendiéndolo de manera uniforme sobre la superficie, empapándola bien.' },
        { title: '3. Dejar secar.', text: 'Permitir que el sellador penetre y seque por completo, alrededor de 24 horas.' },
        { title: '4. Cuidar el curado.', text: 'Durante las 24 horas de secado, evitar que la superficie se moje.' },
        { title: '5. Reaplicación (opcional).', text: 'Para mayor protección, aplicar una segunda capa después del secado completo de la primera.' },
        { title: 'Especialmente recomendado.', text: 'Proteger fachadas de microconcreto, fachadas interiores y exteriores, estuco, piedra, block y tabique, y paredes y tableros de yeso.' },
      ],
    },
    {
      kind: 'pairs',
      n: '7.0',
      title: 'Manejo y almacenamiento',
      pairs: [
        {
          label: 'Almacenamiento',
          text: 'Envase cerrado, en lugar fresco y ventilado, protegido de heladas y de la luz solar directa. Vida útil de 12 meses en empaque original cerrado.',
        },
        {
          label: 'Seguridad',
          text: 'No tóxico, no flamable. Evitar contacto prolongado con los ojos; en caso de contacto, lavar con agua abundante. Mantener fuera del alcance de los niños. No verter residuos al drenaje.',
        },
      ],
    },
  ],
  notice: 'Valores típicos de referencia para la categoría, obtenidos en laboratorio a 23 °C y 50 % HR; no constituyen especificación de garantía. El desempeño en obra depende del sustrato, la porosidad, el número de capas y las condiciones de aplicación y curado. Se recomienda una prueba en un área pequeña antes de aplicar en toda la superficie. La formulación del producto es información propietaria de S-35.',
});
