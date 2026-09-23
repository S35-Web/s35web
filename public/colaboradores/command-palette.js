/**
 * S35 Command Palette (⌘K)
 * Navegación: texto libre · @ámbito · /ir · >acción
 */
(function () {
    'use strict';

    const RECENT_KEY = 's35_cmd_recent';
    const MAX_RECENT = 8;
    const MAX_PER_GROUP = 6;
    const DEBOUNCE_MS = 90;

    const SECTIONS = [
        { id: 'dashboard', label: 'Inicio', aliases: ['inicio', 'home', 'dashboard'], icon: 'fa-border-all' },
        { id: 'venta', label: 'Venta', aliases: ['venta', 'pos', 'caja'], icon: 'fa-cash-register' },
        { id: 'cortes', label: 'Cortes', aliases: ['cortes', 'corte', 'reporte'], icon: 'fa-chart-simple' },
        { id: 'clients', label: 'Clientes', aliases: ['clientes', 'cliente', 'customers'], icon: 'fa-user-group' },
        { id: 'cobranza', label: 'Cobranza', aliases: ['cobranza', 'cxc', 'porcobrar'], icon: 'fa-file-invoice-dollar' },
        { id: 'promos', label: 'Promos', aliases: ['promos', 'promociones', 'cupones'], icon: 'fa-tags' },
        { id: 'salesHistory', label: 'Historial de ventas', aliases: ['historial', 'tickets', 'notas', 'ventas'], icon: 'fa-receipt' },
        { id: 'products', label: 'Productos', aliases: ['productos', 'producto', 'catalogo'], icon: 'fa-box' },
        { id: 'materials', label: 'Materias primas', aliases: ['materias', 'mp', 'inventario', 'materiales'], icon: 'fa-cubes' },
        { id: 'production', label: 'Producción', aliases: ['produccion', 'producir', 'planta'], icon: 'fa-industry' },
        { id: 'messages', label: 'Mensajes', aliases: ['mensajes', 'inbox', 'correo'], icon: 'fa-envelope' }
    ];

    const SCOPES = [
        { id: 'cliente', aliases: ['cliente', 'c', 'cli', 'clientes', 'customer'], label: 'Clientes', icon: 'fa-user' },
        { id: 'producto', aliases: ['producto', 'p', 'prod', 'productos'], label: 'Productos', icon: 'fa-box' },
        { id: 'mp', aliases: ['mp', 'materia', 'mat', 'materias', 'material'], label: 'Materias primas', icon: 'fa-cubes' },
        { id: 'ticket', aliases: ['ticket', 'venta', 'folio', 'nota', 'cfdi', 'factura'], label: 'Tickets', icon: 'fa-receipt' },
        { id: 'corte', aliases: ['corte', 'cortes'], label: 'Cortes', icon: 'fa-chart-simple' },
        { id: 'ir', aliases: ['ir', 'go', 'seccion'], label: 'Ir a sección', icon: 'fa-arrow-right' }
    ];

    const ACTIONS = [
        { id: 'venta', labels: ['venta', 'nueva venta', 'pos'], title: 'Ir a Venta', icon: 'fa-cash-register', section: 'venta' },
        { id: 'cliente', labels: ['cliente', 'nuevo cliente', 'alta cliente'], title: 'Nuevo cliente', icon: 'fa-user-plus', kind: 'new-client' },
        { id: 'cobranza', labels: ['cobranza'], title: 'Ir a Cobranza', icon: 'fa-file-invoice-dollar', section: 'cobranza' },
        { id: 'promos', labels: ['promos', 'promociones'], title: 'Ir a Promos', icon: 'fa-tags', section: 'promos' },
        { id: 'produccion', labels: ['produccion', 'producción'], title: 'Ir a Producción', icon: 'fa-industry', section: 'production' },
        { id: 'cortes', labels: ['corte', 'cortes', 'corte hoy'], title: 'Ir a Cortes', icon: 'fa-chart-simple', section: 'cortes', cortesDay: true },
        { id: 'productos', labels: ['productos'], title: 'Ir a Productos', icon: 'fa-box', section: 'products' },
        { id: 'materiales', labels: ['materias', 'materiales', 'mp'], title: 'Ir a Materias primas', icon: 'fa-cubes', section: 'materials' },
        { id: 'historial', labels: ['historial', 'tickets'], title: 'Ir a Historial', icon: 'fa-receipt', section: 'salesHistory' }
    ];

    let open = false;
    let activeIndex = 0;
    let results = [];
    let debounceTimer = null;
    let lastQuery = '';

    function panel() { return window.S35PanelAPI || {}; }
    function pos() { return window.S35PosModule || {}; }

    function canAccess(section) {
        if (typeof panel().canAccess === 'function') return panel().canAccess(section);
        return true;
    }

    function showSection(id, opts) {
        if (typeof panel().showSection === 'function') panel().showSection(id, opts || {});
    }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function norm(s) {
        return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    }

    function money(n) {
        if (pos().money) return pos().money(n);
        const v = Math.round((Number(n) || 0) * 100) / 100;
        return '$' + v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function scoreMatch(hay, needle) {
        if (!needle) return 1;
        const h = norm(hay);
        const n = norm(needle);
        if (!h || !n) return 0;
        if (h === n) return 100;
        if (h.startsWith(n)) return 80;
        const idx = h.indexOf(n);
        if (idx >= 0) return 60 - Math.min(idx, 40);
        const parts = n.split(/\s+/).filter(Boolean);
        if (parts.length > 1 && parts.every(function (p) { return h.indexOf(p) >= 0; })) return 45;
        return 0;
    }

    function resolveScope(token) {
        const t = norm(token);
        for (let i = 0; i < SCOPES.length; i++) {
            if (SCOPES[i].aliases.indexOf(t) >= 0) return SCOPES[i];
        }
        return null;
    }

    function parseQuery(raw) {
        const q = String(raw || '').trim();
        if (!q) return { mode: 'empty', query: '' };

        const factura = q.match(/^(?:factura|cfdi|folio)\s+([#\w.-]+)$/i);
        if (factura) return { mode: 'scope', scope: 'ticket', query: factura[1] };

        const ciudad = q.match(/^ciudad\s+(\S+)$/i);
        if (ciudad) return { mode: 'city', query: ciudad[1] };

        if (q.charAt(0) === '@') {
            const rest = q.slice(1);
            if (!rest || /^\S*$/.test(rest) && rest.indexOf(' ') < 0) {
                const partial = norm(rest);
                const matches = SCOPES.filter(function (s) {
                    return !partial || s.aliases.some(function (a) { return a.indexOf(partial) === 0 || a === partial; });
                });
                const exact = resolveScope(rest);
                if (exact && rest.indexOf(' ') < 0 && SCOPES.some(function (s) { return s.aliases.indexOf(norm(rest)) >= 0; })) {
                    // "@cliente" alone → scope with empty query (browse hint)
                    if (matches.length === 1 || exact.aliases.indexOf(norm(rest)) >= 0) {
                        return { mode: 'scope', scope: exact.id, query: '', picking: false };
                    }
                }
                return { mode: 'scope-pick', query: partial, matches: matches };
            }
            const m = rest.match(/^(\S+)\s*(.*)$/);
            const scope = resolveScope(m && m[1]);
            if (!scope) return { mode: 'scope-pick', query: norm(m && m[1]), matches: SCOPES.filter(function (s) {
                const p = norm(m && m[1]);
                return s.aliases.some(function (a) { return a.indexOf(p) === 0; });
            }) };
            return { mode: 'scope', scope: scope.id, query: (m && m[2] || '').trim() };
        }

        if (q.charAt(0) === '/' || /^ir\s+/i.test(q)) {
            let text = q.charAt(0) === '/' ? q.slice(1).trim() : q.replace(/^ir\s+/i, '').trim();
            return { mode: 'go', query: text };
        }

        if (q.charAt(0) === '>' || q.charAt(0) === '+') {
            return { mode: 'action', query: q.slice(1).trim(), prefix: q.charAt(0) };
        }

        return { mode: 'free', query: q };
    }

    function loadRecent() {
        try {
            const raw = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
            return Array.isArray(raw) ? raw : [];
        } catch (_) {
            return [];
        }
    }

    function pushRecent(item) {
        if (!item || !item.recentKey) return;
        const list = loadRecent().filter(function (r) { return r.recentKey !== item.recentKey; });
        list.unshift({
            recentKey: item.recentKey,
            kind: item.kind,
            title: item.title,
            subtitle: item.subtitle || '',
            icon: item.icon || 'fa-clock-rotate-left',
            payload: item.payload || {},
            ts: Date.now()
        });
        localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
    }

    function activeSectionId() {
        const el = document.querySelector('.section.active');
        return el ? el.id : 'dashboard';
    }

    function makeResult(opts) {
        return opts;
    }

    function searchSections(query, limit) {
        const out = [];
        SECTIONS.forEach(function (s) {
            if (!canAccess(s.id)) return;
            let sc = 0;
            if (!query) sc = 40;
            else {
                sc = Math.max(scoreMatch(s.label, query), scoreMatch(s.id, query));
                s.aliases.forEach(function (a) { sc = Math.max(sc, scoreMatch(a, query)); });
            }
            if (sc <= 0 && query) return;
            out.push(makeResult({
                id: 'go:' + s.id,
                group: 'go',
                groupLabel: 'Ir a',
                kind: 'section',
                title: s.label,
                subtitle: '/' + s.id,
                icon: s.icon,
                score: sc,
                recentKey: 'section:' + s.id,
                payload: { section: s.id }
            }));
        });
        return out.sort(function (a, b) { return b.score - a.score; }).slice(0, limit || MAX_PER_GROUP);
    }

    function searchClients(query, limit) {
        const list = typeof pos().getClients === 'function' ? pos().getClients() : [];
        const out = [];
        for (let i = 0; i < list.length; i++) {
            const c = list[i];
            if (!c) continue;
            const sc = Math.max(
                scoreMatch(c.name, query),
                scoreMatch(c.company, query),
                scoreMatch(c.rfc, query),
                scoreMatch(c.phone, query),
                scoreMatch(c.email, query)
            );
            if (query && sc <= 0) continue;
            if (!query) continue;
            out.push(makeResult({
                id: 'client:' + c.id,
                group: 'clientes',
                groupLabel: 'Clientes',
                kind: 'client',
                title: c.name || 'Sin nombre',
                subtitle: [c.company, c.rfc, (c.type === 'distributor' || c.kind === 'distributor') ? 'Distribuidor' : 'Cliente']
                    .filter(Boolean).join(' · '),
                icon: 'fa-user',
                score: sc,
                recentKey: 'client:' + c.id,
                payload: { clientId: c.id }
            }));
        }
        return out.sort(function (a, b) { return b.score - a.score; }).slice(0, limit || MAX_PER_GROUP);
    }

    function searchProducts(query, limit) {
        const list = typeof panel().getProducts === 'function' ? panel().getProducts() : [];
        const out = [];
        for (let i = 0; i < list.length; i++) {
            const p = list[i];
            if (!p) continue;
            const sc = Math.max(
                scoreMatch(p.name, query),
                scoreMatch(p.code, query),
                scoreMatch(p.family, query),
                scoreMatch(p.slug, query)
            );
            if (query && sc <= 0) continue;
            if (!query) continue;
            out.push(makeResult({
                id: 'product:' + (p.slug || p.id),
                group: 'productos',
                groupLabel: 'Productos',
                kind: 'product',
                title: p.name || p.slug,
                subtitle: [p.code, p.family].filter(Boolean).join(' · '),
                icon: 'fa-box',
                score: sc,
                recentKey: 'product:' + (p.slug || p.id),
                payload: { slug: p.slug || p.id }
            }));
        }
        return out.sort(function (a, b) { return b.score - a.score; }).slice(0, limit || MAX_PER_GROUP);
    }

    function searchMaterials(query, limit) {
        const list = typeof panel().getMaterials === 'function' ? panel().getMaterials() : [];
        const out = [];
        for (let i = 0; i < list.length; i++) {
            const m = list[i];
            if (!m) continue;
            const sc = Math.max(scoreMatch(m.name, query), scoreMatch(m.id, query), scoreMatch(m.family, query));
            if (query && sc <= 0) continue;
            if (!query) continue;
            const stock = m.stock != null ? ('Stock ' + m.stock) : '';
            out.push(makeResult({
                id: 'mat:' + m.id,
                group: 'materias',
                groupLabel: 'Materias primas',
                kind: 'material',
                title: m.name || m.id,
                subtitle: [m.family, stock].filter(Boolean).join(' · '),
                icon: 'fa-cubes',
                score: sc,
                recentKey: 'mat:' + m.id,
                payload: { materialId: m.id, name: m.name }
            }));
        }
        return out.sort(function (a, b) { return b.score - a.score; }).slice(0, limit || MAX_PER_GROUP);
    }

    function searchTickets(query, limit) {
        if (!query || query.length < 2) return [];
        if (typeof pos().searchSales !== 'function') return [];
        const hits = pos().searchSales(query, limit || MAX_PER_GROUP) || [];
        return hits.map(function (s) {
            const d = s.createdAt ? new Date(s.createdAt) : null;
            const dateStr = d && !isNaN(d) ? d.toLocaleDateString('es-MX', { dateStyle: 'short' }) : '';
            const folio = s.folio || s.id || '';
            const client = (s.customer && s.customer.name) || s.clientName || s.client || '';
            const bill = s.billing === 'facturado' ? 'Facturado' : 'Sin facturar';
            return makeResult({
                id: 'sale:' + s.id,
                group: 'tickets',
                groupLabel: 'Tickets',
                kind: 'ticket',
                title: folio,
                subtitle: [dateStr, client, money(s.total), bill].filter(Boolean).join(' · '),
                icon: 'fa-receipt',
                score: s._score || 50,
                recentKey: 'sale:' + s.id,
                payload: { saleId: s.id }
            });
        });
    }

    function searchActions(query, prefix) {
        const out = [];
        const q = norm(query);
        ACTIONS.forEach(function (a) {
            if (a.section && !canAccess(a.section)) return;
            if (a.kind === 'new-client' && !canAccess('clients')) return;
            let sc = 0;
            if (!q) sc = 50;
            else {
                a.labels.forEach(function (l) { sc = Math.max(sc, scoreMatch(l, q)); });
                sc = Math.max(sc, scoreMatch(a.title, q));
            }
            if (q && sc <= 0) return;
            const title = prefix === '+' && a.kind === 'new-client' && query
                ? ('Nuevo cliente: ' + query)
                : a.title;
            out.push(makeResult({
                id: 'action:' + a.id + (query ? ':' + query : ''),
                group: 'acciones',
                groupLabel: 'Acciones',
                kind: 'action',
                title: title,
                subtitle: prefix ? (prefix + (query || a.labels[0])) : a.labels[0],
                icon: a.icon,
                score: sc,
                recentKey: 'action:' + a.id,
                payload: {
                    actionId: a.id,
                    section: a.section,
                    kind: a.kind,
                    cortesDay: !!a.cortesDay,
                    clientName: a.kind === 'new-client' ? query : ''
                }
            }));
        });
        return out.sort(function (a, b) { return b.score - a.score; }).slice(0, MAX_PER_GROUP);
    }

    function cityResults(query) {
        const cities = typeof pos().getSaleCities === 'function' ? pos().getSaleCities() : [];
        const q = norm(query);
        const out = [];
        [{ id: 'all', label: 'Todas' }].concat(cities).forEach(function (c) {
            const sc = !q ? 40 : Math.max(scoreMatch(c.label, q), scoreMatch(c.id, q), scoreMatch(c.short, q));
            if (q && sc <= 0) return;
            out.push(makeResult({
                id: 'city:' + c.id,
                group: 'cortes',
                groupLabel: 'Cortes · ciudad',
                kind: 'city',
                title: 'Ciudad: ' + c.label,
                subtitle: 'Filtrar Cortes',
                icon: 'fa-location-dot',
                score: sc,
                recentKey: 'city:' + c.id,
                payload: { cityId: c.id }
            }));
        });
        return out.sort(function (a, b) { return b.score - a.score; });
    }

    function scopePickResults(parsed) {
        return (parsed.matches || SCOPES).map(function (s) {
            return makeResult({
                id: 'scope:' + s.id,
                group: 'ambitos',
                groupLabel: 'Ámbitos',
                kind: 'scope',
                title: '@' + s.id,
                subtitle: s.label + ' · ' + s.aliases.slice(0, 3).join(', '),
                icon: s.icon,
                score: 90,
                payload: { scopeInsert: '@' + s.id + ' ' }
            });
        });
    }

    function emptyResults() {
        const out = [];
        const recent = loadRecent();
        recent.forEach(function (r) {
            out.push(makeResult({
                id: 'recent:' + r.recentKey,
                group: 'recientes',
                groupLabel: 'Recientes',
                kind: 'recent',
                title: r.title,
                subtitle: r.subtitle || 'Reciente',
                icon: r.icon || 'fa-clock-rotate-left',
                score: 100,
                recentKey: r.recentKey,
                payload: Object.assign({ _recentKind: r.kind }, r.payload || {})
            }));
        });

        const sec = activeSectionId();
        const tips = [];
        if (sec === 'venta' && canAccess('products')) {
            tips.push({ title: 'Buscar producto', subtitle: '@producto adhesivo', insert: '@producto ' });
            tips.push({ title: 'Abrir cliente', subtitle: '@cliente ', insert: '@cliente ' });
        } else if (sec === 'cortes') {
            tips.push({ title: 'Filtrar ciudad', subtitle: 'ciudad mazatlan', insert: 'ciudad mazatlan' });
            tips.push({ title: 'Ir a historial', subtitle: '/historial', insert: '/historial' });
        } else if (sec === 'clients') {
            tips.push({ title: 'Buscar cliente', subtitle: '@cliente ', insert: '@cliente ' });
            tips.push({ title: 'Nuevo cliente', subtitle: '+cliente', insert: '+cliente ' });
        } else {
            tips.push({ title: 'Ir a Venta', subtitle: '/venta', insert: '/venta' });
            tips.push({ title: 'Buscar en todo', subtitle: 'Escribe un nombre, folio o RFC', insert: '' });
        }
        tips.forEach(function (t, i) {
            out.push(makeResult({
                id: 'tip:' + i,
                group: 'sugerencias',
                groupLabel: 'Sugerencias',
                kind: 'tip',
                title: t.title,
                subtitle: t.subtitle,
                icon: 'fa-lightbulb',
                score: 70 - i,
                payload: { scopeInsert: t.insert, runInsertOnly: true }
            }));
        });

        searchSections('', 5).forEach(function (r) {
            r.group = 'go';
            r.groupLabel = 'Ir a';
            out.push(r);
        });
        return out;
    }

    function buildResults(raw) {
        const parsed = parseQuery(raw);
        let list = [];

        if (parsed.mode === 'empty') return emptyResults();
        if (parsed.mode === 'scope-pick') return scopePickResults(parsed);
        if (parsed.mode === 'city') return cityResults(parsed.query);

        if (parsed.mode === 'go') {
            return searchSections(parsed.query, 12);
        }

        if (parsed.mode === 'action') {
            return searchActions(parsed.query, parsed.prefix);
        }

        if (parsed.mode === 'scope') {
            if (parsed.scope === 'cliente' && canAccess('clients')) {
                if (parsed.query) list = list.concat(searchClients(parsed.query, MAX_PER_GROUP));
                else list.push(makeResult({
                    id: 'hint:cliente', group: 'ambitos', groupLabel: 'Clientes', kind: 'tip',
                    title: 'Escribe un nombre, RFC o teléfono', subtitle: '@cliente iwa',
                    icon: 'fa-user', score: 10, payload: { scopeInsert: '@cliente ', runInsertOnly: true }
                }));
            }
            if (parsed.scope === 'producto' && canAccess('products')) {
                if (parsed.query) list = list.concat(searchProducts(parsed.query, MAX_PER_GROUP));
                else list.push(makeResult({
                    id: 'hint:producto', group: 'ambitos', groupLabel: 'Productos', kind: 'tip',
                    title: 'Escribe nombre, código o familia', subtitle: '@producto adhesivo',
                    icon: 'fa-box', score: 10, payload: { scopeInsert: '@producto ', runInsertOnly: true }
                }));
            }
            if (parsed.scope === 'mp' && canAccess('materials')) {
                if (parsed.query) list = list.concat(searchMaterials(parsed.query, MAX_PER_GROUP));
                else list.push(makeResult({
                    id: 'hint:mp', group: 'ambitos', groupLabel: 'Materias primas', kind: 'tip',
                    title: 'Escribe el nombre del material', subtitle: '@mp cemento',
                    icon: 'fa-cubes', score: 10, payload: { scopeInsert: '@mp ', runInsertOnly: true }
                }));
            }
            if (parsed.scope === 'ticket' && canAccess('salesHistory')) {
                if (parsed.query) list = list.concat(searchTickets(parsed.query, MAX_PER_GROUP));
                else list.push(makeResult({
                    id: 'hint:ticket', group: 'ambitos', groupLabel: 'Tickets', kind: 'tip',
                    title: 'Escribe folio, CFDI o cliente', subtitle: '@ticket 12276',
                    icon: 'fa-receipt', score: 10, payload: { scopeInsert: '@ticket ', runInsertOnly: true }
                }));
            }
            if (parsed.scope === 'corte' && canAccess('cortes')) {
                list = list.concat(searchSections('cortes', 1));
                list = list.concat(cityResults(parsed.query));
            }
            if (parsed.scope === 'ir') list = list.concat(searchSections(parsed.query, 12));
            if (!list.length && parsed.query) {
                list.push(makeResult({
                    id: 'empty',
                    group: 'info',
                    groupLabel: 'Sin resultados',
                    kind: 'noop',
                    title: 'Nada para «' + parsed.query + '»',
                    subtitle: 'Prueba otro término o quita el @ámbito',
                    icon: 'fa-circle-info',
                    score: 0,
                    payload: {}
                }));
            }
            return list;
        }

        // free
        const q = parsed.query;
        if (canAccess('clients')) list = list.concat(searchClients(q, 4));
        if (canAccess('products')) list = list.concat(searchProducts(q, 4));
        if (canAccess('materials')) list = list.concat(searchMaterials(q, 3));
        if (canAccess('salesHistory')) list = list.concat(searchTickets(q, 4));
        list = list.concat(searchSections(q, 4));
        list = list.concat(searchActions(q, '>').slice(0, 3));

        // city shortcut in free text
        if (/mazatlan|mochis|culiacan|mzt|cln|lmm/i.test(q) && canAccess('cortes')) {
            list = list.concat(cityResults(q).slice(0, 2));
        }

        list.sort(function (a, b) { return b.score - a.score; });
        if (!list.length) {
            list.push(makeResult({
                id: 'empty',
                group: 'info',
                groupLabel: 'Sin resultados',
                kind: 'noop',
                title: 'Sin coincidencias',
                subtitle: 'Usa @cliente, @producto, /cortes o >venta',
                icon: 'fa-circle-info',
                score: 0,
                payload: {}
            }));
        }
        return list.slice(0, 24);
    }

    function runResult(item) {
        if (!item || item.kind === 'noop') return;

        if (item.kind === 'scope' || (item.payload && item.payload.scopeInsert != null && (item.kind === 'tip' || item.payload.runInsertOnly))) {
            const input = document.getElementById('cmdPaletteInput');
            if (input) {
                input.value = item.payload.scopeInsert || '';
                input.focus();
                refreshResults();
                return;
            }
        }

        if (item.kind === 'recent') {
            const kind = item.payload && item.payload._recentKind;
            const fake = {
                kind: kind,
                title: item.title,
                subtitle: item.subtitle,
                icon: item.icon,
                recentKey: item.recentKey,
                payload: item.payload
            };
            runResult(fake);
            return;
        }

        pushRecent(item);
        closePalette(true);

        if (item.kind === 'section') {
            showSection(item.payload.section);
            return;
        }
        if (item.kind === 'client') {
            showSection('clients');
            if (pos().openClientDashboard) pos().openClientDashboard(item.payload.clientId);
            return;
        }
        if (item.kind === 'product') {
            showSection('products', { slug: item.payload.slug, tab: 'resumen' });
            if (typeof panel().openProduct === 'function') panel().openProduct(item.payload.slug);
            return;
        }
        if (item.kind === 'material') {
            showSection('materials');
            if (typeof panel().focusMaterialSearch === 'function') {
                panel().focusMaterialSearch(item.payload.name || '');
            }
            return;
        }
        if (item.kind === 'ticket') {
            showSection('salesHistory');
            if (pos().openSaleNoteById) pos().openSaleNoteById(item.payload.saleId);
            return;
        }
        if (item.kind === 'city') {
            showSection('cortes');
            if (pos().setCortesCityFilter) pos().setCortesCityFilter(item.payload.cityId);
            return;
        }
        if (item.kind === 'action') {
            const p = item.payload || {};
            if (p.kind === 'new-client') {
                showSection('clients');
                if (pos().openClientModal) pos().openClientModal(null, { name: p.clientName || '' });
                return;
            }
            if (p.section) {
                showSection(p.section);
                if (p.cortesDay && pos().openCortesPeriod) pos().openCortesPeriod('day');
            }
        }
    }

    function renderList() {
        const host = document.getElementById('cmdPaletteResults');
        if (!host) return;
        if (!results.length) {
            host.innerHTML = '<div class="cmd-empty">Escribe para buscar · @cliente · /cortes · &gt;venta</div>';
            return;
        }
        let html = '';
        let lastGroup = null;
        results.forEach(function (r, idx) {
            if (r.group !== lastGroup) {
                lastGroup = r.group;
                html += '<div class="cmd-group-label">' + esc(r.groupLabel || r.group) + '</div>';
            }
            html +=
                '<button type="button" class="cmd-item' + (idx === activeIndex ? ' is-active' : '') + '" data-cmd-idx="' + idx + '" role="option" aria-selected="' + (idx === activeIndex ? 'true' : 'false') + '">' +
                '<span class="cmd-item-icon"><i class="fa-solid ' + esc(r.icon || 'fa-circle') + '" aria-hidden="true"></i></span>' +
                '<span class="cmd-item-body">' +
                '<span class="cmd-item-title">' + esc(r.title) + '</span>' +
                (r.subtitle ? '<span class="cmd-item-sub">' + esc(r.subtitle) + '</span>' : '') +
                '</span>' +
                '</button>';
        });
        host.innerHTML = html;
        const active = host.querySelector('.cmd-item.is-active');
        if (active && typeof active.scrollIntoView === 'function') {
            active.scrollIntoView({ block: 'nearest' });
        }
    }

    function refreshResults() {
        const input = document.getElementById('cmdPaletteInput');
        lastQuery = input ? input.value : '';
        results = buildResults(lastQuery);
        activeIndex = 0;
        renderList();
        const hint = document.getElementById('cmdPaletteHint');
        if (hint) {
            const parsed = parseQuery(lastQuery);
            if (parsed.mode === 'scope-pick') hint.textContent = 'Tab o Enter para elegir ámbito';
            else if (parsed.mode === 'scope') hint.textContent = '@' + parsed.scope + (parsed.query ? ' · ' + parsed.query : '');
            else if (parsed.mode === 'go') hint.textContent = 'Ir a sección';
            else if (parsed.mode === 'action') hint.textContent = 'Acción rápida';
            else if (parsed.mode === 'empty') hint.textContent = 'Navegación global';
            else hint.textContent = 'Buscar en todo el sistema';
        }
    }

    function openPalette(seed) {
        const backdrop = document.getElementById('cmdPalette');
        if (!backdrop) return;
        open = true;
        backdrop.classList.add('show');
        backdrop.setAttribute('aria-hidden', 'false');
        const input = document.getElementById('cmdPaletteInput');
        if (input) {
            input.value = seed != null ? seed : '';
            input.focus();
            input.select();
        }
        refreshResults();
    }

    function closePalette(keepHeader) {
        const backdrop = document.getElementById('cmdPalette');
        if (!backdrop) return;
        open = false;
        backdrop.classList.remove('show');
        backdrop.setAttribute('aria-hidden', 'true');
        if (!keepHeader) {
            const gs = document.getElementById('globalSearch');
            if (gs) gs.blur();
        }
    }

    function moveActive(delta) {
        if (!results.length) return;
        activeIndex = (activeIndex + delta + results.length) % results.length;
        renderList();
    }

    function tryCompleteScope() {
        const input = document.getElementById('cmdPaletteInput');
        if (!input) return false;
        const parsed = parseQuery(input.value);
        if (parsed.mode === 'scope-pick' && parsed.matches && parsed.matches.length) {
            input.value = '@' + parsed.matches[0].id + ' ';
            refreshResults();
            return true;
        }
        return false;
    }

    function onInput() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(refreshResults, DEBOUNCE_MS);
    }

    function bind() {
        const backdrop = document.getElementById('cmdPalette');
        const input = document.getElementById('cmdPaletteInput');
        const resultsEl = document.getElementById('cmdPaletteResults');
        const gs = document.getElementById('globalSearch');
        const label = document.querySelector('.global-search');

        if (!backdrop || !input) return;

        if (label) {
            label.addEventListener('click', function (e) {
                e.preventDefault();
                openPalette(gs ? gs.value : '');
            });
        }
        if (gs) {
            gs.setAttribute('readonly', 'readonly');
            gs.addEventListener('focus', function (e) {
                e.preventDefault();
                gs.blur();
                openPalette(gs.value);
            });
        }

        backdrop.addEventListener('click', function (e) {
            if (e.target === backdrop) closePalette();
        });
        const closeBtn = document.getElementById('cmdPaletteClose');
        if (closeBtn) closeBtn.addEventListener('click', function () { closePalette(); });

        input.addEventListener('input', onInput);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                moveActive(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                moveActive(-1);
            } else if (e.key === 'Tab') {
                if (tryCompleteScope()) e.preventDefault();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results[activeIndex]) runResult(results[activeIndex]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closePalette();
            }
        });

        if (resultsEl) {
            resultsEl.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-cmd-idx]');
                if (!btn) return;
                const idx = Number(btn.getAttribute('data-cmd-idx'));
                if (results[idx]) runResult(results[idx]);
            });
            resultsEl.addEventListener('mousemove', function (e) {
                const btn = e.target.closest('[data-cmd-idx]');
                if (!btn) return;
                const idx = Number(btn.getAttribute('data-cmd-idx'));
                if (idx !== activeIndex) {
                    activeIndex = idx;
                    renderList();
                }
            });
        }

        document.addEventListener('keydown', function (e) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (open) closePalette();
                else openPalette();
            } else if (e.key === 'Escape' && open) {
                e.preventDefault();
                closePalette();
            }
        });
    }

    function init() {
        bind();
        window.S35CommandPalette = {
            open: openPalette,
            close: closePalette,
            isOpen: function () { return open; }
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
