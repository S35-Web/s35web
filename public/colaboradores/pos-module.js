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
        if (familyFilter === fam.label) familyFilter = 'all';
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

    let activeNoteSaleId = null;

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
        saveSales();
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
            'Pago: ' + payLabel(sale.paymentMethod),
            'Facturación: ' + billLabel(sale.billing),
            'Total: ' + money(sale.total),
            '',
            'Gracias por su compra.'
        ].join('\n');
    }

    function buildNoteHtml(sale) {
        const items = sale.items || [];
        const rows = items.map(function (it) {
            const line = it.lineTotal != null ? it.lineTotal : it.qty * it.price;
            return '<tr>' +
                '<td><span class="line-name">' + esc(it.name) + '</span>' +
                (it.unit ? '<span class="line-unit">' + esc(it.unit) + '</span>' : '') + '</td>' +
                '<td class="num">' + esc(String(it.qty)) + '</td>' +
                '<td class="num">' + money(it.price) + '</td>' +
                '<td class="num">' + money(line) + '</td>' +
                '</tr>';
        }).join('');
        return '<div class="sale-note-brand">' +
            '<div class="mark">S-35<span>Midday</span></div>' +
            '<div class="folio">' + esc(sale.folio || '') + '</div>' +
            '</div>' +
            '<div class="sale-note-meta">' +
            '<div class="row"><span class="k">Fecha</span><span class="v">' + esc(formatSaleDateTime(sale.createdAt)) + '</span></div>' +
            '<div class="row"><span class="k">Cliente</span><span class="v">' + esc(saleClientLabel(sale)) + '</span></div>' +
            '<div class="row"><span class="k">Pago</span><span class="v">' + esc(payLabel(sale.paymentMethod)) + '</span></div>' +
            '<div class="row"><span class="k">Facturación</span><span class="v">' + esc(billLabel(sale.billing)) + '</span></div>' +
            '</div>' +
            '<table class="sale-note-lines">' +
            '<thead><tr><th>Producto</th><th class="num">Cant.</th><th class="num">Precio</th><th class="num">Importe</th></tr></thead>' +
            '<tbody>' + (rows || '<tr><td colspan="4" class="muted">Sin líneas</td></tr>') + '</tbody>' +
            '</table>' +
            '<div class="sale-note-total"><span class="label">Total</span><span class="amount">' + money(sale.total) + '</span></div>';
    }

    function isAdminRole() {
        return !!(window.S35PanelAPI && window.S35PanelAPI.role === 'admin');
    }

    function syncSaleNoteDeleteVisibility() {
        const delBtn = document.getElementById('saleNoteDelete');
        if (!delBtn) return;
        if (isAdminRole()) delBtn.removeAttribute('hidden');
        else delBtn.setAttribute('hidden', '');
    }

    function openSaleNoteModal(sale) {
        if (!sale) return;
        ensureSaleNote(sale);
        activeNoteSaleId = sale.id;
        const doc = document.getElementById('saleNoteDoc');
        const title = document.getElementById('saleNoteModalTitle');
        const phoneEl = document.getElementById('saleNotePhone');
        const emailEl = document.getElementById('saleNoteEmail');
        const modal = document.getElementById('saleNoteModal');
        if (doc) doc.innerHTML = buildNoteHtml(sale);
        if (title) title.textContent = 'Nota de venta · ' + (sale.folio || '');
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
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        activeNoteSaleId = null;
    }

    function deleteActiveSaleNote() {
        if (!isAdminRole()) {
            toast('Solo admin puede eliminar ventas');
            return;
        }
        const id = activeNoteSaleId;
        const sale = saleById(id);
        if (!sale) return;
        const folio = sale.folio || '';
        if (!confirm('¿Eliminar esta venta? No se puede deshacer')) return;
        sales = sales.filter(function (s) { return s.id !== id; });
        saveSales();
        closeSaleNoteModal();
        renderHistory();
        renderCortes();
        if (pdSalesSlug) renderProductSalesAnalytics(pdSalesSlug);
        updatePosKpis();
        toast(folio ? ('Venta ' + folio + ' eliminada') : 'Venta eliminada');
    }

    function saleById(id) {
        if (!id) return null;
        return sales.filter(function (s) { return s.id === id; })[0] || null;
    }

    function persistNoteShareContacts(sale) {
        if (!sale) return;
        ensureSaleNote(sale);
        const phoneEl = document.getElementById('saleNotePhone');
        const emailEl = document.getElementById('saleNoteEmail');
        sale.note.sharePhone = phoneEl ? (phoneEl.value || '').trim() : '';
        sale.note.shareEmail = emailEl ? (emailEl.value || '').trim() : '';
        sale.note.lastSharedAt = new Date().toISOString();
        saveSales();
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
            const span = salesYearSpan(sales);
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
            } else if (period === 'historial') {
                const idx = d.getFullYear() - bounds.start.getFullYear();
                if (buckets[idx]) buckets[idx].amount += amt;
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

    function renderRhythmChart(opts) {
        const host = opts.host;
        const subEl = opts.subEl;
        const period = opts.period;
        const bounds = opts.bounds;
        const list = opts.list;
        const prevBounds = opts.prevBounds;
        const prevList = opts.prevList;
        const hatchId = opts.hatchId || 'cortesHatch';
        if (!host) return;

        const cur = fillRhythmBuckets(period, bounds, list);
        const showPrev = period !== 'historial' && prevBounds && prevList;
        const prev = showPrev
            ? fillRhythmBuckets(period, prevBounds, prevList)
            : { subtitle: '', buckets: cur.buckets.map(function (b) { return { key: b.key, label: b.label, amount: 0 }; }) };
        if (subEl) subEl.textContent = cur.subtitle;

        const n = cur.buckets.length;
        let maxVal = 0;
        for (let i = 0; i < n; i++) {
            maxVal = Math.max(maxVal, cur.buckets[i].amount, (prev.buckets[i] && prev.buckets[i].amount) || 0);
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
        // Radio pequeño en coords del viewBox (~10–14 px en pantalla) alrededor del punto
        const hitR = 12;
        for (let i = 0; i < n; i++) {
            const x = ptX(i);
            const y = ptY(cur.buckets[i].amount);
            hits += '<circle class="hit-zone" data-idx="' + i + '" cx="' + x.toFixed(1) +
                '" cy="' + y.toFixed(1) + '" r="' + hitR + '" fill="transparent"/>';
            dots += '<circle class="dot-cur" data-idx="' + i + '" cx="' + x.toFixed(1) +
                '" cy="' + y.toFixed(1) + '" r="3.5" />';
        }

        const defs =
            '<defs>' +
            '<pattern id="' + esc(hatchId) + '" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">' +
            '<line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" stroke-width="1" opacity="0.35"/>' +
            '</pattern>' +
            '</defs>';

        const emptyNote = hasData ? '' : '<div class="cortes-chart-empty">Sin ventas en este ritmo</div>';
        host.innerHTML = emptyNote +
            '<div class="cortes-chart-tip" hidden></div>' +
            '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style="color:var(--text)">' +
            defs + grid + yLabels +
            (hasData ? '<path class="area-hatch" d="' + areaPath + '" style="fill:url(#' + esc(hatchId) + ')"/>' : '') +
            (showPrev && prevLine ? '<path class="line-prev" d="' + prevLine + '"/>' : '') +
            '<path class="line-cur" d="' + curLine + '"/>' +
            dots +
            hits +
            xLabels +
            '</svg>';

        const tipEl = host.querySelector('.cortes-chart-tip');
        function hideTip() {
            if (tipEl) tipEl.hidden = true;
            host.querySelectorAll('.dot-cur.is-active').forEach(function (el) {
                el.classList.remove('is-active');
            });
        }
        function showTip(idx) {
            if (!tipEl || idx < 0 || idx >= n) return;
            const amt = Number(cur.buckets[idx].amount) || 0;
            const prevAmt = showPrev && prev.buckets[idx] ? (Number(prev.buckets[idx].amount) || 0) : null;
            let html = '<div class="tip-label">' + esc(tipTitle(idx)) + '</div>' +
                '<div class="tip-val">' + money(amt) + '</div>';
            if (prevAmt != null) {
                html += '<div class="tip-prev">Anterior · ' + money(prevAmt) + '</div>';
            }
            tipEl.innerHTML = html;
            tipEl.hidden = false;

            // Anclar el tip encima del punto, siempre fuera de la línea (arriba del host)
            const hostRect = host.getBoundingClientRect();
            const svgRect = host.querySelector('svg').getBoundingClientRect();
            const scaleX = svgRect.width / W;
            const tipW = tipEl.offsetWidth || 120;
            let left = (ptX(idx) * scaleX) - tipW / 2;
            left = Math.max(4, Math.min(left, hostRect.width - tipW - 4));
            tipEl.style.left = left + 'px';
            tipEl.style.top = '0';
            tipEl.style.transform = 'translateY(calc(-100% - 6px))';

            host.querySelectorAll('.dot-cur').forEach(function (el) {
                el.classList.toggle('is-active', Number(el.getAttribute('data-idx')) === idx);
            });
        }
        host.onmouseleave = hideTip;
        host.querySelectorAll('.hit-zone').forEach(function (zone) {
            zone.addEventListener('mouseenter', function () {
                showTip(Number(zone.getAttribute('data-idx')));
            });
            zone.addEventListener('mouseleave', hideTip);
        });
    }

    function renderCortesChart(period, bounds, list, prevBounds, prevList) {
        renderRhythmChart({
            host: document.getElementById('cortesChart'),
            subEl: document.getElementById('cortesChartSub'),
            hatchId: 'cortesHatch',
            period: period,
            bounds: bounds,
            list: list,
            prevBounds: prevBounds,
            prevList: prevList
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

    function readStoredPrices() {
        try {
            const current = JSON.parse(localStorage.getItem(PRICE_KEY) || 'null');
            if (current && typeof current === 'object') {
                return { raw: current, fromLegacy: false };
            }
            let legacy = JSON.parse(localStorage.getItem(PRICE_KEY_LEGACY) || 'null');
            let fromV3 = !!(legacy && typeof legacy === 'object');
            if (!fromV3) {
                legacy = JSON.parse(localStorage.getItem(PRICE_KEY_LEGACY_V2) || 'null');
            }
            if (!legacy || typeof legacy !== 'object') return null;
            const mergeTargets = {};
            Object.keys(PRICE_MERGE_FROM).forEach(function (dup) {
                mergeTargets[PRICE_MERGE_FROM[dup]] = true;
            });
            const migrated = {};
            Object.keys(legacy).forEach(function (id) {
                if (PRICE_MERGE_FROM[id] || mergeTargets[id]) return;
                migrated[id] = legacy[id];
            });
            // Duplicados slug → canónico (solo en migración antigua v2).
            if (!fromV3) {
                Object.keys(PRICE_MERGE_FROM).forEach(function (dup) {
                    const target = PRICE_MERGE_FROM[dup];
                    if (legacy[dup] != null) migrated[target] = legacy[dup];
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
    function savePrices() {
        localStorage.setItem(PRICE_KEY, JSON.stringify(prices));
        try { localStorage.removeItem(PRICE_KEY_LEGACY); } catch (_) {}
        try { localStorage.removeItem(PRICE_KEY_LEGACY_V2); } catch (_) {}
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
    function loadClients() {
        try {
            const raw = JSON.parse(localStorage.getItem(CLIENTS_KEY) || 'null');
            if (raw && Array.isArray(raw.items)) {
                return raw.items.map(function (c) {
                    const next = Object.assign({}, c, { type: normalizeClientType(c.type || c.kind) });
                    const addr = clientAddress(next);
                    if (addr) next.address = addr;
                    delete next.domicilio;
                    delete next.localidad;
                    return next;
                });
            }
        } catch (_) {}
        return [];
    }
    function saveClients() {
        localStorage.setItem(CLIENTS_KEY, JSON.stringify({ items: clients, updatedAt: new Date().toISOString() }));
    }
    /** Merge catalog from /colaboradores/data/clients-import.json into local clients (by RFC or id). */
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
                    return { added: 0, updated: 0, total: clients.length };
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
                        const prev = clients[idx];
                        const merged = Object.assign({}, prev, next, {
                            id: prev.id,
                            type: prev.type === 'distributor' ? 'distributor' : next.type,
                            createdAt: prev.createdAt || now
                        });
                        delete merged.domicilio;
                        delete merged.localidad;
                        clients[idx] = merged;
                        updated += 1;
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
                return { added: added, updated: updated, total: clients.length };
            });
    }

    /** Import yearly synthetic tickets from historical-sales-import.json (idempotent by sale id). */
    const HIST_SALES_FLAG = 's35_hist_sales_imported_v1';
    function importHistoricalSales(opts) {
        opts = opts || {};
        const force = !!opts.force;
        return fetch('/colaboradores/data/historical-sales-import.json', { cache: 'no-store' })
            .then(function (r) {
                if (!r.ok) throw new Error('No se pudo leer el histórico de ventas');
                return r.json();
            })
            .then(function (data) {
                const incoming = (data && Array.isArray(data.items)) ? data.items : [];
                if (!incoming.length) {
                    return { added: 0, updated: 0, total: sales.length, skipped: true };
                }
                const byId = {};
                sales.forEach(function (s, i) { byId[s.id] = i; });
                let added = 0;
                let updated = 0;
                incoming.forEach(function (row) {
                    if (!row || !row.id || !Array.isArray(row.items) || !row.items.length) return;
                    const next = {
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
                    if (byId[next.id] != null) {
                        if (force) {
                            sales[byId[next.id]] = next;
                            updated += 1;
                        }
                    } else {
                        byId[next.id] = sales.length;
                        sales.push(next);
                        added += 1;
                    }
                });
                if (added || updated) {
                    saveSales();
                    renderHistory();
                    renderCortes();
                    updatePosKpis();
                }
                try { localStorage.setItem(HIST_SALES_FLAG, new Date().toISOString()); } catch (_) {}
                return { added: added, updated: updated, total: sales.length };
            });
    }
    function ensureHistoricalSalesImport() {
        try {
            if (localStorage.getItem(HIST_SALES_FLAG)) return;
        } catch (_) {}
        importHistoricalSales({ force: false }).catch(function () { /* silencioso en arranque */ });
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
    let priceFamilyFilter = 'all';
    let historyClientFilter = 'all';
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

    let clientPickerOpen = false;
    let clientPickerActiveIdx = -1;

    function syncClientTrigger() {
        const labelEl = document.getElementById('posClientTriggerLabel');
        const badgeEl = document.getElementById('posClientTriggerBadge');
        if (!labelEl) return;
        const client = clientById(selectedClientId());
        if (!client) {
            labelEl.textContent = 'Sin cliente (mostrador)';
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
            id: '',
            html: '<button type="button" class="pos-client-option' +
                (!current ? ' is-selected' : '') +
                '" role="option" data-client-id="" aria-selected="' + (!current ? 'true' : 'false') + '">' +
                '<span class="pos-client-option-name">Sin cliente (mostrador)</span>' +
                '<span class="badge">Mostrador</span>' +
                '<span class="pos-client-option-meta">Precio por tramos de volumen</span>' +
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

    function renderFamilyChips(containerId, activeFilter) {
        const chips = document.getElementById(containerId);
        if (!chips) return;
        const list = ['all'].concat(families());
        if (hasUncategorizedProducts()) list.push(PRODUCT_UNCATEGORIZED_ID);
        chips.innerHTML = list.map(function (f) {
            const label = f === 'all'
                ? 'Todas'
                : (f === PRODUCT_UNCATEGORIZED_ID ? PRODUCT_UNCATEGORIZED_LABEL : f);
            return '<button type="button" class="chip' + (f === activeFilter ? ' active' : '') + '" data-fam="' + esc(f) + '">' +
                familyDot(f) + esc(label) + '</button>';
        }).join('');
    }

    function renderChips() {
        renderFamilyChips('posFamilyChips', familyFilter);
    }

    function renderPriceChips() {
        renderFamilyChips('posPriceFamilyChips', priceFamilyFilter);
    }

    function filteredProducts() {
        const q = (document.getElementById('posProductSearch') && document.getElementById('posProductSearch').value || '').toLowerCase().trim();
        return getRecipes().filter(function (r) {
            const fam = recipeFamily(r);
            const famOk = familyFilter === 'all'
                || (familyFilter === PRODUCT_UNCATEGORIZED_ID ? !fam : fam === familyFilter);
            const qOk = !q || [r.name, r.code, fam, r.product].some(function (v) {
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
                '</button>';
        }).join('');
    }

    function fillClientSelect() {
        const sel = document.getElementById('posClientSelect');
        if (!sel) return;
        const current = sel.value;
        if (current && !clientById(current)) sel.value = '';
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
                return '<div class="' + itemClass + '">' +
                    '<div class="ci-name">' + esc(it.name) + promoBadge + '</div>' +
                    '<div class="ci-line"' + (priceLocked ? '' : ' data-edit-price="' + idx + '" title="Editar precio unitario"') + '>' +
                    money(it.qty * it.price) + '</div>' +
                    metaHtml +
                    '<div></div>' +
                    qtyRow +
                    '</div>';
            }).join('');
            if (btn) btn.disabled = false;
        }
        if (totalEl) totalEl.textContent = money(cartTotal());
        updatePosKpis();
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
        toast('Agregado: ' + r.name);
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
            rfc: client.rfc || '',
            type: normalizeClientType(client.type || client.kind)
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
            total: cartTotal(),
            user: userName
        };
        if (appliedPromoCode) ticket.promoCode = appliedPromoCode;
        ticket.note = {
            id: 'note-' + ticket.id,
            folio: ticket.folio,
            createdAt: ticket.createdAt,
            generatedAt: new Date().toISOString(),
            sharePhone: clientSnapshot ? (clientSnapshot.phone || '') : '',
            shareEmail: clientSnapshot ? (clientSnapshot.email || '') : ''
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
        appliedPromoCode = null;
        editingPriceIdx = null;
        const payE = document.querySelector('#venta input[name="payMethod"][value="efectivo"]');
        const billS = document.querySelector('#venta input[name="billing"][value="sin_facturar"]');
        if (payE) payE.checked = true;
        if (billS) billS.checked = true;
        setSelectedClientId('', { refresh: false });
        closeClientPicker();
        renderCart();
        renderProducts();
        renderHistory();
        renderCortes();
        if (pdSalesSlug) renderProductSalesAnalytics(pdSalesSlug);
        toast('Venta ' + ticket.folio + ' · ' + payLabel(paymentMethod) + ' · ' + billLabel(billing));
        openSaleNoteModal(ticket);
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

        const isHist = cortesPeriod === 'historial';
        if (isHist) cortesOffset = 0;

        const bounds = periodBounds(cortesPeriod, cortesOffset);
        const prevBounds = isHist ? null : periodBounds(cortesPeriod, cortesOffset - 1);
        const list = salesInRange(sales, bounds.start, bounds.end);
        const prevList = isHist ? [] : salesInRange(sales, prevBounds.start, prevBounds.end);
        const total = sumTotals(list);
        const prevTotal = sumTotals(prevList);
        const tickets = list.length;
        const avg = tickets ? total / tickets : 0;

        const rangeLabel = document.getElementById('cortesRangeLabel');
        if (rangeLabel) rangeLabel.textContent = formatPeriodLabel(cortesPeriod, bounds.start, bounds.end);

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
        const hintEl = document.getElementById('cortesCompareHint');
        if (hintEl) {
            hintEl.textContent = isHist
                ? 'Vista completa · todos los años con ventas'
                : formatDelta(total, prevTotal);
        }

        const legendHost = document.querySelector('#cortes .cortes-chart-legend');
        if (legendHost) {
            legendHost.innerHTML = isHist
                ? '<span class="leg"><span class="swatch"></span> Historial</span>'
                : '<span class="leg"><span class="swatch"></span> Periodo</span>' +
                  '<span class="leg"><span class="swatch prev"></span> Anterior</span>';
        }

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

        const listHost = document.getElementById('cortesSalesBody');
        if (listHost) {
            if (!list.length) {
                listHost.innerHTML = '<div class="cortes-invoice-empty">Sin ventas en este periodo</div>';
            } else {
                const sorted = list.slice().sort(function (a, b) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                listHost.innerHTML = sorted.map(function (s) {
                    const d = new Date(s.createdAt);
                    const clientLabel = saleClientLabel(s);
                    const itemsPreview = saleItemsPreview(s);
                    const billOk = s.billing === 'facturado';
                    return '<div class="cortes-invoice-row" role="button" tabindex="0" data-open-note="' + esc(s.id) + '" title="Ver nota de venta">' +
                        '<div class="cortes-invoice-date">' +
                            '<div class="d">' + esc(formatInvoiceDate(d)) + '</div>' +
                            '<div class="sub">' + esc(relativeSaleSub(d)) + (s.folio ? ' · ' + esc(s.folio) : '') + '</div>' +
                        '</div>' +
                        '<div class="cortes-invoice-pills">' +
                            '<span class="cortes-pill">' + esc(payLabel(s.paymentMethod)) + '</span>' +
                            '<span class="cortes-pill' + (billOk ? ' ok' : '') + '">' + esc(billLabel(s.billing)) + '</span>' +
                        '</div>' +
                        '<div class="cortes-invoice-client">' +
                            '<div class="name">' + esc(clientLabel) + '</div>' +
                            '<div class="items">' + esc(itemsPreview) + '</div>' +
                        '</div>' +
                        '<div class="cortes-invoice-amt">' + money(s.total) + '</div>' +
                        '</div>';
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
            tbody.innerHTML = '<tr><td colspan="9" class="empty">Sin ventas todavía</td></tr>';
            return;
        }
        tbody.innerHTML = list.map(function (s) {
            const d = new Date(s.createdAt);
            const dateStr = isNaN(d) ? '' : d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
            const itemsN = (s.items || []).reduce(function (n, it) { return n + it.qty; }, 0);
            const clientLabel = saleClientLabel(s);
            return '<tr>' +
                '<td class="muted">' + esc(dateStr) + '</td>' +
                '<td>' + esc(s.folio) + '</td>' +
                '<td>' + esc(clientLabel) + '</td>' +
                '<td><span class="badge">' + esc(payLabel(s.paymentMethod)) + '</span></td>' +
                '<td><span class="badge ' + (s.billing === 'facturado' ? 'b-success' : '') + '">' + esc(billLabel(s.billing)) + '</span></td>' +
                '<td class="num">' + itemsN + '</td>' +
                '<td class="num">' + money(s.total) + '</td>' +
                '<td class="muted">' + esc(s.user || '') + '</td>' +
                '<td><div class="row-actions">' +
                '<button type="button" class="icon-action" data-open-note="' + esc(s.id) + '" title="Ver nota de venta"><i class="fa-solid fa-receipt"></i></button>' +
                '</div></td>' +
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
            return '<tr>' +
                '<td class="clients-name-cell"><strong title="' + esc(displayName) + '">' + esc(displayName) + '</strong>' +
                (displayCompany ? '<div class="muted clients-company-cell" title="' + esc(displayCompany) + '">' + esc(displayCompany) + '</div>' : '') +
                (addr ? '<div class="muted clients-address-cell" title="' + esc(addr) + '">' + esc(addr) + '</div>' : '') +
                '</td>' +
                '<td><span class="badge' + (dist ? ' b-primary' : '') + '">' + esc(clientTypeLabel(c)) + '</span></td>' +
                '<td>' + esc(c.phone || '—') + '</td>' +
                '<td class="clients-email-cell">' + formatClientEmailsHtml(c.email) + '</td>' +
                '<td class="muted">' + esc(c.rfc || '—') + '</td>' +
                '<td><div class="row-actions">' +
                '<button type="button" class="icon-action" data-edit-client="' + esc(c.id) + '" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>' +
                '<button type="button" class="icon-action danger" data-del-client="' + esc(c.id) + '" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>' +
                '</div></td></tr>';
        }).join('');
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

    function openClientModal(client) {
        editingClientId = client ? client.id : null;
        document.getElementById('clientModalTitle').textContent = client ? 'Editar cliente' : 'Nuevo cliente';
        document.getElementById('clientName').value = client ? client.name : '';
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
        const chips = document.getElementById('posFamilyChips');
        if (chips) {
            chips.addEventListener('click', function (e) {
                const btn = e.target.closest('.chip[data-fam]');
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
        if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);

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
        if (histSearch) histSearch.addEventListener('input', renderHistory);
        const histFilter = document.getElementById('posHistoryClientFilter');
        if (histFilter) {
            histFilter.addEventListener('change', function () {
                historyClientFilter = histFilter.value || 'all';
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
        const clearHist = document.getElementById('posClearHistoryBtn');
        if (clearHist) {
            clearHist.addEventListener('click', function () {
                if (!sales.length) return;
                if (!confirm('¿Eliminar todo el historial de ventas?')) return;
                sales = [];
                saveSales();
                renderHistory();
                renderCortes();
                if (pdSalesSlug) renderProductSalesAnalytics(pdSalesSlug);
                updatePosKpis();
            });
        }

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
        const importClientsBtn = document.getElementById('posClientImportBtn');
        if (importClientsBtn) {
            importClientsBtn.addEventListener('click', function () {
                if (!confirm('¿Importar el catálogo de clientes (~1000)?\n\nSe agregan los nuevos y se actualizan los que ya existan con el mismo RFC. Los marcados como Distribuidor se conservan.')) return;
                importClientsBtn.disabled = true;
                importClientsCatalog()
                    .then(function (res) {
                        toast('Importados: +' + res.added + ' · actualizados ' + res.updated + ' · total ' + res.total);
                    })
                    .catch(function (err) {
                        toast((err && err.message) || 'Error al importar');
                    })
                    .then(function () {
                        importClientsBtn.disabled = false;
                    });
            });
        }
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
                    applyCartTierPrices();
                    renderProducts();
                    renderCart();
                }
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
                    clients[idx] = merged;
                } else {
                    next.createdAt = next.updatedAt;
                    clients.push(next);
                }
                saveClients();
                closeClientModal();
                renderClients();
                fillClientSelect();
                fillHistoryClientFilter();
                if (wasNew) {
                    setSelectedClientId(next.id);
                } else {
                    applyCartTierPrices();
                    renderProducts();
                    renderCart();
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

    function priceEditorHtml(slug) {
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
        return '<div class="pd-price-blocks">' + list.map(function (pres) {
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
                    'data-price-id="' + esc(id) + '" data-tier="' + i + '" value="' + esc(String(val)) + '">' +
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
                'placeholder="—" value="' + esc(distVal) + '">' +
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
            return { createdAt: s.createdAt, total: c.amount };
        }).filter(Boolean);
    }

    function productHasAnySales(keys) {
        return sales.some(function (s) {
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
        const periodSales = salesInRange(sales, bounds.start, bounds.end);
        const prevPeriodSales = isHist ? [] : salesInRange(sales, prevBounds.start, prevBounds.end);
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
            '<p class="page-sub" style="margin:0">Ritmo y clientes de este producto · POS local</p>' +
            '</div>' +
            '<div class="cortes-range pd-sales-range">' +
            '<button type="button" class="cortes-nav-btn" data-pd-sales-prev title="Periodo anterior" aria-label="Periodo anterior"' +
            (isHist ? ' disabled' : '') + '><i class="fa-solid fa-chevron-left"></i></button>' +
            '<span class="cortes-range-label" id="pdSalesRangeLabel">' + esc(formatPeriodLabel(pdSalesPeriod, bounds.start, bounds.end)) + '</span>' +
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
            prevList: prevSeries
        });
    }

    // —— Admin: gestión de códigos (sección #promos) ——
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
        } else if (id === 'prices' || id === 'products') {
            renderPriceChips();
            renderPrices();
        } else if (id === 'promos') {
            renderPromosAdmin();
        }
    }

    function init() {
        prices = loadPrices();
        // Persistir v3 tras merge para no depender del legacy en cada carga.
        savePrices();
        sales = loadSales();
        clients = loadClients();
        promoCodes = loadPromoCodes();
        ensurePromoSeeds();
        ensureHistoricalSalesImport();
        bind();
        renderChips();
        renderProducts();
        fillClientSelect();
        renderCart();
        fillHistoryClientFilter();
        renderHistory();
        renderCortes();
        renderClients();
        renderPriceChips();
        renderPrices();
        renderPromosAdmin();
        updatePosKpis();
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
            setDistributorPrice: setDistributorPrice,
            resetPricesToDefaults: resetPricesToDefaults,
            priceEditorHtml: priceEditorHtml,
            renderProductSalesAnalytics: renderProductSalesAnalytics,
            importHistoricalSales: importHistoricalSales,
            baseUnitPrice: baseUnitPrice,
            unitFor: unitFor,
            getPromoCodes: function () { return promoCodes.slice(); },
            renderPromosAdmin: renderPromosAdmin
        };
        if (window.S35PanelAPI && typeof window.S35PanelAPI.onPosReady === 'function') {
            window.S35PanelAPI.onPosReady();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
