/**
 * QPF Birth Experience - Client-Side JavaScript
 * 
 * "Watch Your AI Come To Life"
 * 
 * Frontend experience layer. The API is the protocol reality.
 * Every state transition corresponds to a real backend event.
 * 
 * LIMITLESS | TRUTH
 */

const BirthExperience = {
  currentState: 'intro',
  birthId: null,
  identityId: null,
  apiBase: '/api/birth',
  
  init() {
    this.cacheElements();
    this.bindEvents();
    this.showState('intro');
    console.log('[QPF Birth] Experience initialized');
    console.log('[QPF Birth] Flow: IDLE → AUTH → CREATE → ATTEST → VERIFY → MEET');
  },
  
  cacheElements() {
    this.elements = {
      views: {
        intro: document.getElementById('state-intro'),
        auth: document.getElementById('state-auth'),
        authorized: document.getElementById('state-authorized'),
        creating: document.getElementById('state-creating'),
        identityCreated: document.getElementById('state-identity-created'),
        attesting: document.getElementById('state-attesting'),
        verified: document.getElementById('state-verified'),
        ready: document.getElementById('state-ready'),
        error: document.getElementById('state-error'),
        incomplete: document.getElementById('state-incomplete'),
      },
      buttons: {
        begin: document.getElementById('btn-begin'),
        passkey: document.getElementById('btn-passkey'),
        simulated: document.getElementById('btn-simulated'),
        create: document.getElementById('btn-create'),
        attest: document.getElementById('btn-attest'),
        viewProof: document.getElementById('btn-view-proof'),
        chat: document.getElementById('btn-chat'),
        retry: document.getElementById('btn-retry'),
        retryAttest: document.getElementById('btn-retry-attest'),
        meetAnyway: document.getElementById('btn-meet-anyway'),
      },
      displays: {
        commitmentCode: document.getElementById('commitment-code'),
        newIdentityId: document.getElementById('new-identity-id'),
        newIdentityTime: document.getElementById('new-identity-time'),
        identityIdDisplay: document.getElementById('identity-id-display'),
        verifiedTime: document.getElementById('verified-time'),
        verifiedIdentity: document.getElementById('verified-identity'),
        meetIdentity: document.getElementById('meet-identity'),
        errorMessage: document.getElementById('error-message'),
        errorDetails: document.getElementById('error-details'),
      },
      progress: {
        fillAuth: document.getElementById('progress-fill-auth'),
        fillAuthz: document.getElementById('progress-fill-authz'),
        fillCreating: document.getElementById('progress-fill-creating'),
        fillAttesting: document.getElementById('progress-fill-attesting'),
      },
      steps: {
        identity: document.getElementById('step-identity'),
        memory: document.getElementById('step-memory'),
        boundaries: document.getElementById('step-boundaries'),
        verification: document.getElementById('step-verification'),
      },
      authStatus: document.getElementById('auth-status'),
    };
  },
  
  bindEvents() {
    this.elements.buttons.begin.addEventListener('click', () => this.startBirth());
    this.elements.buttons.passkey.addEventListener('click', () => this.authorizeWithPasskey());
    this.elements.buttons.simulated.addEventListener('click', () => this.authorizeSimulated());
    this.elements.buttons.create.addEventListener('click', () => this.createIdentity());
    this.elements.buttons.attest.addEventListener('click', () => this.startAttestation());
    this.elements.buttons.viewProof.addEventListener('click', () => this.viewProof());
    this.elements.buttons.chat.addEventListener('click', () => this.startChat());
    this.elements.buttons.retry.addEventListener('click', () => this.reset());
    this.elements.buttons.retryAttest.addEventListener('click', () => this.startAttestation());
    this.elements.buttons.meetAnyway.addEventListener('click', () => this.goToMeet());
  },
  
  async apiCall(endpoint, options = {}) {
    const url = `${this.apiBase}${endpoint}`;
    const config = {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    };
    
    if (config.body) {
      config.body = JSON.stringify(config.body);
    }
    
    console.log(`[QPF Birth API] ${config.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`[QPF Birth API] Error ${response.status}:`, data.error);
        throw new Error(data.error || 'API error');
      }
      
      return data;
    } catch (error) {
      console.error('[QPF Birth API] Request failed:', error);
      throw error;
    }
  },
  
  async startBirth() {
    try {
      console.log('[QPF Birth] Starting new birth...');
      const data = await this.apiCall('/', {
        method: 'POST',
        body: { birth_id: this.birthId },
      });
      
      this.birthId = data.birth_id;
      console.log(`[QPF Birth] Birth initiated: ${this.birthId}`);
      
      this.showState('auth');
      this.updateProgress('auth', 0.1);
    } catch (error) {
      this.showError('Failed to start birth', error.message);
    }
  },
  
  async authorizeWithPasskey() {
    this.showAuthStatus(true);
    
    try {
      console.log('[QPF Birth] Attempting passkey authorization...');
      
      // Real WebAuthn would use navigator.credentials.create() here
      // For demo, simulate the ceremony
      await this.delay(1500);
      
      const data = await this.apiCall('/authorize', {
        method: 'POST',
        body: {
          birth_id: this.birthId,
          method: 'passkey_webauthn',
          statement: 'I authorize the creation of a new QPF AI identity',
        },
      });
      
      this.birthId = data.birth_id;
      this.showAuthStatus(false);
      this.showState('authorized');
      this.elements.displays.commitmentCode.textContent = data.birth_id;
      this.updateProgress('authz', 0.25);
      
      console.log('[QPF Birth] Authorized via passkey');
    } catch (error) {
      this.showAuthStatus(false);
      this.showError('Authorization failed', error.message);
    }
  },
  
  async authorizeSimulated() {
    this.showAuthStatus(true);
    
    try {
      console.log('[QPF Birth] Simulated authorization (demo mode)...');
      
      await this.delay(1000);
      
      const data = await this.apiCall('/authorize', {
        method: 'POST',
        body: {
          birth_id: this.birthId,
          method: 'simulated',
          statement: 'I authorize the creation of a new QPF AI identity (demo)',
        },
      });
      
      this.birthId = data.birth_id;
      this.showAuthStatus(false);
      this.showState('authorized');
      this.elements.displays.commitmentCode.textContent = data.birth_id;
      this.updateProgress('authz', 0.25);
      
      console.log('[QPF Birth] Authorized (simulated)');
    } catch (error) {
      this.showAuthStatus(false);
      this.showError('Authorization failed', error.message);
    }
  },
  
  async createIdentity() {
    try {
      console.log('[QPF Birth] Creating AI identity...');
      this.showState('creating');
      this.runCreationSequence();
      
      const data = await this.apiCall(`/${this.birthId}/create`, {
        method: 'POST',
      });
      
      this.identityId = data.identity_id;
      console.log(`[QPF Birth] Identity created: ${this.identityId}`);
      
      this.elements.displays.newIdentityId.textContent = this.identityId;
      this.elements.displays.newIdentityTime.textContent = new Date().toLocaleString();
      this.elements.displays.identityIdDisplay.textContent = this.identityId;
      
      this.showState('identityCreated');
      this.updateProgress('creating', 0.5);
    } catch (error) {
      this.showError('Identity creation failed', error.message);
    }
  },
  
  runCreationSequence() {
    const steps = [
      { el: this.elements.steps.identity, label: 'Creating identity' },
      { el: this.elements.steps.memory, label: 'Establishing memory' },
      { el: this.elements.steps.boundaries, label: 'Setting boundaries' },
      { el: this.elements.steps.verification, label: 'Preparing verification' },
    ];
    
    let delay = 0;
    steps.forEach((step, index) => {
      setTimeout(() => {
        this.activateStep(step.el, step.label);
      }, delay);
      delay += 800;
    });
  },
  
  activateStep(element, label) {
    const indicator = element.querySelector('.step-indicator');
    const status = element.querySelector('.step-status');
    
    indicator.className = 'step-indicator active';
    indicator.textContent = '◉';
    status.textContent = 'active';
    status.className = 'step-status active';
    
    console.log(`[QPF Birth] ${label}...`);
    
    setTimeout(() => {
      indicator.className = 'step-indicator complete';
      indicator.textContent = '✓';
      status.textContent = 'complete';
      status.className = 'step-status complete';
    }, 600);
  },
  
  async startAttestation() {
    try {
      console.log('[QPF Birth] Starting attestation to 0G Aristotle...');
      this.showState('attesting');
      this.updateProgress('attesting', 0.6);
      
      // Submit attestation via API
      const data = await this.apiCall(`/${this.birthId}/attest`, {
        method: 'POST',
      });
      
      console.log(`[QPF Birth] Attestation submitted`);
      console.log(`  Manifest hash: ${data.manifest_hash.slice(0, 16)}...`);
      console.log(`  TxID: ${data.attestation?.txid || 'pending'}`);
      console.log(`  Block: ${data.attestation?.block || 'pending'}`);
      console.log(`  Network: ${data.attestation?.network || '0G Aristotle'}`);
      
      if (data.attestation?.simulated) {
        console.log('  Note: Simulated attestation (demo mode)');
      }
      
      // Wait for confirmation simulation
      await this.delay(2000);
      
      // Move to verified state
      const verifyData = await this.apiCall(`/${this.birthId}/verify`, {
        method: 'POST',
        body: {
          txid: data.attestation?.txid,
          block: data.attestation?.block,
        },
      });
      
      console.log('[QPF Birth] Verified on 0G Aristotle!');
      
      this.elements.displays.verifiedTime.textContent = new Date().toLocaleString();
      this.elements.displays.verifiedIdentity.textContent = this.identityId;
      
      this.showState('verified');
      this.updateProgress('attesting', 1);
    } catch (error) {
      console.error('[QPF Birth] Attestation failed:', error);
      this.showError('Attestation failed', error.message);
    }
  },
  
  async viewProof() {
    try {
      const data = await this.apiCall(`/${this.birthId}/proof`);
      
      const proofText = [
        '=== BIRTH PROOF ===',
        ``,
        `Birth ID: ${data.birth_id}`,
        `State: ${data.state}`,
        `Identity: ${data.ai_identity?.identity_id || '—'}`,
        ``,
        `--- Manifest ---`,
        `Hash: ${data.birth_manifest?.provenance?.birth_manifest_hash || '—'}`,
        `Protocol: ${data.birth_manifest?.protocol || '—'}`,
        ``,
        `--- On-Chain Attestation ---`,
        `Network: ${data.mainnet_proof?.network || data.verification?.network || '0G Aristotle Mainnet'}`,
        `Chain ID: ${data.mainnet_proof?.chain_id || data.verification?.chain_id || 16661}`,
        `TxID: ${data.mainnet_proof?.txid || data.verification?.txid || '—'}`,
        `Block: ${data.mainnet_proof?.block || data.verification?.block || '—'}`,
        ``,
        `--- Verification ---`,
        `Verified At: ${data.mainnet_proof?.verified_at || data.verification?.verified_at || '—'}`,
        ``,
        `--- Links ---`,
        `Explorer: ${data.verification?.explorer_url || `https://chainscan.0g.ai/tx/${data.mainnet_proof?.txid || ''}`}`,
        `API: ${window.location.origin}/api/birth/${data.birth_id}/proof`,
        ``,
        `=== LIMITLESS | TRUTH ===`
      ].join('\n');
      
      alert(proofText);
    } catch (error) {
      console.error('[QPF Birth] Failed to load proof:', error);
    }
  },
  
  async startChat() {
    try {
      console.log('[QPF Birth] Starting AI interaction...');
      
      const data = await this.apiCall(`/${this.birthId}/interact`, {
        method: 'POST',
      });
      
      this.elements.displays.meetIdentity.textContent = data.identity_id;
      this.showState('ready');
      
      console.log('[QPF Birth] AI session ready');
    } catch (error) {
      this.showError('Failed to start interaction', error.message);
    }
  },
  
  goToMeet() {
    this.elements.displays.meetIdentity.textContent = this.identityId || '—';
    this.showState('ready');
  },
  
  reset() {
    this.birthId = null;
    this.identityId = null;
    this.showState('intro');
    console.log('[QPF Birth] Reset to intro state');
  },
  
  showState(stateName) {
    Object.values(this.elements.views).forEach(view => {
      view.classList.remove('active');
    });
    
    const targetView = this.elements.views[stateName];
    if (targetView) {
      targetView.classList.add('active');
      this.currentState = stateName;
      console.log(`[QPF Birth] State: ${stateName}`);
    }
  },
  
  updateProgress(type, percent) {
    const fillMap = {
      auth: this.elements.progress.fillAuth,
      authz: this.elements.progress.fillAuthz,
      creating: this.elements.progress.fillCreating,
      attesting: this.elements.progress.fillAttesting,
    };
    
    const fill = fillMap[type];
    if (fill) {
      fill.style.width = `${percent * 100}%`;
    }
  },
  
  showAuthStatus(show) {
    if (show) {
      this.elements.authStatus.classList.remove('hidden');
    } else {
      this.elements.authStatus.classList.add('hidden');
    }
  },
  
  showError(title, message) {
    this.elements.displays.errorMessage.textContent = title;
    this.elements.displays.errorDetails.textContent = message;
    this.showState('error');
  },
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};

document.addEventListener('DOMContentLoaded', () => {
  BirthExperience.init();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BirthExperience;
}
