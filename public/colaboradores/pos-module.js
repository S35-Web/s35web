/* POS + Clientes + Historial + Cortes + Precios — módulo del panel Colaboradores */
(function () {
    'use strict';

    // v4: lista oficial (Basecoat 340/360, Pastablock 30 kg, líquidos).
    // v3: merges price-list duplicates (PLUS+) into FT-* recipe slugs.
    const PRICE_KEY = 's35_pos_prices_v4';
    const PRICE_KEY_LEGACY = 's35_pos_prices_v3';
    const PRICE_KEY_LEGACY_V2 = 's35_pos_prices_v2';
    /** Slugs de lista eliminados → slug canónico (ficha FT / receta). */
    const PRICE_MERGE_FROM = {
        'basecoat-blanco-intenso-plus': 'basecoat-plus-blanco',
        'waxtard-basecoat-gris-plus': 'basecoat-plus-gris'
    };
    const SALES_KEY = 's35_pos_sales';
    const CAJA_GASTOS_KEY = 's35_caja_gastos_v1';
    const TESORERIA_MOVS_KEY = 's35_tesoreria_movs_v1';
    /** Corte oficial dado el 26 sep 2026 · 13:40 (Culiacán). Lo anterior no mueve el saldo. */
    const TESORERIA_OPENED_AT = Date.parse('2026-09-26T20:40:00.000Z');
    const TESORERIA_OPENING = {
        efectivo: 20400,
        banco: 281934.94,
        tarjeta_sf: 407.08
    };
    const TESORERIA_BANK_SEED_URL = '/colaboradores/data/banorte-2026-06-09.json';
    const TESORERIA_BANK_META = {
        name: 'Banorte',
        account: '112017860014',
        clabe: '058730000001816719',
        holder: 'PRODUCTOS S35 S.A. DE C.V.',
        city: 'culiacan',
        opening: 1838.47,
        closing: 281934.94
    };
    const SALE_EDITS_KEY = 's35_sale_edits_v1';
    const CLIENTS_KEY = 's35_pos_clients';
    const FINISHED_KEY = 's35_finished_stock';
    const PROMO_CODES_KEY = 's35_promo_codes_v1';

    /** Fallback flat (sin lista mayorista) — se replica en los 6 escalones. */
    const FAMILY_DEFAULTS = {
        'Estucos premium': 450,
        'Microconcretos': 480,
        'Panel System': 420,
        'Pro+ Systems': 400,
        'Pegaxpress: Adhesivos': 380,
        'Líquidos': 520
    };

    /** Acentos de familia (catálogo / --pr-family-gradient / --family-accent). */
    const FAMILY_COLORS = {
        'Estucos premium': '#2f7d32',
        'Microconcretos': '#5a5a5a',
        'Panel System': '#1a1a1a',
        'Pro+ Systems': '#e65100',
        'Pegaxpress: Adhesivos': '#7b1fa2',
        'Líquidos': '#c41626'
    };
    const FAMILY_COLOR_NEUTRAL = '#9a9a9a';
    const PRODUCT_FAMILIES_KEY = 's35_product_families';
    const PRODUCT_FAMILY_OVERRIDES_KEY = 's35_product_family_overrides';
    const PRODUCT_UNCATEGORIZED_ID = 'none';
    const PRODUCT_UNCATEGORIZED_LABEL = 'Sin familia';
    const POS_CLIENT_WALKIN = 'mostrador';
    const NEW_FAMILY_PALETTE = ['#1565c0', '#6a1b9a', '#00838f', '#ef6c00', '#2e7d32', '#ad1457', '#455a64'];

    function slugifyProductFamily(label, existingIds) {
        let base = String(label || 'familia').toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'familia';
        if (base === 'all' || base === PRODUCT_UNCATEGORIZED_ID) base = 'familia-' + base;
        let id = base;
        let n = 2;
        const taken = existingIds || {};
        while (taken[id] || id === 'all' || id === PRODUCT_UNCATEGORIZED_ID) {
            id = base + '-' + n;
            n += 1;
        }
        return id;
    }

    function normalizeProductFamilyItem(f) {
        const label = String((f && (f.label || f.name || f.id)) || '').trim().replace(/\s+/g, ' ');
        if (!label || label === 'all' || label === PRODUCT_UNCATEGORIZED_ID ||
            label.toLocaleLowerCase('es') === PRODUCT_UNCATEGORIZED_LABEL.toLocaleLowerCase('es')) {
            return null;
        }
        const id = String((f && f.id) || '').trim() || slugifyProductFamily(label, {});
        const color = String((f && f.color) || FAMILY_COLORS[label] || FAMILY_COLOR_NEUTRAL).trim() || FAMILY_COLOR_NEUTRAL;
        return { id: id, label: label, color: color };
    }

    function catalogFamilyLabels() {
        const set = {};
        const data = window.S35_PANEL_DATA || {};
        (data.recipes || []).forEach(function (r) {
            const f = String((r && r.family) || '').trim();
            if (f) set[f] = true;
        });
        (data.products || []).forEach(function (p) {
            const f = String((p && p.family) || '').trim();
            if (f) set[f] = true;
        });
        Object.keys(FAMILY_COLORS).forEach(function (f) { set[f] = true; });
        return Object.keys(set).sort(function (a, b) { return a.localeCompare(b, 'es'); });
    }

    function defaultProductFamilies() {
        const takenIds = {};
        const seenLabels = {};
        return catalogFamilyLabels().map(function (label) {
            const key = label.toLocaleLowerCase('es');
            if (seenLabels[key]) return null;
            seenLabels[key] = true;
            const id = slugifyProductFamily(label, takenIds);
            takenIds[id] = true;
            return {
                id: id,
                label: label,
                color: FAMILY_COLORS[label] || FAMILY_COLOR_NEUTRAL
            };
        }).filter(Boolean);
    }

    function loadProductFamilies() {
        try {
            const raw = JSON.parse(localStorage.getItem(PRODUCT_FAMILIES_KEY) || 'null');
            if (raw && Array.isArray(raw.items) && raw.items.length) {
                const seen = {};
                const list = [];
                raw.items.forEach(function (f) {
                    const item = normalizeProductFamilyItem(f);
                    if (!item) return;
                    const key = item.label.toLocaleLowerCase('es');
                    if (seen[key] || seen[item.id]) return;
                    seen[key] = true;
                    seen[item.id] = true;
                    list.push(item);
                });
                if (list.length) return list;
            }
        } catch (_) {}
        return defaultProductFamilies();
    }

    function saveProductFamilies(list) {
        localStorage.setItem(PRODUCT_FAMILIES_KEY, JSON.stringify({
            items: list,
            updatedAt: new Date().toISOString()
        }));
    }

    function loadProductFamilyOverrides() {
        try {
            const raw = JSON.parse(localStorage.getItem(PRODUCT_FAMILY_OVERRIDES_KEY) || 'null');
            if (raw && raw.map && typeof raw.map === 'object') return raw.map;
            if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
        } catch (_) {}
        return {};
    }

    function saveProductFamilyOverrides(map) {
        localStorage.setItem(PRODUCT_FAMILY_OVERRIDES_KEY, JSON.stringify({
            map: map,
            updatedAt: new Date().toISOString()
        }));
    }

    let productFamilies = loadProductFamilies();
    let productFamilyOverrides = loadProductFamilyOverrides();
    if (!localStorage.getItem(PRODUCT_FAMILIES_KEY)) saveProductFamilies(productFamilies);

    function familyColor(family) {
        if (!family || family === 'all' || family === PRODUCT_UNCATEGORIZED_ID) return FAMILY_COLOR_NEUTRAL;
        for (let i = 0; i < productFamilies.length; i++) {
            if (productFamilies[i].label === family) return productFamilies[i].color || FAMILY_COLOR_NEUTRAL;
        }
        return FAMILY_COLORS[family] || FAMILY_COLOR_NEUTRAL;
    }

    function familyDot(family) {
        const color = familyColor(family);
        return '<span class="dot" style="background:' + esc(color) + '" aria-hidden="true"></span>';
    }

    function getEffectiveFamily(slug, fallback) {
        const key = String(slug || '').trim();
        if (key && Object.prototype.hasOwnProperty.call(productFamilyOverrides, key)) {
            return String(productFamilyOverrides[key] || '').trim();
        }
        return String(fallback || '').trim();
    }

    function recipeFamily(r) {
        if (!r) return '';
        return getEffectiveFamily(r.product, r.family);
    }

    function setProductFamilyOverride(slug, familyLabel) {
        const key = String(slug || '').trim();
        if (!key) return false;
        const next = String(familyLabel || '').trim();
        if (next && !productFamilies.some(function (f) { return f.label === next; })) {
            return false;
        }
        productFamilyOverrides[key] = next;
        saveProductFamilyOverrides(productFamilyOverrides);
        return true;
    }

    function productsUsingFamily(label) {
        const want = String(label || '').trim();
        const out = [];
        const seen = {};
        getRecipes().forEach(function (r) {
            if (recipeFamily(r) !== want) return;
            if (seen[r.product]) return;
            seen[r.product] = true;
            out.push({ slug: r.product, name: r.name });
        });
        const data = window.S35_PANEL_DATA || {};
        (data.products || []).forEach(function (p) {
            if (!p || !p.slug || seen[p.slug]) return;
            if (getEffectiveFamily(p.slug, p.family) !== want) return;
            seen[p.slug] = true;
            out.push({ slug: p.slug, name: p.name });
        });
        return out;
    }

    function hasUncategorizedProducts() {
        const data = window.S35_PANEL_DATA || {};
        const recipes = getRecipes();
        for (let i = 0; i < recipes.length; i++) {
            if (!recipeFamily(recipes[i])) return true;
        }
        const products = data.products || [];
        for (let j = 0; j < products.length; j++) {
            const p = products[j];
            if (!p || !p.slug) continue;
            if (!getEffectiveFamily(p.slug, p.family)) return true;
        }
        return false;
    }

    function addProductFamily(rawLabel, color) {
        const label = String(rawLabel || '').trim().replace(/\s+/g, ' ');
        if (!label) return { ok: false, error: 'empty' };
        if (label.toLocaleLowerCase('es') === PRODUCT_UNCATEGORIZED_LABEL.toLocaleLowerCase('es') ||
            label === 'all' || label === PRODUCT_UNCATEGORIZED_ID) {
            return { ok: false, error: 'reserved' };
        }
        const dup = productFamilies.some(function (f) {
            return f.label.toLocaleLowerCase('es') === label.toLocaleLowerCase('es');
        });
        if (dup) return { ok: false, error: 'duplicate' };
        const taken = {};
        productFamilies.forEach(function (f) { taken[f.id] = true; });
        const id = slugifyProductFamily(label, taken);
        const tint = String(color || '').trim() ||
            NEW_FAMILY_PALETTE[productFamilies.length % NEW_FAMILY_PALETTE.length] ||
            FAMILY_COLOR_NEUTRAL;
        const item = { id: id, label: label, color: tint };
        productFamilies.push(item);
        productFamilies.sort(function (a, b) { return a.label.localeCompare(b.label, 'es'); });
        saveProductFamilies(productFamilies);
        refreshProductFamilyUi();
        return { ok: true, item: item };
    }

    function removeProductFamily(idOrLabel, opts) {
        opts = opts || {};
        const key = String(idOrLabel || '').trim();
        if (!key || key === 'all' || key === PRODUCT_UNCATEGORIZED_ID) return { ok: false, error: 'reserved' };
        const fam = productFamilies.filter(function (f) {
            return f.id === key || f.label === key;
        })[0];
        if (!fam) return { ok: false, error: 'missing' };
        const using = productsUsingFamily(fam.label);
        if (using.length && !opts.confirmed) {
            return { ok: false, error: 'needs_confirm', count: using.length, label: fam.label, using: using };
        }
        using.forEach(function (p) {
            productFamilyOverrides[p.slug] = '';
        });
        if (using.length) saveProductFamilyOverrides(productFamilyOverrides);
        productFamilies = productFamilies.filter(function (f) { return f.id !== fam.id; });
        saveProductFamilies(productFamilies);
        if (familyFilter === fam.label) familyFilter = defaultPosFamilyFilter();
        if (priceFamilyFilter === fam.label) priceFamilyFilter = 'all';
        refreshProductFamilyUi();
        return { ok: true, label: fam.label, moved: using.length };
    }

    function productFamilySelectHtml(selected) {
        const cur = String(selected || '').trim();
        const opts = ['<option value="">' + esc(PRODUCT_UNCATEGORIZED_LABEL) + '</option>'].concat(
            productFamilies.map(function (f) {
                return '<option value="' + esc(f.label) + '"' +
                    (f.label === cur ? ' selected' : '') + '>' + esc(f.label) + '</option>';
            })
        );
        if (cur && !productFamilies.some(function (f) { return f.label === cur; })) {
            opts.push('<option value="' + esc(cur) + '" selected>' + esc(cur) + '</option>');
        }
        return opts.join('');
    }

    function refreshProductFamilyUi() {
        renderChips();
        renderPriceChips();
        renderProducts();
        renderPrices();
        renderProductsMovementsChart();
        if (typeof window.S35PanelAPI === 'object' &&
            typeof window.S35PanelAPI.onProductFamiliesChanged === 'function') {
            window.S35PanelAPI.onProductFamiliesChanged();
        }
    }

    const TIER_IDS = ['t1', 't2', 't3', 't4', 't5', 't6'];
    const TIER_LABELS = ['1 a 100', '100 a 500', '500 a 999', '1000 a 2000', '2000 a 3000', '3000 a 5000'];

    let cortesPeriod = 'day';
    let cortesOffset = 0;
    let pdSalesPeriod = 'historial';
    let pdSalesOffset = 0;
    let pdSalesSlug = null;
    let pdSalesBound = false;
    let productsMovPeriod = 'year';
    let productsMovOffset = 0;
    let productsMovFamily = 'all';
    let productsMovBound = false;
    let clientDashId = null;
    let clientDashPeriod = 'year';
    let clientDashOffset = 0;
    let clientDashBound = false;
    let clientDashEditing = false;
    const PRODUCT_LINE_PALETTE = [
        '#171717', '#1565c0', '#2e7d32', '#c41626', '#e65100',
        '#6a1b9a', '#00838f', '#ad1457', '#455a64', '#5d4037',
        '#0277bd', '#558b2f'
    ];

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    /** Title case: first letter of each word uppercase, rest lowercase (accents via es locale). */
    function toTitleCaseName(str) {
        return String(str || '').trim().toLocaleLowerCase('es').replace(/(^|[\s\-'.])(\S)/g, function (_, sep, ch) {
            return sep + ch.toLocaleUpperCase('es');
        });
    }
    /** Split multi-email fields on , ; / or whitespace; lowercase each. */
    function splitClientEmails(raw) {
        return String(raw || '')
            .split(/[,;/\s]+/)
            .map(function (e) { return e.trim().toLowerCase(); })
            .filter(Boolean);
    }
    function normalizeClientEmail(raw) {
        return splitClientEmails(raw).join(', ');
    }
    /** Soft check: each piece looks like an email (no native type=email tooltip). */
    function isLikelyEmail(e) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || ''));
    }
    function invalidClientEmails(raw) {
        return splitClientEmails(raw).filter(function (e) { return !isLikelyEmail(e); });
    }
    function formatClientEmailsHtml(raw) {
        const emails = splitClientEmails(raw);
        if (!emails.length) return '—';
        return emails.map(function (e) {
            return '<div class="clients-email-line" title="' + esc(e) + '">' + esc(e) + '</div>';
        }).join('');
    }
    /** Dirección fiscal: DOMICILIO + LOCALIDAD (si no está ya en el domicilio). */
    function buildFiscalAddress(domicilio, localidad) {
        const dom = String(domicilio || '').trim().replace(/\s+/g, ' ');
        const loc = String(localidad || '').trim().replace(/\s+/g, ' ');
        if (!dom && !loc) return '';
        if (!dom) return loc;
        if (!loc) return dom;
        if (dom.toLocaleLowerCase('es').indexOf(loc.toLocaleLowerCase('es')) !== -1) return dom;
        return dom + ', ' + loc;
    }
    /** Campo canónico `address`; migra `domicilio`/`localidad` legacy. */
    function clientAddress(c) {
        if (!c) return '';
        const direct = String(c.address || '').trim();
        if (direct) return direct;
        return buildFiscalAddress(c.domicilio, c.localidad);
    }
    function money(n) {
        return '$' + (Number(n) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    function formatUnits(n) {
        const q = Number(n) || 0;
        if (Math.abs(q - Math.round(q)) < 1e-9) {
            return Math.round(q).toLocaleString('es-MX') + ' u';
        }
        return q.toLocaleString('es-MX', { maximumFractionDigits: 2 }) + ' u';
    }
    function payLabel(v) {
        if (v === 'tarjeta') return 'Tarjeta';
        if (v === 'transferencia') return 'Transferencia';
        if (v === 'por_cobrar') return 'Por cobrar';
        if (v === 'mixto') return 'Pago mixto';
        return 'Efectivo';
    }
    function isPendingCollection(sale) {
        if (!sale) return false;
        if ((sale.paymentMethod || '') === 'mixto') {
            const lines = salePaymentLines(sale);
            return lines.length > 0 && lines.every(function (p) { return p.method === 'por_cobrar'; });
        }
        return (sale.paymentMethod || '') === 'por_cobrar';
    }
    function payMethodKeys() {
        return ['efectivo', 'tarjeta', 'transferencia', 'por_cobrar'];
    }
    function isValidPayMethod(v) {
        return payMethodKeys().indexOf(v) >= 0;
    }
    function billLabel(v) {
        return v === 'facturado' ? 'Facturado' : 'Sin facturar';
    }
    function roundMoney(n) {
        return Math.round((Number(n) || 0) * 100) / 100;
    }
    /** Líneas de pago de una venta (compat: 1 método = total completo). */
    function salePaymentLines(sale) {
        const total = roundMoney(sale && sale.total);
        const raw = sale && Array.isArray(sale.payments) ? sale.payments : null;
        if (raw && raw.length) {
            const lines = [];
            raw.forEach(function (p) {
                const method = isValidPayMethod(p && p.method) ? p.method : 'efectivo';
                const amount = roundMoney(p && p.amount);
                if (amount <= 0) return;
                lines.push({ method: method, amount: amount });
            });
            if (lines.length) return lines;
        }
        const method = isValidPayMethod(sale && sale.paymentMethod)
            ? sale.paymentMethod
            : 'efectivo';
        return [{ method: method, amount: total }];
    }
    function formatSalePayLabel(sale) {
        const lines = salePaymentLines(sale);
        if (lines.length <= 1) {
            return payLabel(lines[0] ? lines[0].method : (sale && sale.paymentMethod));
        }
        return lines.map(function (p) {
            return payLabel(p.method) + ' ' + money(p.amount);
        }).join(' + ');
    }
    /** Chips de método de pago para historial (uno por línea; wrap en responsive). */
    function formatSalePayBadgesHtml(sale) {
        const lines = salePaymentLines(sale);
        let chips;
        if (lines.length <= 1) {
            const label = payLabel(lines[0] ? lines[0].method : (sale && sale.paymentMethod));
            chips = ['<span class="badge">' + esc(label) + '</span>'];
        } else {
            chips = lines.map(function (p) {
                return '<span class="badge">' + esc(payLabel(p.method) + ' ' + money(p.amount)) + '</span>';
            });
        }
        return '<div class="hist-pay-badges">' + chips.join('') + '</div>';
    }
    function amountPaidByMethod(sale, method) {
        return salePaymentLines(sale).reduce(function (n, p) {
            return n + (p.method === method ? p.amount : 0);
        }, 0);
    }
    function derivePaymentMethod(lines) {
        if (!lines || !lines.length) return 'efectivo';
        if (lines.length === 1) return lines[0].method;
        return 'mixto';
    }
    /** Normaliza y valida líneas de pago mixto. No permite por_cobrar en mixto. */
    function normalizePaymentLines(rawLines, total) {
        const target = roundMoney(total);
        const merged = {};
        (rawLines || []).forEach(function (p) {
            const method = p && p.method;
            if (!isValidPayMethod(method)) return;
            const amount = roundMoney(p.amount);
            if (amount <= 0) return;
            merged[method] = roundMoney((merged[method] || 0) + amount);
        });
        const lines = payMethodKeys().filter(function (k) { return merged[k] > 0; })
            .map(function (k) { return { method: k, amount: merged[k] }; });
        if (!lines.length) {
            return { ok: false, error: 'Indica al menos un monto de pago' };
        }
        if (lines.length > 1 && lines.some(function (p) { return p.method === 'por_cobrar'; })) {
            return { ok: false, error: 'Por cobrar no se puede combinar con otros métodos' };
        }
        const sum = roundMoney(lines.reduce(function (n, p) { return n + p.amount; }, 0));
        if (Math.abs(sum - target) > 0.009) {
            return {
                ok: false,
                error: 'La suma de pagos (' + money(sum) + ') debe ser igual al total (' + money(target) + ')'
            };
        }
        return {
            ok: true,
            payments: lines,
            paymentMethod: derivePaymentMethod(lines),
            sum: sum
        };
    }
    function paidMethodOptionsHtml(selected, opts) {
        const allowPending = !(opts && opts.excludePending);
        return payMethodKeys().filter(function (k) {
            return allowPending || k !== 'por_cobrar';
        }).map(function (k) {
            return '<option value="' + k + '"' + (selected === k ? ' selected' : '') + '>' +
                esc(payLabel(k)) + '</option>';
        }).join('');
    }

    /** Ciudades / sucursales de venta (extensible). */
    const SALE_CITIES = [
        { id: 'culiacan', label: 'Culiacán', color: '#171717', short: 'CLN' },
        { id: 'mochis', label: 'Los Mochis', color: '#15803d', short: 'LMM' },
        { id: 'mazatlan', label: 'Mazatlán', color: '#b91c1c', short: 'MZT' }
    ];
    const CITY_STORAGE_KEY = 's35_pos_sale_city';
    let cortesCityFilter = 'all';

    function saleCityCatalog() {
        return SALE_CITIES;
    }
    function cityById(id) {
        const key = String(id || '').toLowerCase().trim();
        return SALE_CITIES.filter(function (c) { return c.id === key; })[0] || null;
    }
    function normalizeCityId(raw) {
        const v = String(raw || '').toLowerCase().trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (v === 'culiacan' || v === 'cln') return 'culiacan';
        if (v === 'mochis' || v === 'los mochis' || v === 'lmm') return 'mochis';
        if (v === 'mazatlan' || v === 'mzt') return 'mazatlan';
        if (cityById(v)) return v;
        return 'culiacan';
    }
    function cityLabel(id) {
        const c = cityById(normalizeCityId(id));
        return c ? c.label : 'Culiacán';
    }
    function isDarkTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }
    function cityColor(id) {
        const key = normalizeCityId(id);
        const c = cityById(key);
        // Culiacán es casi negro (#171717): en modo oscuro pasa a blanco para verse en la gráfica.
        if (key === 'culiacan' && isDarkTheme()) return '#fafafa';
        return c ? c.color : '#171717';
    }
    /** Resuelve ciudad de una venta (explícita o inferida). */
    function resolveSaleCity(sale) {
        if (!sale) return 'culiacan';
        if (sale.city) return normalizeCityId(sale.city);
        const meta = sale.meta || {};
        if (meta.city) return normalizeCityId(meta.city);
        const sid = meta.storeId;
        const sname = String(meta.storeName || '');
        if (sid === 35 || sid === '35' || sname === 'Mazatlán' || sname === 'Mazatlan') return 'mazatlan';
        if (sid === 36 || sid === '36' || sname === 'Mochis') return 'mochis';
        if (meta.source === 'cfdi-import' || meta.kind === 'invoice') return 'mochis';
        return 'culiacan';
    }
    function saleCity(sale) {
        return resolveSaleCity(sale);
    }
    function filterSalesByCity(list, cityFilter) {
        const f = cityFilter == null ? 'all' : cityFilter;
        if (!f || f === 'all') return list || [];
        const id = normalizeCityId(f);
        return (list || []).filter(function (s) { return saleCity(s) === id; });
    }
    function loadPreferredSaleCity() {
        try {
            const raw = localStorage.getItem(CITY_STORAGE_KEY);
            if (raw && cityById(normalizeCityId(raw))) return normalizeCityId(raw);
        } catch (_) {}
        return 'culiacan';
    }
    function savePreferredSaleCity(id) {
        try { localStorage.setItem(CITY_STORAGE_KEY, normalizeCityId(id)); } catch (_) {}
    }
    function selectedSaleCity() {
        const sel = document.getElementById('posSaleCity');
        if (sel && sel.value) return normalizeCityId(sel.value);
        const el = document.querySelector('input[name="saleCity"]:checked');
        if (el && el.value) return normalizeCityId(el.value);
        return loadPreferredSaleCity();
    }
    function syncSaleCityControl() {
        const preferred = loadPreferredSaleCity();
        const sel = document.getElementById('posSaleCity');
        if (sel) {
            if (!sel.options.length) {
                SALE_CITIES.forEach(function (c) {
                    const opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = c.label;
                    sel.appendChild(opt);
                });
            }
            sel.value = preferred;
            if (!sel._s35CityBound) {
                sel._s35CityBound = true;
                sel.addEventListener('change', function () {
                    savePreferredSaleCity(sel.value);
                });
            }
            return;
        }
        document.querySelectorAll('input[name="saleCity"]').forEach(function (el) {
            el.checked = el.value === preferred;
            el.addEventListener('change', function () {
                if (el.checked) savePreferredSaleCity(el.value);
            });
        });
    }
    function citySegHtml(selected, nameAttr) {
        const sel = normalizeCityId(selected || 'culiacan');
        const name = nameAttr || 'saleCity';
        return SALE_CITIES.map(function (c) {
            return '<label><input type="radio" name="' + esc(name) + '" value="' + esc(c.id) + '"' +
                (c.id === sel ? ' checked' : '') + '> ' + esc(c.label) + '</label>';
        }).join('');
    }

    function toast(msg) {
        const el = document.getElementById('toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { el.classList.remove('show'); }, 2200);
    }

    let activeNoteSaleId = null;
    let saleNoteEditing = false;

    function loadSaleEditsMap() {
        try {
            const raw = JSON.parse(localStorage.getItem(SALE_EDITS_KEY) || 'null');
            if (raw && raw.byId && typeof raw.byId === 'object') return raw.byId;
        } catch (_) {}
        return {};
    }
    function saveSaleEditsMap(byId) {
        localStorage.setItem(SALE_EDITS_KEY, JSON.stringify({
            byId: byId || {},
            updatedAt: new Date().toISOString()
        }));
        flushCloudSoon();
    }
    function saleRecordRecency(row) {
        if (!row || typeof row !== 'object') return 0;
        return Date.parse(row.editedAt || row.updatedAt || row.createdAt || '') || 0;
    }
    function touchSaleRecord(sale) {
        if (!sale) return sale;
        const now = new Date().toISOString();
        sale.editedAt = now;
        sale.updatedAt = now;
        return sale;
    }
    function saleEditPayload(sale) {
        if (!sale) return null;
        return {
            createdAt: sale.createdAt,
            clientId: sale.clientId,
            client: sale.client,
            customer: sale.customer,
            paymentMethod: sale.paymentMethod,
            payments: sale.payments || null,
            billing: sale.billing,
            city: sale.city || resolveSaleCity(sale),
            items: sale.items,
            total: sale.total,
            note: sale.note || null,
            meta: sale.meta || null,
            editedAt: sale.editedAt,
            updatedAt: sale.updatedAt
        };
    }
    function putSaleEdit(id, patch) {
        if (!id || !patch) return;
        const map = loadSaleEditsMap();
        map[id] = Object.assign({}, map[id] || {}, patch, { editedAt: new Date().toISOString() });
        saveSaleEditsMap(map);
    }
    function applySaleEditPatch(sale) {
        if (!sale || !sale.id) return sale;
        const patch = loadSaleEditsMap()[sale.id];
        if (!patch || patch.deleted) return sale;
        if (saleRecordRecency(patch) < saleRecordRecency(sale)) return sale;
        const next = Object.assign({}, sale, patch);
        if (patch.items) next.items = patch.items;
        if (patch.meta || sale.meta) {
            next.meta = Object.assign({}, sale.meta || {}, patch.meta || {});
        }
        if (patch.client) next.client = patch.client;
        if (patch.note && sale.note) {
            next.note = Object.assign({}, sale.note, patch.note);
        } else if (patch.note) {
            next.note = patch.note;
        }
        next.city = resolveSaleCity(next);
        return next;
    }
    function isSaleEditDeleted(id) {
        const patch = loadSaleEditsMap()[id];
        return !!(patch && patch.deleted);
    }

    function formatSaleDateTime(iso) {
        const d = new Date(iso);
        if (isNaN(d)) return '';
        return d.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
    }

    function saleClientLabel(sale) {
        if (!sale) return 'Mostrador';
        let c = sale.client || null;
        if (!c && sale.clientId) c = clientById(sale.clientId);
        if (c) {
            const base = clientDisplay(c);
            return isDistributorClient(c) ? base + ' · Distribuidor' : base;
        }
        const named = String(sale.customer || '').trim();
        return named || 'Mostrador';
    }

    function saleItemsPreview(sale) {
        const items = (sale && sale.items) || [];
        if (!items.length) return 'Sin ítems';
        const n = items.length;
        const first = String(items[0].name || 'Producto').trim() || 'Producto';
        if (n === 1) {
            const qty = Number(items[0].qty) || 0;
            return qty > 1 ? (qty + '× ' + first) : first;
        }
        return n + ' ítems · ' + first;
    }

    function openSaleNoteById(id) {
        const sale = saleById(id);
        if (!sale) return;
        ensureSaleNote(sale);
        if (!isHistoricalImportSale(sale)) saveSales();
        openSaleNoteModal(sale);
    }

    function phoneDigits(raw) {
        let d = String(raw || '').replace(/\D/g, '');
        if (d.length === 10) d = '52' + d;
        if (d.length === 12 && d.indexOf('52') === 0) return d;
        if (d.length >= 10) return d;
        return '';
    }

    function ensureSaleNote(sale) {
        if (!sale) return null;
        if (!sale.note || typeof sale.note !== 'object') {
            sale.note = {
                id: 'note-' + (sale.id || Date.now().toString(36)),
                folio: sale.folio,
                createdAt: sale.createdAt,
                generatedAt: new Date().toISOString()
            };
        }
        return sale.note;
    }

    function buildNotePlainText(sale) {
        const lines = (sale.items || []).map(function (it) {
            return '• ' + it.name + ' × ' + it.qty + ' @ ' + money(it.price) + ' = ' + money(it.lineTotal != null ? it.lineTotal : it.qty * it.price);
        });
        return [
            'S-35 · Nota de venta',
            'Folio: ' + (sale.folio || ''),
            'Fecha: ' + formatSaleDateTime(sale.createdAt),
            'Cliente: ' + saleClientLabel(sale),
            '',
            'Detalle:',
            lines.join('\n') || '—',
            '',
            'Pago: ' + formatSalePayLabel(sale),
            'Facturación: ' + billLabel(sale.billing),
            'Total: ' + money(sale.total),
            '',
            'Gracias por su compra.'
        ].join('\n');
    }

    function saleReceiptId(sale) {
        if (!sale) return '';
        if (sale.meta && sale.meta.receiptId != null && sale.meta.receiptId !== '') {
            return String(sale.meta.receiptId);
        }
        const folio = String(sale.folio || '');
        const m = folio.match(/^HIST-R(\d+)$/i);
        if (m) return m[1];
        const id = String(sale.id || '');
        const m2 = id.match(/sale-hist-rcpt-(\d+)/i);
        return m2 ? m2[1] : '';
    }

    function saleStoreName(sale) {
        if (!sale || !sale.meta) return '';
        const name = sale.meta.storeName;
        if (name) return String(name);
        return '';
    }

    function saleUserLabel(sale) {
        if (window.S35Roles && typeof window.S35Roles.saleUserLabel === 'function') {
            return window.S35Roles.saleUserLabel(sale);
        }
        if (!sale) return '';
        if (sale.user && typeof sale.user === 'object') {
            return String(sale.user.name || sale.user.username || '').trim();
        }
        return typeof sale.user === 'string' ? sale.user : '';
    }

    function saleOriginLabel(sale) {
        const store = saleStoreName(sale);
        if (store) return store;
        if (isHistoricalImportSale(sale)) return 'Histórico';
        const who = saleUserLabel(sale);
        return who || 'POS';
    }

    function saleReceiptLabel(sale) {
        const rid = saleReceiptId(sale);
        if (rid) return 'Recibo ' + rid;
        return sale.folio || sale.id || '—';
    }

    function saleReceiptCellHtml(sale) {
        const rid = saleReceiptId(sale);
        const store = saleStoreName(sale);
        if (rid) {
            return '<span class="hist-receipt">' + esc(rid) +
                '<span class="sub">' + esc(store ? store : 'Recibo · panel viejo') + '</span></span>';
        }
        const kind = sale && sale.meta && sale.meta.kind;
        if (kind === 'invoice' || (sale.folio && String(sale.folio).indexOf('CFDI-') === 0)) {
            const inv = (sale.meta && sale.meta.invoiceFolio != null)
                ? String(sale.meta.invoiceFolio)
                : String(sale.folio || '').replace(/^CFDI-/i, '');
            return '<span class="hist-receipt">' + esc(inv || sale.folio || '—') +
                '<span class="sub">Factura CFDI</span></span>';
        }
        return '<span class="hist-receipt">' + esc(sale.folio || '—') +
            (sale.folio ? '<span class="sub">Folio POS</span>' : '') + '</span>';
    }

    function buildNoteHtml(sale) {
        const items = sale.items || [];
        const rows = items.map(function (it, idx) {
            const line = it.lineTotal != null ? it.lineTotal : it.qty * it.price;
            return '<tr>' +
                '<td class="num snd-idx">' + (idx + 1) + '</td>' +
                '<td><span class="line-name">' + esc(it.name) + '</span>' +
                (it.unit ? '<span class="line-unit">' + esc(it.unit) + '</span>' : '') + '</td>' +
                '<td class="num">' + esc(String(it.qty)) + '</td>' +
                '<td class="num">' + money(it.price) + '</td>' +
                '<td class="num">' + money(line) + '</td>' +
                '</tr>';
        }).join('');
        const receiptLabel = saleReceiptLabel(sale);
        const store = saleStoreName(sale);
        const city = cityLabel(saleCity(sale));
        const seller = saleUserLabel(sale);
        let client = sale.client || null;
        if (!client && sale.clientId) client = clientById(sale.clientId);
        const addr = clientAddress(client);
        const refLine = saleReceiptId(sale)
            ? 'HIST-R' + saleReceiptId(sale)
            : (sale.meta && sale.meta.kind === 'invoice' && sale.meta.invoiceFolio != null
                ? 'CFDI-' + sale.meta.invoiceFolio
                : (sale.folio || ''));
        const originName = store || city || 'POS';
        const originSub = [
            city && store ? city : '',
            seller ? ('Vendedor: ' + seller) : ''
        ].filter(Boolean).join(' · ');
        return '' +
            '<div class="snd-top">' +
            '<div class="snd-brand">' +
            '<div class="snd-logo">' +
            '<img src="/Assets/s35-logo-compuesto-negro.png" alt="S-35 Construction Tech" width="160" height="18" decoding="async">' +
            '</div>' +
            (city || store
                ? '<div class="snd-company-sub">' + esc([city, store].filter(Boolean).join(' · ')) + '</div>'
                : '') +
            '</div>' +
            '<div class="snd-doctype">NOTA DE VENTA</div>' +
            '</div>' +
            '<div class="snd-summary">' +
            '<div class="snd-sum-cell">' +
            '<span class="lbl">Total</span>' +
            '<span class="val">' + money(sale.total) + '</span>' +
            '</div>' +
            '<div class="snd-sum-cell">' +
            '<span class="lbl">Fecha</span>' +
            '<span class="val">' + esc(formatSaleDateTime(sale.createdAt)) + '</span>' +
            '</div>' +
            '<div class="snd-sum-cell">' +
            '<span class="lbl">Folio</span>' +
            '<span class="val">' + esc(receiptLabel) + '</span>' +
            '</div>' +
            '<div class="snd-sum-cell">' +
            '<span class="lbl">Facturación</span>' +
            '<span class="val">' + esc(billLabel(sale.billing)) + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="snd-parties">' +
            '<div class="snd-party">' +
            '<div class="lbl">Cliente</div>' +
            '<div class="name">' + esc(saleClientLabel(sale)) + '</div>' +
            (addr ? '<div class="sub">' + esc(addr) + '</div>' : '') +
            (refLine ? '<div class="sub">Ref. ' + esc(refLine) + '</div>' : '') +
            '</div>' +
            '<div class="snd-party">' +
            '<div class="lbl">Origen</div>' +
            '<div class="name">' + esc(originName) + '</div>' +
            (originSub ? '<div class="sub">' + esc(originSub) + '</div>' : '') +
            '</div>' +
            '</div>' +
            '<table class="sale-note-lines">' +
            '<thead><tr>' +
            '<th class="num snd-idx">#</th>' +
            '<th>Descripción</th>' +
            '<th class="num">Cant.</th>' +
            '<th class="num">Precio</th>' +
            '<th class="num">Importe</th>' +
            '</tr></thead>' +
            '<tbody>' + (rows || '<tr><td colspan="5" class="muted">Sin líneas</td></tr>') + '</tbody>' +
            '</table>' +
            '<div class="snd-bottom">' +
            '<div class="snd-pay">' +
            '<div class="lbl">Método de pago</div>' +
            '<div class="val">' + esc(formatSalePayLabel(sale)) + '</div>' +
            '</div>' +
            '<div class="snd-totals">' +
            '<div class="row"><span>Subtotal</span><span>' + money(sale.total) + '</span></div>' +
            '<div class="row total"><span>Total</span><span>' + money(sale.total) + '</span></div>' +
            '</div>' +
            '</div>';
    }

    function isAdminRole() {
        if (window.S35Roles && typeof window.S35Roles.isFullAccess === 'function') {
            const role = (window.S35PanelAPI && window.S35PanelAPI.role) || 'admin';
            return window.S35Roles.isFullAccess(role);
        }
        return !!(window.S35PanelAPI && window.S35PanelAPI.role === 'admin');
    }

    function toDatetimeLocalValue(iso) {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        const pad = function (n) { return String(n).padStart(2, '0'); };
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
            'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }
    function fromDatetimeLocalValue(raw) {
        if (!raw) return new Date().toISOString().slice(0, 19);
        const d = new Date(raw);
        if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 19);
        const pad = function (n) { return String(n).padStart(2, '0'); };
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
            'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    }
    /** datetime-local → ISO UTC (mismo criterio que checkout normal). */
    function isoFromDatetimeLocal(raw) {
        if (!raw) return new Date().toISOString();
        const d = new Date(raw);
        if (isNaN(d.getTime())) return new Date().toISOString();
        return d.toISOString();
    }
    function defaultGenerateTicketDatetimeLocal() {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        d.setHours(12, 0, 0, 0);
        const pad = function (n) { return String(n).padStart(2, '0'); };
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
            'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }
    /** Parte un valor datetime-local (YYYY-MM-DDTHH:mm) en date / time del design system. */
    function splitDatetimeLocalParts(raw) {
        const s = String(raw || '').trim();
        const m = s.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
        if (m) return { date: m[1], time: m[2] };
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return { date: s, time: '12:00' };
        return { date: '', time: '' };
    }
    function joinDatetimeLocalParts(dateStr, timeStr) {
        const d = String(dateStr || '').trim();
        const t = String(timeStr || '').trim();
        if (!d || !t) return '';
        return d + 'T' + t.slice(0, 5);
    }
    function setGenDatetimePair(dateId, timeId, datetimeLocal) {
        const parts = splitDatetimeLocalParts(datetimeLocal || defaultGenerateTicketDatetimeLocal());
        const dateEl = document.getElementById(dateId);
        const timeEl = document.getElementById(timeId);
        if (dateEl) dateEl.value = parts.date;
        if (timeEl) timeEl.value = parts.time;
    }
    function readGenDatetimePair(dateId, timeId) {
        const dateEl = document.getElementById(dateId);
        const timeEl = document.getElementById(timeId);
        return joinDatetimeLocalParts(
            dateEl ? dateEl.value : '',
            timeEl ? timeEl.value : ''
        );
    }
    function focusGenDatetimePair(dateId, timeId) {
        const dateEl = document.getElementById(dateId);
        const timeEl = document.getElementById(timeId);
        if (dateEl && !String(dateEl.value || '').trim()) {
            dateEl.focus();
            return;
        }
        if (timeEl && !String(timeEl.value || '').trim()) {
            timeEl.focus();
            return;
        }
        if (dateEl) dateEl.focus();
    }

    function catalogProductOptionsHtml(selected) {
        const list = pricedCatalog().slice().sort(function (a, b) {
            return String(a.name || '').localeCompare(String(b.name || ''), 'es');
        });
        return '<option value="">Producto…</option>' + list.map(function (p) {
            const sel = p.id === selected ? ' selected' : '';
            return '<option value="' + esc(p.id) + '"' + sel + '>' + esc(p.name) + '</option>';
        }).join('');
    }

    function saleNoteLineRowHtml(it, idx) {
        it = it || {};
        const qty = Number(it.qty) || 0;
        const price = Number(it.price) || 0;
        const line = it.lineTotal != null ? Number(it.lineTotal) : qty * price;
        return '<tr data-sne-idx="' + idx + '">' +
            '<td><select class="sne-product" data-sne-field="product">' + catalogProductOptionsHtml(it.product || '') + '</select></td>' +
            '<td><input type="text" data-sne-field="name" value="' + esc(it.name || '') + '" placeholder="Descripción"></td>' +
            '<td class="num"><input class="sne-qty" type="number" min="0" step="any" data-sne-field="qty" value="' + esc(String(qty)) + '"></td>' +
            '<td class="num"><input class="sne-price" type="number" min="0" step="0.01" data-sne-field="price" value="' + esc(String(price)) + '"></td>' +
            '<td class="num sne-line">' + money(line) + '</td>' +
            '<td><button type="button" class="icon-action danger" data-sne-remove title="Quitar línea"><i class="fa-solid fa-trash-can"></i></button></td>' +
            '</tr>';
    }

    function saleNoteClientPickerHtml(sale) {
        const currentId = sale.clientId || '';
        const client = currentId ? clientById(currentId) : null;
        const label = client ? clientDisplay(client) : 'Mostrador / sin cliente';
        const badge = client
            ? ('<span class="pos-client-trigger-badge' + (isDistributorClient(client) ? ' is-dist' : '') + '" id="sneClientTriggerBadge">' +
                esc(clientTypeLabel(client)) + '</span>')
            : '<span class="pos-client-trigger-badge" id="sneClientTriggerBadge" hidden></span>';
        return '<div class="pos-client-picker" id="sneClientPicker">' +
            '<input type="hidden" id="sneClientId" value="' + esc(currentId) + '" autocomplete="off">' +
            '<button type="button" class="pos-client-trigger" id="sneClientTrigger"' +
            ' aria-haspopup="listbox" aria-expanded="false" aria-controls="sneClientPickerList">' +
            '<span class="pos-client-trigger-text">' +
            '<span class="pos-client-trigger-label" id="sneClientTriggerLabel">' + esc(label) + '</span>' +
            badge +
            '</span>' +
            '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
            '</button>' +
            '<div class="pos-client-popover" id="sneClientPopover" hidden role="dialog" aria-label="Buscar cliente">' +
            '<div class="pos-client-search-wrap">' +
            '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
            '<input type="search" id="sneClientPickerSearch" class="pos-client-search"' +
            ' placeholder="Nombre, empresa, teléfono, email o RFC" autocomplete="off"' +
            ' aria-autocomplete="list" aria-controls="sneClientPickerList">' +
            '</div>' +
            '<div class="pos-client-list" id="sneClientPickerList" role="listbox"></div>' +
            '</div></div>';
    }

    let sneClientPickerOpen = false;
    let sneClientPickerActiveIdx = -1;

    function syncSneClientTrigger() {
        const labelEl = document.getElementById('sneClientTriggerLabel');
        const badgeEl = document.getElementById('sneClientTriggerBadge');
        const hid = document.getElementById('sneClientId');
        if (!labelEl || !hid) return;
        const client = clientById(hid.value || '');
        if (!client) {
            labelEl.textContent = 'Mostrador / sin cliente';
            if (badgeEl) {
                badgeEl.hidden = true;
                badgeEl.textContent = '';
                badgeEl.classList.remove('is-dist');
            }
            return;
        }
        labelEl.textContent = clientDisplay(client);
        if (badgeEl) {
            badgeEl.hidden = false;
            badgeEl.textContent = clientTypeLabel(client);
            badgeEl.classList.toggle('is-dist', isDistributorClient(client));
        }
    }

    function filteredSneClients() {
        const q = (document.getElementById('sneClientPickerSearch') &&
            document.getElementById('sneClientPickerSearch').value || '').toLowerCase().trim();
        return clients.slice().sort(function (a, b) {
            return String(a.name).localeCompare(String(b.name), 'es');
        }).filter(function (c) {
            return !q || clientPickerHaystack(c).includes(q);
        });
    }

    function renderSneClientPickerList() {
        const listEl = document.getElementById('sneClientPickerList');
        const hid = document.getElementById('sneClientId');
        if (!listEl) return;
        const current = hid ? hid.value : '';
        const list = filteredSneClients();
        const q = (document.getElementById('sneClientPickerSearch') &&
            document.getElementById('sneClientPickerSearch').value || '').trim();
        const rows = [];
        rows.push(
            '<button type="button" class="pos-client-option' + (!current ? ' is-selected' : '') +
            '" role="option" data-sne-client-id="" aria-selected="' + (!current ? 'true' : 'false') + '">' +
            '<span class="pos-client-option-name">Mostrador / sin cliente</span>' +
            '<span class="badge">Mostrador</span>' +
            '</button>'
        );
        list.forEach(function (c) {
            const dist = isDistributorClient(c);
            const metaParts = [c.company, c.phone, c.email, c.rfc].filter(Boolean);
            const metaHtml = metaParts.map(function (part) {
                return highlightClientMatch(part, q);
            }).join(' · ');
            rows.push(
                '<button type="button" class="pos-client-option' +
                (current === c.id ? ' is-selected' : '') +
                '" role="option" data-sne-client-id="' + esc(c.id) + '" aria-selected="' +
                (current === c.id ? 'true' : 'false') + '">' +
                '<span class="pos-client-option-name">' + highlightClientMatch(c.name, q) + '</span>' +
                '<span class="badge' + (dist ? ' b-primary' : '') + '">' + esc(clientTypeLabel(c)) + '</span>' +
                (metaHtml ? '<span class="pos-client-option-meta">' + metaHtml + '</span>' : '') +
                '</button>'
            );
        });
        if (!list.length && q) {
            listEl.innerHTML = rows[0] + '<div class="pos-client-option-empty">Sin coincidencias</div>';
        } else {
            listEl.innerHTML = rows.join('');
        }
        const options = listEl.querySelectorAll('.pos-client-option');
        if (sneClientPickerActiveIdx < 0 || sneClientPickerActiveIdx >= options.length) {
            sneClientPickerActiveIdx = 0;
        }
        options.forEach(function (opt, i) {
            opt.classList.toggle('is-active', i === sneClientPickerActiveIdx);
        });
        const active = options[sneClientPickerActiveIdx];
        if (active && typeof active.scrollIntoView === 'function') {
            active.scrollIntoView({ block: 'nearest' });
        }
    }

    function openSneClientPicker() {
        const pop = document.getElementById('sneClientPopover');
        const trigger = document.getElementById('sneClientTrigger');
        const search = document.getElementById('sneClientPickerSearch');
        if (!pop || sneClientPickerOpen) return;
        sneClientPickerOpen = true;
        pop.hidden = false;
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
        if (search) search.value = '';
        sneClientPickerActiveIdx = 0;
        renderSneClientPickerList();
        requestAnimationFrame(function () {
            if (search) search.focus();
        });
    }

    function closeSneClientPicker() {
        const pop = document.getElementById('sneClientPopover');
        const trigger = document.getElementById('sneClientTrigger');
        if (!sneClientPickerOpen) return;
        sneClientPickerOpen = false;
        if (pop) pop.hidden = true;
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        sneClientPickerActiveIdx = -1;
    }

    function setSneClientId(id) {
        const hid = document.getElementById('sneClientId');
        if (hid) hid.value = id || '';
        syncSneClientTrigger();
        const customerEl = document.getElementById('sneCustomer');
        const client = id ? clientById(id) : null;
        if (customerEl && client) customerEl.value = clientDisplay(client);
        closeSneClientPicker();
    }

    function renderSaleNoteEditForm(sale) {
        const host = document.getElementById('saleNoteEdit');
        if (!host || !sale) return;
        sneClientPickerOpen = false;
        sneClientPickerActiveIdx = -1;
        const rid = saleReceiptId(sale);
        const payLines = salePaymentLines(sale);
        const isSplit = payLines.length > 1 || (sale.paymentMethod === 'mixto');
        const pay = payLines[0] ? payLines[0].method : (sale.paymentMethod || 'efectivo');
        const bill = sale.billing || 'sin_facturar';
        const items = (sale.items && sale.items.length) ? sale.items : [{ product: '', name: '', qty: 1, price: 0 }];
        const splitRows = (isSplit ? payLines : [
            { method: 'tarjeta', amount: '' },
            { method: 'efectivo', amount: '' }
        ]).map(function (p, i) {
            return snePaySplitRowHtml(p.method, p.amount === '' ? '' : p.amount, i);
        }).join('');
        host.innerHTML =
            '<div class="form-grid">' +
            '<label>Recibo / folio<input type="text" id="sneFolio" value="' + esc(rid ? ('Recibo ' + rid) : (sale.folio || '')) + '" readonly></label>' +
            '<label>Fecha y hora<input type="datetime-local" id="sneCreatedAt" value="' + esc(toDatetimeLocalValue(sale.createdAt)) + '"></label>' +
            '<label class="span-2">Cliente' + saleNoteClientPickerHtml(sale) + '</label>' +
            '<label class="span-2">Nombre en nota (si no hay cliente)<input type="text" id="sneCustomer" value="' + esc(sale.customer || '') + '" placeholder="Mostrador o nombre libre"></label>' +
            '<label id="snePaySingleWrap"' + (isSplit ? ' hidden' : '') + '>Pago<select id="snePay">' +
            [['efectivo', 'Efectivo'], ['tarjeta', 'Tarjeta'], ['transferencia', 'Transferencia'], ['por_cobrar', 'Por cobrar']].map(function (p) {
                return '<option value="' + p[0] + '"' + (pay === p[0] ? ' selected' : '') + '>' + p[1] + '</option>';
            }).join('') +
            '</select></label>' +
            '<label>Facturación<select id="sneBill">' +
            [['sin_facturar', 'Sin facturar'], ['facturado', 'Facturado']].map(function (b) {
                return '<option value="' + b[0] + '"' + (bill === b[0] ? ' selected' : '') + '>' + b[1] + '</option>';
            }).join('') +
            '</select></label>' +
            '<label class="span-2">Ciudad / sucursal<select id="sneCity">' +
            SALE_CITIES.map(function (c) {
                return '<option value="' + esc(c.id) + '"' + (saleCity(sale) === c.id ? ' selected' : '') + '>' + esc(c.label) + '</option>';
            }).join('') +
            '</select></label>' +
            '<div class="span-2 sne-pay-split-block">' +
            '<label class="sne-pay-split-check"><input type="checkbox" id="snePaySplit"' + (isSplit ? ' checked' : '') + '> Dividir pago (varios métodos)</label>' +
            '<div class="pay-split-panel" id="snePaySplitPanel"' + (isSplit ? '' : ' hidden') + '>' +
            '<div class="pay-split-rows" id="snePaySplitRows">' + splitRows + '</div>' +
            '<button type="button" class="btn" id="snePaySplitAdd"><i class="fa-solid fa-plus"></i> Método</button>' +
            '<div class="pay-split-summary"><span>Asignado <strong id="snePaySplitSum">$0.00</strong></span>' +
            '<span>Restante <strong id="snePaySplitRemain">$0.00</strong></span></div>' +
            '<p class="pay-split-hint">Ej. parte tarjeta y parte efectivo, misma facturación.</p>' +
            '</div></div>' +
            '</div>' +
            '<div style="overflow:auto">' +
            '<table class="sne-lines"><thead><tr>' +
            '<th>Producto</th><th>Descripción</th><th class="num">Cant.</th><th class="num">P/U</th><th class="num">Importe</th><th></th>' +
            '</tr></thead><tbody id="sneLinesBody">' +
            items.map(function (it, i) { return saleNoteLineRowHtml(it, i); }).join('') +
            '</tbody></table></div>' +
            '<div><button type="button" class="btn" id="sneAddLine"><i class="fa-solid fa-plus"></i> Línea</button></div>' +
            '<div class="sne-total-row"><span class="muted">Total</span><span class="val" id="sneTotal">' + money(sale.total) + '</span></div>' +
            '<div class="sale-note-edit-actions">' +
            '<button type="button" class="btn" id="sneCancel">Cancelar</button>' +
            '<button type="button" class="btn primary" id="sneSave"><i class="fa-solid fa-check"></i> Guardar cambios</button>' +
            '</div>';
        refreshSaleNoteEditTotals();
        refreshSnePaySplitSummary();
    }

    function snePaySplitRowHtml(method, amount, idx) {
        const val = amount === '' || amount == null ? '' : String(amount);
        return '<div class="pay-split-row" data-sne-split-row="' + idx + '">' +
            '<select data-sne-split-method>' + paidMethodOptionsHtml(method || 'efectivo', { excludePending: true }) + '</select>' +
            '<input type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00" data-sne-split-amount value="' + esc(val) + '">' +
            '<button type="button" class="iconbtn" data-sne-split-remove title="Quitar" aria-label="Quitar"><i class="fa-solid fa-xmark"></i></button>' +
            '</div>';
    }

    function snePaySplitEnabled() {
        const el = document.getElementById('snePaySplit');
        return !!(el && el.checked);
    }

    function readSnePaySplitLines() {
        const rows = document.querySelectorAll('#snePaySplitRows .pay-split-row');
        const lines = [];
        rows.forEach(function (row) {
            const method = ((row.querySelector('[data-sne-split-method]') || {}).value || 'efectivo');
            const amount = Number((row.querySelector('[data-sne-split-amount]') || {}).value) || 0;
            lines.push({ method: method, amount: amount });
        });
        return lines;
    }

    function refreshSnePaySplitSummary() {
        const sumEl = document.getElementById('snePaySplitSum');
        const remEl = document.getElementById('snePaySplitRemain');
        if (!sumEl || !remEl) return;
        const totalEl = document.getElementById('sneTotal');
        const totalTxt = totalEl ? String(totalEl.textContent || '').replace(/[^0-9.-]/g, '') : '0';
        // Prefer summing lines from form fields
        let total = 0;
        const body = document.getElementById('sneLinesBody');
        if (body) {
            body.querySelectorAll('tr').forEach(function (tr) {
                const qty = Number((tr.querySelector('[data-sne-field="qty"]') || {}).value) || 0;
                const price = Number((tr.querySelector('[data-sne-field="price"]') || {}).value) || 0;
                total += qty * price;
            });
        } else {
            total = Number(totalTxt) || 0;
        }
        total = roundMoney(total);
        const sum = roundMoney(readSnePaySplitLines().reduce(function (n, p) { return n + (Number(p.amount) || 0); }, 0));
        const remain = roundMoney(total - sum);
        sumEl.textContent = money(sum);
        remEl.textContent = money(remain);
        remEl.classList.toggle('is-ok', Math.abs(remain) < 0.01);
        remEl.classList.toggle('is-bad', Math.abs(remain) >= 0.01);
    }

    function syncSnePaySplitUi() {
        const on = snePaySplitEnabled();
        const panel = document.getElementById('snePaySplitPanel');
        const single = document.getElementById('snePaySingleWrap');
        if (panel) panel.hidden = !on;
        if (single) single.hidden = on;
        if (on) {
            const rows = document.getElementById('snePaySplitRows');
            if (rows && !rows.children.length) {
                rows.innerHTML = snePaySplitRowHtml('tarjeta', '', 0) + snePaySplitRowHtml('efectivo', '', 1);
            }
            refreshSnePaySplitSummary();
        }
    }

    function refreshSaleNoteEditTotals() {
        const body = document.getElementById('sneLinesBody');
        const totalEl = document.getElementById('sneTotal');
        if (!body || !totalEl) return;
        let total = 0;
        body.querySelectorAll('tr').forEach(function (tr) {
            const qty = Number((tr.querySelector('[data-sne-field="qty"]') || {}).value) || 0;
            const price = Number((tr.querySelector('[data-sne-field="price"]') || {}).value) || 0;
            const line = qty * price;
            total += line;
            const cell = tr.querySelector('.sne-line');
            if (cell) cell.textContent = money(line);
        });
        totalEl.textContent = money(total);
        refreshSnePaySplitSummary();
    }

    function collectSaleNoteEditForm() {
        const sale = saleById(activeNoteSaleId);
        if (!sale) return null;
        const clientId = (document.getElementById('sneClientId') || {}).value || '';
        const client = clientId ? clientById(clientId) : null;
        const customerRaw = ((document.getElementById('sneCustomer') || {}).value || '').trim();
        const bill = (document.getElementById('sneBill') || {}).value || 'sin_facturar';
        const city = normalizeCityId((document.getElementById('sneCity') || {}).value || saleCity(sale));
        const createdAt = fromDatetimeLocalValue((document.getElementById('sneCreatedAt') || {}).value);
        const body = document.getElementById('sneLinesBody');
        const items = [];
        if (body) {
            body.querySelectorAll('tr').forEach(function (tr) {
                const product = ((tr.querySelector('[data-sne-field="product"]') || {}).value || '').trim();
                let name = ((tr.querySelector('[data-sne-field="name"]') || {}).value || '').trim();
                const qty = Math.max(0, Number((tr.querySelector('[data-sne-field="qty"]') || {}).value) || 0);
                const price = Math.max(0, Number((tr.querySelector('[data-sne-field="price"]') || {}).value) || 0);
                if (!qty && !price && !name && !product) return;
                if (!name && product) {
                    const cat = pricedCatalog().filter(function (p) { return p.id === product; })[0];
                    name = cat ? cat.name : product;
                }
                if (!name) name = product || 'Ítem';
                const cat = product ? pricedCatalog().filter(function (p) { return p.id === product; })[0] : null;
                items.push({
                    product: product || name,
                    name: name,
                    code: cat ? (cat.code || '') : '',
                    unit: cat ? (cat.kind === 'liquido' ? (cat.unitLabel || 'L') : 'Pza') : 'Pza',
                    price: Math.round(price * 100) / 100,
                    qty: Math.round(qty * 1000) / 1000,
                    lineTotal: Math.round(qty * price * 100) / 100
                });
            });
        }
        if (!items.length) {
            toast('Agrega al menos una línea');
            return null;
        }
        if (['facturado', 'sin_facturar'].indexOf(bill) < 0) {
            toast('Facturación inválida');
            return null;
        }
        const total = items.reduce(function (n, it) { return n + (Number(it.lineTotal) || 0); }, 0);
        let pay = (document.getElementById('snePay') || {}).value || 'efectivo';
        let payments = null;
        if (snePaySplitEnabled()) {
            const norm = normalizePaymentLines(readSnePaySplitLines(), total);
            if (!norm.ok) {
                toast(norm.error || 'Pago mixto inválido');
                return null;
            }
            pay = norm.paymentMethod;
            payments = norm.payments;
        } else if (!isValidPayMethod(pay)) {
            toast('Método de pago inválido');
            return null;
        } else {
            payments = [{ method: pay, amount: roundMoney(total) }];
        }
        const clientSnapshot = client ? {
            id: client.id,
            name: client.name,
            phone: client.phone || '',
            email: client.email || '',
            company: client.company || '',
            rfc: client.rfc || '',
            type: normalizeClientType(client.type || client.kind)
        } : null;
        return {
            createdAt: createdAt,
            clientId: client ? client.id : null,
            client: clientSnapshot,
            customer: client ? clientDisplay(client) : (customerRaw || 'Mostrador'),
            paymentMethod: pay,
            payments: payments,
            billing: bill,
            city: city,
            items: items,
            total: Math.round(total * 100) / 100
        };
    }

    function persistSaleRecord(sale) {
        if (!sale || !sale.id) return false;
        touchSaleRecord(sale);
        let i;
        for (i = 0; i < sales.length; i++) {
            if (sales[i].id === sale.id) {
                sales[i] = sale;
                saveSales();
                putSaleEdit(sale.id, saleEditPayload(sale));
                return true;
            }
        }
        for (i = 0; i < historicalSales.length; i++) {
            if (historicalSales[i].id === sale.id) {
                historicalSales[i] = sale;
                putSaleEdit(sale.id, saleEditPayload(sale));
                invalidateAnalyticsSalesCache();
                return true;
            }
        }
        return false;
    }

    function setSaleNoteMode(editing) {
        saleNoteEditing = !!editing;
        if (!saleNoteEditing) closeSneClientPicker();
        const modal = document.getElementById('saleNoteModal');
        const doc = document.getElementById('saleNoteDoc');
        const edit = document.getElementById('saleNoteEdit');
        const share = document.getElementById('saleNoteShareBlock');
        const editBtn = document.getElementById('saleNoteEditBtn');
        if (modal) modal.classList.toggle('is-editing', saleNoteEditing);
        if (doc) doc.hidden = saleNoteEditing;
        if (edit) edit.hidden = !saleNoteEditing;
        if (share) share.hidden = saleNoteEditing;
        if (editBtn) editBtn.hidden = saleNoteEditing;
        if (saleNoteEditing) {
            const sale = saleById(activeNoteSaleId);
            if (sale) renderSaleNoteEditForm(sale);
        }
    }

    function saveSaleNoteEdit() {
        const sale = saleById(activeNoteSaleId);
        if (!sale) return;
        const patch = collectSaleNoteEditForm();
        if (!patch) return;
        const beforeItems = (sale.items || []).map(function (it) { return Object.assign({}, it); });
        const trackStock = !isHistoricalImportSale(sale);
        Object.assign(sale, patch);
        ensureSaleNote(sale);
        if (!persistSaleRecord(sale)) {
            toast('No se pudo guardar el ticket');
            return;
        }
        if (trackStock) applySaleInventoryChange(beforeItems, sale.items);
        setSaleNoteMode(false);
        openSaleNoteModal(sale);
        renderHistory();
        refreshSalesDependentViews();
        updatePosKpis();
        renderDashboardRadar();
        toast('Ticket actualizado · ' + saleReceiptLabel(sale));
        renderCobranza();
    }

    function syncSaleNoteDeleteVisibility() {
        const delBtn = document.getElementById('saleNoteDelete');
        if (!delBtn) return;
        const sale = saleById(activeNoteSaleId);
        const canDelete = isAdminRole() && !!sale && !saleNoteEditing;
        if (canDelete) delBtn.removeAttribute('hidden');
        else delBtn.setAttribute('hidden', '');
    }

    function openSaleNoteModal(sale) {
        if (!sale) return;
        ensureSaleNote(sale);
        activeNoteSaleId = sale.id;
        saleNoteEditing = false;
        const doc = document.getElementById('saleNoteDoc');
        const title = document.getElementById('saleNoteModalTitle');
        const phoneEl = document.getElementById('saleNotePhone');
        const emailEl = document.getElementById('saleNoteEmail');
        const modal = document.getElementById('saleNoteModal');
        const edit = document.getElementById('saleNoteEdit');
        const share = document.getElementById('saleNoteShareBlock');
        const editBtn = document.getElementById('saleNoteEditBtn');
        if (doc) {
            doc.hidden = false;
            doc.innerHTML = buildNoteHtml(sale);
        }
        if (edit) {
            edit.hidden = true;
            edit.innerHTML = '';
        }
        if (share) share.hidden = false;
        if (editBtn) editBtn.hidden = false;
        if (modal) modal.classList.remove('is-editing');
        if (title) title.textContent = 'Nota de venta · ' + saleReceiptLabel(sale);
        const phone = (sale.client && sale.client.phone) || (sale.note && sale.note.sharePhone) || '';
        const email = (sale.client && sale.client.email) || (sale.note && sale.note.shareEmail) || '';
        if (phoneEl) phoneEl.value = phone;
        if (emailEl) emailEl.value = email;
        syncSaleNoteDeleteVisibility();
        if (!modal) return;
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeSaleNoteModal() {
        const modal = document.getElementById('saleNoteModal');
        if (!modal) return;
        closeSneClientPicker();
        saleNoteEditing = false;
        modal.classList.remove('show', 'is-editing');
        modal.setAttribute('aria-hidden', 'true');
        activeNoteSaleId = null;
        const edit = document.getElementById('saleNoteEdit');
        if (edit) edit.innerHTML = '';
    }

    function deleteActiveSaleNote() {
        if (!isAdminRole()) {
            toast('Solo admin puede eliminar ventas');
            return;
        }
        const id = activeNoteSaleId;
        const sale = saleById(id);
        if (!sale) return;
        const label = saleReceiptLabel(sale);
        if (!confirm('¿Eliminar esta venta? No se puede deshacer')) return;
        const wasHist = isHistoricalImportSale(sale);
        if (!wasHist) applySaleInventoryChange(sale.items, []);
        if (wasHist) {
            historicalSales = historicalSales.filter(function (s) { return s.id !== id; });
            putSaleEdit(id, { deleted: true });
            invalidateAnalyticsSalesCache();
        } else {
            const now = new Date().toISOString();
            sales = sales.filter(function (s) { return s.id !== id; });
            putSaleEdit(id, { deleted: true });
            // Tombstone en la colección sync para que merge-by-id no resucite el ticket.
            const raw = loadSalesRaw().filter(function (s) { return !s || s.id !== id; });
            raw.push({ id: id, deleted: true, editedAt: now, updatedAt: now });
            localStorage.setItem(SALES_KEY, JSON.stringify({ items: raw, updatedAt: now }));
            saveSales();
        }
        closeSaleNoteModal();
        renderHistory();
        refreshSalesDependentViews();
        updatePosKpis();
        renderDashboardRadar();
        toast(label ? ('Venta ' + label + ' eliminada') : 'Venta eliminada');
    }

    function saleById(id) {
        if (!id) return null;
        let i;
        for (i = 0; i < sales.length; i++) {
            if (sales[i].id === id) return sales[i];
        }
        for (i = 0; i < historicalSales.length; i++) {
            if (historicalSales[i].id === id) return historicalSales[i];
        }
        return null;
    }

    function persistNoteShareContacts(sale) {
        if (!sale) return;
        ensureSaleNote(sale);
        const phoneEl = document.getElementById('saleNotePhone');
        const emailEl = document.getElementById('saleNoteEmail');
        sale.note.sharePhone = phoneEl ? (phoneEl.value || '').trim() : '';
        sale.note.shareEmail = emailEl ? (emailEl.value || '').trim() : '';
        sale.note.lastSharedAt = new Date().toISOString();
        persistSaleRecord(sale);
    }

    function shareNoteWhatsApp() {
        const sale = saleById(activeNoteSaleId);
        if (!sale) return;
        const phoneEl = document.getElementById('saleNotePhone');
        const raw = phoneEl ? phoneEl.value : '';
        const digits = phoneDigits(raw);
        if (raw.trim() && !digits) {
            toast('Revisa el teléfono (10 dígitos o con lada)');
            if (phoneEl) phoneEl.focus();
            return;
        }
        persistNoteShareContacts(sale);
        const text = encodeURIComponent(buildNotePlainText(sale));
        const url = digits
            ? ('https://wa.me/' + digits + '?text=' + text)
            : ('https://wa.me/?text=' + text);
        window.open(url, '_blank', 'noopener');
        toast(digits ? 'Abriendo WhatsApp…' : 'WhatsApp sin número · elige el chat');
    }

    function shareNoteEmail() {
        const sale = saleById(activeNoteSaleId);
        if (!sale) return;
        const emailEl = document.getElementById('saleNoteEmail');
        const to = emailEl ? (emailEl.value || '').trim() : '';
        persistNoteShareContacts(sale);
        const subject = encodeURIComponent('Nota de venta ' + (sale.folio || '') + ' · S-35');
        const body = encodeURIComponent(buildNotePlainText(sale));
        const href = 'mailto:' + (to || '') + '?subject=' + subject + '&body=' + body;
        window.location.href = href;
        toast(to ? 'Abriendo correo…' : 'Correo sin destinatario · completa el para');
    }

    function copyNoteText() {
        const sale = saleById(activeNoteSaleId);
        if (!sale) return;
        const text = buildNotePlainText(sale);
        const done = function () { toast('Nota copiada'); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(function () {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            toast('Nota copiada');
        } catch (_) {
            toast('No se pudo copiar');
        }
    }

    function printSaleNote() {
        const sale = saleById(activeNoteSaleId);
        if (!sale) return;
        window.print();
    }

    function startOfLocalDay(d) {
        const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        return x;
    }
    function addDays(d, n) {
        const x = new Date(d.getTime());
        x.setDate(x.getDate() + n);
        return x;
    }
    function startOfWeekMonday(d) {
        const x = startOfLocalDay(d);
        const dow = x.getDay();
        const delta = dow === 0 ? -6 : 1 - dow;
        return addDays(x, delta);
    }
    function startOfMonth(d) {
        return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    function startOfYear(d) {
        return new Date(d.getFullYear(), 0, 1);
    }
    function salesYearSpan(list) {
        let minY = null;
        let maxY = null;
        (list || sales || []).forEach(function (s) {
            const d = new Date(s.createdAt);
            if (isNaN(d.getTime())) return;
            const y = d.getFullYear();
            if (minY == null || y < minY) minY = y;
            if (maxY == null || y > maxY) maxY = y;
        });
        const nowY = new Date().getFullYear();
        if (minY == null) {
            minY = nowY;
            maxY = nowY;
        }
        return { min: minY, max: maxY };
    }
    function periodBounds(period, offset, now) {
        now = now || new Date();
        let start;
        let end;
        if (period === 'historial') {
            const span = salesYearSpan(salesForAnalytics());
            start = new Date(span.min, 0, 1);
            end = new Date(span.max + 1, 0, 1);
        } else if (period === 'week') {
            start = addDays(startOfWeekMonday(now), offset * 7);
            end = addDays(start, 7);
        } else if (period === 'month') {
            const base = startOfMonth(now);
            start = new Date(base.getFullYear(), base.getMonth() + offset, 1);
            end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        } else if (period === 'year') {
            start = new Date(now.getFullYear() + offset, 0, 1);
            end = new Date(start.getFullYear() + 1, 0, 1);
        } else {
            start = addDays(startOfLocalDay(now), offset);
            end = addDays(start, 1);
        }
        return { start: start, end: end };
    }
    function formatPeriodLabel(period, start, end) {
        const optsDay = { day: 'numeric', month: 'short', year: 'numeric' };
        if (period === 'historial') {
            const y0 = start.getFullYear();
            const y1 = end.getFullYear() - 1;
            if (y0 === y1) return 'Historial · ' + y0;
            return 'Historial · ' + y0 + ' – ' + y1;
        }
        if (period === 'day') {
            const today = startOfLocalDay(new Date());
            if (start.getTime() === today.getTime()) return 'Hoy · ' + start.toLocaleDateString('es-MX', optsDay);
            if (start.getTime() === addDays(today, -1).getTime()) return 'Ayer · ' + start.toLocaleDateString('es-MX', optsDay);
            if (start.getTime() === addDays(today, -2).getTime()) return 'Antier · ' + start.toLocaleDateString('es-MX', optsDay);
            return start.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        }
        if (period === 'week') {
            const last = addDays(end, -1);
            return start.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) +
                ' – ' + last.toLocaleDateString('es-MX', optsDay);
        }
        if (period === 'month') {
            return start.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
        }
        return String(start.getFullYear());
    }

    const MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const WEEKDAY_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    let periodRangePickerCtx = null;
    let periodRangePickerView = null;

    function periodOffsetFromDate(period, target, now) {
        now = now || new Date();
        const t = new Date(target.getTime());
        if (period === 'day') {
            return Math.round((startOfLocalDay(t).getTime() - startOfLocalDay(now).getTime()) / 86400000);
        }
        if (period === 'week') {
            return Math.round((startOfWeekMonday(t).getTime() - startOfWeekMonday(now).getTime()) / (7 * 86400000));
        }
        if (period === 'month') {
            const base = startOfMonth(now);
            return (t.getFullYear() - base.getFullYear()) * 12 + (t.getMonth() - base.getMonth());
        }
        if (period === 'year') {
            return t.getFullYear() - now.getFullYear();
        }
        return 0;
    }

    function isFuturePeriodDate(period, target, now) {
        return periodOffsetFromDate(period, target, now) > 0;
    }

    function sameLocalDay(a, b) {
        return startOfLocalDay(a).getTime() === startOfLocalDay(b).getTime();
    }

    function sameLocalMonth(a, b) {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
    }

    function getPeriodRangeContext(kind) {
        if (kind === 'pdSales') {
            return {
                kind: 'pdSales',
                period: pdSalesPeriod,
                offset: pdSalesOffset,
                setOffset: function (next) {
                    pdSalesOffset = next;
                    if (pdSalesSlug) renderProductSalesAnalytics(pdSalesSlug);
                },
                isDisabled: pdSalesPeriod === 'historial'
            };
        }
        if (kind === 'productsMov') {
            return {
                kind: 'productsMov',
                period: productsMovPeriod,
                offset: productsMovOffset,
                setOffset: function (next) {
                    productsMovOffset = next;
                    renderProductsMovementsChart();
                },
                isDisabled: productsMovPeriod === 'historial'
            };
        }
        if (kind === 'clientDash') {
            return {
                kind: 'clientDash',
                period: clientDashPeriod,
                offset: clientDashOffset,
                setOffset: function (next) {
                    clientDashOffset = next;
                    if (clientDashId) renderClientDashboard(clientDashId);
                },
                isDisabled: clientDashPeriod === 'historial'
            };
        }
        return {
            kind: 'cortes',
            period: cortesPeriod,
            offset: cortesOffset,
            setOffset: function (next) {
                cortesOffset = next;
                renderCortes();
            },
            isDisabled: cortesPeriod === 'historial'
        };
    }

    function closePeriodRangePicker() {
        const pop = document.getElementById('periodRangePopover');
        if (pop) pop.hidden = true;
        document.querySelectorAll('[data-period-range-trigger]').forEach(function (btn) {
            btn.setAttribute('aria-expanded', 'false');
        });
        periodRangePickerCtx = null;
        periodRangePickerView = null;
    }

    function positionPeriodRangePicker(trigger) {
        const pop = document.getElementById('periodRangePopover');
        if (!pop || !trigger) return;
        pop.hidden = false;
        const r = trigger.getBoundingClientRect();
        const w = pop.offsetWidth || 240;
        const left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 8));
        const top = r.bottom + 6;
        const maxTop = window.innerHeight - pop.offsetHeight - 8;
        pop.style.left = left + 'px';
        pop.style.top = Math.min(top, maxTop) + 'px';
    }

    function applyPeriodRangeSelection(targetDate) {
        if (!periodRangePickerCtx) return;
        const ctx = periodRangePickerCtx;
        if (isFuturePeriodDate(ctx.period, targetDate)) return;
        ctx.setOffset(periodOffsetFromDate(ctx.period, targetDate));
        closePeriodRangePicker();
    }

    function renderPeriodRangePickerMonth(ctx, bounds) {
        const now = new Date();
        const viewYear = periodRangePickerView.year;
        const selected = bounds.start;
        let html = '<div class="prp-head">' +
            '<button type="button" class="prp-nav" data-prp-nav="year-prev" aria-label="Año anterior"><i class="fa-solid fa-chevron-left"></i></button>' +
            '<span class="prp-title">' + esc(String(viewYear)) + '</span>' +
            '<button type="button" class="prp-nav" data-prp-nav="year-next" aria-label="Año siguiente"><i class="fa-solid fa-chevron-right"></i></button>' +
            '</div><div class="prp-grid months">';
        for (let m = 0; m < 12; m++) {
            const d = new Date(viewYear, m, 1);
            const future = isFuturePeriodDate('month', d, now);
            const active = sameLocalMonth(d, selected);
            html += '<button type="button" class="prp-opt' + (active ? ' active' : '') + '"' +
                (future ? ' disabled' : '') +
                ' data-prp-month="' + m + '">' + esc(MONTH_SHORT[m]) + '</button>';
        }
        return html + '</div>';
    }

    function renderPeriodRangePickerYear(ctx, bounds) {
        const span = salesYearSpan(salesForAnalytics());
        const selectedYear = bounds.start.getFullYear();
        const nowY = new Date().getFullYear();
        let html = '<div class="prp-head"><span class="prp-title">Año</span></div><div class="prp-grid years">';
        for (let y = span.max; y >= span.min; y--) {
            const d = new Date(y, 0, 1);
            const future = y > nowY;
            const active = y === selectedYear;
            html += '<button type="button" class="prp-opt' + (active ? ' active' : '') + '"' +
                (future ? ' disabled' : '') +
                ' data-prp-year="' + y + '">' + esc(String(y)) + '</button>';
        }
        return html + '</div>';
    }

    function renderPeriodRangePickerCalendar(ctx, bounds) {
        const now = new Date();
        const viewYear = periodRangePickerView.year;
        const viewMonth = periodRangePickerView.month;
        const selectedStart = bounds.start;
        const selectedEnd = addDays(bounds.end, -1);
        const monthStart = new Date(viewYear, viewMonth, 1);
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const lead = (monthStart.getDay() + 6) % 7;
        const title = monthStart.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
        let html = '<div class="prp-head">' +
            '<button type="button" class="prp-nav" data-prp-nav="month-prev" aria-label="Mes anterior"><i class="fa-solid fa-chevron-left"></i></button>' +
            '<span class="prp-title">' + esc(title) + '</span>' +
            '<button type="button" class="prp-nav" data-prp-nav="month-next" aria-label="Mes siguiente"><i class="fa-solid fa-chevron-right"></i></button>' +
            '</div><div class="prp-grid weekdays">';
        WEEKDAY_SHORT.forEach(function (wd) {
            html += '<span class="prp-wd">' + wd + '</span>';
        });
        html += '</div><div class="prp-grid days">';
        for (let i = 0; i < lead; i++) {
            html += '<span class="prp-opt empty"></span>';
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(viewYear, viewMonth, day);
            const future = isFuturePeriodDate(ctx.period, d, now);
            let cls = 'prp-opt';
            if (ctx.period === 'day' && sameLocalDay(d, selectedStart)) cls += ' active';
            if (ctx.period === 'week') {
                if (d >= selectedStart && d <= selectedEnd) cls += ' in-week';
                if (sameLocalDay(d, selectedStart)) cls += ' active';
            }
            html += '<button type="button" class="' + cls + '"' +
                (future ? ' disabled' : '') +
                ' data-prp-day="' + day + '">' + esc(String(day)) + '</button>';
        }
        return html + '</div>';
    }

    function renderPeriodRangePickerContent() {
        const pop = document.getElementById('periodRangePopover');
        if (!pop || !periodRangePickerCtx) return;
        const ctx = periodRangePickerCtx;
        const bounds = periodBounds(ctx.period, ctx.offset);
        if (!periodRangePickerView) {
            periodRangePickerView = { year: bounds.start.getFullYear(), month: bounds.start.getMonth() };
        }
        if (ctx.period === 'month') {
            pop.innerHTML = renderPeriodRangePickerMonth(ctx, bounds);
        } else if (ctx.period === 'year') {
            pop.innerHTML = renderPeriodRangePickerYear(ctx, bounds);
        } else {
            pop.innerHTML = renderPeriodRangePickerCalendar(ctx, bounds);
        }
    }

    function openPeriodRangePicker(trigger) {
        const kind = trigger.getAttribute('data-period-range-trigger');
        if (!kind) return;
        const ctx = getPeriodRangeContext(kind);
        if (ctx.isDisabled) return;
        const pop = document.getElementById('periodRangePopover');
        if (!pop) return;
        if (periodRangePickerCtx && periodRangePickerCtx.kind === kind && !pop.hidden) {
            closePeriodRangePicker();
            return;
        }
        closePeriodRangePicker();
        periodRangePickerCtx = ctx;
        const bounds = periodBounds(ctx.period, ctx.offset);
        periodRangePickerView = { year: bounds.start.getFullYear(), month: bounds.start.getMonth() };
        renderPeriodRangePickerContent();
        trigger.setAttribute('aria-expanded', 'true');
        positionPeriodRangePicker(trigger);
    }

    function bindPeriodRangePicker() {
        if (bindPeriodRangePicker.done) return;
        bindPeriodRangePicker.done = true;
        document.addEventListener('click', function (e) {
            const trigger = e.target.closest('[data-period-range-trigger]');
            if (trigger) {
                e.preventDefault();
                e.stopPropagation();
                openPeriodRangePicker(trigger);
                return;
            }
            const pop = document.getElementById('periodRangePopover');
            if (!pop || pop.hidden) return;
            const inside = e.target.closest('#periodRangePopover');
            if (!inside) {
                closePeriodRangePicker();
                return;
            }
            const nav = e.target.closest('[data-prp-nav]');
            if (nav && periodRangePickerView) {
                const action = nav.getAttribute('data-prp-nav');
                if (action === 'year-prev') periodRangePickerView.year -= 1;
                else if (action === 'year-next') periodRangePickerView.year += 1;
                else if (action === 'month-prev') {
                    periodRangePickerView.month -= 1;
                    if (periodRangePickerView.month < 0) {
                        periodRangePickerView.month = 11;
                        periodRangePickerView.year -= 1;
                    }
                } else if (action === 'month-next') {
                    periodRangePickerView.month += 1;
                    if (periodRangePickerView.month > 11) {
                        periodRangePickerView.month = 0;
                        periodRangePickerView.year += 1;
                    }
                }
                renderPeriodRangePickerContent();
                return;
            }
            const monthBtn = e.target.closest('[data-prp-month]');
            if (monthBtn && periodRangePickerCtx) {
                const m = Number(monthBtn.getAttribute('data-prp-month'));
                applyPeriodRangeSelection(new Date(periodRangePickerView.year, m, 1));
                return;
            }
            const yearBtn = e.target.closest('[data-prp-year]');
            if (yearBtn && periodRangePickerCtx) {
                applyPeriodRangeSelection(new Date(Number(yearBtn.getAttribute('data-prp-year')), 0, 1));
                return;
            }
            const dayBtn = e.target.closest('[data-prp-day]');
            if (dayBtn && periodRangePickerCtx && periodRangePickerView) {
                const d = new Date(periodRangePickerView.year, periodRangePickerView.month, Number(dayBtn.getAttribute('data-prp-day')));
                applyPeriodRangeSelection(d);
            }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closePeriodRangePicker();
        });
        window.addEventListener('resize', closePeriodRangePicker);
    }

    function salesInRange(list, start, end) {
        return list.filter(function (s) {
            const t = new Date(s.createdAt).getTime();
            if (isNaN(t)) return false;
            return t >= start.getTime() && t < end.getTime();
        });
    }
    function sumTotals(list) {
        return list.reduce(function (n, s) { return n + (Number(s.total) || 0); }, 0);
    }
    /** Días calendario del periodo (mín. 1) para promedio diario. */
    function calendarDaysInBounds(bounds) {
        if (!bounds || !bounds.start || !bounds.end) return 1;
        const ms = bounds.end.getTime() - bounds.start.getTime();
        if (!isFinite(ms) || ms <= 0) return 1;
        return Math.max(1, Math.round(ms / 86400000));
    }
    /**
     * Si el periodo actual aún no termina (offset 0), corta el fin al inicio
     * de mañana local para no contar días futuros vacíos.
     */
    function effectiveBoundsThroughNow(bounds, now) {
        now = now || new Date();
        if (!bounds || !bounds.start || !bounds.end) return bounds;
        const cap = addDays(startOfLocalDay(now), 1);
        if (bounds.end.getTime() <= cap.getTime()) return bounds;
        if (bounds.start.getTime() >= cap.getTime()) return bounds;
        return { start: bounds.start, end: cap };
    }
    /**
     * Periodo anterior comparable: mismo tramo transcurrido
     * (ej. 1 ene–22 sep 2026 vs 1 ene–22 sep 2025).
     * Solo aplica al periodo “en curso” (offset 0).
     */
    function likeForLikePrevBounds(period, curBounds, offset, now) {
        now = now || new Date();
        const rawPrev = periodBounds(period, offset - 1, now);
        if (offset !== 0 || period === 'historial' || !curBounds) return rawPrev;

        let elapsed;
        if (period === 'day') {
            elapsed = Math.max(0, now.getTime() - curBounds.start.getTime());
        } else {
            const curEff = effectiveBoundsThroughNow(curBounds, now);
            elapsed = Math.max(0, curEff.end.getTime() - curEff.start.getTime());
        }
        const prevEnd = new Date(rawPrev.start.getTime() + elapsed);
        if (prevEnd.getTime() >= rawPrev.end.getTime()) return rawPrev;
        if (prevEnd.getTime() <= rawPrev.start.getTime()) {
            return { start: rawPrev.start, end: new Date(rawPrev.start.getTime() + 60000) };
        }
        return { start: rawPrev.start, end: prevEnd };
    }
    function pctDelta(cur, prev) {
        if (!prev) return null;
        return ((cur - prev) / prev) * 100;
    }
    function formatDelta(cur, prev, opts) {
        opts = opts || {};
        let label = 'vs periodo anterior';
        if (opts.likeForLike) {
            if (opts.period === 'year') label = 'vs mismo tramo año anterior';
            else if (opts.period === 'month') label = 'vs mismos días del mes anterior';
            else if (opts.period === 'week') label = 'vs mismos días semana anterior';
            else if (opts.period === 'day') label = 'vs misma hora día anterior';
            else label = 'vs mismo tramo periodo anterior';
        }
        if (prev == null || (prev === 0 && cur === 0)) return 'Sin ventas en el periodo anterior';
        if (prev === 0) return label + ' · ' + money(prev) + ' → nuevo';
        const d = pctDelta(cur, prev);
        const sign = d > 0 ? '+' : '';
        return label + ' · ' + money(prev) + ' (' + sign + d.toFixed(0) + '%)';
    }

    function emptyRhythmBuckets(period, bounds) {
        if (period === 'historial') {
            const y0 = bounds.start.getFullYear();
            const y1 = Math.max(y0, bounds.end.getFullYear() - 1);
            const buckets = [];
            for (let y = y0; y <= y1; y++) {
                buckets.push({ key: y, label: String(y), amount: 0 });
            }
            return { subtitle: 'Cada año del historial', buckets: buckets };
        }
        if (period === 'week') {
            return {
                subtitle: 'Lunes a domingo',
                buckets: [
                    { key: 0, label: 'Lun' },
                    { key: 1, label: 'Mar' },
                    { key: 2, label: 'Mié' },
                    { key: 3, label: 'Jue' },
                    { key: 4, label: 'Vie' },
                    { key: 5, label: 'Sáb' },
                    { key: 6, label: 'Dom' }
                ].map(function (b) { return { key: b.key, label: b.label, amount: 0 }; })
            };
        }
        if (period === 'month') {
            const days = new Date(bounds.start.getFullYear(), bounds.start.getMonth() + 1, 0).getDate();
            const buckets = [];
            for (let d = 1; d <= days; d++) {
                buckets.push({ key: d, label: String(d), amount: 0 });
            }
            return { subtitle: 'Cada día del mes', buckets: buckets };
        }
        if (period === 'year') {
            const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            return {
                subtitle: 'Cada mes del año',
                buckets: labels.map(function (label, i) {
                    return { key: i, label: label, amount: 0 };
                })
            };
        }
        const buckets = [];
        for (let h = 7; h <= 19; h++) {
            buckets.push({
                key: h,
                label: h + ':00',
                amount: 0
            });
        }
        return { subtitle: 'Por hora · 7:00–19:00', buckets: buckets };
    }

    function fillRhythmBuckets(period, bounds, list) {
        const meta = emptyRhythmBuckets(period, bounds);
        const buckets = meta.buckets;
        buckets.forEach(function (b) {
            if (b.qty == null) b.qty = 0;
        });
        list.forEach(function (s) {
            const d = new Date(s.createdAt);
            if (isNaN(d.getTime())) return;
            const amt = Number(s.total) || 0;
            const qty = Number(s.qty) || 0;
            let bucket = null;
            if (period === 'day') {
                const h = d.getHours();
                if (h >= 7 && h <= 19) bucket = buckets[h - 7];
            } else if (period === 'week') {
                const dayStart = startOfLocalDay(d);
                const diff = Math.round((dayStart.getTime() - bounds.start.getTime()) / 86400000);
                if (diff >= 0 && diff <= 6) bucket = buckets[diff];
            } else if (period === 'month') {
                if (d.getFullYear() === bounds.start.getFullYear() && d.getMonth() === bounds.start.getMonth()) {
                    const day = d.getDate();
                    if (buckets[day - 1]) bucket = buckets[day - 1];
                }
            } else if (period === 'year') {
                if (d.getFullYear() === bounds.start.getFullYear()) {
                    bucket = buckets[d.getMonth()];
                }
            } else if (period === 'historial') {
                const idx = d.getFullYear() - bounds.start.getFullYear();
                if (buckets[idx]) bucket = buckets[idx];
            }
            if (bucket) {
                bucket.amount += amt;
                bucket.qty += qty;
            }
        });
        return { subtitle: meta.subtitle, buckets: buckets };
    }

    /**
     * Índice (puede ser fraccional) del marcador “hoy” en el eje X, o null
     * si el periodo visible no incluye el día actual.
     */
    function todayRhythmMarkerIndex(period, bounds, now) {
        now = now || new Date();
        if (!bounds || !bounds.start || !bounds.end) return null;
        const t = now.getTime();
        if (t < bounds.start.getTime() || t >= bounds.end.getTime()) return null;

        if (period === 'day') {
            const h = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
            if (h < 7) return 0;
            if (h > 19) return 12; // 19:00 → último bucket (índice 12)
            return h - 7;
        }
        if (period === 'week') {
            const dayStart = startOfLocalDay(now);
            const diff = Math.round((dayStart.getTime() - bounds.start.getTime()) / 86400000);
            if (diff < 0 || diff > 6) return null;
            return diff;
        }
        if (period === 'month') {
            const dim = new Date(bounds.start.getFullYear(), bounds.start.getMonth() + 1, 0).getDate();
            const dayFrac = (now.getDate() - 1) +
                (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
            return Math.min(dim - 1, Math.max(0, dayFrac));
        }
        if (period === 'year') {
            const m = now.getMonth();
            const dim = new Date(now.getFullYear(), m + 1, 0).getDate();
            return m + (now.getDate() - 1) / dim;
        }
        if (period === 'historial') {
            const y0 = bounds.start.getFullYear();
            const y1 = Math.max(y0, bounds.end.getFullYear() - 1);
            const y = now.getFullYear();
            if (y < y0 || y > y1) return null;
            return y - y0;
        }
        return null;
    }

    function compactMoney(n) {
        const v = Number(n) || 0;
        if (v >= 1000000) return '$' + (v / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (v >= 1000) return '$' + (v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k';
        return '$' + Math.round(v).toLocaleString('es-MX');
    }

    function renderRhythmChart(opts) {
        const host = opts.host;
        const subEl = opts.subEl;
        const period = opts.period;
        const bounds = opts.bounds;
        const list = opts.list;
        const prevBounds = opts.prevBounds;
        const prevList = opts.prevList;
        const hatchId = opts.hatchId || 'cortesHatch';
        const citySeries = opts.citySeries || null;
        const multiCity = !!(citySeries && citySeries.length >= 1);
        const lineColor = opts.lineColor || null;
        const showUnits = !!opts.showUnits;
        if (!host) return;

        const cur = fillRhythmBuckets(period, bounds, list);
        const showPrev = !multiCity && period !== 'historial' && prevBounds && prevList;
        const prev = showPrev
            ? fillRhythmBuckets(period, prevBounds, prevList)
            : { subtitle: '', buckets: cur.buckets.map(function (b) { return { key: b.key, label: b.label, amount: 0, qty: 0 }; }) };
        if (subEl) {
            if (multiCity) {
                subEl.textContent = cur.subtitle + ' · ' + (opts.seriesHint || 'por ciudad');
            } else {
                subEl.textContent = cur.subtitle;
            }
        }

        const seriesBuckets = multiCity
            ? citySeries.map(function (s) {
                return {
                    key: s.key,
                    label: s.label,
                    color: s.color,
                    buckets: fillRhythmBuckets(period, bounds, s.list || []).buckets
                };
            })
            : null;

        const n = cur.buckets.length;
        let maxVal = 0;
        for (let i = 0; i < n; i++) {
            maxVal = Math.max(maxVal, cur.buckets[i].amount, (prev.buckets[i] && prev.buckets[i].amount) || 0);
            if (seriesBuckets) {
                seriesBuckets.forEach(function (s) {
                    maxVal = Math.max(maxVal, (s.buckets[i] && s.buckets[i].amount) || 0);
                });
            }
        }
        const hasData = maxVal > 0;

        const W = 720;
        const H = 200;
        const padL = 44;
        const padR = 10;
        const padT = 14;
        const padB = 28;
        const plotW = W - padL - padR;
        const plotH = H - padT - padB;
        const yMax = maxVal > 0 ? maxVal * 1.08 : 1;
        const baseY = padT + plotH;

        function ptX(i) {
            if (n <= 1) return padL + plotW / 2;
            return padL + (plotW * i) / (n - 1);
        }
        function ptY(v) {
            return padT + plotH - ((Number(v) || 0) / yMax) * plotH;
        }

        const todayIdx = todayRhythmMarkerIndex(period, bounds);
        let todayMark = '';
        if (todayIdx != null && n > 0) {
            const tx = ptX(Math.min(n - 1, Math.max(0, todayIdx)));
            todayMark = '<line class="today-mark" x1="' + tx.toFixed(1) + '" y1="' + padT +
                '" x2="' + tx.toFixed(1) + '" y2="' + baseY.toFixed(1) + '" />';
        }

        const gridSteps = [0, 0.25, 0.5, 0.75, 1];
        let grid = '';
        let yLabels = '';
        gridSteps.forEach(function (f) {
            const y = padT + plotH * (1 - f);
            grid += '<line class="grid-line" x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '"/>';
            if (f === 0 || f === 0.5 || f === 1) {
                yLabels += '<text class="y-label" x="' + (padL - 6) + '" y="' + (y + 3) + '" text-anchor="end">' +
                    (f === 0 ? '0' : compactMoney(yMax * f)) + '</text>';
            }
        });

        function linePath(buckets) {
            const pts = buckets.map(function (b, i) {
                return { x: ptX(i), y: ptY(b.amount) };
            });
            if (!pts.length) return '';
            if (pts.length === 1) {
                return 'M' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
            }
            if (pts.length === 2) {
                return 'M' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1) +
                    ' L' + pts[1].x.toFixed(1) + ' ' + pts[1].y.toFixed(1);
            }
            // Monotone cubic Hermite (Fritsch–Carlson) → Bézier: smooth, no overshoot under y=0
            const nPts = pts.length;
            const dx = [];
            const dy = [];
            const delta = [];
            for (let i = 0; i < nPts - 1; i++) {
                dx[i] = pts[i + 1].x - pts[i].x;
                dy[i] = pts[i + 1].y - pts[i].y;
                delta[i] = dx[i] !== 0 ? dy[i] / dx[i] : 0;
            }
            const m = new Array(nPts);
            m[0] = delta[0];
            m[nPts - 1] = delta[nPts - 2];
            for (let i = 1; i < nPts - 1; i++) {
                if (delta[i - 1] * delta[i] <= 0) {
                    m[i] = 0;
                } else {
                    m[i] = (delta[i - 1] + delta[i]) / 2;
                }
            }
            for (let i = 0; i < nPts - 1; i++) {
                if (Math.abs(delta[i]) < 1e-12) {
                    m[i] = 0;
                    m[i + 1] = 0;
                } else {
                    const a = m[i] / delta[i];
                    const b = m[i + 1] / delta[i];
                    const s = a * a + b * b;
                    if (s > 9) {
                        const t = 3 / Math.sqrt(s);
                        m[i] = t * a * delta[i];
                        m[i + 1] = t * b * delta[i];
                    }
                }
            }
            // SVG y grows downward: data ≥ 0 ⇒ curve y must stay ≤ baseY (zero baseline)
            function clampY(y) {
                return Math.min(y, baseY);
            }
            let d = 'M' + pts[0].x.toFixed(1) + ' ' + clampY(pts[0].y).toFixed(1);
            for (let i = 0; i < nPts - 1; i++) {
                const h = dx[i];
                const c1x = pts[i].x + h / 3;
                const c1y = clampY(pts[i].y + (m[i] * h) / 3);
                const c2x = pts[i + 1].x - h / 3;
                const c2y = clampY(pts[i + 1].y - (m[i + 1] * h) / 3);
                d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) +
                    ', ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) +
                    ', ' + pts[i + 1].x.toFixed(1) + ' ' + clampY(pts[i + 1].y).toFixed(1);
            }
            return d;
        }

        const curLine = linePath(cur.buckets);
        const prevLine = linePath(prev.buckets);
        const areaPath = curLine +
            ' L' + ptX(n - 1).toFixed(1) + ' ' + baseY.toFixed(1) +
            ' L' + ptX(0).toFixed(1) + ' ' + baseY.toFixed(1) + ' Z';

        let cityLines = '';
        if (multiCity && seriesBuckets) {
            seriesBuckets.forEach(function (s) {
                const d = linePath(s.buckets);
                if (!d) return;
                cityLines += '<path class="line-city" data-city="' + esc(s.key) + '" d="' + d +
                    '" style="stroke:' + esc(s.color) + '"/>';
            });
        }

        let xLabels = '';
        const labelEvery = period === 'month' ? (n > 20 ? 2 : 1)
            : (period === 'day' ? 2
                : (period === 'historial' ? (n > 16 ? 2 : 1) : 1));
        for (let i = 0; i < n; i++) {
            const showLabel = i === 0 || i === n - 1 || (i % labelEvery === 0);
            if (!showLabel) continue;
            const lab = cur.buckets[i].label;
            xLabels += '<text class="axis-label" x="' + ptX(i).toFixed(1) + '" y="' + (H - 8) +
                '" text-anchor="middle">' + esc(lab) + '</text>';
        }

        function tipTitle(i) {
            const lab = cur.buckets[i].label;
            if (period === 'historial') return String(lab);
            if (period === 'year') return lab + ' · ' + bounds.start.getFullYear();
            if (period === 'month') {
                return 'Día ' + lab + ' · ' + bounds.start.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
            }
            if (period === 'week') return lab;
            return lab;
        }

        let hits = '';
        let dots = '';
        // Franjas verticales a lo alto del plot: fáciles de apuntar (mouse + touch)
        const colSpan = n <= 1 ? plotW : plotW / Math.max(1, n - 1);
        for (let i = 0; i < n; i++) {
            const x = ptX(i);
            const half = colSpan / 2;
            const x0 = Math.max(padL, x - half);
            const x1 = Math.min(W - padR, x + half);
            hits += '<rect class="hit-zone" data-idx="' + i + '" x="' + x0.toFixed(1) +
                '" y="' + padT + '" width="' + Math.max(1, x1 - x0).toFixed(1) +
                '" height="' + plotH.toFixed(1) + '" fill="transparent"/>';
            if (!multiCity) {
                dots += '<circle class="dot-cur" data-idx="' + i + '" cx="' + x.toFixed(1) +
                    '" cy="' + ptY(cur.buckets[i].amount).toFixed(1) + '" r="3.5"' +
                    (lineColor ? ' style="fill:' + esc(lineColor) + '"' : '') +
                    ' />';
                if (showPrev) {
                    const py = ptY((prev.buckets[i] && prev.buckets[i].amount) || 0);
                    dots += '<circle class="dot-cur dot-prev" data-idx="' + i + '" cx="' + x.toFixed(1) +
                        '" cy="' + py.toFixed(1) + '" r="3" style="fill:#a3a3a3"/>';
                }
            }
        }
        if (multiCity && seriesBuckets) {
            seriesBuckets.forEach(function (s) {
                for (let i = 0; i < n; i++) {
                    const amt = Number(s.buckets[i] && s.buckets[i].amount) || 0;
                    dots += '<circle class="dot-cur" data-idx="' + i + '" data-city="' + esc(s.key) +
                        '" cx="' + ptX(i).toFixed(1) + '" cy="' + ptY(amt).toFixed(1) +
                        '" r="3.5" style="fill:' + esc(s.color) + '"/>';
                }
            });
        }

        const defs =
            '<defs>' +
            '<pattern id="' + esc(hatchId) + '" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">' +
            '<line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" stroke-width="1" opacity="0.35"/>' +
            '</pattern>' +
            '</defs>';

        const emptyNote = hasData ? '' : '<div class="cortes-chart-empty">Sin ventas en este ritmo</div>';
        const singleLineStyle = lineColor ? (' style="stroke:' + esc(lineColor) + ';color:' + esc(lineColor) + '"') : '';
        host.innerHTML = emptyNote +
            '<div class="cortes-chart-tips" aria-hidden="true"></div>' +
            '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style="color:' +
            esc(lineColor || 'var(--text)') + '">' +
            defs + grid + yLabels +
            todayMark +
            '<line class="focus-line" x1="0" y1="' + padT + '" x2="0" y2="' + baseY.toFixed(1) + '" opacity="0"/>' +
            (!multiCity && hasData ? '<path class="area-hatch" d="' + areaPath + '" style="fill:url(#' + esc(hatchId) + ')"/>' : '') +
            (showPrev && prevLine ? '<path class="line-prev" d="' + prevLine + '"/>' : '') +
            (multiCity ? cityLines : ('<path class="line-cur" d="' + curLine + '"' + singleLineStyle + '/>')) +
            dots +
            hits +
            xLabels +
            '</svg>';

        const tipsHost = host.querySelector('.cortes-chart-tips');
        const focusLine = host.querySelector('.focus-line');
        let activeTipIdx = -1;

        function hideTip() {
            activeTipIdx = -1;
            if (tipsHost) tipsHost.innerHTML = '';
            if (focusLine) focusLine.setAttribute('opacity', '0');
            host.querySelectorAll('.dot-cur.is-active').forEach(function (el) {
                el.classList.remove('is-active');
            });
        }

        function placeTips(boxes) {
            // Evitar traslapes: ordenar de arriba→abajo y empujar hacia abajo si chocan
            boxes.sort(function (a, b) { return a.top - b.top; });
            const gap = 4;
            for (let i = 1; i < boxes.length; i++) {
                const prev = boxes[i - 1];
                const minTop = prev.top + prev.h + gap;
                if (boxes[i].top < minTop) boxes[i].top = minTop;
            }
            // Si se salen por abajo, subir el bloque entero
            const hostH = host.clientHeight || 0;
            if (boxes.length) {
                const last = boxes[boxes.length - 1];
                const overflow = (last.top + last.h + 2) - hostH;
                if (overflow > 0) {
                    boxes.forEach(function (b) { b.top -= overflow; });
                }
                if (boxes[0].top < 2) {
                    const shift = 2 - boxes[0].top;
                    boxes.forEach(function (b) { b.top += shift; });
                }
            }
            // Clamp horizontal + empujar a los lados si siguen muy juntos en Y
            const hostW = host.clientWidth || 0;
            boxes.forEach(function (b, i) {
                b.left = Math.max(4, Math.min(b.left, hostW - b.w - 4));
                if (i > 0 && Math.abs(boxes[i].top - boxes[i - 1].top) < 2) {
                    const dir = (i % 2 === 0) ? 1 : -1;
                    b.left = Math.max(4, Math.min(b.left + dir * (b.w * 0.55 + 6), hostW - b.w - 4));
                }
                b.el.style.left = b.left + 'px';
                b.el.style.top = b.top + 'px';
                b.el.style.transform = 'none';
            });
        }

        function showTip(idx) {
            if (!tipsHost || idx < 0 || idx >= n) return;
            activeTipIdx = idx;
            tipsHost.innerHTML = '';

            const svg = host.querySelector('svg');
            if (!svg) return;
            const hostRect = host.getBoundingClientRect();
            const svgRect = svg.getBoundingClientRect();
            const scaleX = svgRect.width / W;
            const scaleY = svgRect.height / H;
            const ox = svgRect.left - hostRect.left;
            const oy = svgRect.top - hostRect.top;
            const px = ptX(idx);

            if (focusLine) {
                focusLine.setAttribute('x1', px.toFixed(1));
                focusLine.setAttribute('x2', px.toFixed(1));
                focusLine.setAttribute('opacity', '1');
            }

            host.querySelectorAll('.dot-cur').forEach(function (el) {
                el.classList.toggle('is-active', Number(el.getAttribute('data-idx')) === idx);
            });

            const markers = [];
            let citySum = 0;
            let cityQtySum = 0;
            if (multiCity && seriesBuckets) {
                seriesBuckets.forEach(function (s) {
                    const amt = Number(s.buckets[idx] && s.buckets[idx].amount) || 0;
                    const qty = Number(s.buckets[idx] && s.buckets[idx].qty) || 0;
                    citySum += amt;
                    cityQtySum += qty;
                    markers.push({
                        color: s.color,
                        y: ptY(amt),
                        html: '<span class="tip-name">' + esc(s.label) + '</span> ' +
                            '<span class="tip-amt">' + money(amt) + '</span>' +
                            (showUnits ? '<span class="tip-units"> · ' + esc(formatUnits(qty)) + '</span>' : '')
                    });
                });
            } else {
                const amt = Number(cur.buckets[idx].amount) || 0;
                const qty = Number(cur.buckets[idx].qty) || 0;
                markers.push({
                    color: lineColor || 'var(--text)',
                    y: ptY(amt),
                    kind: 'cur',
                    html: '<div class="tip-when">' + esc(tipTitle(idx)) + '</div>' +
                        '<div class="tip-amt">' + money(amt) + '</div>' +
                        (showUnits ? '<div class="tip-units">' + esc(formatUnits(qty)) + '</div>' : '')
                });
                if (showPrev && prev.buckets[idx]) {
                    const prevAmt = Number(prev.buckets[idx].amount) || 0;
                    const prevQty = Number(prev.buckets[idx].qty) || 0;
                    markers.push({
                        color: '#a3a3a3',
                        y: ptY(prevAmt),
                        kind: 'prev',
                        html: '<div class="tip-prev">' + money(prevAmt) + '</div>' +
                            (showUnits ? '<div class="tip-units tip-units-prev">' + esc(formatUnits(prevQty)) + '</div>' : '')
                    });
                }
            }

            let axisBottom = 2;
            // Cabecera: fecha (+ total si multi-serie)
            const headEl = document.createElement('div');
            headEl.className = 'cortes-chart-tip tip-head';
            headEl.innerHTML = '<div class="tip-when">' + esc(tipTitle(idx)) + '</div>' +
                (multiCity
                    ? ('<div class="tip-total">' + money(citySum) + '</div>' +
                        (showUnits ? '<div class="tip-units tip-units-head">' + esc(formatUnits(cityQtySum)) + '</div>' : ''))
                    : '');
            if (multiCity) {
                tipsHost.appendChild(headEl);
                const headW = headEl.offsetWidth || 80;
                const headH = headEl.offsetHeight || 28;
                let headLeft = ox + px * scaleX - headW / 2;
                headLeft = Math.max(4, Math.min(headLeft, hostRect.width - headW - 4));
                const headTop = Math.max(2, oy + padT * scaleY - headH - 2);
                headEl.style.left = headLeft + 'px';
                headEl.style.top = headTop + 'px';
                axisBottom = headTop + headH + 4;
            }

            const boxes = [];
            markers.forEach(function (m) {
                const el = document.createElement('div');
                const isPrev = m.kind === 'prev';
                el.className = 'cortes-chart-tip tip-plain' +
                    (multiCity ? ' tip-city-plain' : (isPrev ? ' tip-prev-plain' : ' tip-single-plain'));
                if (m.color) el.style.setProperty('--tip-accent', m.color);
                el.innerHTML = m.html;
                tipsHost.appendChild(el);
                const w = el.offsetWidth || 90;
                const h = el.offsetHeight || 28;
                const left = ox + px * scaleX - w / 2;
                const top = Math.max(axisBottom, oy + m.y * scaleY - h - 8);
                boxes.push({ el: el, left: left, top: top, w: w, h: h });
            });
            placeTips(boxes);
        }

        host.onpointerleave = function (e) {
            if (e.pointerType === 'touch' || e.pointerType === 'pen') return;
            hideTip();
        };
        host.querySelectorAll('.hit-zone').forEach(function (zone) {
            const idx = Number(zone.getAttribute('data-idx'));
            zone.addEventListener('pointerenter', function (e) {
                if (e.pointerType === 'touch' || e.pointerType === 'pen') return;
                showTip(idx);
            });
            zone.addEventListener('pointerdown', function (e) {
                if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
                if (activeTipIdx === idx) hideTip();
                else showTip(idx);
            });
        });
    }

    function renderCortesChart(period, bounds, list, prevBounds, prevList, citySeries, lineColor) {
        renderRhythmChart({
            host: document.getElementById('cortesChart'),
            subEl: document.getElementById('cortesChartSub'),
            hatchId: 'cortesHatch',
            period: period,
            bounds: bounds,
            list: list,
            prevBounds: prevBounds,
            prevList: prevList,
            citySeries: citySeries || null,
            lineColor: lineColor || null
        });
    }

    function relativeSaleSub(d) {
        if (isNaN(d.getTime())) return '';
        const now = new Date();
        const startToday = startOfLocalDay(now);
        const startSale = startOfLocalDay(d);
        const dayDiff = Math.round((startToday.getTime() - startSale.getTime()) / 86400000);
        const timeStr = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        if (dayDiff === 0) return 'hoy · ' + timeStr;
        if (dayDiff === 1) return 'ayer · ' + timeStr;
        if (dayDiff > 1 && dayDiff < 7) return 'hace ' + dayDiff + ' días · ' + timeStr;
        return timeStr;
    }

    function formatInvoiceDate(d) {
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    }

    function getRecipes() {
        const data = window.S35_PANEL_DATA || {};
        return (data.recipes || []).slice().sort(function (a, b) {
            return String(a.name || '').localeCompare(String(b.name || ''), 'es');
        });
    }

    function getPriceListMeta() {
        const data = window.S35_PANEL_DATA || {};
        return data.priceList || { items: [], tiers: [], presentationNote: '' };
    }

    function priceListItems() {
        return getPriceListMeta().items || [];
    }

    /** Catálogo editable: recetas + productos de lista sin slug POS aún. */
    function pricedCatalog() {
        const byId = {};
        getRecipes().forEach(function (r) {
            byId[r.product] = {
                id: r.product,
                name: r.name,
                code: r.code || '',
                family: recipeFamily(r),
                kind: r.kind,
                recipe: r,
                fromRecipe: true
            };
        });
        priceListItems().forEach(function (it) {
            const key = it.recipeSlug || it.id;
            const kind = it.kind || 'seco';
            const listCode = it.code || '';
            if (byId[key]) {
                byId[key].presentationKg = it.presentationKg;
                byId[key].listName = it.name;
                byId[key].category = it.category;
                if (kind === 'liquido') byId[key].kind = 'liquido';
                if (it.unitLabel) byId[key].unitLabel = it.unitLabel;
                // En precios, el código de la fila de lista (Litro FT-PR / Cubeta FT-PC) manda.
                if (listCode) byId[key].code = listCode;
                return;
            }
            // Cubeta (FT-PC-NNN) empareja con ficha Litro (FT-PR-NNN) por número.
            const litCode = String(listCode || '').replace(/^FT-PC-/, 'FT-PR-');
            const sibling = listCode
                ? Object.keys(byId).map(function (k) { return byId[k]; }).filter(function (p) {
                    return p.fromRecipe && (p.code === listCode || p.code === litCode);
                })[0]
                : null;
            const fallbackFam = (sibling && recipeFamily(sibling.recipe)) || it.category || 'Lista mayorista';
            byId[it.id] = {
                id: it.id,
                name: sibling ? sibling.name : it.name,
                code: listCode,
                family: getEffectiveFamily(it.id, fallbackFam),
                kind: kind,
                recipe: sibling ? sibling.recipe : null,
                fromRecipe: false,
                presentationKg: it.presentationKg,
                unitLabel: it.unitLabel || '',
                listName: it.name,
                category: it.category
            };
        });
        return Object.keys(byId).map(function (k) { return byId[k]; }).sort(function (a, b) {
            return String(a.name || '').localeCompare(String(b.name || ''), 'es');
        });
    }

    function catalogById(id) {
        return pricedCatalog().filter(function (p) { return p.id === id; })[0] || null;
    }

    function recipeBySlug(slug) {
        return getRecipes().filter(function (x) { return x.product === slug; })[0] || null;
    }

    function liquidUnitLabel(size, explicit) {
        if (explicit) return explicit;
        if (Number(size) === 1) return 'Litro';
        if (Number(size) === 18) return 'Cubeta';
        if (size) return size + ' L';
        return 'Cubeta';
    }

    function unitFor(entryOrRecipe) {
        const r = entryOrRecipe && entryOrRecipe.recipe ? entryOrRecipe.recipe : entryOrRecipe;
        const id = entryOrRecipe && entryOrRecipe.id ? entryOrRecipe.id : (r && r.product);
        const size = presentationKgFor(id);
        const kind = (entryOrRecipe && entryOrRecipe.kind) || (r && r.kind);
        if (kind === 'liquido' || (r && r.kind === 'liquido')) {
            const list = priceListItems().filter(function (it) {
                return it.id === id || it.recipeSlug === id;
            })[0];
            return liquidUnitLabel(size, list && list.unitLabel);
        }
        if (size) return 'Saco ' + size + ' kg';
        return 'Saco';
    }

    /** Peso/empaque corto para mostrar junto al código (sin “Saco”). */
    function packSizeLabel(entryOrRecipe) {
        const r = entryOrRecipe && entryOrRecipe.recipe ? entryOrRecipe.recipe : entryOrRecipe;
        const id = entryOrRecipe && entryOrRecipe.id ? entryOrRecipe.id : (r && r.product);
        const size = presentationKgFor(id);
        if (size == null || size === '') return '';
        const kind = (entryOrRecipe && entryOrRecipe.kind) || (r && r.kind);
        if (kind === 'liquido' || (r && r.kind === 'liquido')) {
            return Number(size) === 1 ? '1 L' : (size + ' L');
        }
        return size + ' kg';
    }

    function presentationKgFor(id) {
        const entry = prices[id];
        if (entry && entry.presentationKg != null) return entry.presentationKg;
        const list = priceListItems().filter(function (it) {
            return it.id === id || it.recipeSlug === id;
        })[0];
        return list ? list.presentationKg : null;
    }

    function flatDefaultFor(r) {
        return FAMILY_DEFAULTS[recipeFamily(r)] || 400;
    }

    function sixTiers(n) {
        const v = Math.max(0, roundMoney(n));
        return [v, v, v, v, v, v];
    }

    function roundMoney(n) {
        return Math.round((Number(n) || 0) * 100) / 100;
    }

    function readDistributorPrice(raw) {
        if (!raw || typeof raw !== 'object') return null;
        if (raw.distributorPrice == null || raw.distributorPrice === '') return null;
        return Math.max(0, roundMoney(raw.distributorPrice));
    }

    function normalizeEntry(raw, fallbackTiers, presentationKg) {
        const distributorPrice = readDistributorPrice(raw);
        if (raw && typeof raw === 'object' && Array.isArray(raw.tiers) && raw.tiers.length >= 6) {
            return {
                presentationKg: raw.presentationKg != null ? raw.presentationKg : presentationKg,
                tiers: raw.tiers.slice(0, 6).map(roundMoney),
                distributorPrice: distributorPrice
            };
        }
        if (typeof raw === 'number') {
            return { presentationKg: presentationKg, tiers: sixTiers(raw), distributorPrice: null };
        }
        return {
            presentationKg: presentationKg,
            tiers: (fallbackTiers || sixTiers(400)).slice(0, 6).map(roundMoney),
            distributorPrice: distributorPrice
        };
    }

    /**
     * Escalón por unidades totales del carrito (volumen de compra).
     * En el borde inferior se aplica el descuento del tramo superior (100 → t2, etc.).
     */
    function tierIndexForQty(qty) {
        const q = Number(qty) || 0;
        if (q >= 3000) return 5;
        if (q >= 2000) return 4;
        if (q >= 1000) return 3;
        if (q >= 500) return 2;
        if (q >= 100) return 1;
        return 0;
    }

    function tierLabelForQty(qty) {
        return TIER_LABELS[tierIndexForQty(qty)] || TIER_LABELS[0];
    }

    function unitPrice(id, cartUnits) {
        const entry = prices[id];
        if (!entry || !entry.tiers) return 0;
        if (selectedClientIsDistributor()) {
            const dist = getDistributorPrice(id);
            if (dist != null) return dist;
        }
        const idx = tierIndexForQty(cartUnits);
        return roundMoney(entry.tiers[idx] != null ? entry.tiers[idx] : entry.tiers[0]);
    }

    function baseUnitPrice(id) {
        const entry = prices[id];
        if (!entry || !entry.tiers) return 0;
        return roundMoney(entry.tiers[0] || 0);
    }

    // —— Prices (tiers + kg) ——
    let prices = {};
    function seedPrices() {
        const map = {};
        priceListItems().forEach(function (it) {
            const key = it.recipeSlug || it.id;
            map[key] = {
                presentationKg: it.presentationKg,
                tiers: (it.tiers || []).slice(0, 6).map(roundMoney),
                distributorPrice: null
            };
            if (it.recipeSlug && it.recipeSlug !== it.id) {
                map[it.id] = map[key];
            }
        });
        getRecipes().forEach(function (r) {
            if (map[r.product]) return;
            const kg = r.kind === 'liquido' ? null : 25;
            map[r.product] = {
                presentationKg: kg,
                tiers: sixTiers(flatDefaultFor(r)),
                distributorPrice: null
            };
        });
        return map;
    }
    function listManagedIds() {
        const set = {};
        priceListItems().forEach(function (it) {
            set[it.id] = true;
            if (it.recipeSlug) set[it.recipeSlug] = true;
            Object.keys(PRICE_MERGE_FROM).forEach(function (dup) {
                if (PRICE_MERGE_FROM[dup] === (it.recipeSlug || it.id)) set[dup] = true;
            });
        });
        return set;
    }

    function unwrapPricesPayload(raw) {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
        let src = raw;
        if (src.map && typeof src.map === 'object' && !Array.isArray(src.map)) src = src.map;
        else if (src.byId && typeof src.byId === 'object' && !Array.isArray(src.byId)) src = src.byId;
        else if (src.items && typeof src.items === 'object' && !Array.isArray(src.items)) src = src.items;
        else if (src.value && typeof src.value === 'object' && !Array.isArray(src.value)) {
            const inner = src.value;
            const looksLikePrices = Object.keys(inner).some(function (k) {
                if (k === 'updatedAt') return false;
                const e = inner[k];
                return typeof e === 'number' ||
                    (e && typeof e === 'object' && (Array.isArray(e.tiers) || e.presentationKg != null || 'distributorPrice' in e));
            });
            if (looksLikePrices) src = inner;
        }
        const out = {};
        Object.keys(src).forEach(function (id) {
            if (id === 'updatedAt' || id === 'items' || id === 'byId' || id === 'map' || id === 'value') return;
            const e = src[id];
            if (e == null) return;
            if (typeof e === 'number' ||
                (typeof e === 'object' && (Array.isArray(e.tiers) || e.presentationKg != null || 'distributorPrice' in e))) {
                out[id] = e;
            }
        });
        return out;
    }

    function readStoredPrices() {
        try {
            const current = JSON.parse(localStorage.getItem(PRICE_KEY) || 'null');
            const currentMap = unwrapPricesPayload(current);
            if (currentMap && Object.keys(currentMap).length) {
                return { raw: currentMap, fromLegacy: false };
            }
            let legacy = JSON.parse(localStorage.getItem(PRICE_KEY_LEGACY) || 'null');
            let fromV3 = !!(legacy && typeof legacy === 'object');
            if (!fromV3) {
                legacy = JSON.parse(localStorage.getItem(PRICE_KEY_LEGACY_V2) || 'null');
            }
            const legacyMap = unwrapPricesPayload(legacy);
            if (!legacyMap || !Object.keys(legacyMap).length) return null;
            const mergeTargets = {};
            Object.keys(PRICE_MERGE_FROM).forEach(function (dup) {
                mergeTargets[PRICE_MERGE_FROM[dup]] = true;
            });
            const migrated = {};
            Object.keys(legacyMap).forEach(function (id) {
                if (PRICE_MERGE_FROM[id] || mergeTargets[id]) return;
                migrated[id] = legacyMap[id];
            });
            // Duplicados slug → canónico (solo en migración antigua v2).
            if (!fromV3) {
                Object.keys(PRICE_MERGE_FROM).forEach(function (dup) {
                    const target = PRICE_MERGE_FROM[dup];
                    if (legacyMap[dup] != null) migrated[target] = legacyMap[dup];
                });
            }
            return { raw: migrated, fromLegacy: true, reseedOfficial: true };
        } catch (_) {
            return null;
        }
    }

    function loadPrices() {
        const seed = seedPrices();
        try {
            const stored = readStoredPrices();
            if (stored && stored.raw) {
                const raw = stored.raw;
                const official = listManagedIds();
                const mergeTargets = {};
                Object.keys(PRICE_MERGE_FROM).forEach(function (dup) {
                    mergeTargets[PRICE_MERGE_FROM[dup]] = true;
                });
                Object.keys(seed).forEach(function (id) {
                    // v3→v4: forzar precios de lista oficial (corrige Basecoat 599/620, Pastablock, etc.).
                    if (stored.reseedOfficial && official[id]) return;
                    // En upgrade v2→v3: no reaplicar el precio viejo del FT si no hubo
                    // precio del duplicado; el seed ya trae el canónico.
                    if (stored.fromLegacy && mergeTargets[id] && raw[id] == null) return;
                    if (raw[id] != null) {
                        seed[id] = normalizeEntry(raw[id], seed[id].tiers, seed[id].presentationKg);
                    }
                });
                Object.keys(raw).forEach(function (id) {
                    if (stored.reseedOfficial && official[id]) return;
                    if (PRICE_MERGE_FROM[id]) return;
                    if (!seed[id]) {
                        seed[id] = normalizeEntry(raw[id], null, null);
                    }
                });
            }
        } catch (_) {}
        return seed;
    }

    function reloadPricesFromStorage() {
        prices = loadPrices();
        return prices;
    }

    /** Relee ventas/gastos/precios/promos tras soft-pull sin location.reload. */
    function reloadSyncedFromStorage() {
        prices = loadPrices();
        sales = loadSales();
        ensureCajaGastosPersisted();
        cajaGastos = loadCajaGastos();
        tesoreriaMovs = loadTesoreriaMovs();
        promoCodes = loadPromoCodes();
        ensureTesoreriaSeeds();
        refreshPosAfterDataLoad();
        return { prices: prices, sales: sales, cajaGastos: cajaGastos };
    }

    function savePrices(opts) {
        opts = opts || {};
        try {
            localStorage.setItem(PRICE_KEY, JSON.stringify(prices));
            try { localStorage.removeItem(PRICE_KEY_LEGACY); } catch (_) {}
            try { localStorage.removeItem(PRICE_KEY_LEGACY_V2); } catch (_) {}
        } catch (err) {
            console.warn('[S35] savePrices', err);
            return Promise.resolve({ ok: false, error: (err && err.message) || String(err) });
        }
        if (opts.flushCloud && window.S35PanelSync) {
            try {
                if (typeof window.S35PanelSync.schedulePush === 'function') {
                    window.S35PanelSync.schedulePush(PRICE_KEY);
                }
            } catch (_) {}
            if (typeof window.S35PanelSync.flushPush === 'function') {
                return window.S35PanelSync.flushPush().then(function (res) {
                    return res || { ok: true };
                }).catch(function (err) {
                    return { ok: false, error: (err && err.message) || String(err) };
                });
            }
        }
        return Promise.resolve({ ok: true });
    }

    /** % vs precio de lista (positivo = sobreprecio, negativo = descuento). */
    function priceDeltaPct(edited, base) {
        const b = Number(base) || 0;
        const e = Number(edited) || 0;
        if (b <= 0) return null;
        if (Math.abs(e - b) < 0.005) return 0;
        return Math.round(((e - b) / b) * 1000) / 10;
    }

    function formatPriceDeltaBadge(pct) {
        if (pct == null || Math.abs(pct) < 0.05) return '';
        const sign = pct > 0 ? '+' : '−';
        const abs = Math.abs(pct);
        const label = Math.abs(abs - Math.round(abs)) < 0.05
            ? String(Math.round(abs))
            : abs.toFixed(1);
        return sign + label + '%';
    }

    function applyCartTierPrices() {
        const units = cartQty();
        cart.forEach(function (it) {
            const list = unitPrice(it.product, units);
            it.basePrice = list;
            it.tierIndex = tierIndexForQty(units);
            /* Promo siempre lleva override (default $0); no se “limpia” al precio de lista. */
            if (it.isPromo) {
                const ov = it.priceOverride != null && isFinite(Number(it.priceOverride))
                    ? Number(it.priceOverride)
                    : 0;
                it.priceOverride = roundMoney(ov);
                it.price = it.priceOverride;
                it.priceOverridePct = priceDeltaPct(it.price, list);
            } else if (it.priceOverride != null && isFinite(Number(it.priceOverride))) {
                it.price = roundMoney(it.priceOverride);
                it.priceOverridePct = priceDeltaPct(it.price, list);
            } else {
                it.price = list;
                it.priceOverride = null;
                it.priceOverridePct = null;
            }
        });
    }

    // —— Sales ——
    let sales = [];
    /** Ventas históricas (import v3): solo en memoria; no caben en localStorage (~26 MB). */
    let historicalSales = [];
    let analyticsSalesCache = null;
    /** Gastos de caja (efectivo saliente). */
    let cajaGastos = [];
    /** Ajustes de tesorería (depósitos / retiros / correcciones), sync nube. */
    let tesoreriaMovs = [];
    let tesoreriaSeedsPromise = null;
    let dineroCityFilter = 'culiacan';
    let dineroLedgerFilter = 'all';
    let dineroLedgerQuery = '';
    let posMode = 'venta';
    let posGenerateTab = 'ticket';

    let monthAvgPriceCache = null;
    function invalidateAnalyticsSalesCache() {
        analyticsSalesCache = null;
        monthAvgPriceCache = null;
    }

    /**
     * Precio promedio del mes en curso, el mismo que el botón Mes de la ficha
     * (unitSum / unitCount de productContribution). Un solo recorrido, sin
     * concatenar el historial.
     */
    function monthAverageUnitPriceMap() {
        if (monthAvgPriceCache) return monthAvgPriceCache;
        const bounds = periodBounds('month', 0);
        const start = bounds.start.getTime();
        const end = bounds.end.getTime();
        const idToSlug = {};
        const codeToSlug = {};
        getRecipes().forEach(function (r) {
            const slug = r && r.product;
            if (!slug) return;
            const keys = productMatchKeys(slug);
            Object.keys(keys.ids).forEach(function (id) {
                if (id && !idToSlug[id]) idToSlug[id] = slug;
            });
            Object.keys(keys.codes).forEach(function (code) {
                if (code && !codeToSlug[code]) codeToSlug[code] = slug;
            });
        });
        const totals = {};
        function scan(list) {
            for (let i = 0; i < list.length; i++) {
                const sale = list[i];
                if (!sale) continue;
                const t = Date.parse(sale.createdAt);
                if (!isFinite(t) || t < start || t >= end) continue;
                const items = sale.items;
                if (!items || !items.length) continue;
                for (let j = 0; j < items.length; j++) {
                    const it = items[j];
                    if (!it) continue;
                    const slug = (it.product && idToSlug[it.product]) ||
                        (it.code && codeToSlug[String(it.code).trim()]);
                    if (!slug) continue;
                    const q = Number(it.qty) || 0;
                    if (!(q > 0)) continue;
                    const amt = lineAmount(it);
                    const price = Number(it.price) || (amt / q);
                    let row = totals[slug];
                    if (!row) totals[slug] = row = { unitSum: 0, unitCount: 0 };
                    row.unitSum += price * q;
                    row.unitCount += q;
                }
            }
        }
        scan(historicalSales);
        scan(sales);
        const map = {};
        Object.keys(totals).forEach(function (slug) {
            const row = totals[slug];
            map[slug] = row.unitCount ? row.unitSum / row.unitCount : 0;
        });
        monthAvgPriceCache = map;
        return map;
    }

    function salesForAnalytics() {
        if (!historicalSales.length) return sales;
        if (!analyticsSalesCache) {
            analyticsSalesCache = historicalSales.concat(sales);
        }
        return analyticsSalesCache;
    }

    function loadSalesRaw() {
        try {
            const raw = JSON.parse(localStorage.getItem(SALES_KEY) || 'null');
            if (raw && Array.isArray(raw.items)) return raw.items;
        } catch (_) {}
        return [];
    }
    function isActiveSaleRow(row) {
        return !!(row && row.id && !row.deleted && !isSaleEditDeleted(row.id));
    }
    function loadSales() {
        return loadSalesRaw().filter(isActiveSaleRow).map(applySaleEditPatch);
    }
    function flushCloudSoon() {
        if (!window.S35PanelSync || typeof window.S35PanelSync.flushPush !== 'function') return;
        try { window.S35PanelSync.flushPush(); } catch (_) {}
    }
    /** Persiste ventas vivas + tombstones de borrado (para que el merge-by-id no resucite). */
    function saveSales() {
        invalidateAnalyticsSalesCache();
        const tombs = loadSalesRaw().filter(function (s) {
            return s && s.id && s.deleted;
        });
        const liveIds = {};
        sales.forEach(function (s) {
            if (s && s.id) liveIds[s.id] = true;
        });
        const items = sales.slice();
        tombs.forEach(function (t) {
            if (!liveIds[t.id]) items.push(t);
        });
        localStorage.setItem(SALES_KEY, JSON.stringify({
            items: items,
            updatedAt: new Date().toISOString()
        }));
        // Subir de inmediato: el debounce solo no basta si cierran la pestaña tras una venta.
        flushCloudSoon();
    }

    function loadCajaGastosRaw() {
        try {
            const raw = JSON.parse(localStorage.getItem(CAJA_GASTOS_KEY) || 'null');
            if (raw && Array.isArray(raw.items)) return raw.items;
        } catch (_) {}
        return [];
    }
    function isActiveGastoRow(row) {
        return !!(row && row.id && !row.deleted);
    }
    function loadCajaGastos() {
        return loadCajaGastosRaw().filter(isActiveGastoRow);
    }
    function ensureCajaGastosPersisted() {
        try {
            if (localStorage.getItem(CAJA_GASTOS_KEY) == null) {
                localStorage.setItem(CAJA_GASTOS_KEY, JSON.stringify({
                    items: [],
                    updatedAt: new Date().toISOString()
                }));
                flushCloudSoon();
            }
        } catch (_) {}
    }
    function saveCajaGastos() {
        const tombs = loadCajaGastosRaw().filter(function (g) {
            return g && g.id && g.deleted;
        });
        const liveIds = {};
        cajaGastos.forEach(function (g) {
            if (g && g.id) liveIds[g.id] = true;
        });
        const items = cajaGastos.slice();
        tombs.forEach(function (t) {
            if (!liveIds[t.id]) items.push(t);
        });
        localStorage.setItem(CAJA_GASTOS_KEY, JSON.stringify({
            items: items,
            updatedAt: new Date().toISOString()
        }));
        flushCloudSoon();
    }
    function gastoCity(g) {
        return normalizeCityId((g && g.city) || 'culiacan');
    }
    function filterGastosByCity(list, cityFilter) {
        const f = cityFilter == null ? 'all' : cityFilter;
        if (!f || f === 'all') return list || [];
        const id = normalizeCityId(f);
        return (list || []).filter(function (g) { return gastoCity(g) === id; });
    }
    function gastosInRange(list, start, end) {
        return (list || []).filter(function (g) {
            const t = new Date(g.createdAt).getTime();
            if (isNaN(t)) return false;
            return t >= start.getTime() && t < end.getTime();
        });
    }
    function sumGastos(list) {
        return (list || []).reduce(function (n, g) { return n + (Number(g.amount) || 0); }, 0);
    }

    const TESORERIA_ACCOUNTS = [
        { id: 'efectivo', label: 'Efectivo' },
        { id: 'banco', label: 'Transferencias y tarjetas facturadas' },
        { id: 'tarjeta_sf', label: 'Tarjeta sin factura' }
    ];
    function tesoreriaAccountLabel(id) {
        const row = TESORERIA_ACCOUNTS.filter(function (a) { return a.id === id; })[0];
        return row ? row.label : id;
    }
    function tesoreriaAccountOfPayment(method, billing) {
        if (method === 'efectivo') return 'efectivo';
        if (method === 'transferencia') return 'banco';
        if (method === 'tarjeta') return billing === 'facturado' ? 'banco' : 'tarjeta_sf';
        return null;
    }
    function loadTesoreriaMovsRaw() {
        try {
            const raw = JSON.parse(localStorage.getItem(TESORERIA_MOVS_KEY) || 'null');
            if (raw && Array.isArray(raw.items)) return raw.items;
        } catch (_) {}
        return [];
    }
    function isActiveTesoreriaMov(row) {
        return !!(row && row.id && !row.deleted);
    }
    function loadTesoreriaMovs() {
        return loadTesoreriaMovsRaw().filter(isActiveTesoreriaMov);
    }
    function saveTesoreriaMovs() {
        const tombs = loadTesoreriaMovsRaw().filter(function (m) {
            return m && m.id && m.deleted;
        });
        const liveIds = {};
        tesoreriaMovs.forEach(function (m) {
            if (m && m.id) liveIds[m.id] = true;
        });
        const items = tesoreriaMovs.slice();
        tombs.forEach(function (t) {
            if (!liveIds[t.id]) items.push(t);
        });
        localStorage.setItem(TESORERIA_MOVS_KEY, JSON.stringify({
            items: items,
            updatedAt: new Date().toISOString()
        }));
        flushCloudSoon();
    }
    function tesoreriaMovCity(m) {
        return normalizeCityId((m && m.city) || 'culiacan');
    }
    function filterTesoreriaMovsByCity(list, cityFilter) {
        const f = cityFilter == null ? 'all' : cityFilter;
        if (!f || f === 'all') return list || [];
        const id = normalizeCityId(f);
        return (list || []).filter(function (m) { return tesoreriaMovCity(m) === id; });
    }
    function tesoreriaSignedAmount(mov) {
        const amt = roundMoney(mov && mov.amount);
        if (mov && (mov.type === 'retiro' || mov.type === 'gasto')) return -amt;
        return amt;
    }
    function tesoreriaMovLocked(m) {
        return !!(m && (m.locked || m.source === 'banorte-csv' || m.source === 'apertura' || m.type === 'apertura'));
    }
    function tesoreriaAffectsBalance(m) {
        if (!m || m.deleted) return false;
        if (m.ledgerOnly || m.source === 'banorte-csv' || m.type === 'banco_csv' || m.type === 'apertura') {
            return false;
        }
        return true;
    }
    function afterTesoreriaOpening(iso) {
        const t = Date.parse(iso || '');
        return isFinite(t) && t > TESORERIA_OPENED_AT;
    }
    function tesoreriaOpeningAmount(movs, account, cityFilter) {
        const city = cityFilter == null ? dineroCityFilter : cityFilter;
        let found = null;
        (movs || []).forEach(function (m) {
            if (m && m.type === 'apertura' && !m.ledgerOnly && m.account === account) found = m;
        });
        if (found) return roundMoney(found.amount);
        if (!city || city === 'all' || city === 'culiacan') {
            return TESORERIA_OPENING[account] || 0;
        }
        return 0;
    }
    function tesoreriaHasId(id) {
        if (!id) return false;
        if (tesoreriaMovs.some(function (m) { return m && m.id === id; })) return true;
        return loadTesoreriaMovsRaw().some(function (m) { return m && m.id === id; });
    }
    function upsertTesoreriaSeed(mov) {
        if (!mov || !mov.id || tesoreriaHasId(mov.id)) return false;
        tesoreriaMovs.push(mov);
        return true;
    }
    function tesoreriaOpeningSeeds() {
        const at = '2026-09-26T20:40:00.000Z';
        return [
            {
                id: 'teso-apertura-efectivo-20260926',
                createdAt: at,
                account: 'efectivo',
                type: 'apertura',
                amount: TESORERIA_OPENING.efectivo,
                note: 'Saldo real de caja al 26 sep 2026',
                city: 'culiacan',
                source: 'apertura',
                locked: true
            },
            {
                id: 'teso-apertura-banco-20260926',
                createdAt: at,
                account: 'banco',
                type: 'apertura',
                amount: TESORERIA_OPENING.banco,
                note: 'Saldo Banorte al 24 sep 2026',
                city: 'culiacan',
                source: 'apertura',
                locked: true
            },
            {
                id: 'teso-apertura-tarjeta-sf-20260926',
                createdAt: at,
                account: 'tarjeta_sf',
                type: 'apertura',
                amount: TESORERIA_OPENING.tarjeta_sf,
                note: 'Saldo real tarjeta sin factura al 26 sep 2026',
                city: 'culiacan',
                source: 'apertura',
                locked: true
            }
        ];
    }
    function mapBanorteSeedItem(item, bank) {
        if (!item || !item.id) return null;
        const type = item.type === 'retiro' ? 'retiro' : 'deposito';
        return {
            id: item.id,
            createdAt: item.iso || '2026-06-01T18:00:00.000Z',
            account: 'banco',
            type: type,
            amount: roundMoney(item.amount),
            note: item.descripcion || '',
            reference: item.referencia || '',
            bankSaldo: roundMoney(item.saldo),
            fecha: item.fecha || '',
            ledgerOnly: true,
            source: 'banorte-csv',
            city: (bank && bank.city) || 'culiacan',
            locked: true
        };
    }
    function applyTesoreriaSeeds(data) {
        let added = false;
        tesoreriaOpeningSeeds().forEach(function (mov) {
            if (upsertTesoreriaSeed(mov)) added = true;
        });
        if (data && Array.isArray(data.items)) {
            const bank = data.bank || TESORERIA_BANK_META;
            if (upsertTesoreriaSeed({
                id: 'banorte-saldo-inicial',
                createdAt: '2026-06-01T06:00:00.000Z',
                account: 'banco',
                type: 'apertura',
                amount: roundMoney(bank.opening != null ? bank.opening : TESORERIA_BANK_META.opening),
                note: 'Saldo inicial Banorte',
                reference: bank.account || TESORERIA_BANK_META.account,
                bankSaldo: roundMoney(bank.opening != null ? bank.opening : TESORERIA_BANK_META.opening),
                fecha: '01/06/2026',
                ledgerOnly: true,
                source: 'banorte-csv',
                city: bank.city || 'culiacan',
                locked: true
            })) added = true;
            data.items.forEach(function (item) {
                const mov = mapBanorteSeedItem(item, bank);
                if (mov && upsertTesoreriaSeed(mov)) added = true;
            });
        }
        if (added) {
            saveTesoreriaMovs();
            tesoreriaMovs = loadTesoreriaMovs();
            renderDinero();
        }
        return added;
    }
    function ensureTesoreriaSeeds() {
        if (!tesoreriaSeedsPromise) {
            tesoreriaSeedsPromise = fetch(TESORERIA_BANK_SEED_URL, { cache: 'no-store' })
                .then(function (r) { return r.ok ? r.json() : null; })
                .catch(function () { return null; });
        }
        return tesoreriaSeedsPromise.then(function (data) {
            return applyTesoreriaSeeds(data);
        });
    }
    function sumTesoreriaAdjustments(list, account) {
        return (list || []).reduce(function (n, m) {
            if (!tesoreriaAffectsBalance(m)) return n;
            if (account && m.account !== account) return n;
            return n + tesoreriaSignedAmount(m);
        }, 0);
    }
    function computeDineroAccounts(cityFilter) {
        const city = cityFilter == null ? dineroCityFilter : cityFilter;
        const list = filterSalesByCity(sales, city).filter(function (sale) {
            return afterTesoreriaOpening(sale && sale.createdAt);
        });
        const buckets = {
            efectivo: { tickets: 0, gastos: 0, ajustes: 0, apertura: 0, transfer: 0, tarjetaFact: 0, tarjetaSf: 0 },
            banco: { tickets: 0, gastos: 0, ajustes: 0, apertura: 0, transfer: 0, tarjetaFact: 0, tarjetaSf: 0 },
            tarjeta_sf: { tickets: 0, gastos: 0, ajustes: 0, apertura: 0, transfer: 0, tarjetaFact: 0, tarjetaSf: 0 }
        };
        list.forEach(function (sale) {
            const billing = sale.billing || 'sin_facturar';
            salePaymentLines(sale).forEach(function (p) {
                const account = tesoreriaAccountOfPayment(p.method, billing);
                if (!account) return;
                buckets[account].tickets = roundMoney(buckets[account].tickets + p.amount);
                if (p.method === 'transferencia') {
                    buckets[account].transfer = roundMoney(buckets[account].transfer + p.amount);
                } else if (p.method === 'tarjeta' && billing === 'facturado') {
                    buckets[account].tarjetaFact = roundMoney(buckets[account].tarjetaFact + p.amount);
                } else if (p.method === 'tarjeta') {
                    buckets[account].tarjetaSf = roundMoney(buckets[account].tarjetaSf + p.amount);
                }
            });
        });
        buckets.efectivo.gastos = roundMoney(sumGastos(
            filterGastosByCity(cajaGastos, city).filter(function (g) {
                return afterTesoreriaOpening(g && g.createdAt);
            })
        ));
        const movs = filterTesoreriaMovsByCity(tesoreriaMovs, city);
        TESORERIA_ACCOUNTS.forEach(function (acc) {
            buckets[acc.id].apertura = tesoreriaOpeningAmount(movs, acc.id, city);
            buckets[acc.id].ajustes = roundMoney(sumTesoreriaAdjustments(movs, acc.id));
            buckets[acc.id].total = roundMoney(
                buckets[acc.id].apertura + buckets[acc.id].tickets - buckets[acc.id].gastos + buckets[acc.id].ajustes
            );
        });
        return buckets;
    }
    function currentUserSnapshot() {
        let soldBy = { id: 'admin', username: 'admin', name: 'Admin', role: 'admin' };
        try {
            if (window.S35Roles && typeof window.S35Roles.userSnapshotForSale === 'function') {
                soldBy = window.S35Roles.userSnapshotForSale();
            } else if (window.S35PanelAPI && window.S35PanelAPI.getCurrentUser) {
                soldBy = window.S35Roles
                    ? window.S35Roles.userSnapshotForSale(window.S35PanelAPI.getCurrentUser())
                    : window.S35PanelAPI.getCurrentUser();
            } else {
                const u = JSON.parse(localStorage.getItem('s35_admin_user') || '{}');
                if (u.username) {
                    soldBy = {
                        id: u.id || u.username,
                        username: u.username,
                        name: u.name || u.username,
                        role: u.role || 'admin'
                    };
                }
            }
        } catch (_) {}
        return soldBy;
    }

    // —— Clients ——
    let clients = [];
    /** `client` (normal) | `distributor`. Default: client. */
    function normalizeClientType(t) {
        const v = String(t || '').toLowerCase().trim();
        if (v === 'distributor' || v === 'distribuidor') return 'distributor';
        return 'client';
    }
    function isDistributorClient(c) {
        return !!(c && normalizeClientType(c.type || c.kind) === 'distributor');
    }
    function clientTypeLabel(c) {
        return isDistributorClient(c) ? 'Distribuidor' : 'Cliente';
    }
    function selectedClientIsDistributor() {
        return isDistributorClient(clientById(selectedClientId()));
    }
    function normalizeClientRecord(c) {
        if (!c || typeof c !== 'object') return null;
        const next = Object.assign({}, c, { type: normalizeClientType(c.type || c.kind) });
        const addr = clientAddress(next);
        if (addr) next.address = addr;
        delete next.domicilio;
        delete next.localidad;
        if (!next.id || !next.name) return null;
        return next;
    }
    function loadClients() {
        try {
            const raw = JSON.parse(localStorage.getItem(CLIENTS_KEY) || 'null');
            if (raw && Array.isArray(raw.items)) {
                return raw.items.map(normalizeClientRecord).filter(Boolean);
            }
        } catch (_) {}
        return [];
    }
    function saveClientsLocal() {
        localStorage.setItem(CLIENTS_KEY, JSON.stringify({ items: clients, updatedAt: new Date().toISOString() }));
    }
    function clientsAuthHeaders() {
        const token = localStorage.getItem('s35_admin_token') || '';
        return {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
        };
    }
    let clientsPushTimer = null;
    let clientsSyncing = false;
    let clientsPushPending = false;
    function pushClientsToServer() {
        const token = localStorage.getItem('s35_admin_token') || '';
        if (!token) return Promise.resolve(false);
        if (clientsSyncing) {
            clientsPushPending = true;
            return Promise.resolve(false);
        }
        clientsSyncing = true;
        const localSnapshot = clients.slice();
        // Pull-merge before PUT so a stale tab cannot overwrite newer edits in Mongo.
        return fetch('/api/clients', {
            method: 'GET',
            headers: clientsAuthHeaders(),
            cache: 'no-store'
        })
            .then(function (r) {
                return r.json().then(function (d) { return { ok: r.ok, status: r.status, data: d }; });
            })
            .catch(function () {
                return { ok: false };
            })
            .then(function (res) {
                if (res.ok && res.data && res.data.ok && Array.isArray(res.data.items)) {
                    const remote = res.data.items.map(normalizeClientRecord).filter(Boolean);
                    clients = mergeClientLists(remote, localSnapshot);
                    saveClientsLocal();
                } else {
                    clients = localSnapshot;
                }
                return fetch('/api/clients', {
                    method: 'PUT',
                    headers: clientsAuthHeaders(),
                    body: JSON.stringify({ items: clients })
                });
            })
            .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
            .then(function (res) {
                if (!res.ok || !res.data || !res.data.ok) {
                    throw new Error((res.data && res.data.error) || 'No se pudo guardar clientes');
                }
                return true;
            })
            .catch(function (err) {
                console.warn('[S35] sync clientes', err && err.message ? err.message : err);
                return false;
            })
            .then(function (ok) {
                clientsSyncing = false;
                if (clientsPushPending) {
                    clientsPushPending = false;
                    return pushClientsToServer();
                }
                return ok;
            });
    }
    function saveClients() {
        saveClientsLocal();
        if (clientsPushTimer) clearTimeout(clientsPushTimer);
        clientsPushTimer = setTimeout(function () {
            clientsPushTimer = null;
            pushClientsToServer();
        }, 400);
    }
    function clientUpdatedAtMs(c) {
        if (!c) return 0;
        const t = Date.parse(c.updatedAt) || Date.parse(c.userEditedAt) || Date.parse(c.createdAt) || 0;
        return isNaN(t) ? 0 : t;
    }
    function clientIsUserEdited(c) {
        return !!(c && (c.userEdited || c.userEditedAt));
    }
    /** Prefer edited / newer record so stale tabs cannot clobber Mongo with dirty Excel names. */
    function preferClientRecord(a, b) {
        if (!a) return b;
        if (!b) return a;
        const aEd = clientIsUserEdited(a);
        const bEd = clientIsUserEdited(b);
        if (aEd !== bEd) return aEd ? a : b;
        return clientUpdatedAtMs(a) >= clientUpdatedAtMs(b) ? a : b;
    }
    function mergeClientLists(primary, secondary) {
        const out = (primary || []).slice();
        const byId = {};
        const byRfc = {};
        out.forEach(function (c, i) {
            byId[c.id] = i;
            const rfc = String(c.rfc || '').trim().toUpperCase();
            if (rfc) byRfc[rfc] = i;
        });
        (secondary || []).forEach(function (row) {
            const c = normalizeClientRecord(row);
            if (!c) return;
            const rfc = String(c.rfc || '').trim().toUpperCase();
            const idx = byId[c.id] != null ? byId[c.id] : (rfc && byRfc[rfc] != null ? byRfc[rfc] : -1);
            if (idx >= 0) {
                const chosen = preferClientRecord(out[idx], c);
                if (chosen !== out[idx]) {
                    const keepId = out[idx].id;
                    out[idx] = Object.assign({}, chosen, { id: keepId });
                    const chosenRfc = String(out[idx].rfc || '').trim().toUpperCase();
                    if (chosenRfc) byRfc[chosenRfc] = idx;
                }
                return;
            }
            byId[c.id] = out.length;
            if (rfc) byRfc[rfc] = out.length;
            out.push(c);
        });
        return out;
    }
    function fillEmptyClientFields(prev, incoming) {
        const merged = Object.assign({}, prev);
        let changed = false;
        const fields = ['name', 'phone', 'email', 'company', 'address', 'rfc'];
        fields.forEach(function (field) {
            const cur = String(merged[field] || '').trim();
            const nextVal = String(incoming[field] || '').trim();
            if (!cur && nextVal) {
                merged[field] = incoming[field];
                changed = true;
            }
        });
        if (prev.type === 'distributor') {
            merged.type = 'distributor';
        } else if (!merged.type && incoming.type) {
            merged.type = incoming.type;
            changed = true;
        }
        merged.id = prev.id;
        merged.createdAt = prev.createdAt || incoming.createdAt || merged.createdAt;
        if (clientIsUserEdited(prev)) {
            merged.userEdited = true;
            if (prev.userEditedAt) merged.userEditedAt = prev.userEditedAt;
        }
        delete merged.domicilio;
        delete merged.localidad;
        return { merged: merged, changed: changed };
    }
    function markClientUserEdited(record) {
        const now = new Date().toISOString();
        record.userEdited = true;
        record.userEditedAt = now;
        record.updatedAt = now;
        return record;
    }
    function refreshClientsUi() {
        fillClientSelect();
        fillHistoryClientFilter();
        renderClients();
        if (clientDashId) renderClientDashboard(clientDashId);
    }
    /** Carga el catálogo universal (Mongo / archivo) y fusiona extras locales una vez. */
    function syncClientsFromServer() {
        const token = localStorage.getItem('s35_admin_token') || '';
        if (!token) {
            return Promise.resolve({ ok: false, reason: 'no-token' });
        }
        const localCache = loadClients();
        return fetch('/api/clients', {
            method: 'GET',
            headers: clientsAuthHeaders(),
            cache: 'no-store'
        })
            .then(function (r) {
                return r.json().then(function (d) { return { ok: r.ok, status: r.status, data: d }; });
            })
            .then(function (res) {
                if (!res.ok || !res.data || !res.data.ok || !Array.isArray(res.data.items)) {
                    throw new Error((res.data && res.data.error) || ('HTTP ' + res.status));
                }
                const remote = res.data.items.map(normalizeClientRecord).filter(Boolean);
                const merged = mergeClientLists(remote, localCache);
                clients = merged;
                saveClientsLocal();
                const grew = merged.length > remote.length;
                const localHasNewer = merged.some(function (c) {
                    const rem = remote.find(function (r) { return r.id === c.id; });
                    if (!rem) return false;
                    return preferClientRecord(c, rem) === c && c !== rem &&
                        (clientIsUserEdited(c) || clientUpdatedAtMs(c) > clientUpdatedAtMs(rem));
                });
                if (grew || localHasNewer || (remote.length === 0 && merged.length > 0)) {
                    return pushClientsToServer().then(function () {
                        refreshClientsUi();
                        return { ok: true, total: clients.length, uploadedLocal: true };
                    });
                }
                refreshClientsUi();
                return { ok: true, total: clients.length, uploadedLocal: false };
            })
            .catch(function (err) {
                console.warn('[S35] pull clientes', err && err.message ? err.message : err);
                if (!clients.length && localCache.length) {
                    clients = localCache;
                    refreshClientsUi();
                }
                return { ok: false, error: err && err.message };
            });
    }
    /**
     * Merge catalog from clients-import.json.
     * Only adds missing clients or fills EMPTY fields — never overwrites name/phone/email/company/address already set
     * (protects manual edits and Mongo from dirty Excel seed data).
     */
    function importClientsCatalog() {
        return fetch('/colaboradores/data/clients-import.json', { cache: 'no-store' })
            .then(function (r) {
                if (!r.ok) throw new Error('No se pudo leer el catálogo');
                return r.json();
            })
            .then(function (data) {
                const incoming = (data && Array.isArray(data.items)) ? data.items : [];
                if (!incoming.length) {
                    toast('El archivo de importación está vacío');
                    return { added: 0, updated: 0, skipped: 0, total: clients.length };
                }
                const byRfc = {};
                const byId = {};
                clients.forEach(function (c, i) {
                    byId[c.id] = i;
                    const rfc = String(c.rfc || '').trim().toUpperCase();
                    if (rfc) byRfc[rfc] = i;
                });
                let added = 0;
                let updated = 0;
                let skipped = 0;
                const now = new Date().toISOString();
                incoming.forEach(function (row) {
                    if (!row || !row.name) return;
                    const rfc = String(row.rfc || '').trim().toUpperCase();
                    const next = {
                        id: row.id || ('cli-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
                        name: toTitleCaseName(row.name),
                        phone: String(row.phone || '').trim(),
                        email: normalizeClientEmail(row.email),
                        company: toTitleCaseName(row.company),
                        rfc: rfc,
                        type: normalizeClientType(row.type),
                        source: row.source || 'import',
                        address: toTitleCaseName(String(row.address || '').trim() || buildFiscalAddress(row.domicilio, row.localidad)),
                        updatedAt: now
                    };
                    let idx = rfc && byRfc[rfc] != null ? byRfc[rfc] : (byId[next.id] != null ? byId[next.id] : -1);
                    if (idx >= 0) {
                        const filled = fillEmptyClientFields(clients[idx], next);
                        if (filled.changed) {
                            clients[idx] = filled.merged;
                            updated += 1;
                        } else {
                            skipped += 1;
                        }
                    } else {
                        next.createdAt = now;
                        byId[next.id] = clients.length;
                        if (rfc) byRfc[rfc] = clients.length;
                        clients.push(next);
                        added += 1;
                    }
                });
                saveClients();
                renderClients();
                fillClientSelect();
                fillHistoryClientFilter();
                return { added: added, updated: updated, skipped: skipped, total: clients.length };
            });
    }

    /** Import synthetic tickets from historical-sales-import.json (v3: por nota). */
    const HIST_SALES_FLAG = 's35_hist_sales_imported_v13';
    const HIST_SALES_FLAG_LEGACY = [
        's35_hist_sales_imported_v1',
        's35_hist_sales_imported_v2',
        's35_hist_sales_imported_v3',
        's35_hist_sales_imported_v4',
        's35_hist_sales_imported_v5',
        's35_hist_sales_imported_v6',
        's35_hist_sales_imported_v7',
        's35_hist_sales_imported_v8',
        's35_hist_sales_imported_v9',
        's35_hist_sales_imported_v10',
        's35_hist_sales_imported_v11',
        's35_hist_sales_imported_v12'
    ];

    function isHistoricalImportSale(s) {
        if (!s) return false;
        if (s.user === 'import-historico') return true;
        const src = s.meta && s.meta.source;
        return src === 'old-panel';
    }

    function isExcludedHistoricalStore(sale) {
        if (!sale || !sale.meta) return false;
        const name = sale.meta.storeName;
        if (name === 'Cotizador' || name === 'Mochis') return true;
        const sid = sale.meta.storeId;
        return sid === 32 || sid === '32' || sid === 36 || sid === '36';
    }

    function purgeHistoricalImportSales() {
        const before = sales.length;
        sales = sales.filter(function (s) { return !isHistoricalImportSale(s); });
        if (before !== sales.length) {
            invalidateAnalyticsSalesCache();
            saveSales();
        }
        return before - sales.length;
    }

    function normalizeHistoricalSale(row) {
        if (!row || !row.id || !Array.isArray(row.items) || !row.items.length) return null;
        if (isSaleEditDeleted(row.id)) return null;
        if (isExcludedHistoricalStore(row)) return null;
        const base = {
            id: row.id,
            folio: row.folio || row.id,
            createdAt: row.createdAt,
            clientId: row.clientId || null,
            client: row.client || null,
            customer: row.customer || 'Histórico',
            paymentMethod: row.paymentMethod || 'transferencia',
            billing: row.billing || 'sin_facturar',
            items: row.items,
            total: Number(row.total) || 0,
            user: row.user || 'import-historico',
            meta: row.meta || { source: 'old-panel' }
        };
        if (Array.isArray(row.payments) && row.payments.length) {
            base.payments = row.payments.map(function (p) {
                return {
                    method: isValidPayMethod(p && p.method) ? p.method : 'efectivo',
                    amount: roundMoney(p && p.amount)
                };
            }).filter(function (p) { return p.amount > 0; });
            if (base.payments.length > 1) base.paymentMethod = 'mixto';
            else if (base.payments.length === 1) base.paymentMethod = base.payments[0].method;
        }
        if (row.city) base.city = row.city;
        base.city = resolveSaleCity(base);
        return applySaleEditPatch(base);
    }

    function refreshHistoricalAnalyticsUi() {
        refreshSalesDependentViews();
        renderDashboardRadar();
        renderHistory();
        renderCobranza();
    }

    function mergeHistoricalSalesById(rows, opts) {
        opts = opts || {};
        const forceTimes = !!opts.forceTimes;
        if (!rows || !rows.length) return 0;
        const byId = {};
        historicalSales.forEach(function (s, i) { byId[s.id] = i; });
        let added = 0;
        const edits = forceTimes ? loadSaleEditsMap() : null;
        let editsChanged = false;
        rows.forEach(function (row) {
            const next = normalizeHistoricalSale(row);
            if (!next) return;
            if (forceTimes && row.createdAt) {
                next.createdAt = row.createdAt;
                if (edits && edits[next.id] && !edits[next.id].deleted) {
                    edits[next.id].createdAt = row.createdAt;
                    editsChanged = true;
                }
            }
            if (byId[next.id] != null) {
                historicalSales[byId[next.id]] = next;
            } else {
                byId[next.id] = historicalSales.length;
                historicalSales.push(next);
                added += 1;
            }
        });
        if (editsChanged) saveSaleEditsMap(edits);
        if (added || rows.length) invalidateAnalyticsSalesCache();
        return added;
    }

    function importManualSalesCatchup() {
        return fetch('/colaboradores/data/manual-sales-catchup.json', { cache: 'no-store' })
            .then(function (r) {
                if (!r.ok) return { added: 0, skipped: true };
                return r.json();
            })
            .then(function (data) {
                const incoming = (data && Array.isArray(data.items)) ? data.items : [];
                if (!incoming.length) return { added: 0, skipped: true };
                const added = mergeHistoricalSalesById(incoming, { forceTimes: true });
                refreshHistoricalAnalyticsUi();
                return { added: added, total: historicalSales.length };
            });
    }

    function importHistoricalSales(opts) {
        opts = opts || {};
        const migrate = !!opts.force || !!opts.migrate;
        return fetch('/colaboradores/data/historical-sales-import.json', { cache: 'default' })
            .then(function (r) {
                if (!r.ok) throw new Error('No se pudo leer el histórico de ventas');
                return r.json();
            })
            .then(function (data) {
                const incoming = (data && Array.isArray(data.items)) ? data.items : [];
                if (!incoming.length) {
                    return { added: 0, removed: 0, total: historicalSales.length, skipped: true };
                }
                let removed = 0;
                let hadLegacyFlag = false;
                try {
                    hadLegacyFlag = HIST_SALES_FLAG_LEGACY.some(function (k) {
                        return !!localStorage.getItem(k);
                    });
                } catch (_) {}
                const importVersion = Number((data && data.importVersion) || (data && data.version) || 1);
                if (migrate || importVersion >= 2 || hadLegacyFlag) {
                    removed = purgeHistoricalImportSales();
                }
                historicalSales = incoming.map(normalizeHistoricalSale).filter(Boolean);
                invalidateAnalyticsSalesCache();
                try {
                    localStorage.setItem(HIST_SALES_FLAG, new Date().toISOString());
                    HIST_SALES_FLAG_LEGACY.forEach(function (k) {
                        localStorage.removeItem(k);
                    });
                } catch (_) {}
                return {
                    added: historicalSales.length,
                    removed: removed,
                    total: historicalSales.length,
                    importVersion: importVersion
                };
            })
            .then(function (result) {
                return importManualSalesCatchup().then(function () {
                    refreshHistoricalAnalyticsUi();
                    return result;
                }).catch(function () {
                    refreshHistoricalAnalyticsUi();
                    return result;
                });
            });
    }
    function ensureHistoricalSalesImport() {
        let needsMigration = false;
        try {
            needsMigration = !localStorage.getItem(HIST_SALES_FLAG)
                || HIST_SALES_FLAG_LEGACY.some(function (k) { return !!localStorage.getItem(k); });
        } catch (_) {}
        importHistoricalSales({ migrate: needsMigration }).catch(function () {
            importManualSalesCatchup().catch(function () { /* silencioso */ });
        });
    }

    function clientById(id) {
        if (!id) return null;
        return clients.filter(function (c) { return c.id === id; })[0] || null;
    }
    function clientDisplay(c) {
        if (!c) return 'Sin cliente';
        return c.company ? c.name + ' · ' + c.company : c.name;
    }

    // —— Finished stock (shared with panel) ——
    function finishedQty(slug) {
        try {
            const raw = JSON.parse(localStorage.getItem(FINISHED_KEY) || 'null');
            const items = raw && raw.items ? raw.items : raw;
            if (items && items[slug]) {
                return Number(items[slug].stock != null ? items[slug].stock : items[slug]) || 0;
            }
        } catch (_) {}
        if (window.S35PanelAPI && window.S35PanelAPI.getFinishedQty) {
            return window.S35PanelAPI.getFinishedQty(slug);
        }
        return 0;
    }
    function deductFinished(slug, qty) {
        if (window.S35PanelAPI && window.S35PanelAPI.deductFinished) {
            window.S35PanelAPI.deductFinished(slug, qty);
            return;
        }
        let existing = {};
        try {
            const raw = JSON.parse(localStorage.getItem(FINISHED_KEY) || 'null');
            existing = (raw && raw.items) ? raw.items : (raw || {});
        } catch (_) {}
        if (!existing[slug] || typeof existing[slug] !== 'object') {
            existing[slug] = { slug: slug, stock: 0, minStock: 0, unit: 'Pza' };
        }
        existing[slug].stock = Math.max(0, (Number(existing[slug].stock) || 0) - qty);
        localStorage.setItem(FINISHED_KEY, JSON.stringify({ items: existing, updatedAt: new Date().toISOString() }));
    }
    function saleQtyByProduct(items) {
        const map = {};
        (items || []).forEach(function (it) {
            const slug = it && String(it.product || '').trim();
            const qty = Number(it && it.qty) || 0;
            if (!slug || !(qty > 0)) return;
            map[slug] = (map[slug] || 0) + qty;
        });
        return map;
    }
    function applySaleInventoryChange(beforeItems, afterItems) {
        const before = saleQtyByProduct(beforeItems);
        const after = saleQtyByProduct(afterItems);
        const deltas = {};
        const slugs = {};
        Object.keys(before).forEach(function (k) { slugs[k] = true; });
        Object.keys(after).forEach(function (k) { slugs[k] = true; });
        Object.keys(slugs).forEach(function (slug) {
            const soldDelta = (after[slug] || 0) - (before[slug] || 0);
            if (soldDelta) deltas[slug] = -soldDelta;
        });
        if (!Object.keys(deltas).length) return;
        if (window.S35PanelAPI && window.S35PanelAPI.adjustFinishedMap) {
            window.S35PanelAPI.adjustFinishedMap(deltas);
        } else {
            Object.keys(deltas).forEach(function (slug) {
                const delta = deltas[slug];
                if (delta < 0) deductFinished(slug, -delta);
            });
        }
        if (window.S35PanelAPI && window.S35PanelAPI.refreshStockViews) {
            window.S35PanelAPI.refreshStockViews();
        }
    }

    let cart = [];
    let familyFilter = 'all';
    let priceFamilyFilter = 'all';
    let historyClientFilter = 'all';
    let historyPage = 1;
    let historyPageSize = 20;
    let historySearchTimer = null;

    function historyDateInputBounds(id) {
        const el = document.getElementById(id);
        const raw = el && el.value ? String(el.value).trim() : '';
        if (!raw) return null;
        const parts = raw.split('-');
        if (parts.length !== 3) return null;
        const y = Number(parts[0]);
        const m = Number(parts[1]);
        const d = Number(parts[2]);
        if (!y || !m || !d) return null;
        return { y: y, m: m, d: d };
    }

    function saleMatchesHistoryFilters(s, q, fromB, toB) {
        if (historyClientFilter !== 'all') {
            if (historyClientFilter === 'walkin') {
                if (s.clientId) return false;
            } else if (s.clientId !== historyClientFilter) return false;
        }
        if (fromB || toB) {
            const t = new Date(s.createdAt);
            if (isNaN(t.getTime())) return false;
            if (fromB) {
                const start = new Date(fromB.y, fromB.m - 1, fromB.d);
                if (t < start) return false;
            }
            if (toB) {
                const end = new Date(toB.y, toB.m - 1, toB.d + 1);
                if (t >= end) return false;
            }
        }
        if (!q) return true;
        const rid = saleReceiptId(s);
        const hay = [
            rid,
            rid ? ('recibo ' + rid) : '',
            rid ? ('hist-r' + rid) : '',
            saleStoreName(s),
            s.folio,
            s.customer,
            s.paymentMethod,
            s.billing,
            s.user,
            s.client && s.client.name,
            s.client && s.client.company
        ].concat((s.items || []).map(function (it) { return it.name; }))
            .join(' ').toLowerCase();
        return hay.indexOf(q) >= 0;
    }

    function filteredHistorySales() {
        const q = (document.getElementById('posHistorySearch') && document.getElementById('posHistorySearch').value || '').toLowerCase().trim();
        const fromB = historyDateInputBounds('posHistoryFrom');
        const toB = historyDateInputBounds('posHistoryTo');
        return salesForAnalytics().filter(function (s) {
            return saleMatchesHistoryFilters(s, q, fromB, toB);
        }).sort(function (a, b) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }

    function renderHistory() {
        const tbody = document.getElementById('posHistoryBody');
        if (!tbody) return;
        const list = filteredHistorySales();
        const sizeEl = document.getElementById('posHistoryPageSize');
        if (sizeEl) {
            const nextSize = Number(sizeEl.value) || 20;
            if (nextSize !== historyPageSize) {
                historyPageSize = nextSize;
                historyPage = 1;
            }
        }
        const total = list.length;
        const pages = Math.max(1, Math.ceil(total / historyPageSize) || 1);
        if (historyPage > pages) historyPage = pages;
        if (historyPage < 1) historyPage = 1;
        const start = (historyPage - 1) * historyPageSize;
        const pageItems = list.slice(start, start + historyPageSize);

        if (!total) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty">Sin ventas con estos filtros</td></tr>';
        } else {
            tbody.innerHTML = pageItems.map(function (s) {
                const d = new Date(s.createdAt);
                const dateStr = isNaN(d) ? '' : d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
                const itemsN = (s.items || []).reduce(function (n, it) { return n + (Number(it.qty) || 0); }, 0);
                const clientLabel = saleClientLabel(s);
                const origin = saleOriginLabel(s);
                return '<tr>' +
                    '<td class="muted">' + esc(dateStr) + '</td>' +
                    '<td>' + saleReceiptCellHtml(s) + '</td>' +
                    '<td>' + esc(clientLabel) + '</td>' +
                    '<td>' + formatSalePayBadgesHtml(s) + '</td>' +
                    '<td><span class="badge ' + (s.billing === 'facturado' ? 'b-success' : '') + '">' + esc(billLabel(s.billing)) + '</span></td>' +
                    '<td class="num">' + itemsN + '</td>' +
                    '<td class="num">' + money(s.total) + '</td>' +
                    '<td class="muted">' + esc(origin) + '</td>' +
                    '<td><div class="row-actions">' +
                    '<button type="button" class="icon-action" data-open-note="' + esc(s.id) + '" title="Ver nota de venta"><i class="fa-solid fa-receipt"></i></button>' +
                    '</div></td>' +
                    '</tr>';
            }).join('');
        }

        const pager = document.getElementById('posHistoryPager');
        const meta = document.getElementById('posHistoryPagerMeta');
        const pageLabel = document.getElementById('posHistoryPageLabel');
        const prevBtn = document.getElementById('posHistoryPrev');
        const nextBtn = document.getElementById('posHistoryNext');
        if (pager) pager.hidden = total === 0;
        if (meta) {
            if (!total) {
                meta.textContent = '';
            } else {
                const from = start + 1;
                const to = Math.min(start + historyPageSize, total);
                meta.textContent = from + '–' + to + ' de ' + total.toLocaleString('es-MX') + ' tickets';
            }
        }
        if (pageLabel) pageLabel.textContent = historyPage + ' / ' + pages;
        if (prevBtn) prevBtn.disabled = historyPage <= 1;
        if (nextBtn) nextBtn.disabled = historyPage >= pages;
    }
    let editingClientId = null;
    /** Índice de línea del carrito cuyo precio unitario se está editando (staff). */
    let editingPriceIdx = null;

    /** Unidades pagadas (excluye líneas de bonificación / promo). */
    function cartQty() {
        return cart.reduce(function (s, it) { return s + (it.isPromo ? 0 : it.qty); }, 0);
    }
    function cartTotal() {
        return cart.reduce(function (s, it) { return s + it.qty * it.price; }, 0);
    }

    // —— Códigos de promoción ——
    let promoCodes = [];
    /** Código aplicado al ticket actual (string normalizado) o null. */
    let appliedPromoCode = null;
    let promoAdminEditId = null;

    function defaultPalletLevels() {
        return [
            { min: 80, max: 239, giftPerPallet: 5 },
            { min: 240, max: 479, giftPerPallet: 6 },
            { min: 480, max: 959, giftPerPallet: 7 },
            { min: 960, max: 2399, giftPerPallet: 8 },
            { min: 2400, max: 4999, giftPerPallet: 10 }
        ];
    }

    function seedPromo80MAS5() {
        return {
            id: 'promo-80mas5',
            code: '80MAS5',
            label: 'Bonificación distribuidores (tarimas)',
            active: true,
            type: 'pallet_bonus',
            distributorOnly: true,
            eligibleProducts: [],
            palletSize: 80,
            levels: defaultPalletLevels(),
            notes: 'Programa Bonificaciones Distribuidores S-35: producto de regalo por tarimas completas de 80. Niveles 80+5 … 80+10.',
            updatedAt: new Date().toISOString()
        };
    }

    function normalizePromoCode(raw) {
        return String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
    }

    function normalizePromoItem(p) {
        if (!p || typeof p !== 'object') return null;
        const code = normalizePromoCode(p.code);
        if (!code) return null;
        const type = String(p.type || 'pallet_bonus').trim() || 'pallet_bonus';
        const levelsRaw = Array.isArray(p.levels) ? p.levels : [];
        const levels = levelsRaw.map(function (lv) {
            if (!lv || lv.special) return null;
            if (lv.max == null || lv.max === '' || lv.giftPerPallet == null || lv.giftPerPallet === '') return null;
            const min = Math.floor(Number(lv.min));
            const max = Math.floor(Number(lv.max));
            const gift = Math.floor(Number(lv.giftPerPallet));
            if (!isFinite(min) || !isFinite(max) || !isFinite(gift)) return null;
            if (min < 0 || max < 0 || gift < 0 || min > max) return null;
            return { min: min, max: max, giftPerPallet: gift };
        }).filter(Boolean);
        const levelsFinal = levels.length ? levels : defaultPalletLevels();
        const eligible = Array.isArray(p.eligibleProducts)
            ? p.eligibleProducts.map(function (s) { return String(s || '').trim(); }).filter(Boolean)
            : [];
        return {
            id: String(p.id || ('promo-' + Date.now().toString(36))),
            code: code,
            label: String(p.label || p.name || code).trim() || code,
            active: p.active !== false,
            type: type,
            distributorOnly: !!p.distributorOnly,
            eligibleProducts: eligible,
            palletSize: Math.max(1, Math.floor(Number(p.palletSize) || 80)),
            levels: levelsFinal,
            percentOff: p.percentOff != null && isFinite(Number(p.percentOff)) ? Number(p.percentOff) : null,
            fixedOff: p.fixedOff != null && isFinite(Number(p.fixedOff)) ? Number(p.fixedOff) : null,
            notes: String(p.notes || '').trim(),
            updatedAt: p.updatedAt || new Date().toISOString()
        };
    }

    function loadPromoCodes() {
        try {
            const raw = JSON.parse(localStorage.getItem(PROMO_CODES_KEY) || 'null');
            if (raw && Array.isArray(raw.items)) {
                return raw.items.map(normalizePromoItem).filter(Boolean);
            }
        } catch (_) {}
        return [];
    }

    function savePromoCodes() {
        localStorage.setItem(PROMO_CODES_KEY, JSON.stringify({
            items: promoCodes,
            updatedAt: new Date().toISOString()
        }));
    }

    function ensurePromoSeeds() {
        const has80 = promoCodes.some(function (p) { return p.code === '80MAS5'; });
        if (!has80) {
            promoCodes.unshift(seedPromo80MAS5());
            savePromoCodes();
        }
    }

    function promoByCode(code) {
        const c = normalizePromoCode(code);
        if (!c) return null;
        return promoCodes.filter(function (p) { return p.code === c; })[0] || null;
    }

    function promoById(id) {
        if (!id) return null;
        return promoCodes.filter(function (p) { return p.id === id; })[0] || null;
    }

    function promoTypeLabel(type) {
        if (type === 'pallet_bonus') return 'Bonificación tarimas';
        if (type === 'percent') return 'Descuento %';
        if (type === 'fixed') return 'Descuento fijo';
        return type || '—';
    }

    function isProductEligibleForPromo(promo, slug) {
        if (!promo) return false;
        if (!promo.eligibleProducts || !promo.eligibleProducts.length) return true;
        return promo.eligibleProducts.indexOf(slug) >= 0;
    }

    function eligiblePaidQty(promo) {
        return cart.reduce(function (s, it) {
            if (it.isPromo) return s;
            if (!isProductEligibleForPromo(promo, it.product)) return s;
            return s + (Number(it.qty) || 0);
        }, 0);
    }

    function findPromoLevel(promo, qty) {
        const q = Math.floor(Number(qty) || 0);
        const levels = (promo && promo.levels) || [];
        for (let i = 0; i < levels.length; i++) {
            const lv = levels[i];
            const min = Number(lv.min);
            const max = Number(lv.max);
            if (!isFinite(min) || !isFinite(max)) continue;
            if (q >= min && q <= max) return lv;
        }
        return null;
    }

    /**
     * Calcula sacos de regalo del programa por tarimas.
     * B = floor(qtyElegible / palletSize) * giftPerPallet(nivel).
     */
    function calcPalletBonus(promo, qtyEligible) {
        const palletSize = Math.max(1, Number(promo && promo.palletSize) || 80);
        const q = Math.floor(Number(qtyEligible) || 0);
        const level = findPromoLevel(promo, q);
        if (!level || q < palletSize) {
            return { giftTotal: 0, pallets: 0, giftPerPallet: 0, level: level };
        }
        const pallets = Math.floor(q / palletSize);
        const giftPerPallet = Math.max(0, Math.floor(Number(level.giftPerPallet) || 0));
        return {
            giftTotal: pallets * giftPerPallet,
            pallets: pallets,
            giftPerPallet: giftPerPallet,
            level: level
        };
    }

    /** Reparte B unidades entre productos pagados elegibles (proporcional, enteros). */
    function allocateGiftByProduct(promo, giftTotal) {
        const paid = {};
        let sum = 0;
        cart.forEach(function (it) {
            if (it.isPromo) return;
            if (!isProductEligibleForPromo(promo, it.product)) return;
            const q = Math.floor(Number(it.qty) || 0);
            if (q < 1) return;
            paid[it.product] = (paid[it.product] || 0) + q;
            sum += q;
        });
        const slugs = Object.keys(paid);
        const out = {};
        if (!slugs.length || giftTotal < 1 || sum < 1) return out;
        let assigned = 0;
        slugs.forEach(function (slug, idx) {
            if (idx === slugs.length - 1) {
                out[slug] = Math.max(0, giftTotal - assigned);
            } else {
                const n = Math.floor((giftTotal * paid[slug]) / sum);
                out[slug] = n;
                assigned += n;
            }
        });
        return out;
    }

    function stripAutoPromoLines() {
        cart = cart.filter(function (it) { return !(it.isPromo && it.promoAuto); });
    }

    /** Quita overrides de precio aplicados por códigos % / fijo. */
    function clearPromoPriceOverrides() {
        cart.forEach(function (it) {
            if (!it.promoPriceAuto) return;
            it.promoPriceAuto = false;
            it.promoCode = null;
            it.priceOverride = null;
            it.priceOverridePct = null;
        });
    }

    function applyPercentOrFixedToEligible(promo) {
        const units = cartQty();
        let affected = 0;
        cart.forEach(function (it) {
            if (it.isPromo) return;
            if (!isProductEligibleForPromo(promo, it.product)) return;
            const list = unitPrice(it.product, units);
            let next = list;
            if (promo.type === 'percent') {
                const pct = Math.max(0, Math.min(100, Number(promo.percentOff) || 0));
                next = list * (1 - pct / 100);
            } else if (promo.type === 'fixed') {
                const off = Math.max(0, Number(promo.fixedOff) || 0);
                next = Math.max(0, list - off);
            } else {
                return;
            }
            it.priceOverride = roundMoney(next);
            it.promoPriceAuto = true;
            it.promoCode = promo.code;
            affected += 1;
        });
        return affected;
    }

    function promoCartDetail(promo) {
        if (!promo) return '';
        if (promo.type === 'pallet_bonus') {
            const qtyEl = eligiblePaidQty(promo);
            const calc = calcPalletBonus(promo, qtyEl);
            return calc.giftTotal
                ? (calc.pallets + ' tarima' + (calc.pallets === 1 ? '' : 's') + ' · +' + calc.giftTotal + ' regalo')
                : 'sin tarima completa aún';
        }
        if (promo.type === 'percent') {
            const pct = Number(promo.percentOff) || 0;
            const n = eligiblePaidQty(promo);
            return '−' + pct + '% unitario · ' + n + ' u elegibles';
        }
        if (promo.type === 'fixed') {
            const off = Number(promo.fixedOff) || 0;
            const n = eligiblePaidQty(promo);
            return '−' + money(off) + ' / u · ' + n + ' u elegibles';
        }
        return promoTypeLabel(promo.type);
    }

    function syncAppliedPromoLines(opts) {
        opts = opts || {};
        const quiet = !!opts.quiet;
        stripAutoPromoLines();
        clearPromoPriceOverrides();
        if (!appliedPromoCode) {
            return { ok: true, giftTotal: 0, affected: 0 };
        }
        const promo = promoByCode(appliedPromoCode);
        if (!promo || !promo.active) {
            appliedPromoCode = null;
            if (!quiet) toast('Código de promo no válido o inactivo');
            return { ok: false, giftTotal: 0, affected: 0 };
        }
        if (promo.distributorOnly && !selectedClientIsDistributor()) {
            appliedPromoCode = null;
            if (!quiet) toast('Este código es solo para distribuidores');
            return { ok: false, giftTotal: 0, affected: 0 };
        }
        if (promo.type === 'pallet_bonus') {
            const qtyEl = eligiblePaidQty(promo);
            const calc = calcPalletBonus(promo, qtyEl);
            const gifts = allocateGiftByProduct(promo, calc.giftTotal);
            Object.keys(gifts).forEach(function (slug) {
                const gq = gifts[slug];
                if (gq < 1) return;
                const r = recipeBySlug(slug);
                if (!r) return;
                cart.push({
                    product: r.product,
                    name: r.name,
                    code: r.code || '',
                    unit: unitFor(r),
                    price: 0,
                    basePrice: unitPrice(r.product, cartQty()),
                    priceOverride: 0,
                    priceOverridePct: null,
                    isPromo: true,
                    promoAuto: true,
                    promoCode: promo.code,
                    qty: gq
                });
            });
            return { ok: true, giftTotal: calc.giftTotal, calc: calc, qtyEligible: qtyEl, affected: calc.giftTotal };
        }
        if (promo.type === 'percent' || promo.type === 'fixed') {
            if (promo.type === 'percent') {
                const pct = Number(promo.percentOff);
                if (!isFinite(pct) || pct <= 0 || pct > 100) {
                    appliedPromoCode = null;
                    if (!quiet) toast('Este código no tiene un % de descuento válido');
                    return { ok: false, giftTotal: 0, affected: 0 };
                }
            } else {
                const off = Number(promo.fixedOff);
                if (!isFinite(off) || off <= 0) {
                    appliedPromoCode = null;
                    if (!quiet) toast('Este código no tiene un monto fijo válido');
                    return { ok: false, giftTotal: 0, affected: 0 };
                }
            }
            const affected = applyPercentOrFixedToEligible(promo);
            return { ok: true, giftTotal: 0, affected: affected, qtyEligible: eligiblePaidQty(promo) };
        }
        appliedPromoCode = null;
        if (!quiet) toast('Tipo de promo no soportado: ' + promoTypeLabel(promo.type));
        return { ok: false, giftTotal: 0, affected: 0 };
    }

    function applyPromoCodeInput(rawCode) {
        const code = normalizePromoCode(rawCode);
        if (!code) {
            toast('Escribe un código de promoción');
            return false;
        }
        const promo = promoByCode(code);
        if (!promo) {
            toast('Código inválido');
            return false;
        }
        if (!promo.active) {
            toast('Código inactivo');
            return false;
        }
        if (promo.distributorOnly && !selectedClientIsDistributor()) {
            toast('Código solo para clientes distribuidores');
            return false;
        }
        if (promo.type === 'percent') {
            const pct = Number(promo.percentOff);
            if (!isFinite(pct) || pct <= 0 || pct > 100) {
                toast('Código sin % de descuento válido');
                return false;
            }
        } else if (promo.type === 'fixed') {
            const off = Number(promo.fixedOff);
            if (!isFinite(off) || off <= 0) {
                toast('Código sin monto fijo válido');
                return false;
            }
        } else if (promo.type !== 'pallet_bonus') {
            toast('Tipo de promo no soportado');
            return false;
        }
        appliedPromoCode = promo.code;
        const result = syncAppliedPromoLines({ quiet: true });
        applyCartTierPrices();
        renderCart();
        renderProducts();
        if (promo.type === 'pallet_bonus') {
            if (result.giftTotal > 0) {
                toast(promo.code + ' · +' + result.giftTotal + ' de regalo');
            } else {
                toast(promo.code + ' aplicado · agrega tarimas completas para bonificar');
            }
        } else if (promo.type === 'percent') {
            toast(promo.code + ' · −' + promo.percentOff + '% en elegibles' +
                (result.affected ? '' : ' · agrega productos'));
        } else if (promo.type === 'fixed') {
            toast(promo.code + ' · −' + money(promo.fixedOff) + ' / u' +
                (result.affected ? '' : ' · agrega productos'));
        } else {
            toast(promo.code + ' aplicado');
        }
        return true;
    }

    function clearAppliedPromoCode(opts) {
        opts = opts || {};
        const had = !!appliedPromoCode;
        appliedPromoCode = null;
        stripAutoPromoLines();
        clearPromoPriceOverrides();
        applyCartTierPrices();
        if (!opts.skipRender) {
            renderCart();
            renderProducts();
        }
        if (had && !opts.quiet) toast('Código de promo quitado');
    }

    function appliedPromo() {
        return appliedPromoCode ? promoByCode(appliedPromoCode) : null;
    }
    function selectedPay() {
        const el = document.querySelector('#venta input[name="payMethod"]:checked');
        return el ? el.value : 'efectivo';
    }
    function selectedBilling() {
        const el = document.querySelector('#venta input[name="billing"]:checked');
        return el ? el.value : 'sin_facturar';
    }
    function selectedClientId() {
        const sel = document.getElementById('posClientSelect');
        return sel && sel.value ? sel.value : '';
    }
    function isWalkinClientSelected() {
        return selectedClientId() === POS_CLIENT_WALKIN;
    }
    function hasCheckoutClientSelection() {
        return !!selectedClientId();
    }

    let clientPickerOpen = false;
    let clientPickerActiveIdx = -1;

    function syncClientTrigger() {
        const labelEl = document.getElementById('posClientTriggerLabel');
        const badgeEl = document.getElementById('posClientTriggerBadge');
        const trigger = document.getElementById('posClientTrigger');
        if (!labelEl) return;
        const id = selectedClientId();
        if (!id) {
            labelEl.textContent = 'Seleccionar cliente…';
            if (trigger) trigger.classList.add('is-placeholder');
            if (badgeEl) {
                badgeEl.hidden = true;
                badgeEl.textContent = '';
                badgeEl.classList.remove('is-dist');
            }
            return;
        }
        if (trigger) trigger.classList.remove('is-placeholder');
        if (id === POS_CLIENT_WALKIN) {
            labelEl.textContent = 'Mostrador';
            if (badgeEl) {
                badgeEl.hidden = false;
                badgeEl.textContent = 'Mostrador';
                badgeEl.classList.remove('is-dist');
            }
            return;
        }
        const client = clientById(id);
        if (!client) {
            labelEl.textContent = 'Seleccionar cliente…';
            if (trigger) trigger.classList.add('is-placeholder');
            if (badgeEl) {
                badgeEl.hidden = true;
                badgeEl.textContent = '';
                badgeEl.classList.remove('is-dist');
            }
            return;
        }
        labelEl.textContent = clientDisplay(client);
        if (badgeEl) {
            badgeEl.hidden = false;
            badgeEl.textContent = clientTypeLabel(client);
            badgeEl.classList.toggle('is-dist', isDistributorClient(client));
        }
    }

    function clientPickerHaystack(c) {
        return [c.name, c.company, c.phone, c.email, c.rfc, clientAddress(c)]
            .map(function (v) { return String(v || '').toLowerCase(); })
            .join(' ');
    }

    /** Resalta substrings del query (case-insensitive) escapando HTML. */
    function highlightClientMatch(text, query) {
        const raw = String(text == null ? '' : text);
        const q = String(query || '').trim();
        if (!q || !raw) return esc(raw);
        const lower = raw.toLowerCase();
        const qLower = q.toLowerCase();
        let out = '';
        let i = 0;
        let idx = lower.indexOf(qLower, i);
        while (idx !== -1) {
            out += esc(raw.slice(i, idx));
            out += '<mark class="pos-client-match">' + esc(raw.slice(idx, idx + q.length)) + '</mark>';
            i = idx + q.length;
            idx = lower.indexOf(qLower, i);
        }
        out += esc(raw.slice(i));
        return out;
    }

    function filteredCheckoutClients() {
        const q = (document.getElementById('posClientPickerSearch') &&
            document.getElementById('posClientPickerSearch').value || '').toLowerCase().trim();
        return clients.slice().sort(function (a, b) {
            return String(a.name).localeCompare(String(b.name), 'es');
        }).filter(function (c) {
            return !q || clientPickerHaystack(c).includes(q);
        });
    }

    function clientPickerCreateLabel(q) {
        if (q) return 'Crear «' + q + '»';
        return 'Agregar cliente';
    }

    function openQuickCreateFromPicker() {
        const q = (document.getElementById('posClientPickerSearch') &&
            document.getElementById('posClientPickerSearch').value || '').trim();
        closeClientPicker();
        openClientModal(null);
        if (q) {
            const nameEl = document.getElementById('clientName');
            if (nameEl) nameEl.value = q;
        }
    }

    function renderClientPickerList() {
        const listEl = document.getElementById('posClientPickerList');
        if (!listEl) return;
        const current = selectedClientId();
        const list = filteredCheckoutClients();
        const q = (document.getElementById('posClientPickerSearch') &&
            document.getElementById('posClientPickerSearch').value || '').trim();
        const rows = [];
        rows.push({
            id: POS_CLIENT_WALKIN,
            html: '<button type="button" class="pos-client-option' +
                (current === POS_CLIENT_WALKIN ? ' is-selected' : '') +
                '" role="option" data-client-id="' + POS_CLIENT_WALKIN + '" aria-selected="' +
                (current === POS_CLIENT_WALKIN ? 'true' : 'false') + '">' +
                '<span class="pos-client-option-name">Mostrador</span>' +
                '<span class="badge">Opción</span>' +
                '<span class="pos-client-option-meta">Venta sin cliente registrado · precio por tramos</span>' +
                '</button>'
        });
        list.forEach(function (c) {
            const dist = isDistributorClient(c);
            const metaParts = [c.company, c.phone, c.email, c.rfc].filter(Boolean);
            const metaHtml = metaParts.map(function (part) {
                return highlightClientMatch(part, q);
            }).join(' · ');
            rows.push({
                id: c.id,
                html: '<button type="button" class="pos-client-option' +
                    (current === c.id ? ' is-selected' : '') +
                    '" role="option" data-client-id="' + esc(c.id) + '" aria-selected="' +
                    (current === c.id ? 'true' : 'false') + '">' +
                    '<span class="pos-client-option-name">' + highlightClientMatch(c.name, q) + '</span>' +
                    '<span class="badge' + (dist ? ' b-primary' : '') + '">' + esc(clientTypeLabel(c)) + '</span>' +
                    (metaHtml ? '<span class="pos-client-option-meta">' + metaHtml + '</span>' : '') +
                    '</button>'
            });
        });
        let html = '';
        if (!list.length && q) {
            html = rows[0].html +
                '<div class="pos-client-option-empty">Sin coincidencias</div>';
        } else {
            html = rows.map(function (r) { return r.html; }).join('');
        }
        html += '<button type="button" class="pos-client-option pos-client-create" role="option" ' +
            'data-client-create="1" aria-selected="false">' +
            '<span class="pos-client-option-name">' +
            '<i class="fa-solid fa-plus" aria-hidden="true"></i> ' +
            esc(clientPickerCreateLabel(q)) +
            '</span>' +
            '<span class="pos-client-option-meta">Abrir alta de cliente</span>' +
            '</button>';
        listEl.innerHTML = html;
        const options = listEl.querySelectorAll('.pos-client-option');
        if (clientPickerActiveIdx < 0 || clientPickerActiveIdx >= options.length) {
            clientPickerActiveIdx = 0;
        }
        options.forEach(function (opt, i) {
            opt.classList.toggle('is-active', i === clientPickerActiveIdx);
        });
        const active = options[clientPickerActiveIdx];
        if (active && typeof active.scrollIntoView === 'function') {
            active.scrollIntoView({ block: 'nearest' });
        }
    }

    function openClientPicker() {
        const pop = document.getElementById('posClientPopover');
        const trigger = document.getElementById('posClientTrigger');
        const search = document.getElementById('posClientPickerSearch');
        if (!pop || clientPickerOpen) return;
        clientPickerOpen = true;
        pop.hidden = false;
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
        if (search) search.value = '';
        clientPickerActiveIdx = 0;
        renderClientPickerList();
        requestAnimationFrame(function () {
            if (search) search.focus();
        });
    }

    function closeClientPicker() {
        const pop = document.getElementById('posClientPopover');
        const trigger = document.getElementById('posClientTrigger');
        if (!clientPickerOpen) return;
        clientPickerOpen = false;
        if (pop) pop.hidden = true;
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        clientPickerActiveIdx = -1;
    }

    function setSelectedClientId(id, opts) {
        const sel = document.getElementById('posClientSelect');
        const next = id || '';
        if (sel) sel.value = next;
        syncClientTrigger();
        const promo = appliedPromo();
        if (promo && promo.distributorOnly && !selectedClientIsDistributor()) {
            clearAppliedPromoCode({ quiet: true, skipRender: true });
            toast('Código quitado: se requiere cliente distribuidor');
        } else if (appliedPromoCode) {
            syncAppliedPromoLines({ quiet: true });
        }
        if (!opts || opts.refresh !== false) {
            applyCartTierPrices();
            renderProducts();
            renderCart();
        }
    }

    function pickClientFromPicker(id) {
        setSelectedClientId(id);
        closeClientPicker();
    }

    function families() {
        return productFamilies.map(function (f) { return f.label; });
    }

    function defaultPosFamilyFilter() {
        const fams = families();
        if (fams.length) return fams[0];
        if (hasUncategorizedProducts()) return PRODUCT_UNCATEGORIZED_ID;
        return PRODUCT_UNCATEGORIZED_ID;
    }
    function ensurePosFamilyFilter() {
        const fams = families();
        if (familyFilter === 'all') {
            familyFilter = defaultPosFamilyFilter();
            return;
        }
        if (familyFilter === PRODUCT_UNCATEGORIZED_ID) {
            if (!hasUncategorizedProducts() && fams.length) familyFilter = fams[0];
            return;
        }
        if (fams.indexOf(familyFilter) < 0) familyFilter = defaultPosFamilyFilter();
    }
    function renderFamilyChips(containerId, activeFilter, opts) {
        const chips = document.getElementById(containerId);
        if (!chips) return;
        const includeAll = !(opts && opts.excludeAll);
        const list = (includeAll ? ['all'] : []).concat(families());
        if (hasUncategorizedProducts()) list.push(PRODUCT_UNCATEGORIZED_ID);
        if (!list.length) {
            chips.innerHTML = '';
            return;
        }
        const active = list.indexOf(activeFilter) >= 0 ? activeFilter : list[0];
        chips.innerHTML = list.map(function (f) {
            const label = f === 'all'
                ? 'Todas'
                : (f === PRODUCT_UNCATEGORIZED_ID ? PRODUCT_UNCATEGORIZED_LABEL : f);
            return '<button type="button" class="chip' + (f === active ? ' active' : '') + '" data-fam="' + esc(f) + '">' +
                familyDot(f) + esc(label) + '</button>';
        }).join('');
    }

    function renderChips() {
        ensurePosFamilyFilter();
        renderFamilyChips('posFamilyChips', familyFilter, { excludeAll: true });
    }

    function renderPriceChips() {
        renderFamilyChips('posPriceFamilyChips', priceFamilyFilter);
    }

    function filteredProducts() {
        ensurePosFamilyFilter();
        const q = (document.getElementById('posProductSearch') && document.getElementById('posProductSearch').value || '').toLowerCase().trim();
        return getRecipes().filter(function (r) {
            const fam = recipeFamily(r);
            const qOk = !q || [r.name, r.code, fam, r.product].some(function (v) {
                return String(v || '').toLowerCase().includes(q);
            });
            if (!qOk) return false;
            // Con búsqueda: todo el catálogo. Sin búsqueda: solo la familia activa.
            if (q) return true;
            return familyFilter === PRODUCT_UNCATEGORIZED_ID ? !fam : fam === familyFilter;
        });
    }

    function renderProducts() {
        const grid = document.getElementById('posProductGrid');
        if (!grid) return;
        const list = filteredProducts();
        if (!list.length) {
            const q = (document.getElementById('posProductSearch') && document.getElementById('posProductSearch').value || '').trim();
            grid.innerHTML = '<div class="empty" style="grid-column:1/-1">' +
                (q ? 'Sin resultados para “' + esc(q) + '”' : 'Sin productos en esta familia') +
                '</div>';
            return;
        }
        const cartUnits = cartQty();
        const distMode = selectedClientIsDistributor();
        grid.innerHTML = list.map(function (r) {
            const base = baseUnitPrice(r.product);
            const dist = getDistributorPrice(r.product);
            const live = unitPrice(r.product, cartUnits || 1);
            const stock = finishedQty(r.product);
            const pack = packSizeLabel(r);
            const code = r.code || r.product;
            const img = r.image
                ? '<div class="thumb"><img src="' + esc(r.image) + '" alt="' + esc(r.imageAlt || r.name) + '" loading="lazy" decoding="async"></div>'
                : '<div class="thumb"><span class="thumb-fallback">S35</span></div>';
            let priceNote = '';
            if (distMode) {
                priceNote = dist != null
                    ? '<span class="muted" style="font-size:11px">Precio distribuidores</span>'
                    : '<span class="muted" style="font-size:11px">Sin precio dist. · tramos</span>';
            } else if (cartUnits >= 100 && live !== base) {
                priceNote = '<span class="muted" style="font-size:11px">Escalón ' + esc(tierLabelForQty(cartUnits)) + '</span>';
            }
            const fam = recipeFamily(r);
            return '<button type="button" class="product-card" data-add="' + esc(r.product) + '">' +
                img +
                '<div class="pc-body">' +
                '<div class="fam">' + (fam ? familyDot(fam) : '') + esc(fam || PRODUCT_UNCATEGORIZED_LABEL) + '</div>' +
                '<div class="name">' + esc(r.name) + '</div>' +
                '<div class="meta">' +
                '<span class="unit">Inventario: <strong>' + stock + '</strong></span>' +
                '</div>' +
                priceNote +
                '<div class="muted product-code">' +
                '<span class="code">' + esc(code) + '</span>' +
                (pack ? '<span class="pack">' + esc(pack) + '</span>' : '') +
                '</div>' +
                '</div>' +
                '</button>';
        }).join('');
    }

    function fillClientSelect() {
        const sel = document.getElementById('posClientSelect');
        if (!sel) return;
        const current = sel.value;
        if (current && current !== POS_CLIENT_WALKIN && !clientById(current)) sel.value = '';
        syncClientTrigger();
        if (clientPickerOpen) renderClientPickerList();
    }

    function beginEditCartPrice(idx) {
        if (!cart[idx] || cart[idx].promoAuto || cart[idx].promoPriceAuto) return;
        editingPriceIdx = idx;
        renderCart();
        requestAnimationFrame(function () {
            const input = document.querySelector('.ci-price-input[data-price-idx="' + idx + '"]');
            if (input) {
                input.focus();
                input.select();
            }
        });
    }

    function setCartUnitPrice(idx, nextPrice) {
        if (!cart[idx] || cart[idx].promoAuto || cart[idx].promoPriceAuto) return false;
        const list = unitPrice(cart[idx].product, cartQty());
        const n = roundMoney(nextPrice);
        if (!isFinite(n) || n < 0) return false;
        if (cart[idx].isPromo) {
            cart[idx].priceOverride = n;
        } else if (Math.abs(n - list) < 0.005) {
            cart[idx].priceOverride = null;
        } else {
            cart[idx].priceOverride = n;
        }
        editingPriceIdx = null;
        applyCartTierPrices();
        renderCart();
        renderProducts();
        return true;
    }

    function commitCartPriceInput(input) {
        if (!input) return;
        const idx = Number(input.getAttribute('data-price-idx'));
        if (!cart[idx]) {
            editingPriceIdx = null;
            return;
        }
        const prev = cart[idx].price;
        const raw = String(input.value || '').trim();
        if (raw === '') {
            editingPriceIdx = null;
            renderCart();
            return;
        }
        const n = Number(raw);
        if (!isFinite(n) || n < 0) {
            input.value = String(prev);
            editingPriceIdx = null;
            renderCart();
            return;
        }
        setCartUnitPrice(idx, n);
    }

    function renderCart() {
        const body = document.getElementById('posCartBody');
        const btn = document.getElementById('posCheckoutBtn');
        const totalEl = document.getElementById('posCartTotal');
        const tierHint = document.getElementById('posCartTierHint');
        if (!body) return;
        applyCartTierPrices();
        if (editingPriceIdx != null && !cart[editingPriceIdx]) editingPriceIdx = null;
        const units = cartQty();
        const applied = appliedPromo();
        const codeBanner = document.getElementById('posCartPromoBanner');
        if (codeBanner) {
            if (applied) {
                const detail = promoCartDetail(applied);
                codeBanner.hidden = false;
                codeBanner.innerHTML =
                    '<span class="pos-promo-code-badge" title="Código interno (no se muestra al cliente)">' +
                    '<i class="fa-solid fa-percent" aria-hidden="true"></i> ' + esc(applied.code) +
                    '</span>' +
                    '<span class="pos-promo-code-detail">' + esc(detail) + '</span>' +
                    '<button type="button" class="btn ghost danger" id="posClearPromoCodeBtn" style="margin-left:auto;height:28px;padding:0 8px">Quitar</button>';
            } else {
                codeBanner.hidden = true;
                codeBanner.innerHTML = '';
            }
        }
        if (tierHint) {
            if (selectedClientIsDistributor()) {
                tierHint.textContent = units
                    ? ('Distribuidor · ' + units + ' u pagadas · precio fijo distribuidores')
                    : 'Cliente distribuidor: se aplica el precio distribuidores de cada producto';
            } else {
                tierHint.textContent = units
                    ? ('Volumen ticket: ' + units + ' u · escalón «' + tierLabelForQty(units) + '»')
                    : 'Volumen de compra: el escalón depende de las unidades totales del ticket';
            }
        }
        if (!cart.length) {
            body.innerHTML = '<div class="empty">Agrega productos del catálogo.</div>';
            if (btn) btn.disabled = true;
        } else {
            body.innerHTML = cart.map(function (it, idx) {
                const base = it.basePrice != null ? it.basePrice : it.price;
                const pct = (it.isPromo || it.priceOverride != null) ? priceDeltaPct(it.price, base) : null;
                const priceLocked = !!(it.promoAuto || it.promoPriceAuto);
                const promoBadge = (it.isPromo || it.promoPriceAuto)
                    ? ('<span class="ci-promo-badge" title="Bonificación / promo (solo staff)">' +
                        esc(it.promoCode || 'Promo') + '</span>')
                    : '';
                const badgeHtml = (!it.promoAuto && pct != null && Math.abs(pct) >= 0.05)
                    ? '<span class="ci-price-badge" title="Ajuste interno (no se muestra al cliente)">' +
                        esc(formatPriceDeltaBadge(pct)) + '</span>'
                    : '';
                const editing = !priceLocked && editingPriceIdx === idx;
                let metaHtml;
                if (it.promoAuto) {
                    metaHtml = '<div class="ci-meta"><span class="ci-unit-price" style="cursor:default">' +
                        money(it.price) + ' / ' + esc(it.unit) + '</span></div>';
                } else if (it.promoPriceAuto) {
                    metaHtml = ('<div class="ci-meta">' +
                        '<span class="ci-unit-price" style="cursor:default" title="Precio con código de promo">' +
                        money(it.price) + ' / ' + esc(it.unit) + '</span>' +
                        badgeHtml +
                        '</div>');
                } else if (editing) {
                    metaHtml = ('<div class="ci-meta ci-meta-editing">' +
                        '<input class="ci-price-input" type="number" inputmode="decimal" min="0" step="0.01" ' +
                        'data-price-idx="' + idx + '" value="' + esc(String(it.price)) + '" ' +
                        'aria-label="Precio unitario" title="Precio unitario">' +
                        '<span class="ci-price-unit">/ ' + esc(it.unit) + '</span>' +
                        badgeHtml +
                        '</div>');
                } else {
                    metaHtml = ('<div class="ci-meta">' +
                        '<button type="button" class="ci-unit-price" data-edit-price="' + idx + '" ' +
                        'title="Editar precio unitario">' + money(it.price) + ' / ' + esc(it.unit) + '</button>' +
                        badgeHtml +
                        '<button type="button" class="ci-price-pencil" data-edit-price="' + idx + '" ' +
                        'aria-label="Editar precio" title="Editar precio unitario">' +
                        '<i class="fa-solid fa-pen" aria-hidden="true"></i></button>' +
                        '</div>');
                }
                const recipe = recipeBySlug(it.product);
                const thumbHtml = (recipe && recipe.image)
                    ? ('<div class="ci-thumb" aria-hidden="true">' +
                        '<img src="' + esc(recipe.image) + '" alt="" loading="lazy" decoding="async">' +
                        '</div>')
                    : '<div class="ci-thumb" aria-hidden="true"><span class="ci-thumb-fallback">S35</span></div>';
                const itemClass = 'cart-item' +
                    (it.priceOverride != null ? ' has-price-override' : '') +
                    (it.isPromo ? ' is-promo' : '') +
                    (it.promoAuto ? ' is-promo-auto' : '') +
                    (it.promoPriceAuto ? ' is-promo-price' : '');
                const qtyRow = it.promoAuto
                    ? ('<div class="qty-row">' +
                        '<span class="qty-locked" title="Cantidad calculada por el código">' + esc(String(it.qty)) + '</span>' +
                        '<span class="muted" style="font-size:11px;margin-left:8px">Regalo (auto)</span>' +
                        '</div>')
                    : ('<div class="qty-row">' +
                        '<button type="button" class="qty-btn" data-dec="' + idx + '" aria-label="Menos">−</button>' +
                        '<input class="qty-input" type="number" inputmode="numeric" min="1" step="1" ' +
                        'data-qty="' + idx + '" value="' + esc(String(it.qty)) + '" ' +
                        'aria-label="Cantidad" title="Escribe la cantidad">' +
                        '<button type="button" class="qty-btn" data-inc="' + idx + '" aria-label="Más">+</button>' +
                        '<button type="button" class="btn ghost danger" data-rm="' + idx + '" style="margin-left:auto;height:28px;padding:0 8px">Quitar</button>' +
                        '</div>');
                return '<div class="' + itemClass + '" data-product="' + esc(it.product) + '">' +
                    thumbHtml +
                    '<div class="ci-name">' + esc(it.name) + promoBadge + '</div>' +
                    '<div class="ci-line"' + (priceLocked ? '' : ' data-edit-price="' + idx + '" title="Editar precio unitario"') + '>' +
                    money(it.qty * it.price) + '</div>' +
                    metaHtml +
                    qtyRow +
                    '</div>';
            }).join('');
            if (btn) btn.disabled = !hasCheckoutClientSelection();
        }
        if (totalEl) totalEl.textContent = money(cartTotal());
        updatePosKpis();
        refreshPosPaySplitSummary();
    }

    function setCartQty(idx, nextQty) {
        if (!cart[idx] || cart[idx].promoAuto) return false;
        const n = Math.floor(Number(nextQty));
        if (!isFinite(n) || n < 1) return false;
        cart[idx].qty = n;
        if (appliedPromoCode) syncAppliedPromoLines({ quiet: true });
        applyCartTierPrices();
        renderCart();
        renderProducts();
        return true;
    }

    function commitQtyInput(input) {
        if (!input) return;
        const idx = Number(input.getAttribute('data-qty'));
        if (!cart[idx]) return;
        const prev = cart[idx].qty;
        const raw = String(input.value || '').trim();
        if (raw === '') {
            input.value = String(prev);
            return;
        }
        const n = Math.floor(Number(raw));
        if (!isFinite(n) || n < 1) {
            input.value = String(prev);
            return;
        }
        if (n === prev) {
            input.value = String(prev);
            return;
        }
        setCartQty(idx, n);
    }

    function updatePosKpis() {
        const todayBounds = periodBounds('day', 0);
        const today = salesInRange(salesForAnalytics(), todayBounds.start, todayBounds.end);
        const todayTotal = sumTotals(today);
        const kpiT = document.getElementById('posKpiToday');
        const kpiTH = document.getElementById('posKpiTodayHint');
        if (kpiT) kpiT.textContent = money(todayTotal);
        if (kpiTH) kpiTH.textContent = today.length + (today.length === 1 ? ' venta' : ' ventas');
        renderDashboardRadar();
    }

    /** Regla fija: variación vs ayer (mismo día calendario −1). */
    function formatDashDelta(cur, prev) {
        if (prev == null || (prev === 0 && cur === 0)) {
            return { text: '—', hint: 'vs ayer · sin ventas', cls: '' };
        }
        if (prev === 0) {
            return { text: 'nuevo', hint: 'vs ayer · ' + money(0), cls: 'up' };
        }
        const d = pctDelta(cur, prev);
        const sign = d > 0 ? '+' : '';
        return {
            text: sign + d.toFixed(0) + '%',
            hint: 'vs ayer · ' + money(prev),
            cls: d > 0 ? 'up' : (d < 0 ? 'down' : '')
        };
    }

    function productAmountInSales(list, keys) {
        let amount = 0;
        list.forEach(function (s) {
            amount += productContribution(s, keys).amount;
        });
        return amount;
    }

    /** Ventana fija: últimos 7 días (incl. hoy) vs los 7 anteriores. */
    function dashMoverWindows(now) {
        now = now || new Date();
        const today = startOfLocalDay(now);
        const recentStart = addDays(today, -6);
        const recentEnd = addDays(today, 1);
        const prevStart = addDays(recentStart, -7);
        const prevEnd = recentStart;
        return {
            recent: { start: recentStart, end: recentEnd },
            prev: { start: prevStart, end: prevEnd }
        };
    }

    function computeDashMovers(limitEach) {
        limitEach = limitEach || 3;
        const win = dashMoverWindows();
        const analytics = salesForAnalytics();
        const recentSales = salesInRange(analytics, win.recent.start, win.recent.end);
        const prevSales = salesInRange(analytics, win.prev.start, win.prev.end);
        const recipes = getRecipes();
        const seen = {};
        const rows = [];
        recipes.forEach(function (r) {
            const slug = r.product;
            if (!slug || seen[slug]) return;
            seen[slug] = true;
            const keys = productMatchKeys(slug);
            const cur = productAmountInSales(recentSales, keys);
            const prev = productAmountInSales(prevSales, keys);
            if (cur === 0 && prev === 0) return;
            let pct = null;
            if (prev > 0) pct = ((cur - prev) / prev) * 100;
            else if (cur > 0) pct = Infinity;
            rows.push({
                slug: slug,
                name: r.name || slug,
                cur: cur,
                prev: prev,
                pct: pct,
                delta: cur - prev
            });
        });
        const rises = rows.filter(function (r) { return r.delta > 0; })
            .sort(function (a, b) {
                if (a.pct === Infinity && b.pct !== Infinity) return -1;
                if (b.pct === Infinity && a.pct !== Infinity) return 1;
                return (b.pct || 0) - (a.pct || 0) || b.delta - a.delta;
            })
            .slice(0, limitEach);
        const falls = rows.filter(function (r) { return r.delta < 0; })
            .sort(function (a, b) {
                return (a.pct || 0) - (b.pct || 0) || a.delta - b.delta;
            })
            .slice(0, limitEach);
        return rises.concat(falls);
    }

    function computeDashStaleProducts(limit) {
        limit = limit || 3;
        const win = dashMoverWindows();
        const recentSales = salesInRange(salesForAnalytics(), win.recent.start, win.recent.end);
        const recipes = getRecipes();
        const out = [];
        const seen = {};
        recipes.forEach(function (r) {
            const slug = r.product;
            if (!slug || seen[slug]) return;
            seen[slug] = true;
            const keys = productMatchKeys(slug);
            if (!productHasAnySales(keys)) return;
            if (productAmountInSales(recentSales, keys) > 0) return;
            out.push({ slug: slug, name: r.name || slug });
        });
        return out.slice(0, limit);
    }

    function summarizeSalesSlice(list) {
        list = list || [];
        let facturado = 0;
        let sinFacturar = 0;
        const byCity = {};
        SALE_CITIES.forEach(function (c) { byCity[c.id] = { city: c.id, label: c.label, total: 0, tickets: 0 }; });
        list.forEach(function (s) {
            const total = Number(s.total) || 0;
            const bill = s.billing || 'sin_facturar';
            if (bill === 'facturado') facturado += total;
            else sinFacturar += total;
            const cid = saleCity(s) || 'culiacan';
            if (!byCity[cid]) byCity[cid] = { city: cid, label: cityLabel(cid), total: 0, tickets: 0 };
            byCity[cid].total += total;
            byCity[cid].tickets += 1;
        });
        return {
            total: Math.round(sumTotals(list) * 100) / 100,
            tickets: list.length,
            facturado: Math.round(facturado * 100) / 100,
            sinFacturar: Math.round(sinFacturar * 100) / 100,
            byCity: Object.keys(byCity).map(function (k) {
                const row = byCity[k];
                return {
                    city: row.city,
                    label: row.label,
                    total: Math.round(row.total * 100) / 100,
                    tickets: row.tickets
                };
            }).filter(function (r) { return r.tickets > 0 || r.total > 0; })
        };
    }

    function topProductsInSales(list, limit) {
        const map = {};
        (list || []).forEach(function (s) {
            (s.items || []).forEach(function (it) {
                const slug = it.product || it.slug || it.name || 'otro';
                if (!map[slug]) map[slug] = { slug: slug, name: it.name || slug, amount: 0, units: 0 };
                map[slug].amount += Number(it.lineTotal != null ? it.lineTotal : (it.qty * it.price)) || 0;
                map[slug].units += Number(it.qty) || 0;
            });
        });
        return Object.keys(map).map(function (k) { return map[k]; })
            .sort(function (a, b) { return b.amount - a.amount; })
            .slice(0, limit || 5)
            .map(function (r) {
                return {
                    slug: r.slug,
                    name: r.name,
                    amount: Math.round(r.amount * 100) / 100,
                    units: Math.round(r.units * 100) / 100
                };
            });
    }

    function isPlaceholderClientLabel(name) {
        const n = String(name || '').trim().toLowerCase();
        if (!n) return true;
        if (n === 'mostrador' || n === 'sin cliente') return true;
        if (n.indexOf('histórico') >= 0 || n.indexOf('historico') >= 0) return true;
        if (n === 'import' || n.indexOf('importado') >= 0) return true;
        return false;
    }

    function topClientsInSales(list, limit, opts) {
        opts = opts || {};
        const excludePlaceholders = opts.excludePlaceholders !== false;
        const map = {};
        let skippedPlaceholderTickets = 0;
        let skippedPlaceholderAmount = 0;
        (list || []).forEach(function (s) {
            const name = saleClientLabel(s) || 'Mostrador';
            if (excludePlaceholders && isPlaceholderClientLabel(name) && !s.clientId && !(s.client && s.client.id)) {
                skippedPlaceholderTickets += 1;
                skippedPlaceholderAmount += Number(s.total) || 0;
                return;
            }
            const id = s.clientId || (s.client && s.client.id) || name.toLowerCase() || 'mostrador';
            if (!map[id]) map[id] = { clientId: (s.clientId || (s.client && s.client.id) || null), name: name, amount: 0, tickets: 0 };
            map[id].amount += Number(s.total) || 0;
            map[id].tickets += 1;
        });
        const items = Object.keys(map).map(function (k) { return map[k]; })
            .sort(function (a, b) { return b.amount - a.amount; })
            .slice(0, limit || 5)
            .map(function (r) {
                return {
                    clientId: r.clientId,
                    name: r.name,
                    amount: Math.round(r.amount * 100) / 100,
                    tickets: r.tickets
                };
            });
        return {
            items: items,
            meta: {
                excludedPlaceholderTickets: skippedPlaceholderTickets,
                excludedPlaceholderAmount: Math.round(skippedPlaceholderAmount * 100) / 100,
                identifiedClients: Object.keys(map).length
            }
        };
    }

    /** Contexto compacto para el copiloto (snapshot; el detalle va por tools). */
    function buildCopilotContext() {
        const analytics = salesForAnalytics();
        const todayB = periodBounds('day', 0);
        const ydayB = periodBounds('day', -1);
        const antierB = periodBounds('day', -2);
        const monthB = periodBounds('month', 0);
        const todayList = salesInRange(analytics, todayB.start, todayB.end);
        const ydayList = salesInRange(analytics, ydayB.start, ydayB.end);
        const antierList = salesInRange(analytics, antierB.start, antierB.end);
        const monthList = salesInRange(analytics, monthB.start, monthB.end);
        const today = summarizeSalesSlice(todayList);
        const yesterday = summarizeSalesSlice(ydayList);
        const dayBeforeYesterday = summarizeSalesSlice(antierList);
        const month = summarizeSalesSlice(monthList);
        const last7Days = [];
        for (let off = 0; off >= -6; off--) {
            const b = periodBounds('day', off);
            const slice = summarizeSalesSlice(salesInRange(analytics, b.start, b.end));
            last7Days.push({
                offset: off,
                label: formatPeriodLabel('day', b.start, b.end),
                date: b.start.toISOString().slice(0, 10),
                total: slice.total,
                tickets: slice.tickets
            });
        }
        const movers = (typeof computeDashMovers === 'function' ? computeDashMovers(3) : []).map(function (m) {
            return { slug: m.slug, name: m.name, delta: m.delta, pct: m.pct };
        });
        const attention = [];
        try {
            if (window.S35PanelAPI && typeof window.S35PanelAPI.getLowStockMaterials === 'function') {
                (window.S35PanelAPI.getLowStockMaterials() || []).slice(0, 5).forEach(function (m) {
                    attention.push({
                        type: 'stock',
                        name: m.name || m.id,
                        meta: 'stock ' + (m.stock != null ? m.stock : '?')
                    });
                });
            }
        } catch (_) {}
        (typeof computeDashStaleProducts === 'function' ? computeDashStaleProducts(3) : []).forEach(function (p) {
            attention.push({ type: 'stale', name: p.name, slug: p.slug });
        });
        return {
            generatedAt: new Date().toISOString(),
            source: 's35_ventas',
            note: 'Snapshot rápido. Tools para detalle. «Histórico importado» = data migrada del sistema anterior sin nombre de cliente (NO es un cliente). Offsets: 0=hoy, -1=ayer, -2=antier.',
            catalog: {
                clients: clients.length,
                tickets: analytics.length,
                historicalTickets: historicalSales.length,
                posTickets: sales.length
            },
            today: today,
            yesterday: yesterday,
            dayBeforeYesterday: dayBeforeYesterday,
            month: month,
            last7Days: last7Days,
            deltaTodayVsYesterday: {
                amount: Math.round((today.total - yesterday.total) * 100) / 100,
                tickets: today.tickets - yesterday.tickets
            },
            deltaYesterdayVsAntier: {
                amount: Math.round((yesterday.total - dayBeforeYesterday.total) * 100) / 100,
                tickets: yesterday.tickets - dayBeforeYesterday.tickets
            },
            topProductsMonth: topProductsInSales(monthList, 5),
            topClientsMonth: topClientsInSales(monthList, 5).items,
            movers7d: movers,
            attention: attention.slice(0, 8),
            cities: SALE_CITIES.map(function (c) { return { id: c.id, label: c.label, short: c.short }; })
        };
    }

    function copilotSalesFor(period, offset, city) {
        const p = ['day', 'week', 'month', 'year', 'historial'].indexOf(period) >= 0 ? period : 'day';
        const off = Number(offset);
        const o = p === 'historial' ? 0 : (isFinite(off) ? Math.trunc(off) : 0);
        const bounds = periodBounds(p, o);
        let list = salesInRange(salesForAnalytics(), bounds.start, bounds.end);
        const cityId = city && city !== 'all' ? normalizeCityId(city) : 'all';
        list = filterSalesByCity(list, cityId);
        const summary = summarizeSalesSlice(list);
        return {
            ok: true,
            period: p,
            offset: o,
            city: cityId,
            label: formatPeriodLabel(p, bounds.start, bounds.end),
            start: bounds.start.toISOString(),
            end: bounds.end.toISOString(),
            summary: summary
        };
    }

    function executeCopilotTool(name, args) {
        args = args || {};
        try {
            if (name === 'get_sales_summary') {
                return copilotSalesFor(args.period, args.offset, args.city);
            }
            if (name === 'compare_sales_periods') {
                const a = copilotSalesFor(args.period, args.offsetA, args.city);
                const b = copilotSalesFor(args.period, args.offsetB, args.city);
                const deltaAmount = Math.round((a.summary.total - b.summary.total) * 100) / 100;
                const deltaTickets = a.summary.tickets - b.summary.tickets;
                const pct = b.summary.total > 0
                    ? Math.round(((a.summary.total - b.summary.total) / b.summary.total) * 1000) / 10
                    : (a.summary.total > 0 ? null : 0);
                return {
                    ok: true,
                    period: a.period,
                    city: a.city,
                    a: a,
                    b: b,
                    delta: { amount: deltaAmount, tickets: deltaTickets, pct: pct }
                };
            }
            if (name === 'search_sales') {
                const hits = searchSales(args.query, args.limit || 8).map(function (s) {
                    const items = (s.items || []).slice(0, 12).map(function (it) {
                        const slug = it.product || null;
                        const label = it.name || it.product || 'Producto';
                        return {
                            name: label,
                            product: slug,
                            code: it.code || null,
                            qty: Number(it.qty) || 0,
                            price: Number(it.price) || 0,
                            lineTotal: Number(it.lineTotal != null ? it.lineTotal : (Number(it.qty) || 0) * (Number(it.price) || 0)) || 0,
                            open: slug ? ('[[product:' + slug + '|' + label + ']]') : null
                        };
                    });
                    const folio = s.folio || saleReceiptId(s) || s.id;
                    return {
                        id: s.id,
                        folio: s.folio || null,
                        receiptId: saleReceiptId(s) || null,
                        total: Number(s.total) || 0,
                        createdAt: s.createdAt,
                        client: saleClientLabel(s),
                        clientId: s.clientId || (s.client && s.client.id) || null,
                        city: cityLabel(saleCity(s)),
                        billing: s.billing || null,
                        paymentMethod: s.paymentMethod || null,
                        matchedVia: s._matchedVia || null,
                        items: items,
                        itemsPreview: saleItemsPreview(s),
                        open: s.id ? ('[[note:' + s.id + '|Ver nota ' + folio + ']]') : null
                    };
                });
                return { ok: true, query: args.query, results: hits };
            }
            if (name === 'lookup_client') {
                const needle = String(args.query || '').toLowerCase().trim();
                if (!needle || needle.length < 2) return { ok: false, error: 'query corta' };
                const max = Math.min(10, Number(args.limit) || 5);
                const hits = clients.filter(function (c) {
                    const blob = [c.name, c.company, c.phone, c.email, c.rfc].join(' ').toLowerCase();
                    return blob.indexOf(needle) >= 0;
                }).slice(0, max).map(function (c) {
                    const sales = salesForClient(c);
                    const total = sumTotals(sales);
                    return {
                        id: c.id,
                        name: c.name,
                        company: c.company || '',
                        rfc: c.rfc || '',
                        type: normalizeClientType(c.type),
                        phone: c.phone || '',
                        tickets: sales.length,
                        total: Math.round(total * 100) / 100,
                        open: c.id ? ('[[client:' + c.id + '|' + (c.name || 'Cliente') + ']]') : null
                    };
                });
                return { ok: true, query: args.query, results: hits };
            }
            if (name === 'top_products' || name === 'top_clients') {
                const p = ['day', 'week', 'month', 'year', 'historial'].indexOf(args.period) >= 0
                    ? args.period
                    : 'month';
                const off = Number(args.offset);
                const o = p === 'historial' ? 0 : (isFinite(off) ? Math.trunc(off) : 0);
                const bounds = periodBounds(p, o);
                let list = salesInRange(salesForAnalytics(), bounds.start, bounds.end);
                const cityId = args.city && args.city !== 'all' ? normalizeCityId(args.city) : 'all';
                list = filterSalesByCity(list, cityId);
                const limit = Math.min(25, Math.max(1, Number(args.limit) || 10));
                if (name === 'top_products') {
                    return {
                        ok: true,
                        period: p,
                        offset: o,
                        city: cityId,
                        label: formatPeriodLabel(p, bounds.start, bounds.end),
                        items: topProductsInSales(list, limit).map(function (it) {
                            return Object.assign({}, it, {
                                open: it.slug ? ('[[product:' + it.slug + '|' + (it.name || it.slug) + ']]') : null
                            });
                        })
                    };
                }
                const ranked = topClientsInSales(list, limit, { excludePlaceholders: true });
                return {
                    ok: true,
                    period: p,
                    offset: o,
                    city: cityId,
                    label: formatPeriodLabel(p, bounds.start, bounds.end),
                    items: ranked.items.map(function (it) {
                        return Object.assign({}, it, {
                            open: it.clientId ? ('[[client:' + it.clientId + '|' + (it.name || 'Cliente') + ']]') : null
                        });
                    }),
                    note: ranked.meta.excludedPlaceholderTickets
                        ? ('«Histórico importado» no es un cliente: son tickets migrados del sistema anterior sin nombre de cliente. ' +
                            'Se excluyeron ' + ranked.meta.excludedPlaceholderTickets +
                            ' de esos tickets ($' + ranked.meta.excludedPlaceholderAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 }) +
                            '). El top lista solo clientes identificados.')
                        : null,
                    meta: ranked.meta
                };
            }
            if (name === 'stock_alerts') {
                const attention = [];
                if (window.S35PanelAPI && typeof window.S35PanelAPI.getLowStockMaterials === 'function') {
                    (window.S35PanelAPI.getLowStockMaterials() || []).slice(0, 12).forEach(function (m) {
                        attention.push({
                            type: 'stock',
                            id: m.id || null,
                            name: m.name || m.id,
                            free: m.free != null ? m.free : m.stock,
                            minStock: m.minStock,
                            open: m.id ? ('[[material:' + m.id + '|' + (m.name || m.id) + ']]') : null
                        });
                    });
                }
                (typeof computeDashStaleProducts === 'function' ? computeDashStaleProducts(8) : []).forEach(function (p) {
                    attention.push({
                        type: 'stale',
                        name: p.name,
                        slug: p.slug,
                        open: p.slug ? ('[[product:' + p.slug + '|' + (p.name || p.slug) + ']]') : null
                    });
                });
                return { ok: true, alerts: attention };
            }
            if (name === 'navigate') {
                return { ok: true, queued: true, args: args };
            }
            return { ok: false, error: 'Tool desconocida: ' + name };
        } catch (err) {
            return { ok: false, error: (err && err.message) || 'Error al ejecutar tool' };
        }
    }

    function renderDashboardRadar() {
        const salesEl = document.getElementById('dashSalesToday');
        if (!salesEl) return;

        const analytics = salesForAnalytics();
        const todayBounds = periodBounds('day', 0);
        const ydayBounds = periodBounds('day', -1);
        const todayList = salesInRange(analytics, todayBounds.start, todayBounds.end);
        const ydayList = salesInRange(analytics, ydayBounds.start, ydayBounds.end);
        const todayTotal = sumTotals(todayList);
        const ydayTotal = sumTotals(ydayList);
        const delta = formatDashDelta(todayTotal, ydayTotal);

        salesEl.textContent = money(todayTotal);
        const ticketsEl = document.getElementById('dashTicketsToday');
        if (ticketsEl) ticketsEl.textContent = String(todayList.length);
        const deltaEl = document.getElementById('dashDeltaToday');
        if (deltaEl) {
            deltaEl.textContent = delta.text;
            deltaEl.classList.remove('up', 'down');
            if (delta.cls) deltaEl.classList.add(delta.cls);
        }
        const hintEl = document.getElementById('dashDeltaHint');
        if (hintEl) hintEl.textContent = delta.hint;
        const statusEl = document.getElementById('dashStatus');
        if (statusEl) {
            statusEl.textContent = todayList.length
                ? (todayList.length === 1 ? '1 venta' : todayList.length + ' ventas')
                : 'Sin ventas aún';
        }
    }

    function setCortesCityFilter(cityId) {
        if (cityId === 'all') cortesCityFilter = 'all';
        else if (cityById(cityId)) cortesCityFilter = cityId;
        else cortesCityFilter = normalizeCityId(cityId);
        renderCortes();
    }

    function normalizeSearchText(raw) {
        return String(raw || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[_/]+/g, ' ')
            .replace(/-/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function searchTokens(query) {
        const needle = normalizeSearchText(query);
        if (!needle || needle.length < 2) return [];
        return needle.split(' ').filter(function (t) { return t.length >= 2; });
    }

    function textMatchesTokens(hayRaw, tokens, needle) {
        const hay = normalizeSearchText(hayRaw);
        if (!hay) return false;
        if (needle && hay.indexOf(needle) >= 0) return true;
        if (!tokens.length) return false;
        for (let i = 0; i < tokens.length; i++) {
            if (hay.indexOf(tokens[i]) < 0) return false;
        }
        return true;
    }

    function searchSales(query, limit) {
        const needle = normalizeSearchText(query);
        if (!needle || needle.length < 2) return [];
        const tokens = searchTokens(query);
        const max = limit || 8;
        const all = salesForAnalytics();
        const out = [];
        for (let i = all.length - 1; i >= 0 && out.length < max * 4; i--) {
            const s = all[i];
            if (!s) continue;
            const folio = normalizeSearchText(s.folio);
            const id = normalizeSearchText(s.id);
            const rid = normalizeSearchText(saleReceiptId(s));
            const clientName = normalizeSearchText(saleClientLabel(s));
            const clientRfc = normalizeSearchText(
                (s.client && (s.client.rfc || s.client.RFC)) ||
                (typeof s.customer === 'object' && s.customer && s.customer.rfc) ||
                s.clientRfc ||
                ''
            );
            const cfdiFolio = normalizeSearchText((s.meta && s.meta.cfdi && s.meta.cfdi.folio) || '');
            const uuid = normalizeSearchText((s.meta && s.meta.cfdi && s.meta.cfdi.uuid) || '');
            const itemParts = (s.items || []).map(function (it) {
                return [it.name, it.product, it.code].filter(Boolean).join(' ');
            });
            const itemsHay = normalizeSearchText(itemParts.join(' '));

            let score = 0;
            let matchedVia = null;
            if (folio === needle || id === needle || cfdiFolio === needle || rid === needle) {
                score = 100;
                matchedVia = 'folio';
            } else if (
                (folio && folio.indexOf(needle) === 0) ||
                (cfdiFolio && cfdiFolio.indexOf(needle) === 0) ||
                (rid && rid.indexOf(needle) === 0)
            ) {
                score = 85;
                matchedVia = 'folio';
            } else if (
                (folio && folio.indexOf(needle) >= 0) ||
                (id && id.indexOf(needle) >= 0) ||
                (cfdiFolio && cfdiFolio.indexOf(needle) >= 0) ||
                (rid && rid.indexOf(needle) >= 0)
            ) {
                score = 70;
                matchedVia = 'folio';
            } else if (itemsHay && textMatchesTokens(itemsHay, tokens, needle)) {
                score = 80;
                matchedVia = 'product';
            } else if (clientName && textMatchesTokens(clientName, tokens, needle)) {
                score = 55;
                matchedVia = 'client';
            } else if (clientRfc && clientRfc.indexOf(needle.replace(/\s+/g, '')) >= 0) {
                score = 52;
                matchedVia = 'rfc';
            } else if (uuid && uuid.indexOf(needle.replace(/\s+/g, '')) >= 0) {
                score = 50;
                matchedVia = 'uuid';
            } else if (String(s.total || '').indexOf(needle) >= 0) {
                score = 40;
                matchedVia = 'total';
            }
            if (score <= 0) continue;
            out.push(Object.assign({}, s, { _score: score, _matchedVia: matchedVia }));
        }
        out.sort(function (a, b) {
            if (b._score !== a._score) return b._score - a._score;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        return out.slice(0, max);
    }

    function openCortesPeriod(period) {
        if (['day', 'week', 'month', 'year', 'historial'].indexOf(period) < 0) return;
        cortesPeriod = period;
        cortesOffset = 0;
        renderCortes();
    }

    /** Abre Cortes con periodo + ciudad y enfoca la gráfica. */
    function openCortesView(opts) {
        opts = opts || {};
        if (opts.period && ['day', 'week', 'month', 'year', 'historial'].indexOf(opts.period) >= 0) {
            cortesPeriod = opts.period;
            cortesOffset = 0;
        }
        if (opts.cityId != null) {
            if (opts.cityId === 'all') cortesCityFilter = 'all';
            else if (cityById(opts.cityId)) cortesCityFilter = opts.cityId;
            else cortesCityFilter = normalizeCityId(opts.cityId);
        }
        renderCortes();
        if (opts.scrollChart !== false) {
            setTimeout(function () {
                const el = document.getElementById('cortesChart') ||
                    document.querySelector('#cortes .cortes-chart-panel');
                if (el && typeof el.scrollIntoView === 'function') {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 80);
        }
    }

    function flashAddedProduct(slug) {
        const safe = String(slug || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        requestAnimationFrame(function () {
            const card = document.querySelector('.product-card[data-add="' + safe + '"]');
            if (card) {
                card.classList.remove('is-added-flash');
                void card.offsetWidth;
                card.classList.add('is-added-flash');
            }
            const lines = document.querySelectorAll('.cart-item[data-product="' + safe + '"]');
            let target = null;
            lines.forEach(function (el) {
                if (!el.classList.contains('is-promo-auto')) target = el;
            });
            if (!target && lines.length) target = lines[0];
            if (target) {
                target.classList.remove('is-just-added');
                void target.offsetWidth;
                target.classList.add('is-just-added');
                if (typeof target.scrollIntoView === 'function') {
                    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
                clearTimeout(flashAddedProduct._t);
                flashAddedProduct._t = setTimeout(function () {
                    target.classList.remove('is-just-added');
                }, 520);
            }
        });
    }

    function addToCart(slug) {
        const r = recipeBySlug(slug);
        if (!r) return;
        /* No mezclar con líneas promo del mismo producto. */
        const existing = cart.filter(function (it) { return it.product === slug && !it.isPromo; })[0];
        if (existing) existing.qty += 1;
        else {
            cart.push({
                product: r.product,
                name: r.name,
                code: r.code || '',
                unit: unitFor(r),
                price: unitPrice(r.product, cartQty() + 1),
                basePrice: unitPrice(r.product, cartQty() + 1),
                priceOverride: null,
                priceOverridePct: null,
                isPromo: false,
                qty: 1
            });
        }
        if (appliedPromoCode) syncAppliedPromoLines({ quiet: true });
        applyCartTierPrices();
        renderCart();
        renderProducts();
        flashAddedProduct(slug);
    }

    function openPromoModal() {
        const modal = document.getElementById('posPromoModal');
        const input = document.getElementById('posPromoCodeInput');
        const appliedEl = document.getElementById('posPromoAppliedHint');
        if (input) input.value = appliedPromoCode || '';
        if (appliedEl) {
            if (appliedPromoCode) {
                appliedEl.hidden = false;
                appliedEl.textContent = 'Código activo: ' + appliedPromoCode;
            } else {
                appliedEl.hidden = true;
                appliedEl.textContent = '';
            }
        }
        if (!modal) return;
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(function () {
            if (input) {
                input.focus();
                input.select();
            }
        });
    }

    function closePromoModal() {
        const modal = document.getElementById('posPromoModal');
        if (!modal) return;
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }

    function submitPromoForm(e) {
        if (e) e.preventDefault();
        const input = document.getElementById('posPromoCodeInput');
        const raw = input ? input.value : '';
        if (!applyPromoCodeInput(raw)) return;
        closePromoModal();
    }

    function refreshCartAfterLineChange() {
        if (appliedPromoCode) syncAppliedPromoLines({ quiet: true });
        applyCartTierPrices();
        renderCart();
        renderProducts();
    }

    function nextFolio() {
        return 'POS-' + String(sales.length + 1).padStart(4, '0');
    }

    /**
     * Cobra el carrito actual (o ítems pasados en opts.cartItems).
     * @param {object} [opts]
     * @param {string} [opts.backdatedDate] ISO o datetime-local → createdAt del ticket
     * @param {boolean} [opts.skipInventory] si true, no descuenta stock
     * @param {string} [opts.adminNote] nota interna de regularización
     * @param {boolean} [opts.fromGenerate] flujo «Generar» desde Historial
     * @param {Array} [opts.cartItems] líneas a cobrar sin tocar el carrito del POS
     * @param {string} [opts.clientId] cliente o «mostrador»
     * @param {string} [opts.billing]
     * @param {string} [opts.paymentMethod]
     * @param {Array} [opts.payments]
     * @param {string} [opts.city]
     */
    function checkout(opts) {
        opts = (opts && typeof opts === 'object' && !opts.type) ? opts : {};
        const fromGenerate = !!opts.fromGenerate;
        const useExternalItems = !!(opts.cartItems && opts.cartItems.length);
        const lineItems = useExternalItems ? opts.cartItems : cart;
        if (!lineItems.length) {
            if (fromGenerate) toast('Agrega al menos un producto');
            return;
        }
        const clientKey = opts.clientId != null ? String(opts.clientId || '') : selectedClientId();
        if (!clientKey) {
            toast('Selecciona un cliente (o Mostrador) antes de cobrar');
            if (!fromGenerate) openClientPicker();
            return;
        }
        const walkin = clientKey === POS_CLIENT_WALKIN;
        const client = walkin ? null : clientById(clientKey);
        if (!walkin && !client) {
            toast('Selecciona un cliente válido');
            if (!fromGenerate) openClientPicker();
            return;
        }
        const billing = opts.billing != null ? opts.billing : selectedBilling();
        if (['facturado', 'sin_facturar'].indexOf(billing) < 0) {
            toast('Elige opción de facturación');
            return;
        }
        const total = useExternalItems
            ? roundMoney(lineItems.reduce(function (n, it) {
                return n + (Number(it.qty) || 0) * (Number(it.price) || 0);
            }, 0))
            : cartTotal();
        let paymentMethod = opts.paymentMethod != null ? opts.paymentMethod : selectedPay();
        let payments = opts.payments || null;
        if (!payments) {
            if (!useExternalItems && posPaySplitEnabled()) {
                const norm = normalizePaymentLines(readPosPaySplitLines(), total);
                if (!norm.ok) {
                    toast(norm.error || 'Pago mixto inválido');
                    return;
                }
                paymentMethod = norm.paymentMethod;
                payments = norm.payments;
            } else if (!isValidPayMethod(paymentMethod)) {
                toast('Elige método de pago');
                return;
            } else {
                payments = [{ method: paymentMethod, amount: roundMoney(total) }];
            }
        }

        let createdAt = new Date().toISOString();
        let skipInventory = !!opts.skipInventory;
        let adminNote = String(opts.adminNote || '').trim();
        if (fromGenerate) {
            const atRaw = opts.backdatedDate != null ? opts.backdatedDate : '';
            if (!atRaw) {
                toast('Indica la fecha y hora del ticket');
                focusGenDatetimePair('genTicketDate', 'genTicketTime');
                return;
            }
            createdAt = isoFromDatetimeLocal(atRaw);
            skipInventory = !!opts.skipInventory;
        }

        const saleCityId = opts.city != null ? normalizeCityId(opts.city) : selectedSaleCity();
        savePreferredSaleCity(saleCityId);
        const clientSnapshot = client ? {
            id: client.id,
            name: client.name,
            phone: client.phone || '',
            email: client.email || '',
            company: client.company || '',
            rfc: client.rfc || '',
            type: normalizeClientType(client.type || client.kind)
        } : null;

        let soldBy = currentUserSnapshot();

        const ticket = {
            id: 'sale-' + Date.now().toString(36),
            folio: nextFolio(),
            createdAt: createdAt,
            clientId: client ? client.id : null,
            client: clientSnapshot,
            customer: client ? clientDisplay(client) : 'Mostrador',
            paymentMethod: paymentMethod,
            payments: payments,
            billing: billing,
            city: saleCityId,
            items: lineItems.map(function (it) {
                const row = {
                    product: it.product,
                    name: it.name,
                    code: it.code,
                    unit: it.unit,
                    price: it.price,
                    qty: it.qty,
                    lineTotal: it.qty * it.price
                };
                /* Auditoría interna (localStorage). No se incluye en nota/WA/print al cliente. */
                if (it.priceOverride != null) {
                    row.basePrice = it.basePrice;
                    row.priceOverride = it.priceOverride;
                    row.priceOverridePct = it.priceOverridePct;
                }
                if (it.isPromo) row.isPromo = true;
                if (it.promoCode) row.promoCode = it.promoCode;
                if (it.promoAuto) row.promoAuto = true;
                if (it.promoPriceAuto) row.promoPriceAuto = true;
                return row;
            }),
            total: total,
            user: soldBy,
            userId: soldBy.id,
            userName: soldBy.name || soldBy.username
        };
        if (!useExternalItems && appliedPromoCode) ticket.promoCode = appliedPromoCode;
        ticket.note = {
            id: 'note-' + ticket.id,
            folio: ticket.folio,
            createdAt: ticket.createdAt,
            generatedAt: new Date().toISOString(),
            sharePhone: clientSnapshot ? (clientSnapshot.phone || '') : '',
            shareEmail: clientSnapshot ? (clientSnapshot.email || '') : ''
        };
        if (fromGenerate || skipInventory || adminNote) {
            ticket.meta = {
                source: fromGenerate ? 'pos-generate' : 'pos',
                generatedAt: new Date().toISOString(),
                skipInventory: !!skipInventory
            };
            if (adminNote) ticket.meta.note = adminNote;
        }

        if (!skipInventory) {
            applySaleInventoryChange([], ticket.items);
        }

        sales.unshift(ticket);
        saveSales();

        if (!useExternalItems) {
            cart = [];
            appliedPromoCode = null;
            editingPriceIdx = null;
            resetPosPaySplitUi();
            const payE = document.querySelector('#venta input[name="payMethod"][value="efectivo"]');
            const billS = document.querySelector('#venta input[name="billing"][value="sin_facturar"]');
            if (payE) payE.checked = true;
            if (billS) billS.checked = true;
            setSelectedClientId('', { refresh: false });
            closeClientPicker();
            renderCart();
            renderProducts();
        }
        refreshSalesDependentViews();

        const invHint = skipInventory ? ' · sin descontar inventario' : '';
        toast((fromGenerate ? 'Ticket generado ' : 'Venta ') + ticket.folio + ' · ' + formatSalePayLabel(ticket) + ' · ' + billLabel(billing) + invHint);

        if (fromGenerate) {
            closePosGenerateModal();
            focusHistoryOnSaleDate(ticket.createdAt);
            renderHistory();
            openSaleNoteModal(ticket);
        } else {
            renderHistory();
            openSaleNoteModal(ticket);
        }
        renderCobranza();
    }

    function posPaySplitEnabled() {
        const el = document.getElementById('posPaySplit');
        return !!(el && el.checked);
    }
    function posPaySplitRowHtml(method, amount) {
        const val = amount === '' || amount == null ? '' : String(amount);
        return '<div class="pay-split-row">' +
            '<select data-pos-split-method>' + paidMethodOptionsHtml(method || 'efectivo', { excludePending: true }) + '</select>' +
            '<input type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00" data-pos-split-amount value="' + esc(val) + '">' +
            '<button type="button" class="iconbtn" data-pos-split-remove title="Quitar" aria-label="Quitar"><i class="fa-solid fa-xmark"></i></button>' +
            '</div>';
    }
    function readPosPaySplitLines() {
        const rows = document.querySelectorAll('#posPaySplitRows .pay-split-row');
        const lines = [];
        rows.forEach(function (row) {
            lines.push({
                method: ((row.querySelector('[data-pos-split-method]') || {}).value || 'efectivo'),
                amount: Number((row.querySelector('[data-pos-split-amount]') || {}).value) || 0
            });
        });
        return lines;
    }
    function refreshPosPaySplitSummary() {
        const sumEl = document.getElementById('posPaySplitSum');
        const remEl = document.getElementById('posPaySplitRemain');
        if (!sumEl || !remEl) return;
        const total = roundMoney(cartTotal());
        const sum = roundMoney(readPosPaySplitLines().reduce(function (n, p) { return n + (Number(p.amount) || 0); }, 0));
        const remain = roundMoney(total - sum);
        sumEl.textContent = money(sum);
        remEl.textContent = money(remain);
        remEl.classList.toggle('is-ok', Math.abs(remain) < 0.01);
        remEl.classList.toggle('is-bad', Math.abs(remain) >= 0.01);
    }
    function syncPosPaySplitUi() {
        const on = posPaySplitEnabled();
        const panel = document.getElementById('posPaySplitPanel');
        const seg = document.getElementById('posPaySeg');
        if (panel) panel.hidden = !on;
        if (seg) seg.classList.toggle('is-disabled', on);
        if (on) {
            const rows = document.getElementById('posPaySplitRows');
            if (rows && !rows.children.length) {
                rows.innerHTML = posPaySplitRowHtml('tarjeta', '') + posPaySplitRowHtml('efectivo', '');
            }
            refreshPosPaySplitSummary();
        }
    }
    function resetPosPaySplitUi() {
        const cb = document.getElementById('posPaySplit');
        if (cb) cb.checked = false;
        const rows = document.getElementById('posPaySplitRows');
        if (rows) rows.innerHTML = '';
        syncPosPaySplitUi();
    }

    function renderBreakdownRows(containerId, barId, rows, total) {
        const rowsEl = document.getElementById(containerId);
        const barEl = document.getElementById(barId);
        if (!rowsEl) return;
        if (!rows.length || !total) {
            rowsEl.innerHTML = '<div class="cortes-empty">Sin datos en este periodo</div>';
            if (barEl) barEl.innerHTML = '';
            return;
        }
        if (barEl) {
            barEl.innerHTML = rows.map(function (r) {
                const pct = Math.max(0, (r.amount / total) * 100);
                return '<span class="seg-' + esc(r.key) + '" style="width:' + pct + '%" title="' + esc(r.label) + '"></span>';
            }).join('');
        }
        rowsEl.innerHTML = rows.map(function (r) {
            return '<div class="cortes-row">' +
                '<div class="left"><span class="dot ' + esc(r.key) + '"></span><span class="name">' + esc(r.label) + '</span></div>' +
                '<span class="amt">' + money(r.amount) + '</span>' +
                '</div>';
        }).join('');
    }

    /**
     * Método de pago en Cortes: desglose por método + neto de efectivo
     * (efectivo cobrado − gastos de caja = total efectivo).
     */
    function renderCortesPayBreakdown(payRows, total, efectivoCobrado, gastosTotal) {
        const rowsEl = document.getElementById('cortesPayRows');
        const barEl = document.getElementById('cortesPayBar');
        if (!rowsEl) return;

        const gastos = roundMoney(gastosTotal);
        const cobrado = roundMoney(efectivoCobrado);
        const totalEfectivo = roundMoney(cobrado - gastos);
        const hasCashDetail = cobrado > 0 || gastos > 0;
        const otherRows = (payRows || []).filter(function (r) { return r.key !== 'efectivo'; });
        const barRows = [];
        if (hasCashDetail) {
            barRows.push({
                key: 'efectivo',
                label: 'Total efectivo',
                amount: Math.max(0, totalEfectivo)
            });
        }
        otherRows.forEach(function (r) { barRows.push(r); });

        if (!barRows.length && !hasCashDetail) {
            rowsEl.innerHTML = '<div class="cortes-empty">Sin datos en este periodo</div>';
            if (barEl) barEl.innerHTML = '';
            return;
        }

        const barBase = total > 0 ? total : (barRows.reduce(function (n, r) { return n + r.amount; }, 0) || 1);
        if (barEl) {
            barEl.innerHTML = barRows.filter(function (r) { return r.amount > 0; }).map(function (r) {
                const pct = Math.max(0, (r.amount / barBase) * 100);
                return '<span class="seg-' + esc(r.key) + '" style="width:' + pct + '%" title="' + esc(r.label) + '"></span>';
            }).join('');
        }

        let html = '';
        if (hasCashDetail) {
            html += '<div class="cortes-group">' +
                '<div class="cortes-row is-sub">' +
                '<div class="left"><span class="dot efectivo"></span><span class="name">Efectivo cobrado</span></div>' +
                '<span class="amt">' + money(cobrado) + '</span>' +
                '</div>' +
                '<div class="cortes-row is-sub is-cash-expense">' +
                '<div class="left"><span class="dot por_cobrar"></span><span class="name">Gastos de caja</span></div>' +
                '<span class="amt">−' + money(gastos) + '</span>' +
                '</div>' +
                '<div class="cortes-row is-group is-cash-total">' +
                '<div class="left"><span class="dot efectivo"></span><span class="name">Total efectivo</span></div>' +
                '<span class="amt">' + money(totalEfectivo) + '</span>' +
                '</div>' +
                '</div>';
        }
        html += otherRows.map(function (r) {
            return '<div class="cortes-row">' +
                '<div class="left"><span class="dot ' + esc(r.key) + '"></span><span class="name">' + esc(r.label) + '</span></div>' +
                '<span class="amt">' + money(r.amount) + '</span>' +
                '</div>';
        }).join('');
        rowsEl.innerHTML = html || '<div class="cortes-empty">Sin datos en este periodo</div>';
    }

    function setPosMode(mode) {
        posMode = mode === 'gastos' ? 'gastos' : 'venta';
        document.querySelectorAll('#posModeTabs [data-pos-mode]').forEach(function (btn) {
            const active = btn.getAttribute('data-pos-mode') === posMode;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        const ventaPanel = document.getElementById('posModeVenta');
        const gastosPanel = document.getElementById('posModeGastos');
        if (ventaPanel) ventaPanel.hidden = posMode !== 'venta';
        if (gastosPanel) gastosPanel.hidden = posMode !== 'gastos';
        if (posMode === 'gastos') {
            syncGastoCityControl();
            renderGastosPanel();
        }
    }

    let genClientPickerOpen = false;
    let genClientPickerActiveIdx = -1;
    let genProductPickerRow = null;
    let genProductPickerActiveIdx = -1;

    function genProductPickerHtml(selectedId) {
        const id = selectedId || '';
        const cat = id ? catalogById(id) : null;
        const r = id && !cat ? recipeBySlug(id) : null;
        const label = cat ? cat.name : (r ? r.name : (id || 'Producto…'));
        const isEmpty = !id;
        return '<div class="pos-client-picker gen-product-picker">' +
            '<input type="hidden" class="gen-product" data-gen-field="product" value="' + esc(id) + '" autocomplete="off">' +
            '<button type="button" class="pos-client-trigger gen-product-trigger' +
            (isEmpty ? ' is-placeholder' : '') + '"' +
            ' aria-haspopup="listbox" aria-expanded="false" aria-label="Buscar producto">' +
            '<span class="pos-client-trigger-text">' +
            '<span class="pos-client-trigger-label">' + esc(label) + '</span>' +
            '</span>' +
            '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
            '</button>' +
            '<div class="pos-client-popover gen-product-popover" hidden role="dialog" aria-label="Buscar producto">' +
            '<div class="pos-client-search-wrap">' +
            '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
            '<input type="search" class="pos-client-search gen-product-search"' +
            ' placeholder="Nombre o código…" autocomplete="off" aria-autocomplete="list">' +
            '</div>' +
            '<div class="pos-client-list gen-product-list" role="listbox"></div>' +
            '</div></div>';
    }

    function genTicketLineRowHtml(it, idx) {
        it = it || {};
        const qty = Number(it.qty) || 1;
        const price = Number(it.price) || 0;
        const line = it.lineTotal != null ? Number(it.lineTotal) : qty * price;
        return '<tr data-gen-idx="' + idx + '">' +
            '<td>' + genProductPickerHtml(it.product || '') + '</td>' +
            '<td><input type="text" data-gen-field="name" value="' + esc(it.name || '') + '" placeholder="Descripción"></td>' +
            '<td class="num"><input class="gen-qty" type="number" min="0" step="any" data-gen-field="qty" value="' + esc(String(qty)) + '"></td>' +
            '<td class="num"><input class="gen-price" type="number" min="0" step="0.01" data-gen-field="price" value="' + esc(String(price)) + '"></td>' +
            '<td class="num gen-line">' + money(line) + '</td>' +
            '<td><button type="button" class="icon-action danger" data-gen-remove title="Quitar línea"><i class="fa-solid fa-trash-can"></i></button></td>' +
            '</tr>';
    }

    function syncGenTicketClientTrigger() {
        const labelEl = document.getElementById('genTicketClientTriggerLabel');
        const badgeEl = document.getElementById('genTicketClientTriggerBadge');
        const trigger = document.getElementById('genTicketClientTrigger');
        const hid = document.getElementById('genTicketClient');
        if (!labelEl || !hid) return;
        const id = hid.value || POS_CLIENT_WALKIN;
        if (trigger) trigger.classList.remove('is-placeholder');
        if (id === POS_CLIENT_WALKIN || !id) {
            labelEl.textContent = 'Mostrador';
            if (badgeEl) {
                badgeEl.hidden = false;
                badgeEl.textContent = 'Mostrador';
                badgeEl.classList.remove('is-dist');
            }
            return;
        }
        const client = clientById(id);
        if (!client) {
            hid.value = POS_CLIENT_WALKIN;
            labelEl.textContent = 'Mostrador';
            if (badgeEl) {
                badgeEl.hidden = false;
                badgeEl.textContent = 'Mostrador';
                badgeEl.classList.remove('is-dist');
            }
            return;
        }
        labelEl.textContent = clientDisplay(client);
        if (badgeEl) {
            badgeEl.hidden = false;
            badgeEl.textContent = clientTypeLabel(client);
            badgeEl.classList.toggle('is-dist', isDistributorClient(client));
        }
    }

    function filteredGenTicketClients() {
        const q = (document.getElementById('genTicketClientSearch') &&
            document.getElementById('genTicketClientSearch').value || '').toLowerCase().trim();
        return clients.slice().sort(function (a, b) {
            return String(a.name).localeCompare(String(b.name), 'es');
        }).filter(function (c) {
            return !q || clientPickerHaystack(c).includes(q);
        });
    }

    function renderGenTicketClientPickerList() {
        const listEl = document.getElementById('genTicketClientList');
        const hid = document.getElementById('genTicketClient');
        if (!listEl) return;
        const current = (hid && hid.value) || POS_CLIENT_WALKIN;
        const list = filteredGenTicketClients();
        const q = (document.getElementById('genTicketClientSearch') &&
            document.getElementById('genTicketClientSearch').value || '').trim();
        const rows = [];
        rows.push(
            '<button type="button" class="pos-client-option' +
            (current === POS_CLIENT_WALKIN ? ' is-selected' : '') +
            '" role="option" data-gen-client-id="' + POS_CLIENT_WALKIN + '" aria-selected="' +
            (current === POS_CLIENT_WALKIN ? 'true' : 'false') + '">' +
            '<span class="pos-client-option-name">Mostrador</span>' +
            '<span class="badge">Opción</span>' +
            '<span class="pos-client-option-meta">Venta sin cliente registrado</span>' +
            '</button>'
        );
        list.forEach(function (c) {
            const dist = isDistributorClient(c);
            const metaParts = [c.company, c.phone, c.email, c.rfc].filter(Boolean);
            const metaHtml = metaParts.map(function (part) {
                return highlightClientMatch(part, q);
            }).join(' · ');
            rows.push(
                '<button type="button" class="pos-client-option' +
                (current === c.id ? ' is-selected' : '') +
                '" role="option" data-gen-client-id="' + esc(c.id) + '" aria-selected="' +
                (current === c.id ? 'true' : 'false') + '">' +
                '<span class="pos-client-option-name">' + highlightClientMatch(c.name, q) + '</span>' +
                '<span class="badge' + (dist ? ' b-primary' : '') + '">' + esc(clientTypeLabel(c)) + '</span>' +
                (metaHtml ? '<span class="pos-client-option-meta">' + metaHtml + '</span>' : '') +
                '</button>'
            );
        });
        if (!list.length && q) {
            listEl.innerHTML = rows[0] + '<div class="pos-client-option-empty">Sin coincidencias</div>';
        } else {
            listEl.innerHTML = rows.join('');
        }
        const options = listEl.querySelectorAll('.pos-client-option');
        if (genClientPickerActiveIdx < 0 || genClientPickerActiveIdx >= options.length) {
            genClientPickerActiveIdx = 0;
        }
        options.forEach(function (opt, i) {
            opt.classList.toggle('is-active', i === genClientPickerActiveIdx);
        });
        const active = options[genClientPickerActiveIdx];
        if (active && typeof active.scrollIntoView === 'function') {
            active.scrollIntoView({ block: 'nearest' });
        }
    }

    function openGenTicketClientPicker() {
        const pop = document.getElementById('genTicketClientPopover');
        const trigger = document.getElementById('genTicketClientTrigger');
        const search = document.getElementById('genTicketClientSearch');
        if (!pop || genClientPickerOpen) return;
        closeGenProductPicker();
        genClientPickerOpen = true;
        pop.hidden = false;
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
        if (search) search.value = '';
        genClientPickerActiveIdx = 0;
        renderGenTicketClientPickerList();
        requestAnimationFrame(function () {
            if (search) search.focus();
        });
    }

    function closeGenTicketClientPicker() {
        const pop = document.getElementById('genTicketClientPopover');
        const trigger = document.getElementById('genTicketClientTrigger');
        if (!genClientPickerOpen) return;
        genClientPickerOpen = false;
        if (pop) pop.hidden = true;
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        genClientPickerActiveIdx = -1;
    }

    function setGenTicketClientId(id) {
        const hid = document.getElementById('genTicketClient');
        if (hid) hid.value = id || POS_CLIENT_WALKIN;
        syncGenTicketClientTrigger();
        closeGenTicketClientPicker();
    }

    function fillGenTicketClientSelect() {
        const hid = document.getElementById('genTicketClient');
        if (!hid) return;
        const cur = hid.value || POS_CLIENT_WALKIN;
        if (cur !== POS_CLIENT_WALKIN && !clientById(cur)) {
            hid.value = POS_CLIENT_WALKIN;
        } else {
            hid.value = cur || POS_CLIENT_WALKIN;
        }
        syncGenTicketClientTrigger();
        if (genClientPickerOpen) renderGenTicketClientPickerList();
    }

    function syncGenProductTrigger(tr) {
        if (!tr) return;
        const hid = tr.querySelector('[data-gen-field="product"]');
        const label = tr.querySelector('.gen-product-trigger .pos-client-trigger-label');
        const trigger = tr.querySelector('.gen-product-trigger');
        if (!hid || !label) return;
        const id = (hid.value || '').trim();
        if (!id) {
            label.textContent = 'Producto…';
            if (trigger) trigger.classList.add('is-placeholder');
            return;
        }
        const cat = catalogById(id);
        const r = !cat ? recipeBySlug(id) : null;
        label.textContent = cat ? cat.name : (r ? r.name : id);
        if (trigger) trigger.classList.remove('is-placeholder');
    }

    function productPickerHaystack(p) {
        return [p.name, p.code, p.family, p.id, p.listName]
            .map(function (v) { return String(v || '').toLowerCase(); })
            .join(' ');
    }

    function filteredGenProducts(tr) {
        const search = tr && tr.querySelector('.gen-product-search');
        const q = (search && search.value || '').toLowerCase().trim();
        return pricedCatalog().slice().sort(function (a, b) {
            return String(a.name || '').localeCompare(String(b.name || ''), 'es');
        }).filter(function (p) {
            return !q || productPickerHaystack(p).includes(q);
        });
    }

    function renderGenProductPickerList() {
        const tr = genProductPickerRow;
        if (!tr) return;
        const listEl = tr.querySelector('.gen-product-list');
        const hid = tr.querySelector('[data-gen-field="product"]');
        if (!listEl) return;
        const current = hid ? (hid.value || '') : '';
        const list = filteredGenProducts(tr);
        const search = tr.querySelector('.gen-product-search');
        const q = (search && search.value || '').trim();
        const rows = [];
        rows.push(
            '<button type="button" class="pos-client-option' + (!current ? ' is-selected' : '') +
            '" role="option" data-gen-product-id="" aria-selected="' + (!current ? 'true' : 'false') + '">' +
            '<span class="pos-client-option-name">Producto…</span>' +
            '<span class="badge">Vacío</span>' +
            '</button>'
        );
        list.forEach(function (p) {
            const metaParts = [p.code, p.family].filter(Boolean);
            const metaHtml = metaParts.map(function (part) {
                return highlightClientMatch(part, q);
            }).join(' · ');
            rows.push(
                '<button type="button" class="pos-client-option' +
                (current === p.id ? ' is-selected' : '') +
                '" role="option" data-gen-product-id="' + esc(p.id) + '" aria-selected="' +
                (current === p.id ? 'true' : 'false') + '">' +
                '<span class="pos-client-option-name">' + highlightClientMatch(p.name, q) + '</span>' +
                (metaHtml ? '<span class="pos-client-option-meta">' + metaHtml + '</span>' : '') +
                '</button>'
            );
        });
        if (!list.length && q) {
            listEl.innerHTML = rows[0] + '<div class="pos-client-option-empty">Sin coincidencias</div>';
        } else {
            listEl.innerHTML = rows.join('');
        }
        const options = listEl.querySelectorAll('.pos-client-option');
        if (genProductPickerActiveIdx < 0 || genProductPickerActiveIdx >= options.length) {
            genProductPickerActiveIdx = 0;
        }
        options.forEach(function (opt, i) {
            opt.classList.toggle('is-active', i === genProductPickerActiveIdx);
        });
        const active = options[genProductPickerActiveIdx];
        if (active && typeof active.scrollIntoView === 'function') {
            active.scrollIntoView({ block: 'nearest' });
        }
    }

    function openGenProductPicker(tr) {
        if (!tr) return;
        closeGenTicketClientPicker();
        if (genProductPickerRow && genProductPickerRow !== tr) closeGenProductPicker();
        const pop = tr.querySelector('.gen-product-popover');
        const trigger = tr.querySelector('.gen-product-trigger');
        const search = tr.querySelector('.gen-product-search');
        if (!pop) return;
        genProductPickerRow = tr;
        genProductPickerActiveIdx = 0;
        pop.hidden = false;
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
        if (search) search.value = '';
        renderGenProductPickerList();
        requestAnimationFrame(function () {
            if (search) search.focus();
        });
    }

    function closeGenProductPicker() {
        if (!genProductPickerRow) return;
        const tr = genProductPickerRow;
        const pop = tr.querySelector('.gen-product-popover');
        const trigger = tr.querySelector('.gen-product-trigger');
        if (pop) pop.hidden = true;
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        genProductPickerRow = null;
        genProductPickerActiveIdx = -1;
    }

    function applyGenProductToRow(tr, productId) {
        if (!tr) return;
        const hid = tr.querySelector('[data-gen-field="product"]');
        const product = (productId || '').trim();
        if (hid) hid.value = product;
        syncGenProductTrigger(tr);
        const cat = product ? catalogById(product) : null;
        const r = product && !cat ? recipeBySlug(product) : null;
        const nameInput = tr.querySelector('[data-gen-field="name"]');
        const priceInput = tr.querySelector('[data-gen-field="price"]');
        if (nameInput && cat) nameInput.value = cat.name || '';
        else if (nameInput && r) nameInput.value = r.name || '';
        else if (nameInput && !product) nameInput.value = '';
        if (priceInput && product) {
            priceInput.value = String(unitPrice(product, 1));
        } else if (priceInput && !product) {
            priceInput.value = '0';
        }
        closeGenProductPicker();
        refreshGenTicketTotals();
    }

    function refreshGenTicketTotals() {
        const body = document.getElementById('genTicketLinesBody');
        const totalEl = document.getElementById('genTicketTotal');
        if (!body || !totalEl) return;
        let total = 0;
        body.querySelectorAll('tr').forEach(function (tr) {
            const qty = Number((tr.querySelector('[data-gen-field="qty"]') || {}).value) || 0;
            const price = Number((tr.querySelector('[data-gen-field="price"]') || {}).value) || 0;
            const line = qty * price;
            total += line;
            const cell = tr.querySelector('.gen-line');
            if (cell) cell.textContent = money(line);
        });
        totalEl.textContent = money(total);
    }

    function collectGenTicketLines() {
        const body = document.getElementById('genTicketLinesBody');
        const items = [];
        if (body) {
            body.querySelectorAll('tr').forEach(function (tr) {
                const product = ((tr.querySelector('[data-gen-field="product"]') || {}).value || '').trim();
                let name = ((tr.querySelector('[data-gen-field="name"]') || {}).value || '').trim();
                const qty = Math.max(0, Number((tr.querySelector('[data-gen-field="qty"]') || {}).value) || 0);
                const price = Math.max(0, Number((tr.querySelector('[data-gen-field="price"]') || {}).value) || 0);
                if (!qty && !price && !name && !product) return;
                if (!name && product) {
                    const cat = pricedCatalog().filter(function (p) { return p.id === product; })[0];
                    name = cat ? cat.name : product;
                }
                if (!name) name = product || 'Ítem';
                if (!(qty > 0)) return;
                const cat = product ? pricedCatalog().filter(function (p) { return p.id === product; })[0] : null;
                const r = product ? recipeBySlug(product) : null;
                items.push({
                    product: product || name,
                    name: name,
                    code: cat ? (cat.code || '') : (r ? (r.code || '') : ''),
                    unit: r ? unitFor(r) : (cat ? (cat.kind === 'liquido' ? (cat.unitLabel || 'L') : 'Pza') : 'Pza'),
                    price: roundMoney(price),
                    basePrice: roundMoney(price),
                    priceOverride: null,
                    priceOverridePct: null,
                    isPromo: false,
                    qty: Math.round(qty * 1000) / 1000
                });
            });
        }
        if (!items.length) {
            toast('Agrega al menos una línea con cantidad');
            return null;
        }
        return items;
    }

    function resetGenTicketForm() {
        setGenDatetimePair('genTicketDate', 'genTicketTime', defaultGenerateTicketDatetimeLocal());
        const stockEl = document.getElementById('genTicketStock');
        if (stockEl) stockEl.checked = true;
        const noteEl = document.getElementById('genTicketNote');
        if (noteEl) noteEl.value = '';
        const payEl = document.getElementById('genTicketPay');
        if (payEl) payEl.value = 'efectivo';
        const billEl = document.getElementById('genTicketBill');
        if (billEl) billEl.value = 'sin_facturar';
        const cityEl = document.getElementById('genTicketCity');
        if (cityEl) cityEl.value = loadPreferredSaleCity() || 'culiacan';
        fillGenTicketClientSelect();
        const clientEl = document.getElementById('genTicketClient');
        if (clientEl) clientEl.value = POS_CLIENT_WALKIN;
        const body = document.getElementById('genTicketLinesBody');
        if (body) body.innerHTML = genTicketLineRowHtml({ qty: 1, price: 0 }, 0);
        refreshGenTicketTotals();
    }

    function resetGenGastoForm() {
        setGenDatetimePair('genGastoDate', 'genGastoTime', defaultGenerateTicketDatetimeLocal());
        const conceptEl = document.getElementById('genGastoConcept');
        if (conceptEl) conceptEl.value = '';
        const amountEl = document.getElementById('genGastoAmount');
        if (amountEl) amountEl.value = '';
        const noteEl = document.getElementById('genGastoNote');
        if (noteEl) noteEl.value = '';
        const cityEl = document.getElementById('genGastoCity');
        if (cityEl) {
            const preferred = loadPreferredSaleCity();
            if (cityById(preferred)) cityEl.value = preferred;
        }
    }

    function setPosGenerateTab(tab) {
        posGenerateTab = tab === 'gasto' ? 'gasto' : 'ticket';
        document.querySelectorAll('#posGenerateTabs [data-gen-tab]').forEach(function (btn) {
            const active = btn.getAttribute('data-gen-tab') === posGenerateTab;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        const ticketPanel = document.getElementById('posGenerateTicketPanel');
        const gastoPanel = document.getElementById('posGenerateGastoPanel');
        if (ticketPanel) ticketPanel.hidden = posGenerateTab !== 'ticket';
        if (gastoPanel) gastoPanel.hidden = posGenerateTab !== 'gasto';
        const title = document.getElementById('posGenerateModalTitle');
        if (title) title.textContent = posGenerateTab === 'gasto' ? 'Generar gasto' : 'Generar ticket';
    }

    function openPosGenerateModal(tab) {
        resetGenTicketForm();
        resetGenGastoForm();
        setPosGenerateTab(tab || 'ticket');
        const modal = document.getElementById('posGenerateModal');
        if (!modal) return;
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(function () {
            if (posGenerateTab === 'gasto') {
                const concept = document.getElementById('genGastoConcept');
                if (concept) concept.focus();
            } else {
                focusGenDatetimePair('genTicketDate', 'genTicketTime');
            }
        });
    }

    function closePosGenerateModal() {
        closeGenTicketClientPicker();
        closeGenProductPicker();
        const modal = document.getElementById('posGenerateModal');
        if (!modal) return;
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }

    function submitGenerateTicket() {
        const atRaw = readGenDatetimePair('genTicketDate', 'genTicketTime');
        if (!atRaw) {
            toast('Indica la fecha y hora del ticket');
            focusGenDatetimePair('genTicketDate', 'genTicketTime');
            return;
        }
        const items = collectGenTicketLines();
        if (!items) return;
        const stockEl = document.getElementById('genTicketStock');
        const skipInventory = !(stockEl && stockEl.checked);
        const adminNote = String((document.getElementById('genTicketNote') || {}).value || '').trim();
        const clientId = ((document.getElementById('genTicketClient') || {}).value || POS_CLIENT_WALKIN);
        const pay = ((document.getElementById('genTicketPay') || {}).value || 'efectivo');
        const bill = ((document.getElementById('genTicketBill') || {}).value || 'sin_facturar');
        const city = ((document.getElementById('genTicketCity') || {}).value || loadPreferredSaleCity());
        if (!isValidPayMethod(pay)) {
            toast('Elige método de pago');
            return;
        }
        if (['facturado', 'sin_facturar'].indexOf(bill) < 0) {
            toast('Elige opción de facturación');
            return;
        }
        const total = roundMoney(items.reduce(function (n, it) {
            return n + (Number(it.qty) || 0) * (Number(it.price) || 0);
        }, 0));
        checkout({
            fromGenerate: true,
            backdatedDate: atRaw,
            skipInventory: skipInventory,
            adminNote: adminNote,
            clientId: clientId,
            billing: bill,
            paymentMethod: pay,
            payments: [{ method: pay, amount: total }],
            city: city,
            cartItems: items
        });
    }

    function submitGenerateGasto(ev) {
        if (ev) ev.preventDefault();
        const atRaw = readGenDatetimePair('genGastoDate', 'genGastoTime');
        if (!atRaw) {
            toast('Indica la fecha y hora del gasto');
            focusGenDatetimePair('genGastoDate', 'genGastoTime');
            return;
        }
        const conceptEl = document.getElementById('genGastoConcept');
        const amountEl = document.getElementById('genGastoAmount');
        const cityEl = document.getElementById('genGastoCity');
        const noteEl = document.getElementById('genGastoNote');
        const gasto = createCajaGasto({
            concept: conceptEl && conceptEl.value,
            amount: amountEl && amountEl.value,
            city: cityEl && cityEl.value,
            note: noteEl && noteEl.value,
            createdAt: isoFromDatetimeLocal(atRaw),
            source: 'pos-generate'
        });
        if (!gasto) return;
        closePosGenerateModal();
        toast('Gasto generado · ' + money(gasto.amount) + ' · ' + formatInvoiceDate(new Date(gasto.createdAt)));
    }

    function focusHistoryOnSaleDate(iso) {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return;
        const pad = function (n) { return String(n).padStart(2, '0'); };
        const day = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
        const fromEl = document.getElementById('posHistoryFrom');
        const toEl = document.getElementById('posHistoryTo');
        if (fromEl) fromEl.value = day;
        if (toEl) toEl.value = day;
        historyPage = 1;
    }

    function syncGastoCityControl() {
        const sel = document.getElementById('posGastoCity');
        if (!sel) return;
        const preferred = loadPreferredSaleCity();
        if (cityById(preferred)) sel.value = preferred;
    }

    function renderGastosPanel() {
        const listEl = document.getElementById('posGastosList');
        const countEl = document.getElementById('posGastosListCount');
        const todayEl = document.getElementById('posGastosTodayTotal');
        if (!listEl) return;

        const todayBounds = periodBounds('day', 0);
        const todayList = gastosInRange(cajaGastos, todayBounds.start, todayBounds.end);
        if (todayEl) todayEl.textContent = money(sumGastos(todayList));

        const sorted = cajaGastos.slice().sort(function (a, b) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        const cap = 100;
        const shown = sorted.length > cap ? sorted.slice(0, cap) : sorted;
        if (countEl) {
            countEl.textContent = sorted.length + (sorted.length === 1 ? ' gasto' : ' gastos');
        }
        if (!shown.length) {
            listEl.innerHTML = '<div class="pos-gasto-row"><div class="empty">Sin gastos registrados.</div></div>';
            return;
        }
        listEl.innerHTML = shown.map(function (g) {
            const d = new Date(g.createdAt);
            const who = g.userName || (g.user && (g.user.name || g.user.username)) || '';
            const note = String(g.note || '').trim();
            return '<div class="pos-gasto-row" data-gasto-id="' + esc(g.id) + '">' +
                '<div>' +
                    '<div class="concept">' + esc(g.concept || 'Gasto') + '</div>' +
                    '<div class="meta">' + esc(formatInvoiceDate(d)) +
                        ' · ' + esc(cityLabel(gastoCity(g))) +
                        (who ? ' · ' + esc(who) : '') +
                        (note ? ' · ' + esc(note) : '') +
                    '</div>' +
                '</div>' +
                '<span class="amt">−' + money(g.amount) + '</span>' +
                '<button type="button" class="iconbtn" data-rm-gasto="' + esc(g.id) + '" title="Eliminar" aria-label="Eliminar gasto">' +
                    '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>' +
                '</button>' +
                '</div>';
        }).join('') +
            (sorted.length > cap
                ? '<div class="pos-gasto-row"><div class="empty muted">Mostrando ' + cap + ' de ' + sorted.length + '</div></div>'
                : '');
    }

    function createCajaGasto(payload) {
        payload = payload || {};
        const concept = String(payload.concept || '').trim().replace(/\s+/g, ' ');
        const amount = roundMoney(payload.amount);
        const city = normalizeCityId(payload.city || loadPreferredSaleCity());
        const note = String(payload.note || '').trim();
        if (!concept) {
            toast('Escribe el concepto del gasto');
            return null;
        }
        if (!(amount > 0)) {
            toast('El monto debe ser mayor a 0');
            return null;
        }
        const user = currentUserSnapshot();
        let createdAt = new Date().toISOString();
        if (payload.createdAt) {
            const raw = String(payload.createdAt);
            const parsed = new Date(raw);
            createdAt = !isNaN(parsed.getTime()) ? parsed.toISOString() : isoFromDatetimeLocal(raw);
        }
        const gasto = {
            id: 'gasto-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
            createdAt: createdAt,
            concept: concept,
            amount: amount,
            city: city,
            note: note,
            user: user,
            userId: user.id,
            userName: user.name || user.username
        };
        if (payload.source) {
            gasto.meta = {
                source: payload.source,
                generatedAt: new Date().toISOString()
            };
        }
        cajaGastos.unshift(gasto);
        saveCajaGastos();
        savePreferredSaleCity(city);
        renderGastosPanel();
        renderCortes();
        renderDinero();
        return gasto;
    }

    function registerCajaGasto(ev) {
        if (ev) ev.preventDefault();
        const conceptEl = document.getElementById('posGastoConcept');
        const amountEl = document.getElementById('posGastoAmount');
        const cityEl = document.getElementById('posGastoCity');
        const noteEl = document.getElementById('posGastoNote');
        const gasto = createCajaGasto({
            concept: conceptEl && conceptEl.value,
            amount: amountEl && amountEl.value,
            city: cityEl && cityEl.value,
            note: noteEl && noteEl.value
        });
        if (!gasto) {
            if (!(String((conceptEl && conceptEl.value) || '').trim())) {
                if (conceptEl) conceptEl.focus();
            } else if (amountEl) {
                amountEl.focus();
            }
            return;
        }
        if (conceptEl) conceptEl.value = '';
        if (amountEl) amountEl.value = '';
        if (noteEl) noteEl.value = '';
        if (conceptEl) conceptEl.focus();
        toast('Gasto registrado · ' + money(gasto.amount));
    }

    function removeCajaGasto(id) {
        const idx = cajaGastos.findIndex(function (g) { return g.id === id; });
        if (idx < 0) return;
        const now = new Date().toISOString();
        cajaGastos.splice(idx, 1);
        // Tombstone para que el merge-by-id no reinyecte el gasto borrado.
        const raw = loadCajaGastosRaw().filter(function (g) { return !g || g.id !== id; });
        raw.push({ id: id, deleted: true, editedAt: now, updatedAt: now });
        localStorage.setItem(CAJA_GASTOS_KEY, JSON.stringify({ items: raw, updatedAt: now }));
        saveCajaGastos();
        renderGastosPanel();
        renderCortes();
        renderDinero();
        toast('Gasto eliminado');
    }

    /** Facturación: grupo (Total facturado / Total sin facturar) + subfilas por método de pago. */
    function renderGroupedBreakdownRows(containerId, barId, groups, total) {
        const rowsEl = document.getElementById(containerId);
        const barEl = document.getElementById(barId);
        if (!rowsEl) return;
        const visible = (groups || []).filter(function (g) {
            return g.amount > 0 && (g.children || []).length;
        });
        const flatSegs = [];
        visible.forEach(function (g) {
            (g.children || []).forEach(function (c) { flatSegs.push(c); });
        });
        if (!visible.length || !total) {
            rowsEl.innerHTML = '<div class="cortes-empty">Sin datos en este periodo</div>';
            if (barEl) barEl.innerHTML = '';
            return;
        }
        if (barEl) {
            barEl.innerHTML = flatSegs.map(function (r) {
                const pct = Math.max(0, (r.amount / total) * 100);
                const title = (r.groupLabel ? r.groupLabel + ' · ' : '') + r.label;
                return '<span class="seg-' + esc(r.key) + '" style="width:' + pct + '%" title="' + esc(title) + '"></span>';
            }).join('');
        }
        rowsEl.innerHTML = visible.map(function (g) {
            const subs = (g.children || []).map(function (r) {
                return '<div class="cortes-row is-sub">' +
                    '<div class="left"><span class="dot ' + esc(r.key) + '"></span><span class="name">' + esc(r.label) + '</span></div>' +
                    '<span class="amt">' + money(r.amount) + '</span>' +
                    '</div>';
            }).join('');
            return '<div class="cortes-group">' +
                '<div class="cortes-row is-group">' +
                '<div class="left"><span class="dot ' + esc(g.key) + '"></span><span class="name">' + esc(g.label) + '</span></div>' +
                '<span class="amt">' + money(g.amount) + '</span>' +
                '</div>' +
                subs +
                '</div>';
        }).join('');
    }

    function dineroLinesHtml(rows) {
        return (rows || []).map(function (r) {
            return '<div class="dinero-line' + (r.out ? ' is-out' : '') + '">' +
                '<span>' + esc(r.label) + '</span>' +
                '<span class="amt">' + (r.out ? '−' : '') + money(Math.abs(r.amount)) + '</span>' +
                '</div>';
        }).join('');
    }
    function setDineroCardTotal(id, amount) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = money(amount);
        el.classList.toggle('is-neg', amount < 0);
    }
    function renderDinero() {
        const section = document.getElementById('dinero');
        if (!section) return;
        const citySel = document.getElementById('dineroCitySelect');
        if (citySel && citySel.value !== dineroCityFilter) citySel.value = dineroCityFilter;
        const acc = computeDineroAccounts(dineroCityFilter);
        setDineroCardTotal('dineroEfectivoTotal', acc.efectivo.total);
        setDineroCardTotal('dineroBancoTotal', acc.banco.total);
        setDineroCardTotal('dineroTarjetaSfTotal', acc.tarjeta_sf.total);
        const efLines = document.getElementById('dineroEfectivoLines');
        if (efLines) {
            efLines.innerHTML = dineroLinesHtml([
                { label: 'Saldo de apertura', amount: acc.efectivo.apertura },
                { label: 'Tickets posteriores', amount: acc.efectivo.tickets },
                { label: 'Gastos posteriores', amount: acc.efectivo.gastos, out: true },
                { label: 'Ajustes', amount: acc.efectivo.ajustes, out: acc.efectivo.ajustes < 0 }
            ]);
        }
        const bankLines = document.getElementById('dineroBancoLines');
        if (bankLines) {
            bankLines.innerHTML = dineroLinesHtml([
                { label: 'Saldo Banorte', amount: acc.banco.apertura },
                { label: 'Transferencias posteriores', amount: acc.banco.transfer },
                { label: 'Tarjeta facturada posterior', amount: acc.banco.tarjetaFact },
                { label: 'Ajustes', amount: acc.banco.ajustes, out: acc.banco.ajustes < 0 }
            ]);
        }
        const cardLines = document.getElementById('dineroTarjetaSfLines');
        if (cardLines) {
            cardLines.innerHTML = dineroLinesHtml([
                { label: 'Saldo de apertura', amount: acc.tarjeta_sf.apertura },
                { label: 'Tickets posteriores', amount: acc.tarjeta_sf.tarjetaSf },
                { label: 'Ajustes', amount: acc.tarjeta_sf.ajustes, out: acc.tarjeta_sf.ajustes < 0 }
            ]);
        }
        let inv = { materials: { value: 0, items: 0, withStock: 0 }, finished: { value: 0, units: 0, skus: 0, fallbackSkus: 0 } };
        if (window.S35PanelAPI && typeof window.S35PanelAPI.getMoneyInventory === 'function') {
            inv = window.S35PanelAPI.getMoneyInventory() || inv;
        }
        const mp = inv.materials || {};
        const pt = inv.finished || {};
        setDineroCardTotal('dineroMpTotal', mp.value || 0);
        setDineroCardTotal('dineroPtTotal', pt.value || 0);
        const mpLines = document.getElementById('dineroMpLines');
        if (mpLines) {
            mpLines.innerHTML = '<div class="dinero-line"><span>Materiales</span><span class="amt">' +
                esc(String(mp.items || 0)) + '</span></div>' +
                '<div class="dinero-line"><span>Con existencia</span><span class="amt">' +
                esc(String(mp.withStock || 0)) + '</span></div>';
        }
        const ptLines = document.getElementById('dineroPtLines');
        if (ptLines) {
            ptLines.innerHTML = '<div class="dinero-line"><span>Sacos / unidades</span><span class="amt">' +
                esc((pt.units || 0).toLocaleString('es-MX')) + '</span></div>' +
                '<div class="dinero-line"><span>Con existencia</span><span class="amt">' +
                esc(String(pt.skus || 0)) + '</span></div>' +
                (pt.fallbackSkus
                    ? '<div class="dinero-line"><span>Sin costo de fórmula</span><span class="amt">' +
                        esc(String(pt.fallbackSkus)) + ' a lista</span></div>'
                    : '');
        }
        const cashTotal = roundMoney(acc.efectivo.total + acc.banco.total + acc.tarjeta_sf.total);
        const invTotal = roundMoney((mp.value || 0) + (pt.value || 0));
        const grand = roundMoney(cashTotal + invTotal);
        setDineroCardTotal('dineroGrandTotal', grand);
        const hint = document.getElementById('dineroGrandHint');
        if (hint) {
            hint.textContent = 'Cuentas ' + money(cashTotal) + ' · Inventario ' + money(invTotal) +
                (dineroCityFilter === 'all' ? ' · todas las ciudades' : ' · ' + cityLabel(dineroCityFilter));
        }
        renderDineroMovs();
    }
    function formatLedgerDate(iso, fecha) {
        if (fecha) return fecha;
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    function tesoreriaTypeLabel(type, source) {
        if (type === 'apertura') return source === 'banorte-csv' ? 'Saldo inicial' : 'Apertura';
        if (type === 'retiro') return source === 'banorte-csv' ? 'Cargo' : 'Retiro';
        if (type === 'deposito') return source === 'banorte-csv' ? 'Abono' : 'Depósito';
        if (type === 'ajuste') return 'Ajuste';
        if (type === 'venta') return 'Venta';
        if (type === 'gasto') return 'Gasto';
        return type || 'Movimiento';
    }
    function buildDineroLedger() {
        const rows = [];
        filterTesoreriaMovsByCity(tesoreriaMovs, dineroCityFilter).forEach(function (m) {
            if (!m) return;
            const locked = tesoreriaMovLocked(m);
            const isApertura = m.type === 'apertura';
            const signed = isApertura ? 0 : tesoreriaSignedAmount(m);
            rows.push({
                id: m.id,
                createdAt: m.createdAt,
                sortAt: Date.parse(m.createdAt) || 0,
                account: m.account,
                type: m.type,
                source: m.source || '',
                note: m.note || '',
                reference: m.reference || '',
                amount: roundMoney(m.amount),
                signed: signed,
                ingreso: !isApertura && signed > 0 ? signed : 0,
                gasto: !isApertura && signed < 0 ? -signed : 0,
                bankSaldo: m.bankSaldo,
                fecha: m.fecha || '',
                city: tesoreriaMovCity(m),
                locked: locked,
                setBalance: isApertura ? roundMoney(m.amount) : null
            });
        });
        filterSalesByCity(sales, dineroCityFilter).filter(function (sale) {
            return afterTesoreriaOpening(sale && sale.createdAt);
        }).forEach(function (sale) {
            const billing = sale.billing || 'sin_facturar';
            const client = (sale.client && sale.client.name) || 'Mostrador';
            const folio = saleReceiptLabel(sale);
            salePaymentLines(sale).forEach(function (p, idx) {
                const account = tesoreriaAccountOfPayment(p.method, billing);
                if (!account) return;
                rows.push({
                    id: (sale.id || 'sale') + '-' + p.method + '-' + idx,
                    createdAt: sale.createdAt,
                    sortAt: Date.parse(sale.createdAt) || 0,
                    account: account,
                    type: 'venta',
                    source: 'pos',
                    note: folio + ' · ' + client + ' · ' + payLabel(p.method) +
                        (billing === 'facturado' ? ' facturado' : ' s/factura'),
                    reference: sale.folio || '',
                    amount: roundMoney(p.amount),
                    signed: roundMoney(p.amount),
                    ingreso: roundMoney(p.amount),
                    gasto: 0,
                    city: saleCity(sale),
                    locked: true,
                    setBalance: null
                });
            });
        });
        filterGastosByCity(cajaGastos, dineroCityFilter).filter(function (g) {
            return afterTesoreriaOpening(g && g.createdAt);
        }).forEach(function (g) {
            rows.push({
                id: g.id,
                createdAt: g.createdAt,
                sortAt: Date.parse(g.createdAt) || 0,
                account: 'efectivo',
                type: 'gasto',
                source: 'caja',
                note: (g.concept || 'Gasto') + (g.note ? ' · ' + g.note : ''),
                reference: '',
                amount: roundMoney(g.amount),
                signed: -roundMoney(g.amount),
                ingreso: 0,
                gasto: roundMoney(g.amount),
                city: gastoCity(g),
                locked: true,
                setBalance: null
            });
        });
        rows.sort(function (a, b) {
            return a.sortAt - b.sortAt;
        });
        let runByAccount = { efectivo: 0, banco: 0, tarjeta_sf: 0 };
        rows.forEach(function (row) {
            if (row.setBalance != null) {
                runByAccount[row.account] = row.setBalance;
            } else if (row.bankSaldo != null && row.source === 'banorte-csv') {
                runByAccount[row.account] = roundMoney(row.bankSaldo);
            } else {
                runByAccount[row.account] = roundMoney((runByAccount[row.account] || 0) + row.signed);
            }
            row.running = runByAccount[row.account];
        });
        rows.reverse();
        return rows;
    }
    function renderDineroMovs() {
        const host = document.getElementById('dineroMovsList');
        if (!host) return;
        const bar = document.getElementById('dineroLedgerAccount');
        if (bar) {
            bar.querySelectorAll('[data-dinero-ledger]').forEach(function (btn) {
                const on = btn.getAttribute('data-dinero-ledger') === dineroLedgerFilter;
                btn.classList.toggle('active', on);
                btn.setAttribute('aria-selected', on ? 'true' : 'false');
            });
        }
        const searchEl = document.getElementById('dineroLedgerSearch');
        if (searchEl && searchEl.value !== dineroLedgerQuery) searchEl.value = dineroLedgerQuery;
        const needle = String(dineroLedgerQuery || '').trim().toLowerCase();
        const all = buildDineroLedger();
        const list = all.filter(function (row) {
            if (dineroLedgerFilter !== 'all' && row.account !== dineroLedgerFilter) return false;
            if (!needle) return true;
            const hay = [
                row.note, row.reference, tesoreriaAccountLabel(row.account),
                tesoreriaTypeLabel(row.type, row.source), row.fecha
            ].join(' ').toLowerCase();
            return hay.indexOf(needle) >= 0;
        });
        const meta = document.getElementById('dineroLedgerMeta');
        if (meta) {
            const ingresos = list.reduce(function (n, r) { return n + (r.ingreso || 0); }, 0);
            const gastos = list.reduce(function (n, r) { return n + (r.gasto || 0); }, 0);
            meta.textContent = list.length + (list.length === 1 ? ' movimiento' : ' movimientos') +
                ' · ingresos ' + money(ingresos) + ' · gastos ' + money(gastos);
        }
        if (!list.length) {
            host.innerHTML = '<div class="dinero-mov-row"><div class="empty">Sin movimientos en este filtro.</div></div>';
            return;
        }
        const showSaldo = dineroLedgerFilter !== 'all';
        host.innerHTML = '<div class="dinero-ledger-wrap"><table class="dinero-ledger-table">' +
            '<thead><tr>' +
            '<th>Fecha</th><th>Cuenta</th><th>Concepto</th>' +
            '<th class="num">Ingreso</th><th class="num">Gasto</th>' +
            (showSaldo ? '<th class="num">Saldo</th>' : '') +
            '<th></th></tr></thead><tbody>' +
            list.map(function (row) {
                const typeLab = tesoreriaTypeLabel(row.type, row.source);
                const canDelete = !row.locked && row.source !== 'pos' && row.source !== 'caja';
                return '<tr data-dinero-mov="' + esc(row.id) + '">' +
                    '<td>' + esc(formatLedgerDate(row.createdAt, row.fecha)) + '</td>' +
                    '<td>' + esc(tesoreriaAccountLabel(row.account)) + '</td>' +
                    '<td><div class="concept">' + esc(typeLab + (row.note ? ' · ' + row.note : '')) + '</div>' +
                    (row.reference ? '<div class="meta">Ref. ' + esc(row.reference) + '</div>' : '') +
                    '</td>' +
                    '<td class="num dinero-in">' + (row.ingreso ? money(row.ingreso) : '') + '</td>' +
                    '<td class="num dinero-out">' + (row.gasto ? money(row.gasto) : '') + '</td>' +
                    (showSaldo ? '<td class="num">' + money(row.running) + '</td>' : '') +
                    '<td>' + (canDelete
                        ? '<button type="button" class="iconbtn" data-rm-dinero-mov="' + esc(row.id) +
                            '" title="Eliminar" aria-label="Eliminar movimiento">' +
                            '<i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>'
                        : '') +
                    '</td></tr>';
            }).join('') +
            '</tbody></table></div>';
    }
    function createTesoreriaMov(payload) {
        payload = payload || {};
        const account = payload.account;
        const type = payload.type === 'retiro' ? 'retiro' : (payload.type === 'ajuste' ? 'ajuste' : 'deposito');
        const amount = roundMoney(payload.amount);
        if (TESORERIA_ACCOUNTS.every(function (a) { return a.id !== account; })) {
            toast('Elige una cuenta');
            return null;
        }
        if (!(amount > 0)) {
            toast('El monto debe ser mayor a 0');
            return null;
        }
        const user = currentUserSnapshot();
        const city = dineroCityFilter === 'all'
            ? normalizeCityId(payload.city || loadPreferredSaleCity())
            : normalizeCityId(dineroCityFilter);
        const mov = {
            id: 'teso-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
            createdAt: new Date().toISOString(),
            account: account,
            type: type,
            amount: amount,
            note: String(payload.note || '').trim(),
            city: city,
            source: 'manual',
            user: user,
            userId: user.id,
            userName: user.name || user.username
        };
        tesoreriaMovs.unshift(mov);
        saveTesoreriaMovs();
        renderDinero();
        return mov;
    }
    function removeTesoreriaMov(id) {
        const idx = tesoreriaMovs.findIndex(function (m) { return m.id === id; });
        if (idx < 0) return;
        if (tesoreriaMovLocked(tesoreriaMovs[idx])) {
            toast('Este movimiento es del estado de cuenta o de la apertura y no se puede borrar');
            return;
        }
        const now = new Date().toISOString();
        tesoreriaMovs.splice(idx, 1);
        const raw = loadTesoreriaMovsRaw().filter(function (m) { return !m || m.id !== id; });
        raw.push({ id: id, deleted: true, editedAt: now, updatedAt: now });
        localStorage.setItem(TESORERIA_MOVS_KEY, JSON.stringify({ items: raw, updatedAt: now }));
        saveTesoreriaMovs();
        renderDinero();
        toast('Movimiento eliminado');
    }
    function submitDineroMov(ev) {
        if (ev) ev.preventDefault();
        const mov = createTesoreriaMov({
            account: (document.getElementById('dineroMovAccount') || {}).value,
            type: (document.getElementById('dineroMovType') || {}).value,
            amount: (document.getElementById('dineroMovAmount') || {}).value,
            note: (document.getElementById('dineroMovNote') || {}).value
        });
        if (!mov) return;
        const amountEl = document.getElementById('dineroMovAmount');
        const noteEl = document.getElementById('dineroMovNote');
        if (amountEl) amountEl.value = '';
        if (noteEl) noteEl.value = '';
        toast('Movimiento registrado · ' + tesoreriaAccountLabel(mov.account));
    }

    function refreshSalesDependentViews() {
        renderCortes();
        renderDinero();
        if (pdSalesSlug) renderProductSalesAnalytics(pdSalesSlug);
        renderProductsMovementsChart();
        if (clientDashId) renderClientDashboard(clientDashId);
    }

    function renderCortes() {
        const section = document.getElementById('cortes');
        if (!section) return;

        const isHist = cortesPeriod === 'historial';
        if (isHist) cortesOffset = 0;

        const bounds = periodBounds(cortesPeriod, cortesOffset);
        const prevBounds = isHist ? null : periodBounds(cortesPeriod, cortesOffset - 1);
        const comparePrevBounds = isHist
            ? null
            : likeForLikePrevBounds(cortesPeriod, bounds, cortesOffset);
        const likeForLike = !isHist && cortesOffset === 0 && cortesPeriod !== 'historial';
        const analyticsAll = salesForAnalytics();
        const analytics = filterSalesByCity(analyticsAll, cortesCityFilter);
        const list = salesInRange(analytics, bounds.start, bounds.end);
        const prevList = isHist ? [] : salesInRange(analytics, prevBounds.start, prevBounds.end);
        const comparePrevList = isHist
            ? []
            : salesInRange(
                filterSalesByCity(analyticsAll, cortesCityFilter),
                comparePrevBounds.start,
                comparePrevBounds.end
            );
        const multiCity = cortesCityFilter === 'all';
        const citySeries = multiCity
            ? SALE_CITIES.map(function (c) {
                return {
                    key: c.id,
                    label: c.label,
                    color: cityColor(c.id),
                    list: salesInRange(filterSalesByCity(analyticsAll, c.id), bounds.start, bounds.end)
                };
            })
            : null;
        const total = sumTotals(list);
        const prevTotal = sumTotals(comparePrevList);
        const tickets = list.length;
        const avg = tickets ? total / tickets : 0;
        const daysBounds = likeForLike ? effectiveBoundsThroughNow(bounds) : bounds;
        const dailyAvg = total / calendarDaysInBounds(daysBounds);

        const rangeLabel = document.getElementById('cortesRangeLabel');
        if (rangeLabel) {
            rangeLabel.textContent = formatPeriodLabel(cortesPeriod, bounds.start, bounds.end);
            rangeLabel.disabled = isHist;
            rangeLabel.title = isHist ? 'Historial completo' : 'Elegir ' + (
                cortesPeriod === 'day' ? 'día' :
                cortesPeriod === 'week' ? 'semana' :
                cortesPeriod === 'month' ? 'mes' : 'año'
            );
        }

        const nextBtn = document.getElementById('cortesNext');
        if (nextBtn) nextBtn.disabled = isHist || cortesOffset >= 0;
        const prevBtn = document.getElementById('cortesPrev');
        if (prevBtn) prevBtn.disabled = isHist;
        const resetBtn = document.getElementById('cortesReset');
        if (resetBtn) resetBtn.disabled = isHist;

        const totalEl = document.getElementById('cortesTotal');
        if (totalEl) totalEl.textContent = money(total);
        const ticketsEl = document.getElementById('cortesTickets');
        if (ticketsEl) ticketsEl.textContent = String(tickets);
        const avgEl = document.getElementById('cortesAvg');
        if (avgEl) avgEl.textContent = money(avg);
        const dailyEl = document.getElementById('cortesDailyAvg');
        if (dailyEl) dailyEl.textContent = money(dailyAvg);
        const hintEl = document.getElementById('cortesCompareHint');
        if (hintEl) {
            if (isHist) {
                hintEl.textContent = multiCity
                    ? 'Vista completa · todas las ciudades'
                    : ('Vista completa · ' + cityLabel(cortesCityFilter));
            } else if (multiCity) {
                hintEl.textContent = 'Todas las ciudades · suma del periodo';
            } else {
                hintEl.textContent = formatDelta(total, prevTotal, {
                    likeForLike: likeForLike,
                    period: cortesPeriod
                });
            }
        }

        const legendHost = document.querySelector('#cortes .cortes-chart-legend');
        if (legendHost) {
            if (multiCity) {
                legendHost.innerHTML = SALE_CITIES.map(function (c) {
                    const col = cityColor(c.id);
                    return '<span class="leg"><span class="swatch" style="background:' + esc(col) +
                        ';border-color:' + esc(col) + '"></span> ' + esc(c.label) + '</span>';
                }).join('');
            } else {
                const c = cityById(cortesCityFilter);
                const col = cityColor(cortesCityFilter);
                const lab = c ? c.label : 'Periodo';
                legendHost.innerHTML =
                    '<span class="leg"><span class="swatch" style="background:' + esc(col) +
                    ';border-color:' + esc(col) + '"></span> ' + esc(lab) + '</span>' +
                    (isHist ? '' :
                        '<span class="leg"><span class="swatch prev"></span> Anterior</span>');
            }
        }

        const citySelect = document.getElementById('cortesCitySelect');
        if (citySelect) {
            // Mantener opciones al día si se agregan ciudades nuevas
            const wanted = [{ id: 'all', label: 'Todas' }].concat(SALE_CITIES.map(function (c) {
                return { id: c.id, label: c.label };
            }));
            const curOpts = Array.prototype.map.call(citySelect.options, function (o) { return o.value; }).join('|');
            const nextOpts = wanted.map(function (o) { return o.id; }).join('|');
            if (curOpts !== nextOpts) {
                citySelect.innerHTML = wanted.map(function (o) {
                    return '<option value="' + esc(o.id) + '">' + esc(o.label) + '</option>';
                }).join('');
            }
            citySelect.value = cortesCityFilter;
            const cityMenu = document.getElementById('cortesCityMenu');
            if (cityMenu) cityMenu.classList.toggle('is-filtered', cortesCityFilter !== 'all');
        }

        renderCortesChart(
            cortesPeriod,
            bounds,
            list,
            multiCity ? null : prevBounds,
            multiCity ? [] : prevList,
            citySeries,
            multiCity ? null : cityColor(cortesCityFilter)
        );

        const payKeys = payMethodKeys();
        const payRows = payKeys.map(function (k) {
            const amount = list.reduce(function (n, s) {
                return n + amountPaidByMethod(s, k);
            }, 0);
            return { key: k, label: payLabel(k), amount: amount };
        }).filter(function (r) { return r.amount > 0; });
        const efectivoCobrado = list.reduce(function (n, s) {
            return n + amountPaidByMethod(s, 'efectivo');
        }, 0);
        const gastosPeriodo = filterGastosByCity(
            gastosInRange(cajaGastos, bounds.start, bounds.end),
            cortesCityFilter
        );
        const gastosTotal = sumGastos(gastosPeriodo);
        renderCortesPayBreakdown(payRows, total, efectivoCobrado, gastosTotal);

        const billPayMethods = [
            { pay: 'efectivo', label: 'Efectivo' },
            { pay: 'tarjeta', label: 'Tarjeta' },
            { pay: 'transferencia', label: 'Transferencia' },
            { pay: 'por_cobrar', label: 'Por cobrar' }
        ];
        const billGroupDefs = [
            { key: 'facturado', bill: 'facturado', label: 'Total facturado' },
            { key: 'sin_facturar', bill: 'sin_facturar', label: 'Total sin facturar' }
        ];
        const billGroups = billGroupDefs.map(function (g) {
            const children = billPayMethods.map(function (p) {
                const amount = list.reduce(function (n, s) {
                    const bill = s.billing || 'sin_facturar';
                    if (bill !== g.bill) return n;
                    return n + amountPaidByMethod(s, p.pay);
                }, 0);
                return {
                    key: g.bill + '_' + p.pay,
                    label: p.label,
                    amount: amount,
                    groupLabel: g.label
                };
            }).filter(function (r) { return r.amount > 0; });
            const amount = children.reduce(function (n, r) { return n + r.amount; }, 0);
            return { key: g.key, label: g.label, amount: amount, children: children };
        }).filter(function (g) { return g.amount > 0; });
        renderGroupedBreakdownRows('cortesBillRows', 'cortesBillBar', billGroups, total);

        const productMap = {};
        list.forEach(function (s) {
            (s.items || []).forEach(function (it) {
                const key = it.product || it.name || 'item';
                if (!productMap[key]) productMap[key] = { name: it.name || key, qty: 0, amount: 0 };
                productMap[key].qty += Number(it.qty) || 0;
                productMap[key].amount += Number(it.lineTotal) || ((Number(it.qty) || 0) * (Number(it.price) || 0));
            });
        });
        const topProducts = Object.keys(productMap).map(function (k) { return productMap[k]; })
            .sort(function (a, b) { return b.qty - a.qty || b.amount - a.amount; })
            .slice(0, 5);
        const topEl = document.getElementById('cortesTopProducts');
        if (topEl) {
            if (!topProducts.length) {
                topEl.innerHTML = '<div class="cortes-empty">Sin productos en este periodo</div>';
            } else {
                topEl.innerHTML = topProducts.map(function (p) {
                    return '<div class="cortes-row">' +
                        '<div class="left"><span class="name">' + esc(p.name) + '</span></div>' +
                        '<span class="amt">' + p.qty + ' · ' + money(p.amount) + '</span>' +
                        '</div>';
                }).join('');
            }
        }

        const countEl = document.getElementById('cortesListCount');
        if (countEl) countEl.textContent = tickets + (tickets === 1 ? ' ticket' : ' tickets');

        const listHost = document.getElementById('cortesSalesBody');
        if (listHost) {
            if (!list.length) {
                listHost.innerHTML = '<div class="cortes-invoice-empty">Sin ventas en este periodo</div>';
            } else {
                const sorted = list.slice().sort(function (a, b) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                const cap = 200;
                const shown = sorted.length > cap ? sorted.slice(0, cap) : sorted;
                listHost.innerHTML = shown.map(function (s) {
                    const d = new Date(s.createdAt);
                    const clientLabel = saleClientLabel(s);
                    const itemsPreview = saleItemsPreview(s);
                    const billOk = s.billing === 'facturado';
                    return '<div class="cortes-invoice-row" role="button" tabindex="0" data-open-note="' + esc(s.id) + '" title="Ver nota de venta">' +
                        '<div class="cortes-invoice-date">' +
                            '<div class="d">' + esc(formatInvoiceDate(d)) + '</div>' +
                            '<div class="sub">' + esc(relativeSaleSub(d)) +
                            (saleReceiptId(s)
                                ? ' · Recibo ' + esc(saleReceiptId(s))
                                : (s.folio ? ' · ' + esc(s.folio) : '')) +
                            (saleStoreName(s) ? ' · ' + esc(saleStoreName(s)) : '') + '</div>' +
                        '</div>' +
                        '<div class="cortes-invoice-pills">' +
                            '<span class="cortes-pill">' + esc(formatSalePayLabel(s)) + '</span>' +
                            '<span class="cortes-pill' + (billOk ? ' ok' : '') + '">' + esc(billLabel(s.billing)) + '</span>' +
                        '</div>' +
                        '<div class="cortes-invoice-client">' +
                            '<div class="name">' + esc(clientLabel) + '</div>' +
                            '<div class="items">' + esc(itemsPreview) + '</div>' +
                        '</div>' +
                        '<div class="cortes-invoice-amt">' + money(s.total) + '</div>' +
                        '</div>';
                }).join('') +
                (sorted.length > cap
                    ? '<div class="cortes-invoice-empty muted">Mostrando ' + cap + ' de ' + sorted.length + ' tickets</div>'
                    : '');
            }
        }

        document.querySelectorAll('#cortesPeriodTabs button').forEach(function (btn) {
            const active = btn.getAttribute('data-period') === cortesPeriod;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    }

    function fillHistoryClientFilter() {
        const sel = document.getElementById('posHistoryClientFilter');
        if (!sel) return;
        const current = historyClientFilter;
        sel.innerHTML = '<option value="all">Todos los clientes</option>' +
            '<option value="walkin">Solo mostrador</option>' +
            clients.slice().sort(function (a, b) {
                return String(a.name).localeCompare(String(b.name), 'es');
            }).map(function (c) {
                return '<option value="' + esc(c.id) + '">' + esc(clientDisplay(c)) + '</option>';
            }).join('');
        sel.value = current;
    }

    function renderPrices() {
        const tbody = document.getElementById('posPricesBody');
        if (!tbody) return;
        const q = (document.getElementById('posPriceSearch') && document.getElementById('posPriceSearch').value || '').toLowerCase().trim();
        const list = pricedCatalog().filter(function (p) {
            const fam = p.family || '';
            const famOk = priceFamilyFilter === 'all'
                || (priceFamilyFilter === PRODUCT_UNCATEGORIZED_ID ? !fam : fam === priceFamilyFilter);
            const qOk = !q || [p.name, p.code, fam, p.listName, p.id].some(function (v) {
                return String(v || '').toLowerCase().includes(q);
            });
            return famOk && qOk;
        });
        if (!list.length) {
            tbody.innerHTML = '<tr><td colspan="10" class="empty">Sin resultados</td></tr>';
            return;
        }
        tbody.innerHTML = list.map(function (p) {
            const entry = prices[p.id] || { presentationKg: p.presentationKg, tiers: sixTiers(400) };
            const kg = entry.presentationKg != null ? entry.presentationKg : (p.presentationKg != null ? p.presentationKg : '—');
            const displayName = (p.kind === 'liquido' && p.listName) ? p.listName : p.name;
            const unit = p.kind === 'liquido'
                ? liquidUnitLabel(kg === '—' ? null : kg, p.unitLabel)
                : (kg !== '—' ? ('Saco ' + kg + ' kg') : 'Saco');
            const tierCells = TIER_IDS.map(function (tid, i) {
                const val = entry.tiers && entry.tiers[i] != null ? entry.tiers[i] : 0;
                return '<td><input class="price-input num" type="number" min="0" step="0.01" ' +
                    'data-price-id="' + esc(p.id) + '" data-tier="' + i + '" value="' + esc(String(val)) + '"></td>';
            }).join('');
            const badge = p.fromRecipe ? '' : '<div class="muted">Solo lista · sin ficha POS</div>';
            return '<tr>' +
                '<td class="muted">' + esc(p.code || p.id) + '</td>' +
                '<td>' + (p.family ? '<span class="fam" title="' + esc(p.family) + '">' + familyDot(p.family) + '</span> ' : '') +
                esc(displayName) +
                badge + '</td>' +
                '<td class="num">' + esc(String(kg)) + '</td>' +
                '<td class="muted">' + esc(unit) + '</td>' +
                tierCells +
                '</tr>';
        }).join('');
    }

    function renderClients() {
        const tbody = document.getElementById('posClientsBody');
        if (!tbody) return;
        const q = (document.getElementById('posClientSearch') && document.getElementById('posClientSearch').value || '').toLowerCase().trim();
        const list = clients.filter(function (c) {
            return !q || [c.name, c.phone, c.email, c.company, c.rfc, clientAddress(c)].some(function (v) {
                return String(v || '').toLowerCase().includes(q);
            });
        }).sort(function (a, b) {
            return String(a.name).localeCompare(String(b.name), 'es');
        });
        if (!list.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty">Sin clientes. Agrega el primero.</td></tr>';
            return;
        }
        tbody.innerHTML = list.map(function (c) {
            const dist = isDistributorClient(c);
            const displayName = toTitleCaseName(c.name);
            const displayCompany = toTitleCaseName(c.company);
            const addr = toTitleCaseName(clientAddress(c));
            const pending = clientPendingGroup(c);
            return '<tr data-open-client="' + esc(c.id) + '">' +
                '<td class="clients-name-cell"><strong title="' + esc(displayName) + '">' + esc(displayName) + '</strong>' +
                (displayCompany ? '<div class="muted clients-company-cell" title="' + esc(displayCompany) + '">' + esc(displayCompany) + '</div>' : '') +
                (addr ? '<div class="muted clients-address-cell" title="' + esc(addr) + '">' + esc(addr) + '</div>' : '') +
                '</td>' +
                '<td><span class="badge' + (dist ? ' b-primary' : '') + '">' + esc(clientTypeLabel(c)) + '</span>' +
                (pending && pending.amount > 0
                    ? ' <i class="fa-solid fa-hand-holding-dollar muted" style="opacity:.7;margin-left:4px" title="Saldo pendiente"></i>'
                    : '') +
                '</td>' +
                '<td>' + esc(c.phone || '—') + '</td>' +
                '<td class="clients-email-cell">' + formatClientEmailsHtml(c.email) + '</td>' +
                '<td class="muted">' + esc(c.rfc || '—') + '</td>' +
                '<td><div class="row-actions">' +
                '<button type="button" class="icon-action" data-open-client="' + esc(c.id) + '" title="Abrir"><i class="fa-solid fa-arrow-up-right-from-square"></i></button>' +
                '<button type="button" class="icon-action danger" data-del-client="' + esc(c.id) + '" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>' +
                '</div></td></tr>';
        }).join('');
    }

    function salesForClient(client) {
        if (!client) return [];
        const id = client.id;
        const nameKey = String(client.name || '').trim().toLowerCase();
        return salesForAnalytics().filter(function (s) {
            if (id && s.clientId === id) return true;
            if (!s.clientId && nameKey) {
                const n = String(s.customer || (s.client && s.client.name) || '').trim().toLowerCase();
                return n && n === nameKey;
            }
            return false;
        });
    }

    function clientPendingGroup(client) {
        if (!client) return null;
        const groups = groupPendingByClient();
        let g = groups.filter(function (x) {
            return x.clientId === client.id || x.key === ('id:' + client.id);
        })[0];
        if (g) return g;
        const nameKey = 'name:' + String(client.name || '').trim().toLowerCase();
        return groups.filter(function (x) { return x.key === nameKey; })[0] || null;
    }

    function buildClientProductSeries(periodSales) {
        const catalog = catalogProductsForMovements();
        const series = [];
        catalog.forEach(function (p, i) {
            const list = productRhythmSeries(periodSales, productMatchKeys(p.slug));
            if (!list.length) return;
            let qty = 0;
            let amount = 0;
            list.forEach(function (row) {
                qty += Number(row.qty) || 0;
                amount += Number(row.total) || 0;
            });
            if (!(qty > 0 || amount > 0)) return;
            series.push({
                key: p.slug,
                label: p.name,
                color: PRODUCT_LINE_PALETTE[i % PRODUCT_LINE_PALETTE.length],
                list: list,
                qty: qty,
                amount: amount
            });
        });
        series.sort(function (a, b) { return b.amount - a.amount || a.label.localeCompare(b.label, 'es'); });
        return series;
    }

    function clientPayBreakdown(periodSales) {
        const map = { efectivo: 0, tarjeta: 0, transferencia: 0, por_cobrar: 0 };
        periodSales.forEach(function (s) {
            salePaymentLines(s).forEach(function (p) {
                const k = isValidPayMethod(p.method) ? p.method : 'efectivo';
                map[k] = (map[k] || 0) + (Number(p.amount) || 0);
            });
        });
        return map;
    }

    function clientCityBreakdown(periodSales) {
        const map = {};
        periodSales.forEach(function (s) {
            const city = resolveSaleCity(s);
            map[city] = (map[city] || 0) + (Number(s.total) || 0);
        });
        return Object.keys(map).map(function (id) {
            return { id: id, label: cityLabel(id), amount: map[id] };
        }).sort(function (a, b) { return b.amount - a.amount; });
    }

    function setCdTypeForm(type) {
        const t = normalizeClientType(type);
        const seg = document.getElementById('cdTypeSeg');
        if (seg) {
            seg.querySelectorAll('button[data-cd-type]').forEach(function (btn) {
                const on = btn.getAttribute('data-cd-type') === t;
                btn.classList.toggle('active', on);
                btn.setAttribute('aria-selected', on ? 'true' : 'false');
                btn.disabled = !clientDashEditing;
            });
        }
        const ro = document.getElementById('cdTypeReadonly');
        if (ro) ro.textContent = t === 'distributor' ? 'Distribuidor' : 'Cliente';
    }
    function cdTypeFromForm() {
        const active = document.querySelector('#cdTypeSeg button.active');
        return normalizeClientType(active && active.getAttribute('data-cd-type'));
    }

    function setCdEditModeSeg(editing) {
        const seg = document.getElementById('cdEditModeSeg');
        if (!seg) return;
        const mode = editing ? 'edit' : 'view';
        seg.querySelectorAll('button[data-cd-edit-mode]').forEach(function (btn) {
            const on = btn.getAttribute('data-cd-edit-mode') === mode;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
        });
    }

    function setClientDashEditMode(editing) {
        clientDashEditing = !!editing;
        const card = document.getElementById('cdDataCard') || document.querySelector('.client-dash-data');
        if (card) card.classList.toggle('is-editing', clientDashEditing);
        setCdEditModeSeg(clientDashEditing);
        const actions = document.getElementById('cdFormActions');
        if (actions) actions.hidden = !clientDashEditing;
        ['cdName', 'cdPhone', 'cdEmail', 'cdCompany', 'cdRfc', 'cdAddress'].forEach(function (id) {
            const el = document.getElementById(id);
            if (!el) return;
            if (clientDashEditing) el.removeAttribute('readonly');
            else el.setAttribute('readonly', '');
        });
        setCdTypeForm(cdTypeFromForm());
    }

    function fillClientDashboardForm(client) {
        if (!client) return;
        const title = document.getElementById('cdNameTitle');
        if (title) title.textContent = toTitleCaseName(client.name) || 'Cliente';
        const meta = document.getElementById('cdHeroMeta');
        if (meta) {
            meta.innerHTML =
                '<span class="badge' + (isDistributorClient(client) ? ' b-primary' : '') + '">' + esc(clientTypeLabel(client)) + '</span>' +
                (client.company ? '<span>' + esc(toTitleCaseName(client.company)) + '</span>' : '') +
                (client.phone ? '<span>' + esc(client.phone) + '</span>' : '');
        }
        document.getElementById('cdName').value = client.name || '';
        document.getElementById('cdPhone').value = client.phone || '';
        document.getElementById('cdEmail').value = client.email || '';
        document.getElementById('cdCompany').value = client.company || '';
        document.getElementById('cdRfc').value = client.rfc || '';
        const addrEl = document.getElementById('cdAddress');
        if (addrEl) addrEl.value = clientAddress(client);
        setCdTypeForm(client.type || client.kind || 'client');
        const metaLine = document.getElementById('cdMetaLine');
        if (metaLine) {
            const created = client.createdAt ? new Date(client.createdAt) : null;
            metaLine.textContent = created && !isNaN(created)
                ? ('Alta · ' + created.toLocaleDateString('es-MX', { dateStyle: 'medium' }))
                : '';
        }
    }

    function saveClientDashboardForm() {
        if (!clientDashId) return;
        const name = toTitleCaseName(document.getElementById('cdName').value);
        if (!name) return;
        const emailRaw = document.getElementById('cdEmail').value;
        const badEmails = invalidClientEmails(emailRaw);
        if (badEmails.length) {
            toast('Email inválido: ' + badEmails[0]);
            return;
        }
        const addrEl = document.getElementById('cdAddress');
        const next = {
            id: clientDashId,
            name: name,
            phone: (document.getElementById('cdPhone').value || '').trim(),
            email: normalizeClientEmail(emailRaw),
            company: toTitleCaseName(document.getElementById('cdCompany').value),
            rfc: (document.getElementById('cdRfc').value || '').trim(),
            address: addrEl ? toTitleCaseName(String(addrEl.value || '').trim().replace(/\s+/g, ' ')) : '',
            type: cdTypeFromForm(),
            updatedAt: new Date().toISOString()
        };
        const idx = clients.findIndex(function (c) { return c.id === next.id; });
        if (idx < 0) return;
        const merged = Object.assign({}, clients[idx], next);
        delete merged.domicilio;
        delete merged.localidad;
        markClientUserEdited(merged);
        clients[idx] = merged;
        saveClients();
        fillClientSelect();
        fillHistoryClientFilter();
        applyCartTierPrices();
        renderProducts();
        renderCart();
        renderClients();
        setClientDashEditMode(false);
        renderClientDashboard(clientDashId);
        toast('Cliente actualizado');
    }

    function openClientDashboard(id) {
        const client = clientById(id);
        if (!client) return;
        clientDashId = id;
        clientDashEditing = false;
        const listView = document.getElementById('clientsListView');
        const detailView = document.getElementById('clientsDetailView');
        if (listView) listView.hidden = true;
        if (detailView) detailView.hidden = false;
        renderClientDashboard(id);
    }

    function closeClientDashboard() {
        clientDashId = null;
        clientDashEditing = false;
        setClientDashEditMode(false);
        const listView = document.getElementById('clientsListView');
        const detailView = document.getElementById('clientsDetailView');
        if (listView) listView.hidden = false;
        if (detailView) detailView.hidden = true;
        renderClients();
    }

    function openCobranzaForClient(clientId) {
        const client = clientById(clientId);
        const group = clientPendingGroup(client);
        if (!group) return;
        if (window.S35PanelAPI && typeof window.S35PanelAPI.showSection === 'function') {
            window.S35PanelAPI.showSection('cobranza');
        } else {
            const link = document.querySelector('.nav a[data-section="cobranza"]');
            if (link) link.click();
        }
        setTimeout(function () {
            openCobranzaDetail(group.key);
        }, 60);
    }

    function bindClientDashboardControls() {
        if (clientDashBound) return;
        clientDashBound = true;
        const back = document.getElementById('clientsBackBtn');
        if (back) back.addEventListener('click', function () { closeClientDashboard(); });
        const debt = document.getElementById('cdDebtBtn');
        if (debt) {
            debt.addEventListener('click', function () {
                if (clientDashId) openCobranzaForClient(clientDashId);
            });
        }
        const form = document.getElementById('cdForm');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                if (!clientDashEditing) return;
                saveClientDashboardForm();
            });
        }
        const editModeSeg = document.getElementById('cdEditModeSeg');
        if (editModeSeg) {
            editModeSeg.addEventListener('click', function (e) {
                const btn = e.target.closest('button[data-cd-edit-mode]');
                if (!btn) return;
                e.preventDefault();
                const next = btn.getAttribute('data-cd-edit-mode') === 'edit';
                if (next === clientDashEditing) return;
                if (!next && clientDashId) {
                    const client = clientById(clientDashId);
                    if (client) fillClientDashboardForm(client);
                }
                setClientDashEditMode(next);
            });
        }
        const typeSeg = document.getElementById('cdTypeSeg');
        if (typeSeg) {
            typeSeg.addEventListener('click', function (e) {
                if (!clientDashEditing) return;
                const btn = e.target.closest('button[data-cd-type]');
                if (!btn) return;
                e.preventDefault();
                setCdTypeForm(btn.getAttribute('data-cd-type'));
            });
        }
        const del = document.getElementById('cdDeleteBtn');
        if (del) {
            del.addEventListener('click', function () {
                if (!clientDashId) return;
                const c = clientById(clientDashId);
                if (!c) return;
                if (!confirm('¿Eliminar «' + c.name + '»?')) return;
                clients = clients.filter(function (x) { return x.id !== clientDashId; });
                saveClients();
                closeClientDashboard();
                fillClientSelect();
                fillHistoryClientFilter();
                applyCartTierPrices();
                renderProducts();
                renderCart();
                toast('Cliente eliminado');
            });
        }
        const tabs = document.getElementById('cdPeriodTabs');
        if (tabs) {
            tabs.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-cd-period]');
                if (!btn) return;
                const next = btn.getAttribute('data-cd-period');
                if (!next || next === clientDashPeriod) return;
                clientDashPeriod = next;
                if (clientDashPeriod === 'historial') clientDashOffset = 0;
                if (clientDashId) renderClientDashboard(clientDashId);
            });
        }
        const prev = document.getElementById('cdPrev');
        if (prev) {
            prev.addEventListener('click', function () {
                if (clientDashPeriod === 'historial') return;
                clientDashOffset -= 1;
                if (clientDashId) renderClientDashboard(clientDashId);
            });
        }
        const next = document.getElementById('cdNext');
        if (next) {
            next.addEventListener('click', function () {
                if (clientDashPeriod === 'historial' || clientDashOffset >= 0) return;
                clientDashOffset += 1;
                if (clientDashId) renderClientDashboard(clientDashId);
            });
        }
        const reset = document.getElementById('cdReset');
        if (reset) {
            reset.addEventListener('click', function () {
                if (clientDashPeriod === 'historial') return;
                clientDashOffset = 0;
                if (clientDashId) renderClientDashboard(clientDashId);
            });
        }
        const salesBody = document.getElementById('cdSalesBody');
        if (salesBody) {
            salesBody.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-open-note]');
                if (!btn) return;
                openSaleNoteById(btn.getAttribute('data-open-note'));
            });
        }
    }

    function renderClientDashboard(id) {
        const host = document.getElementById('clientsDetailView');
        if (!host || host.hidden) return;
        const client = clientById(id || clientDashId);
        if (!client) {
            closeClientDashboard();
            return;
        }
        clientDashId = client.id;
        bindClientDashboardControls();
        if (!clientDashEditing) {
            fillClientDashboardForm(client);
            setClientDashEditMode(false);
        } else {
            setClientDashEditMode(true);
        }

        const pending = clientPendingGroup(client);
        const debtBtn = document.getElementById('cdDebtBtn');
        if (debtBtn) {
            const show = !!(pending && pending.amount > 0);
            debtBtn.hidden = !show;
            if (show) {
                debtBtn.title = 'Saldo ' + money(pending.amount) + ' · ver cobranza';
            }
        }

        const isHist = clientDashPeriod === 'historial';
        if (isHist) clientDashOffset = 0;
        const bounds = periodBounds(clientDashPeriod, clientDashOffset);
        const allSales = salesForClient(client);
        const periodSales = salesInRange(allSales, bounds.start, bounds.end);
        const series = buildClientProductSeries(periodSales);

        let amount = 0;
        let units = 0;
        periodSales.forEach(function (s) {
            amount += Number(s.total) || 0;
        });
        series.forEach(function (s) { units += s.qty; });
        const tickets = periodSales.length;
        const avg = tickets ? amount / tickets : 0;

        const setTxt = function (eid, v) {
            const el = document.getElementById(eid);
            if (el) el.textContent = v;
        };
        setTxt('cdKpiAmount', money(amount));
        setTxt('cdKpiTickets', String(tickets));
        setTxt('cdKpiAvg', tickets ? money(avg) : '—');
        setTxt('cdKpiUnits', formatUnits(units).replace(/ u$/, ''));

        const rangeLabel = document.getElementById('cdRangeLabel');
        if (rangeLabel) {
            rangeLabel.textContent = formatPeriodLabel(clientDashPeriod, bounds.start, bounds.end);
            rangeLabel.disabled = isHist;
            rangeLabel.title = isHist ? 'Historial completo' : 'Elegir periodo';
        }
        const prevBtn = document.getElementById('cdPrev');
        const nextBtn = document.getElementById('cdNext');
        const resetBtn = document.getElementById('cdReset');
        if (prevBtn) prevBtn.disabled = isHist;
        if (nextBtn) nextBtn.disabled = isHist || clientDashOffset >= 0;
        if (resetBtn) resetBtn.disabled = isHist || clientDashOffset === 0;
        document.querySelectorAll('#cdPeriodTabs [data-cd-period]').forEach(function (btn) {
            const on = btn.getAttribute('data-cd-period') === clientDashPeriod;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
        });

        const hint = document.getElementById('cdSalesHint');
        if (hint) {
            const last = allSales.slice().sort(function (a, b) {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })[0];
            if (!allSales.length) {
                hint.textContent = 'Sin compras registradas';
            } else if (last) {
                const d = new Date(last.createdAt);
                hint.textContent = 'Última compra · ' +
                    (isNaN(d) ? '—' : d.toLocaleDateString('es-MX', { dateStyle: 'medium' }));
            }
        }

        const payMap = clientPayBreakdown(periodSales);
        const cities = clientCityBreakdown(periodSales);
        const side = document.getElementById('cdSideBits');
        if (side) {
            const payBits = payMethodKeys().filter(function (k) { return payMap[k] > 0; })
                .map(function (k) {
                    return '<span class="bit">' + esc(payLabel(k)) + ' <strong>' + money(payMap[k]) + '</strong></span>';
                }).join('');
            const cityBits = cities.slice(0, 3).map(function (c) {
                return '<span class="bit">' + esc(c.label) + ' <strong>' + money(c.amount) + '</strong></span>';
            }).join('');
            side.innerHTML = (payBits || cityBits)
                ? (payBits + (payBits && cityBits ? ' · ' : '') + cityBits)
                : '';
        }

        const legend = document.getElementById('cdChartLegend');
        if (legend) {
            legend.innerHTML = series.map(function (s) {
                return '<span class="leg"><span class="swatch" style="background:' + esc(s.color) +
                    ';border-color:' + esc(s.color) + '"></span> ' + esc(s.label) + '</span>';
            }).join('');
        }

        let merged = [];
        series.forEach(function (s) { merged = merged.concat(s.list || []); });
        renderRhythmChart({
            host: document.getElementById('cdChart'),
            subEl: document.getElementById('cdChartSub'),
            hatchId: 'clientDashHatch',
            period: clientDashPeriod,
            bounds: bounds,
            list: merged,
            prevBounds: null,
            prevList: [],
            citySeries: series.length ? series : null,
            showUnits: true,
            seriesHint: 'por producto'
        });

        const prodBody = document.getElementById('cdProductsBody');
        const prodCount = document.getElementById('cdProductsCount');
        if (prodCount) prodCount.textContent = String(series.length);
        if (prodBody) {
            if (!series.length) {
                prodBody.innerHTML = '<tr><td colspan="4" class="empty">Sin productos en este periodo</td></tr>';
            } else {
                const totalAmt = series.reduce(function (s, r) { return s + r.amount; }, 0) || 1;
                prodBody.innerHTML = series.map(function (r) {
                    const pct = Math.round((r.amount / totalAmt) * 100);
                    return '<tr>' +
                        '<td>' + esc(r.label) + '</td>' +
                        '<td class="num">' + esc(formatUnits(r.qty).replace(/ u$/, '')) + '</td>' +
                        '<td class="num">' + money(r.amount) + '</td>' +
                        '<td class="num muted">' + pct + '%</td>' +
                        '</tr>';
                }).join('');
            }
        }

        const salesSorted = periodSales.slice().sort(function (a, b) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        const salesBody = document.getElementById('cdSalesBody');
        const salesCount = document.getElementById('cdSalesCount');
        if (salesCount) salesCount.textContent = String(salesSorted.length);
        if (salesBody) {
            if (!salesSorted.length) {
                salesBody.innerHTML = '<tr><td colspan="6" class="empty">Sin compras en este periodo</td></tr>';
            } else {
                salesBody.innerHTML = salesSorted.slice(0, 40).map(function (s) {
                    const d = new Date(s.createdAt);
                    const dateStr = isNaN(d) ? '—' : d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
                    return '<tr>' +
                        '<td class="muted">' + esc(dateStr) + '</td>' +
                        '<td>' + saleReceiptCellHtml(s) + '</td>' +
                        '<td><span class="badge">' + esc(formatSalePayLabel(s)) + '</span></td>' +
                        '<td class="muted">' + esc(cityLabel(resolveSaleCity(s))) + '</td>' +
                        '<td class="num">' + money(s.total) + '</td>' +
                        '<td><button type="button" class="btn ghost" data-open-note="' + esc(s.id) + '">Ver</button></td>' +
                        '</tr>';
                }).join('');
            }
        }
    }

    function setClientTypeForm(type) {
        const t = normalizeClientType(type);
        const seg = document.getElementById('clientTypeSeg');
        if (!seg) return;
        seg.querySelectorAll('button[data-client-type]').forEach(function (btn) {
            const on = btn.getAttribute('data-client-type') === t;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
        });
    }
    function clientTypeFromForm() {
        const active = document.querySelector('#clientTypeSeg button.active');
        return normalizeClientType(active && active.getAttribute('data-client-type'));
    }

    function openClientModal(client, opts) {
        opts = opts || {};
        editingClientId = client ? client.id : null;
        document.getElementById('clientModalTitle').textContent = client ? 'Editar cliente' : 'Nuevo cliente';
        document.getElementById('clientName').value = client ? client.name : (opts.name || '');
        document.getElementById('clientPhone').value = client ? (client.phone || '') : '';
        document.getElementById('clientEmail').value = client ? (client.email || '') : '';
        document.getElementById('clientCompany').value = client ? (client.company || '') : '';
        document.getElementById('clientRfc').value = client ? (client.rfc || '') : '';
        const addrEl = document.getElementById('clientAddress');
        if (addrEl) addrEl.value = client ? clientAddress(client) : '';
        setClientTypeForm(client ? (client.type || client.kind) : 'client');
        const modal = document.getElementById('clientModal');
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.getElementById('clientName').focus();
    }
    function closeClientModal() {
        const modal = document.getElementById('clientModal');
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        editingClientId = null;
    }

    function bind() {
        bindPeriodRangePicker();

        const modeTabs = document.getElementById('posModeTabs');
        if (modeTabs) {
            modeTabs.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-pos-mode]');
                if (!btn) return;
                setPosMode(btn.getAttribute('data-pos-mode'));
            });
        }
        const gastoForm = document.getElementById('posGastoForm');
        if (gastoForm) gastoForm.addEventListener('submit', registerCajaGasto);
        const dineroCity = document.getElementById('dineroCitySelect');
        if (dineroCity) {
            dineroCity.addEventListener('change', function () {
                dineroCityFilter = dineroCity.value || 'all';
                renderDinero();
            });
        }
        const dineroForm = document.getElementById('dineroMovForm');
        if (dineroForm) dineroForm.addEventListener('submit', submitDineroMov);
        const dineroLedgerBar = document.getElementById('dineroLedgerAccount');
        if (dineroLedgerBar) {
            dineroLedgerBar.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-dinero-ledger]');
                if (!btn) return;
                dineroLedgerFilter = btn.getAttribute('data-dinero-ledger') || 'all';
                renderDineroMovs();
            });
        }
        const dineroSearch = document.getElementById('dineroLedgerSearch');
        if (dineroSearch) {
            dineroSearch.addEventListener('input', function () {
                dineroLedgerQuery = dineroSearch.value || '';
                renderDineroMovs();
            });
        }
        const dineroMovs = document.getElementById('dineroMovsList');
        if (dineroMovs) {
            dineroMovs.addEventListener('click', function (e) {
                const rm = e.target.closest('[data-rm-dinero-mov]');
                if (!rm) return;
                const id = rm.getAttribute('data-rm-dinero-mov');
                if (!id) return;
                if (!window.confirm('¿Eliminar este movimiento de cuenta?')) return;
                removeTesoreriaMov(id);
            });
        }
        const gastosList = document.getElementById('posGastosList');
        if (gastosList) {
            gastosList.addEventListener('click', function (e) {
                const rm = e.target.closest('[data-rm-gasto]');
                if (!rm) return;
                const id = rm.getAttribute('data-rm-gasto');
                if (!id) return;
                if (!window.confirm('¿Eliminar este gasto de caja?')) return;
                removeCajaGasto(id);
            });
        }

        const chips = document.getElementById('posFamilyChips');
        if (chips) {
            chips.addEventListener('click', function (e) {
                const btn = e.target.closest('.chip[data-fam]');
                if (!btn) return;
                familyFilter = btn.getAttribute('data-fam') || defaultPosFamilyFilter();
                if (familyFilter === 'all') familyFilter = defaultPosFamilyFilter();
                renderChips();
                renderProducts();
            });
        }
        const search = document.getElementById('posProductSearch');
        if (search) search.addEventListener('input', renderProducts);

        const grid = document.getElementById('posProductGrid');
        if (grid) {
            grid.addEventListener('click', function (e) {
                const card = e.target.closest('[data-add]');
                if (card) addToCart(card.getAttribute('data-add'));
            });
        }

        const cartBody = document.getElementById('posCartBody');
        if (cartBody) {
            cartBody.addEventListener('click', function (e) {
                if (e.target.closest('#posClearPromoCodeBtn')) {
                    clearAppliedPromoCode();
                    return;
                }
                const editPrice = e.target.closest('[data-edit-price]');
                if (editPrice) {
                    e.preventDefault();
                    beginEditCartPrice(Number(editPrice.getAttribute('data-edit-price')));
                    return;
                }
                const inc = e.target.closest('[data-inc]');
                const dec = e.target.closest('[data-dec]');
                const rm = e.target.closest('[data-rm]');
                if (inc) {
                    const i = Number(inc.getAttribute('data-inc'));
                    if (cart[i] && !cart[i].promoAuto) setCartQty(i, cart[i].qty + 1);
                } else if (dec) {
                    const i = Number(dec.getAttribute('data-dec'));
                    if (cart[i] && !cart[i].promoAuto) {
                        if (cart[i].qty <= 1) {
                            cart.splice(i, 1);
                            editingPriceIdx = null;
                            refreshCartAfterLineChange();
                        } else {
                            setCartQty(i, cart[i].qty - 1);
                        }
                    }
                } else if (rm) {
                    const i = Number(rm.getAttribute('data-rm'));
                    if (cart[i] && cart[i].promoAuto) return;
                    cart.splice(i, 1);
                    editingPriceIdx = null;
                    refreshCartAfterLineChange();
                }
            });
            cartBody.addEventListener('change', function (e) {
                const qtyInput = e.target.closest('.qty-input');
                if (qtyInput) {
                    commitQtyInput(qtyInput);
                    return;
                }
                const priceInput = e.target.closest('.ci-price-input');
                if (priceInput) commitCartPriceInput(priceInput);
            });
            cartBody.addEventListener('keydown', function (e) {
                const qtyInput = e.target.closest('.qty-input');
                if (qtyInput) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        commitQtyInput(qtyInput);
                        qtyInput.blur();
                    }
                    return;
                }
                const priceInput = e.target.closest('.ci-price-input');
                if (!priceInput) return;
                if (e.key === 'Enter') {
                    e.preventDefault();
                    commitCartPriceInput(priceInput);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    editingPriceIdx = null;
                    renderCart();
                }
            });
            cartBody.addEventListener('focusout', function (e) {
                const qtyInput = e.target.closest('.qty-input');
                if (qtyInput) {
                    commitQtyInput(qtyInput);
                    return;
                }
                const priceInput = e.target.closest('.ci-price-input');
                if (!priceInput) return;
                /* Evitar commit si el foco queda dentro del mismo meta (p. ej. click en badge). */
                const next = e.relatedTarget;
                if (next && priceInput.closest('.ci-meta') && priceInput.closest('.ci-meta').contains(next)) return;
                commitCartPriceInput(priceInput);
            });
        }

        const clearCart = document.getElementById('posClearCartBtn');
        if (clearCart) {
            clearCart.addEventListener('click', function () {
                if (!cart.length && !appliedPromoCode) return;
                if (!confirm('¿Vaciar el ticket?')) return;
                cart = [];
                appliedPromoCode = null;
                editingPriceIdx = null;
                renderCart();
                renderProducts();
            });
        }
        const checkoutBtn = document.getElementById('posCheckoutBtn');
        if (checkoutBtn) checkoutBtn.addEventListener('click', function () { checkout(); });

        const paySplitCb = document.getElementById('posPaySplit');
        if (paySplitCb) {
            paySplitCb.addEventListener('change', syncPosPaySplitUi);
        }
        const paySplitPanel = document.getElementById('posPaySplitPanel');
        if (paySplitPanel) {
            paySplitPanel.addEventListener('click', function (e) {
                if (e.target.closest('#posPaySplitAdd')) {
                    const rows = document.getElementById('posPaySplitRows');
                    if (!rows) return;
                    const used = {};
                    readPosPaySplitLines().forEach(function (p) { used[p.method] = true; });
                    const next = payMethodKeys().filter(function (k) {
                        return k !== 'por_cobrar' && !used[k];
                    })[0] || 'efectivo';
                    rows.insertAdjacentHTML('beforeend', posPaySplitRowHtml(next, ''));
                    refreshPosPaySplitSummary();
                    return;
                }
                const rm = e.target.closest('[data-pos-split-remove]');
                if (rm) {
                    const row = rm.closest('.pay-split-row');
                    const rows = document.getElementById('posPaySplitRows');
                    if (row && rows && rows.children.length > 1) {
                        row.remove();
                        refreshPosPaySplitSummary();
                    }
                }
            });
            paySplitPanel.addEventListener('input', function (e) {
                if (e.target.closest('[data-pos-split-amount], [data-pos-split-method]')) {
                    refreshPosPaySplitSummary();
                }
            });
            paySplitPanel.addEventListener('change', function (e) {
                if (e.target.closest('[data-pos-split-method]')) refreshPosPaySplitSummary();
            });
        }
        syncPosPaySplitUi();

        /* Banner de código aplicado (fuera del body, delegación en cart). */
        const cartRoot = document.querySelector('.pos-cart');
        if (cartRoot) {
            cartRoot.addEventListener('click', function (e) {
                if (e.target.closest('#posClearPromoCodeBtn')) {
                    clearAppliedPromoCode();
                }
            });
        }

        function wirePromoOpen(el) {
            if (el) el.addEventListener('click', openPromoModal);
        }
        wirePromoOpen(document.getElementById('posPromoBtn'));
        wirePromoOpen(document.getElementById('posPromoCartBtn'));
        const promoClose = document.getElementById('posPromoModalClose');
        if (promoClose) promoClose.addEventListener('click', closePromoModal);
        const promoCancel = document.getElementById('posPromoCancel');
        if (promoCancel) promoCancel.addEventListener('click', closePromoModal);
        const promoModal = document.getElementById('posPromoModal');
        if (promoModal) {
            promoModal.addEventListener('click', function (e) {
                if (e.target === promoModal) closePromoModal();
            });
        }
        const promoForm = document.getElementById('posPromoForm');
        if (promoForm) promoForm.addEventListener('submit', submitPromoForm);
        const promoClearInModal = document.getElementById('posPromoClearBtn');
        if (promoClearInModal) {
            promoClearInModal.addEventListener('click', function () {
                clearAppliedPromoCode();
                closePromoModal();
            });
        }

        bindPromoAdmin();

        const histSearch = document.getElementById('posHistorySearch');
        if (histSearch) {
            histSearch.addEventListener('input', function () {
                clearTimeout(historySearchTimer);
                historySearchTimer = setTimeout(function () {
                    historyPage = 1;
                    renderHistory();
                }, 180);
            });
        }
        const histFilter = document.getElementById('posHistoryClientFilter');
        if (histFilter) {
            histFilter.addEventListener('change', function () {
                historyClientFilter = histFilter.value || 'all';
                historyPage = 1;
                renderHistory();
            });
        }
        ['posHistoryFrom', 'posHistoryTo'].forEach(function (id) {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('change', function () {
                historyPage = 1;
                renderHistory();
            });
        });
        const histPageSize = document.getElementById('posHistoryPageSize');
        if (histPageSize) {
            histPageSize.addEventListener('change', function () {
                historyPageSize = Number(histPageSize.value) || 20;
                historyPage = 1;
                renderHistory();
            });
        }
        const histPrev = document.getElementById('posHistoryPrev');
        if (histPrev) {
            histPrev.addEventListener('click', function () {
                if (historyPage <= 1) return;
                historyPage -= 1;
                renderHistory();
            });
        }
        const histNext = document.getElementById('posHistoryNext');
        if (histNext) {
            histNext.addEventListener('click', function () {
                historyPage += 1;
                renderHistory();
            });
        }
        const histBody = document.getElementById('posHistoryBody');
        if (histBody) {
            histBody.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-open-note]');
                if (!btn) return;
                openSaleNoteById(btn.getAttribute('data-open-note'));
            });
        }
        const cortesSalesBody = document.getElementById('cortesSalesBody');
        if (cortesSalesBody) {
            cortesSalesBody.addEventListener('click', function (e) {
                const row = e.target.closest('[data-open-note]');
                if (!row) return;
                openSaleNoteById(row.getAttribute('data-open-note'));
            });
            cortesSalesBody.addEventListener('keydown', function (e) {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                const row = e.target.closest('[data-open-note]');
                if (!row || e.target !== row) return;
                e.preventDefault();
                openSaleNoteById(row.getAttribute('data-open-note'));
            });
        }
        const genBtn = document.getElementById('posGenerateBtn');
        if (genBtn) {
            genBtn.addEventListener('click', function () {
                openPosGenerateModal('ticket');
            });
        }
        const genModal = document.getElementById('posGenerateModal');
        if (genModal) {
            genModal.addEventListener('click', function (e) {
                if (e.target === genModal) closePosGenerateModal();
            });
        }
        const genClose = document.getElementById('posGenerateModalClose');
        if (genClose) genClose.addEventListener('click', closePosGenerateModal);
        const genTabs = document.getElementById('posGenerateTabs');
        if (genTabs) {
            genTabs.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-gen-tab]');
                if (!btn) return;
                setPosGenerateTab(btn.getAttribute('data-gen-tab'));
            });
        }
        const genTicketCancel = document.getElementById('genTicketCancel');
        if (genTicketCancel) genTicketCancel.addEventListener('click', closePosGenerateModal);
        const genTicketSubmit = document.getElementById('genTicketSubmit');
        if (genTicketSubmit) genTicketSubmit.addEventListener('click', submitGenerateTicket);
        const genTicketAddLine = document.getElementById('genTicketAddLine');
        if (genTicketAddLine) {
            genTicketAddLine.addEventListener('click', function () {
                const body = document.getElementById('genTicketLinesBody');
                if (!body) return;
                closeGenProductPicker();
                body.insertAdjacentHTML('beforeend', genTicketLineRowHtml({ qty: 1, price: 0 }, body.children.length));
                refreshGenTicketTotals();
            });
        }
        const genTicketClientTrigger = document.getElementById('genTicketClientTrigger');
        const genTicketClientSearch = document.getElementById('genTicketClientSearch');
        const genTicketClientList = document.getElementById('genTicketClientList');
        if (genTicketClientTrigger) {
            genTicketClientTrigger.addEventListener('click', function (e) {
                e.preventDefault();
                if (genClientPickerOpen) closeGenTicketClientPicker();
                else openGenTicketClientPicker();
            });
        }
        if (genTicketClientSearch) {
            genTicketClientSearch.addEventListener('input', function () {
                genClientPickerActiveIdx = 0;
                renderGenTicketClientPickerList();
            });
            genTicketClientSearch.addEventListener('keydown', function (e) {
                if (!genClientPickerOpen) return;
                const options = genTicketClientList
                    ? genTicketClientList.querySelectorAll('.pos-client-option')
                    : [];
                if (e.key === 'Escape') {
                    e.preventDefault();
                    closeGenTicketClientPicker();
                    if (genTicketClientTrigger) genTicketClientTrigger.focus();
                    return;
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (!options.length) return;
                    genClientPickerActiveIdx = Math.min(options.length - 1, genClientPickerActiveIdx + 1);
                    renderGenTicketClientPickerList();
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (!options.length) return;
                    genClientPickerActiveIdx = Math.max(0, genClientPickerActiveIdx - 1);
                    renderGenTicketClientPickerList();
                    return;
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const opt = options[genClientPickerActiveIdx];
                    if (opt) setGenTicketClientId(opt.getAttribute('data-gen-client-id') || POS_CLIENT_WALKIN);
                }
            });
        }
        if (genTicketClientList) {
            genTicketClientList.addEventListener('click', function (e) {
                const opt = e.target.closest('.pos-client-option');
                if (!opt) return;
                setGenTicketClientId(opt.getAttribute('data-gen-client-id') || POS_CLIENT_WALKIN);
            });
            genTicketClientList.addEventListener('mousemove', function (e) {
                const opt = e.target.closest('.pos-client-option');
                if (!opt || !genTicketClientList.contains(opt)) return;
                const options = genTicketClientList.querySelectorAll('.pos-client-option');
                const idx = Array.prototype.indexOf.call(options, opt);
                if (idx < 0 || idx === genClientPickerActiveIdx) return;
                genClientPickerActiveIdx = idx;
                options.forEach(function (el, i) {
                    el.classList.toggle('is-active', i === idx);
                });
            });
        }
        const genTicketLines = document.getElementById('genTicketLinesBody');
        if (genTicketLines) {
            genTicketLines.addEventListener('click', function (e) {
                const prodTrigger = e.target.closest('.gen-product-trigger');
                if (prodTrigger) {
                    e.preventDefault();
                    const tr = prodTrigger.closest('tr');
                    if (!tr) return;
                    if (genProductPickerRow === tr) closeGenProductPicker();
                    else openGenProductPicker(tr);
                    return;
                }
                const prodOpt = e.target.closest('[data-gen-product-id]');
                if (prodOpt && genTicketLines.contains(prodOpt)) {
                    e.preventDefault();
                    applyGenProductToRow(prodOpt.closest('tr'), prodOpt.getAttribute('data-gen-product-id') || '');
                    return;
                }
                const rm = e.target.closest('[data-gen-remove]');
                if (!rm) return;
                const tr = rm.closest('tr');
                if (tr && genProductPickerRow === tr) closeGenProductPicker();
                if (tr && genTicketLines.children.length > 1) tr.remove();
                else if (tr) {
                    tr.querySelectorAll('input:not([data-gen-field="product"])').forEach(function (el) {
                        el.value = el.type === 'number' ? (el.classList.contains('gen-qty') ? '1' : '0') : '';
                    });
                    const productHid = tr.querySelector('[data-gen-field="product"]');
                    if (productHid) productHid.value = '';
                    syncGenProductTrigger(tr);
                }
                refreshGenTicketTotals();
            });
            genTicketLines.addEventListener('input', function (e) {
                if (e.target.classList.contains('gen-product-search')) {
                    genProductPickerActiveIdx = 0;
                    renderGenProductPickerList();
                    return;
                }
                if (e.target.closest('[data-gen-field="qty"], [data-gen-field="price"], [data-gen-field="name"]')) {
                    refreshGenTicketTotals();
                }
            });
            genTicketLines.addEventListener('keydown', function (e) {
                if (!e.target.classList.contains('gen-product-search') || !genProductPickerRow) return;
                const listEl = genProductPickerRow.querySelector('.gen-product-list');
                const options = listEl ? listEl.querySelectorAll('.pos-client-option') : [];
                if (e.key === 'Escape') {
                    e.preventDefault();
                    const trigger = genProductPickerRow.querySelector('.gen-product-trigger');
                    closeGenProductPicker();
                    if (trigger) trigger.focus();
                    return;
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (!options.length) return;
                    genProductPickerActiveIdx = Math.min(options.length - 1, genProductPickerActiveIdx + 1);
                    renderGenProductPickerList();
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (!options.length) return;
                    genProductPickerActiveIdx = Math.max(0, genProductPickerActiveIdx - 1);
                    renderGenProductPickerList();
                    return;
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const opt = options[genProductPickerActiveIdx];
                    if (opt) {
                        applyGenProductToRow(
                            genProductPickerRow,
                            opt.getAttribute('data-gen-product-id') || ''
                        );
                    }
                }
            });
            genTicketLines.addEventListener('mousemove', function (e) {
                if (!genProductPickerRow) return;
                const listEl = genProductPickerRow.querySelector('.gen-product-list');
                if (!listEl) return;
                const opt = e.target.closest('.pos-client-option');
                if (!opt || !listEl.contains(opt)) return;
                const options = listEl.querySelectorAll('.pos-client-option');
                const idx = Array.prototype.indexOf.call(options, opt);
                if (idx < 0 || idx === genProductPickerActiveIdx) return;
                genProductPickerActiveIdx = idx;
                options.forEach(function (el, i) {
                    el.classList.toggle('is-active', i === idx);
                });
            });
        }
        document.addEventListener('mousedown', function (e) {
            if (genClientPickerOpen) {
                const picker = document.getElementById('genTicketClientPicker');
                if (!picker || !picker.contains(e.target)) closeGenTicketClientPicker();
            }
            if (genProductPickerRow) {
                const picker = genProductPickerRow.querySelector('.gen-product-picker');
                if (!picker || !picker.contains(e.target)) closeGenProductPicker();
            }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            if (genClientPickerOpen &&
                !(genTicketClientSearch && document.activeElement === genTicketClientSearch)) {
                closeGenTicketClientPicker();
            }
            if (genProductPickerRow) {
                const search = genProductPickerRow.querySelector('.gen-product-search');
                if (!(search && document.activeElement === search)) closeGenProductPicker();
            }
        });
        const genGastoCancel = document.getElementById('genGastoCancel');
        if (genGastoCancel) genGastoCancel.addEventListener('click', closePosGenerateModal);
        const genGastoForm = document.getElementById('genGastoForm');
        if (genGastoForm) genGastoForm.addEventListener('submit', submitGenerateGasto);

        const noteClose = document.getElementById('saleNoteModalClose');
        if (noteClose) noteClose.addEventListener('click', closeSaleNoteModal);
        const saleNoteModal = document.getElementById('saleNoteModal');
        if (saleNoteModal) {
            saleNoteModal.addEventListener('click', function (e) {
                if (e.target === saleNoteModal) closeSaleNoteModal();
            });
        }
        const noteWa = document.getElementById('saleNoteWhatsApp');
        if (noteWa) noteWa.addEventListener('click', shareNoteWhatsApp);
        const noteMail = document.getElementById('saleNoteEmailBtn');
        if (noteMail) noteMail.addEventListener('click', shareNoteEmail);
        const noteCopy = document.getElementById('saleNoteCopy');
        if (noteCopy) noteCopy.addEventListener('click', copyNoteText);
        const notePrint = document.getElementById('saleNotePrint');
        if (notePrint) notePrint.addEventListener('click', printSaleNote);
        const noteDelete = document.getElementById('saleNoteDelete');
        if (noteDelete) noteDelete.addEventListener('click', deleteActiveSaleNote);
        syncSaleNoteDeleteVisibility();

        const noteEditBtn = document.getElementById('saleNoteEditBtn');
        if (noteEditBtn) {
            noteEditBtn.addEventListener('click', function () {
                if (!activeNoteSaleId) return;
                setSaleNoteMode(true);
                syncSaleNoteDeleteVisibility();
            });
        }
        const saleNoteEditHost = document.getElementById('saleNoteEdit');
        if (saleNoteEditHost) {
            saleNoteEditHost.addEventListener('click', function (e) {
                if (e.target.closest('#sneClientTrigger')) {
                    e.preventDefault();
                    if (sneClientPickerOpen) closeSneClientPicker();
                    else openSneClientPicker();
                    return;
                }
                const sneOpt = e.target.closest('[data-sne-client-id]');
                if (sneOpt && saleNoteEditHost.contains(sneOpt)) {
                    e.preventDefault();
                    setSneClientId(sneOpt.getAttribute('data-sne-client-id') || '');
                    return;
                }
                if (e.target.closest('#sneCancel')) {
                    setSaleNoteMode(false);
                    const sale = saleById(activeNoteSaleId);
                    if (sale) openSaleNoteModal(sale);
                    return;
                }
                if (e.target.closest('#sneSave')) {
                    saveSaleNoteEdit();
                    return;
                }
                if (e.target.closest('#sneAddLine')) {
                    const body = document.getElementById('sneLinesBody');
                    if (!body) return;
                    const idx = body.querySelectorAll('tr').length;
                    body.insertAdjacentHTML('beforeend', saleNoteLineRowHtml({ product: '', name: '', qty: 1, price: 0 }, idx));
                    refreshSaleNoteEditTotals();
                    return;
                }
                if (e.target && e.target.id === 'snePaySplit') {
                    syncSnePaySplitUi();
                    return;
                }
                if (e.target.closest('#snePaySplitAdd')) {
                    const rows = document.getElementById('snePaySplitRows');
                    if (!rows) return;
                    const used = {};
                    readSnePaySplitLines().forEach(function (p) { used[p.method] = true; });
                    const next = payMethodKeys().filter(function (k) {
                        return k !== 'por_cobrar' && !used[k];
                    })[0] || 'efectivo';
                    rows.insertAdjacentHTML('beforeend', snePaySplitRowHtml(next, '', rows.children.length));
                    refreshSnePaySplitSummary();
                    return;
                }
                const splitRm = e.target.closest('[data-sne-split-remove]');
                if (splitRm) {
                    const row = splitRm.closest('.pay-split-row');
                    const rows = document.getElementById('snePaySplitRows');
                    if (row && rows && rows.children.length > 1) {
                        row.remove();
                        refreshSnePaySplitSummary();
                    }
                    return;
                }
                const rm = e.target.closest('[data-sne-remove]');
                if (rm) {
                    const tr = rm.closest('tr');
                    if (tr) tr.remove();
                    refreshSaleNoteEditTotals();
                }
            });
            saleNoteEditHost.addEventListener('input', function (e) {
                if (e.target && e.target.id === 'sneClientPickerSearch') {
                    sneClientPickerActiveIdx = 0;
                    renderSneClientPickerList();
                    return;
                }
                if (e.target.closest('[data-sne-field="qty"], [data-sne-field="price"]')) {
                    refreshSaleNoteEditTotals();
                    return;
                }
                if (e.target.closest('[data-sne-split-amount], [data-sne-split-method]')) {
                    refreshSnePaySplitSummary();
                }
            });
            saleNoteEditHost.addEventListener('keydown', function (e) {
                if (!e.target || e.target.id !== 'sneClientPickerSearch' || !sneClientPickerOpen) return;
                const listEl = document.getElementById('sneClientPickerList');
                const options = listEl ? listEl.querySelectorAll('.pos-client-option') : [];
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    sneClientPickerActiveIdx = Math.min(options.length - 1, sneClientPickerActiveIdx + 1);
                    renderSneClientPickerList();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    sneClientPickerActiveIdx = Math.max(0, sneClientPickerActiveIdx - 1);
                    renderSneClientPickerList();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const opt = options[sneClientPickerActiveIdx];
                    if (opt) setSneClientId(opt.getAttribute('data-sne-client-id') || '');
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    closeSneClientPicker();
                }
            });
            saleNoteEditHost.addEventListener('change', function (e) {
                if (e.target && e.target.id === 'snePaySplit') {
                    syncSnePaySplitUi();
                    return;
                }
                if (e.target.closest('[data-sne-split-method]')) {
                    refreshSnePaySplitSummary();
                    return;
                }
                const sel = e.target.closest('[data-sne-field="product"]');
                if (!sel) return;
                const tr = sel.closest('tr');
                if (!tr) return;
                const cat = pricedCatalog().filter(function (p) { return p.id === sel.value; })[0];
                const nameInput = tr.querySelector('[data-sne-field="name"]');
                const priceInput = tr.querySelector('[data-sne-field="price"]');
                if (cat && nameInput) nameInput.value = cat.name || '';
                if (cat && priceInput && !(Number(priceInput.value) > 0)) {
                    const list = typeof unitPrice === 'function' ? unitPrice(cat.id, 1) : 0;
                    if (list > 0) priceInput.value = String(list);
                }
                refreshSaleNoteEditTotals();
            });
        }
        document.addEventListener('mousedown', function (e) {
            if (!sneClientPickerOpen) return;
            const picker = document.getElementById('sneClientPicker');
            if (picker && picker.contains(e.target)) return;
            closeSneClientPicker();
        });

        const periodTabs = document.getElementById('cortesPeriodTabs');
        if (periodTabs) {
            periodTabs.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-period]');
                if (!btn) return;
                const next = btn.getAttribute('data-period');
                if (!next || next === cortesPeriod) return;
                closePeriodRangePicker();
                cortesPeriod = next;
                cortesOffset = 0;
                renderCortes();
            });
        }
        const citySelectEl = document.getElementById('cortesCitySelect');
        if (citySelectEl) {
            citySelectEl.addEventListener('change', function () {
                const next = citySelectEl.value || 'all';
                if (next !== 'all' && !cityById(next)) return;
                if (next === cortesCityFilter) return;
                cortesCityFilter = next;
                renderCortes();
            });
        }
        const cortesPrev = document.getElementById('cortesPrev');
        if (cortesPrev) {
            cortesPrev.addEventListener('click', function () {
                if (cortesPeriod === 'historial') return;
                cortesOffset -= 1;
                renderCortes();
            });
        }
        const cortesNext = document.getElementById('cortesNext');
        if (cortesNext) {
            cortesNext.addEventListener('click', function () {
                if (cortesPeriod === 'historial') return;
                if (cortesOffset >= 0) return;
                cortesOffset += 1;
                renderCortes();
            });
        }
        const cortesReset = document.getElementById('cortesReset');
        if (cortesReset) {
            cortesReset.addEventListener('click', function () {
                cortesOffset = 0;
                renderCortes();
            });
        }

        const priceChips = document.getElementById('posPriceFamilyChips');
        if (priceChips) {
            priceChips.addEventListener('click', function (e) {
                const btn = e.target.closest('.chip[data-fam]');
                if (!btn) return;
                priceFamilyFilter = btn.getAttribute('data-fam');
                renderPriceChips();
                renderPrices();
            });
        }
        const priceSearch = document.getElementById('posPriceSearch');
        if (priceSearch) priceSearch.addEventListener('input', renderPrices);
        const pricesBody = document.getElementById('posPricesBody');
        if (pricesBody) {
            pricesBody.addEventListener('change', function (e) {
                const input = e.target.closest('[data-price-id]');
                if (!input) return;
                const id = input.getAttribute('data-price-id');
                const tier = Number(input.getAttribute('data-tier'));
                if (!prices[id]) {
                    prices[id] = { presentationKg: presentationKgFor(id), tiers: sixTiers(0) };
                }
                if (!prices[id].tiers) prices[id].tiers = sixTiers(0);
                prices[id].tiers[tier] = Math.max(0, roundMoney(input.value));
                savePrices();
                applyCartTierPrices();
                renderProducts();
                renderCart();
            });
        }
        const resetPrices = document.getElementById('posResetPricesBtn');
        if (resetPrices) {
            resetPrices.addEventListener('click', function () {
                if (!confirm('¿Restablecer precios por defecto (lista mayorista convertida)?')) return;
                resetPricesToDefaults();
            });
        }

        const clientSearch = document.getElementById('posClientSearch');
        if (clientSearch) clientSearch.addEventListener('input', renderClients);
        const addClient = document.getElementById('posClientAddBtn');
        if (addClient) addClient.addEventListener('click', function () { openClientModal(null); });
        const clientsBody = document.getElementById('posClientsBody');
        if (clientsBody) {
            clientsBody.addEventListener('click', function (e) {
                const del = e.target.closest('[data-del-client]');
                if (del) {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = del.getAttribute('data-del-client');
                    const c = clientById(id);
                    if (!c) return;
                    if (!confirm('¿Eliminar «' + c.name + '»?')) return;
                    clients = clients.filter(function (x) { return x.id !== id; });
                    saveClients();
                    if (clientDashId === id) closeClientDashboard();
                    renderClients();
                    fillClientSelect();
                    fillHistoryClientFilter();
                    applyCartTierPrices();
                    renderProducts();
                    renderCart();
                    return;
                }
                const openBtn = e.target.closest('[data-open-client]');
                const row = e.target.closest('tr[data-open-client]');
                const id = (openBtn && openBtn.getAttribute('data-open-client')) ||
                    (row && row.getAttribute('data-open-client'));
                if (id) openClientDashboard(id);
            });
        }

        const clientForm = document.getElementById('clientForm');
        if (clientForm) {
            clientForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const name = toTitleCaseName(document.getElementById('clientName').value);
                if (!name) return;
                const emailRaw = document.getElementById('clientEmail').value;
                const badEmails = invalidClientEmails(emailRaw);
                if (badEmails.length) {
                    toast('Email inválido: ' + badEmails[0]);
                    return;
                }
                const wasNew = !editingClientId;
                const addrEl = document.getElementById('clientAddress');
                const next = {
                    id: editingClientId || ('cli-' + Date.now().toString(36)),
                    name: name,
                    phone: (document.getElementById('clientPhone').value || '').trim(),
                    email: normalizeClientEmail(emailRaw),
                    company: toTitleCaseName(document.getElementById('clientCompany').value),
                    rfc: (document.getElementById('clientRfc').value || '').trim(),
                    address: addrEl ? toTitleCaseName(String(addrEl.value || '').trim().replace(/\s+/g, ' ')) : '',
                    type: clientTypeFromForm(),
                    updatedAt: new Date().toISOString()
                };
                const idx = clients.findIndex(function (c) { return c.id === next.id; });
                if (idx >= 0) {
                    const merged = Object.assign({}, clients[idx], next);
                    delete merged.domicilio;
                    delete merged.localidad;
                    markClientUserEdited(merged);
                    clients[idx] = merged;
                } else {
                    next.createdAt = next.updatedAt;
                    markClientUserEdited(next);
                    clients.push(next);
                }
                saveClients();
                closeClientModal();
                renderClients();
                fillClientSelect();
                fillHistoryClientFilter();
                if (wasNew) {
                    setSelectedClientId(next.id);
                    openClientDashboard(next.id);
                } else {
                    applyCartTierPrices();
                    renderProducts();
                    renderCart();
                    if (clientDashId === next.id) renderClientDashboard(next.id);
                }
                toast(wasNew ? 'Cliente creado' : 'Cliente actualizado');
            });
        }
        const clientTypeSeg = document.getElementById('clientTypeSeg');
        if (clientTypeSeg) {
            clientTypeSeg.addEventListener('click', function (e) {
                const btn = e.target.closest('button[data-client-type]');
                if (!btn) return;
                e.preventDefault();
                setClientTypeForm(btn.getAttribute('data-client-type'));
            });
        }
        const clientTrigger = document.getElementById('posClientTrigger');
        const clientPickerSearch = document.getElementById('posClientPickerSearch');
        const clientPickerList = document.getElementById('posClientPickerList');
        if (clientTrigger) {
            clientTrigger.addEventListener('click', function (e) {
                e.preventDefault();
                if (clientPickerOpen) closeClientPicker();
                else openClientPicker();
            });
        }
        if (clientPickerSearch) {
            clientPickerSearch.addEventListener('input', function () {
                clientPickerActiveIdx = 0;
                renderClientPickerList();
            });
            clientPickerSearch.addEventListener('keydown', function (e) {
                if (!clientPickerOpen) return;
                const options = clientPickerList
                    ? clientPickerList.querySelectorAll('.pos-client-option')
                    : [];
                if (e.key === 'Escape') {
                    e.preventDefault();
                    closeClientPicker();
                    if (clientTrigger) clientTrigger.focus();
                    return;
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (!options.length) return;
                    clientPickerActiveIdx = Math.min(options.length - 1, clientPickerActiveIdx + 1);
                    renderClientPickerList();
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (!options.length) return;
                    clientPickerActiveIdx = Math.max(0, clientPickerActiveIdx - 1);
                    renderClientPickerList();
                    return;
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const opt = options[clientPickerActiveIdx];
                    if (!opt) return;
                    if (opt.getAttribute('data-client-create') === '1') {
                        openQuickCreateFromPicker();
                        return;
                    }
                    pickClientFromPicker(opt.getAttribute('data-client-id') || '');
                }
            });
        }
        if (clientPickerList) {
            clientPickerList.addEventListener('click', function (e) {
                const opt = e.target.closest('.pos-client-option');
                if (!opt) return;
                if (opt.getAttribute('data-client-create') === '1') {
                    openQuickCreateFromPicker();
                    return;
                }
                pickClientFromPicker(opt.getAttribute('data-client-id') || '');
            });
            clientPickerList.addEventListener('mousemove', function (e) {
                const opt = e.target.closest('.pos-client-option');
                if (!opt || !clientPickerList.contains(opt)) return;
                const options = clientPickerList.querySelectorAll('.pos-client-option');
                const idx = Array.prototype.indexOf.call(options, opt);
                if (idx < 0 || idx === clientPickerActiveIdx) return;
                clientPickerActiveIdx = idx;
                options.forEach(function (el, i) {
                    el.classList.toggle('is-active', i === idx);
                });
            });
        }
        document.addEventListener('mousedown', function (e) {
            if (!clientPickerOpen) return;
            const picker = document.getElementById('posClientPicker');
            if (picker && picker.contains(e.target)) return;
            closeClientPicker();
        });
        document.addEventListener('keydown', function (e) {
            if (!clientPickerOpen || e.key !== 'Escape') return;
            if (clientPickerSearch && document.activeElement === clientPickerSearch) return;
            closeClientPicker();
        });
        ['clientModalClose', 'clientModalCancel'].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', closeClientModal);
        });
    }

    function presentationsForSlug(slug) {
        const data = window.S35_PANEL_DATA || {};
        return (data.presentations || []).filter(function (p) {
            return p.productSlug === slug;
        });
    }

    function ensurePriceEntry(id, presentationKg) {
        if (!prices[id]) {
            prices[id] = {
                presentationKg: presentationKg != null ? presentationKg : presentationKgFor(id),
                tiers: sixTiers(0),
                distributorPrice: null
            };
        }
        if (!prices[id].tiers) prices[id].tiers = sixTiers(0);
        if (prices[id].distributorPrice === undefined) prices[id].distributorPrice = null;
        return prices[id];
    }

    function setTierPrice(id, tier, value) {
        if (!id) return;
        const t = Number(tier);
        if (!isFinite(t) || t < 0 || t > 5) return;
        ensurePriceEntry(id);
        prices[id].tiers[t] = Math.max(0, roundMoney(value));
        savePrices();
        applyCartTierPrices();
        renderProducts();
        renderCart();
    }

    /** Precio fijo para distribuidores (aparte de tramos por volumen). */
    function setDistributorPrice(id, value) {
        if (!id) return;
        ensurePriceEntry(id);
        const raw = String(value == null ? '' : value).trim();
        prices[id].distributorPrice = raw === '' ? null : Math.max(0, roundMoney(raw));
        savePrices();
        applyCartTierPrices();
        renderProducts();
        renderCart();
    }

    function getDistributorPrice(id) {
        const entry = prices[id];
        if (!entry || entry.distributorPrice == null || entry.distributorPrice === '') return null;
        return roundMoney(entry.distributorPrice);
    }

    function resetPricesToDefaults() {
        prices = seedPrices();
        savePrices();
        applyCartTierPrices();
        renderProducts();
        renderCart();
        renderPrices();
        toast('Precios restablecidos');
    }

    function priceEditorHtml(slug, opts) {
        opts = opts || {};
        const editing = !!opts.editing;
        const disabledAttr = editing ? '' : ' disabled';
        const rows = presentationsForSlug(slug);
        const list = rows.length
            ? rows
            : pricedCatalog().filter(function (p) {
                return p.id === slug || (p.recipe && p.recipe.product === slug);
            }).map(function (p) {
                return {
                    id: p.id,
                    code: p.code,
                    label: p.unitLabel || unitFor(p),
                    size: p.presentationKg,
                    kind: p.kind,
                    listName: p.listName || p.name,
                    unitLabel: p.unitLabel
                };
            });
        if (!list.length) {
            return '<div class="empty">Sin presentaciones de venta para este producto.</div>';
        }
        return '<div class="pd-price-blocks' + (editing ? ' is-editing' : '') + '">' + list.map(function (pres) {
            const id = pres.id;
            const entry = prices[id] || { presentationKg: pres.size, tiers: sixTiers(400), distributorPrice: null };
            const kg = entry.presentationKg != null ? entry.presentationKg : (pres.size != null ? pres.size : '—');
            const unit = (pres.kind === 'liquido' || pres.unit === 'L')
                ? liquidUnitLabel(kg === '—' ? null : kg, pres.label || pres.unitLabel)
                : (pres.label || (kg !== '—' ? ('Saco ' + kg + ' kg') : 'Saco'));
            const tierRows = TIER_LABELS.map(function (label, i) {
                const val = entry.tiers && entry.tiers[i] != null ? entry.tiers[i] : 0;
                return '<label class="pd-tier-row">' +
                    '<span class="muted">' + esc(label) + '</span>' +
                    '<input class="price-input num" type="number" min="0" step="0.01" ' +
                    'data-price-id="' + esc(id) + '" data-tier="' + i + '" value="' + esc(String(val)) + '"' +
                    disabledAttr + '>' +
                    '</label>';
            }).join('');
            const distVal = entry.distributorPrice != null && entry.distributorPrice !== ''
                ? String(entry.distributorPrice)
                : '';
            const distBlock =
                '<div class="pd-distributor-block">' +
                '<div class="pd-distributor-head">Distribuidores</div>' +
                '<label class="pd-tier-row">' +
                '<span class="muted">Precio distribuidores</span>' +
                '<input class="price-input num" type="number" min="0" step="0.01" ' +
                'data-price-id="' + esc(id) + '" data-price-field="distributor" ' +
                'placeholder="—" value="' + esc(distVal) + '"' + disabledAttr + '>' +
                '</label></div>';
            return '<div class="pd-price-card" data-pres-id="' + esc(id) + '">' +
                '<div class="pd-price-card-head">' +
                '<strong>' + esc(unit) + '</strong>' +
                '<span class="muted">' + esc(pres.code || id) +
                (kg !== '—' ? ' · ' + esc(String(kg)) + (pres.kind === 'liquido' || pres.unit === 'L' ? ' L' : ' kg') : '') +
                '</span></div>' +
                '<div class="pd-tier-grid">' + tierRows + '</div>' +
                distBlock + '</div>';
        }).join('') + '</div>';
    }

    /** Aplica inputs del editor de precios al mapa en memoria (sin guardar). */
    function applyPriceEditorInputs(root) {
        if (!root) return { ok: false, count: 0 };
        let count = 0;
        root.querySelectorAll('[data-price-id]').forEach(function (input) {
            const id = input.getAttribute('data-price-id');
            if (!id) return;
            if (input.getAttribute('data-price-field') === 'distributor') {
                ensurePriceEntry(id);
                const raw = String(input.value == null ? '' : input.value).trim();
                prices[id].distributorPrice = raw === '' ? null : Math.max(0, roundMoney(raw));
                count += 1;
                return;
            }
            const tier = Number(input.getAttribute('data-tier'));
            if (!isFinite(tier) || tier < 0 || tier > 5) return;
            ensurePriceEntry(id);
            prices[id].tiers[tier] = Math.max(0, roundMoney(input.value));
            count += 1;
        });
        return { ok: true, count: count };
    }

    function commitPriceEditor(root, opts) {
        opts = opts || {};
        const applied = applyPriceEditorInputs(root);
        if (!applied.ok) return Promise.resolve({ ok: false, error: 'Sin editor' });
        applyCartTierPrices();
        renderProducts();
        renderCart();
        return savePrices({ flushCloud: opts.flushCloud !== false }).then(function (res) {
            return {
                ok: !!(res && res.ok !== false),
                count: applied.count,
                sync: res || null,
                error: res && res.error
            };
        });
    }

    function addFtSiblingCodes(code, into) {
        const c = String(code || '').trim();
        if (!c) return;
        into[c] = true;
        if (/^FT-PR-/i.test(c)) into[c.replace(/^FT-PR-/i, 'FT-PC-')] = true;
        if (/^FT-PC-/i.test(c)) into[c.replace(/^FT-PC-/i, 'FT-PR-')] = true;
    }

    /** IDs/códigos canónicos del producto (slug + presentaciones Litro/Cubeta + merges legacy). */
    function productMatchKeys(slug) {
        const ids = {};
        const codes = {};
        if (!slug) return { ids: ids, codes: codes };

        ids[slug] = true;
        Object.keys(PRICE_MERGE_FROM).forEach(function (from) {
            if (PRICE_MERGE_FROM[from] === slug) ids[from] = true;
        });
        if (PRICE_MERGE_FROM[slug]) ids[PRICE_MERGE_FROM[slug]] = true;

        const recipe = recipeBySlug(slug);
        if (recipe) {
            if (recipe.product) ids[recipe.product] = true;
            addFtSiblingCodes(recipe.code, codes);
        }

        presentationsForSlug(slug).forEach(function (p) {
            if (p.id) ids[p.id] = true;
            if (p.parentId) ids[p.parentId] = true;
            addFtSiblingCodes(p.code, codes);
        });

        pricedCatalog().forEach(function (p) {
            if (p.id === slug || (p.recipe && p.recipe.product === slug) || ids[p.id]) {
                if (p.id) ids[p.id] = true;
                addFtSiblingCodes(p.code, codes);
            }
        });

        return { ids: ids, codes: codes };
    }

    function lineMatchesProduct(line, keys) {
        if (!line) return false;
        const pid = line.product;
        if (pid && keys.ids[pid]) return true;
        const code = String(line.code || '').trim();
        if (code && keys.codes[code]) return true;
        return false;
    }

    function lineAmount(it) {
        const lt = Number(it.lineTotal);
        if (isFinite(lt) && lt > 0) return lt;
        return (Number(it.qty) || 0) * (Number(it.price) || 0);
    }

    function productContribution(sale, keys) {
        let qty = 0;
        let amount = 0;
        let unitSum = 0;
        let unitCount = 0;
        (sale.items || []).forEach(function (it) {
            if (!lineMatchesProduct(it, keys)) return;
            const q = Number(it.qty) || 0;
            const amt = lineAmount(it);
            qty += q;
            amount += amt;
            if (q > 0) {
                unitSum += (Number(it.price) || (q ? amt / q : 0)) * q;
                unitCount += q;
            }
        });
        return { qty: qty, amount: amount, unitSum: unitSum, unitCount: unitCount };
    }

    function productRhythmSeries(list, keys) {
        return list.map(function (s) {
            const c = productContribution(s, keys);
            if (!c.amount && !c.qty) return null;
            return { createdAt: s.createdAt, total: c.amount, qty: c.qty };
        }).filter(Boolean);
    }

    function catalogProductsForMovements() {
        const bySlug = {};
        getRecipes().forEach(function (r) {
            const slug = r.product;
            if (!slug) return;
            bySlug[slug] = {
                slug: slug,
                name: r.name || slug,
                family: getEffectiveFamily(slug, recipeFamily(r))
            };
        });
        pricedCatalog().forEach(function (p) {
            const slug = (p.recipe && p.recipe.product) || (p.fromRecipe ? p.id : null);
            if (!slug) return;
            if (!bySlug[slug]) {
                bySlug[slug] = {
                    slug: slug,
                    name: p.listName || p.name || slug,
                    family: getEffectiveFamily(slug, p.family || '')
                };
            } else if (p.listName && !bySlug[slug].name) {
                bySlug[slug].name = p.listName;
            }
        });
        return Object.keys(bySlug).map(function (k) { return bySlug[k]; })
            .sort(function (a, b) {
                return String(a.name || '').localeCompare(String(b.name || ''), 'es');
            });
    }

    function productsMovFamilyOptions() {
        const catalog = catalogProductsForMovements();
        const labels = productFamilies.map(function (f) { return f.label; });
        const hasNone = catalog.some(function (p) { return !p.family; });
        return { labels: labels, hasNone: hasNone, catalog: catalog };
    }

    function buildProductsMovSeries(periodSales, familyFilter) {
        const opts = productsMovFamilyOptions();
        const catalog = opts.catalog;
        if (familyFilter === 'all') {
            const series = opts.labels.map(function (label) {
                const products = catalog.filter(function (p) { return p.family === label; });
                let list = [];
                products.forEach(function (p) {
                    list = list.concat(productRhythmSeries(periodSales, productMatchKeys(p.slug)));
                });
                return {
                    key: label,
                    label: label,
                    color: familyColor(label),
                    list: list
                };
            });
            if (opts.hasNone) {
                const noneProducts = catalog.filter(function (p) { return !p.family; });
                let list = [];
                noneProducts.forEach(function (p) {
                    list = list.concat(productRhythmSeries(periodSales, productMatchKeys(p.slug)));
                });
                series.push({
                    key: PRODUCT_UNCATEGORIZED_ID,
                    label: PRODUCT_UNCATEGORIZED_LABEL,
                    color: FAMILY_COLOR_NEUTRAL,
                    list: list
                });
            }
            return series.filter(function (s) { return s.list.length > 0; });
        }

        const wantNone = familyFilter === PRODUCT_UNCATEGORIZED_ID;
        const products = catalog.filter(function (p) {
            return wantNone ? !p.family : p.family === familyFilter;
        });
        return products.map(function (p, i) {
            return {
                key: p.slug,
                label: p.name,
                color: PRODUCT_LINE_PALETTE[i % PRODUCT_LINE_PALETTE.length],
                list: productRhythmSeries(periodSales, productMatchKeys(p.slug))
            };
        });
    }

    function syncProductsMovFamilySelect() {
        const sel = document.getElementById('productsMovFamilySelect');
        const menu = document.getElementById('productsMovFamilyMenu');
        if (!sel) return;
        const opts = productsMovFamilyOptions();
        const wanted = [{ id: 'all', label: 'Todas' }].concat(opts.labels.map(function (label) {
            return { id: label, label: label };
        }));
        if (opts.hasNone) {
            wanted.push({ id: PRODUCT_UNCATEGORIZED_ID, label: PRODUCT_UNCATEGORIZED_LABEL });
        }
        const curOpts = Array.prototype.map.call(sel.options, function (o) { return o.value; }).join('|');
        const nextOpts = wanted.map(function (o) { return o.id; }).join('|');
        if (curOpts !== nextOpts) {
            sel.innerHTML = wanted.map(function (o) {
                return '<option value="' + esc(o.id) + '">' + esc(o.label) + '</option>';
            }).join('');
        }
        const valid = wanted.some(function (o) { return o.id === productsMovFamily; });
        if (!valid) productsMovFamily = 'all';
        sel.value = productsMovFamily;
        if (menu) menu.classList.toggle('is-filtered', productsMovFamily !== 'all');
    }

    function bindProductsMovementsControls() {
        if (productsMovBound) return;
        productsMovBound = true;
        const tabs = document.getElementById('productsMovPeriodTabs');
        if (tabs) {
            tabs.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-products-mov-period]');
                if (!btn) return;
                const next = btn.getAttribute('data-products-mov-period');
                if (!next || next === productsMovPeriod) return;
                productsMovPeriod = next;
                if (productsMovPeriod === 'historial') productsMovOffset = 0;
                renderProductsMovementsChart();
            });
        }
        const famSel = document.getElementById('productsMovFamilySelect');
        if (famSel) {
            famSel.addEventListener('change', function () {
                productsMovFamily = famSel.value || 'all';
                renderProductsMovementsChart();
            });
        }
        const prev = document.getElementById('productsMovPrev');
        if (prev) {
            prev.addEventListener('click', function () {
                if (productsMovPeriod === 'historial') return;
                productsMovOffset -= 1;
                renderProductsMovementsChart();
            });
        }
        const next = document.getElementById('productsMovNext');
        if (next) {
            next.addEventListener('click', function () {
                if (productsMovPeriod === 'historial' || productsMovOffset >= 0) return;
                productsMovOffset += 1;
                renderProductsMovementsChart();
            });
        }
        const reset = document.getElementById('productsMovReset');
        if (reset) {
            reset.addEventListener('click', function () {
                if (productsMovPeriod === 'historial') return;
                productsMovOffset = 0;
                renderProductsMovementsChart();
            });
        }
    }

    function renderProductsMovementsChart() {
        const host = document.getElementById('productsMovChart');
        if (!host) return;
        bindProductsMovementsControls();
        syncProductsMovFamilySelect();

        const isHist = productsMovPeriod === 'historial';
        if (isHist) productsMovOffset = 0;
        const bounds = periodBounds(productsMovPeriod, productsMovOffset);
        const analytics = salesForAnalytics();
        const periodSales = salesInRange(analytics, bounds.start, bounds.end);
        const series = buildProductsMovSeries(periodSales, productsMovFamily);
        let merged = [];
        series.forEach(function (s) {
            merged = merged.concat(s.list || []);
        });

        const rangeLabel = document.getElementById('productsMovRangeLabel');
        if (rangeLabel) {
            rangeLabel.textContent = formatPeriodLabel(productsMovPeriod, bounds.start, bounds.end);
            rangeLabel.disabled = isHist;
            rangeLabel.title = isHist ? 'Historial completo' : 'Elegir periodo';
        }
        const prevBtn = document.getElementById('productsMovPrev');
        const nextBtn = document.getElementById('productsMovNext');
        const resetBtn = document.getElementById('productsMovReset');
        if (prevBtn) prevBtn.disabled = isHist;
        if (nextBtn) nextBtn.disabled = isHist || productsMovOffset >= 0;
        if (resetBtn) resetBtn.disabled = isHist || productsMovOffset === 0;

        document.querySelectorAll('#productsMovPeriodTabs [data-products-mov-period]').forEach(function (btn) {
            const on = btn.getAttribute('data-products-mov-period') === productsMovPeriod;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
        });

        const legend = document.getElementById('productsMovLegend');
        if (legend) {
            if (!series.length) {
                legend.innerHTML = '';
            } else {
                legend.innerHTML = series.map(function (s) {
                    return '<span class="leg"><span class="swatch" style="background:' + esc(s.color) +
                        ';border-color:' + esc(s.color) + '"></span> ' + esc(s.label) + '</span>';
                }).join('');
            }
        }

        renderRhythmChart({
            host: host,
            subEl: document.getElementById('productsMovChartSub'),
            hatchId: 'productsMovHatch',
            period: productsMovPeriod,
            bounds: bounds,
            list: merged,
            prevBounds: null,
            prevList: [],
            citySeries: series.length ? series : null,
            showUnits: true,
            seriesHint: productsMovFamily === 'all' ? 'por familia' : 'por producto'
        });
    }

    function productHasAnySales(keys) {
        return salesForAnalytics().some(function (s) {
            const c = productContribution(s, keys);
            return c.qty > 0 || c.amount > 0;
        });
    }

    function topClientsForProduct(list, keys, limit) {
        const map = {};
        list.forEach(function (s) {
            const c = productContribution(s, keys);
            if (!c.qty && !c.amount) return;
            const key = s.clientId || ('name:' + (s.customer || 'Mostrador'));
            if (!map[key]) {
                map[key] = {
                    name: (s.client && s.client.name) || s.customer || 'Mostrador',
                    qty: 0,
                    amount: 0,
                    tickets: 0
                };
            }
            map[key].qty += c.qty;
            map[key].amount += c.amount;
            map[key].tickets += 1;
        });
        return Object.keys(map).map(function (k) { return map[k]; })
            .sort(function (a, b) { return b.amount - a.amount || b.qty - a.qty; })
            .slice(0, limit || 5);
    }

    function bindProductSalesControls() {
        if (pdSalesBound) return;
        pdSalesBound = true;
        document.addEventListener('click', function (e) {
            const root = e.target.closest('#pdSalesAnalytics');
            if (!root || !pdSalesSlug) return;
            const periodBtn = e.target.closest('[data-pd-sales-period]');
            if (periodBtn) {
                const next = periodBtn.getAttribute('data-pd-sales-period');
                if (['day', 'week', 'month', 'year', 'historial'].indexOf(next) < 0) return;
                closePeriodRangePicker();
                pdSalesPeriod = next;
                pdSalesOffset = 0;
                renderProductSalesAnalytics(pdSalesSlug);
                return;
            }
            if (e.target.closest('[data-pd-sales-prev]')) {
                if (pdSalesPeriod === 'historial') return;
                pdSalesOffset -= 1;
                renderProductSalesAnalytics(pdSalesSlug);
                return;
            }
            if (e.target.closest('[data-pd-sales-next]')) {
                if (pdSalesPeriod === 'historial' || pdSalesOffset >= 0) return;
                pdSalesOffset += 1;
                renderProductSalesAnalytics(pdSalesSlug);
                return;
            }
            if (e.target.closest('[data-pd-sales-reset]')) {
                if (pdSalesPeriod === 'historial') return;
                pdSalesOffset = 0;
                renderProductSalesAnalytics(pdSalesSlug);
            }
        });
    }

    function renderProductSalesAnalytics(slug) {
        const mount = document.getElementById('pdSalesAnalytics');
        if (!mount) return;
        bindProductSalesControls();

        if (!slug) {
            mount.innerHTML = '';
            pdSalesSlug = null;
            return;
        }

        if (pdSalesSlug !== slug) {
            pdSalesSlug = slug;
            pdSalesPeriod = 'historial';
            pdSalesOffset = 0;
        } else {
            pdSalesSlug = slug;
        }

        const keys = productMatchKeys(slug);
        if (!productHasAnySales(keys)) {
            mount.innerHTML =
                '<div class="pd-sales-block">' +
                '<p class="pd-section-label">Ventas</p>' +
                '<div class="pd-sales-empty">' +
                '<p class="empty-title">Sin ventas registradas</p>' +
                '<p class="muted">Aún no hay tickets del POS con este producto.</p>' +
                '</div></div>';
            return;
        }

        const isHist = pdSalesPeriod === 'historial';
        if (isHist) pdSalesOffset = 0;
        const bounds = periodBounds(pdSalesPeriod, pdSalesOffset);
        const prevBounds = isHist ? null : periodBounds(pdSalesPeriod, pdSalesOffset - 1);
        const analytics = salesForAnalytics();
        const periodSales = salesInRange(analytics, bounds.start, bounds.end);
        const prevPeriodSales = isHist ? [] : salesInRange(analytics, prevBounds.start, prevBounds.end);
        const curSeries = productRhythmSeries(periodSales, keys);
        const prevSeries = productRhythmSeries(prevPeriodSales, keys);

        let units = 0;
        let amount = 0;
        let unitSum = 0;
        let unitCount = 0;
        let ticketCount = 0;
        periodSales.forEach(function (s) {
            const c = productContribution(s, keys);
            if (!c.qty && !c.amount) return;
            ticketCount += 1;
            units += c.qty;
            amount += c.amount;
            unitSum += c.unitSum;
            unitCount += c.unitCount;
        });
        const avgPrice = unitCount ? unitSum / unitCount : 0;
        const clients = topClientsForProduct(periodSales, keys, 5);
        const canGoNext = !isHist && pdSalesOffset < 0;

        mount.innerHTML =
            '<div class="pd-sales-block">' +
            '<div class="pd-sales-head">' +
            '<div>' +
            '<p class="pd-section-label">Ventas</p>' +
            '<p class="page-sub" style="margin:0">Ritmo y clientes · POS + histórico</p>' +
            '</div>' +
            '<div class="cortes-range pd-sales-range">' +
            '<button type="button" class="cortes-nav-btn" data-pd-sales-prev title="Periodo anterior" aria-label="Periodo anterior"' +
            (isHist ? ' disabled' : '') + '><i class="fa-solid fa-chevron-left"></i></button>' +
            '<button type="button" class="cortes-range-label" id="pdSalesRangeLabel" data-period-range-trigger="pdSales"' +
            (isHist ? ' disabled' : ' aria-haspopup="dialog" aria-expanded="false"') +
            ' title="' + esc(isHist ? 'Historial completo' : 'Elegir periodo') + '">' +
            esc(formatPeriodLabel(pdSalesPeriod, bounds.start, bounds.end)) + '</button>' +
            '<button type="button" class="cortes-nav-btn" data-pd-sales-next title="Periodo siguiente" aria-label="Periodo siguiente"' +
            (canGoNext ? '' : ' disabled') + '><i class="fa-solid fa-chevron-right"></i></button>' +
            '<button type="button" class="cortes-today-btn" data-pd-sales-reset' + (isHist ? ' disabled' : '') + '>Actual</button>' +
            '</div></div>' +
            '<div class="seg-control pd-sales-periods" role="tablist" aria-label="Periodo de ventas del producto">' +
            [['day', 'Día'], ['week', 'Semana'], ['month', 'Mes'], ['year', 'Año'], ['historial', 'Historial']].map(function (pair) {
                const on = pdSalesPeriod === pair[0];
                return '<button type="button" role="tab" data-pd-sales-period="' + pair[0] + '"' +
                    (on ? ' class="active" aria-selected="true"' : ' aria-selected="false"') + '>' +
                    pair[1] + '</button>';
            }).join('') +
            '</div>' +
            '<div class="pd-summary-grid pd-sales-kpis">' +
            '<div class="pd-stat"><div class="label">Unidades</div><div class="val">' + esc(String(units)) + '</div></div>' +
            '<div class="pd-stat"><div class="label">Monto</div><div class="val">' + money(amount) + '</div></div>' +
            '<div class="pd-stat"><div class="label">Precio promedio</div><div class="val">' + (unitCount ? money(avgPrice) : '—') + '</div></div>' +
            '<div class="pd-stat"><div class="label">Ventas</div><div class="val">' + esc(String(ticketCount)) + '</div></div>' +
            '</div>' +
            '<div class="cortes-chart-panel pd-sales-chart-panel">' +
            '<div class="cortes-chart-head">' +
            '<div><h3>Ritmo de ventas</h3><p class="panel-sub" id="pdSalesChartSub"></p></div>' +
            '<div class="cortes-chart-legend" aria-hidden="true">' +
            (isHist
                ? '<span class="leg"><span class="swatch"></span> Historial</span>'
                : '<span class="leg"><span class="swatch"></span> Periodo</span>' +
                  '<span class="leg"><span class="swatch prev"></span> Anterior</span>') +
            '</div></div>' +
            '<div class="cortes-chart" id="pdSalesChart" role="img" aria-label="Ritmo de ventas del producto"></div>' +
            '</div>' +
            '<div class="pd-sales-clients">' +
            '<p class="pd-section-label">Principales clientes</p>' +
            '<div id="pdSalesClients">' +
            (clients.length
                ? clients.map(function (c) {
                    return '<div class="cortes-row">' +
                        '<div class="left"><span class="name">' + esc(c.name) + '</span></div>' +
                        '<span class="amt">' + esc(String(c.qty)) + ' u · ' + money(c.amount) + '</span>' +
                        '</div>';
                }).join('')
                : '<div class="cortes-empty">Sin clientes en este periodo</div>') +
            '</div></div></div>';

        renderRhythmChart({
            host: document.getElementById('pdSalesChart'),
            subEl: document.getElementById('pdSalesChartSub'),
            hatchId: 'pdSalesHatch',
            period: pdSalesPeriod,
            bounds: bounds,
            list: curSeries,
            prevBounds: prevBounds,
            prevList: prevSeries,
            showUnits: true
        });
    }

    // —— Cobranza (notas por cobrar) ——
    let cobranzaActiveKey = null;

    function pendingCollectionSales() {
        return salesForAnalytics().filter(isPendingCollection);
    }

    function cobranzaClientKey(sale) {
        if (sale.clientId) return 'id:' + sale.clientId;
        const name = String(sale.customer || saleClientLabel(sale) || 'Mostrador').trim().toLowerCase();
        return 'name:' + name;
    }

    function groupPendingByClient() {
        const map = {};
        pendingCollectionSales().forEach(function (s) {
            const key = cobranzaClientKey(s);
            if (!map[key]) {
                map[key] = {
                    key: key,
                    clientId: s.clientId || null,
                    name: saleClientLabel(s),
                    amount: 0,
                    tickets: [],
                };
            }
            map[key].amount += Number(s.total) || 0;
            map[key].tickets.push(s);
        });
        Object.keys(map).forEach(function (k) {
            map[k].tickets.sort(function (a, b) {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        });
        return Object.keys(map).map(function (k) { return map[k]; })
            .sort(function (a, b) { return b.amount - a.amount || a.name.localeCompare(b.name, 'es'); });
    }

    function updateCobranzaCollectBar() {
        const boxes = document.querySelectorAll('#cobranzaDetailBody input[data-cobranza-sale]:checked');
        let total = 0;
        boxes.forEach(function (cb) {
            total += Number(cb.getAttribute('data-amount')) || 0;
        });
        const n = boxes.length;
        const totalEl = document.getElementById('cobranzaSelectedTotal');
        const countEl = document.getElementById('cobranzaSelectedCount');
        const btn = document.getElementById('cobranzaCollectBtn');
        if (totalEl) totalEl.textContent = money(total);
        if (countEl) countEl.textContent = n + (n === 1 ? ' nota' : ' notas');
        if (btn) btn.disabled = n === 0;
        const all = document.getElementById('cobranzaSelectAll');
        const allBoxes = document.querySelectorAll('#cobranzaDetailBody input[data-cobranza-sale]');
        if (all && allBoxes.length) {
            all.checked = n === allBoxes.length;
            all.indeterminate = n > 0 && n < allBoxes.length;
        }
    }

    function openCobranzaDetail(key) {
        const groups = groupPendingByClient();
        const group = groups.filter(function (g) { return g.key === key; })[0];
        const card = document.getElementById('cobranzaDetailCard');
        const body = document.getElementById('cobranzaDetailBody');
        const title = document.getElementById('cobranzaDetailTitle');
        const sub = document.getElementById('cobranzaDetailSub');
        if (!card || !body || !group) return;
        cobranzaActiveKey = key;
        if (title) title.textContent = group.name;
        if (sub) {
            sub.textContent = group.tickets.length + ' nota' + (group.tickets.length === 1 ? '' : 's') +
                ' · saldo ' + money(group.amount);
        }
        body.innerHTML = group.tickets.map(function (s) {
            const d = new Date(s.createdAt);
            const dateStr = isNaN(d) ? '' : d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
            return '<tr>' +
                '<td><input type="checkbox" data-cobranza-sale="' + esc(s.id) + '" data-amount="' + esc(String(Number(s.total) || 0)) + '"></td>' +
                '<td class="muted">' + esc(dateStr) + '</td>' +
                '<td>' + saleReceiptCellHtml(s) + '</td>' +
                '<td><span class="badge ' + (s.billing === 'facturado' ? 'b-success' : '') + '">' + esc(billLabel(s.billing)) + '</span></td>' +
                '<td class="num">' + money(s.total) + '</td>' +
                '</tr>';
        }).join('');
        card.hidden = false;
        const all = document.getElementById('cobranzaSelectAll');
        if (all) {
            all.checked = false;
            all.indeterminate = false;
        }
        updateCobranzaCollectBar();
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function closeCobranzaDetail() {
        cobranzaActiveKey = null;
        const card = document.getElementById('cobranzaDetailCard');
        if (card) card.hidden = true;
        const body = document.getElementById('cobranzaDetailBody');
        if (body) body.innerHTML = '';
    }

    function collectSelectedCobranza() {
        const payEl = document.getElementById('cobranzaCollectPay');
        const pay = payEl ? payEl.value : 'efectivo';
        if (!isValidPayMethod(pay) || pay === 'por_cobrar') {
            toast('Elige efectivo, tarjeta o transferencia');
            return;
        }
        const boxes = document.querySelectorAll('#cobranzaDetailBody input[data-cobranza-sale]:checked');
        if (!boxes.length) {
            toast('Selecciona al menos una nota');
            return;
        }
        const ids = [];
        boxes.forEach(function (cb) { ids.push(cb.getAttribute('data-cobranza-sale')); });
        let amount = 0;
        ids.forEach(function (id) {
            const sale = saleById(id);
            if (!sale || !isPendingCollection(sale)) return;
            amount += Number(sale.total) || 0;
            sale.paymentMethod = pay;
            sale.payments = [{ method: pay, amount: roundMoney(sale.total) }];
            if (!sale.meta) sale.meta = {};
            sale.meta.collectedAt = new Date().toISOString();
            sale.meta.collectedPay = pay;
            persistSaleRecord(sale);
        });
        toast('Cobro registrado · ' + money(amount) + ' · ' + payLabel(pay));
        const prevKey = cobranzaActiveKey;
        renderCobranza();
        renderHistory();
        renderCortes();
        updatePosKpis();
        renderDashboardRadar();
        if (clientDashId) renderClientDashboard(clientDashId);
        if (prevKey) {
            const still = groupPendingByClient().some(function (g) { return g.key === prevKey; });
            if (still) openCobranzaDetail(prevKey);
            else closeCobranzaDetail();
        }
    }

    function renderCobranza() {
        const body = document.getElementById('cobranzaBody');
        if (!body) return;
        const q = (document.getElementById('cobranzaSearch') && document.getElementById('cobranzaSearch').value || '').toLowerCase().trim();
        let groups = groupPendingByClient();
        if (q) {
            groups = groups.filter(function (g) {
                if (String(g.name || '').toLowerCase().indexOf(q) >= 0) return true;
                return g.tickets.some(function (s) {
                    const rid = saleReceiptId(s);
                    return (rid && rid.indexOf(q) >= 0) ||
                        String(s.folio || '').toLowerCase().indexOf(q) >= 0;
                });
            });
        }
        const allPending = pendingCollectionSales();
        const totalAmount = allPending.reduce(function (n, s) { return n + (Number(s.total) || 0); }, 0);
        const totalEl = document.getElementById('cobranzaTotal');
        const ticketsEl = document.getElementById('cobranzaTickets');
        const clientsEl = document.getElementById('cobranzaClients');
        if (totalEl) totalEl.textContent = money(totalAmount);
        if (ticketsEl) ticketsEl.textContent = String(allPending.length);
        if (clientsEl) clientsEl.textContent = String(groupPendingByClient().length);

        if (!groups.length) {
            body.innerHTML = '<tr><td colspan="4" class="empty">' +
                (q ? 'Sin resultados' : 'Nadie debe · no hay notas por cobrar') +
                '</td></tr>';
            if (cobranzaActiveKey) closeCobranzaDetail();
            return;
        }
        body.innerHTML = groups.map(function (g) {
            return '<tr data-cobranza-key="' + esc(g.key) + '">' +
                '<td>' + esc(g.name) + '</td>' +
                '<td class="num">' + g.tickets.length + '</td>' +
                '<td class="num">' + money(g.amount) + '</td>' +
                '<td><button type="button" class="btn" data-cobranza-open="' + esc(g.key) + '">Ver notas</button></td>' +
                '</tr>';
        }).join('');
        if (cobranzaActiveKey && !groups.some(function (g) { return g.key === cobranzaActiveKey; })) {
            closeCobranzaDetail();
        } else if (cobranzaActiveKey) {
            openCobranzaDetail(cobranzaActiveKey);
        }
    }

    function bindCobranza() {
        if (bindCobranza.done) return;
        bindCobranza.done = true;
        const search = document.getElementById('cobranzaSearch');
        if (search) {
            search.addEventListener('input', function () {
                renderCobranza();
            });
        }
        const body = document.getElementById('cobranzaBody');
        if (body) {
            body.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-cobranza-open]');
                if (!btn) return;
                openCobranzaDetail(btn.getAttribute('data-cobranza-open'));
            });
        }
        const detailBody = document.getElementById('cobranzaDetailBody');
        if (detailBody) {
            detailBody.addEventListener('change', function (e) {
                if (e.target && e.target.matches('input[data-cobranza-sale]')) {
                    updateCobranzaCollectBar();
                }
            });
        }
        const selectAll = document.getElementById('cobranzaSelectAll');
        if (selectAll) {
            selectAll.addEventListener('change', function () {
                document.querySelectorAll('#cobranzaDetailBody input[data-cobranza-sale]').forEach(function (cb) {
                    cb.checked = selectAll.checked;
                });
                updateCobranzaCollectBar();
            });
        }
        const closeBtn = document.getElementById('cobranzaDetailClose');
        if (closeBtn) closeBtn.addEventListener('click', closeCobranzaDetail);
        const collectBtn = document.getElementById('cobranzaCollectBtn');
        if (collectBtn) collectBtn.addEventListener('click', collectSelectedCobranza);
    }
    function renderPromosAdmin() {
        const body = document.getElementById('promosTableBody');
        if (!body) return;
        if (!promoCodes.length) {
            body.innerHTML = '<tr><td colspan="6" class="muted">Sin códigos. Crea uno o recarga para el seed 80MAS5.</td></tr>';
            return;
        }
        body.innerHTML = promoCodes.map(function (p) {
            const elig = (!p.eligibleProducts || !p.eligibleProducts.length)
                ? 'Todos'
                : (p.eligibleProducts.length + ' producto' + (p.eligibleProducts.length === 1 ? '' : 's'));
            const flags = [
                p.active ? 'Activo' : 'Inactivo',
                p.distributorOnly ? 'Solo dist.' : null
            ].filter(Boolean).join(' · ');
            return '<tr>' +
                '<td><strong>' + esc(p.code) + '</strong></td>' +
                '<td>' + esc(p.label) + '</td>' +
                '<td>' + esc(promoTypeLabel(p.type)) + '</td>' +
                '<td>' + esc(elig) + '</td>' +
                '<td>' + esc(flags) + '</td>' +
                '<td style="white-space:nowrap;text-align:right">' +
                '<button type="button" class="btn ghost" data-promo-edit="' + esc(p.id) + '" title="Editar">Editar</button> ' +
                '<button type="button" class="btn ghost" data-promo-toggle="' + esc(p.id) + '" title="Activar/desactivar">' +
                (p.active ? 'Desactivar' : 'Activar') + '</button> ' +
                '<button type="button" class="btn ghost danger" data-promo-del="' + esc(p.id) + '" title="Borrar">Borrar</button>' +
                '</td></tr>';
        }).join('');
    }

    function syncPromoAdminTypeFields() {
        const typeEl = document.getElementById('promoAdminType');
        const type = typeEl ? typeEl.value : 'pallet_bonus';
        const palletBlock = document.getElementById('promoAdminPalletFields');
        const percentBlock = document.getElementById('promoAdminPercentFields');
        const fixedBlock = document.getElementById('promoAdminFixedFields');
        if (palletBlock) palletBlock.hidden = type !== 'pallet_bonus';
        if (percentBlock) percentBlock.hidden = type !== 'percent';
        if (fixedBlock) fixedBlock.hidden = type !== 'fixed';
    }

    function fillPromoEligibleSelect(selected) {
        const list = document.getElementById('promoAdminEligibleList');
        if (!list) return;
        const picked = {};
        (selected || []).forEach(function (s) { picked[s] = true; });
        const recipes = getRecipes();
        if (!recipes.length) {
            list.innerHTML = '<p class="muted" style="margin:0;font-size:12px">No hay productos cargados.</p>';
            return;
        }
        list.innerHTML = recipes.map(function (r) {
            const id = 'promoElig_' + String(r.product || '').replace(/[^a-zA-Z0-9_-]/g, '_');
            return '<label class="promo-eligible-item" for="' + esc(id) + '">' +
                '<input type="checkbox" id="' + esc(id) + '" value="' + esc(r.product) + '"' +
                (picked[r.product] ? ' checked' : '') + '>' +
                '<span>' + esc(r.name) + (r.code ? ' <span class="muted">(' + esc(r.code) + ')</span>' : '') + '</span>' +
                '</label>';
        }).join('');
    }

    function collectPromoEligibleFromList() {
        const list = document.getElementById('promoAdminEligibleList');
        if (!list) return [];
        return Array.prototype.slice.call(list.querySelectorAll('input[type="checkbox"]:checked'))
            .map(function (el) { return el.value; })
            .filter(Boolean);
    }

    function promoLevelRowHtml(lv) {
        const minVal = lv && lv.min != null && lv.min !== '' ? String(lv.min) : '';
        const maxVal = lv && lv.max != null && lv.max !== '' ? String(lv.max) : '';
        const giftVal = lv && lv.giftPerPallet != null && lv.giftPerPallet !== '' ? String(lv.giftPerPallet) : '';
        return '<div class="promo-level-row" data-promo-level-row role="listitem">' +
            '<input type="number" min="0" step="1" data-level-min aria-label="Desde" value="' + esc(minVal) + '">' +
            '<input type="number" min="0" step="1" data-level-max aria-label="Hasta" value="' + esc(maxVal) + '">' +
            '<input type="number" min="0" step="1" data-level-gift aria-label="Regalo por tarima" value="' + esc(giftVal) + '">' +
            '<button type="button" class="btn ghost danger promo-level-del" data-level-del title="Quitar nivel" aria-label="Quitar nivel">' +
            '<i class="fa-solid fa-trash-can"></i>' +
            '</button>' +
            '</div>';
    }

    function renderPromoLevelsEditor(levels) {
        const list = document.getElementById('promoAdminLevelsList');
        if (!list) return;
        const rows = (levels && levels.length) ? levels : defaultPalletLevels();
        list.innerHTML = rows.map(function (lv) { return promoLevelRowHtml(lv); }).join('');
    }

    function collectPromoLevelsFromEditor() {
        const list = document.getElementById('promoAdminLevelsList');
        if (!list) return { ok: false, error: 'No se encontraron niveles', levels: [] };
        const rows = Array.prototype.slice.call(list.querySelectorAll('[data-promo-level-row]'));
        if (!rows.length) return { ok: false, error: 'Agrega al menos un nivel', levels: [] };
        const out = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const minEl = row.querySelector('[data-level-min]');
            const maxEl = row.querySelector('[data-level-max]');
            const giftEl = row.querySelector('[data-level-gift]');
            const minRaw = minEl ? String(minEl.value || '').trim() : '';
            const maxRaw = maxEl ? String(maxEl.value || '').trim() : '';
            const giftRaw = giftEl ? String(giftEl.value || '').trim() : '';
            if (minRaw === '' || maxRaw === '' || giftRaw === '') {
                return { ok: false, error: 'Completa Desde, Hasta y Regalo en cada nivel', levels: [] };
            }
            const min = Math.floor(Number(minRaw));
            const max = Math.floor(Number(maxRaw));
            const gift = Math.floor(Number(giftRaw));
            if (!isFinite(min) || !isFinite(max) || !isFinite(gift)) {
                return { ok: false, error: 'Los niveles deben ser números válidos', levels: [] };
            }
            if (min < 0 || max < 0 || gift < 0) {
                return { ok: false, error: 'Desde, Hasta y Regalo no pueden ser negativos', levels: [] };
            }
            if (min > max) {
                return { ok: false, error: 'En cada nivel, Desde no puede ser mayor que Hasta', levels: [] };
            }
            out.push({ min: min, max: max, giftPerPallet: gift });
        }
        return { ok: true, levels: out };
    }

    function addPromoLevelRow(preset) {
        const list = document.getElementById('promoAdminLevelsList');
        if (!list) return;
        const lv = preset || { min: '', max: '', giftPerPallet: '' };
        list.insertAdjacentHTML('beforeend', promoLevelRowHtml(lv));
    }

    function openPromoAdminModal(id) {
        const modal = document.getElementById('promoAdminModal');
        const title = document.getElementById('promoAdminModalTitle');
        promoAdminEditId = id || null;
        const p = id ? promoById(id) : null;
        if (title) title.textContent = p ? 'Editar código' : 'Nuevo código';
        const codeEl = document.getElementById('promoAdminCode');
        const labelEl = document.getElementById('promoAdminLabel');
        const typeEl = document.getElementById('promoAdminType');
        const activeEl = document.getElementById('promoAdminActive');
        const distEl = document.getElementById('promoAdminDistributorOnly');
        const allEl = document.getElementById('promoAdminAllProducts');
        const palletEl = document.getElementById('promoAdminPalletSize');
        const percentEl = document.getElementById('promoAdminPercent');
        const fixedEl = document.getElementById('promoAdminFixed');
        const notesEl = document.getElementById('promoAdminNotes');
        if (codeEl) {
            codeEl.value = p ? p.code : '';
            codeEl.readOnly = !!p;
        }
        if (labelEl) labelEl.value = p ? p.label : '';
        if (typeEl) typeEl.value = p ? p.type : 'pallet_bonus';
        if (activeEl) activeEl.checked = p ? p.active : true;
        if (distEl) distEl.checked = p ? p.distributorOnly : true;
        const allProducts = !p || !p.eligibleProducts || !p.eligibleProducts.length;
        if (allEl) allEl.checked = allProducts;
        fillPromoEligibleSelect(p ? p.eligibleProducts : []);
        const eligWrap = document.getElementById('promoAdminEligibleWrap');
        if (eligWrap) eligWrap.hidden = allProducts;
        if (palletEl) palletEl.value = String(p ? p.palletSize : 80);
        renderPromoLevelsEditor(p ? p.levels : defaultPalletLevels());
        if (percentEl) percentEl.value = p && p.percentOff != null ? String(p.percentOff) : '';
        if (fixedEl) fixedEl.value = p && p.fixedOff != null ? String(p.fixedOff) : '';
        if (notesEl) notesEl.value = p ? (p.notes || '') : '';
        syncPromoAdminTypeFields();
        if (!modal) return;
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
    }

    function closePromoAdminModal() {
        const modal = document.getElementById('promoAdminModal');
        if (!modal) return;
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        promoAdminEditId = null;
    }

    function submitPromoAdminForm(e) {
        if (e) e.preventDefault();
        const codeEl = document.getElementById('promoAdminCode');
        const code = normalizePromoCode(codeEl ? codeEl.value : '');
        if (!code) {
            toast('Código requerido');
            return;
        }
        const typeEl = document.getElementById('promoAdminType');
        const type = typeEl ? typeEl.value : 'pallet_bonus';
        const allEl = document.getElementById('promoAdminAllProducts');
        let eligible = [];
        if (!allEl || !allEl.checked) {
            eligible = collectPromoEligibleFromList();
        }
        const existing = promoAdminEditId ? promoById(promoAdminEditId) : null;
        if (!existing && promoByCode(code)) {
            toast('Ya existe ese código');
            return;
        }
        if (existing && existing.code !== code && promoByCode(code)) {
            toast('Ya existe ese código');
            return;
        }
        let levels = defaultPalletLevels();
        let percentOff = null;
        let fixedOff = null;
        if (type === 'pallet_bonus') {
            const levelsResult = collectPromoLevelsFromEditor();
            if (!levelsResult.ok) {
                toast(levelsResult.error);
                return;
            }
            levels = levelsResult.levels;
        } else if (type === 'percent') {
            const pctRaw = (document.getElementById('promoAdminPercent') || {}).value;
            const pct = Number(pctRaw);
            if (!isFinite(pct) || pct <= 0 || pct > 100) {
                toast('Indica un % de descuento entre 0.1 y 100');
                return;
            }
            percentOff = pct;
        } else if (type === 'fixed') {
            const offRaw = (document.getElementById('promoAdminFixed') || {}).value;
            const off = Number(offRaw);
            if (!isFinite(off) || off <= 0) {
                toast('Indica un monto fijo mayor a 0');
                return;
            }
            fixedOff = off;
        }
        const draft = normalizePromoItem({
            id: existing ? existing.id : ('promo-' + Date.now().toString(36)),
            code: code,
            label: (document.getElementById('promoAdminLabel') || {}).value,
            active: !!(document.getElementById('promoAdminActive') || {}).checked,
            type: type,
            distributorOnly: !!(document.getElementById('promoAdminDistributorOnly') || {}).checked,
            eligibleProducts: eligible,
            palletSize: (document.getElementById('promoAdminPalletSize') || {}).value,
            levels: levels,
            percentOff: percentOff,
            fixedOff: fixedOff,
            notes: (document.getElementById('promoAdminNotes') || {}).value,
            updatedAt: new Date().toISOString()
        });
        if (!draft) {
            toast('Datos inválidos');
            return;
        }
        if (existing) {
            const idx = promoCodes.findIndex(function (p) { return p.id === existing.id; });
            if (idx >= 0) promoCodes[idx] = draft;
        } else {
            promoCodes.unshift(draft);
        }
        savePromoCodes();
        if (appliedPromoCode && normalizePromoCode(appliedPromoCode) === draft.code) {
            if (!draft.active) clearAppliedPromoCode({ quiet: true });
            else syncAppliedPromoLines({ quiet: true });
            applyCartTierPrices();
            renderCart();
        }
        closePromoAdminModal();
        renderPromosAdmin();
        toast(existing ? 'Código actualizado' : 'Código creado');
    }

    function bindPromoAdmin() {
        const addBtn = document.getElementById('promoAdminAddBtn');
        if (addBtn) addBtn.addEventListener('click', function () { openPromoAdminModal(null); });
        const body = document.getElementById('promosTableBody');
        if (body) {
            body.addEventListener('click', function (e) {
                const edit = e.target.closest('[data-promo-edit]');
                const tog = e.target.closest('[data-promo-toggle]');
                const del = e.target.closest('[data-promo-del]');
                if (edit) {
                    openPromoAdminModal(edit.getAttribute('data-promo-edit'));
                    return;
                }
                if (tog) {
                    const p = promoById(tog.getAttribute('data-promo-toggle'));
                    if (!p) return;
                    p.active = !p.active;
                    p.updatedAt = new Date().toISOString();
                    savePromoCodes();
                    if (appliedPromoCode === p.code && !p.active) {
                        clearAppliedPromoCode({ quiet: true });
                        applyCartTierPrices();
                        renderCart();
                    }
                    renderPromosAdmin();
                    toast(p.active ? 'Código activado' : 'Código desactivado');
                    return;
                }
                if (del) {
                    const id = del.getAttribute('data-promo-del');
                    const p = promoById(id);
                    if (!p) return;
                    if (!confirm('¿Borrar el código ' + p.code + '?')) return;
                    promoCodes = promoCodes.filter(function (x) { return x.id !== id; });
                    savePromoCodes();
                    if (appliedPromoCode === p.code) {
                        clearAppliedPromoCode({ quiet: true });
                        applyCartTierPrices();
                        renderCart();
                    }
                    renderPromosAdmin();
                    toast('Código borrado');
                }
            });
        }
        const typeEl = document.getElementById('promoAdminType');
        if (typeEl) typeEl.addEventListener('change', syncPromoAdminTypeFields);
        const allEl = document.getElementById('promoAdminAllProducts');
        if (allEl) {
            allEl.addEventListener('change', function () {
                const wrap = document.getElementById('promoAdminEligibleWrap');
                if (wrap) wrap.hidden = !!allEl.checked;
            });
        }
        const levelsList = document.getElementById('promoAdminLevelsList');
        if (levelsList) {
            levelsList.addEventListener('click', function (e) {
                const delBtn = e.target.closest('[data-level-del]');
                if (!delBtn) return;
                const row = delBtn.closest('[data-promo-level-row]');
                if (!row) return;
                const siblings = levelsList.querySelectorAll('[data-promo-level-row]');
                if (siblings.length <= 1) {
                    toast('Deja al menos un nivel');
                    return;
                }
                row.remove();
            });
        }
        const addLevelBtn = document.getElementById('promoAdminAddLevel');
        if (addLevelBtn) {
            addLevelBtn.addEventListener('click', function () {
                addPromoLevelRow({ min: '', max: '', giftPerPallet: '' });
            });
        }
        const form = document.getElementById('promoAdminForm');
        if (form) form.addEventListener('submit', submitPromoAdminForm);
        const closeBtn = document.getElementById('promoAdminModalClose');
        if (closeBtn) closeBtn.addEventListener('click', closePromoAdminModal);
        const cancelBtn = document.getElementById('promoAdminCancel');
        if (cancelBtn) cancelBtn.addEventListener('click', closePromoAdminModal);
        const modal = document.getElementById('promoAdminModal');
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) closePromoAdminModal();
            });
        }
    }

    function onSectionShow(id) {
        if (id === 'venta') {
            setPosMode(posMode || 'venta');
            renderChips();
            renderProducts();
            fillClientSelect();
            renderCart();
            updatePosKpis();
            if (posMode === 'gastos') renderGastosPanel();
        } else if (id === 'clients') {
            renderClients();
            if (clientDashId) {
                const listView = document.getElementById('clientsListView');
                const detailView = document.getElementById('clientsDetailView');
                if (listView) listView.hidden = true;
                if (detailView) detailView.hidden = false;
                renderClientDashboard(clientDashId);
            }
        } else if (id === 'salesHistory') {
            fillHistoryClientFilter();
            renderHistory();
        } else if (id === 'cortes') {
            renderCortes();
        } else if (id === 'dinero') {
            renderDinero();
        } else if (id === 'dashboard') {
            renderDashboardRadar();
        } else if (id === 'prices' || id === 'products') {
            renderPriceChips();
            renderPrices();
            if (id === 'products') renderProductsMovementsChart();
        } else if (id === 'promos') {
            renderPromosAdmin();
        } else if (id === 'cobranza') {
            renderCobranza();
        }
    }

    function refreshPosAfterDataLoad() {
        renderChips();
        renderProducts();
        fillClientSelect();
        renderCart();
        fillHistoryClientFilter();
        renderHistory();
        renderCortes();
        renderDinero();
        renderGastosPanel();
        renderProductsMovementsChart();
        renderClients();
        renderCobranza();
        renderPriceChips();
        renderPrices();
        renderPromosAdmin();
        updatePosKpis();
    }

    function init() {
        prices = loadPrices();
        // Solo migrar legacy→v4 una vez. Reescribir precios en cada carga bumpaba
        // updatedAt a "ahora" y el LWW local ganaba a la nube (pisaba sync).
        try {
            const hasV4 = !!localStorage.getItem(PRICE_KEY);
            const stored = readStoredPrices();
            if (!hasV4 || (stored && stored.fromLegacy)) savePrices();
        } catch (_) {
            savePrices();
        }
        sales = loadSales();
        ensureCajaGastosPersisted();
        cajaGastos = loadCajaGastos();
        tesoreriaMovs = loadTesoreriaMovs();
        clients = loadClients();
        promoCodes = loadPromoCodes();
        ensurePromoSeeds();
        ensureTesoreriaSeeds();

        function afterCloudReady(syncRes) {
            if (syncRes && syncRes.reloading) return;
            // Releer caché por si el sync aplicó remoto sin recarga.
            prices = loadPrices();
            sales = loadSales();
            ensureCajaGastosPersisted();
            cajaGastos = loadCajaGastos();
            tesoreriaMovs = loadTesoreriaMovs();
            clients = loadClients();
            promoCodes = loadPromoCodes();
            ensurePromoSeeds();
            ensureTesoreriaSeeds();
            ensureHistoricalSalesImport();
            syncClientsFromServer().then(function (res) {
                if (res && res.ok) return;
                // Solo siembra desde JSON si no hay clientes locales ni remoto (nunca reimporta al refresh).
                if (!clients.length) {
                    return importClientsCatalog().then(function () {
                        return pushClientsToServer();
                    });
                }
                return pushClientsToServer();
            }).catch(function () {});
            refreshPosAfterDataLoad();
        }

        bind();
        bindCobranza();
        (function syncSaleCityRadios() {
            syncSaleCityControl();
            syncGastoCityControl();
            setPosMode('venta');
        })();
        refreshPosAfterDataLoad();
        window.S35PosModule = {
            onSectionShow: onSectionShow,
            refreshProducts: renderProducts,
            money: money,
            familyDot: familyDot,
            familyColors: FAMILY_COLORS,
            familyColor: familyColor,
            getProductFamilies: function () { return productFamilies.slice(); },
            getEffectiveFamily: getEffectiveFamily,
            setProductFamily: setProductFamilyOverride,
            addProductFamily: addProductFamily,
            removeProductFamily: removeProductFamily,
            productsUsingFamily: productsUsingFamily,
            productFamilySelectHtml: productFamilySelectHtml,
            productUncategorizedId: PRODUCT_UNCATEGORIZED_ID,
            productUncategorizedLabel: PRODUCT_UNCATEGORIZED_LABEL,
            refreshProductFamilyUi: refreshProductFamilyUi,
            tierLabels: TIER_LABELS,
            presentationsForSlug: presentationsForSlug,
            getPriceEntry: function (id) { return prices[id] || null; },
            getDistributorPrice: getDistributorPrice,
            setTierPrice: setTierPrice,
            ensureProductPrice: function (id, presentationKg) {
                if (!id || prices[id]) return prices[id] || null;
                ensurePriceEntry(id, presentationKg);
                savePrices();
                return prices[id];
            },
            setDistributorPrice: setDistributorPrice,
            resetPricesToDefaults: resetPricesToDefaults,
            priceEditorHtml: priceEditorHtml,
            commitPriceEditor: commitPriceEditor,
            reloadPricesFromStorage: reloadPricesFromStorage,
            reloadSyncedFromStorage: reloadSyncedFromStorage,
            savePrices: function (opts) { return savePrices(opts || {}); },
            renderProductSalesAnalytics: renderProductSalesAnalytics,
            renderProductsMovementsChart: renderProductsMovementsChart,
            renderCortes: renderCortes,
            renderDinero: renderDinero,
            renderClientDashboard: renderClientDashboard,
            openClientDashboard: openClientDashboard,
            openClientModal: openClientModal,
            openCobranzaForClient: openCobranzaForClient,
            openSaleNoteById: openSaleNoteById,
            getClients: function () { return clients.slice(); },
            searchSales: searchSales,
            getSaleCities: function () { return SALE_CITIES.slice(); },
            setCortesCityFilter: setCortesCityFilter,
            openCortesPeriod: openCortesPeriod,
            openCortesView: openCortesView,
            buildCopilotContext: buildCopilotContext,
            executeCopilotTool: executeCopilotTool,
            renderDashboardRadar: renderDashboardRadar,
            importHistoricalSales: importHistoricalSales,
            renderCobranza: renderCobranza,
            baseUnitPrice: baseUnitPrice,
            monthAverageUnitPriceMap: monthAverageUnitPriceMap,
            unitFor: unitFor,
            getPromoCodes: function () { return promoCodes.slice(); },
            renderPromosAdmin: renderPromosAdmin
        };
        if (window.S35PanelAPI && typeof window.S35PanelAPI.onPosReady === 'function') {
            window.S35PanelAPI.onPosReady();
        }

        var syncBoot = (window.S35PanelSync && typeof window.S35PanelSync.bootstrap === 'function')
            ? window.S35PanelSync.bootstrap()
            : Promise.resolve({ ok: false, reason: 'no-sync' });
        syncBoot.then(afterCloudReady).catch(function () {
            afterCloudReady({ ok: false });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
