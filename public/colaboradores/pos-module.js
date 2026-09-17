/* POS + Clientes + Historial + Precios — módulo del panel Colaboradores */
(function () {
    'use strict';

    const PRICE_KEY = 's35_pos_prices';
    const SALES_KEY = 's35_pos_sales';
    const CLIENTS_KEY = 's35_pos_clients';
    const FINISHED_KEY = 's35_finished_stock';

    const FAMILY_DEFAULTS = {
        'Estucos premium': 450,
        'Microconcretos': 480,
        'Panel System': 420,
        'Pro+ Systems': 400,
        'Pegaxpress: Adhesivos': 380,
        'Líquidos': 520
    };

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

    function getRecipes() {
        const data = window.S35_PANEL_DATA || {};
        return (data.recipes || []).slice().sort(function (a, b) {
            return String(a.name || '').localeCompare(String(b.name || ''), 'es');
        });
    }

    function unitFor(r) {
        return r && r.kind === 'liquido' ? 'Cubeta' : 'Saco';
    }
    function defaultPrice(r) {
        return FAMILY_DEFAULTS[r.family] || 400;
    }

    // —— Prices ——
    let prices = {};
    function seedPrices() {
        const map = {};
        getRecipes().forEach(function (r) { map[r.product] = defaultPrice(r); });
        return map;
    }
    function loadPrices() {
        const seed = seedPrices();
        try {
            const raw = JSON.parse(localStorage.getItem(PRICE_KEY) || 'null');
            if (raw && typeof raw === 'object') {
                Object.keys(seed).forEach(function (slug) {
                    if (raw[slug] != null) seed[slug] = Number(raw[slug]) || 0;
                });
            }
        } catch (_) {}
        return seed;
    }
    function savePrices() {
        localStorage.setItem(PRICE_KEY, JSON.stringify(prices));
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
        grid.innerHTML = list.map(function (r) {
            const price = prices[r.product] != null ? prices[r.product] : defaultPrice(r);
            const stock = finishedQty(r.product);
            return '<button type="button" class="product-card" data-add="' + esc(r.product) + '">' +
                '<div class="fam">' + esc(r.family || '—') + '</div>' +
                '<div class="name">' + esc(r.name) + '</div>' +
                '<div class="meta">' +
                '<span class="price">' + money(price) + '</span>' +
                '<span class="unit">' + esc(unitFor(r)) + (stock ? ' · stock ' + stock : '') + '</span>' +
                '</div>' +
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
        if (!body) return;
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
                    '<button type="button" class="qty-btn" data-dec="' + idx + '">−</button>' +
                    '<span class="qty-val">' + it.qty + '</span>' +
                    '<button type="button" class="qty-btn" data-inc="' + idx + '">+</button>' +
                    '<button type="button" class="btn ghost danger" data-rm="' + idx + '" style="margin-left:auto;height:28px;padding:0 8px">Quitar</button>' +
                    '</div></div>';
            }).join('');
            if (btn) btn.disabled = false;
        }
        if (totalEl) totalEl.textContent = money(cartTotal());
        updatePosKpis();
    }

    function updatePosKpis() {
        const recipes = getRecipes();
        const kpiP = document.getElementById('posKpiProducts');
        if (kpiP) kpiP.textContent = recipes.length;
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const today = sales.filter(function (s) { return new Date(s.createdAt) >= start; });
        const todayTotal = today.reduce(function (sum, s) { return sum + (Number(s.total) || 0); }, 0);
        const kpiT = document.getElementById('posKpiToday');
        const kpiTH = document.getElementById('posKpiTodayHint');
        if (kpiT) kpiT.textContent = money(todayTotal);
        if (kpiTH) kpiTH.textContent = today.length + (today.length === 1 ? ' venta' : ' ventas');
        const kpiC = document.getElementById('posKpiCart');
        const kpiCH = document.getElementById('posKpiCartHint');
        if (kpiC) kpiC.textContent = money(cartTotal());
        if (kpiCH) kpiCH.textContent = cartQty() + (cartQty() === 1 ? ' ítem' : ' ítems');
    }

    function addToCart(slug) {
        const r = getRecipes().filter(function (x) { return x.product === slug; })[0];
        if (!r) return;
        const existing = cart.filter(function (it) { return it.product === slug; })[0];
        if (existing) existing.qty += 1;
        else {
            cart.push({
                product: r.product,
                name: r.name,
                code: r.code || '',
                unit: unitFor(r),
                price: prices[r.product] != null ? prices[r.product] : defaultPrice(r),
                qty: 1
            });
        }
        renderCart();
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
        toast('Venta ' + ticket.folio + ' · ' + payLabel(paymentMethod) + ' · ' + billLabel(billing));
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
        const list = getRecipes().filter(function (r) {
            return !q || [r.name, r.code, r.family].some(function (v) {
                return String(v || '').toLowerCase().includes(q);
            });
        });
        tbody.innerHTML = list.map(function (r) {
            const price = prices[r.product] != null ? prices[r.product] : defaultPrice(r);
            return '<tr>' +
                '<td class="muted">' + esc(r.code || '—') + '</td>' +
                '<td>' + esc(r.name) + '<div class="muted">' + esc(r.family) + '</div></td>' +
                '<td>' + esc(unitFor(r)) + '</td>' +
                '<td><input class="price-input num" type="number" min="0" step="0.01" data-price="' + esc(r.product) + '" value="' + esc(String(price)) + '"></td>' +
                '</tr>';
        }).join('') || '<tr><td colspan="4" class="empty">Sin resultados</td></tr>';
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
                    if (cart[i]) cart[i].qty += 1;
                    renderCart();
                } else if (dec) {
                    const i = Number(dec.getAttribute('data-dec'));
                    if (cart[i]) {
                        cart[i].qty -= 1;
                        if (cart[i].qty <= 0) cart.splice(i, 1);
                    }
                    renderCart();
                } else if (rm) {
                    cart.splice(Number(rm.getAttribute('data-rm')), 1);
                    renderCart();
                }
            });
        }

        const clearCart = document.getElementById('posClearCartBtn');
        if (clearCart) {
            clearCart.addEventListener('click', function () {
                if (!cart.length) return;
                if (!confirm('¿Vaciar el ticket?')) return;
                cart = [];
                renderCart();
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
                updatePosKpis();
            });
        }

        const priceSearch = document.getElementById('posPriceSearch');
        if (priceSearch) priceSearch.addEventListener('input', renderPrices);
        const pricesBody = document.getElementById('posPricesBody');
        if (pricesBody) {
            pricesBody.addEventListener('change', function (e) {
                const input = e.target.closest('[data-price]');
                if (!input) return;
                const slug = input.getAttribute('data-price');
                prices[slug] = Math.max(0, Number(input.value) || 0);
                savePrices();
                renderProducts();
                cart.forEach(function (it) {
                    if (it.product === slug) it.price = prices[slug];
                });
                renderCart();
            });
        }
        const resetPrices = document.getElementById('posResetPricesBtn');
        if (resetPrices) {
            resetPrices.addEventListener('click', function () {
                if (!confirm('¿Restablecer precios por defecto?')) return;
                prices = seedPrices();
                savePrices();
                renderPrices();
                renderProducts();
                cart.forEach(function (it) {
                    it.price = prices[it.product] != null ? prices[it.product] : it.price;
                });
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
