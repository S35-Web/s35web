/**
 * Copiloto de correo (Ask S35) — modo mail de /api/s35-chat.
 * Ventana flotante redimensionable; trigger en el header de Mensajes.
 */
(function () {
    'use strict';

    const GEOM_KEY = 's35_mail_copilot_geom';
    const history = [];
    let busy = false;
    let selectedMail = null;
    let openState = false;

    function el(id) {
        return document.getElementById(id);
    }

    function token() {
        return localStorage.getItem('s35_admin_token') || '';
    }

    function setStatus(text) {
        const s = el('mailCopilotStatus');
        if (s) s.textContent = text || '';
    }

    function setBusy(on, statusText) {
        busy = !!on;
        const send = el('mailCopilotSend');
        const input = el('mailCopilotInput');
        if (send) send.disabled = busy;
        if (input) input.disabled = busy;
        document.querySelectorAll('[data-mail-chip]').forEach(function (btn) {
            btn.disabled = busy;
        });
        const summary = el('mailAskSummary');
        const draft = el('mailAskDraft');
        if (summary) summary.disabled = busy;
        if (draft) draft.disabled = busy;
        setStatus(busy ? (statusText || 'Pensando…') : '');
    }

    function escapeHtml(raw) {
        return String(raw == null ? '' : raw)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatInlineMd(raw) {
        let s = escapeHtml(raw);
        s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
        return s;
    }

    function renderMd(text) {
        const src = String(text || '').replace(/\r\n/g, '\n').trim();
        if (!src) return '';
        const lines = src.split('\n');
        const parts = [];
        let i = 0;
        while (i < lines.length) {
            const t = lines[i].trim();
            if (!t) { i += 1; continue; }
            if (/^[-*•]\s+/.test(t)) {
                const items = [];
                while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
                    items.push('<li>' + formatInlineMd(lines[i].trim().replace(/^[-*•]\s+/, '')) + '</li>');
                    i += 1;
                }
                parts.push('<ul>' + items.join('') + '</ul>');
                continue;
            }
            const para = [];
            while (i < lines.length) {
                const line = lines[i].trim();
                if (!line || /^[-*•]\s+/.test(line)) break;
                para.push(line);
                i += 1;
            }
            parts.push('<p>' + formatInlineMd(para.join(' ')) + '</p>');
        }
        return parts.join('') || ('<p>' + formatInlineMd(src) + '</p>');
    }

    function extractDraft(text) {
        const m = String(text || '').match(/<<<DRAFT>>>\s*([\s\S]*?)\s*<<<END_DRAFT>>>/i);
        if (!m) return { body: text, draft: null };
        const draft = m[1].trim();
        const body = String(text).replace(m[0], '').trim();
        return { body: body, draft: draft };
    }

    function resolveSelectedMail() {
        if (selectedMail) return selectedMail;
        const api = window.S35PanelAPI;
        if (api && typeof api.getSelectedMail === 'function') {
            const fromPanel = api.getSelectedMail();
            if (fromPanel) {
                selectedMail = fromPanel;
                return selectedMail;
            }
        }
        return null;
    }

    function appendBubble(role, text) {
        const host = el('mailCopilotMessages');
        if (!host) return;
        const div = document.createElement('div');
        div.className = 'copilot-bubble is-' + role + (role === 'assistant' ? ' has-md' : '');
        if (role === 'assistant') div.innerHTML = renderMd(text);
        else div.textContent = text;
        host.appendChild(div);
        host.scrollTop = host.scrollHeight;
    }

    function clearChat() {
        history.length = 0;
        const host = el('mailCopilotMessages');
        if (host) host.innerHTML = '';
        setStatus('');
    }

    function updateHint(mail) {
        const hint = el('mailCopilotHint');
        if (!hint) return;
        if (!mail) {
            hint.textContent = 'Selecciona un correo para resumirlo, redactar o cruzarlo con clientes.';
            return;
        }
        const who = mail.nombre || mail.email || 'remitente';
        hint.textContent = 'Contexto: ' + who + (mail.asunto ? ' · ' + mail.asunto : '');
    }

    function setSelectedMail(mail, opts) {
        opts = opts || {};
        const nextId = mail ? (mail._id || mail.gmailId || null) : null;
        const prevId = selectedMail ? (selectedMail._id || selectedMail.gmailId || null) : null;
        selectedMail = mail || null;
        updateHint(selectedMail);
        if (!opts.keepChat && nextId !== prevId) clearChat();
    }

    function mailContext() {
        const mail = resolveSelectedMail();
        if (!mail) return { mail: { selected: false }, now: new Date().toISOString() };
        const bodyText = String(mail.mensaje || '').trim();
        const htmlText = String(mail.html || '')
            .replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<script[\s\S]*?<\/script>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return {
            now: new Date().toISOString(),
            mail: {
                selected: true,
                id: mail._id || mail.gmailId || null,
                source: mail.source || (String(mail._id || '').indexOf('gmail:') === 0 ? 'gmail' : 'web'),
                fromName: mail.nombre || null,
                fromEmail: mail.email || null,
                subject: mail.asunto || null,
                date: mail.createdAt || null,
                company: mail.empresa || null,
                newsletter: !!mail.newsletter,
                body: (bodyText || htmlText).slice(0, 8000),
                hasHtml: !!String(mail.html || '').trim(),
                attachments: Array.isArray(mail.attachments)
                    ? mail.attachments.slice(0, 8).map(function (a) {
                        return {
                            filename: a.filename || null,
                            mimeType: a.mimeType || null,
                            sizeLabel: a.sizeLabel || null
                        };
                    })
                    : []
            }
        };
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
                mode: 'mail',
                messages: messages,
                context: mailContext()
            })
        });
        const data = await res.json().catch(function () { return {}; });
        if (!res.ok || !data.ok) {
            throw new Error(data.error || ('Error HTTP ' + res.status));
        }
        return data;
    }

    function applyDraft(draft) {
        if (!draft) return;
        const box = el('mailDraft');
        const body = el('mailDraftBody');
        if (body) body.value = draft;
        if (box) box.classList.add('is-open');
        if (typeof window.__s35MailOnDraft === 'function') {
            try { window.__s35MailOnDraft(draft); } catch (_) {}
        }
    }

    function loadGeom() {
        try {
            const raw = localStorage.getItem(GEOM_KEY);
            if (!raw) return null;
            const g = JSON.parse(raw);
            if (!g || typeof g !== 'object') return null;
            return g;
        } catch (_) {
            return null;
        }
    }

    function saveGeom(pane) {
        if (!pane) return;
        const rect = pane.getBoundingClientRect();
        try {
            localStorage.setItem(GEOM_KEY, JSON.stringify({
                left: Math.round(rect.left),
                top: Math.round(rect.top),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
            }));
        } catch (_) {}
    }

    function clampGeom(g) {
        const pad = 8;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const minW = 300;
        const minH = 360;
        let width = Math.max(minW, Math.min(Number(g.width) || 420, vw - pad * 2));
        let height = Math.max(minH, Math.min(Number(g.height) || 640, vh - pad * 2));
        let left = Number.isFinite(g.left) ? g.left : (vw - width - 20);
        let top = Number.isFinite(g.top) ? g.top : (vh - height - 20);
        left = Math.max(pad, Math.min(left, vw - width - pad));
        top = Math.max(pad, Math.min(top, vh - height - pad));
        return { left: left, top: top, width: width, height: height };
    }

    function applyGeom(pane, g) {
        if (!pane || !g) return;
        const c = clampGeom(g);
        pane.style.left = c.left + 'px';
        pane.style.top = c.top + 'px';
        pane.style.right = 'auto';
        pane.style.bottom = 'auto';
        pane.style.width = c.width + 'px';
        pane.style.height = c.height + 'px';
    }

    function syncLaunchUi(isOpen) {
        const launch = el('mailCopilotLaunch');
        if (launch) {
            launch.classList.toggle('is-open', !!isOpen);
            launch.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
    }

    function openFloat() {
        const pane = el('mailCopilotPane');
        if (!pane) return;
        if (!openState) {
            const saved = loadGeom();
            if (saved) applyGeom(pane, saved);
            else {
                applyGeom(pane, {
                    width: Math.min(420, window.innerWidth - 32),
                    height: Math.min(640, window.innerHeight - 96),
                    left: window.innerWidth - Math.min(420, window.innerWidth - 32) - 20,
                    top: window.innerHeight - Math.min(640, window.innerHeight - 96) - 20
                });
            }
        }
        pane.hidden = false;
        pane.setAttribute('aria-hidden', 'false');
        pane.classList.add('is-open');
        openState = true;
        syncLaunchUi(true);
        const input = el('mailCopilotInput');
        if (input) {
            try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); }
        }
    }

    function closeFloat() {
        const pane = el('mailCopilotPane');
        if (pane) {
            if (openState) saveGeom(pane);
            pane.classList.remove('is-open');
            pane.hidden = true;
            pane.setAttribute('aria-hidden', 'true');
        }
        openState = false;
        syncLaunchUi(false);
    }

    function toggleFloat() {
        if (openState) closeFloat();
        else openFloat();
    }

    function bindWindowChrome() {
        const pane = el('mailCopilotPane');
        const launch = el('mailCopilotLaunch');
        const closeBtn = el('mailCopilotClose');
        const drag = el('mailCopilotDrag');
        const resize = el('mailCopilotResize');
        if (!pane) return;

        if (launch && !launch.dataset.bound) {
            launch.dataset.bound = '1';
            launch.addEventListener('click', function () {
                toggleFloat();
            });
        }
        if (closeBtn && !closeBtn.dataset.bound) {
            closeBtn.dataset.bound = '1';
            closeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                closeFloat();
            });
        }

        if (drag && !drag.dataset.bound) {
            drag.dataset.bound = '1';
            let dragging = false;
            let startX = 0;
            let startY = 0;
            let origLeft = 0;
            let origTop = 0;

            drag.addEventListener('pointerdown', function (e) {
                if (e.button != null && e.button !== 0) return;
                if (e.target && e.target.closest && e.target.closest('#mailCopilotClose')) return;
                dragging = true;
                const rect = pane.getBoundingClientRect();
                startX = e.clientX;
                startY = e.clientY;
                origLeft = rect.left;
                origTop = rect.top;
                pane.style.left = origLeft + 'px';
                pane.style.top = origTop + 'px';
                pane.style.right = 'auto';
                pane.style.bottom = 'auto';
                try { drag.setPointerCapture(e.pointerId); } catch (_) {}
                e.preventDefault();
            });
            drag.addEventListener('pointermove', function (e) {
                if (!dragging) return;
                applyGeom(pane, {
                    left: origLeft + (e.clientX - startX),
                    top: origTop + (e.clientY - startY),
                    width: pane.getBoundingClientRect().width,
                    height: pane.getBoundingClientRect().height
                });
            });
            function endDrag(e) {
                if (!dragging) return;
                dragging = false;
                try { drag.releasePointerCapture(e.pointerId); } catch (_) {}
                saveGeom(pane);
            }
            drag.addEventListener('pointerup', endDrag);
            drag.addEventListener('pointercancel', endDrag);
        }

        if (resize && !resize.dataset.bound) {
            resize.dataset.bound = '1';
            let resizing = false;
            let startX = 0;
            let startY = 0;
            let origW = 0;
            let origH = 0;
            let origLeft = 0;
            let origTop = 0;

            resize.addEventListener('pointerdown', function (e) {
                if (e.button != null && e.button !== 0) return;
                resizing = true;
                const rect = pane.getBoundingClientRect();
                startX = e.clientX;
                startY = e.clientY;
                origW = rect.width;
                origH = rect.height;
                origLeft = rect.left;
                origTop = rect.top;
                try { resize.setPointerCapture(e.pointerId); } catch (_) {}
                e.preventDefault();
                e.stopPropagation();
            });
            resize.addEventListener('pointermove', function (e) {
                if (!resizing) return;
                applyGeom(pane, {
                    left: origLeft,
                    top: origTop,
                    width: origW + (e.clientX - startX),
                    height: origH + (e.clientY - startY)
                });
            });
            function endResize(e) {
                if (!resizing) return;
                resizing = false;
                try { resize.releasePointerCapture(e.pointerId); } catch (_) {}
                saveGeom(pane);
            }
            resize.addEventListener('pointerup', endResize);
            resize.addEventListener('pointercancel', endResize);
        }

        if (!window.__s35MailCopilotResizeBound) {
            window.__s35MailCopilotResizeBound = true;
            window.addEventListener('resize', function () {
                if (!openState || !pane) return;
                const rect = pane.getBoundingClientRect();
                applyGeom(pane, {
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height
                });
            });
        }
    }

    async function ask(text) {
        const content = String(text || '').trim();
        if (!content || busy) return;

        openFloat();
        setBusy(true, 'Pensando…');

        const mail = resolveSelectedMail();
        if (!mail) {
            setBusy(false);
            appendBubble('assistant', 'Selecciona un mensaje de la bandeja para poder ayudarte con ese correo.');
            updateHint(null);
            return;
        }
        selectedMail = mail;
        updateHint(mail);

        appendBubble('user', content);
        history.push({ role: 'user', content: content });

        try {
            let wire = history.slice(-10);
            let finalReply = '';

            for (let round = 0; round < 4; round++) {
                const data = await postChat(wire);
                if (data.status === 'tool_calls' && data.toolCalls && data.toolCalls.length) {
                    setBusy(true, 'Consultando clientes…');
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

            if (!finalReply) finalReply = 'No pude armar una respuesta. Intenta de nuevo.';
            const parsed = extractDraft(finalReply);
            const shown = (parsed.body || finalReply).trim() || finalReply;
            appendBubble('assistant', shown);
            history.push({ role: 'assistant', content: finalReply });
            if (parsed.draft) applyDraft(parsed.draft);
        } catch (err) {
            appendBubble('assistant', 'No pude responder: ' + (err.message || 'error de red'));
        } finally {
            setBusy(false);
        }
    }

    function chipPrompt(kind) {
        if (kind === 'resume') {
            return 'Resume este correo: quién escribe, qué pide, urgencia y qué deberíamos responder.';
        }
        if (kind === 'draft') {
            return 'Redacta un borrador de respuesta profesional y breve en nombre de S-35. Usa los marcadores <<<DRAFT>>> y <<<END_DRAFT>>>.';
        }
        if (kind === 'client') {
            const mail = resolveSelectedMail();
            const q = (mail && (mail.email || mail.nombre)) || '';
            return '¿Este remitente parece cliente de S35? Busca por «' + q + '» y dime si hay coincidencia.';
        }
        return '';
    }

    function bind() {
        bindWindowChrome();

        const form = el('mailCopilotForm');
        if (form && !form.dataset.bound) {
            form.dataset.bound = '1';
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                const input = el('mailCopilotInput');
                const v = input ? input.value : '';
                if (input) input.value = '';
                ask(v);
            });
        }
        document.querySelectorAll('[data-mail-chip]').forEach(function (btn) {
            if (btn.dataset.bound) return;
            btn.dataset.bound = '1';
            btn.addEventListener('click', function () {
                const kind = btn.getAttribute('data-mail-chip');
                const q = chipPrompt(kind);
                if (q) ask(q);
            });
        });

        const synced = resolveSelectedMail();
        if (synced) updateHint(synced);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bind);
    } else {
        bind();
    }

    window.S35MailCopilot = {
        ask: ask,
        clear: clearChat,
        setSelectedMail: setSelectedMail,
        bind: bind,
        open: openFloat,
        close: closeFloat,
        toggle: toggleFloat,
        isOpen: function () { return openState; }
    };
})();
