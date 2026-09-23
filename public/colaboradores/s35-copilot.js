/**
 * S35 Copiloto — cerebro del panel (tools de sistema + chat bajo demanda).
 */
(function () {
    'use strict';

    const history = [];
    let busy = false;

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

    function setBusy(on, statusText) {
        busy = !!on;
        const send = el('copilotSend');
        const input = el('copilotInput');
        if (send) send.disabled = busy;
        if (input) input.disabled = busy;
        const status = el('copilotStatus');
        if (status) status.textContent = busy ? (statusText || 'Pensando…') : '';
        document.querySelectorAll('[data-copilot-chip]').forEach(function (btn) {
            btn.disabled = busy;
        });
    }

    function setChatting(on) {
        const root = el('copilotPanel');
        if (!root) return;
        root.classList.toggle('is-chatting', !!on);
    }

    function appendBubble(role, text) {
        const host = el('copilotMessages');
        if (!host) return;
        setChatting(true);
        const div = document.createElement('div');
        div.className = 'copilot-bubble is-' + role;
        div.textContent = text;
        host.appendChild(div);
        host.scrollTop = host.scrollHeight;
    }

    function clearChat() {
        history.length = 0;
        const host = el('copilotMessages');
        if (host) host.innerHTML = '';
        setChatting(false);
        const status = el('copilotStatus');
        if (status) status.textContent = '';
        const input = el('copilotInput');
        if (input) {
            input.value = '';
            input.focus();
        }
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

    function executeToolCalls(toolCalls) {
        const pos = window.S35PosModule || {};
        const run = typeof pos.executeCopilotTool === 'function'
            ? pos.executeCopilotTool.bind(pos)
            : function () { return { ok: false, error: 'POS no listo' }; };
        return (toolCalls || []).map(function (call) {
            const name = call.name || (call.function && call.function.name);
            const args = call.arguments || {};
            let result;
            try {
                result = run(name, args);
            } catch (err) {
                result = { ok: false, error: (err && err.message) || 'Error tool' };
            }
            return {
                role: 'tool',
                tool_call_id: call.id,
                content: JSON.stringify(result)
            };
        });
    }

    async function postChat(messages) {
        const res = await fetch('/api/s35-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token()
            },
            body: JSON.stringify({
                mode: 'chat',
                messages: messages,
                context: context()
            })
        });
        const data = await res.json().catch(function () { return {}; });
        if (!res.ok || !data.ok) {
            throw new Error(data.error || ('Error HTTP ' + res.status));
        }
        return data;
    }

    async function ask(text) {
        if (!isAdmin()) {
            appendBubble('assistant', 'El copiloto está disponible solo para administradores.');
            return;
        }
        if (busy) return;
        const content = String(text || '').trim();
        if (!content) return;

        appendBubble('user', content);
        history.push({ role: 'user', content: content });

        setBusy(true, 'Pensando…');
        try {
            let wire = history.slice(-12);
            let finalReply = '';
            let actions = [];

            for (let round = 0; round < 5; round++) {
                const data = await postChat(wire);
                if (data.actions && data.actions.length) {
                    actions = actions.concat(data.actions);
                }

                if (data.status === 'tool_calls' && data.toolCalls && data.toolCalls.length) {
                    setBusy(true, 'Consultando el sistema…');
                    const assistantMsg = {
                        role: 'assistant',
                        content: null,
                        tool_calls: data.assistantToolCalls || data.toolCalls.map(function (c) {
                            return {
                                id: c.id,
                                type: 'function',
                                function: {
                                    name: c.name,
                                    arguments: JSON.stringify(c.arguments || {})
                                }
                            };
                        })
                    };
                    const toolMsgs = executeToolCalls(data.toolCalls);
                    wire = wire.concat([assistantMsg]).concat(toolMsgs);
                    continue;
                }

                finalReply = data.reply || '';
                break;
            }

            if (!finalReply) {
                finalReply = 'Consulté el sistema pero no pude armar una respuesta. Intenta de nuevo.';
            }
            appendBubble('assistant', finalReply);
            history.push({ role: 'assistant', content: finalReply });
            runActions(actions);
        } catch (err) {
            appendBubble('assistant', 'No pude responder: ' + (err.message || 'error de red'));
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
                ask(v);
            });
        }

        document.querySelectorAll('[data-copilot-chip]').forEach(function (btn) {
            if (btn.dataset.bound) return;
            btn.dataset.bound = '1';
            btn.addEventListener('click', function () {
                const q = btn.getAttribute('data-copilot-chip') || '';
                ask(q);
            });
        });

        const neu = el('copilotNewChat');
        if (neu && !neu.dataset.bound) {
            neu.dataset.bound = '1';
            neu.addEventListener('click', clearChat);
        }

        const input = el('copilotInput');
        if (input && !history.length) {
            setTimeout(function () {
                try { input.focus(); } catch (_) {}
            }, 200);
        }
    }

    function onReady() {
        bind();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }

    Object.defineProperty(window, '__s35CopilotBoot', {
        value: function () {
            bind();
        }
    });

    window.S35Copilot = {
        ask: ask,
        clear: clearChat,
        refreshBriefing: function () {}
    };
})();
