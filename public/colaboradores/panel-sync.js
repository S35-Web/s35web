/**
 * S35 Panel cloud sync — localStorage ↔ /api/panel-state (Mongo).
 *
 * Estrategia: last-write-wins por `updatedAt` en documentos escalares.
 * Colecciones (ventas, gastos, lotes, etc.): unión por id para no perder
 * cambios de otro dispositivo / pestaña.
 * localStorage sigue siendo caché/offline; la nube es fuente de verdad cuando responde.
 * Clientes POS siguen en /api/clients (no se duplican aquí).
 */
(function (global) {
    'use strict';

    var SYNC_KEYS = [
        's35_plant_inventory',
        's35_plant_families',
        's35_finished_stock',
        's35_plant_formulas_v3',
        's35_production_lots',
        's35_compra_tickets',
        's35_plant_unit_costs_v1',
        's35_plant_count_20260922b',
        's35_pos_prices_v4',
        's35_pos_sales',
        's35_caja_gastos_v1',
        's35_sale_edits_v1',
        's35_promo_codes_v1',
        's35_product_families',
        's35_product_family_overrides',
        's35_product_catalog_v1',
        's35_hist_sales_imported_v13'
    ];

    /** Colecciones { items: [] } que se fusionan por id (cliente + servidor). */
    var MERGE_ITEMS_KEYS = {
        s35_pos_sales: true,
        s35_caja_gastos_v1: true,
        s35_production_lots: true,
        s35_compra_tickets: true,
        s35_promo_codes_v1: true
    };

    /** Mapas { byId: {} } fusionados por clave. */
    var MERGE_MAP_KEYS = {
        s35_sale_edits_v1: true
    };

    var META_KEY = 's35_panel_sync_meta_v1';
    var RELOAD_FLAG = 's35_panel_sync_reloaded';
    var DEBOUNCE_MS = 700;
    var API = '/api/panel-state';

    var syncKeySet = {};
    SYNC_KEYS.forEach(function (k) { syncKeySet[k] = true; });

    var suppressWriteHook = false;
    var bootDone = false;
    var bootPromise = null;
    var pendingKeys = {};
    var pushTimer = null;
    var pushing = false;
    var pushAgain = false;
    var status = {
        ok: null,
        lastPullAt: null,
        lastPushAt: null,
        lastError: null,
        appliedRemote: false
    };

    function emitStatus() {
        try {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('s35-sync-status', {
                    detail: Object.assign({}, status, {
                        bootDone: bootDone,
                        pending: Object.keys(pendingKeys)
                    })
                }));
            }
        } catch (_) {}
    }

    function getToken() {
        try { return localStorage.getItem('s35_admin_token') || ''; } catch (_) { return ''; }
    }

    function authHeaders() {
        return {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + getToken()
        };
    }

    function loadMeta() {
        try {
            var raw = JSON.parse(localStorage.getItem(META_KEY) || '{}');
            return raw && typeof raw === 'object' ? raw : {};
        } catch (_) {
            return {};
        }
    }

    function saveMeta(meta) {
        try {
            localStorage.setItem(META_KEY, JSON.stringify(meta || {}));
        } catch (_) {}
    }

    function touchMeta(key, updatedAt) {
        var meta = loadMeta();
        meta[key] = updatedAt || new Date().toISOString();
        saveMeta(meta);
        return meta[key];
    }

    function metaFor(key) {
        var meta = loadMeta();
        return meta[key] || null;
    }

    function cmpIso(a, b) {
        var ta = Date.parse(a || '') || 0;
        var tb = Date.parse(b || '') || 0;
        return ta - tb;
    }

    function isHistoricalImportSale(row) {
        if (!row) return false;
        if (row.user === 'import-historico') return true;
        var src = row.meta && row.meta.source;
        return src === 'old-panel';
    }

    function itemRecency(row) {
        if (!row || typeof row !== 'object') return 0;
        return Date.parse(row.editedAt || row.updatedAt || row.createdAt || '') || 0;
    }

    function extractItems(value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (value && Array.isArray(value.items)) return value.items;
        return [];
    }

    function mergeItemLists(a, b, dropHistorical) {
        var byId = Object.create(null);
        var order = [];
        function consider(row) {
            if (!row || typeof row !== 'object') return;
            if (dropHistorical && isHistoricalImportSale(row)) return;
            var id = row.id != null ? String(row.id) : (row.code != null ? String(row.code) : '');
            if (!id) return;
            if (!byId[id]) {
                byId[id] = row;
                order.push(id);
                return;
            }
            if (itemRecency(row) >= itemRecency(byId[id])) byId[id] = row;
        }
        (a || []).forEach(consider);
        (b || []).forEach(consider);
        return order.map(function (id) { return byId[id]; });
    }

    function mergeItemsValue(key, localVal, remoteVal, updatedAt) {
        var merged = mergeItemLists(
            extractItems(localVal),
            extractItems(remoteVal),
            key === 's35_pos_sales'
        );
        var base = (localVal && typeof localVal === 'object' && !Array.isArray(localVal))
            ? localVal
            : ((remoteVal && typeof remoteVal === 'object' && !Array.isArray(remoteVal)) ? remoteVal : {});
        return Object.assign({}, base, { items: merged, updatedAt: updatedAt });
    }

    function mergeByIdMaps(localVal, remoteVal, updatedAt) {
        var localMap = (localVal && localVal.byId && typeof localVal.byId === 'object') ? localVal.byId : {};
        var remoteMap = (remoteVal && remoteVal.byId && typeof remoteVal.byId === 'object') ? remoteVal.byId : {};
        var outMap = Object.assign({}, remoteMap);
        Object.keys(localMap).forEach(function (id) {
            var a = outMap[id];
            var b = localMap[id];
            if (!a) {
                outMap[id] = b;
                return;
            }
            if (!b) return;
            outMap[id] = itemRecency(b) >= itemRecency(a) ? Object.assign({}, a, b) : Object.assign({}, b, a);
        });
        var base = (localVal && typeof localVal === 'object') ? localVal : (remoteVal || {});
        return Object.assign({}, base, { byId: outMap, updatedAt: updatedAt });
    }

    function maxIso(a, b) {
        return cmpIso(a, b) >= 0 ? (a || b) : (b || a);
    }

    /** Fusiona local+remoto para claves de colección; null = usar LWW. */
    function mergeStoreValues(key, localVal, remoteVal, localTs, remoteTs) {
        if (MERGE_ITEMS_KEYS[key]) {
            var ts = maxIso(localTs, remoteTs) || new Date().toISOString();
            var merged = mergeItemsValue(key, localVal, remoteVal, ts);
            var localN = extractItems(localVal).length;
            var remoteN = extractItems(remoteVal).length;
            var mergedN = extractItems(merged).length;
            // Si la unión aportó ítems que faltaban en el "ganador" LWW, forzar push.
            var needPush = mergedN > remoteN || (mergedN > localN && cmpIso(localTs, remoteTs) <= 0);
            var needApply = mergedN !== localN || JSON.stringify(extractItems(localVal).map(function (r) { return r && r.id; })) !==
                JSON.stringify(extractItems(merged).map(function (r) { return r && r.id; }));
            if (needPush && mergedN > Math.max(localN, remoteN)) {
                ts = new Date().toISOString();
                merged = Object.assign({}, merged, { updatedAt: ts });
            }
            return { value: merged, updatedAt: ts, applyLocal: needApply, push: needPush || cmpIso(localTs, remoteTs) > 0 };
        }
        if (MERGE_MAP_KEYS[key]) {
            var tsM = maxIso(localTs, remoteTs) || new Date().toISOString();
            var mergedM = mergeByIdMaps(localVal, remoteVal, tsM);
            var localKeys = Object.keys((localVal && localVal.byId) || {});
            var remoteKeys = Object.keys((remoteVal && remoteVal.byId) || {});
            var mergedKeys = Object.keys((mergedM && mergedM.byId) || {});
            var needPushM = mergedKeys.length > remoteKeys.length;
            var needApplyM = mergedKeys.length !== localKeys.length;
            if (needPushM && mergedKeys.length > Math.max(localKeys.length, remoteKeys.length)) {
                tsM = new Date().toISOString();
                mergedM = Object.assign({}, mergedM, { updatedAt: tsM });
            }
            return {
                value: mergedM,
                updatedAt: tsM,
                applyLocal: needApplyM,
                push: needPushM || cmpIso(localTs, remoteTs) > 0
            };
        }
        return null;
    }

    /** Lee valor + updatedAt desde localStorage (soporta wrapper, arrays planos y strings). */
    function readLocal(key) {
        var rawStr;
        try {
            rawStr = localStorage.getItem(key);
        } catch (_) {
            return null;
        }
        if (rawStr == null) return null;

        var value;
        var fromJson = false;
        try {
            value = JSON.parse(rawStr);
            fromJson = true;
        } catch (_) {
            value = rawStr;
        }

        var updatedAt = null;
        if (fromJson && value && typeof value === 'object' && !Array.isArray(value) && value.updatedAt) {
            updatedAt = String(value.updatedAt);
        }
        if (!updatedAt) updatedAt = metaFor(key);
        if (!updatedAt) {
            // Sin marca: epoch. En bootstrap, si la nube está vacía se sube con "ahora";
            // si la nube ya tiene datos, gana la nube (fuente de verdad).
            updatedAt = '1970-01-01T00:00:00.000Z';
        }
        return { value: value, updatedAt: updatedAt, raw: rawStr };
    }

    function writeLocal(key, value, updatedAt) {
        suppressWriteHook = true;
        try {
            var toStore = value;
            var iso = updatedAt || new Date().toISOString();
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                // Mantener updatedAt dentro del wrapper cuando ya lo usa el panel.
                if ('updatedAt' in value || 'items' in value || 'byId' in value || 'map' in value) {
                    toStore = Object.assign({}, value, { updatedAt: iso });
                }
            }
            if (typeof toStore === 'string') {
                localStorage.setItem(key, toStore);
            } else {
                localStorage.setItem(key, JSON.stringify(toStore));
            }
            touchMeta(key, iso);
        } finally {
            suppressWriteHook = false;
        }
    }

    function schedulePush(key) {
        if (!key || !syncKeySet[key]) return;
        if (suppressWriteHook) return;
        // Cualquier escritura local sin updatedAt en wrapper recibe marca de tiempo.
        try {
            var raw = localStorage.getItem(key);
            if (raw != null) {
                var parsed = null;
                try { parsed = JSON.parse(raw); } catch (_) {}
                var hasWrapTs = parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.updatedAt;
                if (!hasWrapTs) touchMeta(key, new Date().toISOString());
                else touchMeta(key, parsed.updatedAt);
            }
        } catch (_) {}

        pendingKeys[key] = true;
        if (!bootDone) return;
        if (pushTimer) clearTimeout(pushTimer);
        pushTimer = setTimeout(function () {
            pushTimer = null;
            flushPush();
        }, DEBOUNCE_MS);
    }

    function flushPush() {
        var token = getToken();
        if (!token) return Promise.resolve({ ok: false, reason: 'no-token' });
        var keys = Object.keys(pendingKeys);
        if (!keys.length) return Promise.resolve({ ok: true, empty: true });
        if (pushing) {
            pushAgain = true;
            return Promise.resolve({ ok: false, reason: 'busy' });
        }

        pendingKeys = {};
        var stores = {};
        keys.forEach(function (key) {
            var local = readLocal(key);
            if (!local) return;
            // Si era epoch (sin meta real) y aún no había remoto, subir con now.
            var ts = local.updatedAt;
            if (ts === '1970-01-01T00:00:00.000Z') {
                ts = new Date().toISOString();
                touchMeta(key, ts);
                if (local.value && typeof local.value === 'object' && !Array.isArray(local.value) && local.value.updatedAt) {
                    // keep wrapper in sync
                    writeLocal(key, local.value, ts);
                    local = readLocal(key);
                }
            }
            stores[key] = { value: local.value, updatedAt: ts };
        });
        if (!Object.keys(stores).length) return Promise.resolve({ ok: true, empty: true });

        pushing = true;
        return fetch(API, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ stores: stores })
        })
            .then(function (r) {
                return r.json().then(function (d) { return { ok: r.ok, status: r.status, data: d }; });
            })
            .then(function (res) {
                if (!res.ok || !res.data || !res.data.ok) {
                    throw new Error((res.data && res.data.error) || ('HTTP ' + res.status));
                }
                status.ok = true;
                status.lastPushAt = new Date().toISOString();
                status.lastError = null;
                emitStatus();
                // Si el servidor rechazó por stale, adoptar remoto.
                // Si aceptó con merge, adoptar el valor fusionado del servidor.
                var rejected = res.data.rejected || [];
                var accepted = res.data.accepted || [];
                var applied = false;
                rejected.forEach(function (row) {
                    if (!row || row.reason !== 'stale') return;
                    var remote = res.data.stores && res.data.stores[row.key];
                    if (remote && 'value' in remote) {
                        writeLocal(row.key, remote.value, remote.updatedAt);
                        applied = true;
                    }
                });
                accepted.forEach(function (key) {
                    var remote = res.data.stores && res.data.stores[key];
                    if (!remote || !('value' in remote)) return;
                    if (!MERGE_ITEMS_KEYS[key] && !MERGE_MAP_KEYS[key]) return;
                    writeLocal(key, remote.value, remote.updatedAt);
                    applied = true;
                });
                if (applied) status.appliedRemote = true;
                return { ok: true, accepted: accepted, rejected: rejected, appliedStale: applied };
            })
            .catch(function (err) {
                status.ok = false;
                status.lastError = (err && err.message) || String(err);
                emitStatus();
                console.warn('[S35 sync] push', status.lastError);
                // Reencolar para reintento
                keys.forEach(function (k) { pendingKeys[k] = true; });
                return { ok: false, error: status.lastError };
            })
            .then(function (result) {
                pushing = false;
                if (pushAgain || Object.keys(pendingKeys).length) {
                    pushAgain = false;
                    return flushPush().then(function () { return result; });
                }
                return result;
            });
    }

    function pullAll() {
        var token = getToken();
        if (!token) return Promise.resolve({ ok: false, reason: 'no-token' });
        return fetch(API, {
            method: 'GET',
            headers: authHeaders(),
            cache: 'no-store'
        })
            .then(function (r) {
                return r.json().then(function (d) { return { ok: r.ok, status: r.status, data: d }; });
            })
            .then(function (res) {
                if (!res.ok || !res.data || !res.data.ok) {
                    throw new Error((res.data && res.data.error) || ('HTTP ' + res.status));
                }
                status.lastPullAt = new Date().toISOString();
                status.ok = true;
                status.lastError = null;
                emitStatus();
                return res.data.stores || {};
            });
    }

    /**
     * Pull + merge. Si hay cambios remotos aplicados, recarga una vez
     * para que inventario/fórmulas/POS lean el caché unificado.
     */
    function bootstrap(opts) {
        opts = opts || {};
        if (bootPromise) return bootPromise;
        var token = getToken();
        if (!token) {
            bootDone = true;
            return Promise.resolve({ ok: false, reason: 'no-token' });
        }

        bootPromise = pullAll()
            .then(function (remoteStores) {
                var applied = [];
                var toPush = [];

                SYNC_KEYS.forEach(function (key) {
                    var local = readLocal(key);
                    var remote = remoteStores[key];
                    if (!remote && local) {
                        toPush.push(key);
                        return;
                    }
                    if (remote && !local) {
                        writeLocal(key, remote.value, remote.updatedAt);
                        applied.push(key);
                        return;
                    }
                    if (!remote && !local) return;

                    var merged = mergeStoreValues(
                        key,
                        local.value,
                        remote.value,
                        local.updatedAt,
                        remote.updatedAt
                    );
                    if (merged) {
                        if (merged.applyLocal) {
                            writeLocal(key, merged.value, merged.updatedAt);
                            applied.push(key);
                        }
                        if (merged.push) toPush.push(key);
                        return;
                    }

                    var cmp = cmpIso(remote.updatedAt, local.updatedAt);
                    if (cmp > 0) {
                        writeLocal(key, remote.value, remote.updatedAt);
                        applied.push(key);
                    } else if (cmp < 0) {
                        toPush.push(key);
                    }
                    // igual → nada
                });

                status.appliedRemote = applied.length > 0;

                if (applied.length && !opts.skipReload) {
                    try {
                        if (!sessionStorage.getItem(RELOAD_FLAG)) {
                            sessionStorage.setItem(RELOAD_FLAG, '1');
                            // Subir locales más nuevos antes de recargar (best-effort).
                            toPush.forEach(function (k) { pendingKeys[k] = true; });
                            bootDone = true;
                            return flushPush().then(function () {
                                location.reload();
                                return { ok: true, reloading: true, applied: applied };
                            });
                        }
                    } catch (_) {}
                }
                try { sessionStorage.removeItem(RELOAD_FLAG); } catch (_) {}

                toPush.forEach(function (k) { pendingKeys[k] = true; });
                // También cualquier escritura que ocurrió durante el boot.
                bootDone = true;
                emitStatus();
                return flushPush().then(function (pushRes) {
                    return {
                        ok: true,
                        applied: applied,
                        pushed: (pushRes && pushRes.accepted) || toPush,
                        reloading: false
                    };
                });
            })
            .catch(function (err) {
                status.ok = false;
                status.lastError = (err && err.message) || String(err);
                console.warn('[S35 sync] pull', status.lastError);
                bootDone = true;
                emitStatus();
                // Offline: seguir con localStorage; intentar push de pendientes luego.
                if (Object.keys(pendingKeys).length) {
                    setTimeout(function () { flushPush(); }, 2000);
                }
                return { ok: false, error: status.lastError, offline: true };
            });

        return bootPromise;
    }

    // Interceptar escrituras a claves sincronizadas (cubre panel + POS).
    try {
        var origSetItem = localStorage.setItem.bind(localStorage);
        localStorage.setItem = function (key, value) {
            origSetItem(key, value);
            if (syncKeySet[key]) schedulePush(key);
        };
    } catch (err) {
        console.warn('[S35 sync] no se pudo enganchar localStorage', err);
    }

    // Arranque automático si hay sesión.
    if (getToken()) {
        // Diferir un tick para no bloquear parse de scripts siguientes.
        setTimeout(function () { bootstrap(); }, 0);
    }

    // Reintento al volver online / foco / cada 45s.
    function softPullAndApply() {
        if (!bootDone || !getToken()) return;
        // Primero subir pendientes locales para no perder ventas/gastos recientes.
        flushPush().then(function () {
            return pullAll();
        }).then(function (remoteStores) {
            var needReload = false;
            var toPush = [];
            SYNC_KEYS.forEach(function (key) {
                var local = readLocal(key);
                var remote = remoteStores[key];
                if (!remote) {
                    if (local) toPush.push(key);
                    return;
                }
                if (!local) {
                    writeLocal(key, remote.value, remote.updatedAt);
                    needReload = true;
                    return;
                }
                var merged = mergeStoreValues(
                    key,
                    local.value,
                    remote.value,
                    local.updatedAt,
                    remote.updatedAt
                );
                if (merged) {
                    if (merged.applyLocal) {
                        writeLocal(key, merged.value, merged.updatedAt);
                        needReload = true;
                    }
                    if (merged.push) toPush.push(key);
                    return;
                }
                if (cmpIso(remote.updatedAt, local.updatedAt) > 0) {
                    writeLocal(key, remote.value, remote.updatedAt);
                    needReload = true;
                }
            });
            toPush.forEach(function (k) { pendingKeys[k] = true; });
            emitStatus();
            var pushPromise = toPush.length ? flushPush() : Promise.resolve();
            return pushPromise.then(function () {
                if (needReload) {
                    try {
                        sessionStorage.setItem(RELOAD_FLAG, '1');
                    } catch (_) {}
                    location.reload();
                }
            });
        }).catch(function () {});
    }

    try {
        window.addEventListener('online', function () {
            if (bootDone) flushPush();
            else bootstrap({ skipReload: true });
        });
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible' && bootDone) {
                softPullAndApply();
            }
        });
        setInterval(function () {
            if (document.visibilityState === 'visible') softPullAndApply();
        }, 45000);
        // Flush al cerrar / ocultar pestaña (best-effort; keepalive no siempre disponible).
        window.addEventListener('pagehide', function () {
            try {
                if (Object.keys(pendingKeys).length) flushPush();
            } catch (_) {}
        });
    } catch (_) {}

    global.S35PanelSync = {
        KEYS: SYNC_KEYS.slice(),
        bootstrap: bootstrap,
        schedulePush: schedulePush,
        flushPush: flushPush,
        pullAll: pullAll,
        softPull: softPullAndApply,
        getStatus: function () {
            return Object.assign({}, status, { bootDone: bootDone, pending: Object.keys(pendingKeys) });
        }
    };
})(typeof window !== 'undefined' ? window : this);
