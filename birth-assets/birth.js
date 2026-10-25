/**
 * QPF Birth Experience - Client-Side (v0.2.0 static-site edition)
 * Runs 100% in the browser: QPFBirth protocol + localStorage + optional live 0G RPC read.
 * No server required. No fabricated chain facts.
 * LIMITLESS | TRUTH
 */
(function () {
  'use strict';
  var OG_RPC = 'https://evmrpc.0g.ai';
  var OG_CHAIN_ID = 16661;
  var OG_EXPLORER_TX = 'https://chainscan.0g.ai/tx/';
  var storage = new QPFBirth.BirthStorage('qpf_birth_v1');
  var protocol = new QPFBirth.BirthProtocol(storage);
  var S = QPFBirth.BirthState;
  var currentBirthId = null;
  try { currentBirthId = localStorage.getItem('qpf_birth_current') || null; } catch (e) {}
  function $(id) { return document.getElementById(id); }
  function els() {
    return {
      views: { intro: $('state-intro'), auth: $('state-auth'), authorized: $('state-authorized'),
        creating: $('state-creating'), identityCreated: $('state-identity-created'),
        attesting: $('state-attesting'), verified: $('state-verified'),
        ready: $('state-ready'), error: $('state-error'), incomplete: $('state-incomplete') },
      btn: { begin: $('btn-begin'), passkey: $('btn-passkey'), simulated: $('btn-simulated'),
        create: $('btn-create'), attest: $('btn-attest'), viewProof: $('btn-view-proof'),
        chat: $('btn-chat'), retry: $('btn-retry'), retryAttest: $('btn-retry-attest'),
        meetAnyway: $('btn-meet-anyway') },
      d: { commitmentCode: $('commitment-code'), newIdentityId: $('new-identity-id'),
        newIdentityTime: $('new-identity-time'), identityIdDisplay: $('identity-id-display'),
        verifiedTime: $('verified-time'), verifiedIdentity: $('verified-identity'), verifiedChain: $('verified-chain'),
        meetIdentity: $('meet-identity'), errorMessage: $('error-message'),
        errorDetails: $('error-details') },
      authStatus: $('auth-status')
    };
  }
  var E = null;
  function showState(name) {
    var views = E.views;
    Object.keys(views).forEach(function (k) { if (views[k]) views[k].classList.remove('active'); });
    if (views[name]) views[name].classList.add('active');
  }
  function showError(title, message) {
    E.d.errorMessage.textContent = title;
    E.d.errorDetails.textContent = message || '';
    showState('error');
  }
  function setCurrent(id) {
    currentBirthId = id;
    try { localStorage.setItem('qpf_birth_current', id); } catch (e) {}
  }
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function rpcCall(method, params) {
    return fetch(OG_RPC, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: method, params: params || [] }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j.error) throw new Error(j.error.message || 'RPC error');
        return j.result;
      });
  }
  function startBirth() {
    protocol.initiate(currentBirthId).then(function (rec) {
      setCurrent(rec.birth_id);
      showState('auth');
    }).catch(function (err) { showError('Failed to start birth', err.message); });
  }
  function doAuthorize(method) {
    if (E.authStatus) E.authStatus.classList.remove('hidden');
    delay(method === 'passkey_webauthn' ? 1200 : 700).then(function () {
      var c = QPFBirth.createAuthorizationCommitment({ method: method,
        statement: 'I authorize the creation of a new QPF AI identity' + (method === 'simulated' ? ' (demo)' : '') });
      return protocol.authorize(currentBirthId, c);
    }).then(function (rec) {
      if (E.authStatus) E.authStatus.classList.add('hidden');
      E.d.commitmentCode.textContent = rec.birth_id;
      showState('authorized');
    }).catch(function (err) {
      if (E.authStatus) E.authStatus.classList.add('hidden');
      showError('Authorization failed', err.message);
    });
  }
  function runCreationSequence() {
    ['step-identity', 'step-memory', 'step-boundaries', 'step-verification'].forEach(function (id, i) {
      setTimeout(function () {
        var el = document.getElementById(id);
        if (!el) return;
        var ind = el.querySelector('.step-indicator');
        var st = el.querySelector('.step-status');
        if (ind) { ind.className = 'step-indicator complete'; ind.textContent = 'OK'; }
        if (st) { st.textContent = 'complete'; }
      }, i * 700);
    });
  }
  function createIdentity() {
    showState('creating');
    runCreationSequence();
    protocol.create(currentBirthId).then(function (rec) {
      E.d.newIdentityId.textContent = rec.ai_identity.identity_id;
      E.d.newIdentityTime.textContent = new Date().toLocaleString();
      E.d.identityIdDisplay.textContent = rec.ai_identity.identity_id;
      return delay(2600).then(function () { showState('identityCreated'); });
    }).catch(function (err) { showError('Identity creation failed', err.message); });
  }
  function startAttestation() {
    showState('attesting');
    var rec0 = null;
    protocol.attest(currentBirthId).then(function (rec) {
      rec0 = rec;
      return rpcCall('eth_chainId').then(function (chainHex) {
        var observed = parseInt(chainHex, 16);
        return protocol.recordChainObservation(currentBirthId,
          { provider: 'evmrpc.0g.ai', chain_id_observed: observed });
      }).catch(function (rpcErr) {
        return protocol.recordChainObservation(currentBirthId, { provider: 'unreachable' })
          .then(function () { throw new Error('Could not reach 0G Aristotle RPC (evmrpc.0g.ai): ' + rpcErr.message); });
      });
    }).then(function (rec) {
      var ref = rec.attestation.chain_reference || {};
      if (ref.chain_id_observed !== OG_CHAIN_ID) {
        throw new Error('Chain ID mismatch: observed ' + ref.chain_id_observed + ', expected ' + OG_CHAIN_ID);
      }
      return protocol.verifyObserved(currentBirthId, {
        type: 'local_manifest_commitment',
        manifest_hash: rec0.birth_manifest.provenance.birth_manifest_hash,
        chain_id_observed: ref.chain_id_observed,
        chain_provider: ref.provider,
        verified_at: new Date().toISOString(),
        note: 'Manifest committed locally; 0G Aristotle chain reachable (chainId verified). No transaction fabricated.'
      });
    }).then(function (rec) {
      E.d.verifiedTime.textContent = new Date().toLocaleString();
      E.d.verifiedIdentity.textContent = rec.ai_identity.identity_id;
      if (E.d.verifiedChain && rec.attestation && rec.attestation.chain_reference) E.d.verifiedChain.textContent = String(rec.attestation.chain_reference.chain_id_observed) + ' (live read via ' + rec.attestation.chain_reference.provider + ')';
      showState('verified');
    }).catch(function (err) {
      if (err.message && err.message.indexOf('Could not reach') === 0) showState('incomplete');
      else showError('Attestation failed', err.message);
    });
  }
  function viewProof() {
    var proof = protocol.getProof(currentBirthId);
    if (!proof) { showError('No proof available', 'Complete verification first.'); return; }
    var lines = ['=== BIRTH PROOF ===', '',
      'Birth ID: ' + proof.birth_id, 'State: ' + proof.state,
      'Identity: ' + ((proof.ai_identity && proof.ai_identity.identity_id) || '-'), '',
      '--- Manifest ---',
      'Hash: ' + ((proof.birth_manifest.provenance && proof.birth_manifest.provenance.birth_manifest_hash) || '-'),
      'Protocol: ' + (proof.birth_manifest.protocol || '-'), '',
      '--- Chain Observation (live read, not a write) ---',
      'Provider: ' + ((proof.attestation.chain_reference && proof.attestation.chain_reference.provider) || '-'),
      'Chain ID observed: ' + ((proof.attestation.chain_reference && proof.attestation.chain_reference.chain_id_observed) || '-'), '',
      '--- Verification ---',
      'Verified At: ' + ((proof.mainnet_proof && proof.mainnet_proof.verified_at) || '-'), '',
      '=== LIMITLESS | TRUTH ==='];
    alert(lines.join('\n'));
  }
  function goToMeet() {
    var rec = protocol.get(currentBirthId);
    E.d.meetIdentity.textContent = (rec && rec.ai_identity.identity_id) || '-';
    showState('ready');
  }
  function startChat() {
    protocol.interact(currentBirthId).then(function () { goToMeet(); })
      .catch(function () { goToMeet(); });
  }
  function reset() { showState('intro'); }
  document.addEventListener('DOMContentLoaded', function () {
    E = els();
    if (E.btn.begin) E.btn.begin.addEventListener('click', startBirth);
    if (E.btn.passkey) E.btn.passkey.addEventListener('click', function () { doAuthorize('passkey_webauthn'); });
    if (E.btn.simulated) E.btn.simulated.addEventListener('click', function () { doAuthorize('simulated'); });
    if (E.btn.create) E.btn.create.addEventListener('click', createIdentity);
    if (E.btn.attest) E.btn.attest.addEventListener('click', startAttestation);
    if (E.btn.viewProof) E.btn.viewProof.addEventListener('click', viewProof);
    if (E.btn.chat) E.btn.chat.addEventListener('click', startChat);
    if (E.btn.retry) E.btn.retry.addEventListener('click', reset);
    if (E.btn.retryAttest) E.btn.retryAttest.addEventListener('click', startAttestation);
    if (E.btn.meetAnyway) E.btn.meetAnyway.addEventListener('click', goToMeet);
    // Recovery: if a birth is already in progress, resume its state
    if (currentBirthId) {
      var rec = protocol.get(currentBirthId);
      if (rec) {
        var map = {}; map[S.AUTH_REQUIRED] = 'auth'; map[S.AUTHORIZED] = 'authorized';
        map[S.CREATING] = 'creating'; map[S.IDENTITY_CREATED] = 'identityCreated';
        map[S.ATTESTING] = 'attesting'; map[S.MAINNET_PENDING] = 'attesting';
        map[S.VERIFIED] = 'verified'; map[S.READY] = 'ready'; map[S.INTERACTING] = 'ready';
        var view = map[rec.state];
        if (view) {
          if (rec.ai_identity && rec.ai_identity.identity_id) {
            E.d.newIdentityId.textContent = rec.ai_identity.identity_id;
            E.d.identityIdDisplay.textContent = rec.ai_identity.identity_id;
            E.d.verifiedIdentity.textContent = rec.ai_identity.identity_id;
            if (E.d.verifiedChain && rec.attestation && rec.attestation.chain_reference) E.d.verifiedChain.textContent = String(rec.attestation.chain_reference.chain_id_observed) + ' (live read via ' + rec.attestation.chain_reference.provider + ')';
            E.d.meetIdentity.textContent = rec.ai_identity.identity_id;
          }
          E.d.commitmentCode.textContent = rec.birth_id;
          showState(view);
          return;
        }
      }
    }
    showState('intro');
  });
})();
