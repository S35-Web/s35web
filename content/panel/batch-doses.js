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
  'waxtard-blanco-absoluto': {
    mode: 'plant-lot',
    packSizeKg: 25,
    packagingPlantId: 'saco-rafia-waxtard',
    note: 'Lote de planta FT-PR-002. V1 con cemento portland blanco (729 kg → ~29 sacos).',
    defaultVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        name: 'V1',
        label: 'Marmolina fina + gruesa',
        yieldMin: 28,
        yieldMax: 30,
        items: [
          { plantId: 'marmolina-gruesa', amount: 250, unit: 'Kg', role: 'Agregado' },
          { plantId: 'marmolina-fina', amount: 100, unit: 'Kg', role: 'Agregado' },
          { plantId: 'marmolina-talco-100', amount: 200, unit: 'Kg', role: 'Carga' },
          { plantId: 'cemento-portland-blanco', amount: 75, unit: 'Kg', role: 'Cementante' },
          { plantId: 'calidra', amount: 100, unit: 'Kg', role: 'Cementante' },
          { plantId: 'resina-rdp740h', amount: 1, unit: 'Kg', role: 'Polímero' },
          { plantId: 'resina-semitski', amount: 1, unit: 'Kg', role: 'Polímero' },
          { plantId: 'walocell', amount: 1, unit: 'Kg', role: 'Celulosa' },
          { plantId: 'estearato', amount: 1, unit: 'Kg', role: 'Aditivo' },
        ],
      },
    ],
  },
  'waxtard-gris': {
    mode: 'plant-lot',
    packSizeKg: 25,
    packagingPlantId: 'saco-rafia-waxtard',
    note: 'Lote de planta FT-PR-003. V1 con arena cribada fina (754 kg → ~30 sacos).',
    defaultVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        name: 'V1',
        label: 'Arena cribada fina',
        yieldMin: 29,
        yieldMax: 31,
        items: [
          { plantId: 'arena-cribada-fina', amount: 350, unit: 'Kg', role: 'Agregado' },
          { plantId: 'marmolina-talco-100', amount: 200, unit: 'Kg', role: 'Carga' },
          { plantId: 'cemento-portland-gris', amount: 50, unit: 'Kg', role: 'Cementante' },
          { plantId: 'mortero', amount: 50, unit: 'Kg', role: 'Cementante' },
          { plantId: 'calidra', amount: 100, unit: 'Kg', role: 'Cementante' },
          { plantId: 'resina-rdp740h', amount: 1, unit: 'Kg', role: 'Polímero' },
          { plantId: 'resina-semitski', amount: 1, unit: 'Kg', role: 'Polímero' },
          { plantId: 'walocell', amount: 1, unit: 'Kg', role: 'Celulosa' },
          { plantId: 'estearato', amount: 1, unit: 'Kg', role: 'Aditivo' },
        ],
      },
    ],
  },
  'waxtard-extra-anclaje': {
    mode: 'plant-lot',
    packSizeKg: 25,
    packagingPlantId: 'saco-rafia-waxtard',
    note: 'Lote de planta FT-PR-004. V1 Estucos premium (793 kg → ~31.72 sacos).',
    defaultVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        name: 'V1',
        label: 'Marmolina fina',
        yieldMin: 31,
        yieldMax: 32,
        items: [
          { plantId: 'marmolina-fina', amount: 350, unit: 'Kg', role: 'Agregado' },
          { plantId: 'marmolina-talco-100', amount: 200, unit: 'Kg', role: 'Carga' },
          { plantId: 'cemento-portland-blanco', amount: 200, unit: 'Kg', role: 'Cementante' },
          { plantId: 'calidra', amount: 25, unit: 'Kg', role: 'Cementante' },
          { plantId: 'resina-rdp740h', amount: 15, unit: 'Kg', role: 'Polímero' },
          { plantId: 'estearato', amount: 2, unit: 'Kg', role: 'Aditivo' },
          { plantId: 'walocell', amount: 1, unit: 'Kg', role: 'Celulosa' },
        ],
      },
    ],
  },
  'cemento-plastico-concreto': {
    mode: 'plant-lot',
    packSizeKg: 25,
    packagingPlantId: 'saco-rafia-general',
    note: 'Lote de planta FT-MC-001. V1 Microconcreto concreto aparente (529.5 kg → ~21.18 sacos).',
    defaultVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        name: 'V1',
        label: 'Marmolina talco 200',
        yieldMin: 21,
        yieldMax: 22,
        items: [
          { plantId: 'marmolina-talco-200', amount: 300, unit: 'Kg', role: 'Carga' },
          { plantId: 'cemento-portland-gris', amount: 200, unit: 'Kg', role: 'Cementante' },
          { plantId: 'calidra', amount: 12.5, unit: 'Kg', role: 'Cementante' },
          { plantId: 'resina-rdp740h', amount: 15, unit: 'Kg', role: 'Polímero' },
          { plantId: 'walocell', amount: 1.5, unit: 'Kg', role: 'Celulosa' },
          { plantId: 'estearato', amount: 0.5, unit: 'Kg', role: 'Aditivo' },
        ],
      },
    ],
  },
};
