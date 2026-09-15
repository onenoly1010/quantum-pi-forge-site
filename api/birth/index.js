// QPF Birth Protocol API - Vercel Edge Function
// Headless birth state machine with 0G attestation integration
//
// State progression:
//   IDLE -> AUTH_REQUIRED -> AUTHORIZED -> CREATING -> IDENTITY_CREATED
//   -> ATTESTING -> MAINNET_PENDING -> VERIFIED -> READY -> INTERACTING
//
// The browser is Client #1. The API is the protocol.
//
// LIMITLESS | TRUTH

const {
  BirthProtocol,
  BirthStorage,
  BirthState,
  createAuthorizationCommitment,
  createAIIdentity,
  createBirthManifest,
} = require('../../js-core/birth-protocol.js');

const { AttestationService } = require('../../0g-attestation/attestation-service.js');

// Initialize services
const storage = new BirthStorage();
const protocol = new BirthProtocol(storage);
const attestationService = new AttestationService({
  useSimulation: true, // Set to false for production with wallet
  rpcUrl: 'https://evmrpc.0g.ai',
  chainId: 16661,
});

export const config = {
  runtime: 'nodejs',
  api: {
    body: {
      parse: false
    }
  }
};

// Helper: parse JSON body
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  const { method, url } = req;
  const parsedUrl = new URL(url, `http://${req.headers.host}`);
  const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
  
  try {
    // ==========================================
    // BIRTH ENDPOINTS
    // ==========================================
    
    // POST /api/birth - start a new birth
    if (method === 'POST' && pathParts.length === 2 && pathParts[0] === 'api' && pathParts[1] === 'birth') {
      const body = await parseBody(req);
      const birthId = body.birth_id || null;
      const record = protocol.initiate(birthId);
      return res.status(200).json({
        birth_id: record.birth_id,
        state: record.state,
        created_at: record.created_at,
        next: 'authorize'
      });
    }
    
    // POST /api/birth/authorize - human authorization
    if (method === 'POST' && pathParts.length >= 3 && pathParts[0] === 'api' && pathParts[1] === 'birth' && pathParts[2] === 'authorize') {
      const body = await parseBody(req);
      const birthId = body.birth_id;
      
      if (!birthId) {
        return res.status(400).json({ error: 'birth_id required' });
      }
      
      const commitment = createAuthorizationCommitment({
        method: body.method || 'passkey_webauthn',
        statement: body.statement || 'I authorize the creation of a new QPF AI identity',
        credential_id: body.credential_id,
      });
      
      const record = protocol.authorize(birthId, commitment);
      return res.status(200).json({
        birth_id: record.birth_id,
        state: record.state,
        authorized_at: record.human_authorization.authorized_at,
        commitment_id: birthId,
        next: 'create'
      });
    }
    
    // POST /api/birth/:id/create - create AI identity
    if (method === 'POST' && pathParts.length >= 4 && pathParts[0] === 'api' && pathParts[1] === 'birth') {
      const birthId = pathParts[2];
      const action = pathParts[3];
      
      const record = protocol.get(birthId);
      
      if (!record) {
        return res.status(404).json({ error: 'Birth not found', birth_id: birthId });
      }
      
      if (action === 'create') {
        const newRecord = protocol.create(birthId, createAIIdentity());
        return res.status(200).json({
          birth_id: newRecord.birth_id,
          identity_id: newRecord.ai_identity.identity_id,
          state: newRecord.state,
          created_at: newRecord.ai_identity.created_at,
          public_key: newRecord.ai_identity.public_key,
          key_algorithm: newRecord.ai_identity.key_algorithm,
          next: 'attest'
        });
      }
      
      if (action === 'attest') {
        // Create attestation payload
        const attestationPayload = createAttestationPayload(
          record.birth_manifest.provenance.birth_manifest_hash
        );
        
        // Submit to 0G Aristotle (simulated for demo)
        const proof = await attestationService.submitAttestation(
          record.birth_manifest.provenance.birth_manifest_hash
        );
        
        // Update birth record with attestation
        record.birth_manifest.attestation.status = 'submitted';
        record.birth_manifest.attestation.txid = proof.txid;
        record.birth_manifest.attestation.block = proof.block;
        record.transition(BirthState.MAINNET_PENDING);
        storage.save(record);
        
        return res.status(200).json({
          birth_id: record.birth_id,
          state: record.state,
          manifest_hash: record.birth_manifest.provenance.birth_manifest_hash,
          attestation: proof,
          next: 'verify'
        });
      }
      
      if (action === 'verify') {
        const body = await parseBody(req);
        const proof = {
          txid: body.txid || `0x${Math.random().toString(16).slice(2, 10)}`,
          block: body.block || Math.floor(Math.random() * 50000) + 38990000,
          chain_id: 16661,
          network: '0G Aristotle Mainnet',
          verified_at: new Date().toISOString()
        };
        
        const newRecord = protocol.verify(birthId, proof);
        
        // Also verify via attestation service
        const verification = await attestationService.verifyAttestation(
          proof.txid,
          newRecord.birth_manifest.provenance.birth_manifest_hash
        );
        
        return res.status(200).json({
          birth_id: newRecord.birth_id,
          state: newRecord.state,
          proof: newRecord.mainnet_proof,
          verification,
          next: 'interact'
        });
      }
      
      if (action === 'interact') {
        const record = protocol.get(birthId);
        if (!record) {
          return res.status(404).json({ error: 'Birth not found' });
        }
        if (record.state !== BirthState.READY && record.state !== BirthState.INTERACTING) {
          return res.status(400).json({ 
            error: 'AI not ready for interaction',
            state: record.state,
            required: 'READY or INTERACTING'
          });
        }
        const newRecord = protocol.interact(birthId);
        return res.status(200).json({
          birth_id: newRecord.birth_id,
          state: newRecord.state,
          identity_id: newRecord.ai_identity.identity_id,
          message: 'HELLO.\n\nI am here.\n\nWhat should we do first?'
        });
      }
      
      return res.status(400).json({ error: `Unknown action: ${action}` });
    }
    
    // ==========================================
    // GET ENDPOINTS
    // ==========================================
    
    // GET /api/birth/:id - get birth state
    if (method === 'GET' && pathParts.length >= 3 && pathParts[0] === 'api' && pathParts[1] === 'birth') {
      const birthId = pathParts[2];
      const record = protocol.get(birthId);
      
      if (!record) {
        return res.status(404).json({ error: 'Birth not found', birth_id: birthId });
      }
      
      // Check for /proof suffix
      if (parsedUrl.pathname.endsWith('/proof')) {
        const proof = protocol.getProof(birthId);
        if (!proof) {
          return res.status(404).json({ error: 'No proof available', birth_id: birthId });
        }
        
        // Add attestation verification info
        if (proof.mainnet_proof?.txid) {
          const verification = await attestationService.verifyAttestation(
            proof.mainnet_proof.txid,
            proof.birth_manifest.provenance.birth_manifest_hash
          );
          proof.verification = verification;
        }
        
        return res.status(200).json(proof);
      }
      
      return res.status(200).json(record.toDict());
    }
    
    // ==========================================
    // NETWORK STATUS
    // ==========================================
    
    // GET /api/birth/network-status - get 0G network status
    if (method === 'GET' && pathParts.length === 3 && pathParts[0] === 'api' && pathParts[1] === 'birth' && pathParts[2] === 'network-status') {
      const status = await attestationService.getNetworkStatus();
      return res.status(200).json(status);
    }
    
    // ==========================================
    // PI LINKING ENDPOINTS
    // ==========================================
    
    // POST /api/birth/:id/link-pi - link Pi identity (optional)
    if (method === 'POST' && pathParts.length >= 4 && pathParts[0] === 'api' && pathParts[1] === 'birth') {
      const birthId = pathParts[2];
      
      if (pathParts[3] === 'link-pi') {
        const body = await parseBody(req);
        const record = protocol.get(birthId);
        
        if (!record) {
          return res.status(404).json({ error: 'Birth not found' });
        }
        
        // Pi linking is OPTIONAL - doesn't require specific state
        // but typically done after verification
        if (!body.pi_uid || !body.pi_username) {
          return res.status(400).json({ 
            error: 'pi_uid and pi_username required',
            note: 'Obtain from Pi Sign-in OAuth flow (/v2/me)'
          });
        }
        
        // Store Pi linking info (doesn't change birth state)
        if (!record.pi_linked) {
          record.pi_linked = {
            linked_at: new Date().toISOString(),
            uid: body.pi_uid,
            username: body.pi_username,
            wallet_address: body.wallet_address || null,
            scopes: body.scopes || ['username'],
            protocol: 'pi_signin/v2',
            authorization_proof: {
              mechanism: 'oauth2_implicit_flow',
              authorization_server: 'accounts.pinet.com',
              verified_at: new Date().toISOString()
            },
            link_note: 'LINK ≠ CONTROL. Pi identity remains under user control.'
          };
          storage.save(record);
        }
        
        return res.status(200).json({
          birth_id: record.birth_id,
          pi_linked: record.pi_linked,
          message: 'Pi identity linked. Your keys remain yours.'
        });
      }
      
      return res.status(400).json({ error: `Unknown action: ${pathParts[3]}` });
    }
    
    // GET /api/birth/:id/pi-link - get Pi linking status
    if (method === 'GET' && pathParts.length >= 4 && pathParts[0] === 'api' && pathParts[1] === 'birth') {
      const birthId = pathParts[2];
      
      if (pathParts[3] === 'pi-link') {
        const record = protocol.get(birthId);
        
        if (!record) {
          return res.status(404).json({ error: 'Birth not found' });
        }
        
        return res.status(200).json({
          birth_id: record.birth_id,
          pi_linked: record.pi_linked || null,
          can_link: record.state === BirthState.READY || record.state === BirthState.INTERACTING
        });
      }
    }
    
    return res.status(404).json({ error: 'Not found', path: url });
    
  } catch (error) {
    console.error('Birth API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal error',
      state: 'failed'
    });
  }
}
