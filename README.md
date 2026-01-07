





































# Quantum Pi Forge - Landing Site

> **🤖 For Coding Agents**: Complete the [mandatory onboarding](.github/agents/ONBOARDING.md) before starting any work on this repository. See [Agent Instructions](.github/agents/AGENT_INSTRUCTIONS.md) for details.

## 🌐 Live Site

🔗 **[https://onenoly1010.github.io/quantum-pi-forge-site/](https://onenoly1010.github.io/quantum-pi-forge-site/)**

## 📖 Overview

The Quantum Pi Forge landing site is a fully integrated ecosystem hub that connects all live services with real-time data, health monitoring, and a comprehensive ecosystem showcase. Built with modern web technologies, it serves as the central gateway to the Quantum Pi Forge universe.

## 🏗️ Architecture

### Static Site Structure
- **index.html** - Main landing page with ecosystem section
- **dashboard.html** - Live Genesis Launch Dashboard with real-time metrics
- **style.css** - Unified styling with glass-morphism aesthetics
- **script.js** - Interactive features and animations
- **api/ecosystem-gateway.js** - Unified API gateway for ecosystem services

### Ecosystem Integration

The site integrates with multiple live services:

#### **Connected Services**

1. **Pi Forge Quantum Genesis** 🏗️
   - **URL**: https://pi-forge-quantum-genesis.railway.app
   - **Type**: FastAPI backend with Sacred Trinity Architecture
   - **Endpoints**: `/health`, `/docs`, `/api/guardians/dashboard`
   - **Status**: Production

2. **Quantum Resonance Clean** ⚡
   - **URL**: https://quantum-resonance-clean.vercel.app
   - **Type**: Quantum resonance engine with ledger API
   - **Endpoints**: `/health`, `/api/info`
   - **Status**: Production

3. **Quantum Pi Forge DEX** 💱
   - **URL**: https://quantum-pi-forge-fixed.vercel.app
   - **Type**: Uniswap V2 DEX on 0G Aristotle Mainnet
   - **Endpoints**: `/api/health`, `/dashboard`
   - **Network**: Chain ID 16661 (0x4115)
   - **RPC**: https://evmrpc.0g.ai
   - **Explorer**: https://chainscan.0g.ai
   - **Router Config**: See `.env.launch` and `DEPLOYMENT_GUIDE.md`
   - **Status**: Production (Router Configuration Pending)

4. **Pi MR NFT System** 🎨
   - **Repos**: [Contracts](https://github.com/onenoly1010/Pi-MR-NFT-contracts), [Agent](https://github.com/onenoly1010/Pi-MR-NFT-Agent)
   - **Type**: AI-powered NFT minting system
   - **Status**: Development

5. **OINIO Soul System** 🧠
   - **Repo**: https://github.com/onenoly1010/oinio-soul
   - **Type**: Philosophical framework and consciousness layer
   - **Status**: Development

6. **Quantum Pi Forge OPEN** 🔓
   - **Repo**: https://github.com/onenoly1010/quantum-pi-forge-open
   - **Type**: Open-source backend for Gargoura Engine
   - **Status**: Open Source

## 🔧 API Gateway

### Features

The `api/ecosystem-gateway.js` module provides:

- **Service Configuration**: Centralized config for all ecosystem services
- **Retry Logic**: 3 attempts with exponential backoff (1s, 2s, 4s)
- **Timeout Handling**: 10-second timeout per request, 5-second for health checks
- **Error Handling**: Unified error handling with graceful degradation
- **Health Monitoring**: Real-time health checks for all services
- **Metrics Aggregation**: Live data from Genesis and Resonance APIs

### Key Functions

```javascript
// Import the gateway
import { ECOSYSTEM_SERVICES, checkEcosystemHealth, getEcosystemMetrics } from './api/ecosystem-gateway.js';

// Check health of all services
const health = await checkEcosystemHealth();
// Returns: { overall: 'healthy|degraded|down', services: {...}, timestamp: '...' }

// Get real-time metrics
const metrics = await getEcosystemMetrics();
// Returns: { genesis: {...}, resonance: {...}, timestamp: '...' }

// Fetch from any ecosystem service
const result = await fetchFromEcosystem(url, options);
// Returns: { success: true/false, data: {...}, status: '...' }
```

## 📊 Live Dashboard

The **Genesis Launch Dashboard** (`dashboard.html`) features:

- **Real-time Health Monitoring**: Live status indicators for each service
  - ✅ Online (green) - Service is healthy
  - ⚠️ Degraded (orange) - Service is experiencing issues
  - ❌ Offline (red) - Service is down

- **Live Metrics Display**:
  - Pending Decisions from Genesis API
  - Safety Score from Guardian Dashboard
  - Resonance Engine Version
  - Last update timestamp

- **Automatic Updates**:
  - Health checks every 30 seconds
  - Metrics refresh every 10 seconds
  - Countdown timer to Genesis Launch

## 🎨 Features

### Ecosystem Section
- **6 Service Cards**: Each service with description, tech stack, and links
- **Status Indicators**: Animated pulse dots (green for production, orange for development)
- **Quick Stats Bar**: Total services, repositories, blockchains, and possibilities
- **Glass-morphism Design**: Modern UI with backdrop blur effects
- **Responsive Layout**: Optimized for mobile, tablet, and desktop

### Interactive Elements
- **Smooth Scroll Navigation**: Anchor links with smooth scrolling
- **Quantum Particle Background**: Animated floating particles
- **Countdown Timer**: Real-time countdown to Genesis launch
- **Hover Effects**: Cards lift and glow on hover
- **Status Animations**: Pulsing status indicators

## ⚙️ 0G DEX Router Configuration

### Critical Launch Blocker Resolution

The OINIO flash-launch system requires configuration of the `ZERO_G_UNIVERSAL_ROUTER` address for 0G Aristotle Mainnet.

### Configuration Files

1. **`.env.launch`** - Main configuration file containing:
   - 0G Aristotle Mainnet network parameters (Chain ID: 16661)
   - DEX router address (to be updated)
   - Launch system configuration
   - Safety checks and verification flags

2. **`DEPLOYMENT_GUIDE.md`** - Comprehensive guide for:
   - Finding canonical DEX router on 0G network
   - Deploying Uniswap V2 fork if needed
   - Testing and verification procedures
   - Troubleshooting common issues

### Quick Start

**Option A: Using Canonical Router (Preferred)**
```bash
# 1. Find router address via 0G Discord/Docs/Explorer
# 2. Update .env.launch:
ZERO_G_UNIVERSAL_ROUTER=0x[CANONICAL_ADDRESS]
ROUTER_ADDRESS_VERIFIED=true
```

**Option B: Deploy Own Router (Fallback)**
```bash
# 1. Follow DEPLOYMENT_GUIDE.md
# 2. Deploy Uniswap V2 Factory + Router to 0G Aristotle
# 3. Update .env.launch with deployed address
# 4. Test swap functionality
# 5. Mark verification flags as true
```

### Network Details
- **Network**: 0G Aristotle Mainnet
- **Chain ID**: 16661 (0x4115 hex)
- **RPC**: https://evmrpc.0g.ai
- **Explorer**: https://chainscan.0g.ai
- **Currency**: 0G (18 decimals)

### Resources
- **0G Discord**: https://discord.gg/0gnetwork
- **0G Docs**: https://docs.0g.ai
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`

## 🚀 Local Development

### Running Locally

1. Clone the repository:
```bash
git clone https://github.com/onenoly1010/quantum-pi-forge-site.git
cd quantum-pi-forge-site
```

2. Serve the site locally (any method works):

**Option 1: Using Python**
```bash
python -m http.server 8000
```

**Option 2: Using Node.js**
```bash
npx http-server -p 8000
```

**Option 3: Using VS Code Live Server**
- Install the "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

3. Open your browser:
- Main site: `http://localhost:8000/index.html`
- Dashboard: `http://localhost:8000/dashboard.html`

### Testing the API Gateway

To test API connectivity:

```javascript
// Open browser console on the dashboard page
// Check health
const health = await checkEcosystemHealth();
console.log(health);

// Get metrics
const metrics = await getEcosystemMetrics();
console.log(metrics);
```

### Debugging

- Open browser DevTools (F12) to view console logs
- Network tab shows all API requests and responses
- Console displays health check and metrics update logs
- Look for error messages if services are unavailable

## 📱 Mobile Responsiveness

The site is fully responsive with breakpoints at:
- **Desktop**: > 1024px (full grid layout)
- **Tablet**: 768px - 1024px (2-column grid)
- **Mobile**: < 768px (single column layout)

Mobile optimizations:
- Simplified navigation
- Stacked ecosystem cards
- Reduced spacing and font sizes
- Touch-friendly button sizes

## 🔒 Security

- All external links use `target="_blank"` with `rel="noopener noreferrer"`
- API requests include custom headers: `X-Quantum-Forge-Client: web-v1`
- CORS-friendly requests to all ecosystem services
- No sensitive data stored or transmitted
- Graceful error handling prevents information leakage

## 🌟 Design System

### Colors
- **Primary Cyan**: `#00d9ff` - Main accent color
- **Purple**: `#a855f7` - Secondary accent
- **Teal**: `#14b8a6` - Tertiary accent
- **Dark Background**: `#0a0a0a` - Main background
- **Silver Text**: `#c0c0c0` - Body text

### Typography
- **Headings**: Inter (800/900 weight)
- **Body**: Inter (400/600 weight)
- **Code**: Courier Prime (monospace)

### Effects
- **Glass-morphism**: `backdrop-filter: blur(20px)`
- **Quantum Glow**: Cyan and purple shadows
- **Smooth Transitions**: `cubic-bezier(0.4, 0, 0.2, 1)`

## 📝 Deployment

The site is deployed via **GitHub Pages**:

- **Auto-deploy**: Pushes to `main` branch auto-deploy
- **Custom Domain**: Can be configured in repository settings
- **HTTPS**: Automatically enabled
- **CDN**: Global edge network for fast loading

## 🤝 Contributing

Contributions are welcome! To contribute:

### For Coding Agents 🤖

**REQUIRED**: Before starting any work, complete the [onboarding process](.github/agents/ONBOARDING.md):

1. **Read**: [ONBOARDING.md](.github/agents/ONBOARDING.md) - Ecosystem overview and philosophy (15-20 min)
2. **Review**: [AGENT_INSTRUCTIONS.md](.github/agents/AGENT_INSTRUCTIONS.md) - Task execution guidelines (5-10 min)
3. **Study**: This README - Technical architecture and API docs (10-15 min)

The onboarding ensures you understand the Quantum Pi Forge ecosystem, OINIO philosophy, and development workflows.

### For All Contributors

1. **Complete onboarding** (if you're a coding agent)
2. Fork the repository
3. Create a feature branch: `git checkout -b feature/your-feature`
4. Make your changes
5. Test locally (see [Local Development](#-local-development))
6. Commit: `git commit -m "Add your feature"`
7. Push: `git push origin feature/your-feature`
8. Open a Pull Request

### Contribution Guidelines

- **Minimal Changes**: Make the smallest changes necessary to achieve your goal
- **Test Thoroughly**: Run the site locally and test in multiple browsers
- **Follow Patterns**: Use existing code styles and design patterns
- **Document**: Update docs if your changes affect usage or architecture
- **No Breaking Changes**: Don't break integrations with live production services

## 📄 License

© 2025 OINIO | Quantum Pi Forge Genesis

## 🔗 Links

- **Main Site**: https://onenoly1010.github.io/quantum-pi-forge-site/
- **Dashboard**: https://onenoly1010.github.io/quantum-pi-forge-site/dashboard.html
- **GitHub**: https://github.com/onenoly1010/quantum-pi-forge-site
- **Genesis Backend**: https://pi-forge-quantum-genesis.railway.app
- **Resonance Engine**: https://quantum-resonance-clean.vercel.app
- **DEX**: https://quantum-pi-forge-fixed.vercel.app

---

## 🚀 Deployment

### Vercel Deployment

This site is deployed on Vercel with custom domain configuration.

**Live URL:** https://quantumpiforge.com

#### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/onenoly1010/quantum-pi-forge-site)

#### Manual Deployment

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to production:
   ```bash
   vercel --prod
   ```

#### Custom Domain Setup

1. Go to Vercel Dashboard → Project Settings → Domains
2. Add domain: `quantumpiforge.com`
3. Add domain: `www.quantumpiforge.com`
4. Configure DNS records at your registrar:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

5. Wait for DNS propagation (5-48 hours, typically faster)

#### Environment Variables

No environment variables required for static deployment.

If using API routes, configure in Vercel Dashboard:
- `NEXT_PUBLIC_BACKEND_URL`: Backend API URL
- `NEXT_PUBLIC_RAILWAY_URL`: Railway backend endpoint

---

**Powered by OINIO | Where Consciousness Meets Code**
