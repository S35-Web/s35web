'use strict';

const NOTICE_VERIFIED =
  'Valores típicos de referencia a 23 °C y 50 % HR; no constituyen especificación de garantía. El desempeño en obra depende del sustrato, el espesor, la dosificación y las condiciones de aplicación y curado. Se recomienda un paño de prueba en cada proyecto. La formulación del producto es información propietaria de S-35.';

const NOTICE_DRAFT =
  'Ficha en borrador interno, pendiente de validación comercial. Los valores son de referencia y no constituyen especificación. Solicitar la ficha impresa vigente antes de especificar en obra.';

function packFig(src, alt) {
  return {
    pack: src
      ? { src: src, alt: alt, label: 'Fig. B · presentación' }
      : { src: null, alt: '', label: 'Presentación' },
    powder: { src: null, alt: '', caption: [] },
  };
}

function storagePairs(kind) {
  if (kind === 'liquid') {
    return [
      {
        label: 'Almacenamiento',
        text: 'Envases cerrados, en lugar fresco y cubierto, protegidos de heladas y de sol directo. Vida útil de 12 meses en envase original cerrado. Homogeneizar antes de usar.',
      },
      {
        label: 'Seguridad',
        text: 'Usar guantes y gafas. Ventilar el área de trabajo. No verter residuos al drenaje. Mantener fuera del alcance de los niños.',
      },
    ];
  }
  return [
    {
      label: 'Almacenamiento',
      text: 'Sacos cerrados, sobre tarima, en lugar seco y ventilado, separados de muros y piso húmedo. Vida útil de 6 meses en empaque original cerrado. Estibar máximo 10 sacos y consumir por lote.',
    },
    {
      label: 'Seguridad',
      text: 'Producto alcalino: usar guantes, gafas y mascarilla N95/FFP2 al amasar. Evitar contacto prolongado con la piel y lavar con agua abundante en caso de contacto. Mantener fuera del alcance de los niños. No verter residuos al drenaje.',
    },
  ];
}

function draft(p) {
  const kind = p.kind || 'bag';
  const packaging = p.packaging || (kind === 'liquid' ? 'Cubeta' : '25 kg');
  const sections = p.sections || [
    { kind: 'prose', n: '1.0', title: 'Cómo funciona', prose: p.prose },
    { kind: 'items', n: '2.0', title: p.usesTitle || 'Usos y sustratos', items: p.uses },
    { kind: 'steps', n: '3.0', title: 'Modo de empleo', steps: p.steps },
    { kind: 'pairs', n: '4.0', title: 'Manejo y almacenamiento', pairs: p.pairs || storagePairs(kind) },
    { kind: 'notes', n: 'Anexo', title: 'Datos de interés', notes: p.notes },
  ];

  const out = {
    slug: p.slug,
    code: p.code,
    family: p.family,
    status: p.status || 'draft',
    name: p.name,
    variant: p.variant || '',
    line: p.line,
    accent: p.accent,
    packaging: packaging,
    rev: p.rev || '01',
    year: p.year || '2026',
    seo: { description: p.description },
    strip: p.strip,
    lead: p.lead,
    figures: packFig(p.pack, p.packAlt || (p.name + (p.variant ? ' ' + p.variant : ''))),
    identification: p.identification,
    kpis: p.kpis,
    sections: sections,
    notice: p.notice || (p.status === 'verified' ? NOTICE_VERIFIED : NOTICE_DRAFT),
  };
  if (p.legacy) out.legacy = true;
  return out;
}

module.exports = { draft, packFig, storagePairs, NOTICE_VERIFIED, NOTICE_DRAFT };
