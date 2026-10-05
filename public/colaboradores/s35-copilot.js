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

    function escapeHtml(raw) {
        return String(raw == null ? '' : raw)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    const DEEP_LINK_RE = /\[\[(note|product|material|client):([^\]|]+)\|([^\]]+)\]\]/gi;
    const DEEP_LINK_KINDS = { note: 1, product: 1, material: 1, client: 1 };

    function sanitizeDeepId(raw) {
        return String(raw || '').trim().slice(0, 120).replace(/[<>"']/g, '');
    }

    function sanitizeDeepLabel(raw) {
        return String(raw || '').trim().slice(0, 80).replace(/\s+/g, ' ');
    }

    function parseDeepLinkToken(kind, id, label) {
        const k = String(kind || '').toLowerCase();
        if (!DEEP_LINK_KINDS[k]) return null;
        const cleanId = sanitizeDeepId(id);
        if (!cleanId) return null;
        return {
            kind: k,
            id: cleanId,
            label: sanitizeDeepLabel(label) || cleanId
        };
    }

    function parseDeepLinksFromText(text) {
        const out = [];
        const seen = {};
        String(text || '').replace(DEEP_LINK_RE, function (_, kind, id, label) {
            const link = parseDeepLinkToken(kind, id, label);
            if (!link) return '';
            const key = link.kind + ':' + link.id;
            if (!seen[key]) {
                seen[key] = 1;
                out.push(link);
            }
            return '';
        });
        return out;
    }

    function deepLinkButtonHtml(link, opts) {
        opts = opts || {};
        const cls = opts.block ? 'copilot-deep-link is-block' : 'copilot-deep-link';
        return (
            '<button type="button" class="' + cls + '"' +
            ' data-s35-kind="' + escapeHtml(link.kind) + '"' +
            ' data-s35-id="' + escapeHtml(link.id) + '"' +
            ' title="Abrir">' +
            escapeHtml(link.label) +
            '</button>'
        );
    }

    function stripDeepLinkTokens(text) {
        return String(text || '')
            .replace(DEEP_LINK_RE, '')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    /** Markdown ligero y seguro para burbujas del asistente (sin HTML crudo). */
    function formatInlineMd(raw) {
        const tokens = [];
        let s = String(raw == null ? '' : raw).replace(DEEP_LINK_RE, function (_, kind, id, label) {
            const link = parseDeepLinkToken(kind, id, label);
            if (!link) return '';
            const idx = tokens.length;
            tokens.push(deepLinkButtonHtml(link));
            return '\u0000DL' + idx + '\u0000';
        });
        s = escapeHtml(s);
        s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
        s = s.replace(/\u0000DL(\d+)\u0000/g, function (_, n) {
            return tokens[Number(n)] || '';
        });
        return s;
    }

    function renderAssistantMarkdown(text) {
        const src = String(text == null ? '' : text).replace(/\r\n/g, '\n').trim();
        if (!src) return '';
        const lines = src.split('\n');
        const parts = [];
        let i = 0;

        function flushParagraph(buf) {
            if (!buf.length) return;
            parts.push('<p>' + formatInlineMd(buf.join(' ')) + '</p>');
            buf.length = 0;
        }

        function listItemDepth(line) {
            const m = line.match(/^(\s*)([-*•]|\d+[.)])\s+/);
            if (!m) return -1;
            return Math.min(2, Math.floor(m[1].length / 2));
        }

        function consumeList(ordered) {
            const root = [];
            const stack = [{ depth: -1, items: root }];

            while (i < lines.length) {
                const raw = lines[i];
                if (!raw.trim()) break;
                const depth = listItemDepth(raw);
                if (depth < 0) break;
                const m = raw.trim().match(/^[-*•]\s+(.+)$/) || raw.trim().match(/^\d+[.)]\s+(.+)$/);
                if (!m) break;
                while (stack.length > 1 && stack[stack.length - 1].depth >= depth) stack.pop();
                const parent = stack[stack.length - 1].items;
                const node = { html: formatInlineMd(m[1]), children: [] };
                parent.push(node);
                stack.push({ depth: depth, items: node.children });
                i += 1;
            }

            function renderNodes(nodes, asOrdered) {
                if (!nodes.length) return '';
                const tag = asOrdered ? 'ol' : 'ul';
                return '<' + tag + '>' + nodes.map(function (n) {
                    const nested = n.children.length ? renderNodes(n.children, false) : '';
                    return '<li>' + n.html + nested + '</li>';
                }).join('') + '</' + tag + '>';
            }

            parts.push(renderNodes(root, ordered));
        }

        while (i < lines.length) {
            const line = lines[i];
            const trimmed = line.trim();

            if (!trimmed) {
                i += 1;
                continue;
            }

            if (/^[-*•]\s+/.test(trimmed)) {
                consumeList(false);
                continue;
            }

            if (/^\d+[.)]\s+/.test(trimmed)) {
                consumeList(true);
                continue;
            }

            const para = [];
            while (i < lines.length) {
                const t = lines[i].trim();
                if (!t) break;
                if (/^[-*•]\s+/.test(t) || /^\d+[.)]\s+/.test(t)) break;
                para.push(t);
                i += 1;
            }
            flushParagraph(para);
        }

        return parts.join('') || ('<p>' + formatInlineMd(src) + '</p>');
    }

    function collectLinksFromToolPayload(payload, into, seen) {
        if (!payload) return;
        if (typeof payload === 'string') {
            try { payload = JSON.parse(payload); } catch (_) { return; }
        }
        if (typeof payload !== 'object') return;

        function add(link) {
            if (!link || !link.kind || !link.id) return;
            const key = link.kind + ':' + link.id;
            if (seen[key]) return;
            seen[key] = 1;
            into.push(link);
        }

        function fromOpen(open) {
            if (!open || typeof open !== 'string') return;
            parseDeepLinksFromText(open).forEach(add);
        }

        if (Array.isArray(payload.results)) {
            payload.results.slice(0, 2).forEach(function (r, idx) {
                fromOpen(r && r.open);
                if (r && r.id && !r.open && (r.folio || r.total != null)) {
                    add(parseDeepLinkToken('note', r.id, 'Ver nota ' + (r.folio || r.id)));
                }
                if (idx === 0 && r && r.clientId) {
                    add(parseDeepLinkToken('client', r.clientId, r.client || r.name || 'Cliente'));
                }
                if (idx === 0) {
                    (r && r.items || []).slice(0, 2).forEach(function (it) {
                        fromOpen(it && it.open);
                        if (it && it.product) {
                            add(parseDeepLinkToken('product', it.product, it.name || it.product));
                        }
                    });
                }
            });
        }
        if (Array.isArray(payload.items)) {
            payload.items.slice(0, 5).forEach(function (it) {
                fromOpen(it && it.open);
                if (it && it.slug) add(parseDeepLinkToken('product', it.slug, it.name || it.slug));
                if (it && it.clientId) add(parseDeepLinkToken('client', it.clientId, it.name || 'Cliente'));
            });
        }
        if (Array.isArray(payload.alerts)) {
            payload.alerts.slice(0, 6).forEach(function (a) {
                fromOpen(a && a.open);
                if (a && a.type === 'stock' && a.id) {
                    add(parseDeepLinkToken('material', a.id, a.name || a.id));
                }
                if (a && a.type === 'stale' && a.slug) {
                    add(parseDeepLinkToken('product', a.slug, a.name || a.slug));
                }
            });
        }
    }

    function mergeDeepLinks() {
        const out = [];
        const seen = {};
        for (let a = 0; a < arguments.length; a++) {
            (arguments[a] || []).forEach(function (link) {
                if (!link || !link.kind || !link.id) return;
                const key = link.kind + ':' + link.id;
                if (seen[key]) return;
                seen[key] = 1;
                out.push(link);
            });
        }
        return out;
    }

    function openDeepLink(kind, id) {
        const api = window.S35PanelAPI || {};
        const pos = window.S35PosModule || {};
        const k = String(kind || '').toLowerCase();
        const target = sanitizeDeepId(id);
        if (!target) return;

        if (k === 'note') {
            if (typeof api.showSection === 'function') api.showSection('salesHistory');
            if (typeof pos.openSaleNoteById === 'function') pos.openSaleNoteById(target);
            return;
        }
        if (k === 'product') {
            if (typeof api.showSection === 'function') api.showSection('products', { slug: target });
            else if (typeof api.openProduct === 'function') api.openProduct(target);
            return;
        }
        if (k === 'material') {
            if (typeof api.openMaterial === 'function') api.openMaterial(target);
            else if (typeof api.showSection === 'function') {
                api.showSection('materials');
                if (typeof api.focusMaterialSearch === 'function') api.focusMaterialSearch(target);
            }
            return;
        }
        if (k === 'client') {
            if (typeof api.showSection === 'function') api.showSection('clients');
            if (typeof pos.openClientDashboard === 'function') pos.openClientDashboard(target);
        }
    }

    function formatTokens(n) {
        n = Number(n) || 0;
        if (n >= 1000000) return (n / 1000000).toFixed(n >= 10000000 ? 0 : 1).replace(/\.0$/, '') + 'M';
        if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k';
        return String(Math.round(n));
    }

    function renderUsage(summary) {
        const root = el('copilotUsage');
        if (!root || !summary || !summary.ok) return;
        const onCopilot = !!(el('dashboard') && el('dashboard').classList.contains('active'));
        root.hidden = !onCopilot;
        if (!onCopilot) return;
        const pct = Math.max(0, Math.min(100, Number(summary.pctUsed) || 0));
        const pctEl = el('copilotUsagePct');
        if (pctEl) pctEl.textContent = (pct % 1 ? pct.toFixed(1) : String(pct)) + '%';
        const sub = el('copilotUsageSub');
        if (sub) {
            sub.textContent = formatTokens(summary.totalTokens) + ' / ' + formatTokens(summary.budgetTokens) +
                ' · ' + (summary.requests || 0) + ' req';
        }
        const ring = el('copilotUsageRing');
        if (ring) {
            const c = 2 * Math.PI * 15.5;
            ring.setAttribute('stroke-dasharray', String(c.toFixed(2)));
            ring.setAttribute('stroke-dashoffset', String((c * (1 - pct / 100)).toFixed(2)));
        }
        root.title = 'Usage global del copiloto · ' + (summary.month || '') +
            '\nTokens: ' + (summary.totalTokens || 0).toLocaleString('es-MX') +
            ' / ' + (summary.budgetTokens || 0).toLocaleString('es-MX') +
            '\nEst. ~$' + (Number(summary.estimatedCostUsd) || 0).toFixed(4) +
            ' · ' + (summary.model || '');
    }

    function refreshUsage(summary) {
        if (summary && summary.ok) {
            renderUsage(summary);
            return Promise.resolve(summary);
        }
        const t = token();
        if (!t) return Promise.resolve(null);
        return fetch('/api/s35-usage', {
            headers: { Authorization: 'Bearer ' + t },
            cache: 'no-store'
        })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (data && data.ok) renderUsage(data);
                return data;
            })
            .catch(function () { return null; });
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

    function appendBubble(role, text, extraLinks) {
        const host = el('copilotMessages');
        if (!host) return null;
        setChatting(true);
        const div = document.createElement('div');
        div.className = 'copilot-bubble is-' + role;
        if (role === 'assistant') {
            div.classList.add('has-md');
            const inlineLinks = parseDeepLinksFromText(text);
            const bodyText = stripDeepLinkTokens(text);
            div.innerHTML = renderAssistantMarkdown(bodyText || text);
            const footerLinks = mergeDeepLinks(extraLinks, inlineLinks).filter(function (link) {
                // Prefer footer buttons; avoid duplicates already rendered if body kept tokens
                return !!link;
            });
            // If body still had tokens (fallback), stripDeepLinkTokens removed them from display;
            // show unique actions in a button row.
            if (footerLinks.length) {
                const bar = document.createElement('div');
                bar.className = 'copilot-deep-links';
                // Prefer note first, then product/client/material; cap to 6
                const order = { note: 0, product: 1, client: 2, material: 3 };
                footerLinks
                    .slice()
                    .sort(function (a, b) {
                        return (order[a.kind] != null ? order[a.kind] : 9) - (order[b.kind] != null ? order[b.kind] : 9);
                    })
                    .slice(0, 6)
                    .forEach(function (link) {
                        const wrap = document.createElement('span');
                        wrap.innerHTML = deepLinkButtonHtml(link, { block: true });
                        bar.appendChild(wrap.firstChild);
                    });
                div.appendChild(bar);
            }
        } else {
            div.textContent = text;
        }
        host.appendChild(div);
        host.scrollTop = host.scrollHeight;
        return div;
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
            if (a.saleId) {
                openDeepLink('note', a.saleId);
                return;
            }
            if (a.materialId) {
                openDeepLink('material', a.materialId);
                return;
            }
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
            const toolLinks = [];
            const toolLinkSeen = {};

            for (let round = 0; round < 5; round++) {
                const data = await postChat(wire);
                if (data.actions && data.actions.length) {
                    actions = actions.concat(data.actions);
                }

                if (data.status === 'tool_calls' && data.toolCalls && data.toolCalls.length) {
                    if (data.usageSummary) refreshUsage(data.usageSummary);
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
                    toolMsgs.forEach(function (tm) {
                        collectLinksFromToolPayload(tm.content, toolLinks, toolLinkSeen);
                    });
                    wire = wire.concat([assistantMsg]).concat(toolMsgs);
                    continue;
                }

                finalReply = data.reply || '';
                if (data.usageSummary) refreshUsage(data.usageSummary);
                break;
            }

            if (!finalReply) {
                finalReply = 'Consulté el sistema pero no pude armar una respuesta. Intenta de nuevo.';
            }
            appendBubble('assistant', finalReply, toolLinks);
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
        const usage = el('copilotUsage');
        const admin = isAdmin();
        if (root) root.hidden = !admin;
        if (guest) guest.hidden = admin;
        if (usage && !admin) usage.hidden = true;
        return admin;
    }

    function bind() {
        if (!syncVisibility()) return;
        refreshUsage();

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

        const msgs = el('copilotMessages');
        if (msgs && !msgs.dataset.deepBound) {
            msgs.dataset.deepBound = '1';
            msgs.addEventListener('click', function (e) {
                const btn = e.target && e.target.closest ? e.target.closest('[data-s35-kind]') : null;
                if (!btn || !msgs.contains(btn)) return;
                e.preventDefault();
                openDeepLink(btn.getAttribute('data-s35-kind'), btn.getAttribute('data-s35-id'));
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
        refreshUsage: refreshUsage,
        refreshBriefing: function () {}
    };
})();
