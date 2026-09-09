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
    lead: 'Cellbond Pro+ está descontinuado. Esta ficha se conserva para archivo. No forma parte del catálogo vigente ni del índice público. Para asiento de block de concreto usar Pegaxpress: Block.',
    identification: [
      { label: 'Tipo de producto', value: 'Adhesivo para block celular (línea anterior)' },
      { label: 'Estado', value: 'Descontinuado · fuera de catálogo' },
      { label: 'Presentación', value: 'Saco de 25 kg' },
    ],
    prose: [
      'Producto de la línea anterior, fuera de producción comercial.',
      'No usar esta ficha para especificar obra nueva. Block de concreto: Pegaxpress: Block. Otros casos: consultar a Especificaciones S-35.',
    ],
    uses: [
      { title: 'Archivo.', text: 'Solo referencia de productos ya instalados.' },
      { title: 'Obra nueva.', text: 'No especificar Cellbond. Consultar la línea Pro+ vigente.' },
      { title: 'No confundir con.', text: 'Pegaxpress: Block es el adhesivo de block de concreto en catálogo.' },
      { title: 'Soporte.', text: 'Consultar al equipo S-35 si hay que dar mantenimiento a un paño existente.' },
    ],
    apply: 'Producto descontinuado: no aplicar en obra nueva.',
    kpi3v: 'Archivo', kpi3l: 'fuera de catálogo',
    notes: [
      'Descontinuado: no aparece en el catálogo, el índice de /productos ni el sitemap.',
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
