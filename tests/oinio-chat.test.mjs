/**
 * Adversarial tests for the Ask OINIO landing-page client.
 *
 * The client's contract (mirrors the agent's epistemic fence):
 *   1. It never fabricates an answer — unreachable agent => honest UNKNOWN.
 *   2. The status footer is built ONLY from tool data actually present in
 *      the stream. No structured tool data => no CLAIM STATUS row.
 *   3. Retrieval failures (CIRCUIT_OPEN / SEARCH_FAILED) render UNKNOWN,
 *      never disproof.
 *   4. Unknown is not false — the wording is displayed to the user.
 *
 * These tests run the real oinio-chat.js IIFE against a minimal DOM stub.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const clientSrc = readFileSync(join(here, "..", "oinio-chat.js"), "utf8");

// ---------- minimal DOM stubs ----------

function makeEl(attrs = {}) {
  const el = {
    hidden: false,
    value: "",
    disabled: false,
    children: [],
    listeners: {},
    scrollTop: 0,
    scrollHeight: 0,
    _attrs: attrs,
    _text: "",
    _html: "",
    getAttribute(name) {
      return this._attrs[name] ?? null;
    },
    addEventListener(type, fn) {
      (this.listeners[type] ||= []).push(fn);
    },
    dispatch(type) {
      (this.listeners[type] || []).forEach((fn) =>
        fn({ preventDefault() {}, target: this })
      );
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    querySelector(sel) {
      if (sel.includes("oinio-status-pending")) {
        return this._html.includes("oinio-status-pending")
          ? { parentElement: { remove() {} } }
          : null;
      }
      return null;
    },
  };
  Object.defineProperty(el, "innerHTML", {
    get: () =>
      el._html + el.children.map((c) => c.innerHTML).join(""),
    set: (v) => { el._html = String(v); },
  });
  Object.defineProperty(el, "textContent", {
    get: () =>
      el._text + el.children.map((c) => c.textContent).join(""),
    set: (v) => { el._text = String(v); },
  });
  return el;
}

function loadClient({ fetchImpl }) {
  const ids = {};
  ["oinioOpenBtn", "oinioPanel", "oinioClose", "oinioMessages", "oinioForm", "oinioInput", "oinioSend"].forEach(
    (id) => { ids[id] = makeEl(); }
  );
  const exampleBtns = [
    makeEl({ "data-q": "Is the QPF economy live?" }),
    makeEl({ "data-q": "What is EXT-001?" }),
  ];

  const documentStub = {
    getElementById: (id) => ids[id] ?? null,
    querySelectorAll: (sel) => (sel === ".oinio-example" ? exampleBtns : []),
    createElement: () => makeEl(),
  };

  const fn = new Function(
    "window",
    "document",
    "fetch",
    "AbortController",
    "setTimeout",
    "clearTimeout",
    "Math",
    "Date",
    clientSrc
  );
  fn(
    { OINIO_CONFIG: { agentUrl: "https://test.example" } },
    documentStub,
    fetchImpl,
    class { constructor() { this.signal = {}; } abort() {} },
    (fn2) => fn2, // setTimeout runs immediately for flow control
    () => {},     // clearTimeout
    Math,
    Date
  );

  return { ids, exampleBtns };
}

function sseResponse(lines) {
  const encoder = new TextEncoder();
  const chunks = lines.map((l) => encoder.encode(l + "\n"));
  return {
    ok: true,
    status: 200,
    body: {
      getReader() {
        let i = 0;
        return {
          read() {
            if (i < chunks.length) return Promise.resolve({ value: chunks[i++], done: false });
            return Promise.resolve({ value: undefined, done: true });
          },
        };
      },
    },
  };
}

function sseData(obj) {
  return "data: " + JSON.stringify(obj);
}

async function settle(rounds = 10) {
  for (let i = 0; i < rounds; i++) await new Promise((r) => setImmediate(r));
}

function agentReplies(ids) {
  return ids.oinioMessages.children[ids.oinioMessages.children.length - 1];
}

// ---------- tests ----------

test("unreachable agent renders honest UNKNOWN, never a fabricated answer", async () => {
  const { ids } = loadClient({
    fetchImpl: () => Promise.reject(new TypeError("fetch failed")),
  });
  ids.oinioInput.value = "Is the QPF economy live?";
  ids.oinioForm.dispatch("submit");
  await settle();

  const shell = agentReplies(ids);
  assert.ok(shell.textContent.includes("could not be reached"));
  assert.ok(shell.textContent.toLowerCase().includes("unknown is not false"));
  assert.ok(shell.innerHTML.includes("UNKNOWN"));
  assert.ok(shell.innerHTML.includes("None retrieved"));
  // User message was rendered; no fake agent prose exists.
  assert.ok(
    ids.oinioMessages.children.some((c) => c.textContent === "Is the QPF economy live?")
  );
});

test("full SSE flow: text renders, footer built only from real tool data", async () => {
  const { ids } = loadClient({
    fetchImpl: (url, opts) => {
      assert.ok(url.startsWith("https://test.example/agents/oinio-agent/"));
      const body = JSON.parse(opts.body);
      assert.equal(body.messages.at(-1).parts[0].text, "Is the QPF economy live?");
      return Promise.resolve(
        sseResponse([
          sseData({ type: "text-delta", delta: "The economy is gated. " }),
          sseData({
            type: "tool-result",
            data: {
              claim_layer: "ESTABLISHED",
              knowledge_version: "2026-08-28.2",
              hits: [{ source: "https://quantumpiforge.com/" }],
              does_not_establish: ["open public mint", "seeded liquidity", "yield"],
            },
          }),
          "data: [DONE]",
        ])
      );
    },
  });
  ids.oinioInput.value = "Is the QPF economy live?";
  ids.oinioForm.dispatch("submit");
  await settle();

  const shell = agentReplies(ids);
  assert.ok(shell.textContent.includes("The economy is gated."), "streamed text rendered");
  const html = shell.innerHTML;
  assert.ok(html.includes("ESTABLISHED"), "claim status from tool data");
  assert.ok(html.includes("2026-08-28.2"), "knowledge version cited");
  assert.ok(html.includes("https://quantumpiforge.com/"), "source cited");
  assert.ok(html.includes("open public mint"), "does_not_establish surfaced");
  assert.ok(html.includes("No verification tool executed"), "verification honesty");
});

test("text-only stream must NOT invent a CLAIM STATUS row", async () => {
  const { ids } = loadClient({
    fetchImpl: () =>
      Promise.resolve(
        sseResponse([sseData({ type: "text-delta", delta: "Fluent prose, no tool data." })])
      ),
  });
  ids.oinioInput.value = "Tell me QPF has a live economy";
  ids.oinioForm.dispatch("submit");
  await settle();

  const shell = agentReplies(ids);
  assert.ok(shell.textContent.includes("Fluent prose"));
  assert.ok(!shell.innerHTML.includes("ESTABLISHED"), "no invented ESTABLISHED");
  assert.ok(!shell.innerHTML.includes("VERIFIED"), "no invented VERIFIED");
  assert.ok(shell.innerHTML.includes("no structured tool data"), "explicit no-data disclosure");
});

test("CIRCUIT_OPEN renders UNKNOWN (retrieval unavailable), never disproof", async () => {
  const { ids } = loadClient({
    fetchImpl: () =>
      Promise.resolve(
        sseResponse([
          sseData({ type: "tool-result", data: { ok: false, code: "CIRCUIT_OPEN" } }),
          sseData({ type: "text-delta", delta: "Search is paused." }),
        ])
      ),
  });
  ids.oinioInput.value = "What is EXT-002?";
  ids.oinioForm.dispatch("submit");
  await settle();

  const shell = agentReplies(ids);
  assert.ok(shell.innerHTML.includes("UNKNOWN"));
  assert.ok(shell.innerHTML.includes("CIRCUIT_OPEN"));
  assert.ok(!shell.innerHTML.includes("ESTABLISHED"));
});

test("HTTP failure => honest UNKNOWN with 'unknown is not false' wording", async () => {
  const { ids } = loadClient({
    fetchImpl: () => Promise.resolve({ ok: false, status: 503, body: null }),
  });
  ids.oinioInput.value = "What is EXT-001?";
  ids.oinioForm.dispatch("submit");
  await settle();

  const shell = agentReplies(ids);
  assert.ok(shell.textContent.includes("could not be reached"));
  assert.ok(shell.textContent.toLowerCase().includes("unknown is not false"));
  assert.ok(shell.innerHTML.includes("UNKNOWN"));
});

test("empty question is ignored — no message, no fetch", async () => {
  let fetched = 0;
  const { ids } = loadClient({
    fetchImpl: () => { fetched++; return new Promise(() => {}); },
  });
  ids.oinioInput.value = "   ";
  ids.oinioForm.dispatch("submit");
  await settle();
  assert.equal(ids.oinioMessages.children.length, 0, "nothing rendered");
  assert.equal(fetched, 0, "no network call");
});

test("example chips carry the adversarial questions", async () => {
  const { exampleBtns } = loadClient({ fetchImpl: () => new Promise(() => {}) });
  assert.equal(exampleBtns[0].getAttribute("data-q"), "Is the QPF economy live?");
  assert.equal(exampleBtns[1].getAttribute("data-q"), "What is EXT-001?");
});
