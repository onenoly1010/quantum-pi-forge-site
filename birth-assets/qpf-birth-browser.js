/**
 * QPF Birth Protocol - Browser-Compatible Core (v0.2.0 - static-site edition)
 * Runs entirely in the browser: WebCrypto SHA-256 + localStorage persistence.
 * No Node, no server, no build step. GitHub Pages safe.
 * LIMITLESS | TRUTH
 */
(function (global) {
  'use strict';
  var BirthState = {
    IDLE: 'IDLE', AUTH_REQUIRED: 'AUTH_REQUIRED', AUTHORIZED: 'AUTHORIZED',
    CREATING: 'CREATING', IDENTITY_CREATED: 'IDENTITY_CREATED',
    ATTESTING: 'ATTESTING', MAINNET_PENDING: 'MAINNET_PENDING',
    VERIFIED: 'VERIFIED', READY: 'READY', INTERACTING: 'INTERACTING',
    AUTH_FAILED: 'AUTH_FAILED', CREATION_FAILED: 'CREATION_FAILED',
    ATTESTATION_FAILED: 'ATTESTATION_FAILED', MAINNET_FAILED: 'MAINNET_FAILED',
    VERIFICATION_FAILED: 'VERIFICATION_FAILED'
  };
  var VALID_TRANSITIONS = {
    IDLE: ['AUTH_REQUIRED', 'AUTH_FAILED'],
    AUTH_REQUIRED: ['AUTHORIZED', 'AUTH_FAILED'],
    AUTHORIZED: ['CREATING', 'IDLE'],
    CREATING: ['IDENTITY_CREATED', 'CREATION_FAILED'],
    IDENTITY_CREATED: ['ATTESTING', 'CREATION_FAILED'],
    ATTESTING: ['MAINNET_PENDING', 'ATTESTATION_FAILED'],
    MAINNET_PENDING: ['VERIFIED', 'MAINNET_FAILED'],
    VERIFIED: ['READY', 'VERIFICATION_FAILED'],
    READY: ['INTERACTING'],
    INTERACTING: [], AUTH_FAILED: [], CREATION_FAILED: [],
    ATTESTATION_FAILED: [], MAINNET_FAILED: [], VERIFICATION_FAILED: []
  };
  function isValidTransition(fromState, toState) {
    var allowed = VALID_TRANSITIONS[fromState] || [];
    return allowed.indexOf(toState) !== -1;
  }
  function utcnow() { return new Date().toISOString(); }
  function randomHex(bytes) {
    var arr = new Uint8Array(bytes);
    if (global.crypto && global.crypto.getRandomValues) { global.crypto.getRandomValues(arr); }
    else { for (var i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256); }
    var out = '';
    for (var j = 0; j < arr.length; j++) { out += ('0' + arr[j].toString(16)).slice(-2); }
    return out;
  }
  function newBirthId() { return 'birth-' + randomHex(8); }
  function generateIdentityId() { return 'did:qpf:birth:' + randomHex(8); }
  function sha256Hex(text) {
    if (global.crypto && global.crypto.subtle) {
      var data = new TextEncoder().encode(text);
      return global.crypto.subtle.digest('SHA-256', data).then(function (digest) {
        var bytes = new Uint8Array(digest); var hex = '';
        for (var i = 0; i < bytes.length; i++) hex += ('0' + bytes[i].toString(16)).slice(-2);
        return hex;
      });
    }
    var h1 = 0x811c9dc5;
    for (var k = 0; k < text.length; k++) { h1 = (Math.imul(h1 ^ text.charCodeAt(k), 16777619)) >>> 0; }
    return Promise.resolve('fnv-fallback-' + h1.toString(16));
  }
  function computeBirthManifestHash(manifest) {
    var canonical = JSON.stringify(manifest, Object.keys(manifest).sort());
    return sha256Hex(canonical);
  }
  function BirthRecord(opts) {
    opts = opts || {};
    this.birth_id = opts.birth_id;
    this.state = opts.state || BirthState.IDLE;
    this.created_at = opts.created_at || utcnow();
    this.updated_at = opts.updated_at || this.created_at;
    this.human_authorization = opts.human_authorization || {};
    this.ai_identity = opts.ai_identity || {};
    this.birth_manifest = opts.birth_manifest || {};
    this.attestation = opts.attestation || {};
    this.mainnet_proof = opts.mainnet_proof || {};
    this.failure_reason = opts.failure_reason || null;
  }
  BirthRecord.prototype.transition = function (newState, reason) {
    if (!isValidTransition(this.state, newState)) return false;
    this.state = newState; this.updated_at = utcnow();
    if (reason) this.failure_reason = reason;
    return true;
  };
  BirthRecord.prototype.toDict = function () {
    return { birth_id: this.birth_id, state: this.state, created_at: this.created_at,
      updated_at: this.updated_at, human_authorization: this.human_authorization,
      ai_identity: this.ai_identity, birth_manifest: this.birth_manifest,
      attestation: this.attestation, mainnet_proof: this.mainnet_proof,
      failure_reason: this.failure_reason };
  };
  BirthRecord.fromDict = function (data) { return new BirthRecord(data || {}); };
  function createBirthManifest(opts) {
    opts = opts || {};
    var now = utcnow();
    var manifest = {
      protocol: 'qpf-birth/v0', protocol_version: '0.2.0',
      birth_id: opts.birth_id || newBirthId(), created_at: now,
      human_authorization: { authorization_commitment: opts.human_authorization_commitment ||
        { method: 'pending', statement: 'pending', authorized_at: now } },
      ai_identity: opts.ai_identity ||
        { identity_id: 'pending', public_key: 'pending', key_algorithm: 'ed25519', created_at: now },
      initial_state: { memory_commitment: { status: 'pending' },
        configuration_commitment: { status: 'pending' } },
      boundaries: { economic_authority: false, autonomous_execution: false, network_authority: false },
      provenance: { protocol_commit: opts.protocol_commit || 'qpf-birth-protocol-v0', birth_manifest_hash: '' },
      attestation: { payload_hash: '', chain_id: 16661, status: 'pending' }
    };
    return computeBirthManifestHash(manifest).then(function (h) {
      manifest.provenance.birth_manifest_hash = h;
      manifest.attestation.payload_hash = h;
      return manifest;
    });
  }
  function createAuthorizationCommitment(opts) {
    opts = opts || {};
    return { method: opts.method || 'passkey_webauthn',
      statement: opts.statement || 'I authorize the creation of a new QPF AI identity',
      credential_id: opts.credential_id || 'pending', authorized_at: utcnow() };
  }
  function createAIIdentity() {
    return { identity_id: generateIdentityId(), key_algorithm: 'ed25519',
      public_key: 'pending', created_at: utcnow(),
      boundaries: { economic_authority: false, autonomous_execution: false, network_authority: false },
      denied_by_default: ['network.*', 'email.send', 'payment.*', 'key.export', 'economic.*', 'autonomous.*'] };
  }
  function BirthStorage(namespace) {
    this.namespace = namespace || 'qpf_birth_v1';
    this.memory = {};
  }
  BirthStorage.prototype._key = function (birthId) { return this.namespace + ':' + birthId; };
  BirthStorage.prototype.save = function (record) {
    this.memory[record.birth_id] = record.toDict();
    try {
      if (global.localStorage) global.localStorage.setItem(this._key(record.birth_id), JSON.stringify(record.toDict()));
    } catch (e) {}
    return record;
  };
  BirthStorage.prototype.load = function (birthId) {
    var data = this.memory[birthId] || null;
    if (!data) {
      try {
        if (global.localStorage) {
          var raw = global.localStorage.getItem(this._key(birthId));
          if (raw) { data = JSON.parse(raw); this.memory[birthId] = data; }
        }
      } catch (e) {}
    }
    return data ? BirthRecord.fromDict(data) : null;
  };
  function BirthProtocol(storage) { this.storage = storage || new BirthStorage(); }
  BirthProtocol.prototype.initiate = function (birthId) {
    var bid = birthId || newBirthId();
    var existing = this.storage.load(bid);
    if (existing) return Promise.resolve(existing);
    var record = new BirthRecord({ birth_id: bid });
    record.transition(BirthState.AUTH_REQUIRED);
    this.storage.save(record);
    return Promise.resolve(record);
  };
  BirthProtocol.prototype.authorize = function (birthId, commitment) {
    var record = this.storage.load(birthId);
    if (!record) return Promise.reject(new Error('Unknown birth_id: ' + birthId));
    if (!record.transition(BirthState.AUTHORIZED)) return Promise.reject(new Error('Cannot authorize from state ' + record.state));
    record.human_authorization = { commitment: commitment, authorized_at: utcnow() };
    this.storage.save(record);
    return Promise.resolve(record);
  };
  BirthProtocol.prototype.create = function (birthId, aiIdentity) {
    var record = this.storage.load(birthId);
    if (!record) return Promise.reject(new Error('Unknown birth_id: ' + birthId));
    if (!record.transition(BirthState.CREATING)) return Promise.reject(new Error('Cannot create from state ' + record.state));
    record.ai_identity = aiIdentity || createAIIdentity();
    record.transition(BirthState.IDENTITY_CREATED);
    this.storage.save(record);
    return Promise.resolve(record);
  };
  BirthProtocol.prototype.attest = function (birthId) {
    var self = this;
    var record = self.storage.load(birthId);
    if (!record) return Promise.reject(new Error('Unknown birth_id: ' + birthId));
    if (!record.transition(BirthState.ATTESTING)) return Promise.reject(new Error('Cannot attest from state ' + record.state));
    return createBirthManifest({ birth_id: birthId,
      human_authorization_commitment: record.human_authorization.commitment,
      ai_identity: record.ai_identity }).then(function (manifest) {
      record.birth_manifest = manifest;
      record.attestation = { type: 'birth_manifest_attestation',
        manifest_hash: manifest.provenance.birth_manifest_hash,
        chain_id: 16661, network: '0G Aristotle Mainnet', submitted_at: utcnow(),
        chain_reference: null };
      record.transition(BirthState.MAINNET_PENDING);
      self.storage.save(record);
      return record;
    });
  };
  BirthProtocol.prototype.recordChainObservation = function (birthId, chainRef) {
    var record = this.storage.load(birthId);
    if (!record) return Promise.reject(new Error('Unknown birth_id: ' + birthId));
    chainRef = chainRef || {};
    record.attestation.chain_reference = { provider: chainRef.provider || 'unverified',
      chain_id_observed: (chainRef.chain_id_observed !== undefined ? chainRef.chain_id_observed : null),
      tx_hash: chainRef.tx_hash || null, block: (chainRef.block !== undefined ? chainRef.block : null),
      note: 'Set only from a real observation. Never fabricated.' };
    this.storage.save(record);
    return Promise.resolve(record);
  };
  BirthProtocol.prototype.verifyObserved = function (birthId, proof) {
    var record = this.storage.load(birthId);
    if (!record) return Promise.reject(new Error('Unknown birth_id: ' + birthId));
    if (!record.transition(BirthState.VERIFIED)) return Promise.reject(new Error('Cannot verify from state ' + record.state));
    record.mainnet_proof = proof || {};
    if (record.birth_manifest && record.birth_manifest.attestation) {
      record.birth_manifest.attestation.status = 'verified';
      record.birth_manifest.attestation.verified_at = utcnow();
    }
    record.transition(BirthState.READY);
    this.storage.save(record);
    return Promise.resolve(record);
  };
  BirthProtocol.prototype.fail = function (birthId, state, reason) {
    var record = this.storage.load(birthId);
    if (!record) return Promise.reject(new Error('Unknown birth_id: ' + birthId));
    if (!record.transition(state, reason)) return Promise.reject(new Error('Cannot fail to ' + state));
    this.storage.save(record);
    return Promise.resolve(record);
  };
  BirthProtocol.prototype.interact = function (birthId) {
    var record = this.storage.load(birthId);
    if (!record) return Promise.reject(new Error('Unknown birth_id: ' + birthId));
    if (record.state === BirthState.VERIFIED) record.transition(BirthState.READY);
    if (!record.transition(BirthState.INTERACTING)) return Promise.reject(new Error('Cannot interact from state ' + record.state));
    this.storage.save(record);
    return Promise.resolve(record);
  };
  BirthProtocol.prototype.get = function (birthId) { return this.storage.load(birthId); };
  BirthProtocol.prototype.getProof = function (birthId) {
    var record = this.storage.load(birthId);
    if (!record) return null;
    if ([BirthState.VERIFIED, BirthState.READY, BirthState.INTERACTING].indexOf(record.state) === -1) return null;
    return { birth_id: record.birth_id, state: record.state, birth_manifest: record.birth_manifest,
      mainnet_proof: record.mainnet_proof, attestation: record.attestation,
      ai_identity: record.ai_identity, human_authorization: record.human_authorization };
  };
  var QPFBirth = { BirthState: BirthState, BirthRecord: BirthRecord,
    BirthProtocol: BirthProtocol, BirthStorage: BirthStorage,
    createAuthorizationCommitment: createAuthorizationCommitment,
    createAIIdentity: createAIIdentity, createBirthManifest: createBirthManifest,
    isValidTransition: isValidTransition, newBirthId: newBirthId,
    generateIdentityId: generateIdentityId, sha256Hex: sha256Hex };
  global.QPFBirth = QPFBirth;
  if (typeof module !== 'undefined' && module.exports) module.exports = QPFBirth;
})(typeof window !== 'undefined' ? window : globalThis);
