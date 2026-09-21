'use strict';

const { draft } = require('../sheet');

/** Borrador reactivado/creado desde histórico de ventas 2012–2026. Pendiente FT/copy comercial. */
module.exports = draft({
  slug: 'aditivo-sp85',
  code: 'FT-PR-014',
  family: 'liquidos',
  status: 'draft',
  name: 'ADITIVO',
  variant: 'SP85',
  line: 'Aditivo SP85',
  accent: '#00838f',
  packaging: '1 kg',
  description: 'ADITIVO SP85: ficha en borrador. Pendiente de validación comercial.',
  strip: ['Borrador interno · pendiente de ficha impresa', '1 kg'],
  lead: 'ADITIVO SP85 está en catálogo como borrador a partir del histórico de planta. Confirmar dosificación, usos y rendimiento con la ficha impresa vigente antes de especificar en obra.',
  identification: [
    { label: 'Tipo de producto', value: 'Aditivo SP85' },
    { label: 'Estado', value: 'Borrador · catálogo panel' },
    { label: 'Presentación', value: '1 kg' },
  ],
  kpis: [
    { value: '1 kg', label: 'presentación' },
    { value: 'Consultar', label: 'agua / dosificación' },
    { value: 'Consultar', label: 'espesor de trabajo' },
    { value: 'Consultar', label: 'rendimiento' },
  ],
  prose: [
    'Producto incorporado al catálogo a partir del concentrado histórico de ventas del panel anterior.',
    'Esta ficha es borrador: no usar para especificar obra hasta validar copy, ensayos y modo de empleo.',
  ],
  uses: [
    { title: 'Histórico.', text: 'Aparece en analytics del panel con salidas 2012–2026 mapeadas a este slug.' },
    { title: 'Obra nueva.', text: 'Esperar ficha verificada o consultar a Especificaciones S-35.' },
  ],
  steps: [
    { title: '1. Validar ficha.', text: 'Confirmar dosificación y procedimiento con el equipo S-35 antes de amasar.' },
    { title: '2. Paño de prueba.', text: 'Hacer un paño de prueba en el sustrato real.' },
  ],
  notes: [
    'Borrador generado automáticamente desde la revisión de ventas históricas (2026-09-21).',
    'Actualizar status a verified cuando exista ficha técnica oficial.',
  ],
});
