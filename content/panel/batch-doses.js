'use strict';

/**
 * Dosificaciones de planta por lote de producción.
 * Las MP se consumen enteras por lote; el PT se da de alta con sacos reales envasados.
 *
 * plantId → content/panel/plant-materials.js
 */
module.exports = {
  'waxtard-blanco-perla': {
    mode: 'plant-lot',
    packSizeKg: 25,
    yieldMin: 29,
    yieldMax: 31,
    packagingPlantId: 'saco-rafia-waxtard',
    note: 'Lote de planta FT-PR-001. Teórico ≈ 30.22 sacos (755.5 kg ÷ 25). Real típico 29–31.',
    items: [
      { plantId: 'marmolina-gruesa', amount: 250, unit: 'Kg', role: 'Agregado' },
      { plantId: 'marmolina-fina', amount: 100, unit: 'Kg', role: 'Agregado' },
      { plantId: 'marmolina-talco-100', amount: 200, unit: 'Kg', role: 'Carga' },
      { plantId: 'cemento-portland-gris', amount: 50, unit: 'Kg', role: 'Cementante' },
      { plantId: 'mortero', amount: 50, unit: 'Kg', role: 'Cementante' },
      { plantId: 'calidra', amount: 100, unit: 'Kg', role: 'Cementante' },
      { plantId: 'resina-rdp740h', amount: 1, unit: 'Kg', role: 'Polímero' },
      { plantId: 'resina-semitski', amount: 1, unit: 'Kg', role: 'Polímero' },
      { plantId: 'walocell', amount: 1, unit: 'Kg', role: 'Celulosa' },
      { plantId: 'estearato', amount: 2.5, unit: 'Kg', role: 'Aditivo' },
    ],
  },
};
