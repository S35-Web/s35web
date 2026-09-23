/**
 * S35 Copiloto — UI del inicio (solo admin).
 */
(function () {
    'use strict';

    const history = [];
    let busy = false;
    let briefingDone = false;

    function isAdmin() {
        const api = window.S35PanelAPI;
        if (!api) return false;
        if (window.S35Roles && typeof window.S35Roles.isFullAccess === 'function') {
            return window.S35Roles.isFullAccess(api.role);
        }
        return api.role === 'admin';
    }

    function token() {
        return localStorage.getItem('s35_admin_token') || '';
    }

    function context() {
        if (window.S35PosModule && typeof window.S35PosModule.buildCopilotContext === 'function') {
            try {
                return window.S35PosModule.buildCopilotContext();
            } catch (_) {}
        }
        return { note: 'Contexto no disponible aún' };
    }

    function el(id) {
        return document.getElementById(id);
    }

    function setBusy(on) {
        busy = !!on;
        const send = el('copilotSend');
        const input = el('copilotInput');
        if (send) send.disabled = busy;
        if (input) input.disabled = busy;
        const status = el('copilotStatus');
        if (status) status.textContent = busy ? 'Pensando…' : '';
        document.querySelectorAll('[data-copilot-chip]').forEach(function (btn) {
            btn.disabled = busy;
        });
    }

    function appendBubble(role, text) {
        const host = el('copilotMessages');
        if (!host) return;
        const empty = host.querySelector('.copilot-empty');
        if (empty) empty.remove();
        const div = document.createElement('div');
        div.className = 'copilot-bubble is-' + role;
        div.textContent = text;
        host.appendChild(div);
        host.scrollTop = host.scrollHeight;
    }

    function setInsight(text, loading) {
        const brief = el('copilotBriefing');
        if (!brief) return;
        brief.hidden = false;
        brief.classList.toggle('is-loading', !!loading);
        brief.textContent = text || '';
    }

    function runActions(actions) {
        if (!actions || !actions.length) return;
        const api = window.S35PanelAPI || {};
        const pos = window.S35PosModule || {};
        actions.forEach(function (a) {
            if (!a || a.type !== 'navigate') return;
            if (typeof api.showSection === 'function' && a.section) {
                const opts = {};
                if (a.productSlug) {
                    opts.slug = a.productSlug;
                    opts.tab = 'resumen';
                }
                api.showSection(a.section, opts);
            }
            if (a.section === 'cortes' && pos.openCortesView) {
                pos.openCortesView({
                    period: a.period || 'day',
                    cityId: a.city || 'all',
                    scrollChart: true
                });
            }
            if (a.clientId && pos.openClientDashboard) {
                if (typeof api.showSection === 'function') api.showSection('clients');
                pos.openClientDashboard(a.clientId);
            }
            if (a.productSlug && api.openProduct) {
                if (typeof api.showSection === 'function') api.showSection('products', { slug: a.productSlug });
                api.openProduct(a.productSlug);
            }
        });
    }

    async function ask(text, mode) {
        if (!isAdmin()) {
            appendBubble('assistant', 'El copiloto está disponible solo para administradores.');
            return;
        }
        if (busy) return;
        const content = String(text || '').trim();
        if (!content && mode !== 'briefing') return;

        if (mode === 'briefing') {
            setInsight('Preparando lectura del día…', true);
        } else {
            appendBubble('user', content);
            history.push({ role: 'user', content: content });
        }

        setBusy(true);
        try {
            const res = await fetch('/api/s35-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token()
                },
                body: JSON.stringify({
                    mode: mode || 'chat',
                    messages: history.slice(-10),
                    context: context()
                })
            });
            const data = await res.json().catch(function () { return {}; });
            if (!res.ok || !data.ok) {
                throw new Error(data.error || ('Error HTTP ' + res.status));
            }
            const reply = data.reply || '';
            if (mode === 'briefing') {
                setInsight(reply, false);
            } else {
                appendBubble('assistant', reply);
                history.push({ role: 'assistant', content: reply });
            }
            runActions(data.actions || []);
        } catch (err) {
            const msg = 'No pude responder: ' + (err.message || 'error de red');
            if (mode === 'briefing') {
                setInsight(msg, false);
            } else {
                appendBubble('assistant', msg);
            }
        } finally {
            setBusy(false);
        }
    }

    function syncVisibility() {
        const root = el('copilotPanel');
        const guest = el('homeAiGuest');
        const admin = isAdmin();
        if (root) root.hidden = !admin;
        if (guest) guest.hidden = admin;
        return admin;
    }

    function bind() {
        if (!syncVisibility()) return;

        const form = el('copilotForm');
        if (form && !form.dataset.bound) {
            form.dataset.bound = '1';
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                const input = el('copilotInput');
                const v = input ? input.value : '';
                if (input) input.value = '';
                ask(v, 'chat');
            });
        }

        document.querySelectorAll('[data-copilot-chip]').forEach(function (btn) {
            if (btn.dataset.bound) return;
            btn.dataset.bound = '1';
            btn.addEventListener('click', function () {
                const q = btn.getAttribute('data-copilot-chip') || '';
                ask(q, 'chat');
            });
        });
    }

    function maybeBriefing() {
        if (briefingDone || !isAdmin()) return;
        const section = document.querySelector('#dashboard.section.active');
        if (!section) return;
        briefingDone = true;
        ask('', 'briefing');
    }

    function onReady() {
        bind();
        setTimeout(maybeBriefing, 1200);
        document.addEventListener('s35:pos-ready', maybeBriefing);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }

    Object.defineProperty(window, '__s35CopilotBoot', {
        value: function () {
            bind();
            setTimeout(maybeBriefing, 400);
        }
    });

    window.S35Copilot = {
        ask: ask,
        refreshBriefing: function () {
            briefingDone = false;
            maybeBriefing();
        }
    };
})();
