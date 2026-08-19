/**
 * JSDoc model for MateriaLab entities. Content files implement these shapes.
 * Validation lives in scripts/validate-research.js — the build fails without provenance.
 *
 * @typedef {import('./dp').DataPoint} DataPoint
 * @typedef {import('./dp').Provenance} Provenance
 *
 * @typedef {Object} ImageRef
 * @property {string} id
 * @property {string} alt
 * @property {number} width
 * @property {number} height
 *
 * @typedef {Object} Material
 * @property {string} code
 * @property {string} slug
 * @property {string} slugEn
 * @property {{es: string, en: string}} name
 * @property {string} [scientificName]
 * @property {'AGG'|'BND'|'FIL'|'MIN'|'ADM'|'PIG'|'FIB'} category
 * @property {'documented'|'in-study'|'draft'} status
 * @property {number} revision
 * @property {string} publishedAt
 * @property {string} updatedAt
 * @property {{rev: number, date: string, change: string}[]} revisionHistory
 * @property {{es: string, en: string}} summary
 * @property {string} [classLabel]
 * @property {DataPoint} origin
 * @property {Object} physical
 * @property {{compound: string, formula?: string, percent: DataPoint}[]} chemical
 * @property {Object} [granulometry]
 * @property {Object} [morphology]
 * @property {{macro: ImageRef[], micrograph?: ImageRef[]}} images
 * @property {{property: string, effect: string, direction: '↑'|'↓'|'→'}[]} whyItMatters
 * @property {{date: string, text: {es: string, en: string}}[]} [labNotes]
 * @property {string[]} [relatedMaterials]
 * @property {string[]} [relatedResearch]
 * @property {string} [applicationHref]
 * @property {string} [applicationLabel]
 *
 * @typedef {Object} ResearchFile
 * @property {string} code
 * @property {string} slug
 * @property {string} materialSlug
 * @property {{es: string, en: string}} title
 * @property {string} category
 * @property {string} date
 * @property {number} revision
 * @property {'published'|'in-study'|'draft'} status
 * @property {boolean} [featured]
 * @property {{es: string, en: string}} summary
 *
 * @typedef {Object} Sample
 * @property {string} id
 * @property {string} materialSlug
 * @property {string} receivedAt
 * @property {string} [originRegion]
 * @property {string} [note]
 *
 * @typedef {Object} Experiment
 * @property {string} id
 * @property {string[]} sampleIds
 * @property {string} title
 * @property {string} date
 * @property {string} status
 */

module.exports = {};
