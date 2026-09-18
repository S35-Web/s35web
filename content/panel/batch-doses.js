'use strict';

/**
 * Dosificaciones de planta por lote, con versiones (V1, V2…).
 * Cada versión es una receta alternativa del mismo producto (sustituciones de MP).
 * Al emitir un ticket se congela la versión usada.
 *
 * plantId → content/panel/plant-materials.js
 */
module.exports = {
  'waxtard-blanco-perla': {
    mode: 'plant-lot',
    packSizeKg: 25,
    packagingPlantId: 'saco-rafia-waxtard',
    note: 'Lote de planta FT-PR-001. Versiones alternativas según disponibilidad de marmolina.',
    defaultVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        name: 'V1',
        label: 'Marmolina fina + gruesa',
        yieldMin: 29,
        yieldMax: 31,
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
      {
        id: 'v2',
        name: 'V2',
        label: 'Marmolina estándar (350 kg)',
        yieldMin: 29,
        yieldMax: 31,
        items: [
          { plantId: 'marmolina-estandar', amount: 350, unit: 'Kg', role: 'Agregado' },
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
    ],
  },
};
