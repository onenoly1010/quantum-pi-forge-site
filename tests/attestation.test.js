/**
 * 0G Attestation Service Tests
 * 
 * Tests the attestation flow: manifest → submission → verification
 * 
 * Run: node tests/attestation.test.js
 */

const { AttestationService, createAttestationPayload, createVerificationProof } = require('../0g-attestation/attestation-service.js');
const { createBirthManifest } = require('../js-core/birth-protocol.js');

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

console.log('='.repeat(60));
console.log('0G ATTESTATION SERVICE TESTS');
console.log('='.repeat(60));

// ==========================================
// SERVICE INITIALIZATION
// ==========================================
console.log('\n1. SERVICE INITIALIZATION');

const service = new AttestationService({
  useSimulation: true,
  rpcUrl: 'https://evmrpc.0g.ai',
  chainId: 16661,
});

assert(
  service.useSimulation === true,
  'Service initialized in simulation mode'
);

assert(
  service.rpcUrl === 'https://evmrpc.0g.ai',
  'RPC URL configured correctly'
);

assert(
  service.chainId === 16661,
  'Chain ID set to 16661 (0G Aristotle)'
);

// ==========================================
// ATTESTATION PAYLOAD
// ==========================================
console.log('\n2. ATTESTATION PAYLOAD CREATION');

const testManifest = createBirthManifest({
  birth_id: 'test-attestation-001',
  human_authorization_commitment: { method: 'test', statement: 'test' },
  ai_identity: { identity_id: 'did:qpf:test:123', public_key: 'abc', key_algorithm: 'ed25519' },
  protocol_commit: 'qpf-test-v0',
});

const manifestHash = testManifest.provenance.birth_manifest_hash;

const payload = createAttestationPayload(manifestHash);

assertEqual = (actual, expected, msg) => {
  if (actual === expected) {
    console.log(`  ✓ ${msg}`);
    passed++;
  } else {
    console.log(`  ✗ FAILED: ${msg}`);
    console.log(`    Expected: ${expected}`);
    console.log(`    Actual: ${actual}`);
    failed++;
  }
};

assertEqual(payload.type, 'birth_manifest_attestation', 'Payload has correct type');
assertEqual(payload.chain_id, 16661, 'Payload has chain ID 16661');
assertEqual(payload.birth_manifest_hash, manifestHash, 'Payload contains manifest hash');
assertEqual(payload.network, '0G Aristotle Mainnet', 'Payload has network name');

// ==========================================
// VERIFICATION PROOF
// ==========================================
console.log('\n3. VERIFICATION PROOF CREATION');

const proof = createVerificationProof('0xabc123def456', 38990123, manifestHash);

assertEqual(proof.txid, '0xabc123def456', 'Proof has txid');
assertEqual(proof.block, 38990123, 'Proof has block number');
assertEqual(proof.chain_id, 16661, 'Proof has chain ID');
assertEqual(proof.network, '0G Aristotle Mainnet', 'Proof has network name');
assert(typeof proof.explorer_url === 'string', 'Proof has explorer URL');
assertEqual(proof.birth_manifest_hash, manifestHash, 'Proof contains manifest hash');

// ==========================================
// ATTESTATION FLOW
// ==========================================
console.log('\n4. ATTESTATION SUBMISSION (SIMULATED)');

async function runAttestationFlow() {
  const result = await service.submitAttestation(manifestHash);
  
  assert(result.simulated === true, 'Attestation returns simulated flag');
  assert(typeof result.txid === 'string' && result.txid.startsWith('0x'), 'Attestation has txid');
  assert(typeof result.block === 'number', 'Attestation has block number');
  assertEqual(result.chain_id, 16661, 'Attestation has chain ID');
  assertEqual(result.birth_manifest_hash, manifestHash, 'Attestation has manifest hash');
  assert(typeof result.explorer_url === 'string', 'Attestation has explorer URL');
  
  // ==========================================
  // VERIFICATION
  // ==========================================
  console.log('\n5. ATTESTATION VERIFICATION');
  
  const verification = await service.verifyAttestation(result.txid, manifestHash);
  
  assert(verification.verified === true, 'Verification returns verified=true');
  assertEqual(verification.txid, result.txid, 'Verification has same txid');
  assertEqual(verification.chain_id, 16661, 'Verification has chain ID');
  assert(typeof verification.explorer_url === 'string', 'Verification has explorer URL');
  
  // ==========================================
  // NETWORK STATUS
  // ==========================================
  console.log('\n6. NETWORK STATUS');
  
  const status = await service.getNetworkStatus();
  
  assertEqual(status.network, '0G Aristotle Mainnet', 'Status has network name');
  assertEqual(status.chainId, 16661, 'Status has chain ID');
  assert(status.status === 'connectable', 'Status reports connectable');
  assert(typeof status.rpcUrl === 'string', 'Status has RPC URL');
  assert(typeof status.blockExplorer === 'string', 'Status has block explorer URL');
}

runAttestationFlow().then(() => {
  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n' + '='.repeat(60));
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));
  
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\n✓ All attestation tests passed!');
    console.log('\nThe 0G attestation service is ready for integration.');
    console.log('For production: connect wallet + submit real transaction.');
    process.exit(0);
  }
}).catch(err => {
  console.error('\nTest execution failed:', err);
  process.exit(1);
});
