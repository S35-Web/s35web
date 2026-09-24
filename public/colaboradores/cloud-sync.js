/*
 * cloud-sync.js — Sincroniza el estado del panel de Colaboradores con la nube.
 *
 * El panel guarda su estado de negocio (ventas, cortes, precios, fórmulas,
 * inventario de planta, materias primas, producción, clientes POS...) en
 * localStorage bajo claves con prefijo `s35_`. Este script hace que esos datos
 * vivan en la nube (API `/api/state`) para verlos desde cualquier navegador o
 * computadora:
 *
 *   1. HIDRATACIÓN: al cargar el panel, descarga el estado de la nube y lo
 *      escribe en localStorage ANTES de que arranque la app (XHR síncrono).
 *   2. EMPUJE: intercepta localStorage.setItem y sube cada cambio a la nube
 *      (con "debounce" para agrupar ráfagas).
 *   3. AVISO DE CAMBIOS: sondea la nube cada pocos segundos; si otro dispositivo
 *      guardó algo nuevo, ofrece un botón para actualizar.
 *
 * Debe cargarse como script clásico (sin defer/async) ANTES del script del
 * panel para que la hidratación ocurra a tiempo.
 */
(function () {
    'use strict';

    var TOKEN_KEY = 's35_admin_token';
    // Debe coincidir con NON_SYNCED_KEYS en api/_lib/state-store.js
    var NON_SYNCED = {
        's35_admin_token': 1,
        's35_admin_user': 1,
        's35_panel_theme': 1,
        's35_role_override': 1,
        's35_pos_sale_city': 1,
        's35_pos_prices_v2': 1,
        's35_pos_prices_v3': 1
    };
    var PUSH_DEBOUNCE_MS = 700;
    var POLL_INTERVAL_MS = 15000;

    var nativeSetItem = window.Storage && window.Storage.prototype
        ? window.Storage.prototype.setItem
        : null;

    function getToken() {
        try { return window.localStorage.getItem(TOKEN_KEY); } catch (_) { return null; }
    }

    function isSyncableKey(key) {
        return typeof key === 'string' && key.indexOf('s35_') === 0 && !NON_SYNCED[key];
    }

    function setLocalRaw(key, value) {
        try {
            if (nativeSetItem) nativeSetItem.call(window.localStorage, key, value);
            else window.localStorage.setItem(key, value);
        } catch (_) {}
    }

    // Máximo updatedAt conocido (de nuestra hidratación y de nuestras escrituras).
    var lastKnownUpdatedAt = null;
    function noteUpdatedAt(u) {
        if (u && (!lastKnownUpdatedAt || u > lastKnownUpdatedAt)) lastKnownUpdatedAt = u;
    }

    // ---------------------------------------------------------------------
    // 1) HIDRATACIÓN (síncrona, antes de que arranque la app)
    // ---------------------------------------------------------------------
    function hydrate() {
        var token = getToken();
        if (!token) return false;
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/api/state', false); // síncrono a propósito
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.send(null);
            if (xhr.status < 200 || xhr.status >= 300) return false;
            var data = JSON.parse(xhr.responseText || '{}');
            if (!data || !data.ok || !data.state) return false;
            var keys = Object.keys(data.state);
            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                var v = data.state[k];
                if (isSyncableKey(k) && typeof v === 'string') setLocalRaw(k, v);
            }
            noteUpdatedAt(data.updatedAt);
            return true;
        } catch (e) {
            // Sin conexión o error: seguimos con los datos locales.
            return false;
        }
    }

    // ---------------------------------------------------------------------
    // 2) EMPUJE (debounce por clave)
    // ---------------------------------------------------------------------
    var pending = {};   // key -> value más reciente por enviar
    var timers = {};    // key -> timeout id
    var inFlight = 0;

    function hasPendingWork() {
        if (inFlight > 0) return true;
        for (var k in pending) { if (Object.prototype.hasOwnProperty.call(pending, k)) return true; }
        return false;
    }

    function pushKeyNow(key, value, useSync) {
        var token = getToken();
        if (!token) return;
        var url = '/api/state?key=' + encodeURIComponent(key);
        var payload = JSON.stringify({ value: value });
        if (useSync) {
            try {
                var xhr = new XMLHttpRequest();
                xhr.open('PUT', url, false);
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(payload);
                if (xhr.status >= 200 && xhr.status < 300) {
                    try { noteUpdatedAt(JSON.parse(xhr.responseText || '{}').updatedAt); } catch (_) {}
                }
            } catch (_) {}
            return;
        }
        inFlight += 1;
        fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
        }).then(function (r) {
            return r.ok ? r.json() : null;
        }).then(function (j) {
            if (j && j.updatedAt) noteUpdatedAt(j.updatedAt);
        }).catch(function () {
            // Reintentar más tarde: reencolar si no hay una versión más nueva.
            if (!(key in pending)) pending[key] = value;
        }).then(function () {
            inFlight -= 1;
        });
    }

    function schedulePush(key, value) {
        pending[key] = value;
        if (timers[key]) clearTimeout(timers[key]);
        timers[key] = setTimeout(function () {
            var v = pending[key];
            delete pending[key];
            delete timers[key];
            if (typeof v === 'string') pushKeyNow(key, v, false);
        }, PUSH_DEBOUNCE_MS);
    }

    function flushSync() {
        for (var key in pending) {
            if (!Object.prototype.hasOwnProperty.call(pending, key)) continue;
            var v = pending[key];
            if (timers[key]) { clearTimeout(timers[key]); delete timers[key]; }
            if (typeof v === 'string') pushKeyNow(key, v, true);
        }
        pending = {};
    }

    function installSetItemHook() {
        try {
            var ls = window.localStorage;
            ls.setItem = function (key, value) {
                setLocalRaw(key, value);
                if (isSyncableKey(key) && getToken()) {
                    schedulePush(key, String(value));
                }
            };
        } catch (_) {}
    }

    // ---------------------------------------------------------------------
    // 3) AVISO DE CAMBIOS DE OTROS DISPOSITIVOS
    // ---------------------------------------------------------------------
    var reloadBtn = null;
    function showReloadPrompt() {
        if (reloadBtn) return;
        reloadBtn = document.createElement('button');
        reloadBtn.type = 'button';
        reloadBtn.textContent = '↻ Datos nuevos — Actualizar';
        reloadBtn.style.cssText = [
            'position:fixed', 'right:16px', 'bottom:16px', 'z-index:99999',
            'padding:10px 16px', 'border:0', 'border-radius:10px',
            'background:#0a84ff', 'color:#fff', 'font:500 14px/1 system-ui,sans-serif',
            'box-shadow:0 8px 24px rgba(10,132,255,.35)', 'cursor:pointer'
        ].join(';');
        reloadBtn.addEventListener('click', function () { window.location.reload(); });
        if (document.body) document.body.appendChild(reloadBtn);
    }

    function pollForRemoteChanges() {
        var token = getToken();
        if (!token || hasPendingWork()) return;
        fetch('/api/state?meta=1', {
            headers: { 'Authorization': 'Bearer ' + token }
        }).then(function (r) { return r.ok ? r.json() : null; })
          .then(function (j) {
              if (!j || !j.ok || !j.updatedAt) return;
              if (lastKnownUpdatedAt && j.updatedAt > lastKnownUpdatedAt && !hasPendingWork()) {
                  showReloadPrompt();
              }
          }).catch(function () {});
    }

    // ---------------------------------------------------------------------
    // Arranque
    // ---------------------------------------------------------------------
    var hydrated = hydrate();     // síncrono: ocurre antes que la app
    installSetItemHook();

    window.addEventListener('beforeunload', flushSync);
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') flushSync();
    });
    window.addEventListener('load', function () {
        setInterval(pollForRemoteChanges, POLL_INTERVAL_MS);
    });

    window.S35CloudSync = {
        hydrated: hydrated,
        hydrate: hydrate,
        flush: flushSync,
        isSyncableKey: isSyncableKey,
        pending: function () { return Object.keys(pending); },
        lastUpdatedAt: function () { return lastKnownUpdatedAt; }
    };
})();
