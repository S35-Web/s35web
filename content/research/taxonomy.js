const CATEGORIES = {
  AGG: { en: 'Aggregates', es: 'Agregados', singular: { en: 'Aggregate', es: 'Agregado' } },
  BND: { en: 'Binders', es: 'Cementantes', singular: { en: 'Binder', es: 'Cementante' } },
  FIL: { en: 'Fillers', es: 'Cargas', singular: { en: 'Filler', es: 'Carga' } },
  MIN: { en: 'Minerals', es: 'Minerales', singular: { en: 'Mineral', es: 'Mineral' } },
  ADM: { en: 'Admixtures', es: 'Aditivos', singular: { en: 'Admixture', es: 'Aditivo' } },
  PIG: { en: 'Pigments', es: 'Pigmentos', singular: { en: 'Pigment', es: 'Pigmento' } },
  FIB: { en: 'Fibers', es: 'Fibras', singular: { en: 'Fiber', es: 'Fibra' } },
};

const STATUS = {
  documented: { es: 'DOCUMENTADO', en: 'DOCUMENTED' },
  'in-study': { es: 'EN ESTUDIO', en: 'IN STUDY' },
  draft: { es: 'BORRADOR', en: 'DRAFT' },
  published: { es: 'PUBLICADO', en: 'PUBLISHED' },
};

const PROVENANCE_LABEL = {
  measured: { short: 'MEAS', en: 'Measured by S-35', es: 'Medido por S-35' },
  reference: { short: 'REF', en: 'Bibliography or supplier data', es: 'Bibliografía o ficha de proveedor' },
  observation: { short: 'OBS', en: 'Uninstrumented internal observation', es: 'Observación interna no instrumentada' },
  hypothesis: { short: 'HYP', en: 'Working hypothesis', es: 'Hipótesis de trabajo' },
  'in-progress': { short: 'WIP', en: 'Test started, no conclusion', es: 'Ensayo iniciado, sin conclusión' },
};

module.exports = { CATEGORIES, STATUS, PROVENANCE_LABEL };
