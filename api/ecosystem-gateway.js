// ========================================
// QUANTUM PI FORGE ECOSYSTEM GATEWAY
// Unified API for all ecosystem services
// ========================================

// Ecosystem service configurations
export const ECOSYSTEM_SERVICES = {
  genesis: {
    name: 'Pi Forge Quantum Genesis',
    url: 'https://pi-forge-quantum-genesis.railway.app',
    healthEndpoint: '/health',
    apiDocs: '/docs',
    description: 'FastAPI backend with Sacred Trinity Architecture'
  },
  resonance: {
    name: 'Quantum Resonance Clean',
    url: 'https://quantum-resonance-clean.vercel.app',
    healthEndpoint: '/health',
    infoEndpoint: '/api/info',
    description: 'Streamlined quantum resonance engine with ledger API'
  },
  dex: {
    name: 'Quantum Pi Forge DEX',
    url: 'https://quantum-pi-forge-fixed.vercel.app',
    healthEndpoint: '/api/health',
    dashboard: '/dashboard',
    description: 'Sovereign Uniswap V2 DEX on 0G Aristotle Mainnet'
  },
  contracts: {
    name: 'Smart Contracts',
    network: '0G Aristotle Mainnet',
    chainId: '16661', // String for consistency with Web3 libraries
    chainIdHex: '0x4115',
    rpcUrl: 'https://evmrpc.0g.ai',
    // Note: No mainnet fallback RPC publicly available yet
    // Check https://docs.0g.ai for additional endpoints
    blockExplorer: 'https://chainscan.0g.ai',
    currencySymbol: '0G',
    currencyDecimals: 18,
    description: '0G Aristotle Mainnet configuration',
    // DEX Router Configuration
    // TODO: Update with actual router address after resolution
    router: {
      address: '0x0000000000000000000000000000000000000000',
      type: 'uniswap_v2',
      verified: false,
      note: 'Pending router address resolution - see .env.launch and DEPLOYMENT_GUIDE.md'
    }
  }
};

// Request configuration
const REQUEST_CONFIG = {
  timeout: 10000, // 10 seconds
  retries: 3,
  retryDelay: 1000, // Start with 1 second
  headers: {
    'X-Quantum-Forge-Client': 'web-v1',
    'Content-Type': 'application/json'
  }
};

/**
 * Fetch data from ecosystem services with retry logic and timeout
 * @param {string} url - The full URL to fetch from
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Response data
 */
export async function fetchFromEcosystem(url, options = {}) {
  const { retries = REQUEST_CONFIG.retries, retryDelay = REQUEST_CONFIG.retryDelay } = options;
  let lastError;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_CONFIG.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...REQUEST_CONFIG.headers,
          ...options.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data, status: response.status };
    } catch (error) {
      lastError = error;
      
      // Don't retry on abort (timeout) for last attempt
      if (attempt < retries - 1) {
        // Exponential backoff with max 5 second delay
        const delay = Math.min(retryDelay * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  return {
    success: false,
    error: lastError.message || 'Unknown error',
    status: 'error'
  };
}

/**
 * Check health status of all ecosystem services
 * @returns {Promise<Object>} - Health status for each service
 */
export async function checkEcosystemHealth() {
  const healthChecks = {
    genesis: checkServiceHealth('genesis'),
    resonance: checkServiceHealth('resonance'),
    dex: checkServiceHealth('dex')
  };

  const results = await Promise.allSettled([
    healthChecks.genesis,
    healthChecks.resonance,
    healthChecks.dex
  ]);

  const health = {
    genesis: results[0].status === 'fulfilled' ? results[0].value : { status: 'down', error: results[0].reason },
    resonance: results[1].status === 'fulfilled' ? results[1].value : { status: 'down', error: results[1].reason },
    dex: results[2].status === 'fulfilled' ? results[2].value : { status: 'down', error: results[2].reason }
  };

  // Determine overall status
  const statuses = Object.values(health).map(h => h.status);
  const healthyCount = statuses.filter(s => s === 'healthy').length;
  const totalCount = statuses.length;

  let overallStatus;
  if (healthyCount === totalCount) {
    overallStatus = 'healthy';
  } else if (healthyCount > 0) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'down';
  }

  return {
    overall: overallStatus,
    services: health,
    timestamp: new Date().toISOString()
  };
}

/**
 * Check health of a specific service
 * @param {string} serviceName - Name of the service to check
 * @returns {Promise<Object>} - Health status
 */
async function checkServiceHealth(serviceName) {
  const service = ECOSYSTEM_SERVICES[serviceName];
  if (!service || !service.healthEndpoint) {
    return { status: 'unknown', message: 'Service not configured' };
  }

  const url = `${service.url}${service.healthEndpoint}`;
  
  try {
    // Use shorter timeout for health checks
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: REQUEST_CONFIG.headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return { status: 'healthy', code: response.status };
    } else {
      return { status: 'degraded', code: response.status };
    }
  } catch (error) {
    return { 
      status: 'down', 
      error: error.name === 'AbortError' ? 'Timeout' : error.message 
    };
  }
}

/**
 * Get real-time metrics from ecosystem services
 * @returns {Promise<Object>} - Aggregated metrics
 */
export async function getEcosystemMetrics() {
  // Fetch metrics from multiple services in parallel
  const metricsPromises = {
    genesis: fetchGenesisMetrics(),
    resonance: fetchResonanceMetrics()
  };

  const results = await Promise.allSettled([
    metricsPromises.genesis,
    metricsPromises.resonance
  ]);

  const metrics = {
    genesis: results[0].status === 'fulfilled' ? results[0].value : null,
    resonance: results[1].status === 'fulfilled' ? results[1].value : null,
    timestamp: new Date().toISOString()
  };

  return metrics;
}

/**
 * Fetch metrics from Genesis backend
 * @returns {Promise<Object>} - Genesis metrics
 */
async function fetchGenesisMetrics() {
  try {
    // Try to fetch guardian dashboard data
    const dashboardUrl = `${ECOSYSTEM_SERVICES.genesis.url}/api/guardians/dashboard`;
    const result = await fetchFromEcosystem(dashboardUrl, { retries: 2 });

    if (result.success) {
      return {
        available: true,
        pendingDecisions: result.data.pending_decisions || 0,
        safetyScore: result.data.safety_score || 'N/A',
        activeGuardians: result.data.active_guardians || 0
      };
    }
  } catch (error) {
    // Fallback - service might be available but endpoint structure different
  }

  // Return default structure if fetch fails
  return {
    available: false,
    pendingDecisions: 0,
    safetyScore: 'N/A',
    activeGuardians: 0
  };
}

/**
 * Fetch metrics from Resonance engine
 * @returns {Promise<Object>} - Resonance metrics
 */
async function fetchResonanceMetrics() {
  try {
    const infoUrl = `${ECOSYSTEM_SERVICES.resonance.url}/api/info`;
    const result = await fetchFromEcosystem(infoUrl, { retries: 2 });

    if (result.success) {
      return {
        available: true,
        version: result.data.version || 'Unknown',
        status: result.data.status || 'operational',
        uptime: result.data.uptime || 'N/A'
      };
    }
  } catch (error) {
    // Fallback
  }

  // Return default structure if fetch fails
  return {
    available: false,
    version: 'Unknown',
    status: 'unknown',
    uptime: 'N/A'
  };
}

// Export all functions and constants
export default {
  ECOSYSTEM_SERVICES,
  fetchFromEcosystem,
  checkEcosystemHealth,
  getEcosystemMetrics
};
