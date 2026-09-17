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

    function familyDot(family) {
        const color = family === 'all'
            ? FAMILY_COLOR_NEUTRAL
            : (FAMILY_COLORS[family] || FAMILY_COLOR_NEUTRAL);
        return '<span class="dot" style="background:' + esc(color) + '" aria-hidden="true"></span>';
    }

    const TIER_IDS = ['t1', 't2', 't3', 't4', 't5', 't6'];
    const TIER_LABELS = ['1 a 100', '100 a 500', '500 a 999', '1000 a 2000', '2000 a 3000', '3000 a 5000'];

    let cortesPeriod = 'day';
    let cortesOffset = 0;
    let pdSalesPeriod = 'month';
    let pdSalesOffset = 0;
    let pdSalesSlug = null;
    let pdSalesBound = false;

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

    let activeNoteSaleId = null;

    function formatSaleDateTime(iso) {
        const d = new Date(iso);
        if (isNaN(d)) return '';
        return d.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
    }

    function saleClientLabel(sale) {
        if (!sale) return 'Mostrador';
        if (sale.client) return clientDisplay(sale.client);
        if (sale.clientId) {
            const live = clientById(sale.clientId);
            if (live) return clientDisplay(live);
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
        const prev = fillRhythmBuckets(period, prevBounds, prevList);
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
        const labelEvery = period === 'month' ? (n > 20 ? 2 : 1) : (period === 'day' ? 2 : 1);
        for (let i = 0; i < n; i++) {
            const showLabel = i === 0 || i === n - 1 || (i % labelEvery === 0);
            if (!showLabel) continue;
            const lab = cur.buckets[i].label;
            xLabels += '<text class="axis-label" x="' + ptX(i).toFixed(1) + '" y="' + (H - 8) +
                '" text-anchor="middle">' + esc(lab) + '</text>';
        }

        const defs =
            '<defs>' +
            '<pattern id="' + esc(hatchId) + '" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">' +
            '<line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" stroke-width="1" opacity="0.35"/>' +
            '</pattern>' +
            '</defs>';

        const emptyNote = hasData ? '' : '<div class="cortes-chart-empty">Sin ventas en este ritmo</div>';
        host.innerHTML = emptyNote +
            '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style="color:var(--text)">' +
            defs + grid + yLabels +
            (hasData ? '<path class="area-hatch" d="' + areaPath + '" style="fill:url(#' + esc(hatchId) + ')"/>' : '') +
            '<path class="line-prev" d="' + prevLine + '"/>' +
            '<path class="line-cur" d="' + curLine + '"/>' +
            xLabels +
            '</svg>';
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
                family: r.family || '',
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
            byId[it.id] = {
                id: it.id,
                name: sibling ? sibling.name : it.name,
                code: listCode,
                family: (sibling && sibling.family) || it.category || 'Lista mayorista',
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
    let priceFamilyFilter = 'all';
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

    function renderFamilyChips(containerId, activeFilter) {
        const chips = document.getElementById(containerId);
        if (!chips) return;
        const list = ['all'].concat(families());
        chips.innerHTML = list.map(function (f) {
            const label = f === 'all' ? 'Todas' : f;
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
                '<div class="fam">' + (r.family ? familyDot(r.family) : '') + esc(r.family || '—') + '</div>' +
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
                    'data-qty="' + idx + '" value="' + esc(String(it.qty)) + '" ' +
                    'aria-label="Cantidad" title="Escribe la cantidad">' +
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
            const famOk = priceFamilyFilter === 'all' || p.family === priceFamilyFilter;
            const qOk = !q || [p.name, p.code, p.family, p.listName, p.id].some(function (v) {
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

        const priceChips = document.getElementById('posPriceFamilyChips');
        if (priceChips) {
            priceChips.addEventListener('click', function (e) {
                const btn = e.target.closest('.chip');
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

    function presentationsForSlug(slug) {
        const data = window.S35_PANEL_DATA || {};
        return (data.presentations || []).filter(function (p) {
            return p.productSlug === slug;
        });
    }

    function setTierPrice(id, tier, value) {
        if (!id) return;
        const t = Number(tier);
        if (!isFinite(t) || t < 0 || t > 5) return;
        if (!prices[id]) {
            prices[id] = { presentationKg: presentationKgFor(id), tiers: sixTiers(0) };
        }
        if (!prices[id].tiers) prices[id].tiers = sixTiers(0);
        prices[id].tiers[t] = Math.max(0, roundMoney(value));
        savePrices();
        applyCartTierPrices();
        renderProducts();
        renderCart();
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
            const entry = prices[id] || { presentationKg: pres.size, tiers: sixTiers(400) };
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
            return '<div class="pd-price-card" data-pres-id="' + esc(id) + '">' +
                '<div class="pd-price-card-head">' +
                '<strong>' + esc(unit) + '</strong>' +
                '<span class="muted">' + esc(pres.code || id) +
                (kg !== '—' ? ' · ' + esc(String(kg)) + (pres.kind === 'liquido' || pres.unit === 'L' ? ' L' : ' kg') : '') +
                '</span></div>' +
                '<div class="pd-tier-grid">' + tierRows + '</div></div>';
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
                if (['day', 'week', 'month'].indexOf(next) < 0) return;
                pdSalesPeriod = next;
                pdSalesOffset = 0;
                renderProductSalesAnalytics(pdSalesSlug);
                return;
            }
            if (e.target.closest('[data-pd-sales-prev]')) {
                pdSalesOffset -= 1;
                renderProductSalesAnalytics(pdSalesSlug);
                return;
            }
            if (e.target.closest('[data-pd-sales-next]')) {
                if (pdSalesOffset >= 0) return;
                pdSalesOffset += 1;
                renderProductSalesAnalytics(pdSalesSlug);
                return;
            }
            if (e.target.closest('[data-pd-sales-reset]')) {
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
            pdSalesPeriod = 'month';
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

        const bounds = periodBounds(pdSalesPeriod, pdSalesOffset);
        const prevBounds = periodBounds(pdSalesPeriod, pdSalesOffset - 1);
        const periodSales = salesInRange(sales, bounds.start, bounds.end);
        const prevPeriodSales = salesInRange(sales, prevBounds.start, prevBounds.end);
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
        const canGoNext = pdSalesOffset < 0;

        mount.innerHTML =
            '<div class="pd-sales-block">' +
            '<div class="pd-sales-head">' +
            '<div>' +
            '<p class="pd-section-label">Ventas</p>' +
            '<p class="page-sub" style="margin:0">Ritmo y clientes de este producto · POS local</p>' +
            '</div>' +
            '<div class="cortes-range pd-sales-range">' +
            '<button type="button" class="cortes-nav-btn" data-pd-sales-prev title="Periodo anterior" aria-label="Periodo anterior"><i class="fa-solid fa-chevron-left"></i></button>' +
            '<span class="cortes-range-label" id="pdSalesRangeLabel">' + esc(formatPeriodLabel(pdSalesPeriod, bounds.start, bounds.end)) + '</span>' +
            '<button type="button" class="cortes-nav-btn" data-pd-sales-next title="Periodo siguiente" aria-label="Periodo siguiente"' +
            (canGoNext ? '' : ' disabled') + '><i class="fa-solid fa-chevron-right"></i></button>' +
            '<button type="button" class="cortes-today-btn" data-pd-sales-reset>Actual</button>' +
            '</div></div>' +
            '<div class="seg-control pd-sales-periods" role="tablist" aria-label="Periodo de ventas del producto">' +
            [['day', 'Día'], ['week', 'Semana'], ['month', 'Mes']].map(function (pair) {
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
            '<span class="leg"><span class="swatch"></span> Periodo</span>' +
            '<span class="leg"><span class="swatch prev"></span> Anterior</span>' +
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
        }
    }

    function init() {
        prices = loadPrices();
        // Persistir v3 tras merge para no depender del legacy en cada carga.
        savePrices();
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
        renderPriceChips();
        renderPrices();
        updatePosKpis();
        window.S35PosModule = {
            onSectionShow: onSectionShow,
            refreshProducts: renderProducts,
            money: money,
            familyDot: familyDot,
            familyColors: FAMILY_COLORS,
            tierLabels: TIER_LABELS,
            presentationsForSlug: presentationsForSlug,
            getPriceEntry: function (id) { return prices[id] || null; },
            setTierPrice: setTierPrice,
            resetPricesToDefaults: resetPricesToDefaults,
            priceEditorHtml: priceEditorHtml,
            renderProductSalesAnalytics: renderProductSalesAnalytics,
            baseUnitPrice: baseUnitPrice,
            unitFor: unitFor
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
