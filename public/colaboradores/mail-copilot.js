/**
 * Copiloto de correo (Ask S35) — modo mail de /api/s35-chat.
 */
(function () {
    'use strict';

    const history = [];
    let busy = false;
    let selectedMail = null;

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

    function setSelectedMail(mail, opts) {
        opts = opts || {};
        const nextId = mail ? (mail._id || mail.gmailId || null) : null;
        const prevId = selectedMail ? (selectedMail._id || selectedMail.gmailId || null) : null;
        selectedMail = mail || null;
        const hint = el('mailCopilotHint');
        if (hint) {
            if (!selectedMail) {
                hint.textContent = 'Selecciona un correo para resumirlo, redactar o cruzarlo con clientes.';
            } else {
                const who = selectedMail.nombre || selectedMail.email || 'remitente';
                hint.textContent = 'Contexto: ' + who + (selectedMail.asunto ? ' · ' + selectedMail.asunto : '');
            }
        }
        if (!opts.keepChat && nextId !== prevId) clearChat();
    }

    function mailContext() {
        if (!selectedMail) return { mail: { selected: false }, now: new Date().toISOString() };
        return {
            now: new Date().toISOString(),
            mail: {
                selected: true,
                id: selectedMail._id || selectedMail.gmailId || null,
                source: selectedMail.source || (String(selectedMail._id || '').indexOf('gmail:') === 0 ? 'gmail' : 'web'),
                fromName: selectedMail.nombre || null,
                fromEmail: selectedMail.email || null,
                subject: selectedMail.asunto || null,
                date: selectedMail.createdAt || null,
                company: selectedMail.empresa || null,
                newsletter: !!selectedMail.newsletter,
                body: String(selectedMail.mensaje || '').slice(0, 8000)
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

    async function ask(text) {
        const content = String(text || '').trim();
        if (!content || busy) return;
        if (!selectedMail) {
            appendBubble('assistant', 'Selecciona un mensaje de la bandeja para poder ayudarte con ese correo.');
            return;
        }

        appendBubble('user', content);
        history.push({ role: 'user', content: content });
        setBusy(true, 'Pensando…');

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
            appendBubble('assistant', parsed.body || finalReply);
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
            const q = (selectedMail && (selectedMail.email || selectedMail.nombre)) || '';
            return '¿Este remitente parece cliente de S35? Busca por «' + q + '» y dime si hay coincidencia.';
        }
        return '';
    }

    function bind() {
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
        const msgs = el('mailCopilotMessages');
        if (msgs && !msgs.dataset.deepBound && window.S35Copilot) {
            /* deep links handled if we reuse openDeepLink later */
        }
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
        bind: bind
    };
})();
