/**
 * OINIO — Ask OINIO landing-page client.
 *
 * Philosophy (docs/AUTHORITY_DOMAIN_V1.md, qpf-canon/agent):
 *   - OINIO is read-only. This client can only SEND questions and DISPLAY
 *     answers. There is no write path, no transaction signing, no economic
 *     action — the interface cannot grant authority the agent doesn't have.
 *   - Failure is honest. If the agent is unreachable, this client says so and
 *     reports UNKNOWN. It never fabricates an answer locally.
 *   - "Unknown is not false" is displayed, not just implemented.
 */

(function () {
  'use strict';

  // Where the oinio-agent Worker lives. Update after deployment (e.g.
  // https://ask.quantumpiforge.com). Can be overridden via
  // window.OINIO_CONFIG = { agentUrl: "..." } before this script loads.
  var AGENT_URL =
    (window.OINIO_CONFIG && window.OINIO_CONFIG.agentUrl) ||
    'https://ask.quantumpiforge.com';

  var AGENT_PATH = '/agents/oinio-agent/';

  var els = {
    openBtn: document.getElementById('oinioOpenBtn'),
    panel: document.getElementById('oinioPanel'),
    close: document.getElementById('oinioClose'),
    messages: document.getElementById('oinioMessages'),
    form: document.getElementById('oinioForm'),
    input: document.getElementById('oinioInput'),
    send: document.getElementById('oinioSend'),
  };

  if (!els.openBtn || !els.panel) return; // Landing page without the section.

  // Stable per-browser session id so the Durable Object keeps conversation
  // state. Not a credential — the agent holds no authority regardless.
  var sessionId = 'web-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

  var history = []; // UIMessage-shaped: { role, parts: [{ type, text }] }
  var busy = false;

  function scrollToEnd() {
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function addUser(text) {
    var div = document.createElement('div');
    div.className = 'oinio-msg oinio-msg-user';
    div.textContent = text;
    els.messages.appendChild(div);
    scrollToEnd();
  }

  function addAssistantShell() {
    var wrap = document.createElement('div');
    wrap.className = 'oinio-msg oinio-msg-agent';
    var text = document.createElement('div');
    text.className = 'oinio-msg-text';
    var footer = document.createElement('div');
    footer.className = 'oinio-status-footer';
    footer.innerHTML =
      '<div class="oinio-status-row"><span class="oinio-status-label">CLAIM STATUS</span>' +
      '<span class="oinio-status-value oinio-status-pending">RETRIEVING…</span></div>';
    wrap.appendChild(text);
    wrap.appendChild(footer);
    els.messages.appendChild(wrap);
    scrollToEnd();
    return { text: text, footer: footer, gotToolData: false };
  }

  function setStatusFooter(footer, fields) {
    // fields: { status, sources, knowledgeVersion, verification, notEstablished }
    function esc(s) {
      return String(s).replace(/[<>&]/g, function (c) {
        return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c];
      });
    }
    function row(label, value, cls) {
      return (
        '<div class="oinio-status-row"><span class="oinio-status-label">' +
        esc(label) +
        '</span><span class="oinio-status-value ' +
        (cls || '') +
        '">' +
        esc(value) +
        '</span></div>'
      );
    }
    var rows = '';
    if (fields.status) {
      rows += row('CLAIM STATUS', fields.status, 'oinio-status-' + String(fields.status).toLowerCase());
    }
    if (fields.sources) rows += row('SOURCES', fields.sources);
    if (fields.knowledgeVersion) rows += row('KNOWLEDGE VERSION', fields.knowledgeVersion);
    rows += row('VERIFICATION', fields.verification || 'No verification tool executed');
    if (fields.notEstablished) rows += row('NOT ESTABLISHED', fields.notEstablished);
    footer.innerHTML = rows;
  }

  function honestFailure(shell, detail) {
    shell.text.textContent =
      'OINIO could not be reached, so no evidence was retrieved and no answer was produced. ' +
      'This is UNKNOWN — and unknown is not false.';
    setStatusFooter(shell.footer, {
      status: 'UNKNOWN',
      sources: 'None retrieved',
      verification: 'No verification tool executed (' + detail + ')',
    });
  }

  function extractToolData(obj, shell, fields) {
    // UI-message streams carry tool outputs as data parts. Pull out anything
    // that looks like OINIO tool metadata so the footer reflects what the
    // tools actually returned — never what we invent here.
    if (!obj || typeof obj !== 'object') return;
    var d = obj.data || obj;
    if (d.code === 'CIRCUIT_OPEN' || d.code === 'SEARCH_FAILED') {
      fields.status = 'UNKNOWN';
      fields.sources = 'Retrieval unavailable: ' + d.code;
      shell.gotToolData = true;
    }
    if (typeof d.knowledge_version === 'string') {
      fields.knowledgeVersion = d.knowledge_version;
      shell.gotToolData = true;
    }
    if (d.claim_hint) {
      if (!fields.status || fields.status === 'RETRIEVING…') {
        fields.status = d.claim_hint === 'HAS_SOURCES' ? 'ESTABLISHED' : 'UNKNOWN';
      }
      shell.gotToolData = true;
    }
    if (d.claim_layer) {
      fields.status = String(d.claim_layer).toUpperCase();
      shell.gotToolData = true;
    }
    if (Array.isArray(d.hits) && d.hits.length && !fields.sources) {
      var srcs = [];
      d.hits.forEach(function (h) {
        if (h && h.source && srcs.indexOf(h.source) === -1) srcs.push(h.source);
      });
      if (srcs.length) fields.sources = srcs.slice(0, 3).join(' · ');
    }
    if (d.does_not_establish && d.does_not_establish.length) {
      fields.notEstablished = d.does_not_establish.slice(0, 2).join('; ');
    }
  }

  function handleEvent(evt, shell, accRef, fieldsRef) {
    if (!evt || typeof evt !== 'object') return;
    if (evt.type === 'text-delta' && evt.delta) {
      accRef.value += evt.delta;
      shell.text.textContent = accRef.value;
      scrollToEnd();
    } else if (evt.type === 'tool-result' || evt.type === 'data') {
      extractToolData(evt, shell, fieldsRef.value);
    } else if (Array.isArray(evt.parts)) {
      evt.parts.forEach(function (p) {
        if (p.type === 'text' && p.text) {
          accRef.value += p.text;
          shell.text.textContent = accRef.value;
        } else if (p.type === 'tool-result' || p.type === 'data') {
          extractToolData(p, shell, fieldsRef.value);
        }
      });
    }
  }

  function finish(shell, accRef, fieldsRef, history) {
    if (shell.finished) return; // honestFailure already rendered — do not overwrite
    shell.finished = true;
    if (!accRef.value && !shell.gotToolData) {
      honestFailure(shell, 'empty response');
    } else if (!shell.gotToolData) {
      // Answer arrived but no tool metadata — do NOT invent a claim status.
      var pending = shell.footer.querySelector('.oinio-status-pending');
      if (pending) pending.parentElement.remove();
      setStatusFooter(shell.footer, {
        sources: 'See response above; no structured tool data in stream',
      });
    } else {
      setStatusFooter(shell.footer, fieldsRef.value);
    }
    if (accRef.value) {
      history.push({ role: 'assistant', parts: [{ type: 'text', text: accRef.value }] });
    }
  }

  function ask(question) {
    if (busy || !question) return;
    busy = true;
    els.send.disabled = true;
    els.input.value = '';
    addUser(question);
    history.push({ role: 'user', parts: [{ type: 'text', text: question }] });

    var shell = addAssistantShell();
    var accRef = { value: '' };
    var fieldsRef = { value: { status: 'RETRIEVING…' } };
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 45000);

    fetch(AGENT_URL.replace(/\/$/, '') + AGENT_PATH + sessionId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
      signal: controller.signal,
    })
      .then(function (res) {
        clearTimeout(timeout);
        if (!res.ok || !res.body) throw new Error('HTTP ' + res.status);
        var reader = res.body.getReader();
        var decoder = new TextDecoder();
        var buffer = '';
        function pump() {
          return reader.read().then(function (chunk) {
            if (chunk.done) return;
            buffer += decoder.decode(chunk.value, { stream: true });
            var lines = buffer.split('\n');
            buffer = lines.pop();
            lines.forEach(function (line) {
              if (!line.startsWith('data:')) return;
              var payload = line.slice(5).trim();
              if (!payload || payload === '[DONE]') return;
              try {
                handleEvent(JSON.parse(payload), shell, accRef, fieldsRef);
              } catch (e) {
                /* ignore malformed keepalive lines */
              }
            });
            return pump();
          });
        }
        return pump();
      })
      .catch(function (err) {
        clearTimeout(timeout);
        if (!accRef.value) {
          shell.finished = true;
          honestFailure(
            shell,
            err && err.name === 'AbortError' ? 'timeout' : 'agent unreachable'
          );
        } else {
          // Partial answer then stream failure: remove the stale RETRIEVING…
          // row rather than leaving it pending forever.
          var pending = shell.footer.querySelector('.oinio-status-pending');
          if (pending) pending.parentElement.remove();
        }
      })
      .then(function () {
        finish(shell, accRef, fieldsRef, history);
        busy = false;
        els.send.disabled = false;
      });
  }

  els.openBtn.addEventListener('click', function () {
    els.panel.hidden = !els.panel.hidden;
    els.openBtn.textContent = els.panel.hidden ? 'ASK OINIO' : 'CLOSE OINIO';
    if (!els.panel.hidden) els.input.focus();
  });

  els.close.addEventListener('click', function () {
    els.panel.hidden = true;
    els.openBtn.textContent = 'ASK OINIO';
  });

  els.form.addEventListener('submit', function (e) {
    e.preventDefault();
    ask(els.input.value.trim());
  });

  Array.prototype.forEach.call(
    document.querySelectorAll('.oinio-example'),
    function (btn) {
      btn.addEventListener('click', function () {
        ask(btn.getAttribute('data-q'));
      });
    }
  );
})();
