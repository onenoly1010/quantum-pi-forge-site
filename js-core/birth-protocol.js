// QPF Birth Protocol - JavaScript Implementation
// Headless AI birth state machine for the "Watch Your AI Come To Life" experience
//
// This is the protocol reality. The frontend is the experience.
// State progression:
//   IDLE -> AUTH_REQUIRED -> AUTHORIZED -> CREATING -> IDENTITY_CREATED
//   -> ATTESTING -> MAINNET_PENDING -> VERIFIED -> READY -> INTERACTING
//
// LIMITLESS | TRUTH

const crypto = require('crypto');

// =============================================================================
// STATE MACHINE
// =============================================================================

const BirthState = {
  IDLE: 'IDLE',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTHORIZED: 'AUTHORIZED',
  CREATING: 'CREATING',
  IDENTITY_CREATED: 'IDENTITY_CREATED',
  ATTESTING: 'ATTESTING',
  MAINNET_PENDING: 'MAINNET_PENDING',
  VERIFIED: 'VERIFIED',
  READY: 'READY',
  INTERACTING: 'INTERACTING',
  
  // Failure states
  AUTH_FAILED: 'AUTH_FAILED',
  CREATION_FAILED: 'CREATION_FAILED',
  ATTESTATION_FAILED: 'ATTESTATION_FAILED',
  MAINNET_FAILED: 'MAINNET_FAILED',
  VERIFICATION_FAILED: 'VERIFICATION_FAILED',
};

const VALID_TRANSITIONS = {
  [BirthState.IDLE]: new Set([BirthState.AUTH_REQUIRED, BirthState.AUTH_FAILED]),
  [BirthState.AUTH_REQUIRED]: new Set([BirthState.AUTHORIZED, BirthState.AUTH_FAILED]),
  [BirthState.AUTHORIZED]: new Set([BirthState.CREATING, BirthState.IDLE]),
  [BirthState.CREATING]: new Set([BirthState.IDENTITY_CREATED, BirthState.CREATION_FAILED]),
  [BirthState.IDENTITY_CREATED]: new Set([BirthState.ATTESTING, BirthState.CREATION_FAILED]),
  [BirthState.ATTESTING]: new Set([BirthState.MAINNET_PENDING, BirthState.ATTESTATION_FAILED]),
  [BirthState.MAINNET_PENDING]: new Set([BirthState.VERIFIED, BirthState.MAINNET_FAILED]),
  [BirthState.VERIFIED]: new Set([BirthState.READY, BirthState.VERIFICATION_FAILED]),
  [BirthState.READY]: new Set([BirthState.INTERACTING]),
  [BirthState.INTERACTING]: new Set(), // Terminal state
  // Failure states are terminal
  [BirthState.AUTH_FAILED]: new Set(),
  [BirthState.CREATION_FAILED]: new Set(),
  [BirthState.ATTESTATION_FAILED]: new Set(),
  [BirthState.MAINNET_FAILED]: new Set(),
  [BirthState.VERIFICATION_FAILED]: new Set(),
};

function isValidTransition(fromState, toState) {
  return VALID_TRANSITIONS[fromState]?.has(toState) || false;
}

// =============================================================================
// UTILITIES
// =============================================================================

function utcnow() {
  return new Date().toISOString();
}

function newBirthId() {
  return `birth-${crypto.randomBytes(8).toString('hex')}`;
}

function computeBirthManifestHash(manifest) {
  const canonical = JSON.stringify(manifest, Object.keys(manifest).sort());
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

function generateIdentityId() {
  return `did:qpf:birth:${crypto.randomBytes(8).toString('hex')}`;
}

// =============================================================================
// BIRTH RECORD
// =============================================================================

class BirthRecord {
  constructor({
    birth_id,
    state = BirthState.IDLE,
    human_authorization = null,
    ai_identity = null,
    birth_manifest = null,
    attestation = null,
    mainnet_proof = null,
    failure_reason = null,
  } = {}) {
    this.birth_id = birth_id;
    this.state = state;
    this.created_at = utcnow();
    this.updated_at = this.created_at;
    this.human_authorization = human_authorization || {};
    this.ai_identity = ai_identity || {};
    this.birth_manifest = birth_manifest || {};
    this.attestation = attestation || {};
    this.mainnet_proof = mainnet_proof || {};
    this.failure_reason = failure_reason;
  }
  
  transition(newState, reason = null) {
    if (!isValidTransition(this.state, newState)) {
      return false;
    }
    this.state = newState;
    this.updated_at = utcnow();
    if (reason) {
      this.failure_reason = reason;
    }
    return true;
  }
  
  toDict() {
    return {
      birth_id: this.birth_id,
      state: this.state,
      created_at: this.created_at,
      updated_at: this.updated_at,
      human_authorization: this.human_authorization,
      ai_identity: this.ai_identity,
      birth_manifest: this.birth_manifest,
      attestation: this.attestation,
      mainnet_proof: this.mainnet_proof,
      failure_reason: this.failure_reason,
    };
  }
  
  static fromDict(data) {
    const record = new BirthRecord({
      birth_id: data.birth_id,
      state: data.state,
      human_authorization: data.human_authorization || {},
      ai_identity: data.ai_identity || {},
      birth_manifest: data.birth_manifest || {},
      attestation: data.attestation || {},
      mainnet_proof: data.mainnet_proof || {},
      failure_reason: data.failure_reason,
    });
    record.created_at = data.created_at || utcnow();
    record.updated_at = data.updated_at || utcnow();
    return record;
  }
  
  isTerminal() {
    return [
      BirthState.INTERACTING,
      BirthState.AUTH_FAILED,
      BirthState.CREATION_FAILED,
      BirthState.ATTESTATION_FAILED,
      BirthState.MAINNET_FAILED,
      BirthState.VERIFICATION_FAILED,
    ].includes(this.state);
  }
}

// =============================================================================
// BIRTH MANIFEST
// =============================================================================

function createBirthManifest({
  birth_id,
  human_authorization_commitment,
  ai_identity,
  protocol_commit = 'qpf-birth-protocol-v0',
} = {}) {
  const now = utcnow();
  
  const manifest = {
    protocol: 'qpf-birth/v0',
    protocol_version: '0.1.0',
    birth_id: birth_id || newBirthId(),
    created_at: now,
    human_authorization: {
      authorization_commitment: human_authorization_commitment || {
        method: 'pending',
        statement: 'pending',
        authorized_at: now,
      },
    },
    ai_identity: ai_identity || {
      identity_id: 'pending',
      public_key: 'pending',
      key_algorithm: 'ed25519',
      created_at: now,
    },
    initial_state: {
      memory_commitment: { status: 'pending' },
      configuration_commitment: { status: 'pending' },
    },
    boundaries: {
      economic_authority: false,
      autonomous_execution: false,
      network_authority: false,
    },
    provenance: {
      protocol_commit: protocol_commit,
      birth_manifest_hash: '',
    },
    attestation: {
      payload_hash: '',
      chain_id: 16661,
      status: 'pending',
    },
  };
  
  // Compute hashes
  manifest.provenance.birth_manifest_hash = computeBirthManifestHash(manifest);
  manifest.attestation.payload_hash = manifest.provenance.birth_manifest_hash;
  
  return manifest;
}

// =============================================================================
// HUMAN AUTHORIZATION
// =============================================================================

function createAuthorizationCommitment({
  method = 'passkey_webauthn',
  statement = 'I authorize the creation of a new QPF AI identity',
  credential_id = null,
} = {}) {
  return {
    method,
    statement,
    credential_id: credential_id || 'pending',
    authorized_at: utcnow(),
  };
}

// =============================================================================
// AI IDENTITY
// =============================================================================

function createAIIdentity() {
  const now = utcnow();
  return {
    identity_id: generateIdentityId(),
    key_algorithm: 'ed25519',
    public_key: 'pending',
    created_at: now,
    capabilities: {
      'goal_loop.run': { scope: 'local work dir only' },
      'receipt.sign': { scope: 'own reports only' },
      'receipt.verify': { scope: 'any receipt' },
    },
    denied_by_default: [
      'network.*',
      'email.send',
      'payment.*',
      'key.export',
      'economic.*',
      'autonomous.*',
    ],
    boundaries: {
      economic_authority: false,
      autonomous_execution: false,
      network_authority: false,
    },
  };
}

// =============================================================================
// BIRTH PROTOCOL
// =============================================================================

class BirthProtocol {
  constructor(storage) {
    this.storage = storage;
  }
  
  initiate(birthId = null) {
    const bid = birthId || newBirthId();
    const record = new BirthRecord({ birth_id: bid });
    record.transition(BirthState.AUTH_REQUIRED);
    this.storage.save(record);
    return record;
  }
  
  authorize(birthId, authorizationCommitment) {
    const record = this.storage.load(birthId);
    if (!record) {
      throw new Error(`Unknown birth_id: ${birthId}`);
    }
    if (!record.transition(BirthState.AUTHORIZED)) {
      throw new Error(`Cannot authorize from state ${record.state}`);
    }
    
    record.human_authorization = {
      commitment: authorizationCommitment,
      authorized_at: utcnow(),
    };
    this.storage.save(record);
    return record;
  }
  
  create(birthId, aiIdentity) {
    const record = this.storage.load(birthId);
    if (!record) {
      throw new Error(`Unknown birth_id: ${birthId}`);
    }
    if (!record.transition(BirthState.CREATING)) {
      throw new Error(`Cannot create from state ${record.state}`);
    }
    
    record.ai_identity = aiIdentity || createAIIdentity();
    record.transition(BirthState.IDENTITY_CREATED);
    this.storage.save(record);
    return record;
  }
  
  attest(birthId) {
    const record = this.storage.load(birthId);
    if (!record) {
      throw new Error(`Unknown birth_id: ${birthId}`);
    }
    if (!record.transition(BirthState.ATTESTING)) {
      throw new Error(`Cannot attest from state ${record.state}`);
    }
    
    record.birth_manifest = createBirthManifest({
      birth_id: birthId,
      human_authorization_commitment: record.human_authorization.commitment,
      ai_identity: record.ai_identity,
      protocol_commit: 'qpf-birth-protocol-v0',
    });
    record.transition(BirthState.MAINNET_PENDING);
    this.storage.save(record);
    return record;
  }
  
  verify(birthId, proof) {
    const record = this.storage.load(birthId);
    if (!record) {
      throw new Error(`Unknown birth_id: ${birthId}`);
    }
    if (!record.transition(BirthState.VERIFIED)) {
      throw new Error(`Cannot verify from state ${record.state}`);
    }
    
    record.mainnet_proof = proof;
    record.birth_manifest.attestation.status = 'verified';
    record.birth_manifest.attestation.verified_at = utcnow();
    record.transition(BirthState.READY);
    this.storage.save(record);
    return record;
  }
  
  fail(birthId, state, reason) {
    const record = this.storage.load(birthId);
    if (!record) {
      throw new Error(`Unknown birth_id: ${birthId}`);
    }
    if (!record.transition(state, reason)) {
      throw new Error(`Cannot fail from state ${record.state} to ${state}`);
    }
    this.storage.save(record);
    return record;
  }
  
  interact(birthId) {
    const record = this.storage.load(birthId);
    if (!record) {
      throw new Error(`Unknown birth_id: ${birthId}`);
    }
    if (!record.transition(BirthState.INTERACTING)) {
      throw new Error(`Cannot interact from state ${record.state}`);
    }
    this.storage.save(record);
    return record;
  }
  
  get(birthId) {
    return this.storage.load(birthId);
  }
  
  getProof(birthId) {
    const record = this.storage.load(birthId);
    if (!record) {
      return null;
    }
    if (![BirthState.VERIFIED, BirthState.READY, BirthState.INTERACTING].includes(record.state)) {
      return null;
    }
    return {
      birth_id: record.birth_id,
      state: record.state,
      birth_manifest: record.birth_manifest,
      mainnet_proof: record.mainnet_proof,
      ai_identity: record.ai_identity,
      human_authorization: record.human_authorization,
      verified_at: record.birth_manifest.attestation.verified_at,
      verify: 'recompute birth_manifest_hash, verify mainnet_proof against 0G Aristotle chainId 16661',
    };
  }
}

// =============================================================================
// BIRTH STORAGE (in-memory for serverless, file-based for dev)
// =============================================================================

class BirthStorage {
  constructor(storageDir = null) {
    this.storageDir = storageDir;
    this.memoryStore = new Map();
  }
  
  save(record) {
    this.memoryStore.set(record.birth_id, record.toDict());
    
    // Also persist to file if storageDir provided (for dev/local)
    if (this.storageDir) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(this.storageDir, `${record.birth_id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(record.toDict(), null, 2));
    }
    
    return record;
  }
  
  load(birthId) {
    // Check memory first
    const data = this.memoryStore.get(birthId);
    if (data) {
      return BirthRecord.fromDict(data);
    }
    
    // Check file storage
    if (this.storageDir) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(this.storageDir, `${birthId}.json`);
      try {
        if (fs.existsSync(filePath)) {
          const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const record = BirthRecord.fromDict(fileData);
          this.memoryStore.set(birthId, fileData);
          return record;
        }
      } catch (e) {
        // File not found or invalid
      }
    }
    
    return null;
  }
  
  listAll() {
    const records = [];
    for (const [_, data] of this.memoryStore) {
      records.push(BirthRecord.fromDict(data));
    }
    return records.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
  }
}

module.exports = {
  BirthState,
  BirthRecord,
  BirthProtocol,
  BirthStorage,
  createAuthorizationCommitment,
  createAIIdentity,
  createBirthManifest,
  isValidTransition,
  newBirthId,
  generateIdentityId,
};
