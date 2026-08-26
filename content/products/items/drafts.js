'use strict';

const { draft } = require('../sheet');

function mortar(p) {
  return draft(Object.assign({
    kind: 'bag',
    packaging: '25 kg',
    kpis: p.kpis || [
      { value: '25 kg', label: 'saco · producto seco' },
      { value: 'Solo agua', label: 'amasado en obra' },
      { value: p.kpi3v || 'Capas de trabajo', label: p.kpi3l || 'espesor según ficha impresa' },
      { value: p.kpi4v || 'Consultar', label: p.kpi4l || 'rendimiento de referencia' },
    ],
    steps: p.steps || [
      { title: '1. Preparar el sustrato.', text: 'Firme, limpio, sin polvo, grasa ni partes sueltas. Humedecer sin saturar cuando el sustrato sea absorbente.' },
      { title: '2. Amasar.', text: 'Agregar el saco sobre agua limpia, mezclar hasta consistencia de trabajo. No añadir cemento, cal, arena ni aditivos ajenos.' },
      { title: '3. Aplicar.', text: p.apply || 'Extender con la herramienta indicada para el sistema, en el espesor de trabajo del producto.' },
      { title: '4. Curar.', text: 'Proteger de sol directo, viento y lluvia las primeras 24 h. No reamasar con agua extra la mezcla que empezó a endurecer.' },
    ],
    notes: p.notes || [
      'Esta ficha es un borrador interno: confirmar dosificación, espesores y rendimientos con la ficha impresa vigente.',
      'Un paño de prueba en el sustrato real evita sorpresas de tono, agarre y consumo.',
    ],
  }, p));
}

function liquid(p) {
  return draft(Object.assign({
    kind: 'liquid',
    packaging: p.packaging || 'Cubeta',
    kpis: p.kpis || [
      { value: 'Cubeta', label: 'presentación líquida' },
      { value: 'Listo', label: 'homogeneizar antes de usar' },
      { value: p.kpi3v || 'Brocha / rodillo', label: p.kpi3l || 'herramienta de aplicación' },
      { value: p.kpi4v || 'Consultar', label: p.kpi4l || 'rendimiento de referencia' },
    ],
    steps: p.steps || [
      { title: '1. Preparar.', text: 'Superficie limpia, firme y seca, sin polvo ni desmoldantes. Homogeneizar el envase.' },
      { title: '2. Aplicar.', text: p.apply || 'Aplicar en capa uniforme con la herramienta indicada. Respetar tiempos de secado entre manos.' },
      { title: '3. No diluir de más.', text: 'No añadir agua ni solventes ajenos salvo lo que indique la ficha impresa.' },
      { title: '4. Proteger.', text: 'Cubrir de lluvia y polvo hasta que el recubrimiento haya formado película.' },
    ],
    notes: p.notes || [
      'Producto líquido, en cubeta.',
      'Confirmar rendimiento y número de manos con la ficha impresa vigente.',
    ],
  }, p));
}

module.exports = [
  mortar({
    slug: 'cellbond-pro',
    code: 'FT-PP-002',
    family: 'pro-systems',
    legacy: true,
    name: 'CELLBOND',
    variant: 'Pro+',
    line: 'Adhesivo para block celular · descontinuado',
    accent: '#00897b',
    pack: '/Assets/productos_background/cellbond.png',
    description: 'Cellbond Pro+: producto descontinuado. Fuera de catálogo.',
    strip: ['Descontinuado · fuera de catálogo', 'Saco de 25 kg'],
    lead: 'Cellbond Pro+ está descontinuado. Esta ficha se conserva para archivo. No forma parte del catálogo vigente ni del índice público. Para asiento de block de concreto usar Pegaxpress Block.',
    identification: [
      { label: 'Tipo de producto', value: 'Adhesivo para block celular (línea anterior)' },
      { label: 'Estado', value: 'Descontinuado · fuera de catálogo' },
      { label: 'Presentación', value: 'Saco de 25 kg' },
    ],
    prose: [
      'Producto de la línea anterior, fuera de producción comercial.',
      'No usar esta ficha para especificar obra nueva. Block de concreto: Pegaxpress Block. Otros casos: consultar a Especificaciones S-35.',
    ],
    uses: [
      { title: 'Archivo.', text: 'Solo referencia de productos ya instalados.' },
      { title: 'Obra nueva.', text: 'No especificar Cellbond. Consultar la línea Pro+ vigente.' },
      { title: 'No confundir con.', text: 'Pegaxpress Block: ese es el adhesivo de block de concreto en catálogo.' },
      { title: 'Soporte.', text: 'Consultar al equipo S-35 si hay que dar mantenimiento a un paño existente.' },
    ],
    apply: 'Producto descontinuado: no aplicar en obra nueva.',
    kpi3v: 'Archivo', kpi3l: 'fuera de catálogo',
    notes: [
      'Descontinuado: no aparece en el catálogo, el índice de /productos ni el sitemap.',
    ],
  }),

  mortar({
    slug: 'pegaxpress-block',
    code: 'FT-PP-004',
    family: 'pro-systems',
    name: 'PEGAXPRESS BLOCK',
    variant: 'Pro+',
    line: 'Adhesivo para block de concreto',
    accent: '#2e7d32',
    pack: '/Assets/productos_background/pastablock.png',
    description: 'Pegaxpress Block Pro+: adhesivo profesional para pegado de block de concreto. Saco de 25 kg.',
    strip: ['Adhesivo para block de concreto', 'Línea Pro+ · saco de 25 kg'],
    lead: 'Adhesivo de la línea Pro+ para asentar block de concreto. Mortero seco, listo para amasar con agua. Borrador interno.',
    identification: [
      { label: 'Tipo de producto', value: 'Adhesivo cementoso para mampostería de concreto' },
      { label: 'Función', value: 'Pegado de block de concreto' },
      { label: 'Presentación', value: 'Saco de 25 kg' },
    ],
    prose: [
      'Mortero de asiento para block de concreto.',
      'Para loseta sobre loseta, Pegaxpress Piso sobre piso. Cellbond (block celular) está fuera de catálogo.',
    ],
    uses: [
      { title: 'Block de concreto.', text: 'Asiento y junta en muros de block.' },
      { title: 'Geometría.', text: 'Seguir el espesor de junta del proyecto.' },
      { title: 'Sustrato.', text: 'Cimentación y arranque según el proyecto estructural.' },
    ],
    apply: 'Aplicar en la junta, asentar el block y retirar el excedente antes de que filme.',
    kpi3v: 'Block', kpi3l: 'asiento de mampostería',
  }),

  liquid({
    slug: 'nanotech-hidrofobico',
    code: 'FT-LQ-001',
    family: 'liquidos',
    name: 'NANOTECH',
    variant: 'Sellador hidrofóbico',
    line: 'Sellador líquido hidrofóbico',
    accent: '#1565c0',
    pack: null,
    description: 'Nanotech Sellador Hidrofóbico: sellador líquido que repele el agua sobre superficies minerales. Cubeta.',
    strip: ['Sellador hidrofóbico', 'Líquido · cubeta'],
    lead: 'Sellador líquido de la línea Nanotech para reducir la absorción de agua en superficies minerales ya acabadas. Borrador interno. Sin fotografía de cubeta en el repositorio.',
    identification: [
      { label: 'Tipo de producto', value: 'Sellador líquido hidrofóbico' },
      { label: 'Función', value: 'Repelencia al agua en superficies minerales' },
      { label: 'Presentación', value: 'Cubeta' },
    ],
    prose: [
      'Se aplica sobre el acabado ya curado. El agua escurre; el poro no se cierra del todo como un sellador filmógeno grueso.',
    ],
    uses: [
      { title: 'Acabados minerales.', text: 'Estucos, concretos aparentes y paños porosos ya curados.' },
      { title: 'No aplicar sobre.', text: 'Superficies sucias, con humedad activa o con película que impida la penetración.' },
      { title: 'Prueba.', text: 'Un paño de prueba confirma tono y repelencia antes de atacar el paño completo.' },
    ],
    apply: 'Aplicar en capa uniforme sobre el acabado curado. No encharcar.',
  }),

  liquid({
    slug: 'sellador-premium-pintura',
    code: 'FT-LQ-002',
    family: 'liquidos',
    name: 'SELLADOR PREMIUM',
    variant: 'Para pintura',
    line: 'Sellador líquido para pintura',
    accent: '#f9a825',
    pack: null,
    description: 'Sellador Premium para pintura: sellador líquido de preparación de muros antes de pintar. Cubeta.',
    strip: ['Sellador para pintura', 'Líquido · cubeta'],
    lead: 'Sellador líquido para preparar muros antes de pintar: iguala absorción y mejora el anclaje de la pintura. Borrador interno. Sin fotografía de cubeta en el repositorio.',
    identification: [
      { label: 'Tipo de producto', value: 'Sellador líquido de preparación' },
      { label: 'Función', value: 'Preparar el paño antes de pintura' },
      { label: 'Presentación', value: 'Cubeta' },
    ],
    prose: [
      'Se aplica sobre el acabado ya seco para que la pintura no manche por absorción desigual.',
      'Un acabado impermeable encima de un sistema transpirable (Waxtard) anula esa ventaja: elegir pintura permeable al vapor cuando el sistema lo pida.',
    ],
    uses: [
      { title: 'Antes de pintar.', text: 'Muros interiores y exteriores según ficha impresa.' },
      { title: 'No aplicar sobre.', text: 'Polvo, grasa, pintura suelta ni humedad activa.' },
      { title: 'Sistema.', text: 'Respetar el tiempo de secado antes de la pintura.' },
    ],
  }),

  liquid({
    slug: 'adhesivo-darawell',
    code: 'FT-LQ-003',
    family: 'liquidos',
    name: 'DARAWELL',
    variant: 'Adhesivo',
    line: 'Adhesivo líquido vinílico',
    accent: '#8d6e63',
    pack: null,
    description: 'Adhesivo Darawell: adhesivo líquido vinílico S-35. Cubeta.',
    strip: ['Adhesivo líquido vinílico', 'Cubeta'],
    lead: 'Adhesivo líquido vinílico de la línea S-35 (Darawell). Se usa como adhesivo / ligante líquido según la ficha impresa. Borrador interno. Sin fotografía de cubeta en el repositorio.',
    identification: [
      { label: 'Tipo de producto', value: 'Adhesivo líquido vinílico' },
      { label: 'Función', value: 'Pegado / ligante en sistemas que pidan Darawell' },
      { label: 'Presentación', value: 'Cubeta' },
    ],
    prose: [
      'Producto líquido. Homogeneizar el envase. No congelar.',
    ],
    uses: [
      { title: 'Según ficha impresa.', text: 'Pegado y ligante en los sistemas que especifiquen Darawell.' },
      { title: 'Soporte.', text: 'Limpio y capaz; el vinílico no pega sobre polvo ni sobre grasa.' },
      { title: 'Almacenamiento.', text: 'Proteger de heladas. Agitar antes de usar.' },
    ],
  }),

  liquid({
    slug: 'adhesivo-heavy-duty',
    code: 'FT-LQ-004',
    family: 'liquidos',
    name: 'HEAVY DUTY',
    variant: 'Adhesivo',
    line: 'Adhesivo líquido de alto desempeño',
    accent: '#4e342e',
    pack: null,
    description: 'Adhesivo Heavy Duty: adhesivo líquido de alto desempeño S-35. Cubeta.',
    strip: ['Adhesivo líquido de alto desempeño', 'Cubeta'],
    lead: 'Adhesivo líquido de alto desempeño. Borrador interno: confirmar sustratos y alcances con la ficha impresa. Sin fotografía de cubeta en el repositorio.',
    identification: [
      { label: 'Tipo de producto', value: 'Adhesivo líquido de alto desempeño' },
      { label: 'Función', value: 'Pegado exigente en sistemas que pidan Heavy Duty' },
      { label: 'Presentación', value: 'Cubeta' },
    ],
    prose: [
      'Versión líquida de alto desempeño. El soporte y el tipo de pieza los define la ficha impresa, no el nombre comercial.',
    ],
    uses: [
      { title: 'Según ficha impresa.', text: 'Casos que el adhesivo vinílico estándar no cubre.' },
      { title: 'Soporte.', text: 'Limpio, firme y capaz.' },
    ],
  }),

  mortar({
    slug: 'estuco-base-pro',
    code: 'FT-LG-001',
    family: 'estucos-premium',
    legacy: true,
    name: 'ESTUCO BASE',
    variant: 'Pro+',
    line: 'Estuco base · descontinuado',
    accent: '#616161',
    pack: '/Assets/productos_background/estuco-base.png',
    description: 'Estuco Base Pro+: producto descontinuado. Fuera de catálogo.',
    strip: ['Descontinuado · fuera de catálogo', 'Saco de 25 kg'],
    lead: 'Estuco Base Pro+ está descontinuado. Esta ficha se conserva para no perder el archivo técnico. No forma parte del catálogo vigente ni del índice público. Para acabados hidrófugos de la línea actual usar Waxtard.',
    identification: [
      { label: 'Tipo de producto', value: 'Estuco base (línea anterior)' },
      { label: 'Estado', value: 'Descontinuado · fuera de catálogo' },
      { label: 'Presentación', value: 'Saco de 25 kg' },
    ],
    prose: [
      'Producto de la línea anterior, fuera de producción comercial.',
      'No usar esta ficha para especificar obra nueva. Consultar Waxtard Blanco Perla, Blanco Absoluto, Gris o Extra Anclaje según el sustrato.',
    ],
    uses: [
      { title: 'Archivo.', text: 'Solo referencia de productos ya instalados.' },
      { title: 'Obra nueva.', text: 'Especificar la línea Waxtard vigente.' },
      { title: 'No confundir con.', text: 'Waxtard Extra Anclaje: el saco de Estuco Base no es ese producto.' },
      { title: 'Soporte.', text: 'Consultar al equipo S-35 si hay que dar mantenimiento a un paño existente.' },
    ],
    notes: [
      'Descontinuado: no aparece en el catálogo, el índice de /productos ni el sitemap.',
      'El saco de este producto se usó por error como imagen de Extra Anclaje; ya no se hace.',
    ],
  }),

  mortar({
    slug: 'mix-and-ready',
    code: 'FT-LG-002',
    family: 'pro-systems',
    legacy: true,
    name: 'MIX AND READY',
    variant: '',
    line: 'Mezcla lista · descontinuado',
    accent: '#1565c0',
    pack: '/Assets/productos_background/mixandready.png',
    description: 'Mix and Ready: producto descontinuado. Fuera de catálogo.',
    strip: ['Descontinuado · fuera de catálogo', 'Saco de 25 kg'],
    lead: 'Mix and Ready está descontinuado. Esta ficha se conserva para archivo. No forma parte del catálogo vigente ni del índice público.',
    identification: [
      { label: 'Tipo de producto', value: 'Mezcla lista (línea anterior)' },
      { label: 'Estado', value: 'Descontinuado · fuera de catálogo' },
      { label: 'Presentación', value: 'Saco de 25 kg' },
    ],
    prose: [
      'Producto de la línea anterior, fuera de producción comercial.',
      'No usar esta ficha para especificar obra nueva. Consultar la línea Pro+ y Adhesivos PRO+ vigentes.',
    ],
    uses: [
      { title: 'Archivo.', text: 'Solo referencia de productos ya instalados.' },
      { title: 'Obra nueva.', text: 'Especificar la línea vigente (Pro+ / Pegaxpress).' },
      { title: 'No confundir con.', text: 'Sellador Premium para pintura: el saco de Mix and Ready no es ese producto.' },
      { title: 'Soporte.', text: 'Consultar al equipo S-35 para mantenimiento de instalaciones existentes.' },
    ],
    notes: [
      'Descontinuado: no aparece en el catálogo, el índice de /productos ni el sitemap.',
    ],
  }),
];
