'use strict';

const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI');
  cachedClient = cachedClient || new MongoClient(uri);
  if (!cachedClient.topology) {
    await cachedClient.connect();
  }
  const dbName = process.env.MONGODB_DB || 's35web';
  cachedDb = cachedClient.db(dbName);
  return cachedDb;
}

module.exports = { getDb };
