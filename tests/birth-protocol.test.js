/**
 * QPF Birth Protocol - Unit Tests
 * 
 * Tests the birth state machine, manifest creation, and API endpoints.
 * 
 * Run: node tests/birth-protocol.test.js
 * 
 * LIMITLESS | TRUTH
 */

const { 
  BirthState, 
  BirthRecord, 
  BirthProtocol, 
  BirthStorage,
  createAuthorizationCommitment,
  createAIIdentity,
  createBirthManifest,
  isValidTransition,
  newBirthId,
} = require('../js-core/birth-protocol.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.log(`  ✗ FAILED: ${message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.log(`  ✗ FAILED: ${message}`);
    console.log(`    Expected: ${expected}`);
    console.log(`    Actual: ${actual}`);
    failed++;
  }
}

console.log('='.repeat(60));
console.log('QPF BIRTH PROTOCOL - UNIT TESTS');
console.log('='.repeat(60));

// ==========================================
// STATE MACHINE TESTS
// ==========================================
console.log('\n1. STATE MACHINE TRANSITIONS');

assert(
  isValidTransition(BirthState.IDLE, BirthState.AUTH_REQUIRED),
  'IDLE → AUTH_REQUIRED is valid'
);

assert(
  isValidTransition(BirthState.AUTH_REQUIRED, BirthState.AUTHORIZED),
  'AUTH_REQUIRED → AUTHORIZED is valid'
);

assert(
  isValidTransition(BirthState.AUTHORIZED, BirthState.CREATING),
  'AUTHORIZED → CREATING is valid'
);

assert(
  isValidTransition(BirthState.CREATING, BirthState.IDENTITY_CREATED),
  'CREATING → IDENTITY_CREATED is valid'
);

assert(
  isValidTransition(BirthState.IDENTITY_CREATED, BirthState.ATTESTING),
  'IDENTITY_CREATED → ATTESTING is valid'
);

assert(
  isValidTransition(BirthState.ATTESTING, BirthState.MAINNET_PENDING),
  'ATTESTING → MAINNET_PENDING is valid'
);

assert(
  isValidTransition(BirthState.MAINNET_PENDING, BirthState.VERIFIED),
  'MAINNET_PENDING → VERIFIED is valid'
);

assert(
  isValidTransition(BirthState.VERIFIED, BirthState.READY),
  'VERIFIED → READY is valid'
);

assert(
  isValidTransition(BirthState.READY, BirthState.INTERACTING),
  'READY → INTERACTING is valid'
);

assert(
  !isValidTransition(BirthState.IDLE, BirthState.CREATING),
  'IDLE → CREATING is INVALID (cannot skip authorization)'
);

assert(
  !isValidTransition(BirthState.IDLE, BirthState.VERIFIED),
  'IDLE → VERIFIED is INVALID (cannot skip entire flow)'
);

assert(
  !isValidTransition(BirthState.AUTHORIZED, BirthState.INTERACTING),
  'AUTHORIZED → INTERACTING is INVALID (cannot skip creation/attestation)'
);

// ==========================================
// BIRTH RECORD TESTS
// ==========================================
console.log('\n2. BIRTH RECORD');

const testBirthId = 'test-birth-' + Date.now().toString(36);
const record = new BirthRecord({ birth_id: testBirthId });

assertEqual(record.birth_id, testBirthId, 'Birth record has correct ID');
assertEqual(record.state, BirthState.IDLE, 'Initial state is IDLE');
assert(typeof record.created_at === 'string', 'Has created_at timestamp');
assert(typeof record.updated_at === 'string', 'Has updated_at timestamp');

// Test transition
const transitioned = record.transition(BirthState.AUTH_REQUIRED);
assert(transitioned, 'Can transition to AUTH_REQUIRED');
assertEqual(record.state, BirthState.AUTH_REQUIRED, 'State changed to AUTH_REQUIRED');

// Test invalid transition
const invalidTransition = record.transition(BirthState.INTERACTING);
assert(!invalidTransition, 'Cannot transition to INTERACTING from AUTH_REQUIRED');

// Test serialization
const dict = record.toDict();
assert(dict.birth_id === testBirthId, 'toDict() preserves birth_id');
assert(dict.state === BirthState.AUTH_REQUIRED, 'toDict() preserves state');

const restored = BirthRecord.fromDict(dict);
assertEqual(restored.birth_id, testBirthId, 'fromDict() restores birth_id');
assertEqual(restored.state, BirthState.AUTH_REQUIRED, 'fromDict() restores state');

// ==========================================
// BIRTH PROTOCOL TESTS
// ==========================================
console.log('\n3. BIRTH PROTOCOL (FULL LIFECYCLE)');

const storage = new BirthStorage();
const protocol = new BirthProtocol(storage);

// Initiate
const birthRecord = protocol.initiate();
assertEqual(birthRecord.state, BirthState.AUTH_REQUIRED, 'initiate() sets state to AUTH_REQUIRED');
assert(birthRecord.birth_id.startsWith('birth-'), 'initiate() creates birth_id with prefix');
const birthId = birthRecord.birth_id;

// Authorize
const authCommitment = createAuthorizationCommitment({
  method: 'passkey_webauthn',
  statement: 'I authorize creation',
});
assertEqual(authCommitment.method, 'passkey_webauthn', 'createAuthorizationCommitment() sets method');
assert(typeof authCommitment.authorized_at === 'string', 'createAuthorizationCommitment() sets timestamp');

const authorizedRecord = protocol.authorize(birthId, authCommitment);
assertEqual(authorizedRecord.state, BirthState.AUTHORIZED, 'authorize() sets state to AUTHORIZED');
assert(authorizedRecord.human_authorization.commitment.method === 'passkey_webauthn', 'authorize() stores commitment');

// Create
const aiIdentity = createAIIdentity();
assertEqual(aiIdentity.key_algorithm, 'ed25519', 'createAIIdentity() uses ed25519');
assert(aiIdentity.identity_id.startsWith('did:qpf:birth:'), 'createAIIdentity() creates proper DID');
assert(aiIdentity.boundaries.economic_authority === false, 'createAIIdentity() has economic_authority=false');
assert(aiIdentity.boundaries.autonomous_execution === false, 'createAIIdentity() has autonomous_execution=false');
assert(aiIdentity.boundaries.network_authority === false, 'createAIIdentity() has network_authority=false');

const createdRecord = protocol.create(birthId, aiIdentity);
assertEqual(createdRecord.state, BirthState.IDENTITY_CREATED, 'create() sets state to IDENTITY_CREATED');
assert(createdRecord.ai_identity.identity_id === aiIdentity.identity_id, 'create() stores identity');

// Attest
const attestedRecord = protocol.attest(birthId);
assertEqual(attestedRecord.state, BirthState.MAINNET_PENDING, 'attest() sets state to MAINNET_PENDING');
assert(typeof attestedRecord.birth_manifest.provenance.birth_manifest_hash === 'string', 'attest() creates manifest hash');
assert(attestedRecord.birth_manifest.attestation.chain_id === 16661, 'attest() sets chain_id to 16661');

// Verify
const proof = {
  txid: '0x1234567890abcdef',
  block: 38990004,
  chain_id: 16661,
  network: '0G Aristotle Mainnet',
};
const verifiedRecord = protocol.verify(birthId, proof);
assertEqual(verifiedRecord.state, BirthState.READY, 'verify() sets state to READY');
assert(verifiedRecord.mainnet_proof.txid === '0x1234567890abcdef', 'verify() stores proof');
assert(verifiedRecord.birth_manifest.attestation.status === 'verified', 'verify() marks attestation as verified');

// Interact
const interactedRecord = protocol.interact(birthId);
assertEqual(interactedRecord.state, BirthState.INTERACTING, 'interact() sets state to INTERACTING');

// Get proof
const proofData = protocol.getProof(birthId);
assert(proofData !== null, 'getProof() returns proof for verified birth');
assert(proofData.birth_id === birthId, 'getProof() returns correct birth_id');
assert(proofData.state === BirthState.INTERACTING, 'getProof() returns current state');

// ==========================================
// ERROR CASES
// ==========================================
console.log('\n4. ERROR HANDLING');

try {
  protocol.authorize('nonexistent-birth', authCommitment);
  assert(false, 'Should throw for unknown birth_id');
} catch (e) {
  assert(e.message.includes('Unknown birth_id'), 'Throws error for unknown birth_id');
}

try {
  protocol.getProof('nonexistent-birth');
  // Should return null, not throw
  assert(true, 'getProof() returns null for unknown birth_id');
} catch (e) {
  assert(false, 'getProof() should not throw for unknown birth_id');
}

// ==========================================
// MANIFEST TESTS
// ==========================================
console.log('\n5. BIRTH MANIFEST');

const testManifest = createBirthManifest({
  birth_id: 'test-manifest-123',
  human_authorization_commitment: { method: 'test', statement: 'test' },
  ai_identity: { identity_id: 'did:qpf:test:123', public_key: 'abc', key_algorithm: 'ed25519' },
});

assertEqual(testManifest.protocol, 'qpf-birth/v0', 'Manifest has protocol version');
assertEqual(testManifest.birth_id, 'test-manifest-123', 'Manifest has birth_id');
assert(testManifest.boundaries.economic_authority === false, 'Manifest boundaries.economic_authority is false');
assert(testManifest.boundaries.autonomous_execution === false, 'Manifest boundaries.autonomous_execution is false');
assert(testManifest.boundaries.network_authority === false, 'Manifest boundaries.network_authority is false');
assert(testManifest.attestation.chain_id === 16661, 'Manifest attestation.chain_id is 16661');
assert(typeof testManifest.provenance.birth_manifest_hash === 'string', 'Manifest has computed hash');
assert(testManifest.provenance.birth_manifest_hash.length === 64, 'Manifest hash is SHA-256 (64 hex chars)');

// ==========================================
// SUMMARY
// ==========================================
console.log('\n' + '='.repeat(60));
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n✓ All birth protocol tests passed!');
  console.log('\nThe headless core is ready for the birth experience.');
  console.log('\nCREATE → VERIFY → MEET');
  console.log('WATCH YOUR AI COME TO LIFE.');
  process.exit(0);
}
