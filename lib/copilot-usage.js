/**
 * Usage global del Copiloto S35 (todos los roles / un solo contador).
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

function fileStorePath() {
  return path.join(process.cwd(), '.data', 'copilot-usage.json');
}

function readFileStore() {
  try {
    return JSON.parse(fs.readFileSync(fileStorePath(), 'utf8'));
  } catch (_) {
    return {};
  }
}

function writeFileStore(data) {
  const p = fileStorePath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

async function getDb() {
  if (cachedDb) return cachedDb;
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  cachedClient = cachedClient || new MongoClient(uri);
  if (!cachedClient.topology) {
    await cachedClient.connect();
  }
  const dbName = process.env.MONGODB_DB || 's35web';
  cachedDb = cachedClient.db(dbName);
  return cachedDb;
}

function monthKey(d) {
  d = d || new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return y + '-' + m;
}

function monthlyTokenBudget() {
  const n = Number(process.env.S35_AI_MONTHLY_TOKEN_BUDGET);
  return isFinite(n) && n > 0 ? Math.trunc(n) : 2000000;
}

/** gpt-4o-mini approx USD per 1M tokens (input / output). */
function estimateCostUsd(promptTokens, completionTokens) {
  const pin = (Number(promptTokens) || 0) / 1e6 * 0.15;
  const pout = (Number(completionTokens) || 0) / 1e6 * 0.6;
  return Math.round((pin + pout) * 100000) / 100000;
}

function normalizeUsage(usage) {
  if (!usage || typeof usage !== 'object') return null;
  const prompt = Number(usage.prompt_tokens) || 0;
  const completion = Number(usage.completion_tokens) || 0;
  const total = Number(usage.total_tokens) || prompt + completion;
  if (total <= 0 && prompt <= 0 && completion <= 0) return null;
  return { promptTokens: prompt, completionTokens: completion, totalTokens: total };
}

function summarizeDoc(key, doc, budget) {
  const promptTokens = (doc && doc.promptTokens) || 0;
  const completionTokens = (doc && doc.completionTokens) || 0;
  const totalTokens = (doc && doc.totalTokens) || 0;
  const requests = (doc && doc.requests) || 0;
  const estimatedCostUsd = Math.round(((doc && doc.estimatedCostUsd) || 0) * 100000) / 100000;
  const pct = budget > 0 ? Math.min(100, Math.round((totalTokens / budget) * 1000) / 10) : 0;
  return {
    ok: true,
    scope: 'global',
    month: key,
    promptTokens: promptTokens,
    completionTokens: completionTokens,
    totalTokens: totalTokens,
    requests: requests,
    estimatedCostUsd: estimatedCostUsd,
    budgetTokens: budget,
    remainingTokens: Math.max(0, budget - totalTokens),
    pctUsed: pct,
    model: (doc && doc.model) || process.env.S35_AI_MODEL || 'gpt-4o-mini',
    updatedAt: (doc && doc.updatedAt) || null
  };
}

async function recordCopilotUsage(usage, meta) {
  const u = normalizeUsage(usage);
  if (!u) return null;
  const key = monthKey();
  const cost = estimateCostUsd(u.promptTokens, u.completionTokens);
  const model = (meta && meta.model) || process.env.S35_AI_MODEL || 'gpt-4o-mini';
  const now = new Date().toISOString();
  const budget = monthlyTokenBudget();

  const db = await getDb();
  if (db) {
    const col = db.collection('copilot_usage');
    await col.updateOne(
      { _id: key },
      {
        $inc: {
          promptTokens: u.promptTokens,
          completionTokens: u.completionTokens,
          totalTokens: u.totalTokens,
          requests: 1,
          estimatedCostUsd: cost
        },
        $set: { updatedAt: now, model: model },
        $setOnInsert: { scope: 'global', createdAt: now }
      },
      { upsert: true }
    );
    const doc = await col.findOne({ _id: key });
    return summarizeDoc(key, doc, budget);
  }

  const store = readFileStore();
  const prev = store[key] || {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    requests: 0,
    estimatedCostUsd: 0
  };
  const next = {
    promptTokens: prev.promptTokens + u.promptTokens,
    completionTokens: prev.completionTokens + u.completionTokens,
    totalTokens: prev.totalTokens + u.totalTokens,
    requests: prev.requests + 1,
    estimatedCostUsd: Math.round((prev.estimatedCostUsd + cost) * 100000) / 100000,
    model: model,
    updatedAt: now,
    scope: 'global'
  };
  store[key] = next;
  writeFileStore(store);
  return summarizeDoc(key, next, budget);
}

async function getCopilotUsageSummary() {
  const key = monthKey();
  const budget = monthlyTokenBudget();
  const db = await getDb();
  if (db) {
    const doc = await db.collection('copilot_usage').findOne({ _id: key });
    return summarizeDoc(key, doc, budget);
  }
  const store = readFileStore();
  return summarizeDoc(key, store[key] || null, budget);
}

module.exports = {
  recordCopilotUsage,
  getCopilotUsageSummary,
  monthlyTokenBudget,
  monthKey,
  estimateCostUsd,
  normalizeUsage
};
