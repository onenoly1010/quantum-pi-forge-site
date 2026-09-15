/**
 * 0G Aristotle Contract Configuration
 * 
 * Source: qpf-canon/contracts/DEPLOYED_ADDRESSES.md
 * Last verified: 2026-07-16T19:49:43Z via eth_getCode
 * 
 * IMPORTANT: Only the broadcast OINIOToken has bytecode matching local artifacts.
 * Other contracts have code present but bytecode mismatch.
 * 
 * For QPF birth attestation, we use the broadcast OINIOToken as the anchor.
 */

export const OG_CONTRACTS = {
  network: '0G Aristotle Mainnet',
  chainId: 16661,
  chainIdHex: '0x4115',
  rpcUrl: 'https://evmrpc.0g.ai',
  blockExplorer: 'https://chainscan.0g.ai',
  
  // Broadcast set - bytecode MATCH verified
  broadcast: {
    OINIOToken: {
      address: '0x709f23C7A7172E137427576abB5Eb8959E2A57c1',
      bytecodeMatch: true,
      block: 36824379,
      createTx: '0x78e0247ec5381290fe6059c29df25794dc9aadaa4ae2863979406f63a43c5d55',
      abi: [
        { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
      ]
    }
  },
  
  // Docs set - code present but bytecode MISMATCH
  // DO NOT use for attestation without further verification
  docs: {
    OINIOToken: {
      address: '0x75995EC0fdf881189850aeD864cB3f43c0DFCb58',
      bytecodeMatch: false,
      warning: 'Bytecode mismatch - do not use for attestation'
    }
  }
};

/**
 * Attestation payload structure for birth manifest anchoring
 * 
 * The birth manifest hash is anchored to the blockchain via:
 * 1. A log event on the OINIOToken contract (if supported)
 * 2. OR a transaction with the hash in the input data
 * 3. OR a storage proof via 0G Storage
 * 
 * For MVP, we use approach #2: transaction with birth manifest hash in calldata.
 */
export function createAttestationPayload(birthManifestHash) {
  return {
    type: 'birth_manifest_attestation',
    protocol: 'qpf-birth/v0',
    birth_manifest_hash: birthManifestHash,
    chain_id: 16661,
    network: '0G Aristotle Mainnet',
    format: 'transaction_calldata',
    // The actual calldata would be constructed from the contract ABI
    // For now, we record the intent and hash
    attestation_intent: {
      target_contract: OG_CONTRACTS.broadcast.OINIOToken.address,
      method: 'anchorBirthManifest', // Conceptual method - would need actual contract
      payload: birthManifestHash,
    }
  };
}

/**
 * Verification proof structure returned to the frontend
 */
export function createVerificationProof(txid, block, birthManifestHash) {
  return {
    type: 'onchain_attestation_proof',
    txid,
    block,
    chain_id: 16661,
    network: '0G Aristotle Mainnet',
    explorer_url: `https://chainscan.0g.ai/tx/${txid}`,
    birth_manifest_hash: birthManifestHash,
    verified_at: new Date().toISOString(),
    
    // What can be independently verified:
    verify: {
      transaction_exists: `Query eth_getTransactionByHash(${txid}) on ${OG_CONTRACTS.rpcUrl}`,
      block_confirmed: `Query eth_getBlockByNumber(${block}) on ${OG_CONTRACTS.rpcUrl}`,
      chain_id: `Query eth_chainId on ${OG_CONTRACTS.rpcUrl} - expected 0x4115 (16661)`,
      birth_manifest_hash: 'Compare tx input data hash with birth manifest SHA-256'
    }
  };
}
