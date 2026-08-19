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
  documented: 'DOCUMENTED',
  'in-study': 'IN STUDY',
  draft: 'DRAFT',
};

const PROVENANCE_LABEL = {
  measured: { short: 'MEAS', en: 'Measured by S-35' },
  reference: { short: 'REF', en: 'Bibliography or supplier data' },
  observation: { short: 'OBS', en: 'Uninstrumented internal observation' },
  hypothesis: { short: 'HYP', en: 'Working hypothesis' },
  'in-progress': { short: 'WIP', en: 'Test started, no conclusion' },
};

module.exports = { CATEGORIES, STATUS, PROVENANCE_LABEL };
