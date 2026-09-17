/* POS + Clientes + Historial + Cortes + Precios — módulo del panel Colaboradores */
(function () {
    'use strict';

    const PRICE_KEY = 's35_pos_prices_v2';
    const SALES_KEY = 's35_pos_sales';
    const CLIENTS_KEY = 's35_pos_clients';
    const FINISHED_KEY = 's35_finished_stock';

    /** Fallback flat (sin lista mayorista) — se replica en los 6 escalones. */
    const FAMILY_DEFAULTS = {
        'Estucos premium': 450,
        'Microconcretos': 480,
        'Panel System': 420,
        'Pro+ Systems': 400,
        'Pegaxpress: Adhesivos': 380,
        'Líquidos': 520
    };

    const TIER_IDS = ['t1', 't2', 't3', 't4', 't5', 't6'];
    const TIER_LABELS = ['1 a 100', '100 a 500', '500 a 999', '1000 a 2000', '2000 a 3000', '3000 a 5000'];

    let cortesPeriod = 'day';
    let cortesOffset = 0;

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function money(n) {
        return '$' + (Number(n) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    function payLabel(v) {
        if (v === 'tarjeta') return 'Tarjeta';
        if (v === 'transferencia') return 'Transferencia';
        return 'Efectivo';
    }
    function billLabel(v) {
        return v === 'facturado' ? 'Facturado' : 'Sin facturar';
    }
    function toast(msg) {
        const el = document.getElementById('toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { el.classList.remove('show'); }, 2200);
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
    function periodBounds(period, offset, now) {
        now = now || new Date();
        let start;
        let end;
        if (period === 'week') {
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
        if (period === 'day') {
            const today = startOfLocalDay(new Date());
            if (start.getTime() === today.getTime()) return 'Hoy · ' + start.toLocaleDateString('es-MX', optsDay);
            if (start.getTime() === addDays(today, -1).getTime()) return 'Ayer · ' + start.toLocaleDateString('es-MX', optsDay);
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
    function pctDelta(cur, prev) {
        if (!prev) return null;
        return ((cur - prev) / prev) * 100;
    }
    function formatDelta(cur, prev) {
        if (prev == null || (prev === 0 && cur === 0)) return 'Sin ventas en el periodo anterior';
        if (prev === 0) return 'vs periodo anterior · ' + money(prev) + ' → nuevo';
        const d = pctDelta(cur, prev);
        const sign = d > 0 ? '+' : '';
        return 'vs periodo anterior · ' + money(prev) + ' (' + sign + d.toFixed(0) + '%)';
    }

    function emptyRhythmBuckets(period, bounds) {
        if (period === 'week') {
            return {
                subtitle: 'Lunes a viernes',
                buckets: [
                    { key: 0, label: 'Lun' },
                    { key: 1, label: 'Mar' },
                    { key: 2, label: 'Mié' },
                    { key: 3, label: 'Jue' },
                    { key: 4, label: 'Vie' }
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
                subtitle: 'Enero a diciembre',
                buckets: labels.map(function (label, i) {
                    return { key: i, label: label, amount: 0 };
                })
            };
        }
        const buckets = [];
        for (let h = 7; h <= 19; h++) {
            buckets.push({
                key: h,
                label: (h < 10 ? '0' : '') + h + ':00',
                amount: 0
            });
        }
        return { subtitle: 'Por hora · 7:00–19:00', buckets: buckets };
    }

    function fillRhythmBuckets(period, bounds, list) {
        const meta = emptyRhythmBuckets(period, bounds);
        const buckets = meta.buckets;
        list.forEach(function (s) {
            const d = new Date(s.createdAt);
            if (isNaN(d.getTime())) return;
            const amt = Number(s.total) || 0;
            if (period === 'day') {
                const h = d.getHours();
                if (h >= 7 && h <= 19) buckets[h - 7].amount += amt;
            } else if (period === 'week') {
                const dayStart = startOfLocalDay(d);
                const diff = Math.round((dayStart.getTime() - bounds.start.getTime()) / 86400000);
                if (diff >= 0 && diff <= 4) buckets[diff].amount += amt;
            } else if (period === 'month') {
                if (d.getFullYear() === bounds.start.getFullYear() && d.getMonth() === bounds.start.getMonth()) {
                    const day = d.getDate();
                    if (buckets[day - 1]) buckets[day - 1].amount += amt;
                }
            } else if (period === 'year') {
                if (d.getFullYear() === bounds.start.getFullYear()) {
                    buckets[d.getMonth()].amount += amt;
                }
            }
        });
        return { subtitle: meta.subtitle, buckets: buckets };
    }

    function compactMoney(n) {
        const v = Number(n) || 0;
        if (v >= 1000000) return '$' + (v / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (v >= 1000) return '$' + (v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k';
        return '$' + Math.round(v).toLocaleString('es-MX');
    }

    function renderCortesChart(period, bounds, list, prevBounds, prevList) {
        const host = document.getElementById('cortesChart');
        const subEl = document.getElementById('cortesChartSub');
        if (!host) return;

        const cur = fillRhythmBuckets(period, bounds, list);
        const prev = fillRhythmBuckets(period, prevBounds, prevList);
        if (subEl) subEl.textContent = cur.subtitle;

        const n = cur.buckets.length;
        let maxVal = 0;
        for (let i = 0; i < n; i++) {
            maxVal = Math.max(maxVal, cur.buckets[i].amount, (prev.buckets[i] && prev.buckets[i].amount) || 0);
        }
        const hasData = maxVal > 0;

        const W = 720;
        const H = 180;
        const padL = 44;
        const padR = 8;
        const padT = 12;
        const padB = 28;
        const plotW = W - padL - padR;
        const plotH = H - padT - padB;
        const slot = plotW / Math.max(n, 1);
        const groupW = Math.min(slot * 0.72, period === 'month' ? 16 : 28);
        const barW = Math.max(2, (groupW - 2) / 2);
        const yMax = maxVal > 0 ? maxVal * 1.08 : 1;

        function yPos(v) {
            return padT + plotH - (v / yMax) * plotH;
        }

        const gridYs = [0, 0.5, 1];
        let grid = '';
        let yLabels = '';
        gridYs.forEach(function (f) {
            const y = padT + plotH * (1 - f);
            const val = yMax * f;
            grid += '<line class="grid-line" x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '"/>';
            if (hasData || f === 0) {
                yLabels += '<text class="y-label" x="' + (padL - 6) + '" y="' + (y + 3) + '" text-anchor="end">' +
                    (f === 0 ? '$0' : compactMoney(val)) + '</text>';
            }
        });

        let bars = '';
        let xLabels = '';
        const labelEvery = period === 'month' ? (n > 20 ? 2 : 1) : (period === 'day' ? 2 : 1);
        for (let i = 0; i < n; i++) {
            const cx = padL + slot * i + slot / 2;
            const prevAmt = (prev.buckets[i] && prev.buckets[i].amount) || 0;
            const curAmt = cur.buckets[i].amount || 0;
            const prevH = hasData ? (prevAmt / yMax) * plotH : 0;
            const curH = hasData ? (curAmt / yMax) * plotH : 0;
            const x0 = cx - groupW / 2;
            bars += '<rect class="bar-prev" x="' + x0.toFixed(1) + '" y="' + (padT + plotH - prevH).toFixed(1) +
                '" width="' + barW.toFixed(1) + '" height="' + Math.max(0, prevH).toFixed(1) + '" rx="1"/>';
            bars += '<rect class="bar-cur" x="' + (x0 + barW + 1).toFixed(1) + '" y="' + (padT + plotH - curH).toFixed(1) +
                '" width="' + barW.toFixed(1) + '" height="' + Math.max(0, curH).toFixed(1) + '" rx="1">' +
                '<title>' + esc(cur.buckets[i].label) + ': ' + money(curAmt) +
                (prevAmt ? ' · ant. ' + money(prevAmt) : '') + '</title></rect>';

            const showLabel = i === 0 || i === n - 1 || (i % labelEvery === 0);
            if (showLabel) {
                const lab = period === 'day'
                    ? String(cur.buckets[i].key)
                    : cur.buckets[i].label;
                xLabels += '<text class="axis-label" x="' + cx.toFixed(1) + '" y="' + (H - 8) +
                    '" text-anchor="middle">' + esc(lab) + '</text>';
            }
        }

        const emptyNote = hasData ? '' : '<div class="cortes-chart-empty">Sin ventas en este ritmo</div>';
        host.innerHTML = emptyNote +
            '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
            grid + yLabels + bars + xLabels +
            '</svg>';
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
                family: r.family || '',
                kind: r.kind,
                recipe: r,
                fromRecipe: true
            };
        });
        priceListItems().forEach(function (it) {
            const key = it.recipeSlug || it.id;
            if (byId[key]) {
                byId[key].presentationKg = it.presentationKg;
                byId[key].listName = it.name;
                byId[key].category = it.category;
                return;
            }
            byId[it.id] = {
                id: it.id,
                name: it.name,
                code: '',
                family: it.category || 'Lista mayorista',
                kind: 'seco',
                recipe: null,
                fromRecipe: false,
                presentationKg: it.presentationKg,
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

    function unitFor(entryOrRecipe) {
        const r = entryOrRecipe && entryOrRecipe.recipe ? entryOrRecipe.recipe : entryOrRecipe;
        if (r && r.kind === 'liquido') return 'Cubeta';
        const kg = presentationKgFor(entryOrRecipe && entryOrRecipe.id ? entryOrRecipe.id : (r && r.product));
        if (kg) return 'Saco ' + kg + ' kg';
        return 'Saco';
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
        return FAMILY_DEFAULTS[r.family] || 400;
    }

    function sixTiers(n) {
        const v = Math.max(0, roundMoney(n));
        return [v, v, v, v, v, v];
    }

    function roundMoney(n) {
        return Math.round((Number(n) || 0) * 100) / 100;
    }

    function normalizeEntry(raw, fallbackTiers, presentationKg) {
        if (raw && typeof raw === 'object' && Array.isArray(raw.tiers) && raw.tiers.length >= 6) {
            return {
                presentationKg: raw.presentationKg != null ? raw.presentationKg : presentationKg,
                tiers: raw.tiers.slice(0, 6).map(roundMoney)
            };
        }
        if (typeof raw === 'number') {
            return { presentationKg: presentationKg, tiers: sixTiers(raw) };
        }
        return {
            presentationKg: presentationKg,
            tiers: (fallbackTiers || sixTiers(400)).slice(0, 6).map(roundMoney)
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
                tiers: (it.tiers || []).slice(0, 6).map(roundMoney)
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
                tiers: sixTiers(flatDefaultFor(r))
            };
        });
        return map;
    }
    function loadPrices() {
        const seed = seedPrices();
        try {
            const raw = JSON.parse(localStorage.getItem(PRICE_KEY) || 'null');
            if (raw && typeof raw === 'object') {
                Object.keys(seed).forEach(function (id) {
                    if (raw[id] != null) {
                        seed[id] = normalizeEntry(raw[id], seed[id].tiers, seed[id].presentationKg);
                    }
                });
                Object.keys(raw).forEach(function (id) {
                    if (!seed[id]) {
                        seed[id] = normalizeEntry(raw[id], null, null);
                    }
                });
            }
        } catch (_) {}
        return seed;
    }
    function savePrices() {
        localStorage.setItem(PRICE_KEY, JSON.stringify(prices));
    }

    function applyCartTierPrices() {
        const units = cartQty();
        cart.forEach(function (it) {
            it.price = unitPrice(it.product, units);
            it.tierIndex = tierIndexForQty(units);
        });
    }

    // —— Sales ——
    let sales = [];
    function loadSales() {
        try {
            const raw = JSON.parse(localStorage.getItem(SALES_KEY) || 'null');
            if (raw && Array.isArray(raw.items)) return raw.items;
        } catch (_) {}
        return [];
    }
    function saveSales() {
        localStorage.setItem(SALES_KEY, JSON.stringify({ items: sales, updatedAt: new Date().toISOString() }));
    }

    // —— Clients ——
    let clients = [];
    function loadClients() {
        try {
            const raw = JSON.parse(localStorage.getItem(CLIENTS_KEY) || 'null');
            if (raw && Array.isArray(raw.items)) return raw.items;
        } catch (_) {}
        return [];
    }
    function saveClients() {
        localStorage.setItem(CLIENTS_KEY, JSON.stringify({ items: clients, updatedAt: new Date().toISOString() }));
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

    let cart = [];
    let familyFilter = 'all';
    let historyClientFilter = 'all';
    let editingClientId = null;

    function cartQty() {
        return cart.reduce(function (s, it) { return s + it.qty; }, 0);
    }
    function cartTotal() {
        return cart.reduce(function (s, it) { return s + it.qty * it.price; }, 0);
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

    function families() {
        const set = {};
        getRecipes().forEach(function (r) { if (r.family) set[r.family] = true; });
        return Object.keys(set).sort(function (a, b) { return a.localeCompare(b, 'es'); });
    }

    function renderChips() {
        const chips = document.getElementById('posFamilyChips');
        if (!chips) return;
        const list = ['all'].concat(families());
        chips.innerHTML = list.map(function (f) {
            const label = f === 'all' ? 'Todas' : f;
            return '<button type="button" class="chip' + (f === familyFilter ? ' active' : '') + '" data-fam="' + esc(f) + '">' + esc(label) + '</button>';
        }).join('');
    }

    function filteredProducts() {
        const q = (document.getElementById('posProductSearch') && document.getElementById('posProductSearch').value || '').toLowerCase().trim();
        return getRecipes().filter(function (r) {
            const famOk = familyFilter === 'all' || r.family === familyFilter;
            const qOk = !q || [r.name, r.code, r.family, r.product].some(function (v) {
                return String(v || '').toLowerCase().includes(q);
            });
            return famOk && qOk;
        });
    }

    function renderProducts() {
        const grid = document.getElementById('posProductGrid');
        if (!grid) return;
        const list = filteredProducts();
        if (!list.length) {
            grid.innerHTML = '<div class="empty" style="grid-column:1/-1">Sin productos</div>';
            return;
        }
        const cartUnits = cartQty();
        grid.innerHTML = list.map(function (r) {
            const base = baseUnitPrice(r.product);
            const live = unitPrice(r.product, cartUnits || 1);
            const stock = finishedQty(r.product);
            const unit = unitFor(r);
            const img = r.image
                ? '<div class="thumb"><img src="' + esc(r.image) + '" alt="' + esc(r.imageAlt || r.name) + '" loading="lazy" decoding="async"></div>'
                : '<div class="thumb"><span class="thumb-fallback">S35</span></div>';
            const priceNote = cartUnits >= 100 && live !== base
                ? '<span class="muted" style="font-size:11px">Escalón ' + esc(tierLabelForQty(cartUnits)) + '</span>'
                : '';
            return '<button type="button" class="product-card" data-add="' + esc(r.product) + '">' +
                img +
                '<div class="fam">' + esc(r.family || '—') + '</div>' +
                '<div class="name">' + esc(r.name) + '</div>' +
                '<div class="meta">' +
                '<span class="price">' + money(base) + '</span>' +
                '<span class="unit">' + esc(unit) + (stock ? ' · stock ' + stock : '') + '</span>' +
                '</div>' +
                priceNote +
                '<div class="muted">' + esc(r.code || r.product) + '</div>' +
                '</button>';
        }).join('');
    }

    function fillClientSelect() {
        const sel = document.getElementById('posClientSelect');
        if (!sel) return;
        const current = sel.value;
        sel.innerHTML = '<option value="">Sin cliente (mostrador)</option>' +
            clients.slice().sort(function (a, b) {
                return String(a.name).localeCompare(String(b.name), 'es');
            }).map(function (c) {
                return '<option value="' + esc(c.id) + '">' + esc(clientDisplay(c)) + '</option>';
            }).join('');
        if (current && clientById(current)) sel.value = current;
    }

    function renderCart() {
        const body = document.getElementById('posCartBody');
        const btn = document.getElementById('posCheckoutBtn');
        const totalEl = document.getElementById('posCartTotal');
        const tierHint = document.getElementById('posCartTierHint');
        if (!body) return;
        applyCartTierPrices();
        const units = cartQty();
        if (tierHint) {
            tierHint.textContent = units
                ? ('Volumen ticket: ' + units + ' u · escalón «' + tierLabelForQty(units) + '»')
                : 'Volumen de compra: el escalón depende de las unidades totales del ticket';
        }
        if (!cart.length) {
            body.innerHTML = '<div class="empty">Agrega productos del catálogo.</div>';
            if (btn) btn.disabled = true;
        } else {
            body.innerHTML = cart.map(function (it, idx) {
                return '<div class="cart-item">' +
                    '<div class="ci-name">' + esc(it.name) + '</div>' +
                    '<div class="ci-line">' + money(it.qty * it.price) + '</div>' +
                    '<div class="ci-meta">' + money(it.price) + ' / ' + esc(it.unit) + '</div>' +
                    '<div></div>' +
                    '<div class="qty-row">' +
                    '<button type="button" class="qty-btn" data-dec="' + idx + '" aria-label="Menos">−</button>' +
                    '<input class="qty-input" type="number" inputmode="numeric" min="1" step="1" ' +
                    'data-qty="' + idx + '" value="' + esc(String(it.qty)) + '" aria-label="Cantidad">' +
                    '<button type="button" class="qty-btn" data-inc="' + idx + '" aria-label="Más">+</button>' +
                    '<button type="button" class="btn ghost danger" data-rm="' + idx + '" style="margin-left:auto;height:28px;padding:0 8px">Quitar</button>' +
                    '</div></div>';
            }).join('');
            if (btn) btn.disabled = false;
        }
        if (totalEl) totalEl.textContent = money(cartTotal());
        updatePosKpis();
    }

    function setCartQty(idx, nextQty) {
        if (!cart[idx]) return;
        const n = Math.floor(Number(nextQty));
        if (!isFinite(n) || n < 1) return false;
        cart[idx].qty = n;
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
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const today = sales.filter(function (s) { return new Date(s.createdAt) >= start; });
        const todayTotal = today.reduce(function (sum, s) { return sum + (Number(s.total) || 0); }, 0);
        const kpiT = document.getElementById('posKpiToday');
        const kpiTH = document.getElementById('posKpiTodayHint');
        if (kpiT) kpiT.textContent = money(todayTotal);
        if (kpiTH) kpiTH.textContent = today.length + (today.length === 1 ? ' venta' : ' ventas');
    }

    function addToCart(slug) {
        const r = recipeBySlug(slug);
        if (!r) return;
        const existing = cart.filter(function (it) { return it.product === slug; })[0];
        if (existing) existing.qty += 1;
        else {
            cart.push({
                product: r.product,
                name: r.name,
                code: r.code || '',
                unit: unitFor(r),
                price: unitPrice(r.product, cartQty() + 1),
                qty: 1
            });
        }
        applyCartTierPrices();
        renderCart();
        renderProducts();
        toast('Agregado: ' + r.name);
    }

    function nextFolio() {
        return 'POS-' + String(sales.length + 1).padStart(4, '0');
    }

    function checkout() {
        if (!cart.length) return;
        const paymentMethod = selectedPay();
        const billing = selectedBilling();
        if (['tarjeta', 'efectivo', 'transferencia'].indexOf(paymentMethod) < 0) {
            toast('Elige método de pago');
            return;
        }
        if (['facturado', 'sin_facturar'].indexOf(billing) < 0) {
            toast('Elige opción de facturación');
            return;
        }
        const clientId = selectedClientId();
        const client = clientById(clientId);
        const clientSnapshot = client ? {
            id: client.id,
            name: client.name,
            phone: client.phone || '',
            email: client.email || '',
            company: client.company || '',
            rfc: client.rfc || ''
        } : null;

        let userName = 'admin';
        try {
            const u = JSON.parse(localStorage.getItem('s35_admin_user') || '{}');
            if (u.username) userName = u.username;
        } catch (_) {}

        const ticket = {
            id: 'sale-' + Date.now().toString(36),
            folio: nextFolio(),
            createdAt: new Date().toISOString(),
            clientId: client ? client.id : null,
            client: clientSnapshot,
            customer: client ? clientDisplay(client) : 'Mostrador',
            paymentMethod: paymentMethod,
            billing: billing,
            items: cart.map(function (it) {
                return {
                    product: it.product,
                    name: it.name,
                    code: it.code,
                    unit: it.unit,
                    price: it.price,
                    qty: it.qty,
                    lineTotal: it.qty * it.price
                };
            }),
            total: cartTotal(),
            user: userName
        };

        ticket.items.forEach(function (it) {
            deductFinished(it.product, it.qty);
        });
        if (window.S35PanelAPI && window.S35PanelAPI.refreshStockViews) {
            window.S35PanelAPI.refreshStockViews();
        }

        sales.unshift(ticket);
        saveSales();
        cart = [];
        const payE = document.querySelector('#venta input[name="payMethod"][value="efectivo"]');
        const billS = document.querySelector('#venta input[name="billing"][value="sin_facturar"]');
        if (payE) payE.checked = true;
        if (billS) billS.checked = true;
        const sel = document.getElementById('posClientSelect');
        if (sel) sel.value = '';
        renderCart();
        renderProducts();
        renderHistory();
        renderCortes();
        toast('Venta ' + ticket.folio + ' · ' + payLabel(paymentMethod) + ' · ' + billLabel(billing));
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

    function renderCortes() {
        const section = document.getElementById('cortes');
        if (!section) return;

        const bounds = periodBounds(cortesPeriod, cortesOffset);
        const prevBounds = periodBounds(cortesPeriod, cortesOffset - 1);
        const list = salesInRange(sales, bounds.start, bounds.end);
        const prevList = salesInRange(sales, prevBounds.start, prevBounds.end);
        const total = sumTotals(list);
        const prevTotal = sumTotals(prevList);
        const tickets = list.length;
        const avg = tickets ? total / tickets : 0;

        const rangeLabel = document.getElementById('cortesRangeLabel');
        if (rangeLabel) rangeLabel.textContent = formatPeriodLabel(cortesPeriod, bounds.start, bounds.end);

        const nextBtn = document.getElementById('cortesNext');
        if (nextBtn) nextBtn.disabled = cortesOffset >= 0;

        const totalEl = document.getElementById('cortesTotal');
        if (totalEl) totalEl.textContent = money(total);
        const ticketsEl = document.getElementById('cortesTickets');
        if (ticketsEl) ticketsEl.textContent = String(tickets);
        const avgEl = document.getElementById('cortesAvg');
        if (avgEl) avgEl.textContent = money(avg);
        const hintEl = document.getElementById('cortesCompareHint');
        if (hintEl) hintEl.textContent = formatDelta(total, prevTotal);

        renderCortesChart(cortesPeriod, bounds, list, prevBounds, prevList);

        const payKeys = ['efectivo', 'tarjeta', 'transferencia'];
        const payRows = payKeys.map(function (k) {
            const amount = list.reduce(function (n, s) {
                return n + ((s.paymentMethod || 'efectivo') === k ? (Number(s.total) || 0) : 0);
            }, 0);
            return { key: k, label: payLabel(k), amount: amount };
        }).filter(function (r) { return r.amount > 0; });
        renderBreakdownRows('cortesPayRows', 'cortesPayBar', payRows, total);

        const billKeys = [
            { key: 'facturado', label: 'Facturado' },
            { key: 'sin_facturar', label: 'Sin facturar' }
        ];
        const billRows = billKeys.map(function (b) {
            const amount = list.reduce(function (n, s) {
                const bill = s.billing || 'sin_facturar';
                return n + (bill === b.key ? (Number(s.total) || 0) : 0);
            }, 0);
            return { key: b.key, label: b.label, amount: amount };
        }).filter(function (r) { return r.amount > 0; });
        renderBreakdownRows('cortesBillRows', 'cortesBillBar', billRows, total);

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

        const tbody = document.getElementById('cortesSalesBody');
        if (tbody) {
            if (!list.length) {
                tbody.innerHTML = '<tr><td colspan="6" class="empty">Sin ventas en este periodo</td></tr>';
            } else {
                const sorted = list.slice().sort(function (a, b) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                tbody.innerHTML = sorted.map(function (s) {
                    const d = new Date(s.createdAt);
                    const dateStr = isNaN(d) ? '' : d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
                    const clientLabel = s.client ? clientDisplay(s.client) : (s.customer || 'Mostrador');
                    return '<tr>' +
                        '<td class="muted">' + esc(dateStr) + '</td>' +
                        '<td>' + esc(s.folio) + '</td>' +
                        '<td>' + esc(clientLabel) + '</td>' +
                        '<td><span class="badge">' + esc(payLabel(s.paymentMethod)) + '</span></td>' +
                        '<td><span class="badge ' + (s.billing === 'facturado' ? 'b-success' : '') + '">' + esc(billLabel(s.billing)) + '</span></td>' +
                        '<td class="num">' + money(s.total) + '</td>' +
                        '</tr>';
                }).join('');
            }
        }

        document.querySelectorAll('#cortesPeriodTabs button').forEach(function (btn) {
            const active = btn.getAttribute('data-period') === cortesPeriod;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    }

    function renderHistory() {
        const tbody = document.getElementById('posHistoryBody');
        if (!tbody) return;
        const q = (document.getElementById('posHistorySearch') && document.getElementById('posHistorySearch').value || '').toLowerCase().trim();
        const list = sales.filter(function (s) {
            if (historyClientFilter !== 'all') {
                if (historyClientFilter === 'walkin') {
                    if (s.clientId) return false;
                } else if (s.clientId !== historyClientFilter) return false;
            }
            if (!q) return true;
            const hay = [s.folio, s.customer, s.paymentMethod, s.billing, s.client && s.client.name, s.client && s.client.company]
                .concat((s.items || []).map(function (it) { return it.name; }))
                .join(' ').toLowerCase();
            return hay.includes(q);
        });
        if (!list.length) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty">Sin ventas todavía</td></tr>';
            return;
        }
        tbody.innerHTML = list.map(function (s) {
            const d = new Date(s.createdAt);
            const dateStr = isNaN(d) ? '' : d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
            const itemsN = (s.items || []).reduce(function (n, it) { return n + it.qty; }, 0);
            const clientLabel = s.client ? clientDisplay(s.client) : (s.customer || 'Mostrador');
            return '<tr>' +
                '<td class="muted">' + esc(dateStr) + '</td>' +
                '<td>' + esc(s.folio) + '</td>' +
                '<td>' + esc(clientLabel) + '</td>' +
                '<td><span class="badge">' + esc(payLabel(s.paymentMethod)) + '</span></td>' +
                '<td><span class="badge ' + (s.billing === 'facturado' ? 'b-success' : '') + '">' + esc(billLabel(s.billing)) + '</span></td>' +
                '<td class="num">' + itemsN + '</td>' +
                '<td class="num">' + money(s.total) + '</td>' +
                '<td class="muted">' + esc(s.user || '') + '</td>' +
                '</tr>';
        }).join('');
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
            return !q || [p.name, p.code, p.family, p.listName, p.id].some(function (v) {
                return String(v || '').toLowerCase().includes(q);
            });
        });
        if (!list.length) {
            tbody.innerHTML = '<tr><td colspan="10" class="empty">Sin resultados</td></tr>';
            return;
        }
        tbody.innerHTML = list.map(function (p) {
            const entry = prices[p.id] || { presentationKg: p.presentationKg, tiers: sixTiers(400) };
            const kg = entry.presentationKg != null ? entry.presentationKg : (p.presentationKg != null ? p.presentationKg : '—');
            const unit = p.kind === 'liquido' ? 'Cubeta' : (kg !== '—' ? ('Saco ' + kg + ' kg') : 'Saco');
            const tierCells = TIER_IDS.map(function (tid, i) {
                const val = entry.tiers && entry.tiers[i] != null ? entry.tiers[i] : 0;
                return '<td><input class="price-input num" type="number" min="0" step="0.01" ' +
                    'data-price-id="' + esc(p.id) + '" data-tier="' + i + '" value="' + esc(String(val)) + '"></td>';
            }).join('');
            const badge = p.fromRecipe ? '' : '<div class="muted">Solo lista · sin ficha POS</div>';
            return '<tr>' +
                '<td class="muted">' + esc(p.code || p.id) + '</td>' +
                '<td>' + esc(p.name) + '<div class="muted">' + esc(p.family || '') + '</div>' + badge + '</td>' +
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
            return !q || [c.name, c.phone, c.email, c.company, c.rfc].some(function (v) {
                return String(v || '').toLowerCase().includes(q);
            });
        }).sort(function (a, b) {
            return String(a.name).localeCompare(String(b.name), 'es');
        });
        if (!list.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty">Sin clientes. Agrega el primero.</td></tr>';
            return;
        }
        tbody.innerHTML = list.map(function (c) {
            return '<tr>' +
                '<td><strong>' + esc(c.name) + '</strong>' +
                (c.company ? '<div class="muted">' + esc(c.company) + '</div>' : '') + '</td>' +
                '<td>' + esc(c.phone || '—') + '</td>' +
                '<td>' + esc(c.email || '—') + '</td>' +
                '<td class="muted">' + esc(c.rfc || '—') + '</td>' +
                '<td><div class="row-actions">' +
                '<button type="button" class="icon-action" data-edit-client="' + esc(c.id) + '" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>' +
                '<button type="button" class="icon-action danger" data-del-client="' + esc(c.id) + '" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>' +
                '</div></td></tr>';
        }).join('');
    }

    function openClientModal(client) {
        editingClientId = client ? client.id : null;
        document.getElementById('clientModalTitle').textContent = client ? 'Editar cliente' : 'Nuevo cliente';
        document.getElementById('clientName').value = client ? client.name : '';
        document.getElementById('clientPhone').value = client ? (client.phone || '') : '';
        document.getElementById('clientEmail').value = client ? (client.email || '') : '';
        document.getElementById('clientCompany').value = client ? (client.company || '') : '';
        document.getElementById('clientRfc').value = client ? (client.rfc || '') : '';
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
        const chips = document.getElementById('posFamilyChips');
        if (chips) {
            chips.addEventListener('click', function (e) {
                const btn = e.target.closest('.chip');
                if (!btn) return;
                familyFilter = btn.getAttribute('data-fam');
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
                const inc = e.target.closest('[data-inc]');
                const dec = e.target.closest('[data-dec]');
                const rm = e.target.closest('[data-rm]');
                if (inc) {
                    const i = Number(inc.getAttribute('data-inc'));
                    if (cart[i]) setCartQty(i, cart[i].qty + 1);
                } else if (dec) {
                    const i = Number(dec.getAttribute('data-dec'));
                    if (cart[i]) {
                        if (cart[i].qty <= 1) {
                            cart.splice(i, 1);
                            applyCartTierPrices();
                            renderCart();
                            renderProducts();
                        } else {
                            setCartQty(i, cart[i].qty - 1);
                        }
                    }
                } else if (rm) {
                    cart.splice(Number(rm.getAttribute('data-rm')), 1);
                    applyCartTierPrices();
                    renderCart();
                    renderProducts();
                }
            });
            cartBody.addEventListener('change', function (e) {
                const input = e.target.closest('.qty-input');
                if (input) commitQtyInput(input);
            });
            cartBody.addEventListener('keydown', function (e) {
                const input = e.target.closest('.qty-input');
                if (!input) return;
                if (e.key === 'Enter') {
                    e.preventDefault();
                    commitQtyInput(input);
                    input.blur();
                }
            });
            cartBody.addEventListener('focusout', function (e) {
                const input = e.target.closest('.qty-input');
                if (input) commitQtyInput(input);
            });
        }

        const clearCart = document.getElementById('posClearCartBtn');
        if (clearCart) {
            clearCart.addEventListener('click', function () {
                if (!cart.length) return;
                if (!confirm('¿Vaciar el ticket?')) return;
                cart = [];
                renderCart();
                renderProducts();
            });
        }
        const checkoutBtn = document.getElementById('posCheckoutBtn');
        if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);

        const histSearch = document.getElementById('posHistorySearch');
        if (histSearch) histSearch.addEventListener('input', renderHistory);
        const histFilter = document.getElementById('posHistoryClientFilter');
        if (histFilter) {
            histFilter.addEventListener('change', function () {
                historyClientFilter = histFilter.value || 'all';
                renderHistory();
            });
        }
        const clearHist = document.getElementById('posClearHistoryBtn');
        if (clearHist) {
            clearHist.addEventListener('click', function () {
                if (!sales.length) return;
                if (!confirm('¿Eliminar todo el historial de ventas?')) return;
                sales = [];
                saveSales();
                renderHistory();
                renderCortes();
                updatePosKpis();
            });
        }

        const periodTabs = document.getElementById('cortesPeriodTabs');
        if (periodTabs) {
            periodTabs.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-period]');
                if (!btn) return;
                const next = btn.getAttribute('data-period');
                if (!next || next === cortesPeriod) return;
                cortesPeriod = next;
                cortesOffset = 0;
                renderCortes();
            });
        }
        const cortesPrev = document.getElementById('cortesPrev');
        if (cortesPrev) {
            cortesPrev.addEventListener('click', function () {
                cortesOffset -= 1;
                renderCortes();
            });
        }
        const cortesNext = document.getElementById('cortesNext');
        if (cortesNext) {
            cortesNext.addEventListener('click', function () {
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
                prices = seedPrices();
                savePrices();
                renderPrices();
                applyCartTierPrices();
                renderProducts();
                renderCart();
                toast('Precios restablecidos');
            });
        }

        const clientSearch = document.getElementById('posClientSearch');
        if (clientSearch) clientSearch.addEventListener('input', renderClients);
        const addClient = document.getElementById('posClientAddBtn');
        if (addClient) addClient.addEventListener('click', function () { openClientModal(null); });
        const clientsBody = document.getElementById('posClientsBody');
        if (clientsBody) {
            clientsBody.addEventListener('click', function (e) {
                const edit = e.target.closest('[data-edit-client]');
                const del = e.target.closest('[data-del-client]');
                if (edit) {
                    openClientModal(clientById(edit.getAttribute('data-edit-client')));
                } else if (del) {
                    const id = del.getAttribute('data-del-client');
                    const c = clientById(id);
                    if (!c) return;
                    if (!confirm('¿Eliminar «' + c.name + '»?')) return;
                    clients = clients.filter(function (x) { return x.id !== id; });
                    saveClients();
                    renderClients();
                    fillClientSelect();
                    fillHistoryClientFilter();
                }
            });
        }

        const clientForm = document.getElementById('clientForm');
        if (clientForm) {
            clientForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const name = (document.getElementById('clientName').value || '').trim();
                if (!name) return;
                const next = {
                    id: editingClientId || ('cli-' + Date.now().toString(36)),
                    name: name,
                    phone: (document.getElementById('clientPhone').value || '').trim(),
                    email: (document.getElementById('clientEmail').value || '').trim(),
                    company: (document.getElementById('clientCompany').value || '').trim(),
                    rfc: (document.getElementById('clientRfc').value || '').trim(),
                    updatedAt: new Date().toISOString()
                };
                const idx = clients.findIndex(function (c) { return c.id === next.id; });
                if (idx >= 0) clients[idx] = Object.assign({}, clients[idx], next);
                else {
                    next.createdAt = next.updatedAt;
                    clients.push(next);
                }
                saveClients();
                closeClientModal();
                renderClients();
                fillClientSelect();
                fillHistoryClientFilter();
                toast(editingClientId ? 'Cliente actualizado' : 'Cliente creado');
            });
        }
        ['clientModalClose', 'clientModalCancel'].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', closeClientModal);
        });
    }

    function onSectionShow(id) {
        if (id === 'venta') {
            renderChips();
            renderProducts();
            fillClientSelect();
            renderCart();
            updatePosKpis();
        } else if (id === 'clients') {
            renderClients();
        } else if (id === 'salesHistory') {
            fillHistoryClientFilter();
            renderHistory();
        } else if (id === 'cortes') {
            renderCortes();
        } else if (id === 'prices') {
            renderPrices();
        }
    }

    function init() {
        prices = loadPrices();
        sales = loadSales();
        clients = loadClients();
        bind();
        renderChips();
        renderProducts();
        fillClientSelect();
        renderCart();
        fillHistoryClientFilter();
        renderHistory();
        renderCortes();
        renderClients();
        renderPrices();
        updatePosKpis();
        window.S35PosModule = { onSectionShow: onSectionShow, refreshProducts: renderProducts };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
