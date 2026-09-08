'use strict';

// Ficha verificada de un líquido: mismo molde que Waxtard, con foto de envase.

function liquidVerified(p) {
  return {
    slug: p.slug,
    code: p.code,
    family: 'liquidos',
    status: 'verified',
    name: p.name,
    variant: p.variant,
    line: p.line,
    accent: p.accent,
    packaging: p.packaging,
    rev: p.rev || '01',
    year: p.year || '2026',
    seo: { description: p.description },
    strip: p.strip,
    lead: p.lead,
    figures: {
      pack: {
        src: p.pack,
        alt: p.packAlt,
        label: p.packLabel || 'Fig. A · presentación',
      },
      powder: { src: null, alt: '', caption: [] },
    },
    identification: p.identification,
    kpis: p.kpis,
    sections: p.sections,
    notice: p.notice,
  };
}

module.exports = liquidVerified;
