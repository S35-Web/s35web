'use strict';

/**
 * Almacén de estado del panel de Colaboradores en la nube.
 *
 * El panel guarda todo su estado de negocio (ventas, cortes, precios,
 * fórmulas, inventario de planta, materias primas, producción, etc.) en
 * `localStorage` bajo claves con prefijo `s35_`. Este módulo centraliza esas
 * claves en una colección de MongoDB (`panel_state`) para que los datos se
 * compartan entre navegadores y computadoras.
 *
 * Cada documento: { _id: <clave>, value: <string crudo de localStorage>,
 *                   updatedAt: <ISO>, updatedBy: <usuario> }
 *
 * El valor se guarda tal cual lo produce `localStorage` (string), de modo que
 * la hidratación en el navegador sea idéntica byte a byte y no dependa de
 * volver a serializar/parsear estructuras.
 */

const COLLECTION = 'panel_state';

// Claves que NO se sincronizan: preferencias/credenciales por dispositivo y
// claves de precios legadas (v2/v3) que fueron reemplazadas por v4.
const NON_SYNCED_KEYS = new Set([
  's35_admin_token',
  's35_admin_user',
  's35_panel_theme',
  's35_role_override',
  's35_pos_sale_city',
  's35_pos_prices_v2',
  's35_pos_prices_v3'
]);

// Límite defensivo por valor (16 MB es el tope de documento de MongoDB).
const MAX_VALUE_BYTES = 8 * 1024 * 1024;

/**
 * ¿La clave debe vivir en la nube (compartida entre dispositivos)?
 */
function isSyncableKey(key) {
  return (
    typeof key === 'string' &&
    key.indexOf('s35_') === 0 &&
    !NON_SYNCED_KEYS.has(key)
  );
}

/**
 * Devuelve todo el estado compartido: { state: { clave: value }, updatedAt }.
 */
async function getAllState(db) {
  const docs = await db.collection(COLLECTION).find({}).toArray();
  const state = {};
  let updatedAt = null;
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    if (!doc || !isSyncableKey(doc._id)) continue;
    state[doc._id] = typeof doc.value === 'string' ? doc.value : null;
    if (doc.updatedAt && (!updatedAt || doc.updatedAt > updatedAt)) {
      updatedAt = doc.updatedAt;
    }
  }
  return { state: state, updatedAt: updatedAt };
}

/**
 * Metadatos ligeros para saber si algo cambió sin descargar todo el estado.
 */
async function getMeta(db) {
  const docs = await db
    .collection(COLLECTION)
    .find({}, { projection: { updatedAt: 1 } })
    .toArray();
  let updatedAt = null;
  let count = 0;
  for (let i = 0; i < docs.length; i++) {
    count += 1;
    const u = docs[i] && docs[i].updatedAt;
    if (u && (!updatedAt || u > updatedAt)) updatedAt = u;
  }
  return { updatedAt: updatedAt, count: count };
}

/**
 * Lee una sola clave.
 */
async function getOne(db, key) {
  if (!isSyncableKey(key)) return null;
  const doc = await db.collection(COLLECTION).findOne({ _id: key });
  if (!doc) return null;
  return {
    value: typeof doc.value === 'string' ? doc.value : null,
    updatedAt: doc.updatedAt || null
  };
}

/**
 * Guarda (upsert) una clave. `value` debe ser el string crudo de localStorage.
 * Lanza Error con `.status` para que el handler responda el código correcto.
 */
async function putState(db, key, value, user) {
  if (!isSyncableKey(key)) {
    const err = new Error('Clave no permitida');
    err.status = 400;
    throw err;
  }
  if (typeof value !== 'string') {
    const err = new Error('value debe ser string');
    err.status = 400;
    throw err;
  }
  if (Buffer.byteLength(value, 'utf8') > MAX_VALUE_BYTES) {
    const err = new Error('value demasiado grande');
    err.status = 413;
    throw err;
  }
  const updatedAt = new Date().toISOString();
  await db.collection(COLLECTION).updateOne(
    { _id: key },
    {
      $set: {
        value: value,
        updatedAt: updatedAt,
        updatedBy: (user && (user.sub || user.username)) || null
      }
    },
    { upsert: true }
  );
  return { updatedAt: updatedAt };
}

module.exports = {
  COLLECTION: COLLECTION,
  NON_SYNCED_KEYS: NON_SYNCED_KEYS,
  isSyncableKey: isSyncableKey,
  getAllState: getAllState,
  getMeta: getMeta,
  getOne: getOne,
  putState: putState
};
