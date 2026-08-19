/**
 * @typedef {'measured'|'reference'|'observation'|'hypothesis'|'in-progress'} Provenance
 *
 * @typedef {Object} DataPoint
 * @property {string|number|[number, number]|null} value
 * @property {string} [unit]
 * @property {Provenance} provenance
 * @property {string} [source]
 * @property {string} [method]
 * @property {string} [sampleId]
 * @property {string} [date]
 * @property {string} [note]
 */

const PROVENANCES = ['measured', 'reference', 'observation', 'hypothesis', 'in-progress'];

/**
 * @param {string|number|[number, number]|null} value
 * @param {Provenance} provenance
 * @param {Omit<DataPoint, 'value'|'provenance'>} [extra]
 * @returns {DataPoint}
 */
function dp(value, provenance, extra) {
  if (PROVENANCES.indexOf(provenance) === -1) {
    throw new Error('Invalid provenance: ' + provenance);
  }
  const point = Object.assign({ value: value, provenance: provenance }, extra || {});
  if (provenance === 'reference' && !point.source) {
    throw new Error('reference DataPoint requires source');
  }
  if (provenance === 'measured' && (!point.sampleId || !point.date)) {
    throw new Error('measured DataPoint requires sampleId and date');
  }
  return point;
}

module.exports = { dp, PROVENANCES };
